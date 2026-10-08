// Live service clients. Every call goes to the real service; nothing here is mocked.
import { SOL_MINT } from './assets'

export const RPC_URL: string = import.meta.env.VITE_SOLANA_RPC || 'https://solana-rpc.publicnode.com'
const JUP = 'https://lite-api.jup.ag'
const EXOLIX = 'https://exolix.com/api/v2'

/** SOL kept back from the bridged amount to pay for the token account and the swap fee. */
export const FEE_RESERVE_SOL = 0.01
export const SLIPPAGE_BPS = 100
export const LAMPORTS = 1_000_000_000

async function json<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    const msg = (body && (body.error || body.message)) || `Request failed (${res.status})`
    const err = new Error(typeof msg === 'string' ? msg : 'Request failed') as Error & { data?: unknown }
    err.data = body
    throw err
  }
  return body as T
}

/* ------------------------------ Exolix (XMR -> SOL) ------------------------------ */

export type ExolixRate = {
  fromAmount: number
  toAmount: number
  rate: number
  minAmount: number
  maxAmount: number
  message: string | null
}

/** Rate for the XMR -> SOL leg. Below-minimum amounts come back as an error carrying minAmount. */
export async function getXmrSolRate(amount: number): Promise<ExolixRate> {
  const q = new URLSearchParams({
    coinFrom: 'XMR',
    networkFrom: 'XMR',
    coinTo: 'SOL',
    networkTo: 'SOL',
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

export async function createXmrSolOrder(input: { amount: number; withdrawalAddress: string; refundAddress?: string }) {
  const res = await fetch(`${EXOLIX}/transactions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      coinFrom: 'XMR',
      networkFrom: 'XMR',
      coinTo: 'SOL',
      networkTo: 'SOL',
      amount: input.amount,
      withdrawalAddress: input.withdrawalAddress,
      ...(input.refundAddress ? { refundAddress: input.refundAddress } : {}),
      rateType: 'float',
    }),
  })
  return json<ExolixOrder>(res)
}

export async function getXmrSolOrder(id: string) {
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

/* ------------------------------ Jupiter (SOL -> asset) ------------------------------ */

export type PriceInfo = { usdPrice: number; priceChange24h?: number; liquidity?: number }

export async function getPrices(mints: string[]) {
  const res = await fetch(`${JUP}/price/v3?ids=${mints.join(',')}`)
  return json<Record<string, PriceInfo | null>>(res)
}

export type JupQuote = {
  inputMint: string
  inAmount: string
  outputMint: string
  outAmount: string
  otherAmountThreshold: string
  priceImpactPct: string
  slippageBps: number
  swapUsdValue?: string
  routePlan: { swapInfo: { label?: string } }[]
}

export async function getQuote(outputMint: string, lamports: bigint, inputMint = SOL_MINT) {
  const q = new URLSearchParams({
    inputMint,
    outputMint,
    amount: lamports.toString(),
    slippageBps: String(SLIPPAGE_BPS),
  })
  return json<JupQuote>(await fetch(`${JUP}/swap/v1/quote?${q}`))
}

export async function buildSwap(quote: JupQuote, userPublicKey: string) {
  const res = await fetch(`${JUP}/swap/v1/swap`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      quoteResponse: quote,
      userPublicKey,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: 'auto',
    }),
  })
  return json<{ swapTransaction: string; lastValidBlockHeight: number }>(res)
}

export type TokenStats = {
  id: string
  name: string
  symbol: string
  holderCount?: number
  mcap?: number
  liquidity?: number
  usdPrice?: number
  stats24h?: { priceChange?: number; buyVolume?: number; sellVolume?: number }
}

export async function getTokenStats(mint: string) {
  const list = await json<TokenStats[]>(await fetch(`${JUP}/tokens/v2/search?query=${mint}`))
  return list.find((t) => t.id === mint) ?? null
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
