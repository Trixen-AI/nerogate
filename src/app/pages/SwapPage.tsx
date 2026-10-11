import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { AssetPicker } from '../components/AssetPicker'
import { ActionButton, Field, inputCls, Notice, PageHead, Panel, Row, Skeleton } from '../components/ui'
import { assetBySymbol, isNative, type Asset } from '../lib/assets'
import { createXmrEthOrder, IMPACT_BLOCK, IMPACT_WARN, XMR_ADDRESS } from '../lib/api'
import { num, short, usd } from '../lib/format'
import { isWalletAddress } from '../lib/holdings'
import { saveOrder } from '../lib/orders'
import { useDebounced, useTwoLegQuote } from '../hooks'
import { useWallet } from '../wallet'

export default function SwapPage() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const wallet = useWallet()

  const asset: Asset = assetBySymbol(params.get('asset')) ?? assetBySymbol('SPYx')!
  const setAsset = (a: Asset) => setParams((p) => (p.set('asset', a.symbol), p), { replace: true })

  const [xmrText, setXmrText] = useState('0.5')
  // null = follow the connected wallet; a string = what the user typed or pasted.
  const [destInput, setDestination] = useState<string | null>(null)
  const [refund, setRefund] = useState('')
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const walletAddress = wallet.address
  const destination = destInput ?? walletAddress ?? ''

  const xmr = Number(xmrText)
  const debouncedXmr = useDebounced(Number.isFinite(xmr) && xmr > 0 ? xmr : 0, 450)
  const q = useTwoLegQuote(asset, debouncedXmr)
  const native = isNative(asset)

  const min = q.rate.data?.minAmount ?? q.error?.minAmount
  const max = q.rate.data?.maxAmount ?? q.error?.maxAmount
  const amountError =
    !xmrText || !(xmr > 0)
      ? 'Enter an XMR amount.'
      : min && xmr < min
        ? `Minimum is ${num(min)} XMR right now.`
        : max && xmr > max
          ? `Maximum is ${num(max)} XMR right now.`
          : undefined
  const destError = !destination ? 'Connect a wallet or paste an Ethereum address.' : !isWalletAddress(destination) ? 'This is not a valid Ethereum address.' : undefined
  const refundError = refund && !XMR_ADDRESS.test(refund.trim()) ? 'A Monero address starts with 4 or 8 and is 95 characters long.' : undefined
  const blocked = !native && q.loss != null && q.loss >= IMPACT_BLOCK
  const liquidityError = blocked
    ? `${asset.symbol} does not have enough liquidity on Ethereum for this amount: the route returns ${q.loss!.toFixed(0)}% less than the market price. Try a smaller amount or another asset.`
    : undefined
  const quoteReady = !!q.rate.data && (native || !!q.quote.data) && debouncedXmr === xmr
  const canSubmit = !amountError && !destError && !refundError && !blocked && quoteReady && !submitting

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!canSubmit) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const order = await createXmrEthOrder({ amount: xmr, withdrawalAddress: destination.trim(), refundAddress: refund.trim() || undefined })
      saveOrder({
        id: order.id,
        asset: asset.symbol,
        amountXmr: order.amount ?? xmr,
        destination: destination.trim(),
        refund: refund.trim() || undefined,
        depositAddress: order.depositAddress,
        createdAt: Date.now(),
        quote: { eth: q.ethAfterBridge, assetOut: q.assetOut, usd: q.usdValue },
      })
      navigate(`/app/orders/${order.id}`)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not create the deposit address. Try again.')
      setSubmitting(false)
    }
  }

  const route = native ? 'XMR → ETH (exolix)' : `XMR → ETH (exolix) → ${asset.symbol} (KyberSwap)`

  return (
    <div className="flex flex-col gap-8">
      <PageHead
        title="New swap"
        sub="Pay with XMR from any wallet. The asset settles to an Ethereum address you control. No account, and connecting a wallet is optional."
      />
      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-[1.1fr_1fr] gap-6 items-start" noValidate>
        <Panel>
          <div className="flex flex-col gap-6">
            <Field label="You want">
              <AssetPicker value={asset} onChange={setAsset} />
            </Field>

            <Field
              label="You pay"
              htmlFor="xmr"
              error={touched || xmrText ? amountError : undefined}
              hint={min && max ? `Between ${num(min)} and ${num(max)} XMR.` : undefined}
            >
              <div className="relative">
                <input
                  id="xmr"
                  inputMode="decimal"
                  autoComplete="off"
                  className={`${inputCls} pr-20 text-title-sm`}
                  value={xmrText}
                  onChange={(e) => setXmrText(e.target.value.replace(',', '.').replace(/[^\d.]/g, ''))}
                  placeholder="0.0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-label-md text-ink-30">XMR</span>
              </div>
            </Field>

            <Field label="Receive at (Ethereum address)" htmlFor="dest" error={touched ? destError : destination && destError}>
              <div className="flex flex-col gap-2">
                <input
                  id="dest"
                  className={inputCls}
                  value={destination}
                  onChange={(e) => setDestination(e.target.value.trim())}
                  placeholder="Connect a wallet or paste a 0x… address"
                  autoComplete="off"
                  spellCheck={false}
                />
                <div className="flex flex-wrap gap-2">
                  {walletAddress ? (
                    destination.toLowerCase() !== walletAddress.toLowerCase() && (
                      <button type="button" onClick={() => setDestination(walletAddress)} className="btn state-layer btn-bg-secondary px-3 py-1.5 text-label-sm">
                        Use connected wallet ({short(walletAddress, 6, 4)})
                      </button>
                    )
                  ) : (
                    <button type="button" onClick={wallet.open} className="btn state-layer btn-bg-secondary px-3 py-1.5 text-label-sm">
                      Connect a wallet
                    </button>
                  )}
                </div>
              </div>
            </Field>

            <Field
              label="Monero refund address (optional, used if the swap fails)"
              htmlFor="refund"
              error={refundError}
              hint={
                <>
                  Starts with 4 or 8.{' '}
                  <a href="/guides/monero-refund-address" className="text-ember-40 underline underline-offset-2">
                    Where to find it
                  </a>
                </>
              }
            >
              <input
                id="refund"
                className={inputCls}
                value={refund}
                onChange={(e) => setRefund(e.target.value.trim())}
                placeholder="4… or 8…"
                autoComplete="off"
                spellCheck={false}
              />
            </Field>
          </div>
        </Panel>

        <div className="flex flex-col gap-6 sm:sticky sm:top-[96px]">
          <Panel title="Quote" action={<span className="text-label-sm text-ink-50">{q.loading ? 'Updating…' : 'Live · refreshes every 30 s'}</span>}>
            <div className="flex flex-col gap-5">
              <div>
                <Row label="Route">{route}</Row>
                <Row label="ETH after bridge">{q.rate.data ? `${num(q.ethAfterBridge, 6)} ETH` : <Skeleton className="h-4 w-24" />}</Row>
                {!native && <Row label="Kept for gas">{q.keptForGas ? `${num(q.keptForGas, 5)} ETH` : <Skeleton className="h-4 w-20" />}</Row>}
                <Row label="You receive ≈" strong>
                  {q.assetOut != null ? `${num(q.assetOut, 5)} ${asset.symbol}` : <Skeleton className="h-4 w-28" />}
                </Row>
                <Row label="Value">{q.usdValue != null ? usd(q.usdValue) : <Skeleton className="h-4 w-24" />}</Row>
                {!native && <Row label="Below market price">{q.loss != null ? `${Math.max(0, q.loss).toFixed(2)}%` : '–'}</Row>}
                <Row label="ETA">10–30 min</Row>
              </div>
              {!native && q.loss != null && q.loss >= IMPACT_WARN && !blocked && (
                <Notice tone="warn">
                  This route returns {q.loss.toFixed(1)}% less than the market price because {asset.symbol} liquidity on Ethereum is thin.
                </Notice>
              )}
              {liquidityError && <Notice tone="error">{liquidityError}</Notice>}
              {q.error && !amountError && <Notice tone="error">{q.error.message}</Notice>}
              {submitError && <Notice tone="error">{submitError}</Notice>}
              <ActionButton type="submit" full disabled={(touched && !canSubmit) || blocked}>
                {submitting ? 'Creating deposit address…' : 'Get deposit address'}
              </ActionButton>
              {touched && !canSubmit && !submitting && !submitError && !blocked && (
                <p className="text-body-sm text-ink-50 text-center">{amountError ?? destError ?? refundError ?? 'Waiting for a fresh quote…'}</p>
              )}
            </div>
          </Panel>

          <Panel title="How it works">
            <ol className="flex flex-col gap-4 text-body-sm text-ink-30">
              <li>
                <b className="text-darkest">Quote.</b> Pick an asset and an XMR amount. We price the XMR→ETH leg and the ETH→asset leg on KyberSwap.
              </li>
              <li>
                <b className="text-darkest">Pay.</b> Send the exact XMR amount to a one-time deposit address. Your Ethereum address is the only thing the swap provider sees.
              </li>
              <li>
                <b className="text-darkest">Settle.</b> ETH lands in your wallet in 10–30 minutes. One transaction buys the asset through KyberSwap.
              </li>
            </ol>
          </Panel>
        </div>
      </form>
    </div>
  )
}
