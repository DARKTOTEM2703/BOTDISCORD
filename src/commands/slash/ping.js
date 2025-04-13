module.exports = {
  name: "ping",
  description: "Comprueba la latencia del bot",
  async execute(interaction) {
    const sent = await interaction.reply({
      content: "📡 Calculando ping...",
      fetchReply: true,
    });

    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);

    await interaction.editReply({
      content: `📊 Pong!\n⏱️ Latencia: ${latency}ms\n🌐 API: ${apiLatency}ms`,
    });
  },
};
