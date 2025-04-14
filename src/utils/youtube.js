/**
 * Funciones de utilidad para interactuar con YouTube a través de DisTube
 * Nota: La mayoría de las funcionalidades están ahora integradas en DisTube
 */

/**
 * Valida una URL de YouTube (compatible con DisTube)
 * @param {string} url - La URL a validar
 * @returns {boolean} - Verdadero si es una URL válida de video o playlist
 */
function validateYouTubeUrl(url) {
  // Expresiones regulares simples para verificar URLs de YouTube
  const videoRegex =
    /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/;
  const playlistRegex =
    /^(https?:\/\/)?(www\.)?youtube\.com\/playlist\?list=[\w-]+/;

  return videoRegex.test(url) || playlistRegex.test(url);
}

/**
 * Formatea la duración en segundos a formato mm:ss
 * @param {number} seconds - Duración en segundos
 * @returns {string} - Duración formateada
 */
function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

/**
 * Crea un embed de información para una canción
 * @param {Object} song - Objeto de canción de DisTube
 * @returns {EmbedBuilder} - Embed con información de la canción
 */
function createSongEmbed(song) {
  const { EmbedBuilder } = require("discord.js");

  return new EmbedBuilder()
    .setColor("#0099ff")
    .setTitle("🎵 Reproduciendo ahora")
    .setDescription(`**${song.name}**`)
    .setThumbnail(song.thumbnail)
    .addFields(
      {
        name: "⏱️ Duración",
        value: song.formattedDuration,
        inline: true,
      },
      {
        name: "👤 Canal",
        value: song.uploader.name,
        inline: true,
      }
    )
    .setFooter({ text: `Solicitado por ${song.user.tag}` });
}

module.exports = {
  validateYouTubeUrl,
  formatDuration,
  createSongEmbed,
};
