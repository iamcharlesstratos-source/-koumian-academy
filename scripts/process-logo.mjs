// One-off script: read a source logo image (jpg/png) and write a transparent
// PNG to public/logo.png. Auto-detects whether the background is white or black
// based on the four corners and removes that color.
//
// Usage:
//   node scripts/process-logo.mjs                   # default: public/logo.jpg
//   node scripts/process-logo.mjs logo2.jpg         # custom input filename
//   node scripts/process-logo.mjs logo2.jpg cool.png  # custom output filename

import sharp from "sharp";
import path from "node:path";

const args = process.argv.slice(2);
const PUBLIC = path.resolve(process.cwd(), "public");
const INPUT = path.join(PUBLIC, args[0] ?? "logo.jpg");
const OUTPUT = path.join(PUBLIC, args[1] ?? "logo.png");

const { data, info } = await sharp(INPUT)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const pixels = new Uint8ClampedArray(data);
const w = info.width;
const h = info.height;

// Sample the four corners to detect background color (light vs dark).
function pixelAt(x, y) {
  const i = (y * w + x) * 4;
  return Math.max(pixels[i], pixels[i + 1], pixels[i + 2]);
}
const cornerBrightness =
  (pixelAt(0, 0) +
    pixelAt(w - 1, 0) +
    pixelAt(0, h - 1) +
    pixelAt(w - 1, h - 1)) /
  4;
const isDarkBackground = cornerBrightness < 128;

// Cutoffs are deliberately TIGHT for dark backgrounds: photographic philosopher
// shadows can dip into the 20-40 brightness range, so we must only treat
// near-pure-black pixels as background. For light bgs we can be more generous
// since marble highlights are nearly pure white.
const cutoff = isDarkBackground ? 8 : 230;
const FEATHER = isDarkBackground ? 12 : 25;

let removed = 0;
let kept = 0;

for (let i = 0; i < pixels.length; i += 4) {
  const r = pixels[i];
  const g = pixels[i + 1];
  const b = pixels[i + 2];
  const brightness = Math.max(r, g, b);

  if (isDarkBackground) {
    // Background is dark → low brightness = background
    if (brightness <= cutoff) {
      pixels[i + 3] = 0;
      removed++;
    } else if (brightness <= cutoff + FEATHER) {
      const t = (brightness - cutoff) / FEATHER; // 0 at cutoff, 1 at cutoff+FEATHER
      pixels[i + 3] = Math.round(255 * t);
      kept++;
    } else {
      pixels[i + 3] = 255;
      kept++;
    }
  } else {
    // Background is white → high brightness = background
    if (brightness >= cutoff) {
      pixels[i + 3] = 0;
      removed++;
    } else if (brightness >= cutoff - FEATHER) {
      const t = (cutoff - brightness) / FEATHER; // 0 at cutoff, 1 at cutoff-FEATHER
      pixels[i + 3] = Math.round(255 * t);
      kept++;
    } else {
      pixels[i + 3] = 255;
      kept++;
    }
  }
}

await sharp(Buffer.from(pixels), {
  raw: {
    width: w,
    height: h,
    channels: 4,
  },
})
  .png({ compressionLevel: 9 })
  .toFile(OUTPUT);

console.log(`\n  ✓  Wrote ${OUTPUT}`);
console.log(
  `     Background: ${isDarkBackground ? "DARK (black)" : "LIGHT (white)"} (corner brightness avg: ${cornerBrightness.toFixed(0)})`
);
console.log(`     Pixels:  ${pixels.length / 4} total`);
console.log(`     Removed: ${removed}  (background → transparent)`);
console.log(`     Kept:    ${kept}\n`);
