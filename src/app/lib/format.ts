export const usd = (n: number | undefined | null, digits = 2) =>
  n == null || !Number.isFinite(n)
    ? '–'
    : n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: digits, maximumFractionDigits: digits })

/** Plain number with a sensible number of decimals for its size. */
export const num = (n: number | undefined | null, max = 6) => {
  if (n == null || !Number.isFinite(n)) return '–'
  const digits = n === 0 ? 0 : Math.abs(n) >= 1000 ? 2 : Math.abs(n) >= 1 ? Math.min(max, 5) : max
  return n.toLocaleString('en-US', { maximumFractionDigits: digits })
}

export const pct = (n: number | undefined | null, digits = 2) =>
  n == null || !Number.isFinite(n) ? '–' : `${n > 0 ? '+' : ''}${n.toFixed(digits)}%`

export const compact = (n: number | undefined | null) =>
  n == null || !Number.isFinite(n) ? '–' : `$${Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)}`

export const short = (s: string, head = 4, tail = 4) => (s.length <= head + tail + 1 ? s : `${s.slice(0, head)}…${s.slice(-tail)}`)

export function ago(iso: string | number | undefined) {
  if (!iso) return ''
  const t = typeof iso === 'number' ? iso : Date.parse(iso)
  const s = Math.max(0, Math.round((Date.now() - t) / 1000))
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.round(s / 60)} min ago`
  if (s < 86400) return `${Math.round(s / 3600)} h ago`
  return new Date(t).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const solscanTx = (sig: string) => `https://solscan.io/tx/${sig}`
export const solscanAccount = (a: string) => `https://solscan.io/account/${a}`
export const solscanToken = (m: string) => `https://solscan.io/token/${m}`
