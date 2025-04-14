const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Salta la canción actual"),
    
  async execute(interaction) {
    const queue = interaction.client.player.getQueue(interaction.guildId);
    
    if (!queue || !queue.playing) {
      return interaction.reply({
        content: "❌ No hay música reproduciéndose actualmente.",
        ephemeral: true,
      });
    }
    
    const currentSong = queue.current;
    queue.skip();
    
    return interaction.reply({
      content: `⏭️ Canción **${currentSong.title}** saltada.`,
    });
  },
};
