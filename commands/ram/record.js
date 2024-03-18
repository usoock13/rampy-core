const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
            .setName("record")
            .setDescription("Join the voice channel that author in to record their talks."),
    async execute(interaction) {
        
        await interaction.reply("Start Record!");
    }
}