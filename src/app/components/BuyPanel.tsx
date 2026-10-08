import { useState } from 'react'
import { VersionedTransaction } from '@solana/web3.js'
import { type Asset } from '../lib/assets'
import { buildSwap, FEE_RESERVE_SOL } from '../lib/api'
import { num, short, solscanTx, usd } from '../lib/format'
import { useAssetQuote, useDebounced, useHoldings, usePrices } from '../hooks'
import { ActionButton, Field, inputCls, Notice, Row } from './ui'
import { connection } from '../lib/connection'
import { useWallet } from '../wallet'
import { WalletButton } from './WalletButton'

type Phase = { kind: 'idle' } | { kind: 'signing' } | { kind: 'confirming'; sig: string } | { kind: 'done'; sig: string; out: number } | { kind: 'error'; msg: string }

const fromB64 = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))

/**
 * Second leg: SOL in the connected wallet -> the chosen asset, through Jupiter, with one signature.
 * Used on the order page (after the XMR leg delivers SOL) and on its own from the portfolio.
 */
export function BuyPanel({
  asset,
  suggestedSol,
  expectedWallet,
  onDone,
}: {
  asset: Asset
  suggestedSol?: number
  expectedWallet?: string
  onDone?: (signature: string, outAmount: number) => void
}) {
  const { address: owner, provider, connected } = useWallet()
  const holdings = useHoldings(owner)
  const prices = usePrices()
  const balance = holdings.data?.sol
  const spendable = balance != null ? Math.max(0, balance - FEE_RESERVE_SOL) : undefined

  const [amountText, setAmountText] = useState('')
  const defaultAmount = spendable != null ? Math.min(spendable, suggestedSol ?? spendable) : 0
  const amount = amountText === '' ? defaultAmount : Number(amountText)
  const debounced = useDebounced(Number.isFinite(amount) ? amount : 0, 350)
  const quote = useAssetQuote(asset, debounced)
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' })

  const out = quote.data ? Number(quote.data.outAmount) / 10 ** asset.decimals : undefined
  const price = prices.data?.[asset.mint]?.usdPrice
  const tooMuch = spendable != null && amount > spendable + 1e-9
  const wrongWallet = expectedWallet && owner && expectedWallet !== owner

  async function buy() {
    if (!owner || !provider || !quote.data) return
    setPhase({ kind: 'signing' })
    try {
      const { swapTransaction, lastValidBlockHeight } = await buildSwap(quote.data, owner)
      const tx = VersionedTransaction.deserialize(fromB64(swapTransaction))
      const sig = await provider.sendTransaction(tx, connection, { maxRetries: 3 })
      setPhase({ kind: 'confirming', sig })
      const res = await connection.confirmTransaction(
        { signature: sig, blockhash: tx.message.recentBlockhash, lastValidBlockHeight },
        'confirmed',
      )
      if (res.value.err) throw new Error('The swap failed on-chain. No asset was bought; your SOL stays in the wallet minus the network fee.')
      const outAmount = Number(quote.data.outAmount) / 10 ** asset.decimals
      setPhase({ kind: 'done', sig, out: outAmount })
      onDone?.(sig, outAmount)
      holdings.mutate()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong'
      setPhase({ kind: 'error', msg: /reject|denied|cancel/i.test(msg) ? 'You declined the signature. Nothing was sent.' : msg })
    }
  }

  if (!connected) {
    return (
      <div className="flex flex-col gap-4">
        <Notice>
          Connect the Solana wallet that received the SOL{expectedWallet ? ` (${short(expectedWallet, 5, 5)})` : ''}. One signature buys {asset.symbol} through
          Jupiter.
        </Notice>
        <WalletButton className="max-w-max" />
      </div>
    )
  }

  if (phase.kind === 'done') {
    return (
      <div className="flex flex-col gap-4">
        <Notice tone="ok">
          Bought ≈ {num(phase.out)} {asset.symbol}. It is in your wallet now.
        </Notice>
        <a href={solscanTx(phase.sig)} target="_blank" rel="noopener noreferrer" className="text-label-sm text-ember-40 underline underline-offset-4">
          View transaction on Solscan
        </a>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {wrongWallet && (
        <Notice tone="warn">
          The connected wallet ({short(owner!, 5, 5)}) is not the address this order paid out to ({short(expectedWallet!, 5, 5)}). The swap will use the
          connected wallet&apos;s SOL.
        </Notice>
      )}
      <Field
        label="SOL to spend"
        htmlFor="buy-sol"
        hint={balance != null ? `Wallet balance ${num(balance)} SOL. ${FEE_RESERVE_SOL} SOL stays for fees.` : 'Reading wallet balance…'}
        error={tooMuch ? 'More than the spendable balance.' : undefined}
      >
        <div className="flex gap-2">
          <input
            id="buy-sol"
            inputMode="decimal"
            className={inputCls}
            value={amountText === '' ? (defaultAmount ? String(+defaultAmount.toFixed(6)) : '') : amountText}
            onChange={(e) => setAmountText(e.target.value.replace(',', '.'))}
            placeholder="0.0"
          />
          <button type="button" className="btn state-layer btn-bg-secondary px-4 text-label-sm" onClick={() => setAmountText(spendable ? String(+spendable.toFixed(6)) : '')}>
            Max
          </button>
        </div>
      </Field>
      <div>
        <Row label="You receive ≈" strong>
          {quote.isLoading ? 'Pricing…' : out != null ? `${num(out)} ${asset.symbol}` : '–'}
        </Row>
        <Row label="Value">{out != null && price ? usd(out * price) : '–'}</Row>
        <Row label="Price impact">{quote.data ? `${(Number(quote.data.priceImpactPct) * 100).toFixed(3)}%` : '–'}</Row>
        <Row label="Route">{quote.data ? quote.data.routePlan.map((r) => r.swapInfo.label).filter(Boolean).join(' → ') || 'Jupiter' : '–'}</Row>
      </div>
      {quote.error && <Notice tone="error">{(quote.error as Error).message}</Notice>}
      {phase.kind === 'error' && <Notice tone="error">{phase.msg}</Notice>}
      {phase.kind === 'confirming' && (
        <Notice>
          Sent. Waiting for confirmation…{' '}
          <a className="underline" href={solscanTx(phase.sig)} target="_blank" rel="noopener noreferrer">
            Solscan
          </a>
        </Notice>
      )}
      <ActionButton
        full
        onClick={buy}
        disabled={!quote.data || tooMuch || amount <= 0 || phase.kind === 'signing' || phase.kind === 'confirming'}
      >
        {phase.kind === 'signing' ? 'Check your wallet…' : phase.kind === 'confirming' ? 'Confirming…' : `Buy ${asset.symbol}`}
      </ActionButton>
    </div>
  )
}
