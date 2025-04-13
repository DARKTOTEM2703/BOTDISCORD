const { REST, Routes } = require("discord.js");
require("dotenv").config();

// Validación de variables de entorno
if (!process.env.DISCORD_TOKEN) {
  throw new Error("La variable de entorno DISCORD_TOKEN no está definida.");
}
if (!process.env.CLIENT_ID) {
  throw new Error("La variable de entorno CLIENT_ID no está definida.");
}
if (!process.env.GUILD_ID) {
  throw new Error("La variable de entorno GUILD_ID no está definida.");
}

const commands = [
  {
    name: "speak",
    description: "Make the bot speak a message",
    options: [
      {
        type: 3, // STRING
        name: "text",
        description: "The text for the bot to speak",
        required: true,
      },
    ],
  },
  {
    name: "ping",
    description: "Responde con pong para comprobar si el bot está funcionando",
  },
  {
    name: "play",
    description: "Reproduce música de YouTube",
    options: [
      {
        type: 3, // STRING
        name: "query",
        description: "URL de YouTube o nombre de la canción",
        required: true,
      },
    ],
  },
  {
    name: "stop",
    description: "Detiene la reproducción de música y desconecta el bot",
  },
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ), // Cambiado a applicationGuildCommands
      {
        body: commands,
      }
    );

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
