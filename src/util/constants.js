export const client = new discord.Client();
export const discord = require("discord.js");
export const {
  prefix,
  token,
  unsplashAccessKey,
  unsplashSecretKey,
} = require("./config.json");
export const { toJson } = require("unsplash-js");
export const Unsplash = require("unsplash-js").default;
export const unsplash = new Unsplash({
  accessKey: unsplashAccessKey,
});
