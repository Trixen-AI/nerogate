// Live service clients. Every call goes to the real service; nothing here is mocked.
import { ASSETS, NATIVE } from './assets'

export const RPC_URL: string = import.meta.env.VITE_ETH_RPC || 'https://ethereum-rpc.publicnode.com'
const EXOLIX = 'https://exolix.com/api/v2'
const KYBER = 'https://aggregator-api.kyberswap.com/ethereum/api/v1'
const KYBER_HEADERS = { 'x-client-id': 'nerogate' }
const COINGECKO = 'https://api.coingecko.com/api/v3'

export const SLIPPAGE_BPS = 100
export const WEI = 10n ** 18n

/** A quote this far below the market price gets a warning; at BLOCK it cannot be submitted. */
export const IMPACT_WARN = 3
export const IMPACT_BLOCK = 15

async function json<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    const msg = (body && (body.error || body.message)) || `Request failed (${res.status})`
    throw new Error(typeof msg === 'string' ? msg : 'Request failed')
  }
  return body as T
}

/* ------------------------------ Exolix (XMR -> ETH) ------------------------------ */

export type ExolixRate = {
  fromAmount: number
  toAmount: number
  rate: number
  minAmount: number
  maxAmount: number
  message: string | null
}

/** Rate for the XMR -> ETH leg. Below-minimum amounts come back as an error carrying minAmount. */
export async function getXmrEthRate(amount: number): Promise<ExolixRate> {
  const q = new URLSearchParams({
    coinFrom: 'XMR',
    networkFrom: 'XMR',
    coinTo: 'ETH',
    networkTo: 'ETH',
    amount: String(amount),
    rateType: 'float',
  })
  const res = await fetch(`${EXOLIX}/rate?${q}`)
  const body = await res.json().catch(() => null)
  if (!res.ok || !body || typeof body.toAmount !== 'number') {
    const err = new Error(body?.error || body?.message || 'No rate available') as Error & { minAmount?: number; maxAmount?: number }
    err.minAmount = body?.minAmount
    err.maxAmount = body?.maxAmount
    throw err
  }
  return body as ExolixRate
}

export type ExolixHash = { hash?: string | null; link?: string | null } | null

export type ExolixOrder = {
  id: string
  amount: number
  amountTo: number
  depositAddress: string
  depositExtraId?: string | null
  withdrawalAddress: string
  refundAddress?: string | null
  status: string
  createdAt?: string
  rate?: number
  hashIn?: ExolixHash
  hashOut?: ExolixHash
}

export async function createXmrEthOrder(input: { amount: number; withdrawalAddress: string; refundAddress?: string }) {
  const res = await fetch(`${EXOLIX}/transactions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      coinFrom: 'XMR',
      networkFrom: 'XMR',
      coinTo: 'ETH',
      networkTo: 'ETH',
      amount: input.amount,
      withdrawalAddress: input.withdrawalAddress,
      ...(input.refundAddress ? { refundAddress: input.refundAddress } : {}),
      rateType: 'float',
    }),
  })
  return json<ExolixOrder>(res)
}

export async function getXmrEthOrder(id: string) {
  return json<ExolixOrder>(await fetch(`${EXOLIX}/transactions/${encodeURIComponent(id)}`))
}

export type Stage = 'deposit' | 'confirming' | 'exchanging' | 'delivered' | 'expired' | 'refunded' | 'failed'

/** Exolix status -> the stage shown to the user. */
export function stageOf(status: string | undefined): Stage {
  switch (status) {
    case 'wait':
      return 'deposit'
    case 'confirmation':
    case 'confirmed':
      return 'confirming'
    case 'exchanging':
    case 'sending':
      return 'exchanging'
    case 'success':
      return 'delivered'
    case 'overdue':
      return 'expired'
    case 'refunded':
    case 'refund':
      return 'refunded'
    default:
      return status ? 'failed' : 'deposit'
  }
}

export const isFinalStage = (s: Stage) => s === 'delivered' || s === 'expired' || s === 'refunded' || s === 'failed'

/** Exolix's own rule for Monero addresses (standard, subaddress, integrated). */
export const XMR_ADDRESS = /^[48][a-zA-Z\d]{94}([a-zA-Z\d]{11})?$/

/* ------------------------------ KyberSwap (ETH -> asset) ------------------------------ */

export type KyberRouteSummary = {
  tokenIn: string
  amountIn: string
  tokenOut: string
  amountOut: string
  gas: string
  gasUsd?: string
  route: { exchange?: string }[][]
  [k: string]: unknown
}

export type SwapQuote = { routeSummary: KyberRouteSummary; routerAddress: `0x${string}` }

export async function getQuote(tokenOut: string, wei: bigint, tokenIn: string = NATIVE): Promise<SwapQuote> {
  const q = new URLSearchParams({ tokenIn, tokenOut, amountIn: wei.toString() })
  const body = await json<{ code: number; message?: string; data?: SwapQuote }>(await fetch(`${KYBER}/routes?${q}`, { headers: KYBER_HEADERS }))
  if (!body.data?.routeSummary) throw new Error(body.message || 'No route found for this asset right now')
  return body.data
}

/** Venues a route passes through, for display. */
export const routeVenues = (s: KyberRouteSummary) => [...new Set(s.route.flat().map((h) => h.exchange).filter(Boolean))] as string[]

export async function buildSwap(quote: SwapQuote, sender: string) {
  const res = await fetch(`${KYBER}/route/build`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...KYBER_HEADERS },
    body: JSON.stringify({ routeSummary: quote.routeSummary, sender, recipient: sender, slippageTolerance: SLIPPAGE_BPS }),
  })
  const body = await json<{ data?: { data: `0x${string}`; routerAddress: `0x${string}`; transactionValue: string; gas: string } }>(res)
  if (!body.data) throw new Error('Could not build the swap transaction')
  return body.data
}

/* ------------------------------ CoinGecko (market prices) ------------------------------ */

export type Market = { usdPrice: number; change24h?: number; marketCap?: number; volume24h?: number }

/** Independent market price for every asset (keyed by symbol), used for values and to measure quote loss. */
export async function getMarkets(): Promise<Record<string, Market>> {
  const ids = ASSETS.map((a) => a.cgId).join(',')
  const body = await json<Record<string, { usd: number; usd_24h_change?: number; usd_market_cap?: number; usd_24h_vol?: number }>>(
    await fetch(`${COINGECKO}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`),
  )
  const out: Record<string, Market> = {}
  for (const a of ASSETS) {
    const m = body[a.cgId]
    if (m?.usd) out[a.symbol] = { usdPrice: m.usd, change24h: m.usd_24h_change, marketCap: m.usd_market_cap, volume24h: m.usd_24h_vol }
  }
  return out
}

/* ------------------------------ THORChain ------------------------------ */

// Public THORNode endpoints that allow browser requests, tried in order.
const THORNODES = [
  'https://gateway.liquify.com/chain/thorchain_api/thorchain/pools',
  'https://thorchain-thornode-lb-1.thorwallet.org/thorchain/pools',
  'https://thornode.ninerealms.com/thorchain/pools',
]

export type ThorStatus = { reachable: boolean; xmrPool: 'live' | 'staged' | 'absent' | 'unknown'; pools?: number }

/** Is there an XMR pool on THORChain mainnet yet? Tries more than one public node. */
export async function getThorXmrStatus(): Promise<ThorStatus> {
  for (const url of THORNODES) {
    try {
      const ctrl = new AbortController()
      const t = setTimeout(() => ctrl.abort(), 8000)
      const res = await fetch(url, { signal: ctrl.signal })
      clearTimeout(t)
      if (!res.ok) continue
      const pools = (await res.json()) as { asset: string; status: string }[]
      const xmr = pools.find((p) => p.asset.startsWith('XMR.'))
      return {
        reachable: true,
        pools: pools.length,
        xmrPool: !xmr ? 'absent' : xmr.status === 'Available' ? 'live' : 'staged',
      }
    } catch {
      /* try the next node */
    }
  }
  return { reachable: false, xmrPool: 'unknown' }
}
