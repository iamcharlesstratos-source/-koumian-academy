// Generate brand marks from public/logo.png:
//   • public/logo-badge.png  — PERFECT CIRCLE medallion (nav logo)
//   • app/icon.png           — rounded-square app tile (favicon, 512)
//   • app/apple-icon.png     — rounded-square app tile (180)
//
// The source logo.png has uneven transparent padding (content is off-center),
// so we TRIM to the real content bounding box, then composite it perfectly
// centered. This guarantees the philosopher sits dead-center in the circle.
//
// Usage:  node scripts/make-favicon.mjs

import sharp from "sharp";
import path from "node:path";

const PUBLIC = path.resolve(process.cwd(), "public");
const APP = path.resolve(process.cwd(), "app");
const LOGO = path.join(PUBLIC, "logo.png");
const SIZE = 512;

// Trim transparent padding → tight content, then scale to `heightPct` of the
// canvas and return the buffer + centered top/left offsets.
async function centeredLogo(heightPct) {
  const trimmed = await sharp(LOGO)
    .trim()
    .toBuffer({ resolveWithObject: true });

  const targetH = Math.round(SIZE * heightPct);
  const targetW = Math.round(
    (targetH * trimmed.info.width) / trimmed.info.height
  );

  const buf = await sharp(trimmed.data)
    .resize(targetW, targetH, { fit: "fill" })
    .toBuffer();

  return {
    buf,
    top: Math.round((SIZE - targetH) / 2),
    left: Math.round((SIZE - targetW) / 2),
  };
}

// ─── 1. Perfect circle medallion (nav logo) ───
{
  const r = SIZE / 2;
  const bg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
       <circle cx="${r}" cy="${r}" r="${r}" fill="#0F0F14"/>
     </svg>`
  );
  const { buf, top, left } = await centeredLogo(0.84);
  await sharp(bg)
    .composite([{ input: buf, top, left }])
    .png()
    .toFile(path.join(PUBLIC, "logo-badge.png"));
}

// ─── 2. Rounded-square app tile (favicon) ───
{
  const radius = Math.round(SIZE * 0.22);
  const bg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
       <rect width="${SIZE}" height="${SIZE}" rx="${radius}" ry="${radius}" fill="#0F0F14"/>
     </svg>`
  );
  const { buf, top, left } = await centeredLogo(0.74);
  const tile = await sharp(bg)
    .composite([{ input: buf, top, left }])
    .png()
    .toBuffer();

  await sharp(tile).toFile(path.join(APP, "icon.png"));
  await sharp(tile).resize(180, 180).toFile(path.join(APP, "apple-icon.png"));
}

console.log(
  "\n  ✓  logo-badge.png (centered circle) + app/icon.png + app/apple-icon.png\n"
);
