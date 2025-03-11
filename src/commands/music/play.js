const ytdl = require("ytdl-core");
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "play",
  description: "Reproduce música desde YouTube",
  async execute(message, args) {
    if (!args.length) {
      return message.reply(
        "¡Por favor proporciona un enlace o título de YouTube!"
      );
    }

    const url = args[0];
    if (!ytdl.validateURL(url)) {
      return message.reply("¡URL no válida de YouTube!");
    }

    const connection = await message.member.voice.channel.join();
    const stream = ytdl(url, { filter: "audioonly" });

    connection
      .play(stream)
      .on("finish", () => {
        message.member.voice.channel.leave();
      })
      .on("error", console.error);

    message.channel.send(
      new MessageEmbed()
        .setTitle("Reproduciendo música:")
        .setDescription(url)
        .setColor("BLUE")
    );
  },
};
