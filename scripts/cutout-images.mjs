import fs from "fs";
import zlib from "zlib";
import sharp from "sharp";

const SRC = "C:/Users/Administrator/Downloads/Koumian-Academy-standalone.html";
const PUB = "C:/Users/Administrator/Documents/Koumi Bootcamp/public";

const html = fs.readFileSync(SRC, "utf8");
const m = html.match(/<script type="__bundler\/manifest">([\s\S]*?)<\/script>/);
const manifest = JSON.parse(m[1]);

// Luminance-key the near-black background to true transparency, keeping the
// statue + violet ring. lo = fully transparent below, hi = fully opaque above.
const items = [
  { uuid: "6df7be06-25a0-46a0-99dc-2ee8efffbab3", out: "stoic-bust.webp", w: 1120, lo: 10, hi: 46 },
  { uuid: "d4e7aa9e-a2cd-4040-b169-910071ec39bd", out: "koumian-mark.webp", w: 420, lo: 10, hi: 46 },
];

for (const it of items) {
  const e = manifest[it.uuid];
  let buf = Buffer.from(e.data, "base64");
  if (e.compressed) buf = zlib.gunzipSync(buf);

  const { data, info } = await sharp(buf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  const span = it.hi - it.lo;
  for (let i = 0; i < data.length; i += ch) {
    const v = Math.max(data[i], data[i + 1], data[i + 2]); // brightness
    let a = v <= it.lo ? 0 : v >= it.hi ? 255 : Math.round(((v - it.lo) / span) * 255);
    if (a < data[i + 3]) data[i + 3] = a;
  }

  const r = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: ch },
  })
    .resize({ width: it.w, withoutEnlargement: true })
    .webp({ quality: 84, alphaQuality: 92 })
    .toFile(`${PUB}/${it.out}`);
  console.log(it.out, (r.size / 1024).toFixed(0) + "KB", info.width + "x" + info.height);
}
