// Generate brand marks from public/logo.png:
//   • public/logo-badge.png  — PERFECT CIRCLE medallion (used in the nav logo)
//   • app/icon.png           — rounded-square app tile (favicon, 512)
//   • app/apple-icon.png     — rounded-square app tile (180, iOS home screen)
//
// Usage:  node scripts/make-favicon.mjs

import sharp from "sharp";
import path from "node:path";

const PUBLIC = path.resolve(process.cwd(), "public");
const APP = path.resolve(process.cwd(), "app");
const LOGO = path.join(PUBLIC, "logo.png");
const SIZE = 512;

async function fitLogo(scale) {
  const s = Math.round(SIZE * scale);
  const buf = await sharp(LOGO)
    .resize(s, s, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  return { buf, offset: Math.round((SIZE - s) / 2) };
}

// ─── 1. Perfect circle medallion for the nav ───
// Black circle that fills the whole square edge-to-edge (so it lines up exactly
// with a rounded-full container). No extra ring — the logo already has its own
// violet ring baked in, so we avoid a doubled outline.
{
  const r = SIZE / 2;
  const bg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
       <circle cx="${r}" cy="${r}" r="${r}" fill="#0F0F14"/>
     </svg>`
  );
  const { buf, offset } = await fitLogo(0.98);
  await sharp(bg)
    .composite([{ input: buf, top: offset, left: offset }])
    .png()
    .toFile(path.join(PUBLIC, "logo-badge.png"));
}

// ─── 2. Rounded-square app tile for the favicon ───
// Modern "app icon" look — black squircle filling the tile, philosopher centered.
{
  const radius = Math.round(SIZE * 0.22); // ~iOS squircle corner
  const bg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
       <rect width="${SIZE}" height="${SIZE}" rx="${radius}" ry="${radius}" fill="#0F0F14"/>
     </svg>`
  );
  const { buf, offset } = await fitLogo(0.82);
  const tile = await sharp(bg)
    .composite([{ input: buf, top: offset, left: offset }])
    .png()
    .toBuffer();

  await sharp(tile).toFile(path.join(APP, "icon.png"));
  await sharp(tile).resize(180, 180).toFile(path.join(APP, "apple-icon.png"));
}

console.log("\n  ✓  logo-badge.png (perfect circle) + app/icon.png + app/apple-icon.png (rounded square)\n");
