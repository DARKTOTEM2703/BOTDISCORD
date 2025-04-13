const axios = require("axios");
const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");

// Función para buscar videos en YouTube
async function searchYouTube(query) {
  console.log(`[DEBUG] Iniciando búsqueda en YouTube para: "${query}"`);
  try {
    // Añadir un timeout para evitar bloqueos indefinidos
    const searchPromise = ytSearch(query);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Tiempo de búsqueda agotado")), 15000)
    );

    const videoResult = await Promise.race([searchPromise, timeoutPromise]);
    console.log(
      `[DEBUG] Búsqueda completada: ${videoResult.videos.length} resultados encontrados`
    );
    return videoResult.videos.length > 0 ? videoResult.videos[0] : null;
  } catch (error) {
    console.error(`[ERROR] Error buscando en YouTube: ${error.message}`, error);
    return null;
  }
}

// Función mejorada para validar y obtener info de URLs de YouTube
async function getYoutubeInfo(url) {
  console.log(`[DEBUG] Obteniendo información de URL: ${url}`);

  // Verificar si la URL es undefined o vacía
  if (!url || url.trim() === "") {
    console.error("[ERROR] URL inválida: URL está vacía o es undefined");
    return null;
  }

  try {
    // Normalizar URL si es necesario
    if (url && !url.startsWith("http")) {
      url = "https://" + url;
      console.log(`[DEBUG] URL normalizada: ${url}`);
    }

    // Validación específica para YouTube (mejora de diagnóstico)
    const isYoutubeUrl =
      url.includes("youtube.com") ||
      url.includes("youtu.be") ||
      url.includes("youtube-nocookie.com");

    if (!isYoutubeUrl) {
      console.error(`[ERROR] URL no es de YouTube: ${url}`);
      return null;
    }

    // Validar URL antes de procesar con ytdl
    console.log(`[DEBUG] Validando URL con ytdl: ${url}`);
    const isValid = ytdl.validateURL(url);
    console.log(
      `[DEBUG] Resultado de validación ytdl: ${isValid ? "Exitosa" : "Fallida"}`
    );

    if (!isValid) {
      console.error(`[ERROR] URL inválida según ytdl: "${url}"`);
      return null;
    }

    console.log("[DEBUG] Iniciando obtención de información detallada...");

    // Añadir un timeout para evitar bloqueos indefinidos
    const infoPromise = ytdl.getInfo(url);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Tiempo de obtención de info agotado")),
        20000
      )
    );

    const info = await Promise.race([infoPromise, timeoutPromise]);

    console.log(
      `[DEBUG] Información obtenida para: ${info.videoDetails.title}`
    );
    console.log(
      `[DEBUG] Duración: ${info.videoDetails.lengthSeconds}s | Formato: ${info.formats.length} disponibles`
    );

    // Verificar si el video es transmisión en vivo
    if (info.videoDetails.isLiveContent) {
      console.log(`[DEBUG] El video es una transmisión en vivo`);
    }

    return {
      title: info.videoDetails.title,
      url: info.videoDetails.video_url,
      duration: parseInt(info.videoDetails.lengthSeconds),
      thumbnail: info.videoDetails.thumbnails[0]?.url || "",
      isLive: info.videoDetails.isLiveContent,
      author: info.videoDetails.author.name,
      formats: info.formats
        .map((f) => ({
          itag: f.itag,
          mimeType: f.mimeType,
          quality: f.quality,
          hasAudio: f.hasAudio,
        }))
        .slice(0, 3), // Solo guardamos algunos formatos para diagnosticar
    };
  } catch (error) {
    console.error(`[ERROR] Error obteniendo info de YouTube:`, error);
    console.error(`[ERROR] Stack trace:`, error.stack);

    // Intentar determinar el tipo específico de error
    let errorType = "desconocido";
    if (error.message.includes("status code")) errorType = "error_http";
    if (error.message.includes("private")) errorType = "video_privado";
    if (error.message.includes("copyright")) errorType = "error_copyright";
    if (error.message.includes("not exist")) errorType = "video_no_existe";

    console.error(`[ERROR] Tipo de error identificado: ${errorType}`);
    return null;
  }
}

// Función principal para manejar reproducción de música
async function handleMusicRequest(input) {
  console.log(`[DEBUG] Procesando solicitud de música: "${input}"`);
  const startTime = Date.now();

  try {
    // Verificar si es una URL
    if (input && (input.startsWith("http") || input.startsWith("www"))) {
      console.log("[DEBUG] Detectada URL, procesando...");

      // Asegurarse de que la URL tenga el formato correcto
      let url = input;
      if (!url.startsWith("http")) {
        url = "https://" + url;
      }

      // Intenta obtener información del video
      console.log(`[DEBUG] Solicitando información para URL: ${url}`);
      const youtubeInfo = await getYoutubeInfo(url);

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(
        `[DEBUG] Información obtenida en ${elapsed}s: ${
          youtubeInfo ? "Éxito" : "Fallido"
        }`
      );

      if (!youtubeInfo)
        return {
          success: false,
          message: "URL de YouTube inválida o video no disponible",
          diagnostics: { elapsed, error: "info_retrieval_failed" },
        };

      return {
        success: true,
        track: { ...youtubeInfo, originalPlatform: "youtube" },
        diagnostics: { elapsed },
      };
    }
    // Búsqueda por nombre
    else {
      console.log("[DEBUG] Realizando búsqueda por nombre...");
      const youtubeResult = await searchYouTube(input);

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(
        `[DEBUG] Resultado de búsqueda en ${elapsed}s:`,
        youtubeResult ? "Encontrado" : "No encontrado"
      );

      if (!youtubeResult)
        return {
          success: false,
          message: "No se encontró la canción",
          diagnostics: { elapsed, error: "search_no_results" },
        };

      // Verificar que podamos obtener más información
      console.log("[DEBUG] Verificando disponibilidad del video encontrado...");
      const youtubeInfo = await getYoutubeInfo(youtubeResult.url);

      if (!youtubeInfo) {
        return {
          success: false,
          message: "El video encontrado no está disponible para reproducción",
          diagnostics: {
            elapsed: ((Date.now() - startTime) / 1000).toFixed(2),
            error: "video_unavailable",
          },
        };
      }

      return {
        success: true,
        track: {
          title: youtubeResult.title,
          url: youtubeResult.url,
          duration: youtubeResult.duration.seconds,
          thumbnail: youtubeResult.thumbnail,
          originalPlatform: "youtube",
        },
        diagnostics: { elapsed: ((Date.now() - startTime) / 1000).toFixed(2) },
      };
    }
  } catch (error) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error(
      `[ERROR] Error procesando solicitud de música (${elapsed}s):`,
      error
    );
    console.error(`[ERROR] Stack trace:`, error.stack);

    // Devolver mensaje de error más específico si está disponible
    return {
      success: false,
      message: `Error al procesar la solicitud de música: ${
        error.message || "Error desconocido"
      }`,
      diagnostics: { elapsed, errorType: error.name, errorStack: error.stack },
    };
  }
}

// Función para probar conectividad con YouTube
async function testYouTubeConnectivity() {
  try {
    console.log("[TEST] Probando conectividad con YouTube...");
    const response = await axios.get("https://www.youtube.com", {
      timeout: 5000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });
    console.log(
      `[TEST] Conectividad con YouTube: OK (status ${response.status})`
    );
    return { success: true, status: response.status };
  } catch (error) {
    console.error("[TEST] Error de conectividad con YouTube:", error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  handleMusicRequest,
  searchYouTube,
  getYoutubeInfo,
  testYouTubeConnectivity,
};
