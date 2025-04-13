module.exports = {
  name: "messageCreate",
  async execute(message) {
    if (message.author.bot) return; // Ignorar los mensajes de los bots

    // Agregar registro para ayudar a documentar advertencias de desarrollo
    if (process.env.NODE_ENV === "development") {
      console.log(`[INFO] Mensaje recibido de ${message.author.tag}`);
    }

    const badLinks = [".xyz", ".exe", "malicious-domain.com"]; // Lista de dominios maliciosos
    const content = message.content.toLowerCase();

    badLinks.forEach((link) => {
      if (content.includes(link)) {
        message.delete();
        message.reply("¡Eso no es un enlace permitido!");
      }
    });
  },
};
