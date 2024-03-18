const path = require('path');
const env = require('./env.js');
const fs = require('fs');

const { REST, Routes, Client, Collection, Events, GatewayIntentBits } = require("discord.js");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const commands = [];

const commandsRoot = path.join(__dirname, 'commands');
const commandsDirectorys = fs.readdirSync( commandsRoot );

for(const dir of commandsDirectorys) {
    const commandsPath = path.join(commandsRoot, dir);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

    for(const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if("data" in command && "execute" in command) {
            client.commands.set(command.data.name, command);
            commands.push( command.data.toJSON() );
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

const rest = new REST().setToken(env.token);

(async() => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);
        const data = await rest.put(
            Routes.applicationCommands(env.clientId),
            { body: commands }
            )
        console.log(data);
        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch(error) {
        console.error(error);
    }
})();

client.on(Events.InteractionCreate, async interaction => {
    if(!interaction.isChatInputCommand())
    return;

    const command = interaction.client.commands.get(interaction.commandName);
    if(command) {
        try {
            await command.execute(interaction);
        } catch(error) {
            console.error(error);
            if(interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command.', ephemeral: true });
            } else {
                await interaction.reply({ content: "There was an error while executing this command.", ephemeral: true });
            }
        }
    }
});

client.once(Events.ClientReady, readyClient => {
    console.log(`Rampy is ready! ${readyClient.user.tag}`)
})

client.login(env.token);