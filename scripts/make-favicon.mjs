// Generate app/icon.png + app/apple-icon.png from public/logo.png by compositing
// the transparent philosopher logo onto a black circular background.
//
// Usage:  node scripts/make-favicon.mjs

import sharp from "sharp";
import path from "node:path";

const PUBLIC = path.resolve(process.cwd(), "public");
const APP = path.resolve(process.cwd(), "app");
const LOGO = path.join(PUBLIC, "logo.png");

const SIZE = 512;
const R = SIZE / 2;

// Black circle background (near-black brand ink) with a faint violet ring.
const bg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
     <circle cx="${R}" cy="${R}" r="${R}" fill="#0F0F14"/>
     <circle cx="${R}" cy="${R}" r="${R - 6}" fill="none"
             stroke="#7C3AED" stroke-width="6" stroke-opacity="0.35"/>
   </svg>`
);

// Scale the logo so the philosopher + its violet ring sit comfortably inside.
const logoSize = Math.round(SIZE * 0.96);
const resizedLogo = await sharp(LOGO)
  .resize(logoSize, logoSize, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .toBuffer();

const offset = Math.round((SIZE - logoSize) / 2);

const composited = await sharp(bg)
  .composite([{ input: resizedLogo, top: offset, left: offset }])
  .png()
  .toBuffer();

// Next.js App Router auto-serves these as favicon + apple touch icon.
await sharp(composited).toFile(path.join(APP, "icon.png"));
await sharp(composited).resize(180, 180).toFile(path.join(APP, "apple-icon.png"));

// Also save a badged version in public/ for any direct use.
await sharp(composited).toFile(path.join(PUBLIC, "logo-badge.png"));

console.log("\n  ✓  Generated app/icon.png (512), app/apple-icon.png (180),");
console.log("     and public/logo-badge.png\n");
