const Discord = require("discord.js");
const polyfill = require("es6-promise").polyfill();
const fetch = require("isomorphic-fetch");
const Unsplash = require("unsplash-js").default;
const toJson = require("unsplash-js").toJson;
const { capitalize, bytesToSize, getImageBlob } = require("../utils/functions");

exports.run = async (client, message, args) => {
  if (!client.cooldownPhoto) {
    client.cooldownPhoto = new Set();
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

  if (client.cooldownPhoto.has(message.author.id))
    return message.channel.send({ embeds: [cooldownEmbed] });

  client.cooldownPhoto.add(message.author.id);
  setTimeout(() => {
    client.cooldownPhoto.delete(message.author.id);
  }, exports.help.cooldown * 1000);

  if (!args[0]) return message.reply("Please enter a photo ID.");

  const unsplash = new Unsplash({
    applicationId: process.env.unsplashAccessKey,
    secret: process.env.unsplashSecretKey,
  });

  unsplash.photos
    .getPhoto(args[0])
    .then(toJson)
    .then(async (json) => {
      if (json.errors) {
        let errembed = new Discord.MessageEmbed()
          .setAuthor({
            name: "An error occured!",
            iconURL: "https://i.imgur.com/FCZNSQa.png",
          })
          .setDescription(json.errors.join("\n"))
          .setColor(process.env.color_pink)
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
        .addField("ID:", json.id, true)
        .addField("DIM:", `${json.width} x ${json.height} px`, true)
        .addField("SIZE:", bytesToSize(blob.size), true)
        .setTimestamp(json.created_at)
        .setFooter({
          text: `PHOTO`,
        });

      return message.channel.send({ embeds: [embed], components: [row] });
    })
    .catch((err) => {
      let embed = new Discord.MessageEmbed()
        .setAuthor({
          name: "An error occured!",
          iconURL: "https://i.imgur.com/FCZNSQa.png",
        })
        .setDescription(`${err}`)
        .setColor(process.env.color_pink)
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    });
};

exports.help = {
  name: "photo",
  description: "Get a specific photo.",
  cooldown: "5",
  usage: "photo <id>",
};
