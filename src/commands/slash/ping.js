// Ejemplo de comando de archivo en ./src/commands/ping.js

const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Responde con pong"),
  async execute(interaction) {
    await interaction.reply("Pong!");
  },
};
