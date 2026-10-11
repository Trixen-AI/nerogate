import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { AssetPicker } from '../components/AssetPicker'
import { BuyPanel } from '../components/BuyPanel'
import { ActionButton, AssetBadge, inputCls, Notice, PageHead, Panel, Skeleton } from '../components/ui'
import { WalletButton } from '../components/WalletButton'
import { ASSETS, assetBySymbol, isNative, type Asset } from '../lib/assets'
import { etherscanAddress, num, pct, short, usd } from '../lib/format'
import { isWalletAddress } from '../lib/holdings'
import { useHoldings, useMarkets } from '../hooks'
import { useWallet } from '../wallet'
import { cx } from '@/lib/cx'

const BAR = ['#c8400c', '#19140f', '#ff8a4c', '#877d73', '#f7c29c', '#4b443d', '#e8590c', '#d8cfc5']

export default function PortfolioPage() {
  const { address: own } = useWallet()
  const [params, setParams] = useSearchParams()
  const watch = params.get('address') ?? ''
  const address = watch && isWalletAddress(watch) ? watch : own
  const viewingOwn = !!own && !!address && address.toLowerCase() === own.toLowerCase()

  const holdings = useHoldings(address)
  const markets = useMarkets()
  const [watchText, setWatchText] = useState(watch)
  const [convertTo, setConvertTo] = useState<Asset>(assetBySymbol(params.get('convert')) ?? assetBySymbol('SPYx')!)

  const rows = useMemo(() => {
    if (!holdings.data) return []
    return ASSETS.map((a) => {
      const amount = isNative(a) ? holdings.data!.eth : (holdings.data!.tokens[a.symbol] ?? 0)
      const m = markets.data?.[a.symbol]
      return { asset: a, amount, price: m?.usdPrice, change: m?.change24h, value: m?.usdPrice != null ? amount * m.usdPrice : undefined }
    })
      .filter((r) => r.amount > 0)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
  }, [holdings.data, markets.data])

  const total = rows.reduce((s, r) => s + (r.value ?? 0), 0)
  const change24 = total ? rows.reduce((s, r) => s + ((r.value ?? 0) * (r.change ?? 0)) / 100, 0) : 0
  const rwaValue = rows.filter((r) => r.asset.issuer === 'Backed').reduce((s, r) => s + (r.value ?? 0), 0)
  const ready = !!holdings.data && !!markets.data

  return (
    <div className="flex flex-col gap-8">
      <PageHead
        title="Portfolio"
        sub="What is actually at your Ethereum address right now: ETH plus every asset Nerogate can deliver, priced live."
        action={
          address && (
            <a href={etherscanAddress(address)} target="_blank" rel="noopener noreferrer" className="text-label-sm text-ember-40">
              {short(address, 6, 4)} on Etherscan
            </a>
          )
        }
      />

      <Panel>
        <form
          className="flex flex-col xs:flex-row gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            const v = watchText.trim()
            setParams(v ? { address: v } : {}, { replace: true })
          }}
        >
          <input
            className={inputCls}
            value={watchText}
            onChange={(e) => setWatchText(e.target.value.trim())}
            placeholder={own ? `Your wallet ${short(own, 6, 4)} · or paste any address to view it` : 'Paste an Ethereum address to view it, or connect a wallet'}
            aria-label="Ethereum address to view"
            spellCheck={false}
          />
          <ActionButton type="submit" variant="secondary">
            View
          </ActionButton>
          {watch && (
            <ActionButton
              variant="secondary"
              onClick={() => {
                setWatchText('')
                setParams({}, { replace: true })
              }}
            >
              Clear
            </ActionButton>
          )}
        </form>
        {watch && !isWalletAddress(watch) && <p className="mt-3 text-body-sm text-[#9b2c1f]">That is not a valid Ethereum address.</p>}
      </Panel>

      {!address ? (
        <Panel>
          <div className="flex flex-col items-start gap-4">
            <p className="text-body-md text-ink-30">Connect the wallet you receive into, or paste an address above. Viewing an address is read-only.</p>
            <WalletButton />
          </div>
        </Panel>
      ) : (
        <>
          <div className="grid grid-cols-1 xs:grid-cols-3 gap-6">
            {[
              { label: 'Total value', value: ready ? usd(total) : null, accent: true, big: true },
              { label: '24h change', value: ready ? `${usd(change24)} (${pct(total ? (change24 / (total - change24)) * 100 : 0)})` : null, accent: false, big: false },
              { label: 'Tokenized assets', value: ready ? usd(rwaValue) : null, accent: false, big: true },
            ].map((s) => (
              <div key={s.label} className={cx('rounded-3xl min-h-[132px] p-6 flex flex-col justify-between gap-4', s.accent ? 'display-bg-light' : 'display-bg-neutral')}>
                <p className="text-label-sm">{s.label}</p>
                {s.value ? <p className={s.big ? 'text-headline-sm' : 'text-title-md'}>{s.value}</p> : <Skeleton className="h-8 w-32" />}
              </div>
            ))}
          </div>

          {holdings.error && <Notice tone="error">Could not read balances from the Ethereum RPC: {(holdings.error as Error).message.split('\n')[0]}</Notice>}

          <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_1fr] gap-6 items-start">
            <Panel title="Holdings" action={<span className="text-label-sm text-ink-50">Refreshes every minute</span>}>
              {!holdings.data ? (
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : rows.length === 0 ? (
                <div className="flex flex-col items-start gap-3">
                  <p className="text-body-md text-ink-30">No ETH and no supported assets at this address yet.</p>
                  <Link to="/app" className="text-label-md text-ember-40">
                    Buy your first asset with XMR
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  <div className="flex h-3 w-full overflow-hidden rounded-full bg-[#f2e9e0]" role="img" aria-label="Allocation by value">
                    {rows.map((r, i) => (
                      <span key={r.asset.symbol} style={{ width: `${total ? ((r.value ?? 0) / total) * 100 : 0}%`, background: BAR[i % BAR.length] }} />
                    ))}
                  </div>
                  <ul>
                    {rows.map((r, i) => (
                      <li key={r.asset.symbol} className="flex items-center gap-4 py-3 border-b border-veil-black-16 last:border-0">
                        <span className="h-2.5 w-2.5 flex-none rounded-full" style={{ background: BAR[i % BAR.length] }} />
                        <AssetBadge asset={r.asset} />
                        <Link to={`/app/assets/${r.asset.symbol}`} className="flex-1 min-w-0">
                          <span className="block text-label-md text-darkest">{r.asset.symbol}</span>
                          <span className="block text-body-sm text-ink-50">
                            {num(r.amount)} · {usd(r.price)}
                          </span>
                        </Link>
                        <span className="text-right">
                          <span className="block text-label-md text-darkest">{usd(r.value)}</span>
                          <span className={cx('block text-body-sm', (r.change ?? 0) >= 0 ? 'text-[#1d6b3a]' : 'text-[#9b2c1f]')}>{pct(r.change)}</span>
                        </span>
                        {!isNative(r.asset) && (
                          <Link to={`/app?asset=${r.asset.symbol}`} className="hidden xs:inline-flex btn state-layer btn-bg-secondary px-3 py-1.5 text-label-sm">
                            Buy more
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Panel>

            <Panel title="Convert ETH to an asset">
              {viewingOwn ? (
                <div className="flex flex-col gap-5">
                  <p className="text-body-sm text-ink-30">The second leg on its own: turn ETH already in this wallet into any asset with one transaction.</p>
                  <AssetPicker value={convertTo} onChange={setConvertTo} exclude={['ETH']} />
                  <BuyPanel key={convertTo.symbol} asset={convertTo} />
                </div>
              ) : (
                <div className="flex flex-col items-start gap-4">
                  <p className="text-body-sm text-ink-30">
                    {own ? 'You are viewing another address. Clear the field to convert from your own wallet.' : 'Connect the wallet you want to convert from.'}
                  </p>
                  {!own && <WalletButton />}
                </div>
              )}
            </Panel>
          </div>
        </>
      )}
    </div>
  )
}
