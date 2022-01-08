function capitalize(string) {
  const lower = string.toLowerCase();
  return string.charAt(0).toUpperCase() + lower.slice(1);
}

function bytesToSize(bytes) {
  if (bytes === 0) return "n/a";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  if (i === 0) return `${bytes} ${BYTE_SIZES[i]})`;
  return `${(bytes / 1024 ** i).toFixed(1)} ${BYTE_SIZES[i]}`;
}

async function getImageBlob(imageURL) {
  let blob = await fetch(imageURL).then((r) => r.blob());
  return blob;
}

exports.content = {
  token: process.env.TOKEN,
  prefix: "p!",
  activityMessage: "beautiful photos. | p!help",
  activityType: "SEARCHING",
  unsplashAccessKey: process.env.accessKey,
  unsplashSecretKey: process.env.secretKey,
  colors: {
    pink: "#FFADF1",
    red: "#FF5582",
    cyan: "#8CFAFA",
    blue: "#84B6FF",
  },
};
