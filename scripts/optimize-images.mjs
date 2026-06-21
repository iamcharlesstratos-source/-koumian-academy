import sharp from "sharp";
import fs from "fs";

const PUB = "C:/Users/Administrator/Documents/Koumi Bootcamp/public";

async function run() {
  // Stoic bust — displayed up to ~560px wide; 2x for retina = ~1120px.
  const bust = await sharp(`${PUB}/stoic-bust.png`)
    .resize({ width: 1120, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(`${PUB}/stoic-bust.webp`);

  // Logo mark — displayed up to 200px (crest); 2x = ~420px.
  const mark = await sharp(`${PUB}/koumian-mark.png`)
    .resize({ width: 420, withoutEnlargement: true })
    .webp({ quality: 90 })
    .toFile(`${PUB}/koumian-mark.webp`);

  const kb = (n) => (n / 1024).toFixed(0) + "KB";
  console.log(
    "stoic-bust.png",
    kb(fs.statSync(`${PUB}/stoic-bust.png`).size),
    "-> stoic-bust.webp",
    kb(bust.size)
  );
  console.log(
    "koumian-mark.png",
    kb(fs.statSync(`${PUB}/koumian-mark.png`).size),
    "-> koumian-mark.webp",
    kb(mark.size)
  );
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
