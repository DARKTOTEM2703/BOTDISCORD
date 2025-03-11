const { Client, GatewayIntentBits } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const config = require("./src/config/keys.json");
const createChannelCommand = require("./src/commands/setup/createChannel");

// Crear el cliente de Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates, // Añadir esta línea para escuchar eventos de voz
  ],
});

// Cuando el bot se conecta correctamente
client.once("ready", async () => {
  console.log("Bot está listo y en línea!");

  const rest = new REST({ version: "9" }).setToken(config.token);

  try {
    // Registra comandos para un servidor específico
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, "1153455873025396768"),
      { body: [] }
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
      await interaction.reply({
        content: "Hubo un error al ejecutar el comando.",
        ephemeral: true,
      });
    }
  }
});

client.on("voiceStateUpdate", async (oldState, newState) => {
  await createChannelCommand.handleVoiceStateUpdate(oldState, newState);
});

// Inicia sesión con el token
client.login(config.token);
