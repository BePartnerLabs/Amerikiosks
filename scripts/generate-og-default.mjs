/**
 * Regenerates `public/og-default.png`, the site-wide OpenGraph fallback image.
 *
 * It exists because social crawlers (Facebook, X, LinkedIn, WhatsApp) do not
 * render SVG, so the previous `/logos/logo-1.svg` fallback meant every page
 * without its own SEO image shared with no preview image at all.
 *
 * Run with: node scripts/generate-og-default.mjs
 */
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = fileURLToPath(new URL('..', import.meta.url))

// Brand navy, taken from the logo artwork itself (`.cls-2` in logo-1.svg).
const BACKGROUND = '#081a34'
const WIDTH = 1200
const HEIGHT = 630
// Wordmark width as a share of the canvas — enough presence without crowding
// the edges when platforms crop the card.
const LOGO_WIDTH = Math.round(WIDTH * 0.66)

const source = await readFile(`${root}public/logos/logo-header.svg`, 'utf8')

// The wordmark's text is `fill: currentColor` so it can adapt to its context;
// rasterized standalone that resolves to black, which is invisible on navy.
const svg = source.replace(/currentColor/g, '#ffffff')

const logo = await sharp(Buffer.from(svg), { density: 600 })
  .resize({ width: LOGO_WIDTH })
  .png()
  .toBuffer()

const png = await sharp({
  create: {
    width: WIDTH,
    height: HEIGHT,
    channels: 4,
    background: BACKGROUND,
  },
})
  .composite([{ input: logo, gravity: 'center' }])
  .png()
  .toBuffer()

await writeFile(`${root}public/og-default.png`, png)

const { width, height, size } = await sharp(png).metadata()
console.log(`og-default.png written: ${width}x${height}, ${Math.round((size ?? 0) / 1024)}KB`)
