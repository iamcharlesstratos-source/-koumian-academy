// Generates PWA app icons (192 + 512) from the badged logo.
// Run: node scripts/make-pwa-icons.mjs
import sharp from "sharp";

const src = "public/logo-badge.png";

await sharp(src).resize(192, 192, { fit: "cover" }).png().toFile("public/pwa-192.png");
await sharp(src).resize(512, 512, { fit: "cover" }).png().toFile("public/pwa-512.png");

console.log("PWA icons written: public/pwa-192.png, public/pwa-512.png");
