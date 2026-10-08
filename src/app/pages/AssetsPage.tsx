import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { AssetBadge, Notice, PageHead, Panel, Skeleton } from '../components/ui'
import { ASSETS, CATEGORIES, type AssetCategory } from '../lib/assets'
import { compact, pct, usd } from '../lib/format'
import { usePrices } from '../hooks'
import { cx } from '@/lib/cx'

type Sort = 'default' | 'change' | 'liquidity'

export default function AssetsPage() {
  const prices = usePrices()
  const navigate = useNavigate()
  const [cat, setCat] = useState<AssetCategory | 'All'>('All')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<Sort>('default')

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = ASSETS.filter((a) => (cat === 'All' || a.category === cat) && (!q || a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q))).map((a) => ({
      asset: a,
      p: prices.data?.[a.mint] ?? undefined,
    }))
    if (sort === 'change') return list.toSorted((x, y) => (y.p?.priceChange24h ?? -1e9) - (x.p?.priceChange24h ?? -1e9))
    if (sort === 'liquidity') return list.toSorted((x, y) => (y.p?.liquidity ?? 0) - (x.p?.liquidity ?? 0))
    return list
  }, [cat, query, sort, prices.data])

  return (
    <div className="flex flex-col gap-8">
      <PageHead title="Assets" sub="Everything you can receive for XMR. Prices and liquidity come live from Jupiter and refresh every 30 seconds." />

      <div className="flex flex-col xs:flex-row gap-3 xs:items-center xs:justify-between">
        <div className="flex gap-2 overflow-x-auto [scrollbar-width:none]" role="tablist" aria-label="Category">
          {(['All', ...CATEGORIES] as const).map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={cat === c}
              onClick={() => setCat(c)}
              className={cx(
                'whitespace-nowrap rounded-full px-4 py-2 text-label-sm transition',
                cat === c ? 'bg-ink-10 text-white' : 'bg-white text-ink-30 border border-veil-black-16 hover:text-darkest',
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            aria-label="Search assets"
            className="w-full xs:w-44 rounded-full border border-veil-black-16 bg-white px-4 py-2 text-body-sm outline-none focus:border-[color:var(--color-highlighted)]"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            aria-label="Sort"
            className="rounded-full border border-veil-black-16 bg-white px-3 py-2 text-body-sm"
          >
            <option value="default">Default order</option>
            <option value="change">24h change</option>
            <option value="liquidity">Liquidity</option>
          </select>
        </div>
      </div>

      {prices.error && <Notice tone="error">Prices are unavailable right now. Jupiter did not respond.</Notice>}

      <Panel>
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="text-label-sm text-ink-50">
                <th className="pb-3 font-medium">Asset</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium text-right">Price</th>
                <th className="pb-3 font-medium text-right">24h</th>
                <th className="pb-3 font-medium text-right">Liquidity</th>
                <th className="pb-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map(({ asset, p }) => (
                <tr
                  key={asset.symbol}
                  onClick={() => navigate(`/app/assets/${asset.symbol}`)}
                  className="cursor-pointer border-t border-veil-black-16 transition hover:bg-ink-98"
                >
                  <td className="py-3 pr-4">
                    <Link to={`/app/assets/${asset.symbol}`} className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                      <AssetBadge asset={asset} size={32} />
                      <span>
                        <span className="block text-label-md text-darkest">{asset.symbol}</span>
                        <span className="block text-body-sm text-ink-50">{asset.name}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-body-sm text-ink-30">{asset.category}</td>
                  <td className="py-3 pr-4 text-right text-label-md text-darkest">{p ? usd(p.usdPrice) : <Skeleton className="h-4 w-16" />}</td>
                  <td className={cx('py-3 pr-4 text-right text-body-sm', (p?.priceChange24h ?? 0) >= 0 ? 'text-[#1d6b3a]' : 'text-[#9b2c1f]')}>{pct(p?.priceChange24h)}</td>
                  <td className="py-3 pr-4 text-right text-body-sm text-ink-30">{compact(p?.liquidity)}</td>
                  <td className="py-3 text-right">
                    <Link
                      to={`/app?asset=${asset.symbol}`}
                      onClick={(e) => e.stopPropagation()}
                      className="btn state-layer btn-bg-secondary px-3 py-1.5 text-label-sm whitespace-nowrap"
                    >
                      {asset.symbol === 'SOL' ? 'Get SOL' : 'Buy with XMR'}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <p className="py-8 text-center text-body-sm text-ink-50">No asset matches.</p>}
        </div>
      </Panel>
    </div>
  )
}
