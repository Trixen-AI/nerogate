import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { AssetPicker } from '../components/AssetPicker'
import { BuyPanel } from '../components/BuyPanel'
import { CopyButton, Notice, PageHead, Panel, QR, Row, Skeleton, StagePill } from '../components/ui'
import { assetBySymbol, SOL_MINT, type Asset } from '../lib/assets'
import { FEE_RESERVE_SOL, stageOf, type Stage } from '../lib/api'
import { ago, num, short, solscanAccount, solscanTx } from '../lib/format'
import { saveOrder, updateOrder, useOrders, type LocalOrder } from '../lib/orders'
import type { ExolixOrder } from '../lib/api'
import { useOrderStatus } from '../hooks'
import { cx } from '@/lib/cx'

const ORDER: Stage[] = ['deposit', 'confirming', 'exchanging', 'delivered']

/** Remember the completed buy on this device (creating the local record if the order came from another device). */
function recordBuy(local: LocalOrder | undefined, data: ExolixOrder | undefined, assetSymbol: string, signature: string, outAmount: number) {
  const buy = { signature, outAmount, at: Date.now() }
  if (local) updateOrder(local.id, { buy })
  else if (data)
    saveOrder({
      id: data.id,
      asset: assetSymbol,
      amountXmr: data.amount,
      destination: data.withdrawalAddress,
      depositAddress: data.depositAddress,
      createdAt: data.createdAt ? Date.parse(data.createdAt) : Date.now(),
      buy,
    })
}

function Step({ n, title, state, children }: { n: number; title: string; state: 'done' | 'active' | 'todo'; children?: ReactNode }) {
  return (
    <li className="relative flex gap-4 pb-8 last:pb-0">
      <span
        className={cx(
          'relative z-10 flex h-9 w-9 flex-none items-center justify-center rounded-full text-label-sm',
          state === 'done' ? 'bg-ink-10 text-white' : state === 'active' ? 'bg-ember-40 text-white' : 'bg-[#f2e9e0] text-ink-30',
        )}
      >
        {state === 'done' ? '✓' : n}
      </span>
      <div className="flex-1 min-w-0 pt-1.5 flex flex-col gap-4">
        <p className={cx('text-title-sm', state === 'todo' ? 'text-ink-50' : 'text-darkest')}>{title}</p>
        {state === 'active' && children}
      </div>
    </li>
  )
}

export default function OrderPage() {
  const { id } = useParams()
  const local = useOrders().find((o) => o.id === id)
  const status = useOrderStatus(id)
  const data = status.data
  const stage = stageOf(data?.status)
  const [pickedAsset, setPickedAsset] = useState<Asset>(assetBySymbol(local?.asset) ?? assetBySymbol('SPYx')!)
  const asset = assetBySymbol(local?.asset) ?? pickedAsset
  const isSol = asset.mint === SOL_MINT
  const bought = !!local?.buy

  if (status.error && !data) {
    return (
      <div className="flex flex-col gap-6">
        <PageHead title="Order not found" sub={`No order with id ${id} was found at the exchange provider.`} />
        <Link to="/app/orders" className="text-label-md text-ember-40">
          Back to orders
        </Link>
      </div>
    )
  }

  const idx = ORDER.indexOf(stage)
  const stateOf = (i: number): 'done' | 'active' | 'todo' => (idx < 0 ? 'todo' : i < idx ? 'done' : i === idx ? (i === 3 ? 'done' : 'active') : 'todo')
  const amount = data?.amount ?? local?.amountXmr
  const depositAddress = data?.depositAddress ?? local?.depositAddress
  const destination = data?.withdrawalAddress ?? local?.destination
  const uri = depositAddress && amount ? `monero:${depositAddress}?tx_amount=${amount}` : ''


  return (
    <div className="flex flex-col gap-8">
      <PageHead
        title={`${amount ? num(amount) : '…'} XMR → ${asset.symbol}`}
        sub={
          <span className="inline-flex flex-wrap items-center gap-3">
            <span>Order {id}</span>
            {data?.createdAt && <span>· created {ago(data.createdAt)}</span>}
          </span>
        }
        action={data ? <StagePill stage={stage} bought={bought || (isSol && stage === 'delivered')} /> : <Skeleton className="h-7 w-32" />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-[1.25fr_1fr] gap-6 items-start">
        <Panel title="Progress">
          {stage === 'expired' && (
            <div className="mb-6">
              <Notice tone="error">
                No deposit arrived in time, so this deposit address has expired. Do not send XMR to it.{' '}
                <Link to={`/app?asset=${asset.symbol}`} className="underline">
                  Start a new swap
                </Link>
              </Notice>
            </div>
          )}
          {stage === 'refunded' && (
            <div className="mb-6">
              <Notice>The swap could not complete and the XMR was sent back to your refund address.</Notice>
            </div>
          )}
          {stage === 'failed' && (
            <div className="mb-6">
              <Notice tone="warn">The provider reports status “{data?.status}”. Keep this order id; it is all you need to follow up.</Notice>
            </div>
          )}
          <ol className="relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-px before:bg-veil-black-16">
            <Step n={1} title="Send XMR to the deposit address" state={stateOf(0)}>
              <div className="flex flex-col xs:flex-row gap-5">
                {uri && <QR value={uri} />}
                <div className="flex flex-col gap-4 min-w-0">
                  <div>
                    <p className="text-label-sm text-ink-50">Send exactly</p>
                    <div className="flex items-center gap-3">
                      <p className="text-headline-sm text-darkest">{num(amount)} XMR</p>
                      {amount && <CopyButton value={String(amount)} />}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-label-sm text-ink-50">To this one-time address</p>
                    <p className="break-all font-mono text-[13px] leading-relaxed text-darkest">{depositAddress}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {depositAddress && <CopyButton value={depositAddress} label="Copy address" />}
                      {uri && (
                        <a href={uri} className="btn state-layer btn-bg-secondary px-3 py-1.5 text-label-sm">
                          Open in wallet
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="text-body-sm text-ink-50">This page updates on its own. You can close it and come back from Orders.</p>
                </div>
              </div>
            </Step>
            <Step n={2} title="Deposit confirming on Monero" state={stateOf(1)}>
              <Notice>Monero needs about ten blocks (roughly 20 minutes) before the deposit can move.</Notice>
            </Step>
            <Step n={3} title="Exchanging XMR to SOL" state={stateOf(2)}>
              <Notice>The provider is sending SOL to {destination ? short(destination, 5, 5) : 'your address'}.</Notice>
            </Step>
            <Step n={4} title={`SOL delivered${data?.amountTo ? `: ${num(data.amountTo)} SOL` : ''}`} state={stateOf(3)} />
          </ol>
        </Panel>

        <div className="flex flex-col gap-6">
          {stage === 'delivered' && !isSol && (
            <Panel title={bought ? `${asset.symbol} bought` : `Final step: buy ${asset.symbol}`}>
              {bought ? (
                <div className="flex flex-col gap-3">
                  <Notice tone="ok">
                    ≈ {num(local!.buy!.outAmount)} {asset.symbol} bought {ago(local!.buy!.at)}.
                  </Notice>
                  <a className="text-label-sm text-ember-40 underline underline-offset-4" href={solscanTx(local!.buy!.signature)} target="_blank" rel="noopener noreferrer">
                    View on Solscan
                  </a>
                  <Link to="/app/portfolio" className="text-label-sm text-ember-40">
                    See it in your portfolio
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {!local && (
                    <div className="flex flex-col gap-2">
                      <p className="text-label-sm text-darkest">Which asset do you want?</p>
                      <AssetPicker value={pickedAsset} onChange={setPickedAsset} exclude={['SOL']} />
                    </div>
                  )}
                  <BuyPanel
                    asset={asset}
                    suggestedSol={data?.amountTo ? Math.max(0, data.amountTo - FEE_RESERVE_SOL) : undefined}
                    expectedWallet={destination}
                    onDone={(sig, out) => recordBuy(local, data, asset.symbol, sig, out)}
                  />
                </div>
              )}
            </Panel>
          )}

          <Panel title="Details">
            <Row label="You pay">{amount ? `${num(amount)} XMR` : '–'}</Row>
            <Row label="Expected SOL">{local?.quote?.sol ? `≈ ${num(local.quote.sol, 5)} SOL` : data?.amountTo ? `${num(data.amountTo)} SOL` : '–'}</Row>
            {!isSol && local?.quote?.assetOut != null && <Row label={`Quoted ${asset.symbol}`}>≈ {num(local.quote.assetOut, 5)}</Row>}
            <Row label="Receive at">
              {destination ? (
                <a className="underline underline-offset-2" href={solscanAccount(destination)} target="_blank" rel="noopener noreferrer">
                  {short(destination, 6, 6)}
                </a>
              ) : (
                '–'
              )}
            </Row>
            <Row label="Refund address">{data?.refundAddress || local?.refund ? short((data?.refundAddress || local?.refund)!, 6, 6) : 'None'}</Row>
            <Row label="Deposit tx">
              {data?.hashIn?.hash ? (
                <a className="underline underline-offset-2" href={data.hashIn.link ?? '#'} target="_blank" rel="noopener noreferrer">
                  {short(data.hashIn.hash, 6, 6)}
                </a>
              ) : (
                'Not seen yet'
              )}
            </Row>
            <Row label="SOL payout tx">
              {data?.hashOut?.hash ? (
                <a className="underline underline-offset-2" href={solscanTx(data.hashOut.hash)} target="_blank" rel="noopener noreferrer">
                  {short(data.hashOut.hash, 6, 6)}
                </a>
              ) : (
                'Not sent yet'
              )}
            </Row>
            <Row label="Provider status">{data?.status ?? '…'}</Row>
          </Panel>
        </div>
      </div>
    </div>
  )
}
