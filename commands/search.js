const Discord = require("discord.js");
const polyfill = require("es6-promise").polyfill();
const fetch = require("isomorphic-fetch");
const { UNSPLASH } = require("../utils/constants");
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
    .setColor(process.env.color_pink)
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

  UNSPLASH.search
    .photos(query, 0)
    .then(toJson)
    .then((photos) => {
      if (photos.total <= 0) {
        let errembed = new Discord.MessageEmbed()
          .setAuthor({
            name: "An error occured!",
            iconURL:
              "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20width%3D%221em%22%20height%3D%221em%22%20preserveAspectRatio%3D%22xMidYMid%20meet%22%20viewBox%3D%220%200%2048%2048%22%3E%3Cg%20fill%3D%22none%22%20stroke-width%3D%224%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2224%22%20cy%3D%2224%22%20r%3D%2220%22%20fill%3D%22%232F88FF%22%20stroke%3D%22%23000%22%2F%3E%3Cpath%20d%3D%22M33%2015L15%2033M15%2015l18%2018%22%20stroke%3D%22%23fff%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E.png",
          })
          .setDescription("Couldn't find Photo")
          .setColor(process.env.color_red)
          .setTimestamp();

        return message.channel.send({ embeds: [errembed] });
      } else {
        result = photos.results.slice(0, 3).map(function () {
          return this.splice(Math.floor(Math.random() * this.length), 1)[0];
        }, photos.results.slice());

        result.map(async (photo) => {
          let blob = await getImageBlob(photo.urls.raw);

          let row = new Discord.MessageActionRow().addComponents(
            new Discord.MessageButton()
              .setURL(photo.links.html)
              .setLabel("Photo")
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
          iconURL:
            "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20width%3D%221em%22%20height%3D%221em%22%20preserveAspectRatio%3D%22xMidYMid%20meet%22%20viewBox%3D%220%200%2048%2048%22%3E%3Cg%20fill%3D%22none%22%20stroke-width%3D%224%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2224%22%20cy%3D%2224%22%20r%3D%2220%22%20fill%3D%22%232F88FF%22%20stroke%3D%22%23000%22%2F%3E%3Cpath%20d%3D%22M33%2015L15%2033M15%2015l18%2018%22%20stroke%3D%22%23fff%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E.png",
        })
        .setDescription(`${err}`)
        .setColor(process.env.color_red)
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
