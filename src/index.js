require("dotenv").config(); // Carga las variables de entorno desde .env

const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});
client.login(process.env.DISCORD_TOKEN); // Usa el token desde .env

// Manejo de comandos slash
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "speak") {
    const args = interaction.options.getString("text").split(/ +/);
    const command = require("./commands/Voice/speak.js");
    await command.execute(interaction, args);
  }
});
