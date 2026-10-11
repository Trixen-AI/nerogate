import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { formatUnits, parseEther } from 'viem'
import { type Asset, isNative } from './lib/assets'
import { getMarkets, getQuote, getXmrEthOrder, getXmrEthRate, isFinalStage, stageOf } from './lib/api'
import { getGasReserveWei } from './lib/chain'
import { fetchHoldings } from './lib/holdings'

export function useDebounced<T>(value: T, ms = 400) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}

/** Market price, 24h change, market cap and volume for every asset (CoinGecko, one request per minute). */
export function useMarkets() {
  return useSWR('markets', getMarkets, { refreshInterval: 60_000, keepPreviousData: true, dedupingInterval: 30_000 })
}

/** ETH kept back for the swap's gas, from the live gas price. */
export function useGasReserve() {
  return useSWR('gas-reserve', async () => Number(formatUnits(await getGasReserveWei(), 18)), { refreshInterval: 30_000, keepPreviousData: true })
}

/** XMR -> ETH rate from Exolix. */
export function useXmrRate(amount: number) {
  return useSWR(amount > 0 ? ['xmr-rate', amount] : null, () => getXmrEthRate(amount), {
    refreshInterval: 30_000,
    keepPreviousData: true,
    shouldRetryOnError: false,
  })
}

/** ETH -> asset quote from KyberSwap for an ETH amount. */
export function useAssetQuote(asset: Asset | undefined, eth: number) {
  const wei = eth > 0 ? parseEther(eth.toFixed(18)) : 0n
  const key = asset && !isNative(asset) && wei > 0n ? ['kyber-quote', asset.address, wei.toString()] : null
  const swr = useSWR(key, () => getQuote(asset!.address, wei), {
    refreshInterval: 20_000,
    keepPreviousData: true,
    shouldRetryOnError: false,
  })
  // keepPreviousData can briefly hold the last asset's quote; never show it under another ticker.
  const matches = !!asset && swr.data?.routeSummary.tokenOut.toLowerCase() === asset.address.toLowerCase()
  return { data: matches ? swr.data : undefined, error: swr.error as Error | undefined, isLoading: swr.isLoading || (!!swr.data && !matches) }
}

/**
 * How much worse a quote is than the market: value out vs value in, both at CoinGecko prices.
 * Positive = loss in percent. Captures DEX price impact, fees and thin liquidity together.
 */
export function lossVsMarket(ethIn: number, out: number | undefined, ethPrice: number | undefined, assetPrice: number | undefined) {
  if (out == null || !ethPrice || !assetPrice || ethIn <= 0) return undefined
  return (1 - (out * assetPrice) / (ethIn * ethPrice)) * 100
}

/** Both legs together, as shown on the quote card. */
export function useTwoLegQuote(asset: Asset | undefined, xmr: number) {
  const rate = useXmrRate(xmr)
  const gas = useGasReserve()
  const markets = useMarkets()
  const ethAfterBridge = rate.data?.toAmount ?? 0
  const native = !!asset && isNative(asset)
  const keptForGas = native ? 0 : (gas.data ?? 0)
  const spend = native ? 0 : Math.max(0, ethAfterBridge - keptForGas)
  const quote = useAssetQuote(asset, gas.data != null || native ? spend : 0)

  const assetOut = native ? ethAfterBridge : quote.data && asset ? Number(formatUnits(BigInt(quote.data.routeSummary.amountOut), asset.decimals)) : undefined
  const price = asset ? markets.data?.[asset.symbol]?.usdPrice : undefined
  const ethPrice = markets.data?.ETH?.usdPrice
  const usdValue = assetOut != null && price ? assetOut * price : undefined
  const loss = native ? 0 : lossVsMarket(spend, assetOut, ethPrice, price)

  return {
    rate,
    quote,
    markets,
    ethAfterBridge,
    keptForGas,
    assetOut,
    usdValue,
    loss,
    loading: rate.isLoading || gas.isLoading || (!native && quote.isLoading),
    error: (rate.error ?? quote.error) as (Error & { minAmount?: number; maxAmount?: number }) | undefined,
  }
}

/** Exolix order status, polled every 15 s until the order reaches a final state. */
export function useOrderStatus(id: string | undefined) {
  return useSWR(id ? ['order', id] : null, () => getXmrEthOrder(id!), {
    refreshInterval: (data) => (data && isFinalStage(stageOf(data.status)) ? 0 : 15_000),
    keepPreviousData: true,
  })
}

/** Real balances at an address. */
export function useHoldings(address: string | undefined) {
  return useSWR(address ? ['holdings', address.toLowerCase()] : null, () => fetchHoldings(address as `0x${string}`), {
    refreshInterval: 60_000,
    errorRetryCount: 2,
    keepPreviousData: true,
  })
}
