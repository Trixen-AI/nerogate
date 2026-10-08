/**
 * Prefix every id inside an inlined SVG file (and its url(#…)/href references) so several brand files
 * can share one page without their gradients or clip paths colliding. Artwork is unchanged.
 */
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export function scopeSvgIds(raw: string, prefix: string) {
  const ids = [...raw.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])
  let out = raw.replace(/<\?xml[^>]*>/, '')
  for (const id of ids) {
    const esc = escapeRe(id)
    out = out
      .replace(new RegExp(`id="${esc}"`, 'g'), `id="${prefix}-${id}"`)
      .replace(new RegExp(`url\\(#${esc}\\)`, 'g'), `url(#${prefix}-${id})`)
      .replace(new RegExp(`href="#${esc}"`, 'g'), `href="#${prefix}-${id}"`)
  }
  return out
}
