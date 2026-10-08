import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ActionButton, AssetBadge, inputCls, PageHead, Panel, Skeleton, StagePill } from '../components/ui'
import { assetBySymbol, SOL_MINT } from '../lib/assets'
import { stageOf } from '../lib/api'
import { ago, num, short } from '../lib/format'
import { removeOrder, useOrders, type LocalOrder } from '../lib/orders'
import { useOrderStatus } from '../hooks'

function OrderRow({ order }: { order: LocalOrder }) {
  const status = useOrderStatus(order.id)
  const asset = assetBySymbol(order.asset)
  const stage = stageOf(status.data?.status)
  const done = !!order.buy || (asset?.mint === SOL_MINT && stage === 'delivered')
  const needsBuy = stage === 'delivered' && !done
  return (
    <li className="flex flex-col xs:flex-row xs:items-center gap-4 py-4 border-b border-veil-black-16 last:border-0">
      <Link to={`/app/orders/${order.id}`} className="flex flex-1 items-center gap-4 min-w-0 group">
        {asset && <AssetBadge asset={asset} />}
        <span className="flex flex-col min-w-0">
          <span className="text-label-md text-darkest group-hover:text-ember-40 transition-colors">
            {num(order.amountXmr)} XMR → {order.asset}
          </span>
          <span className="text-body-sm text-ink-50 truncate">
            {order.id} · {ago(order.createdAt)} · to {short(order.destination)}
          </span>
        </span>
      </Link>
      <div className="flex items-center gap-3">
        {status.data ? <StagePill stage={stage} bought={done} /> : status.error ? <span className="text-body-sm text-ink-50">Status unavailable</span> : <Skeleton className="h-7 w-28" />}
        {needsBuy && (
          <Link to={`/app/orders/${order.id}`} className="btn state-layer btn-bg-primary px-3 py-1.5 text-label-sm">
            Buy {order.asset}
          </Link>
        )}
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Remove this order from this browser? The order itself is not cancelled.')) removeOrder(order.id)
          }}
          className="rounded-lg px-2 py-1 text-label-sm text-ink-50 hover:text-darkest hover:bg-ink-98"
          aria-label={`Remove order ${order.id} from this device`}
        >
          Remove
        </button>
      </div>
    </li>
  )
}

export default function OrdersPage() {
  const orders = useOrders()
  const navigate = useNavigate()
  const [lookup, setLookup] = useState('')

  return (
    <div className="flex flex-col gap-8">
      <PageHead
        title="Orders"
        sub="Every swap you start in this browser. Nothing is stored on a server under your name; the order id is the only key."
        action={
          <Link to="/app" className="btn state-layer btn-bg-primary px-5 py-3 text-label-md">
            New swap
          </Link>
        }
      />

      <Panel title="On this device">
        {orders.length ? (
          <ul>
            {orders.map((o) => (
              <OrderRow key={o.id} order={o} />
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-start gap-4 py-4">
            <p className="text-body-md text-ink-30">No orders yet. Your first swap will show up here.</p>
            <Link to="/app" className="text-label-md text-ember-40">
              Get a quote
            </Link>
          </div>
        )}
      </Panel>

      <Panel title="Track an order from another device">
        <form
          className="flex flex-col xs:flex-row gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            const id = lookup.trim()
            if (id) navigate(`/app/orders/${encodeURIComponent(id)}`)
          }}
        >
          <input className={inputCls} value={lookup} onChange={(e) => setLookup(e.target.value)} placeholder="Order id, for example ex1a2b3c4d5e" aria-label="Order id" />
          <ActionButton type="submit" variant="secondary" disabled={!lookup.trim()}>
            Track
          </ActionButton>
        </form>
      </Panel>
    </div>
  )
}
