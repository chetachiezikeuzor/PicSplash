import { simpleGet } from "./util/utils";
import discord, {
  prefix,
  client,
  token,
  unsplashAccessKey,
  unsplashSecretKey,
} from "./util/constants";

client.once("ready", () => {
  console.log("The Discord bot is listening for commands...");
});

client.on("message", (message) => {
  if (message.content.startsWith(`${prefix}unsplash`)) {
    const imageType = message.content.substring(10).trim();

    if (imageType == null || imageType === "" || imageType.length == 0) {
      return;
    } else {
    }
  }
});

client.login(token);
