const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  NoSubscriberBehavior,
  getVoiceConnection,
} = require("@discordjs/voice");
const play = require("play-dl");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Reproduce música de YouTube")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("URL de YouTube o nombre de la canción")
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
    console.log(`[PLAY] Comando iniciado por ${interaction.user.tag}`);

    try {
      // Obtener la consulta del usuario
      const query = interaction.options.getString("query");
      console.log(`[PLAY] Buscando: "${query}"`);

      // Verificar si es una URL válida o una búsqueda
      let songInfo;
      if (
        play.yt_validate(query) === "video" ||
        play.yt_validate(query) === "playlist"
      ) {
        console.log("[PLAY] URL de YouTube detectada");
        try {
          songInfo = await play.video_info(query);
          console.log(
            `[PLAY] Video encontrado: ${songInfo.video_details.title}`
          );
        } catch (err) {
          console.error("[PLAY] Error al obtener información del video:", err);
          return interaction.editReply(
            "❌ No pude obtener información de este video. Intenta con otro enlace o canción."
          );
        }
      } else {
        console.log("[PLAY] Realizando búsqueda en YouTube");
        try {
          const searchResults = await play.search(query, { limit: 1 });
          if (!searchResults || searchResults.length === 0) {
            return interaction.editReply(
              "❌ No encontré ninguna canción con ese nombre."
            );
          }
          songInfo = await play.video_info(searchResults[0].url);
          console.log(
            `[PLAY] Canción encontrada: ${songInfo.video_details.title}`
          );
        } catch (err) {
          console.error("[PLAY] Error en la búsqueda:", err);
          return interaction.editReply(
            "❌ Error al buscar la canción. Por favor intenta de nuevo."
          );
        }
      }

      const videoDetails = songInfo.video_details;

      // Verificar si hay una conexión existente
      const existingConnection = getVoiceConnection(interaction.guildId);
      if (existingConnection) {
        console.log("[PLAY] Destruyendo conexión existente");
        existingConnection.destroy();
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Esperar para estabilizar
      }

      // Establecer una nueva conexión al canal de voz
      console.log(`[PLAY] Conectando al canal de voz ${voiceChannel.name}`);
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
        selfDeaf: false, // Para que el bot pueda escuchar
        selfMute: false, // Para que el bot pueda hablar
      });

      // Crear un nuevo reproductor de audio
      const player = createAudioPlayer({
        behaviors: {
          noSubscriber: NoSubscriberBehavior.Play,
        },
      });

      // Suscribir la conexión al reproductor
      console.log("[PLAY] Suscribiendo la conexión al reproductor");
      connection.subscribe(player);

      // Manejar estados de la conexión
      connection.on(VoiceConnectionStatus.Ready, () => {
        console.log("[PLAY] La conexión está lista");
      });

      connection.on(VoiceConnectionStatus.Disconnected, () => {
        console.log("[PLAY] Conexión desconectada");
        try {
          connection.destroy();
        } catch (e) {
          console.error("[PLAY] Error al destruir la conexión:", e);
        }
      });

      // Reproducir el audio
      try {
        console.log("[PLAY] Obteniendo stream de audio...");
        const stream = await play.stream(videoDetails.url, {
          discordPlayerCompatibility: true,
          quality: 0, // La mejor calidad
        });

        console.log("[PLAY] Stream obtenido, creando recurso de audio");
        const resource = createAudioResource(stream.stream, {
          inputType: stream.type,
          inlineVolume: true,
        });

        // Ajustar volumen
        if (resource.volume) {
          resource.volume.setVolume(0.5); // 50% de volumen
        }

        console.log("[PLAY] Iniciando reproducción");
        player.play(resource);

        // Manejar estados del reproductor
        player.on(AudioPlayerStatus.Playing, () => {
          console.log("[PLAY] Estado: Reproduciendo");
        });

        player.on(AudioPlayerStatus.Idle, () => {
          console.log("[PLAY] Estado: Idle - Reproducción terminada");
          setTimeout(() => {
            try {
              connection.destroy();
              console.log(
                "[PLAY] Conexión cerrada después de terminar la reproducción"
              );
            } catch (err) {
              console.error("[PLAY] Error al cerrar la conexión:", err);
            }
          }, 5000);
        });

        player.on("error", (error) => {
          console.error("[PLAY] Error en el reproductor:", error);
          interaction.followUp(
            "❌ Error durante la reproducción. Intentaré desconectar"
          );
          try {
            connection.destroy();
          } catch (err) {
            console.error("[PLAY] Error al destruir la conexión:", err);
          }
        });

        // Crear un embed bonito para mostrar info de la canción
        const embed = new EmbedBuilder()
          .setColor("#0099ff")
          .setTitle("🎵 Reproduciendo ahora")
          .setDescription(`**${videoDetails.title}**`)
          .setThumbnail(videoDetails.thumbnails[0].url)
          .addFields(
            {
              name: "⏱️ Duración",
              value: formatDuration(videoDetails.durationInSec),
              inline: true,
            },
            { name: "👤 Canal", value: videoDetails.channel.name, inline: true }
          )
          .setFooter({ text: `Solicitado por ${interaction.user.tag}` });

        console.log("[PLAY] Respondiendo al usuario");
        await interaction.editReply({ embeds: [embed] });
      } catch (streamErr) {
        console.error("[PLAY] Error al obtener el stream:", streamErr);
        await interaction.editReply(
          "❌ No pude reproducir esta canción. Puede que no esté disponible o tenga restricciones."
        );
        try {
          connection.destroy();
        } catch (err) {
          console.error("[PLAY] Error al destruir la conexión:", err);
        }
      }
    } catch (error) {
      console.error("[PLAY] Error general:", error);
      await interaction.editReply(
        "❌ Ocurrió un error inesperado: " + error.message
      );
    }
  },
};

// Función para formatear la duración
function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}
