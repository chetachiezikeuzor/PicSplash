const Discord = require("discord.js");
const polyfill = require("es6-promise").polyfill();
const fetch = require("isomorphic-fetch");
const { UNSPLASH } = require("../utils/constants");
const toJson = require("unsplash-js").toJson;
const { capitalize, bytesToSize, getImageBlob } = require("../utils/functions");

exports.run = async (client, message, args) => {
  if (!client.cooldownRandom) {
    client.cooldownRandom = new Set();
  }

  let cooldownEmbed = new Discord.MessageEmbed()
    .setAuthor({
      name: message.author.tag,
      iconURL: message.author.avatarURL(),
    })
    .setColor(process.env.color_pink)
    .setDescription(
      `Please wait ${exports.help.cooldown} seconds between commands.`
    );

  if (client.cooldownRandom.has(message.author.id))
    return message.channel.send({ embeds: [cooldownEmbed] });

  client.cooldownRandom.add(message.author.id);
  setTimeout(() => {
    client.cooldownRandom.delete(message.author.id);
  }, exports.help.cooldown * 1000);

  UNSPLASH.photos
    .getRandomPhoto()
    .then(toJson)
    .then(async (json) => {
      if (json.errors) {
        let errembed = new Discord.MessageEmbed()
          .setAuthor({
            name: "An error occured!",
            iconURL: "https://i.imgur.com/PZ9qLe7.png",
          })
          .setDescription(json.errors.join("\n"))
          .setColor(process.env.color_red)
          .setTimestamp();

        return message.channel.send({ embeds: [errembed] });
      }

      let blob = await getImageBlob(json.urls.raw);

      let row = new Discord.MessageActionRow().addComponents(
        new Discord.MessageButton()
          .setURL(json.links.html)
          .setLabel("Photo")
          .setStyle("LINK")
      );

      let embed = new Discord.MessageEmbed()
        .setAuthor({
          name: `${json.user.name} (@${json.user.username}) on Unsplash`,
          iconURL: json.user.profile_image.medium,
          url: json.user.links.html,
        })
        .setDescription(
          `${
            json.description
              ? capitalize(json.description)
              : json.alt_description
              ? capitalize(json.alt_description)
              : "Unsplash photo"
          }`
        )
        .setColor(json.color)
        .setImage(json.urls.raw)
        .setTimestamp(json.created_at)
        .addField("ID:", json.id, true)
        .addField("DIM:", `${json.width} x ${json.height} px`, true)
        .addField("SIZE:", bytesToSize(blob.size), true)
        .setFooter({
          text: `RANDOM`,
        });

      return message.channel.send({ embeds: [embed], components: [row] });
    })
    .catch((err) => {
      let embed = new Discord.MessageEmbed()
        .setAuthor({
          name: "An error occured!",
          iconURL: "https://i.imgur.com/PZ9qLe7.png",
        })
        .setDescription(`${err}`)
        .setColor(process.env.color_red)
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    });
};

exports.help = {
  name: "random",
  description: "Get a random photo.",
  cooldown: "5",
  usage: "random",
};
