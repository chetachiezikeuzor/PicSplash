const Discord = require("discord.js");
const Unsplash = require("unsplash-js").default;
const toJson = require("unsplash-js").toJson;
const { capitalize, bytesToSize, getImageBlob } = require("../utils/functions");

exports.run = async (client, message, args) => {
  let query = args.toString().replaceAll(",", " ");
  if (!client.cooldownSearch) {
    client.cooldownSearch = new Set();
  }

  let cooldownEmbed = new Discord.MessageEmbed()
    .setAuthor({
      name: message.author.tag,
      iconURL: message.author.avatarURL(),
    })
    .setColor(client.config.colors.pink)
    .setDescription(
      `Please wait ${exports.help.cooldown} seconds between commands.`
    );

  if (client.cooldownSearch.has(message.author.id))
    return message.channel.send({ embeds: [cooldownEmbed] });

  client.cooldownSearch.add(message.author.id);
  setTimeout(() => {
    client.cooldownSearch.delete(message.author.id);
  }, exports.help.cooldown * 1000);

  if (!args[0]) return message.reply("Please enter a keyword.");

  const unsplash = new Unsplash({
    applicationId: client.config.unsplashAccessKey,
    secret: client.config.unsplashSecretKey,
  });

  unsplash.search
    .photos(query, 0)
    .then(toJson)
    .then((photos) => {
      if (photos.total <= 0) {
        let errembed = new Discord.MessageEmbed()
          .setAuthor({
            name: "An error occured!",
            iconURL: "https://i.imgur.com/FCZNSQa.png",
          })
          .setDescription("Couldn't find Photo")
          .setColor(client.config.colors.pink)
          .setTimestamp();

        return message.channel.send({ embeds: [errembed] });
      } else {
        console.log(photos.results.length);
        console.log(args.toString().replaceAll(",", " "));

        result = photos.results.slice(0, 3).map(function () {
          return this.splice(Math.floor(Math.random() * this.length), 1)[0];
        }, photos.results.slice());

        result.map(async (photo) => {
          let blob = await getImageBlob(photo.urls.raw);

          let row = new Discord.MessageActionRow().addComponents(
            new Discord.MessageButton()
              .setURL(photo.links.html)
              .setLabel("Download")
              .setStyle("LINK")
          );

          photoItem = new Discord.MessageEmbed()
            .setAuthor({
              name: `${photo.user.name} (@${photo.user.username}) on Unsplash`,
              iconURL: photo.user.profile_image.medium,
              url: photo.user.links.html,
            })
            .setDescription(
              `${
                photo.description
                  ? capitalize(photo.description)
                  : photo.alt_description
                  ? capitalize(photo.alt_description)
                  : "Unsplash photo"
              }`
            )
            .setColor(photo.color)
            .setImage(photo.urls.raw)
            .setTimestamp(photo.created_at)
            .addField("ID:", photo.id, true)
            .addField("DIM:", `${photo.width} x ${photo.height} px`, true)
            .addField("SIZE:", bytesToSize(blob.size), true)
            .setFooter({
              text: query.toUpperCase(),
            });

          return message.channel.send({
            embeds: [photoItem],
            components: [row],
          });
        });
      }
    })
    .catch((err) => {
      let embed = new Discord.MessageEmbed()
        .setAuthor({
          name: "An error occured!",
          iconURL: "https://i.imgur.com/FCZNSQa.png",
        })
        .setDescription(err)
        .setColor(client.config.colors.pink)
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    });
};

exports.help = {
  name: "search",
  description: "Search for a photo by keyword.",
  cooldown: "5",
  usage: "search <keyword>",
};
