const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Detiene la reproducción y abandona el canal de voz"),

  async execute(interaction) {
    const queue = interaction.client.player.getQueue(interaction.guildId);

    if (!queue || !queue.playing) {
      return interaction.reply({
        content: "❌ No hay música reproduciéndose actualmente.",
        ephemeral: true,
      });
    }

    queue.setPaused(true); // Pausar la reproducción actual

    // Configurar temporizador para desconectar después de 30 segundos
    setTimeout(() => {
      if (!queue.playing && queue.connection) {
        queue.destroy(); // Desconectar si no hay actividad
      }
    }, 30000); // 30 segundos

    return interaction.reply({
      content:
        "⏸️ Reproducción pausada. El bot se desconectará en 30 segundos si no hay actividad.",
    });
  },
};
