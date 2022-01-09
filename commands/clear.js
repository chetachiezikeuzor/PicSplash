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

  if (!args[0])
    return message.reply("Please enter the nunber of messages to clear.");
  if (isNaN(args[0])) return message.reply("Please enter a real number.");
  if (args[0] > 100)
    return message.reply("You can't clear more than 100 messages.");
  if (args[0] < 1)
    return message.reply("You have to clear at least one message.");

  await message.channel.messages.fetch({ limit: args[0] }).then((messages) => {
    message.channel.bulkDelete(messages);
  });
};

exports.help = {
  name: "clear",
  description: "Clear a number of recent messages.",
  cooldown: "5",
  usage: "clear <number>",
};
