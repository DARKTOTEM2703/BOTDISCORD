require("dotenv").config(); // Carga las variables de entorno desde .env

const errorHandler = require("./utils/errorHandler");
errorHandler.init();

const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
client.login(process.env.DISCORD_TOKEN); // Usa el token desde .env

// Manejo de comandos slash
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "speak") {
    const args = interaction.options.getString("text").split(/ +/);
    const command = require("./commands/Voice/speak.js");
    await command.execute(interaction, args);
  } else if (interaction.commandName === "play") {
    const query = interaction.options.getString("query");
    console.log("Comando play recibido con query:", query);
    try {
      const command = require("./commands/utils/youtube.js");
      await command.execute(interaction, query);
    } catch (error) {
      console.error("Error ejecutando comando play:", error);
      await interaction.reply({
        content: "❌ Hubo un error al ejecutar el comando",
        ephemeral: true,
      });
    }
  } else if (interaction.commandName === "ping") {
    try {
      const command = require("./commands/slash/ping.js");
      await command.execute(interaction);
    } catch (error) {
      console.error("Error ejecutando comando ping:", error);
      await interaction.reply({
        content: "❌ Hubo un error al ejecutar el comando",
        ephemeral: true,
      });
    }
  }
});
