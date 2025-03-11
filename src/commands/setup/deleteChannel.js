const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "deletechannel", // Convertir a minúsculas
  description: "Elimina un canal de voz creado por el bot",
  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");

    if (channel && channel.type === 2) {
      // 2 es el tipo para GUILD_VOICE
      // ID del canal "Crear canal"
      const createChannelId = "1348897017132482561";

      // Verificar si el canal fue creado por el bot y no es el canal "Crear canal"
      if (channel.id !== createChannelId && channel.createdByBot) {
        // Verificar si no hay usuarios en el canal
        if (channel.members.size === 0) {
          try {
            await channel.delete();
            await interaction.reply(
              `El canal ${channel.name} ha sido eliminado.`
            );
          } catch (error) {
            console.error(error);
            await interaction.reply({
              content: "Hubo un error al eliminar el canal.",
              ephemeral: true,
            });
          }
        } else {
          await interaction.reply({
            content:
              "No puedes eliminar este canal porque hay usuarios dentro.",
            ephemeral: true,
          });
        }
      } else {
        await interaction.reply({
          content: "No puedes eliminar este canal.",
          ephemeral: true,
        });
      }
    } else {
      await interaction.reply({
        content: "Por favor, proporciona un canal de voz válido.",
        ephemeral: true,
      });
    }
  },
};
