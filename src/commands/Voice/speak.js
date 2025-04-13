const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  NoSubscriberBehavior,
  StreamType,
} = require("@discordjs/voice");
const discordTTS = require("discord-tts");

module.exports = {
  data: {
    name: "speak",
    description: "Reproduce texto como audio en un canal de voz",
    options: [
      {
        type: 3, // STRING
        name: "text",
        description: "El texto que deseas reproducir",
        required: true,
      },
    ],
  },
  async execute(interaction) {
    // Verifica si el objeto interaction.options está definido
    if (!interaction.options) {
      return interaction.reply({
        content: "Hubo un problema al procesar tu comando. Inténtalo de nuevo.",
        ephemeral: true,
      });
    }

    // Verifica si el usuario está en un canal de voz
    const voiceChannel = interaction.member?.voice?.channel;
    if (!voiceChannel) {
      return interaction.reply({
        content: "¡Debes estar en un canal de voz para usar este comando!",
        ephemeral: true,
      });
    }

    // Obtén el texto del comando de barra
    const text = interaction.options.getString("text");
    if (!text) {
      return interaction.reply({
        content: "Por favor, proporciona un texto para reproducir.",
        ephemeral: true,
      });
    }

    try {
      // Verifica la longitud del texto (Google TTS tiene límite de 200 caracteres)
      if (text.length > 200) {
        return interaction.reply({
          content:
            "El texto debe tener menos de 200 caracteres debido a limitaciones del servicio.",
          ephemeral: true,
        });
      }

      // Responder inmediatamente para evitar timeout de la interacción
      await interaction.deferReply();

      try {
        // Usar discord-tts para generar el audio
        const tts = discordTTS.getVoiceStream(text, {
          lang: "es",
          slow: false,
        });

        // Conéctate al canal de voz donde está el usuario
        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: interaction.guild.id,
          adapterCreator: interaction.guild.voiceAdapterCreator,
          selfDeaf: false, // Para que el bot pueda escuchar
          selfMute: false, // Para que el bot pueda hablar
        });

        // Crea un reproductor de audio con configuración mejorada
        const player = createAudioPlayer({
          behaviors: {
            noSubscriber: NoSubscriberBehavior.Pause,
          },
        });

        // Crear un recurso de audio a partir del stream
        const resource = createAudioResource(tts, {
          inlineVolume: true,
          inputType: StreamType.Arbitrary, // Usar StreamType en lugar de valor numérico
        });

        // Ajustar volumen si es necesario
        if (resource.volume) {
          resource.volume.setVolume(1.0); // Volumen al 100%
        }

        // Manejo de errores en el reproductor
        player.on("error", (error) => {
          console.error("Error en el reproductor de audio:", error);
          interaction.followUp("Hubo un error al reproducir el audio.");
          connection.destroy();
        });

        // Manejo de errores en la conexión
        connection.on("error", (error) => {
          console.error("Error en la conexión al canal de voz:", error);
          interaction.followUp("Hubo un error al conectarse al canal de voz.");
          connection.destroy();
        });

        // Primero suscribir el reproductor a la conexión, luego reproducir
        connection.subscribe(player);
        player.play(resource);

        // Desconéctate después de que termine la reproducción
        player.on(AudioPlayerStatus.Idle, () => {
          setTimeout(() => {
            connection.destroy();
          }, 300000); // 5 minutos de espera antes de desconectarse
        });

        interaction.editReply(`Reproduciendo: "${text}" en el canal de voz.`);
      } catch (voiceError) {
        console.error("Error específico de voz:", voiceError);
        return interaction.editReply(
          "Error: Falta una biblioteca de codificación Opus. Por favor, instala '@discordjs/opus' o 'opusscript' con npm."
        );
      }
    } catch (error) {
      console.error("Error general:", error);

      // Verificar si ya se respondió a la interacción
      if (interaction.deferred || interaction.replied) {
        interaction.editReply("Hubo un error al intentar reproducir el texto.");
      } else {
        interaction.reply("Hubo un error al intentar reproducir el texto.");
      }
    }
  },
};
