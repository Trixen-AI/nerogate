import { useState } from 'react'
import { formatUnits } from 'viem'
import { type Asset } from '../lib/assets'
import { buildSwap, IMPACT_BLOCK, IMPACT_WARN, routeVenues } from '../lib/api'
import { publicClient } from '../lib/chain'
import { etherscanTx, num, short, usd } from '../lib/format'
import { lossVsMarket, useAssetQuote, useDebounced, useGasReserve, useHoldings, useMarkets } from '../hooks'
import { useWallet } from '../wallet'
import { ActionButton, Field, inputCls, Notice, Row } from './ui'
import { WalletButton } from './WalletButton'

type Phase = { kind: 'idle' } | { kind: 'signing' } | { kind: 'confirming'; hash: string } | { kind: 'done'; hash: string; out: number } | { kind: 'error'; msg: string }

/**
 * Second leg: ETH in the connected wallet -> the chosen asset, through KyberSwap, with one transaction.
 * Used on the order page (after the XMR leg delivers ETH) and on its own from the portfolio.
 */
export function BuyPanel({
  asset,
  suggestedEth,
  expectedWallet,
  onDone,
}: {
  asset: Asset
  suggestedEth?: number
  expectedWallet?: string
  onDone?: (hash: string, outAmount: number) => void
}) {
  const wallet = useWallet()
  const owner = wallet.address
  const holdings = useHoldings(owner)
  const markets = useMarkets()
  const gas = useGasReserve()
  const balance = holdings.data?.eth
  const reserve = gas.data ?? 0
  const spendable = balance != null && gas.data != null ? Math.max(0, balance - reserve) : undefined

  const [amountText, setAmountText] = useState('')
  const defaultAmount = spendable != null ? Math.min(spendable, suggestedEth ?? spendable) : 0
  const amount = amountText === '' ? defaultAmount : Number(amountText)
  const debounced = useDebounced(Number.isFinite(amount) ? amount : 0, 350)
  const quote = useAssetQuote(asset, debounced)
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' })

  const out = quote.data ? Number(formatUnits(BigInt(quote.data.routeSummary.amountOut), asset.decimals)) : undefined
  const price = markets.data?.[asset.symbol]?.usdPrice
  const loss = lossVsMarket(debounced, out, markets.data?.ETH?.usdPrice, price)
  const tooMuch = spendable != null && amount > spendable + 1e-12
  const blocked = loss != null && loss >= IMPACT_BLOCK
  const wrongWallet = expectedWallet && owner && expectedWallet.toLowerCase() !== owner.toLowerCase()

  async function buy() {
    if (!owner || !quote.data) return
    setPhase({ kind: 'signing' })
    try {
      const tx = await buildSwap(quote.data, owner)
      const hash = await wallet.send({ to: tx.routerAddress, data: tx.data, value: BigInt(tx.transactionValue) })
      setPhase({ kind: 'confirming', hash })
      const receipt = await publicClient.waitForTransactionReceipt({ hash, confirmations: 1 })
      if (receipt.status !== 'success') throw new Error('The swap reverted on-chain. No asset was bought; only the gas fee was spent.')
      setPhase({ kind: 'done', hash, out: out ?? 0 })
      onDone?.(hash, out ?? 0)
      holdings.mutate()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong'
      setPhase({ kind: 'error', msg: /reject|denied|cancel/i.test(msg) ? 'You declined the transaction. Nothing was sent.' : msg.split('\n')[0] })
    }
  }

  if (!wallet.connected) {
    return (
      <div className="flex flex-col gap-4">
        <Notice>
          Connect the Ethereum wallet that received the ETH{expectedWallet ? ` (${short(expectedWallet, 6, 4)})` : ''}. One transaction buys {asset.symbol}{' '}
          through KyberSwap.
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
        <a href={etherscanTx(phase.hash)} target="_blank" rel="noopener noreferrer" className="text-label-sm text-ember-40 underline underline-offset-4">
          View transaction on Etherscan
        </a>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {wrongWallet && (
        <Notice tone="warn">
          The connected wallet ({short(owner!, 6, 4)}) is not the address this order paid out to ({short(expectedWallet!, 6, 4)}). The swap will use the
          connected wallet&apos;s ETH.
        </Notice>
      )}
      <Field
        label="ETH to spend"
        htmlFor="buy-eth"
        hint={balance != null ? `Wallet balance ${num(balance)} ETH. ${num(reserve, 5)} ETH stays for gas.` : 'Reading wallet balance…'}
        error={tooMuch ? 'More than the spendable balance.' : undefined}
      >
        <div className="flex gap-2">
          <input
            id="buy-eth"
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
        <Row label="Below market">{loss != null ? `${Math.max(0, loss).toFixed(2)}%` : '–'}</Row>
        <Row label="Route">{quote.data ? routeVenues(quote.data.routeSummary).join(' → ') || 'KyberSwap' : '–'}</Row>
      </div>
      {loss != null && loss >= IMPACT_WARN && !blocked && (
        <Notice tone="warn">This route returns {loss.toFixed(1)}% less than the market price because {asset.symbol} liquidity on Ethereum is thin.</Notice>
      )}
      {blocked && (
        <Notice tone="error">
          Blocked: this route returns {loss!.toFixed(0)}% less than the market price. {asset.symbol} does not have enough liquidity on Ethereum for this
          amount right now. Try a smaller amount or another asset.
        </Notice>
      )}
      {quote.error && <Notice tone="error">{(quote.error as Error).message}</Notice>}
      {phase.kind === 'error' && <Notice tone="error">{phase.msg}</Notice>}
      {phase.kind === 'confirming' && (
        <Notice>
          Sent. Waiting for confirmation…{' '}
          <a className="underline" href={etherscanTx(phase.hash)} target="_blank" rel="noopener noreferrer">
            Etherscan
          </a>
        </Notice>
      )}
      <ActionButton
        full
        onClick={buy}
        disabled={!quote.data || tooMuch || blocked || amount <= 0 || phase.kind === 'signing' || phase.kind === 'confirming'}
      >
        {phase.kind === 'signing' ? 'Check your wallet…' : phase.kind === 'confirming' ? 'Confirming…' : `Buy ${asset.symbol}`}
      </ActionButton>
    </div>
  )
}
