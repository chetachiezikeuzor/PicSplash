const Discord = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const polyfill = require("es6-promise").polyfill();
const fetch = require("isomorphic-fetch");
const { UNSPLASH } = require("../utils/constants");
const toJson = require("unsplash-js").toJson;
const { capitalize, bytesToSize, getImageBlob } = require("../utils/functions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("photo")
    .setDescription("Gets a specific photo.")
    .addStringOption((option) =>
      option
        .setName("id")
        .setDescription("The id to query a specific photo.")
        .setRequired(true)
    ),
  cooldown: "5",
  usage: "id: <string>",
  async execute(client, interaction) {
    if (interaction) {
      const photoID = interaction.options.getString("id");
      if (!client.cooldownPhoto) {
        client.cooldownPhoto = new Set();
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

      if (client.cooldownPhoto.has(interaction.user.id))
        return interaction.reply({ embeds: [cooldownEmbed] });

      client.cooldownPhoto.add(interaction.user.id);
      setTimeout(() => {
        client.cooldownPhoto.delete(interaction.user.id);
      }, exports.cooldown * 1000);

      if (!photoID) return interaction.reply("Please enter a photo ID.");

      UNSPLASH.photos
        .getPhoto(photoID)
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

            return interaction
              .reply({ embeds: [errembed], ephemeral: true })
              .then((msg) => {
                msg.delete({ timeout: 10000 });
              });
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

          return interaction.reply({ embeds: [embed], components: [row] });
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

          return interaction
            .reply({ embeds: [embed], ephemeral: true })
            .then((msg) => {
              msg.delete({ timeout: 10000 });
            });
        });
    }
  },
};
