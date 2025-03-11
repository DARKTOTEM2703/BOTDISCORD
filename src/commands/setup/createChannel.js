const { Permissions } = require("discord.js");

module.exports = {
  async execute(member) {
    const guild = member.guild;
    const channelName = member.user.username || "Nuevo Canal de Voz";

    try {
      // Crear el canal de voz (2 es el valor numérico para canal de voz)
      const voiceChannel = await guild.channels.create({
        name: channelName,
        type: 2, // 2 es el valor numérico para canal de voz
        reason: "Creación automática para el usuario",
      });

      // Mover al usuario al nuevo canal
      await member.voice.setChannel(voiceChannel);

      console.log(
        `Canal de voz creado: ${voiceChannel.name} y movido a ese canal.`
      );
    } catch (error) {
      console.error("Error al crear el canal:", error);
    }
  },

  async handleVoiceStateUpdate(oldState, newState) {
    // Verificar si el usuario se unió al canal específico
    const specificChannelId = "1348897017132482561";
    if (newState.channelId === specificChannelId) {
      const member = newState.member;
      await this.execute(member);
  