import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { ALL_MINTS, type Asset, SOL_MINT } from './lib/assets'
import {
  FEE_RESERVE_SOL,
  getPrices,
  getQuote,
  getXmrSolOrder,
  getXmrSolRate,
  isFinalStage,
  LAMPORTS,
  stageOf,
} from './lib/api'
import { fetchHoldings } from './lib/holdings'
import { connection } from './lib/connection'

export function useDebounced<T>(value: T, ms = 400) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}

/** Live USD prices for every supported asset (one request, refreshed every 30 s). */
export function usePrices() {
  return useSWR('prices', () => getPrices(ALL_MINTS), { refreshInterval: 30_000, keepPreviousData: true })
}

/** XMR -> SOL rate from Exolix. */
export function useXmrRate(amount: number) {
  return useSWR(amount > 0 ? ['xmr-rate', amount] : null, () => getXmrSolRate(amount), {
    refreshInterval: 30_000,
    keepPreviousData: true,
    shouldRetryOnError: false,
  })
}

/** SOL -> asset quote from Jupiter for a SOL amount. */
export function useAssetQuote(asset: Asset | undefined, sol: number) {
  const lamports = BigInt(Math.max(0, Math.floor(sol * LAMPORTS)))
  const key = asset && asset.mint !== SOL_MINT && lamports > 0n ? ['jup-quote', asset.mint, lamports.toString()] : null
  return useSWR(key, () => getQuote(asset!.mint, lamports), {
    refreshInterval: 20_000,
    keepPreviousData: true,
    shouldRetryOnError: false,
  })
}

/** Both legs together, as shown on the quote card. */
export function useTwoLegQuote(asset: Asset | undefined, xmr: number) {
  const rate = useXmrRate(xmr)
  const solAfterBridge = rate.data?.toAmount ?? 0
  const isSol = asset?.mint === SOL_MINT
  const spend = isSol ? 0 : Math.max(0, solAfterBridge - FEE_RESERVE_SOL)
  const quote = useAssetQuote(asset, spend)
  const prices = usePrices()

  const assetOut = isSol
    ? solAfterBridge
    : quote.data && asset
      ? Number(quote.data.outAmount) / 10 ** asset.decimals
      : undefined
  const price = asset ? prices.data?.[asset.mint]?.usdPrice : undefined
  const usdValue = assetOut != null && price ? assetOut * price : undefined
  const impact = quote.data ? Number(quote.data.priceImpactPct) * 100 : isSol ? 0 : undefined

  return {
    rate,
    quote,
    solAfterBridge,
    keptForFees: isSol ? 0 : FEE_RESERVE_SOL,
    assetOut,
    usdValue,
    impact,
    loading: rate.isLoading || (!isSol && quote.isLoading),
    error: (rate.error ?? quote.error) as (Error & { minAmount?: number; maxAmount?: number }) | undefined,
  }
}

/** Exolix order status, polled every 15 s until the order reaches a final state. */
export function useOrderStatus(id: string | undefined) {
  return useSWR(id ? ['order', id] : null, () => getXmrSolOrder(id!), {
    refreshInterval: (data) => (data && isFinalStage(stageOf(data.status)) ? 0 : 15_000),
    keepPreviousData: true,
  })
}

/** Real balances at an address. */
export function useHoldings(address: string | undefined) {
  return useSWR(address ? ['holdings', address] : null, () => fetchHoldings(connection, address!), {
    refreshInterval: 60_000,
    errorRetryCount: 2,
    keepPreviousData: true,
  })
}
