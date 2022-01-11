require("dotenv").config();
const fs = require("fs");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const Discord = require("discord.js");
const userSchema = require("./models/user");
const { Client, Intents } = require("discord.js");
const commands = [];
const commandFiles = fs
  .readdirSync("./cmds/")
  .filter((file) => file.endsWith(".js"));
const config = require("./config.js");
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.config = config.content;
client.commands = new Discord.Collection();

for (const file of commandFiles) {
  console.log("[Commands] Loading...");
  const command = require(`./cmds/${file}`);
  commands.push(command.data.toJSON());
  console.log(`[Commands] Loaded ${command.data.name}`);
  client.commands.set(command.data.name, command);
}

const rest = new REST({ version: "9" }).setToken(process.env.token);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(
        `${process.env.clientId}`,
        `${process.env.guildId}`
      ),
      { body: commands }
    );

    console.log(`[Commands] Loaded ${commands.length} commands!`);
  } catch (error) {
    console.error(error);
  }
})();

fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach((file) => {
    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    client.on(eventName, event.bind(null, client));
  });
});

fs.readdir("./commands/", (err, files) => {
  if (err) return console.error(err);
  console.log("[Commands] Loading...");
  files.forEach((file) => {
    if (!file.endsWith(".js")) return;
    let props = require(`./commands/${file}`);
    console.log(`[Commands] Loaded ${file}`);

    client.commands.set(props.help.name, props);
  });
  console.log(`[Commands] Loaded ${files.length} commands!`);
});

client.login(process.env.token);
