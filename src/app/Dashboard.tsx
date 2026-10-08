import { NavLink, Route, Routes } from 'react-router'
import { SWRConfig } from 'swr'
import { Logo } from '@/components/brand/Logo'
import { cx } from '@/lib/cx'
import { useOrders } from './lib/orders'
import { WalletButton } from './components/WalletButton'
import { usePageMeta } from '@/lib/seo'
import SwapPage from './pages/SwapPage'
import OrderPage from './pages/OrderPage'
import OrdersPage from './pages/OrdersPage'
import PortfolioPage from './pages/PortfolioPage'
import AssetsPage from './pages/AssetsPage'
import AssetDetailPage from './pages/AssetDetailPage'
import StatusPage from './pages/StatusPage'

const NAV = [
  { to: '/app', label: 'Swap', short: 'Swap', end: true, icon: 'M4 8h11l-3-3M16 12H5l3 3' },
  { to: '/app/orders', label: 'Orders', short: 'Orders', end: false, icon: 'M5 4h10v12H5zM8 8h4M8 11h4' },
  { to: '/app/portfolio', label: 'Portfolio', short: 'Portfolio', end: false, icon: 'M4 15V9M8 15V5M12 15v-4M16 15V7' },
  { to: '/app/assets', label: 'Assets', short: 'Assets', end: false, icon: 'M10 3l6 3.5v7L10 17l-6-3.5v-7zM10 10l6-3.5M10 10v7M10 10L4 6.5' },
  { to: '/app/status', label: 'Route status', short: 'Status', end: false, icon: 'M3 10h3l2-5 4 10 2-5h3' },
]

function NavIcon({ d, size = 20 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d={d} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function OpenBadge({ count }: { count: number }) {
  return count > 0 ? <span className="rounded-full bg-ember-40 px-2 text-[12px] font-semibold leading-5 text-white">{count}</span> : null
}

function Shell() {
  const orders = useOrders()
  const open = orders.filter((o) => !o.buy).length
  return (
    <div className="min-h-screen bg-ink-98 text-darkest">
      <header className="sticky top-0 z-40 border-b border-veil-black-16 bg-white/85 backdrop-blur">
        <div className="flex h-[64px] sm:h-[72px] items-center justify-between gap-4 px-4 xs:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <a href="/" aria-label="Nerogate home" className="flex">
              <Logo className="h-7 sm:h-8 w-auto" />
            </a>
            <span className="hidden xs:inline-flex rounded-full bg-[#f2e9e0] px-3 py-1 text-label-sm text-ink-10">App</span>
          </div>
          <WalletButton />
        </div>
      </header>

      <div className="flex">
        <aside className="hidden sm:flex w-[248px] flex-none flex-col gap-1 border-r border-veil-black-16 bg-white px-4 py-6 min-h-[calc(100vh-72px)] sticky top-[72px] self-start">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cx(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-label-md transition',
                  isActive ? 'bg-[#fdf1e8] text-ember-40' : 'text-ink-30 hover:bg-ink-98 hover:text-darkest',
                )
              }
            >
              <NavIcon d={n.icon} />
              <span className="flex-1">{n.label}</span>
              {n.label === 'Orders' && <OpenBadge count={open} />}
            </NavLink>
          ))}
          <div className="mt-auto rounded-2xl bg-ink-98 p-4 text-body-sm text-ink-30">
            No account. Orders are remembered in this browser only.
            <a href="/#how-it-works" className="mt-2 block text-label-sm text-ember-40">
              How it works
            </a>
          </div>
        </aside>

        {/* Bottom padding on phones keeps content clear of the tab bar. */}
        <main className="flex-1 min-w-0 px-4 xs:px-6 lg:px-10 pt-6 sm:py-10 pb-[calc(96px+env(safe-area-inset-bottom))] sm:pb-10">
          <div className="mx-auto w-full max-w-[1120px]">
            <Routes>
              <Route index element={<SwapPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/:id" element={<OrderPage />} />
              <Route path="portfolio" element={<PortfolioPage />} />
              <Route path="assets" element={<AssetsPage />} />
              <Route path="assets/:symbol" element={<AssetDetailPage />} />
              <Route path="status" element={<StatusPage />} />
              <Route path="*" element={<SwapPage />} />
            </Routes>
          </div>
        </main>
      </div>

      {/* Phone navigation: a bottom tab bar within thumb reach. */}
      <nav
        aria-label="Dashboard"
        className="sm:hidden fixed inset-x-0 bottom-0 z-40 border-t border-veil-black-16 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
      >
        <ul className="grid grid-cols-5">
          {NAV.map((n) => (
            <li key={n.to}>
              <NavLink
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  cx(
                    'relative flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium leading-none transition-colors',
                    isActive ? 'text-ember-40' : 'text-ink-50',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={cx('absolute top-0 h-0.5 w-8 rounded-full transition-colors', isActive ? 'bg-ember-40' : 'bg-transparent')} />
                    <span className="relative">
                      <NavIcon d={n.icon} size={22} />
                      {n.label === 'Orders' && open > 0 && (
                        <span className="absolute -right-2 -top-1 min-w-4 rounded-full bg-ember-40 px-1 text-center text-[10px] leading-4 text-white">{open}</span>
                      )}
                    </span>
                    {n.short}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

/** /app. Reown AppKit is created inside ./wallet, so the marketing site never loads it. */
export default function Dashboard() {
  usePageMeta(
    'Nerogate App | Swap XMR for tokenized stocks, ETFs and gold',
    'Get a live quote, pay with XMR from any wallet and receive SPYx, QQQx, GLDx, NVDAx, USDC or SOL at your own Solana address.',
    '/app',
  )
  return (
    <SWRConfig value={{ revalidateOnFocus: true, dedupingInterval: 4000 }}>
      <Shell />
    </SWRConfig>
  )
}
