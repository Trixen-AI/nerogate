// Builds the share image and app icons from the logo source and the brand font.
//   public/og-image.png          1200x630 (Open Graph / X card)
//   public/apple-touch-icon.png  180x180
//   public/icon-192.png, public/icon-512.png (web manifest)
// Run: node scripts/build-social.mjs   (after scripts/build-logo.mjs)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import opentype from 'opentype.js'
import { Resvg } from '@resvg/resvg-js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const fontPath = (w) => path.join(root, `node_modules/@fontsource/hanken-grotesk/files/hanken-grotesk-latin-${w}-normal.woff`)
const load = (w) => opentype.parse(fs.readFileSync(fontPath(w)).buffer.slice(0))
const display = load(500)
const text = load(400)

const src = fs.readFileSync(path.join(root, 'src/components/brand/logoPaths.ts'), 'utf8')
const pick = (name) => new RegExp(`${name} = '([^']+)'`).exec(src)[1]
const LOGO_W = Number(/LOGO_WIDTH = (\d+)/.exec(src)[1])
const ARCH = pick('MARK_ARCH')
const ARROW = pick('MARK_ARROW')
const WORD = pick('WORDMARK')

const INK = '#0b0907'
const EMBER_LIGHT = '#ff7a33'

/** Outline a line of text to a path, returning the path data and its width. */
function line(font, str, x, y, size, tracking = -0.02) {
  let cx = x
  let d = ''
  for (const ch of str) {
    const g = font.charToGlyph(ch)
    d += g.getPath(cx, y, size).toPathData(2)
    cx += (g.advanceWidth / font.unitsPerEm) * size + tracking * size
  }
  return { d, width: cx - x }
}

const logo = (x, y, scale) =>
  `<g transform="translate(${x} ${y}) scale(${scale})">` +
  `<path d="${ARCH}" fill="none" stroke="${EMBER_LIGHT}" stroke-width="4.6" stroke-linecap="round"/>` +
  `<path d="${ARROW}" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<path d="${WORD}" fill="#fff"/></g>`

// ---------- share image ----------
const W = 1200
const H = 630
const dots = []
// a dotted horizon, like the hero
for (let i = 0; i < 900; i++) {
  const t = i / 900
  const ang = Math.PI * (0.06 + 0.88 * t)
  const ring = 1 + ((i * 37) % 7) * 0.035
  const R = 900 * ring
  const x = W / 2 + Math.cos(ang) * R * -1
  const y = 1390 - Math.sin(ang) * R
  if (y > 300 && y < H + 10 && x > -10 && x < W + 10) dots.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1 + (i % 3) * 0.4).toFixed(1)}" fill="#ffc4a0" opacity="${(0.18 + (i % 5) * 0.08).toFixed(2)}"/>`)
}
const h1 = line(display, 'Monero in.', 80, 300, 92)
const h2 = line(display, 'Real-world assets out.', 80, 404, 92)
const sub = line(text, 'The private on-ramp to tokenized stocks, ETFs and gold on Solana.', 82, 478, 30, 0)
const domain = line(text, 'nerogate.org', 0, 0, 28, 0)

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="g" cx="0.78" cy="1.05" r="0.75"><stop offset="0" stop-color="${EMBER_LIGHT}" stop-opacity="0.55"/><stop offset="1" stop-color="${EMBER_LIGHT}" stop-opacity="0"/></radialGradient>
    <linearGradient id="v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#1a0d06"/></linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#v)"/>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  ${dots.join('')}
  ${logo(80, 72, 1.25)}
  <path d="${h1.d}" fill="#fff"/>
  <path d="${h2.d}" fill="#fff"/>
  <path d="${sub.d}" fill="#dcd2c7"/>
  <g transform="translate(${W - 80 - domain.width} ${H - 64})"><path d="${domain.d}" fill="${EMBER_LIGHT}"/></g>
</svg>`

// ---------- square icons: the mark on ink ----------
const icon = (size, pad) => {
  const s = (size - pad * 2) / 36
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${INK}"/>
  <g transform="translate(${pad} ${pad}) scale(${s})">
    <path d="${ARCH}" fill="none" stroke="${EMBER_LIGHT}" stroke-width="4.6" stroke-linecap="round"/>
    <path d="${ARROW}" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
  </g></svg>`
}

const out = (svg, file) => fs.writeFileSync(path.join(root, 'public', file), new Resvg(svg, { fitTo: { mode: 'original' } }).render().asPng())
out(og, 'og-image.png')
out(icon(180, 30), 'apple-touch-icon.png')
out(icon(192, 32), 'icon-192.png')
out(icon(512, 86), 'icon-512.png')
console.log('og-image 1200x630, icons 180/192/512 (logo width', LOGO_W + ')')
