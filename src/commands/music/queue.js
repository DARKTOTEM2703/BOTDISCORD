const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Muestra la cola de reproducción actual"),
    
  async execute(interaction) {
    const queue = interaction.client.player.getQueue(interaction.guildId);
    
    if (!queue || !queue.playing) {
      return interaction.reply({
        content: "❌ No hay música reproduciéndose actualmente.",
        ephemeral: true,
      });
    }
    
    const currentTrack = queue.current;
    const tracks = queue.tracks.slice(0, 10).map((track, i) => {
      return `${i + 1}. **[${track.title}](${track.url})** - ${track.duration}`;
    });
    
    const embed = new EmbedBuilder()
      .setTitle("Cola de reproducción")
      .setDescription(
        `**Reproduciendo ahora:**\n` +
        `🎵 **[${currentTrack.title}](${currentTrack.url})** - ${currentTrack.duration}\n\n` +
        `**Próximas canciones:**\n${tracks.join("\n")}` +
        (queue.tracks.length > 10 ? `\n...y ${queue.tracks.length - 10} más` : "")
      )
      .setColor("#0099ff")
      .setThumbnail(currentTrack.thumbnail);
    
    return interaction.reply({ embeds: [embed] });
  },
};
