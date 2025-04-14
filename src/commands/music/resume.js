const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Reanuda la reproducción de música pausada"),

  async execute(interaction) {
    const queue = interaction.client.player.getQueue(interaction.guildId);

    if (!queue || !queue.connection) {
      return interaction.reply({
        content: "❌ No hay música pausada para reanudar.",
        ephemeral: true,
      });
    }

    if (!queue.paused) {
      return interaction.reply({
        content: "▶️ La música ya se está reproduciendo.",
        ephemeral: true,
      });
    }

    queue.setPaused(false); // Reanudar la reproducción

    return interaction.reply({
      content: "▶️ Reproducción reanudada.",
    });
  },
};
