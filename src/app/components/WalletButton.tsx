import { short } from '../lib/format'
import { useWallet } from '../wallet'
import { cx } from '@/lib/cx'

/** Connect / account button, styled like the site's primary button. */
export function WalletButton({ className, label = 'Connect wallet' }: { className?: string; label?: string }) {
  const { address, connected, open, configured } = useWallet()
  return (
    <button
      type="button"
      onClick={open}
      title={configured ? undefined : 'Set VITE_REOWN_PROJECT_ID to enable wallet connection'}
      className={cx(
        'btn state-layer items-center gap-2 px-4 py-2.5 text-label-md whitespace-nowrap',
        connected ? 'btn-bg-secondary' : 'btn-bg-primary',
        className,
      )}
    >
      {connected && <span className="h-2 w-2 rounded-full bg-[#2f9e5b]" aria-hidden="true" />}
      {connected && address ? short(address, 4, 4) : label}
    </button>
  )
}
