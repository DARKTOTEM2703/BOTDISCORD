const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Salta a la siguiente canción en la cola"),

  async execute(interaction) {
    const queue = interaction.client.player.nodes.get(interaction.guildId); // Cambiado a nodes.get

    if (!queue || !queue.isPlaying()) {
      return interaction.reply({
        content: "❌ No hay música reproduciéndose actualmente.",
        ephemeral: true,
      });
    }

    queue.node.skip(); // Salta a la siguiente canción

    return interaction.reply({
      content: "⏭️ Canción saltada.",
    });
  },
};
