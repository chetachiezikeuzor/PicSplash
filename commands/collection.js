const Discord = require("discord.js");
const polyfill = require("es6-promise").polyfill();
const fetch = require("isomorphic-fetch");
const Unsplash = require("unsplash-js").default;
const toJson = require("unsplash-js").toJson;
const { capitalize } = require("../utils/functions");

exports.run = async (client, message, args) => {
  let query = args.toString().replaceAll(",", " ");
  if (!client.cooldownCollection) {
    client.cooldownCollection = new Set();
  }

  let cooldownEmbed = new Discord.MessageEmbed()
    .setAuthor({
      name: message.author.tag,
      iconURL: message.author.avatarURL(),
    })
    .setColor(process.env.colors.primary)
    .setDescription(
      `Please wait ${exports.help.cooldown} seconds between commands.`
    );

  if (client.cooldownCollection.has(message.author.id))
    return message.channel.send({ embeds: [cooldownEmbed] });

  client.cooldownCollection.add(message.author.id);
  setTimeout(() => {
    client.cooldownCollection.delete(message.author.id);
  }, exports.help.cooldown * 1000);

  if (!args[0]) return message.reply("Please enter a keyword.");

  const unsplash = new Unsplash({
    applicationId: process.env.unsplashAccessKey,
    secret: process.env.unsplashSecretKey,
  });

  unsplash.search
    .collections(query, 1)
    .then(toJson)
    .then((json) => {
      if (json.total <= 0) {
        let errembed = new Discord.MessageEmbed()
          .setAuthor({
            name: "An error occured!",
            iconURL: "https://i.imgur.com/FCZNSQa.png",
          })
          .setDescription("Couldn't find Collection")
          .setColor(process.env.colors.primary)
          .setTimestamp();

        return message.channel.send({ embeds: [errembed] });
      }

      let randNum = Math.floor(Math.random() * json.results.length);

      unsplash.collections
        .getCollection(json.results[randNum].id)
        .then(toJson)
        .then((json) => {
          if (json.errors) {
            let errembed = new Discord.MessageEmbed()
              .setAuthor({
                name: "An error occured!",
                iconURL: "https://i.imgur.com/FCZNSQa.png",
              })
              .setDescription(json.errors.join("\n"))
              .setColor(process.env.colors.primary)
              .setTimestamp();

            return message.channel.send({ embeds: [errembed] });
          }

          let row = new Discord.MessageActionRow().addComponents(
            new Discord.MessageButton()
              .setURL(json.links.html)
              .setLabel("Collection")
              .setStyle("LINK")
          );

          let embed = new Discord.MessageEmbed()
            .setAuthor({
              name: `${json.user.name} (@${json.user.username}) on Unsplash`,
              iconURL: json.user.profile_image.medium,
              url: json.user.links.html,
            })
            .setTitle(capitalize(json.title))
            .setDescription(
              `${json.description ? json.description : "No description."}`
            )
            .setColor(json.cover_photo.color)
            .setThumbnail(json.cover_photo.urls.raw)
            .addField("ID:", `${json.id}`, true)
            .addField("PHOTOS:", `${json.total_photos}`, true)
            .setTimestamp(json.published_at)
            .setFooter({
              text: query.toUpperCase(),
            });

          return message.channel.send({
            embeds: [embed],
            components: [row],
          });
        });
    })
    .catch((err) => {
      let embed = new Discord.MessageEmbed()
        .setAuthor({
          name: "An error occured!",
          iconURL: "https://i.imgur.com/FCZNSQa.png",
        })
        .setDescription(`${err}`)
        .setColor(process.env.colors.primary)
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    });
};

exports.help = {
  name: "collection",
  description: "Get a collection by keyword.",
  cooldown: "5",
  usage: "collection <keyword>",
};
