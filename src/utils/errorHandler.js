/**
 * Configuración de manejadores globales de errores
 * Importa este archivo al inicio de tu aplicación
 */

// Capturar excepciones no manejadas
process.on("uncaughtException", (error) => {
  console.error("=== EXCEPCIÓN NO CAPTURADA ===");
  console.error(error);
  console.error("Stack trace:", error.stack);
  console.error("===============================");
});

// Capturar rechazos de promesas no manejados
process.on("unhandledRejection", (reason, promise) => {
  console.error("=== RECHAZO DE PROMESA NO MANEJADO ===");
  console.error("Razón:", reason);
  console.error("Promesa:", promise);
  console.error("========================================");
});

module.exports = {
  init: () => {
    console.log("[Sistema] Manejadores de errores globales inicializados");
  },
};
