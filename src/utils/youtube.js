// Utilizar play-dl en lugar de ytdl-core
const play = require("play-dl");

/**
 * Valida una URL de YouTube
 * @param {string} url - La URL a validar
 * @returns {boolean} - Verdadero si es una URL válida de video o playlist
 */
function validateYouTubeUrl(url) {
  const validation = play.yt_validate(url);
  return validation === "video" || validation === "playlist";
}

/**
 * Obtiene información de un video de YouTube
 * @param {string} url - URL del video
 * @returns {Promise<Object>} - Detalles del video
 */
async function getVideoInfo(url) {
  try {
    const songInfo = await play.video_info(url);
    return songInfo.video_details;
  } catch (error) {
    console.error("[YOUTUBE] Error al obtener información del video:", error);
    throw error;
  }
}

/**
 * Busca videos en YouTube
 * @param {string} query - Término de búsqueda
 * @param {number} limit - Cantidad máxima de resultados
 * @returns {Promise<Array>} - Resultados de la búsqueda
 */
async function searchYouTube(query, limit = 5) {
  try {
    const searchResults = await play.search(query, { limit });
    return searchResults;
  } catch (error) {
    console.error("[YOUTUBE] Error en la búsqueda:", error);
    throw error;
  }
}

/**
 * Obtiene un stream de audio de YouTube
 * @param {string} url - URL del video
 * @returns {Promise<Object>} - Stream y tipo de stream
 */
async function getAudioStream(url) {
  try {
    const stream = await play.stream(url, {
      discordPlayerCompatibility: true,
      quality: 1,
    });
    return stream;
  } catch (error) {
    console.error("[YOUTUBE] Error al obtener stream de audio:", error);
    throw error;
  }
}

module.exports = {
  validateYouTubeUrl,
  getVideoInfo,
  searchYouTube,
  getAudioStream,
};
