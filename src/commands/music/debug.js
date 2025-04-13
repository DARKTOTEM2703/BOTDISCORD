const {
  testYouTubeConnectivity,
  getYoutubeInfo,
} = require("../../utils/youtube");
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "debug",
  description: "Diagnóstico de problemas de música/YouTube",
  async execute(message, args) {
    const embed = new MessageEmbed()
      .setTitle("🔍 Diagnóstico del Sistema de Música")
      .setColor("ORANGE")
      .setDescription("Ejecutando pruebas de diagnóstico...");

    const statusMsg = await message.channel.send(embed);

    // Comprobar conectividad básica con YouTube
    embed.addField("Conectividad YouTube", "Comprobando...");
    statusMsg.edit(embed);

    const connectivityResult = await testYouTubeConnectivity();
    embed.fields[0] = {
      name: "Conectividad YouTube",
      value: connectivityResult.success
        ? `✅ Conectado (status: ${connectivityResult.status})`
        : `❌ Error: ${connectivityResult.error}`,
    };

    statusMsg.edit(embed);

    // Probar obtención de información de un video conocido
    embed.addField("Prueba de obtención de info", "Comprobando...");
    statusMsg.edit(embed);

    try {
      // Video de ejemplo (oficial de YouTube, debería ser estable)
      const testVideo = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
      const videoInfo = await getYoutubeInfo(testVideo);

      if (videoInfo) {
        embed.fields[1] = {
          name: "Prueba de obtención de info",
          value: `✅ Éxito\nTítulo: ${videoInfo.title}\nDuración: ${videoInfo.duration}s`,
        };
      } else {
        embed.fields[1] = {
          name: "Prueba de obtención de info",
          value: "❌ No se pudo obtener la información del video",
        };
      }
    } catch (error) {
      embed.fields[1] = {
        name: "Prueba de obtención de info",
        value: `❌ Error: ${error.message}`,
      };
    }

    statusMsg.edit(embed);

    // Información de versiones
    embed.addField(
      "Información de versiones",
      `Node.js: ${process.version}\n` +
        `ytdl-core: ${require("ytdl-core/package.json").version}\n` +
        `discord.js: ${require("discord.js/package.json").version}`
    );

    // Finalizar pruebas
    embed
      .setDescription("Diagnóstico completado")
      .setFooter("Para reproducir música, usa el comando #play")
      .setTimestamp();

    statusMsg.edit(embed);
  },
};
