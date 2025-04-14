require("dotenv").config(); // Carga las variables de entorno desde .env

const errorHandler = require("./utils/errorHandler");
errorHandler.init();

const { Client, GatewayIntentBits, Collection } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require("fs");
const path = require("path");

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

// Maneja las interacciones de comandos
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

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
