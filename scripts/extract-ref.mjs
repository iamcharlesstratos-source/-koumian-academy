import fs from "fs";

const SRC = "C:/Users/Administrator/Downloads/Koumian-Academy-standalone.html";
const OUT = "C:/Users/Administrator/Downloads/koumian-ref-template.html";

const html = fs.readFileSync(SRC, "utf8");
const m = html.match(
  /<script type="__bundler\/template">([\s\S]*?)<\/script>/
);
if (!m) {
  console.error("template script not found");
  process.exit(1);
}
let tpl;
try {
  tpl = JSON.parse(m[1]);
} catch (e) {
  console.error("JSON.parse failed:", e.message);
  // fall back to raw
  tpl = m[1];
}
if (typeof tpl !== "string") tpl = JSON.stringify(tpl, null, 2);
fs.writeFileSync(OUT, tpl, "utf8");
console.log("OK length=" + tpl.length + " -> " + OUT);
