import { Link, useParams } from 'react-router'
import useSWR from 'swr'
import { erc20Abi, formatUnits } from 'viem'
import { BuyPanel } from '../components/BuyPanel'
import { AssetBadge, CopyButton, Notice, PageHead, Panel, Row, Skeleton } from '../components/ui'
import { assetBySymbol, isNative } from '../lib/assets'
import { publicClient } from '../lib/chain'
import { compact, etherscanToken, num, pct, short, usd } from '../lib/format'
import { useHoldings, useMarkets, useTwoLegQuote } from '../hooks'
import { useWallet } from '../wallet'
import { cx } from '@/lib/cx'

export default function AssetDetailPage() {
  const { symbol } = useParams()
  const asset = assetBySymbol(symbol)
  const markets = useMarkets()
  const supply = useSWR(asset && !isNative(asset) ? ['supply', asset.address] : null, async () =>
    Number(formatUnits(await publicClient.readContract({ address: asset!.address, abi: erc20Abi, functionName: 'totalSupply' }), asset!.decimals)),
  )
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

  const m = markets.data?.[asset.symbol]
  const native = isNative(asset)
  const held = holdings.data ? (native ? holdings.data.eth : (holdings.data.tokens[asset.symbol] ?? 0)) : undefined

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
            <p className="text-headline-sm text-darkest">{m ? usd(m.usdPrice) : <Skeleton className="h-8 w-28" />}</p>
            <p className={cx('text-label-sm', (m?.change24h ?? 0) >= 0 ? 'text-[#1d6b3a]' : 'text-[#9b2c1f]')}>{pct(m?.change24h)} in 24h</p>
          </div>
          <Link to={`/app?asset=${asset.symbol}`} className="btn state-layer btn-bg-primary px-5 py-3 text-label-md whitespace-nowrap">
            Buy with XMR
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_1fr] gap-6 items-start">
        <div className="flex flex-col gap-6">
          <Panel title="Market">
            <Row label="Market cap">{compact(m?.marketCap)}</Row>
            <Row label="24h volume">{compact(m?.volume24h)}</Row>
            {!native && <Row label="Supply on Ethereum">{supply.data != null ? num(supply.data, 2) : supply.isLoading ? '…' : '–'}</Row>}
            <Row label="1 XMR buys ≈" strong>
              {oneXmr.assetOut != null ? `${num(oneXmr.assetOut, 5)} ${asset.symbol} (${usd(oneXmr.usdValue)})` : oneXmr.error ? 'No quote' : '…'}
            </Row>
            {!native && oneXmr.loss != null && <Row label="Route below market">{Math.max(0, oneXmr.loss).toFixed(2)}%</Row>}
          </Panel>

          <Panel title="Token">
            {native ? (
              <Row label="Type">Native Ether</Row>
            ) : (
              <Row label="Contract">
                <span className="inline-flex items-center gap-2">
                  <a className="underline underline-offset-2" href={etherscanToken(asset.address)} target="_blank" rel="noopener noreferrer">
                    {short(asset.address, 6, 4)}
                  </a>
                  <CopyButton value={asset.address} />
                </span>
              </Row>
            )}
            <Row label="Decimals">{asset.decimals}</Row>
            <Row label="Standard">{native ? 'Native' : 'ERC-20'}</Row>
            <Row label="Network">Ethereum mainnet</Row>
            <Row label="Issuer">{asset.issuer ?? 'Ethereum (native)'}</Row>
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
              {held != null && m && <p className="text-body-sm text-ink-50">{usd(held * m.usdPrice)}</p>}
            </Panel>
          )}
          {!native && (
            <Panel title={`Convert ETH to ${asset.symbol}`}>
              <BuyPanel asset={asset} />
            </Panel>
          )}
        </div>
      </div>
    </div>
  )
}
