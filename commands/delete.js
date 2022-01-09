const Discord = require("discord.js");

exports.run = async (client, message, args) => {
  if (!client.cooldownCollection) {
    client.cooldownCollection = new Set();
  }

  let cooldownEmbed = new Discord.MessageEmbed()
    .setAuthor({
      name: message.author.tag,
      iconURL: message.author.avatarURL(),
    })
    .setColor(process.env.color_red)
    .setDescription(
      `Please wait ${exports.help.cooldown} seconds between commands.`
    );

  if (client.cooldownCollection.has(message.author.id))
    return message.channel.send({ embeds: [cooldownEmbed] });

  client.cooldownCollection.add(message.author.id);
  setTimeout(() => {
    client.cooldownCollection.delete(message.author.id);
  }, exports.help.cooldown * 1000);

  if (!args[0]) return message.reply("Please enter a message id.");
  if (isNaN(args[0])) return message.reply("Please enter a real number.");

  await message.channel
    .fetchMessage(args[0])
    .then((message) => message.delete());
};

exports.help = {
  name: "delete",
  description: "Delete a specific message by id.",
  cooldown: "5",
  usage: "delete <id>",
};