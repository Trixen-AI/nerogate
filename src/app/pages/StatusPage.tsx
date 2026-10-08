import type { ReactNode } from 'react'
import useSWR from 'swr'
import { ActionButton, Notice, PageHead, Panel, Row } from '../components/ui'
import { USDC_MINT } from '../lib/assets'
import { getQuote, getThorXmrStatus, getXmrSolRate, LAMPORTS } from '../lib/api'
import { num } from '../lib/format'
import { connection } from '../lib/connection'
import { cx } from '@/lib/cx'

async function timed<T>(fn: () => Promise<T>) {
  const t = performance.now()
  const value = await fn()
  return { value, ms: Math.round(performance.now() - t) }
}

type Health = 'ok' | 'warn' | 'down' | 'checking'

function Dot({ h }: { h: Health }) {
  return (
    <span
      className={cx(
        'inline-block h-2.5 w-2.5 rounded-full',
        h === 'ok' ? 'bg-[#2f9e5b]' : h === 'warn' ? 'bg-[#e0a03a]' : h === 'down' ? 'bg-[#c4402f]' : 'bg-[#d8cfc5] animate-pulse',
      )}
    />
  )
}

function Check({ title, role, health, summary, children }: { title: string; role: string; health: Health; summary: string; children?: ReactNode }) {
  return (
    <Panel>
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-title-sm text-darkest">{title}</p>
            <p className="text-body-sm text-ink-50">{role}</p>
          </div>
          <span className="inline-flex items-center gap-2 text-label-sm text-darkest whitespace-nowrap">
            <Dot h={health} /> {summary}
          </span>
        </div>
        {children && <div>{children}</div>}
      </div>
    </Panel>
  )
}

const opts = { refreshInterval: 60_000, shouldRetryOnError: false, revalidateOnFocus: false }

export default function StatusPage() {
  const exolix = useSWR('status-exolix', () => timed(() => getXmrSolRate(1)), opts)
  const jupiter = useSWR('status-jupiter', () => timed(() => getQuote(USDC_MINT, BigInt(0.1 * LAMPORTS))), opts)
  const rpc = useSWR('status-rpc', () => timed(() => connection.getSlot('confirmed')), opts)
  const thor = useSWR('status-thor', () => timed(() => getThorXmrStatus()), opts)

  const h = (s: { data?: unknown; error?: unknown; isLoading: boolean }): Health => (s.isLoading && !s.data ? 'checking' : s.error ? 'down' : 'ok')
  const thorHealth: Health = thor.isLoading && !thor.data ? 'checking' : thor.data?.value.reachable ? 'ok' : 'down'
  const thorSummary = !thor.data ? (thor.isLoading ? 'Checking…' : 'Unreachable') : thor.data.value.reachable ? `Online · ${thor.data.ms} ms` : 'Unreachable'

  return (
    <div className="flex flex-col gap-8">
      <PageHead
        title="Route status"
        sub="Live checks against every service a swap depends on. Re-run every minute."
        action={
          <ActionButton
            variant="secondary"
            onClick={() => {
              exolix.mutate()
              jupiter.mutate()
              rpc.mutate()
              thor.mutate()
            }}
          >
            Run checks again
          </ActionButton>
        }
      />

      <div className="grid grid-cols-1 xs:grid-cols-2 gap-6">
        <Check
          title="Exolix"
          role="Leg 1 · XMR → SOL instant exchange"
          health={h(exolix)}
          summary={exolix.data ? `Quoting · ${exolix.data.ms} ms` : exolix.error ? 'Not quoting' : 'Checking…'}
        >
          {exolix.data && (
            <>
              <Row label="1 XMR">{num(exolix.data.value.toAmount, 5)} SOL</Row>
              <Row label="Accepted amount">
                {num(exolix.data.value.minAmount)} to {num(exolix.data.value.maxAmount)} XMR
              </Row>
            </>
          )}
          {exolix.error && <Notice tone="error">{(exolix.error as Error).message}</Notice>}
        </Check>

        <Check
          title="Jupiter"
          role="Leg 2 · SOL → asset swap routing"
          health={h(jupiter)}
          summary={jupiter.data ? `Routing · ${jupiter.data.ms} ms` : jupiter.error ? 'Not routing' : 'Checking…'}
        >
          {jupiter.data && (
            <>
              <Row label="0.1 SOL">{num(Number(jupiter.data.value.outAmount) / 1e6, 4)} USDC</Row>
              <Row label="Route">{jupiter.data.value.routePlan.map((r) => r.swapInfo.label).filter(Boolean).join(' → ')}</Row>
            </>
          )}
          {jupiter.error && <Notice tone="error">{(jupiter.error as Error).message}</Notice>}
        </Check>

        <Check
          title="Solana RPC"
          role="Balances, confirmations and sending your signature"
          health={h(rpc)}
          summary={rpc.data ? `Synced · ${rpc.data.ms} ms` : rpc.error ? 'Unreachable' : 'Checking…'}
        >
          {rpc.data && (
            <>
              <Row label="Current slot">{rpc.data.value.toLocaleString('en-US')}</Row>
              <Row label="Solana">Mainnet</Row>
            </>
          )}
          {rpc.error && <Notice tone="error">{(rpc.error as Error).message}</Notice>}
        </Check>

        <Check title="THORChain" role="Planned non-custodial route for leg 1" health={thorHealth} summary={thorSummary}>
          {thor.data?.value.reachable && <Row label="Pools on mainnet">{thor.data.value.pools}</Row>}
        </Check>
      </div>
    </div>
  )
}
