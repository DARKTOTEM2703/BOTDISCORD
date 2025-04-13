const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  NoSubscriberBehavior,
  getVoiceConnection,
  entersState,
} = require("@discordjs/voice");
const play = require("play-dl");
const { EmbedBuilder } = require("discord.js");
const { PermissionsBitField } = require("discord.js");

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

    // Verificar permisos del bot en el canal de voz
    const permissions = voiceChannel.permissionsFor(interaction.client.user);
    if (!permissions.has("ConnectVoice") || !permissions.has("Speak")) {
      return interaction.reply({
        content:
          "❌ ¡Necesito permisos para unirme y hablar en el canal de voz!",
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
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Establecer una nueva conexión al canal de voz
      console.log(`[PLAY] Conectando al canal de voz ${voiceChannel.name}`);
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
        selfDeaf: false, // Cambiar a false para que el bot no esté ensordecido
      });

      // Evento de depuración para la conexión
      connection.on("debug", (message) => {
        console.log(`[VOICE DEBUG] ${message}`);
      });

      connection.on(VoiceConnectionStatus.Ready, () => {
        console.log("[PLAY] La conexión está lista");
        playSong();
      });

      connection.on(VoiceConnectionStatus.Disconnected, async () => {
        console.log("[PLAY] Conexión desconectada");
        try {
          await Promise.race([
            entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
            entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
          ]);
          // Si llegamos aquí, se reconectó
        } catch (error) {
          // Si no se pudo reconectar, destruir
          connection.destroy();
        }
      });

      // Función para reproducir la canción
      async function playSong() {
        try {
          console.log("[PLAY] Obteniendo stream de audio...");

          // Obtener el stream con opciones optimizadas
          const stream = await play.stream(videoDetails.url, {
            discordPlayerCompatibility: true,
            quality: 1,
          });

          console.log(`[PLAY] Stream obtenido: ${stream.type}`);

          // Crear el recurso de audio
          const resource = createAudioResource(stream.stream, {
            inputType: stream.type, // Asegurar que el tipo de entrada sea compatible
            inlineVolume: true, // Permitir control de volumen
          });

          // Configurar volumen inicial
          resource.volume.setVolume(1.0); // Asegurarse de que el volumen esté al 100%
          console.log("[PLAY] Recurso de audio creado y volumen configurado.");

          // Crear y configurar el reproductor
          const player = createAudioPlayer({
            behaviors: {
              noSubscriber: NoSubscriberBehavior.Play, // Continuar reproduciendo incluso sin suscriptores
            },
          });

          // Suscribir la conexión al reproductor
          const subscription = connection.subscribe(player);
          if (!subscription) {
            console.error(
              "[PLAY] Error: No se pudo suscribir el reproductor a la conexión."
            );
            return interaction.followUp(
              "❌ No se pudo reproducir el audio en el canal de voz."
            );
          }

          // Reproducir el audio
          player.play(resource);
          console.log("[PLAY] Reproducción iniciada.");

          // Verificar si el reproductor está enviando paquetes de audio
          player.on(AudioPlayerStatus.Playing, () => {
            console.log("[PLAY] Reproduciendo audio en el canal de voz.");
          });

          player.on(AudioPlayerStatus.Buffering, () => {
            console.log("[PLAY] El reproductor está en estado de buffering.");
          });

          player.on(AudioPlayerStatus.Idle, () => {
            console.log("[PLAY] Reproducción terminada.");
            setTimeout(() => connection.destroy(), 5000); // Desconectar después de 5 segundos
          });

          // Manejar errores del reproductor
          player.on("error", (error) => {
            console.error("[PLAY] Error en el reproductor:", error);
            interaction.followUp(
              "❌ Error durante la reproducción. Intenta con otra canción."
            );
          });

          // Crear embed para mostrar información
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
              {
                name: "👤 Canal",
                value: videoDetails.channel.name,
                inline: true,
              }
            )
            .setFooter({ text: `Solicitado por ${interaction.user.tag}` });

          // Responder al usuario
          await interaction.editReply({
            content: "🔊 Reproduciendo audio en tu canal de voz",
            embeds: [embed],
          });
        } catch (error) {
          console.error("[PLAY] Error al reproducir:", error);
          await interaction.editReply(
            "❌ Error al reproducir la canción: " + error.message
          );
          connection.destroy();
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
