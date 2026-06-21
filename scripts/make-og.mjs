import sharp from "sharp";

const W = 1200;
const H = 630;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="g" cx="50%" cy="36%" r="62%">
      <stop offset="0%" stop-color="#7C3AED" stop-opacity="0.45"/>
      <stop offset="60%" stop-color="#7C3AED" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="t" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F6F4FB"/>
      <stop offset="100%" stop-color="#C9B6FF"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#09080E"/>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <circle cx="600" cy="232" r="118" fill="none" stroke="#7C3AED" stroke-width="3" opacity="0.85"/>
  <circle cx="600" cy="232" r="102" fill="none" stroke="#9B6BFF" stroke-width="1.5" opacity="0.5"/>
  <text x="600" y="262" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-weight="700" font-size="120" fill="url(#t)">K</text>
  <text x="600" y="430" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-weight="600" font-size="96" fill="url(#t)">Koumian Academy</text>
  <text x="600" y="500" text-anchor="middle" font-family="Arial,sans-serif" font-weight="600" font-size="24" letter-spacing="16" fill="#7C3AED">EDUCATION · CHARACTER · LEGACY</text>
</svg>`;

await sharp(Buffer.from(svg))
  .png()
  .toFile("C:/Users/Administrator/Documents/Koumi Bootcamp/public/og.png");
console.log("wrote public/og.png");
