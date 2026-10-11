import { useSyncExternalStore } from 'react'

// Orders live only in this browser. There is no account, so the order id is the only key.
export type LocalOrder = {
  id: string
  asset: string
  amountXmr: number
  destination: string
  refund?: string
  depositAddress: string
  createdAt: number
  quote?: { eth: number; assetOut?: number; usd?: number }
  buy?: { hash: string; outAmount: number; at: number }
}

const KEY = 'nerogate.orders.eth.v1'
const EVENT = 'nerogate:orders'

function read(): LocalOrder[] {
  try {
    const raw = localStorage.getItem(KEY)
    const list = raw ? (JSON.parse(raw) as LocalOrder[]) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

let cache: LocalOrder[] = read()

function write(list: LocalOrder[]) {
  cache = list
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* storage unavailable: keep the in-memory list for this session */
  }
  window.dispatchEvent(new Event(EVENT))
}

function subscribe(cb: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = read()
      cb()
    }
  }
  window.addEventListener(EVENT, cb)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener('storage', onStorage)
  }
}

export const useOrders = () => useSyncExternalStore(subscribe, () => cache, () => cache)
export const findOrder = (id: string | undefined) => cache.find((o) => o.id === id)

export function saveOrder(order: LocalOrder) {
  write([order, ...cache.filter((o) => o.id !== order.id)])
}

export function updateOrder(id: string, patch: Partial<LocalOrder>) {
  write(cache.map((o) => (o.id === id ? { ...o, ...patch } : o)))
}

export function removeOrder(id: string) {
  write(cache.filter((o) => o.id !== id))
}
