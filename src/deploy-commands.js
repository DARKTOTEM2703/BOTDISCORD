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
  {
    name: "skip",
    description: "Salta a la siguiente canción en la cola",
  },
  {
    name: "queue",
    description: "Muestra la cola de reproducción actual",
  },
  {
    name: "pause",
    description: "Pausa la reproducción de la canción actual",
  },
  {
    name: "resume",
    description: "Reanuda la reproducción de la canción pausada",
  },
  {
    name: "volume",
    description: "Ajusta el volumen de reproducción",
    options: [
      {
        type: 4, // INTEGER
        name: "nivel",
        description: "Nivel de volumen (1-100)",
        required: true,
        min_value: 1,
        max_value: 100,
      },
    ],
  },
  {
    name: "chat",
    description: "Habla con la IA en lenguaje natural",
    options: [
      {
        type: 3, // STRING
        name: "pregunta",
        description: "¿Qué quieres preguntarle a la IA?",
        required: true,
      },
    ],
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
