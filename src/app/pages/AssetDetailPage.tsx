import { Link, useParams } from 'react-router'
import useSWR from 'swr'
import { BuyPanel } from '../components/BuyPanel'
import { AssetBadge, CopyButton, Notice, PageHead, Panel, Row, Skeleton } from '../components/ui'
import { assetBySymbol, SOL_MINT } from '../lib/assets'
import { getTokenStats } from '../lib/api'
import { compact, num, pct, short, solscanToken, usd } from '../lib/format'
import { useHoldings, usePrices, useTwoLegQuote } from '../hooks'
import { useWallet } from '../wallet'
import { cx } from '@/lib/cx'

export default function AssetDetailPage() {
  const { symbol } = useParams()
  const asset = assetBySymbol(symbol)
  const prices = usePrices()
  const stats = useSWR(asset ? ['token-stats', asset.mint] : null, () => getTokenStats(asset!.mint), { refreshInterval: 60_000 })
  const oneXmr = useTwoLegQuote(asset, 1)
  const { address } = useWallet()
  const holdings = useHoldings(address)

  if (!asset) {
    return (
      <div className="flex flex-col gap-4">
        <PageHead title="Asset not found" sub={`“${symbol}” is not one of the assets Nerogate delivers.`} />
        <Link to="/app/assets" className="text-label-md text-ember-40">
          See all assets
        </Link>
      </div>
    )
  }

  const p = prices.data?.[asset.mint]
  const s = stats.data
  const isSol = asset.mint === SOL_MINT
  const held = holdings.data ? (isSol ? holdings.data.sol : (holdings.data.tokens[asset.mint] ?? 0)) : undefined
  const volume = s?.stats24h ? (s.stats24h.buyVolume ?? 0) + (s.stats24h.sellVolume ?? 0) : undefined

  return (
    <div className="flex flex-col gap-8">
      <Link to="/app/assets" className="text-label-sm text-ember-40 max-w-max">
        ← All assets
      </Link>
      <div className="flex flex-col xs:flex-row xs:items-center gap-5 justify-between">
        <div className="flex items-center gap-4">
          <AssetBadge asset={asset} size={56} />
          <div>
            <h1 className="text-headline-sm text-darkest leading-tight">{asset.symbol}</h1>
            <p className="text-body-md text-ink-30">
              {asset.name} · {asset.category}
            </p>
          </div>
        </div>
        <div className="flex items-end gap-4">
          <div className="text-right">
            <p className="text-headline-sm text-darkest">{p ? usd(p.usdPrice) : <Skeleton className="h-8 w-28" />}</p>
            <p className={cx('text-label-sm', (p?.priceChange24h ?? 0) >= 0 ? 'text-[#1d6b3a]' : 'text-[#9b2c1f]')}>{pct(p?.priceChange24h)} in 24h</p>
          </div>
          <Link to={`/app?asset=${asset.symbol}`} className="btn state-layer btn-bg-primary px-5 py-3 text-label-md whitespace-nowrap">
            Buy with XMR
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_1fr] gap-6 items-start">
        <div className="flex flex-col gap-6">
          <Panel title="Market">
            <Row label="Liquidity">{compact(p?.liquidity ?? s?.liquidity)}</Row>
            <Row label="24h volume">{compact(volume)}</Row>
            <Row label="Market cap">{compact(s?.mcap)}</Row>
            <Row label="Holders">{s?.holderCount != null ? s.holderCount.toLocaleString('en-US') : stats.isLoading ? '…' : '–'}</Row>
            <Row label="1 XMR buys ≈" strong>
              {oneXmr.assetOut != null ? `${num(oneXmr.assetOut, 5)} ${asset.symbol} (${usd(oneXmr.usdValue)})` : oneXmr.error ? 'No quote' : '…'}
            </Row>
          </Panel>

          <Panel title="Token">
            <Row label="Mint">
              <span className="inline-flex items-center gap-2">
                <a className="underline underline-offset-2" href={solscanToken(asset.mint)} target="_blank" rel="noopener noreferrer">
                  {short(asset.mint, 6, 6)}
                </a>
                <CopyButton value={asset.mint} />
              </span>
            </Row>
            <Row label="Decimals">{asset.decimals}</Row>
            <Row label="Token program">{asset.issuer === 'Backed' ? 'Token-2022' : isSol ? 'Native' : 'SPL Token'}</Row>
            <Row label="Issuer">{asset.issuer ?? 'Solana (native)'}</Row>
            {asset.issuer === 'Backed' && (
              <div className="mt-4">
                <Notice>xStocks are tokenized securities issued by Backed. They track the underlying price; the rights they carry are set by the issuer. Check your jurisdiction.</Notice>
              </div>
            )}
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          {address && (
            <Panel title="In your wallet">
              <p className="text-headline-sm text-darkest">{held != null ? `${num(held)} ${asset.symbol}` : <Skeleton className="h-8 w-32" />}</p>
              {held != null && p && <p className="text-body-sm text-ink-50">{usd(held * p.usdPrice)}</p>}
            </Panel>
          )}
          {!isSol && (
            <Panel title={`Convert SOL to ${asset.symbol}`}>
              <BuyPanel asset={asset} />
            </Panel>
          )}
        </div>
      </div>
    </div>
  )
}
