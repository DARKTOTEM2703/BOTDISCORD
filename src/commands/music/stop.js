const { SlashCommandBuilder } = require("@discordjs/builders");
const { getVoiceConnection } = require("@discordjs/voice");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Detiene la reproducción de música y desconecta el bot"),

  async execute(interaction) {
    try {
      console.log(`[STOP] Comando iniciado por ${interaction.user.tag}`);

      // Verificar si el bot está en un canal de voz en el servidor
      const connection = getVoiceConnection(interaction.guild.id);
      if (!connection) {
        return interaction.reply(
          "❌ No estoy reproduciendo música en ningún canal."
        );
      }

      // Verificar si el usuario está en el mismo canal de voz
      if (!interaction.member.voice.channel) {
        return interaction.reply(
          "❌ Debes estar en un canal de voz para detener la música."
        );
      }

      console.log("[STOP] Deteniendo reproducción y desconectando");
      // Destruir la conexión
      connection.destroy();

      return interaction.reply(
        "⏹️ Reproducción detenida. ¡Hasta la próxima! 👋"
      );
    } catch (error) {
      console.error("[STOP] Error:", error);
      return interaction.reply(
        "❌ Ocurrió un error al intentar detener la reproducción."
      );
    }
  },
};
