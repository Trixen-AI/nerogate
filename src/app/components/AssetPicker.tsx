import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { ASSETS, CATEGORIES, type Asset } from '../lib/assets'
import { usd } from '../lib/format'
import { useMarkets } from '../hooks'
import { AssetBadge } from './ui'

/** "You want" selector: grouped like the concept (Index ETFs, Commodities, Stocks, Stablecoin, Native). */
export function AssetPicker({ value, onChange, exclude }: { value: Asset; onChange: (a: Asset) => void; exclude?: string[] }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const prices = useMarkets()
  const root = useRef<HTMLDivElement>(null)
  const listId = useId()

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    return CATEGORIES.map((c) => ({
      category: c,
      items: ASSETS.filter(
        (a) =>
          a.category === c &&
          !exclude?.includes(a.symbol) &&
          (!q || a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)),
      ),
    })).filter((g) => g.items.length)
  }, [query, exclude])

  const price = prices.data?.[value.symbol]?.usdPrice

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 rounded-2xl border border-veil-black-16 bg-white px-4 py-3 text-left transition hover:border-[color:var(--color-highlighted)]"
      >
        <AssetBadge asset={value} />
        <span className="flex flex-col flex-1 min-w-0">
          <span className="text-title-sm text-darkest leading-tight">{value.symbol}</span>
          <span className="text-body-sm text-ink-50 truncate">
            {value.name} · {value.category}
          </span>
        </span>
        <span className="text-body-sm text-ink-30">{usd(price)}</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={open ? 'rotate-180 transition' : 'transition'}>
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-full rounded-3xl border border-veil-black-16 bg-white shadow-xl overflow-hidden">
          <div className="p-3 border-b border-veil-black-16">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ticker or name"
              aria-label="Search assets"
              className="w-full rounded-xl bg-ink-98 px-3 py-2 text-body-sm outline-none focus:ring-2 focus:ring-[#ff7a3333]"
            />
          </div>
          <div id={listId} role="listbox" className="max-h-[360px] overflow-y-auto p-2">
            {groups.map((g) => (
              <div key={g.category} className="pb-2">
                <p className="px-3 pt-2 pb-1 text-label-sm text-ink-50">{g.category}</p>
                {g.items.map((a) => (
                  <button
                    key={a.symbol}
                    type="button"
                    role="option"
                    aria-selected={a.symbol === value.symbol}
                    onClick={() => {
                      onChange(a)
                      setOpen(false)
                      setQuery('')
                    }}
                    className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-ink-98 ${a.symbol === value.symbol ? 'bg-[#fdf1e8]' : ''}`}
                  >
                    <AssetBadge asset={a} size={30} />
                    <span className="flex-1">
                      <span className="block text-label-md text-darkest leading-tight">{a.symbol}</span>
                      <span className="block text-body-sm text-ink-50">{a.name}</span>
                    </span>
                    <span className="text-body-sm text-ink-30">{usd(prices.data?.[a.symbol]?.usdPrice)}</span>
                  </button>
                ))}
              </div>
            ))}
            {!groups.length && <p className="px-3 py-6 text-body-sm text-ink-50 text-center">No asset matches “{query}”.</p>}
          </div>
        </div>
      )}
    </div>
  )
}
