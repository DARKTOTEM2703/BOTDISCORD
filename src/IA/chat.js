const { SlashCommandBuilder } = require("@discordjs/builders");
const NaturalLanguageProcessor = require("./nlp");

// Crea una instancia del procesador NLP con la API de Google
const nlp = new NaturalLanguageProcessor(process.env.GOOGLE_AI_API_KEY);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("chat")
    .setDescription("Habla con la IA en lenguaje natural")
    .addStringOption((option) =>
      option
        .setName("pregunta")
        .setDescription("¿Qué quieres preguntarle a la IA?")
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply(); // Indica que estamos procesando la respuesta

    const pregunta = interaction.options.getString("pregunta");

    try {
      const respuesta = await nlp.chat(pregunta);
      await interaction.editReply(respuesta);
    } catch (error) {
      console.error(error);
      await interaction.editReply(
        "Ha ocurrido un error al comunicarse con la IA."
      );
    }
  },
};
