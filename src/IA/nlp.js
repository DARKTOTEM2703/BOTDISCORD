const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Clase para procesar lenguaje natural usando la API de Google Generative AI
 */
class NaturalLanguageProcessor {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.GOOGLE_AI_API_KEY;
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    // Usar el modelo disponible en el plan gratuito
    this.defaultModel = "gemini-2.0-flash"; // Actualizado al modelo del plan gratuito
  }

  /**
   * Procesa una consulta en lenguaje natural y devuelve una respuesta
   * @param {string} prompt - La pregunta o mensaje del usuario
   * @param {Object} options - Opciones adicionales para la consulta
   * @returns {Promise<string>} - La respuesta generada por la IA
   */
  async chat(prompt, options = {}) {
    try {
      // Obtener el modelo a utilizar
      const model = this.genAI.getGenerativeModel({
        model: options.model || this.defaultModel,
      });

      // Configuración para el modelo flash
      const generationConfig = {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxTokens || 256,
      };

      // Crear el contenido con el formato que espera la API
      const result = await model.generateContent({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig,
      });

      const response = result.response;
      return response.text();
    } catch (error) {
      console.error("Error al comunicarse con la IA de Google:", error);
      return "Lo siento, ha ocurrido un error al procesar tu consulta. Estás usando el plan gratuito de Gemini API que tiene ciertas limitaciones.";
    }
  }
}

module.exports = NaturalLanguageProcessor;
