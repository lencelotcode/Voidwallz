/**
 * Generates PWA + social images from the vector logo:
 *   public/pwa-icon-192.png / public/pwa-icon-512.png   (manifest icons)
 *   public/pwa-icon-maskable-512.png                    (Android adaptive icon, safe zone padded)
 *   public/apple-touch-icon.png                         (180px, opaque — iOS dislikes transparency)
 *   public/og-image.png                                 (1200x630 link-preview card)
 *
 * Run: npm i --no-save sharp && node scripts/generate-pwa-assets.mjs
 */
import sharp from "sharp";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const logoBuffer = readFileSync(join(root, "public", "Mainlogo.svg"));
const BACKGROUND = "#050505";

async function iconWithPadding(size, scale = 0.82) {
  const inner = Math.round(size * scale);
  const pad = Math.round((size - inner) / 2);
  const resized = await sharp(logoBuffer, { density: 300 })
    .resize(inner, inner)
    .png()
    .toBuffer();
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BACKGROUND,
    },
  })
    .composite([{ input: resized, top: pad, left: pad }])
    .png()
    .toFile(join(root, "public", `pwa-icon-${size}.png`));
}

await iconWithPadding(192);
await iconWithPadding(512);

// Maskable icons are cropped to a circle by launchers: keep the mark inside
// the inner 80% safe zone on an opaque background.
const maskableInner = Math.round(512 * 0.68);
const maskablePad = Math.round((512 - maskableInner) / 2);
const maskableLogo = await sharp(logoBuffer, { density: 300 })
  .resize(maskableInner, maskableInner)
  .png()
  .toBuffer();
await sharp({
  create: { width: 512, height: 512, channels: 4, background: BACKGROUND },
})
  .composite([{ input: maskableLogo, top: maskablePad, left: maskablePad }])
  .png()
  .toFile(join(root, "public", "pwa-icon-maskable-512.png"));

// Apple touch icon: opaque, near-full bleed
const appleLogo = await sharp(logoBuffer, { density: 300 })
  .resize(160, 160)
  .png()
  .toBuffer();
await sharp({
  create: { width: 180, height: 180, channels: 4, background: BACKGROUND },
})
  .composite([{ input: appleLogo, top: 10, left: 10 }])
  .png()
  .toFile(join(root, "public", "apple-touch-icon.png"));

// Open Graph link-preview card 1200x630
const ogLogo = await sharp(logoBuffer, { density: 300 })
  .resize(360, 360)
  .png()
  .toBuffer();
await sharp({
  create: { width: 1200, height: 630, channels: 4, background: BACKGROUND },
})
  .composite([
    { input: ogLogo, top: 135, left: 420 },
    {
      input: Buffer.from(
        `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
           <text x="600" y="580" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="64" fill="#e5e5e5">voidwallz</text>
         </svg>`,
      ),
      top: 0,
      left: 0,
    },
  ])
  .png()
  .toFile(join(root, "public", "og-image.png"));

console.log("PWA + OG assets generated in public/");
