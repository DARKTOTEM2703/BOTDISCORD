require("dotenv").config(); // Carga las variables de entorno desde .env

const errorHandler = require("./utils/errorHandler");
errorHandler.init();

const { Client, GatewayIntentBits, Collection } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require("fs");
const path = require("path");
const { Player } = require("discord-player");
const { ExtractorPlugin } = require("@discord-player/extractor");

// Crear el cliente de Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// Inicializar la colección de comandos
client.commands = new Collection();

// Configurar el reproductor de música
client.player = new Player(client, {
  ytdlOptions: {
    quality: "highestaudio",
    highWaterMark: 1 << 25, // 32MB buffer
    filter: "audioonly", // Asegurarse de que solo se descargue el audio
  },
});

// Registrar extractores
(async () => {
  try {
    const { DefaultExtractors } = require("@discord-player/extractor");

    // Registrar múltiples extractores predeterminados
    await client.player.extractors.loadMulti(DefaultExtractors);
    console.log("[Player] Extractores registrados correctamente.");
  } catch (error) {
    console.error("[Player] Error al registrar extractores:", error);
  }
})();

// Eventos del reproductor
client.player.on("error", (queue, error) => {
  console.error(`[Player] Error en la cola: ${error.message}`);
  if (queue.metadata && queue.metadata.channel) {
    queue.metadata.channel.send(`❌ Error en la cola: ${error.message}`);
  }
});

client.player.on("connectionError", (queue, error) => {
  console.error(`[Player] Error de conexión: ${error.message}`);
  if (queue.metadata && queue.metadata.channel) {
    queue.metadata.channel.send(`❌ Error de conexión: ${error.message}`);
  }
});

client.player.on("trackStart", (queue, track) => {
  console.log(`[Player] Reproduciendo: ${track.title}`);
  if (queue.metadata && queue.metadata.channel) {
    queue.metadata.channel.send(
      `🎵 Reproduciendo: **${track.title}** - \`${track.duration}\``
    );
  }

  // Inicializar el historial si no existe
  if (!queue.metadata.history) {
    queue.metadata.history = [];
  }

  // Agregar la canción actual al historial
  queue.metadata.history.push(track);
  console.log(
    "[Player] Historial actualizado:",
    queue.metadata.history.map((t) => t.title)
  );
});

client.player.on("trackAdd", (queue, track) => {
  console.log(`[Player] Canción añadida: ${track.title}`);
  if (queue.metadata && queue.metadata.channel) {
    queue.metadata.channel.send(
      `✅ Añadido a la cola: **${track.title}** - \`${track.duration}\``
    );
  }
});

client.player.on("botDisconnect", (queue) => {
  console.log("[Player] Bot desconectado del canal de voz.");
  if (queue.metadata && queue.metadata.channel) {
    queue.metadata.channel.send(
      "❌ Me han desconectado manualmente del canal de voz, borrando la cola."
    );
  }
});

client.player.on("channelEmpty", (queue) => {
  console.log("[Player] Canal de voz vacío, abandonando el canal.");
  if (queue.metadata && queue.metadata.channel) {
    queue.metadata.channel.send(
      "❌ El canal de voz está vacío, abandonando el canal..."
    );
  }
});

client.player.on("queueEnd", (queue) => {
  console.log("[Player] Cola de reproducción finalizada.");
  if (queue.metadata && queue.metadata.channel) {
    queue.metadata.channel.send("✅ ¡Cola de reproducción finalizada!");
  }
});

// Función para cargar comandos
function loadCommands() {
  const commandFolders = fs.readdirSync("./src/commands");
  const commandsArray = [];

  for (const folder of commandFolders) {
    const commandFiles = fs
      .readdirSync(`./src/commands/${folder}`)
      .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
      const command = require(`./commands/${folder}/${file}`);
      if (command.data) {
        client.commands.set(command.data.name, command);
        commandsArray.push(command.data);
        console.log(`Comando cargado: ${command.data.name}`);
      }
    }
  }

  return commandsArray;
}

// Cuando el bot se conecta correctamente
client.once("ready", async () => {
  console.log("Bot está listo y en línea!");

  // Cargar comandos
  const commands = loadCommands();

  const rest = new REST({ version: "9" }).setToken(process.env.DISCORD_TOKEN);

  try {
    // Registra comandos para un servidor específico
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, "1153455873025396768"),
      { body: commands }
    );
    console.log("Comandos registrados exitosamente.");
  } catch (error) {
    console.error(error);
  }
});

// Maneja las interacciones de comandos y botones
client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (command) {
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        try {
          if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
              content: "Hubo un error al ejecutar el comando.",
              ephemeral: true,
            });
          } else {
            await interaction.followUp({
              content: "Hubo un error al ejecutar el comando.",
              ephemeral: true,
            });
          }
        } catch (replyError) {
          console.error("Error al responder:", replyError);
        }
      }
    }
  } else if (interaction.isButton()) {
    const queue = client.player.nodes.get(interaction.guildId);
    if (!queue) {
      return interaction.reply({
        content: "❌ No hay música reproduciéndose actualmente.",
        ephemeral: true,
      });
    }

    switch (interaction.customId) {
      case "skip":
        queue.node.skip();
        await interaction.reply({
          content: "⏭️ Canción saltada.",
          ephemeral: true,
        });
        break;
      case "previous":
        // Implementar la lógica de retroceso
        if (queue.metadata.history && queue.metadata.history.length > 1) {
          // Eliminar la canción actual del historial
          const currentTrack = queue.metadata.history.pop();
          console.log(
            `[Player] Eliminando canción actual del historial: ${currentTrack.title}`
          );

          // Obtener la canción anterior
          const previousTrack = queue.metadata.history.pop();
          if (previousTrack) {
            console.log(
              `[Player] Reproduciendo canción anterior: ${previousTrack.title}`
            );
            queue.insert(previousTrack, 0); // Insertar al inicio de la cola
            queue.node.play(); // Reproducir la canción anterior
            await interaction.reply({
              content: `⏮️ Reproduciendo canción anterior: **${previousTrack.title}**`,
              ephemeral: true,
            });
          }
        } else {
          await interaction.reply({
            content: "❌ No hay canciones anteriores en el historial.",
            ephemeral: true,
          });
        }
        break;
      case "queue":
        const tracks = queue.tracks
          .map((track, i) => `${i + 1}. ${track.title}`)
          .join("\n");
        await interaction.reply({
          content: `📜 **Lista de espera:**\n${
            tracks || "No hay canciones en la cola."
          }`,
          ephemeral: true,
        });
        break;
      case "stop":
        queue.delete();
        await interaction.reply({
          content: "⏹️ Reproducción detenida.",
          ephemeral: true,
        });
        break;
    }
  }
});

// Eventos de voz - Asegúrate de que el archivo createChannel exista o ajusta según sea necesario
client.on("voiceStateUpdate", async (oldState, newState) => {
  try {
    const createChannelCommand = require("./commands/setup/createChannel");
    await createChannelCommand.handleVoiceStateUpdate(oldState, newState);
  } catch (error) {
    console.error("Error en el evento voiceStateUpdate:", error);
  }
});

// Inicia sesión con el token
client.login(process.env.DISCORD_TOKEN);
