const Discord = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const polyfill = require("es6-promise").polyfill();
const fetch = require("isomorphic-fetch");
const { UNSPLASH } = require("../utils/constants");
const toJson = require("unsplash-js").toJson;
const { capitalize, bytesToSize, getImageBlob } = require("../utils/functions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("Search for a photo by keyword.")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Used to search for a photo.")
        .setRequired(true)
    ),
  cooldown: "5",
  usage: "query: <string>",
  async execute(client, interaction) {
    if (interaction) {
      let result;
      const query = interaction.options.getString("query");
      if (!client.cooldownSearch) {
        client.cooldownSearch = new Set();
      }

      let cooldownEmbed = new Discord.MessageEmbed()
        .setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.avatarURL(),
        })
        .setColor(process.env.color_pink)
        .setDescription(
          `Please wait ${exports.cooldown} seconds between commands.`
        );

      if (client.cooldownSearch.has(interaction.user.id))
        return interaction.reply({ embeds: [cooldownEmbed] });

      client.cooldownSearch.add(interaction.user.id);
      setTimeout(() => {
        client.cooldownSearch.delete(interaction.user.id);
      }, exports.cooldown * 1000);

      if (!query) return interaction.reply("Please enter a query.");

      UNSPLASH.search
        .photos(query, 0)
        .then(toJson)
        .then((photos) => {
          if (photos.total <= 0) {
            let errembed = new Discord.MessageEmbed()
              .setAuthor({
                name: "An error occured!",
                iconURL: "https://i.imgur.com/PZ9qLe7.png",
              })
              .setDescription("Couldn't find Photo")
              .setColor(process.env.color_red)
              .setTimestamp();

            return interaction.reply({ embeds: [errembed], ephemeral: true });
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

              let photoItem = new Discord.MessageEmbed()
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
              interaction.channel.send({
                embeds: [photoItem],
                components: [row],
              });
            });

            interaction.reply(`Here are the results for: "${query}"`);
          }
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

          return interaction.reply({ embeds: [embed], ephemeral: true });
        });
    }
  },
};
