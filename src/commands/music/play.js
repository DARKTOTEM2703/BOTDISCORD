const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { QueryType } = require("discord-player");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Reproduce música de YouTube")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("URL o nombre de la canción")
        .setRequired(true)
    ),

  async execute(interaction) {
    // Verificar si el usuario está en un canal de voz
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply({
        content: "❌ ¡Necesitas unirte a un canal de voz primero!",
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    try {
      const query = interaction.options.getString("query");
      console.log("[PLAY] Intentando reproducir:", query);

      // Obtener o crear la cola
      const queue = interaction.client.player.nodes.create(interaction.guild, {
        metadata: {
          channel: interaction.channel, // Captura dinámicamente el canal donde se ejecutó el comando
          interaction: interaction,
        },
        leaveOnEmpty: true,
        leaveOnEnd: true, // Cambiar a true para que el bot salga al terminar la cola
        leaveOnStop: true,
        volume: 80,
      });

      // Verificar la conexión al canal de voz
      if (!queue.connection) {
        await queue.connect(voiceChannel);
      }

      // Buscar la canción
      const searchResult = await interaction.client.player.search(query, {
        requestedBy: interaction.user,
        searchEngine: QueryType.AUTO,
      });

      if (!searchResult || !searchResult.tracks.length) {
        return interaction.followUp({
          content: `❌ No se encontraron resultados para: ${query}`,
          ephemeral: true,
        });
      }

      // Añadir las canciones a la cola
      if (searchResult.playlist) {
        queue.addTrack(searchResult.tracks);
        await interaction.followUp({
          content: `✅ Se añadieron **${searchResult.tracks.length} canciones** de la lista de reproducción a la cola.`,
        });
      } else {
        queue.addTrack(searchResult.tracks[0]);
        const embed = new EmbedBuilder()
          .setTitle("Canción añadida a la cola")
          .setDescription(
            `**[${searchResult.tracks[0].title}](${searchResult.tracks[0].url})** - ${searchResult.tracks[0].duration}`
          )
          .setThumbnail(searchResult.tracks[0].thumbnail)
          .setFooter({ text: `Solicitada por ${interaction.user.tag}` })
          .setColor("#0099ff");

        await interaction.followUp({ embeds: [embed] });
      }

      // Iniciar reproducción si no está reproduciendo
      if (!queue.isPlaying()) await queue.node.play();
    } catch (error) {
      console.error("Error en comando play:", error);
      return interaction.followUp({
        content: `❌ Error: ${
          error.message || "Se produjo un error desconocido"
        }`,
        ephemeral: true,
      });
    }
  },
};
