module.exports = {
  name: "ban",
  description: "Banea a un usuario",
  async execute(message, args) {
    if (!message.member.permissions.has("BAN_MEMBERS")) {
      return message.reply("No tienes permisos para usar este comando.");
    }

    const user = message.mentions.users.first();
    if (!user) return message.reply("¡Menciona a un usuario para banear!");

    const member = message.guild.members.cache.get(user.id);
    if (member) {
      await member.ban({ reason: "Comportamiento inapropiado" });
      message.reply(`¡${user.tag} ha sido baneado!`);
    } else {
      message.reply("No pude encontrar al usuario.");
    }
  },
};
