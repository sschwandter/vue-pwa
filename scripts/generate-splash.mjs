// Generates iOS launch ("apple-touch-startup-image") screens from public/logo.svg
// and injects the matching <link> tags into index.html between the
// <!-- apple-splash:start --> / <!-- apple-splash:end --> markers.
//
// Run with: npm run generate-pwa-splash
import { mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const logoPath = join(root, "public", "logo.svg");
const outDir = join(root, "public", "apple-splash");
const indexPath = join(root, "index.html");

// Surface colors — must match --surface in src/style.css.
const SCHEMES = [
  { name: "light", bg: { r: 245, g: 245, b: 245, alpha: 1 } }, // #f5f5f5
  { name: "dark", bg: { r: 28, g: 28, b: 30, alpha: 1 } }, // #1c1c1e
];

// Portrait CSS dimensions + device-pixel-ratio for current-ish iPhonesiPads.
// iOS picks the image whose media query matches device-width/height/dpr.
const DEVICES = [
  [375, 667, 2], // iPhone SE 2/3, 6/7/8
  [414, 736, 3], // iPhone 8 Plus
  [375, 812, 3], // iPhone X/XS/11 Pro, 12/13 mini
  [414, 896, 2], // iPhone XR/11
  [414, 896, 3], // iPhone XS Max/11 Pro Max
  [390, 844, 3], // iPhone 12/13/14
  [428, 926, 3], // iPhone 12/13 Pro Max, 14 Plus
  [393, 852, 3], // iPhone 14 Pro, 15/15 Pro, 16
  [430, 932, 3], // iPhone 14 Pro Max, 15 Plus/Pro Max, 16 Plus
  [402, 874, 3], // iPhone 16 Pro
  [440, 956, 3], // iPhone 16 Pro Max
  [768, 1024, 2], // iPad mini / 9.7"
  [810, 1080, 2], // iPad 10.2"
  [820, 1180, 2], // iPad Air 10.9"
  [834, 1194, 2], // iPad Pro 11"
  [1024, 1366, 2], // iPad Pro 12.9"
];

const logoSvg = await readFile(logoPath);
await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const links = [];

for (const [w, h, dpr] of DEVICES) {
  const pxW = w * dpr;
  const pxH = h * dpr;
  // Logo ~30% of the shorter edge, centered.
  const logoPx = Math.round(Math.min(pxW, pxH) * 0.3);
  const logo = await sharp(logoSvg, { density: 384 })
    .resize(logoPx, logoPx, { fit: "contain" })
    .png()
    .toBuffer();

  for (const { name, bg } of SCHEMES) {
    const dark = name === "dark";
    const file = `splash-${pxW}x${pxH}${dark ? "-dark" : ""}.png`;
    await sharp({ create: { width: pxW, height: pxH, channels: 4, background: bg } })
      .composite([{ input: logo, gravity: "center" }])
      .png()
      .toFile(join(outDir, file));

    const scheme = ` and (prefers-color-scheme: ${name})`;
    links.push(
      `    <link rel="apple-touch-startup-image" media="screen and ` +
        `(device-width: ${w}px) and (device-height: ${h}px) and ` +
        `(-webkit-device-pixel-ratio: ${dpr}) and (orientation: portrait)${scheme}" ` +
        `href="/apple-splash/${file}" />`
    );
  }
}

// Inject the generated tags into index.html between the markers.
const start = "<!-- apple-splash:start -->";
const end = "<!-- apple-splash:end -->";
const html = await readFile(indexPath, "utf8");
const block = `${start}\n${links.join("\n")}\n    ${end}`;
const replaced = html.replace(
  new RegExp(`${start}[\\s\\S]*?${end}`),
  block
);
if (replaced === html && !html.includes(start)) {
  throw new Error(
    `Markers not found in index.html. Add:\n    ${start}\n    ${end}\n inside <head>.`
  );
}
await writeFile(indexPath, replaced);

console.log(
  `Generated ${DEVICES.length * SCHEMES.length} splash images in public/apple-splash and injected ${links.length} <link> tags into index.html.`
);
