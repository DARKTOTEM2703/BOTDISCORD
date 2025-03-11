module.exports = {
  name: "verify",
  description: "Verifica a un nuevo miembro del servidor",
  async execute(message) {
    if (
      message.guild.members.cache
        .get(message.author.id)
        .roles.cache.has("verifiedRoleID")
    ) {
      return message.reply("¡Ya estás verificado!");
    }

    // Enviar mensaje de verificación
    const code = Math.floor(100000 + Math.random() * 900000); // Código de verificación
    await message.author.send(`Tu código de verificación es: ${code}`);

    const filter = (response) =>
      response.content === code.toString() &&
      response.author.id === message.author.id;
    const collector = message.author.dmChannel.createMessageCollector({
      filter,
      time: 60000,
    });

    collector.on("collect", async () => {
      const role = message.guild.roles.cache.get("verifiedRoleID");
      if (role) {
        await message.member.roles.add(role);
        message.author.send("¡Te has verificado correctamente!");
      }
    });

    collector.on("end", (collected) => {
      if (collected.size === 0) {
        message.author.send("No verificaste el código a tiempo.");
      }
    });
  },
};
