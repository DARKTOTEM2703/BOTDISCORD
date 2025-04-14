const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { QueryType } = require("discord-player");
const { URL } = require("url");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Reproduce música de YouTube o Spotify")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("URL o término de búsqueda")
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
      let query = interaction.options.getString("query");
      console.log("[PLAY] Intentando reproducir:", query);

      // Validar y limpiar la URL si es de YouTube
      if (
        query.startsWith("https://www.youtube.com") ||
        query.startsWith("https://youtu.be")
      ) {
        try {
          const url = new URL(query);
          query = url.origin + url.pathname; // Eliminar parámetros adicionales
          console.log("[PLAY] URL limpia:", query);
        } catch (error) {
          console.error("[PLAY] URL inválida:", query);
          return interaction.followUp({
            content: "❌ La URL proporcionada no es válida.",
            ephemeral: true,
          });
        }
      }

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

      // Buscar la canción o manejar la URL directamente
      console.log("[PLAY] Realizando búsqueda con query:", query);
      const searchResult = await interaction.client.player.search(query, {
        requestedBy: interaction.user,
        searchEngine: QueryType.URL, // Forzar el uso de URL
      });

      console.log("[PLAY] Resultados de búsqueda:", searchResult);

      if (!searchResult || !searchResult.tracks.length) {
        console.error(
          "[PLAY] No se encontraron resultados para la query:",
          query
        );
        return interaction.followUp({
          content: `❌ No se encontraron resultados para: ${query}`,
          ephemeral: true,
        });
      }

      // Añadir las canciones a la cola
      if (searchResult.playlist) {
        console.log(
          "[PLAY] Añadiendo lista de reproducción a la cola:",
          searchResult.playlist.title
        );
        queue.addTrack(searchResult.tracks);
        await interaction.followUp({
          content: `✅ Se añadieron **${searchResult.tracks.length} canciones** de la lista de reproducción a la cola.`,
        });
      } else {
        console.log(
          "[PLAY] Añadiendo canción a la cola:",
          searchResult.tracks[0].title
        );
        queue.addTrack(searchResult.tracks[0]);
        const embed = new EmbedBuilder()
          .setTitle("Canción añadida a la cola")
          .setDescription(
            `**[${searchResult.tracks[0].title}](${searchResult.tracks[0].url})** - ${searchResult.tracks[0].duration}`
          )
          .setThumbnail(searchResult.tracks[0].thumbnail)
          .setFooter({ text: `Solicitada por ${interaction.user.tag}` })
          .setColor("#0099ff");

        // Crear los botones
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("skip")
            .setLabel("⏭️ Siguiente")
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId("stop")
            .setLabel("⏹️ Detener")
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId("queue")
            .setLabel("📜 Lista de espera")
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId("resume")
            .setLabel("▶️ Reanudar")
            .setStyle(ButtonStyle.Success) // Botón para reanudar
        );

        await interaction.followUp({ embeds: [embed], components: [row] });
      }

      // Iniciar reproducción si no está reproduciendo
      if (!queue.isPlaying()) {
        console.log("[PLAY] Iniciando reproducción...");
        await queue.node.play();
      }
    } catch (error) {
      console.error("[PLAY] Error en comando play:", error);
      return interaction.followUp({
        content: `❌ Error: ${
          error.message || "Se produjo un error desconocido"
        }`,
        ephemeral: true,
      });
    }
  },
};
