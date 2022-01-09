const Discord = require("discord.js");
const cron = require("cron");
const polyfill = require("es6-promise").polyfill();
const fetch = require("isomorphic-fetch");
const { UNSPLASH } = require("../utils/constants");
const toJson = require("unsplash-js").toJson;
const { capitalize, bytesToSize, getImageBlob } = require("../utils/functions");

function test() {
  console.log("Action executed.");
}

let job1 = new cron.CronJob("* * * * * *", test); // fires every day, at 01:05:01 and 13:05:01

job1.start();
