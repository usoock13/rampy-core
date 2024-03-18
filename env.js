import env from "dotenv";

env.config();

module.exports.token = process.env.TOKEN;
module.exports.clientId = process.env.CLIENT;