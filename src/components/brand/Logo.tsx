import { LOGO_HEIGHT, LOGO_WIDTH, MARK_ARCH, MARK_ARROW, WORDMARK } from './logoPaths'

/** Nerogate logo, one inline SVG. `inverted` is the version for dark backgrounds. */
export function Logo({ inverted = false, className }: { inverted?: boolean; className?: string }) {
  const arch = inverted ? '#ff7a33' : 'var(--color-highlighted)'
  const ink = inverted ? '#ffffff' : 'var(--color-darkest)'
  return (
    <svg
      className={className}
      viewBox={`0 0 ${LOGO_WIDTH} ${LOGO_HEIGHT}`}
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      role="img"
      aria-label="Nerogate"
    >
      <path d={MARK_ARCH} fill="none" stroke={arch} strokeWidth={4.6} strokeLinecap="round" style={{ transition: 'stroke .3s' }} />
      <path d={MARK_ARROW} fill="none" stroke={ink} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'stroke .3s' }} />
      <path d={WORDMARK} fill={ink} style={{ transition: 'fill .3s' }} />
    </svg>
  )
}
