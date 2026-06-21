import fs from "fs";
import zlib from "zlib";

const SRC = "C:/Users/Administrator/Downloads/Koumian-Academy-standalone.html";
const PUB = "C:/Users/Administrator/Documents/Koumi Bootcamp/public";

const html = fs.readFileSync(SRC, "utf8");
const m = html.match(/<script type="__bundler\/manifest">([\s\S]*?)<\/script>/);
if (!m) {
  console.error("manifest not found");
  process.exit(1);
}
const manifest = JSON.parse(m[1]);

const want = {
  "d4e7aa9e-a2cd-4040-b169-910071ec39bd": "koumian-mark",
  "6df7be06-25a0-46a0-99dc-2ee8efffbab3": "stoic-bust",
};

for (const [uuid, name] of Object.entries(want)) {
  const e = manifest[uuid];
  if (!e) {
    console.log("MISSING", uuid);
    continue;
  }
  let bytes = Buffer.from(e.data, "base64");
  if (e.compressed) {
    try {
      bytes = zlib.gunzipSync(bytes);
    } catch (err) {
      console.log("gunzip failed for", uuid, err.message);
    }
  }
  const mime = e.mime || "";
  const ext = mime.includes("png")
    ? "png"
    : mime.includes("webp")
    ? "webp"
    : mime.includes("svg")
    ? "svg"
    : mime.includes("jpeg") || mime.includes("jpg")
    ? "jpg"
    : "png";
  const out = `${PUB}/${name}.${ext}`;
  fs.writeFileSync(out, bytes);
  console.log("wrote", out, mime, bytes.length, "bytes");
}
