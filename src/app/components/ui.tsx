import { useEffect, useState, type ReactNode } from 'react'
import QRCode from 'qrcode'
import type { Asset } from '../lib/assets'
import type { Stage } from '../lib/api'
import { cx } from '@/lib/cx'
import { scopeSvgIds } from '@/lib/svg'

/** White panel used across the dashboard (same border + radius as the site's cards). */
export function Panel({ children, className, title, action }: { children: ReactNode; className?: string; title?: ReactNode; action?: ReactNode }) {
  return (
    <section className={cx('rounded-3xl border border-veil-black-16 bg-white', className)}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-4 px-6 pt-6">
          {title && <h2 className="text-title-sm text-darkest">{title}</h2>}
          {action}
        </header>
      )}
      <div className="p-6">{children}</div>
    </section>
  )
}

export function PageHead({ title, sub, action }: { title: string; sub?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 xs:flex-row xs:items-end xs:justify-between">
      <div className="flex flex-col gap-2">
        <h1 className="text-headline-sm text-darkest">{title}</h1>
        {sub && <p className="text-body-md text-ink-30 max-w-[620px]">{sub}</p>}
      </div>
      {action}
    </div>
  )
}

// Official token icons (sources in src/assets/tokens/SOURCES.md), inlined as SVG.
const tokenIcons = import.meta.glob<string>('/src/assets/tokens/*.svg', { query: '?raw', import: 'default', eager: true })
let iconSeq = 0

/** Token icon in a circle. Falls back to a ticker monogram if a file is missing. */
export function AssetBadge({ asset, size = 36 }: { asset: Asset; size?: number }) {
  const raw = tokenIcons[`/src/assets/tokens/${asset.symbol}.svg`]
  const [svg] = useState(() => (raw ? scopeSvgIds(raw, `tk${iconSeq++}`) : ''))
  if (svg) {
    return (
      <span
        className="inline-flex flex-none overflow-hidden rounded-full bg-white ring-1 ring-black/5 [&>svg]:h-full [&>svg]:w-full"
        style={{ width: size, height: size }}
        role="img"
        aria-label={`${asset.symbol} icon`}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    )
  }
  const label = asset.symbol.replace(/x$/, '').slice(0, 4)
  return (
    <span
      className="inline-flex flex-none items-center justify-center rounded-full bg-[#f2e9e0] font-semibold text-ink-10"
      style={{ width: size, height: size, fontSize: size * 0.3 }}
      aria-hidden="true"
    >
      {label}
    </span>
  )
}

const STAGE_LABEL: Record<Stage, string> = {
  deposit: 'Awaiting XMR',
  confirming: 'Confirming deposit',
  exchanging: 'Exchanging to ETH',
  delivered: 'ETH delivered',
  expired: 'Expired',
  refunded: 'Refunded',
  failed: 'Needs attention',
}

export function StagePill({ stage, bought }: { stage: Stage; bought?: boolean }) {
  const label = bought ? 'Complete' : STAGE_LABEL[stage]
  const tone = bought
    ? 'bg-[#e3f4e8] text-[#1d6b3a]'
    : stage === 'delivered'
      ? 'bg-[#fdebdc] text-ember-40'
      : stage === 'expired' || stage === 'failed'
        ? 'bg-[#f3e3e0] text-[#9b2c1f]'
        : stage === 'refunded'
          ? 'bg-[#eceae7] text-ink-30'
          : 'bg-[#f2e9e0] text-ink-10'
  const live = !bought && (stage === 'deposit' || stage === 'confirming' || stage === 'exchanging')
  return (
    <span className={cx('inline-flex items-center gap-2 rounded-full px-3 py-1 text-label-sm whitespace-nowrap', tone)}>
      {live && <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />}
      {label}
    </span>
  )
}

export function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value)
          setDone(true)
          setTimeout(() => setDone(false), 1600)
        } catch {
          /* clipboard blocked: the value is still selectable on screen */
        }
      }}
      className="btn state-layer btn-bg-secondary px-3 py-1.5 text-label-sm"
    >
      {done ? 'Copied' : label}
    </button>
  )
}

export function QR({ value, size = 184 }: { value: string; size?: number }) {
  const [svg, setSvg] = useState('')
  useEffect(() => {
    let live = true
    QRCode.toString(value, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#19140f', light: '#ffffff' } })
      .then((s) => live && setSvg(s))
      .catch(() => live && setSvg(''))
    return () => {
      live = false
    }
  }, [value])
  return (
    <div className="flex-none rounded-2xl bg-white p-3 border border-veil-black-16" style={{ width: size + 24, height: size + 24 }}>
      <div className="w-full h-full [&_svg]:w-full [&_svg]:h-full" role="img" aria-label="QR code of the deposit address" dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  )
}

export function Row({ label, children, strong }: { label: ReactNode; children: ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-veil-black-16 last:border-0">
      <span className="text-body-sm text-ink-30">{label}</span>
      <span className={cx('text-right text-body-sm', strong ? 'text-darkest font-semibold' : 'text-darkest')}>{children}</span>
    </div>
  )
}

export function Field({ label, hint, error, children, htmlFor }: { label: string; hint?: ReactNode; error?: ReactNode; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-label-sm text-darkest">
        {label}
      </label>
      {children}
      {error ? <p className="text-body-sm text-[#9b2c1f]">{error}</p> : hint ? <p className="text-body-sm text-ink-50">{hint}</p> : null}
    </div>
  )
}

export const inputCls =
  'w-full rounded-2xl border border-veil-black-16 bg-white px-4 py-3 text-body-md text-darkest placeholder:text-ink-50 outline-none transition focus:border-[color:var(--color-highlighted)] focus:ring-4 focus:ring-[#ff7a331f]'

export function ActionButton({
  children,
  onClick,
  disabled,
  variant = 'primary',
  type = 'button',
  full,
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary'
  type?: 'button' | 'submit'
  full?: boolean
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        'btn state-layer justify-center px-5 py-3 text-label-md transition-opacity',
        variant === 'primary' ? 'btn-bg-primary' : 'btn-bg-secondary',
        full && 'w-full',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      {children}
    </button>
  )
}

export function Notice({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'warn' | 'error' | 'ok' }) {
  const cls = {
    neutral: 'bg-ink-98 border-veil-black-16 text-ink-30',
    warn: 'bg-[#fdf3e7] border-[#f3d3ad] text-[#7a4a12]',
    error: 'bg-[#fbecea] border-[#efc3bd] text-[#8a2a1d]',
    ok: 'bg-[#e9f6ee] border-[#bfe3cb] text-[#1d6b3a]',
  }[tone]
  return <div className={cx('rounded-2xl border px-4 py-3 text-body-sm', cls)}>{children}</div>
}

export function Skeleton({ className }: { className?: string }) {
  return <span className={cx('inline-block rounded-md bg-[#f2e9e0] animate-pulse', className)} />
}
