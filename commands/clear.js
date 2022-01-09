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

  if (message.member.permissions.has("ADMINISTRATOR")) {
    let messagecount = parseInt(args[0]);

    if (isNaN(messagecount))
      return message.channel.send(
        ":x: " +
          "| Please mention the amount of message that you want to delete"
      );

    if (messagecount > 100) {
      message.channel.send(
        ":x: " +
          "| Error, you can only delete between 2 and 100 messages at one time !"
      );
    } else if (messagecount < 2) {
      message.channel.send(
        ":x: " +
          "| Error, you can only delete between 2 and 100 messages at one time !"
      );
    } else {
    }
    {
      message.channel
        .fetchMessages({ limit: messagecount })
        .then((messages) => message.channel.bulkDelete(messages, true));
    }
  } else {
    return message.reply(
      ":x: " + '| You need to be "ADMINISTRATOR" to do that'
    );
  }
};

exports.help = {
  name: "clear",
  description: "Clear a number of recent messages.",
  cooldown: "5",
  usage: "clear <number>",
};
