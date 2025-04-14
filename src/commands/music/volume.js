const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Ajusta el volumen de reproducción")
    .addIntegerOption((option) =>
      option
        .setName("nivel")
        .setDescription("Nivel de volumen (1-100)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    ),

  async execute(interaction) {
    const queue = interaction.client.player.getQueue(interaction.guildId);

    if (!queue || !queue.playing) {
      return interaction.reply({
        content: "❌ No hay música reproduciéndose actualmente.",
        ephemeral: true,
      });
    }

    const volumen = interaction.options.getInteger("nivel");
    queue.setVolume(volumen);

    return interaction.reply({
      content: `🔊 Volumen ajustado al ${volumen}%.`,
    });
  },
};
