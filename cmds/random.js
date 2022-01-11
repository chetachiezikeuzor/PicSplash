const Discord = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const polyfill = require("es6-promise").polyfill();
const fetch = require("isomorphic-fetch");
const { UNSPLASH } = require("../utils/constants");
const toJson = require("unsplash-js").toJson;
const { capitalize, bytesToSize, getImageBlob } = require("../utils/functions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("random")
    .setDescription("Reload a command."),
  cooldown: "5",
  usage: "",
  async execute(client, interaction) {
    if (interaction) {
      if (!client.cooldownRandom) {
        client.cooldownRandom = new Set();
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

      if (client.cooldownRandom.has(interaction.user.id))
        return interaction.reply({ embeds: [cooldownEmbed] });

      client.cooldownRandom.add(interaction.user.id);
      setTimeout(() => {
        client.cooldownRandom.delete(interaction.user.id);
      }, exports.cooldown * 1000);

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

            return interaction.reply({ embeds: [errembed], ephemeral: true });
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

          return interaction.reply({ embeds: [embed], ephemeral: true });
        });
    }
  },
};
