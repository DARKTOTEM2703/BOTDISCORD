const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} = require("@discordjs/voice");
const discordTTS = require("discord-tts");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("speak")
    .setDescription("Make the bot speak a message")
    .addStringOption((option) =>
      option
        .setName("text")
        .setDescription("The text for the bot to speak")
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

    // Obtener el texto a hablar
    const text = interaction.options.getString("text");

    // Validar el texto
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return interaction.reply({
        content: "❌ El texto proporcionado no es válido.",
        ephemeral: true,
      });
    }

    // Validar el idioma
    const lang = "es"; // Cambiar a "es" para compatibilidad
    if (typeof lang !== "string" || lang.trim().length === 0) {
      return interaction.reply({
        content: "❌ El idioma configurado no es válido.",
        ephemeral: true,
      });
    }

    try {
      // Conectar al canal de voz
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });

      // Crear el recurso de audio con TTS en español
      const audioResource = createAudioResource(
        discordTTS.getVoiceStream(text, { lang }) // Usar "es" como idioma
      );

      // Crear y configurar el reproductor de audio
      const player = createAudioPlayer();
      connection.subscribe(player);

      // Reproducir el audio
      player.play(audioResource);

      // Informar al usuario que se está reproduciendo el mensaje
      await interaction.reply(`🔊 Reproduciendo mensaje: "${text}"`);

      // Manejar el fin de la reproducción
      player.on(AudioPlayerStatus.Idle, () => {
        // Desconectar después de reproducir
        setTimeout(() => {
          connection.destroy();
        }, 300000); // Esperar 5 minutos (300,000 ms) antes de desconectar
      });

      // Manejar errores
      player.on("error", (error) => {
        console.error("Error en la reproducción de TTS:", error);
        interaction.followUp("❌ Hubo un error al reproducir el mensaje.");
        connection.destroy();
      });
    } catch (error) {
      console.error("Error en el comando speak:", error);
      return interaction.reply({
        content: "❌ Ocurrió un error al intentar hablar.",
        ephemeral: true,
      });
    }
  },
};
