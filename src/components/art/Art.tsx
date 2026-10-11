import { useId, type ReactNode } from 'react'
import './art.css'

/*
  Nerogate drawing grammar
  - grounds: warm cream to peach (light) or ink with one ember glow (dark)
  - subjects: thick "coins" (face + rim), token plates with a ticker, the gate arch from the logo
  - connectors: dotted routes that flow left to right (value moving through the gate)
  - type: Inter, tabular, used only for tickers and amounts
*/
const INK = '#19140f'
const INK_SOFT = '#4b443d'
const CREAM = '#fff8f2'
const SAND = '#f3e3d3'
const EMBER = '#e8590c'
const EMBER_D = '#c8400c'
const EMBER_L = '#ff8a4c'
const GLOW = '#ff7a33'

type Tone = 'ember' | 'cream' | 'ink'

function useIds() {
  const id = useId().replace(/:/g, '')
  return (k: string) => `${id}-${k}`
}

function Frame({
  w,
  h,
  dark = false,
  children,
  glow = [0.7, 0.35],
  fit = 'slice',
}: {
  w: number
  h: number
  dark?: boolean
  children: ReactNode
  glow?: [number, number]
  /** slice: paints its own ground and fills the box. meet: whole scene, drawn on the card's own background. */
  fit?: 'slice' | 'meet'
}) {
  const id = useIds()
  return (
    <div className="art w-full h-full" aria-hidden="true">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio={`xMidYMid ${fit}`}>
        <defs>
          <linearGradient id={id('bg')} x1="0" y1="0" x2="1" y2="1">
            {dark ? (
              <>
                <stop offset="0" stopColor="#120e0b" />
                <stop offset="1" stopColor="#050403" />
              </>
            ) : (
              <>
                <stop offset="0" stopColor="#fdeee2" />
                <stop offset="1" stopColor="#f6bf98" />
              </>
            )}
          </linearGradient>
          <radialGradient id={id('glow')} cx={glow[0]} cy={glow[1]} r="0.6">
            <stop offset="0" stopColor={dark ? GLOW : '#ffffff'} stopOpacity={dark ? 0.32 : 0.7} />
            <stop offset="1" stopColor={dark ? GLOW : '#ffffff'} stopOpacity="0" />
          </radialGradient>
        </defs>
        {fit === 'slice' && (
          <>
            <rect width={w} height={h} fill={`url(#${id('bg')})`} />
            <rect width={w} height={h} fill={`url(#${id('glow')})`} />
          </>
        )}
        {children}
      </svg>
    </div>
  )
}

/** A thick coin: rim offset below the face, label in the middle. */
function Coin({
  x,
  y,
  r,
  label,
  tone = 'ember',
  className,
  size,
}: {
  x: number
  y: number
  r: number
  label?: string
  tone?: Tone
  className?: string
  size?: number
}) {
  const face = { ember: EMBER, cream: CREAM, ink: '#2a231d' }[tone]
  const rim = { ember: EMBER_D, cream: '#e2c9b1', ink: '#0d0a08' }[tone]
  const text = tone === 'cream' ? INK : '#ffffff'
  const t = Math.max(3, r * 0.16)
  return (
    <g className={className}>
      <ellipse cx={x} cy={y + t} rx={r} ry={r} fill={rim} />
      <circle cx={x} cy={y} r={r} fill={face} />
      <circle cx={x} cy={y} r={r * 0.78} fill="none" stroke={text} strokeOpacity="0.22" strokeWidth={Math.max(1, r * 0.05)} />
      {label && (
        <text
          x={x}
          y={y}
          dy="0.35em"
          textAnchor="middle"
          fill={text}
          fontFamily="Inter Variable, Inter, sans-serif"
          fontWeight="600"
          fontSize={size ?? r * 0.48}
          letterSpacing="-0.02em"
        >
          {label}
        </text>
      )}
    </g>
  )
}

/** A token plate: rounded card with a ticker and a short rule. */
function Plate({
  x,
  y,
  w,
  h,
  label,
  sub,
  tone = 'cream',
  className,
}: {
  x: number
  y: number
  w: number
  h: number
  label: string
  sub?: string
  tone?: Tone
  className?: string
}) {
  const fill = { ember: EMBER, cream: CREAM, ink: '#1d1814' }[tone]
  const ink = tone === 'cream' ? INK : '#ffffff'
  return (
    <g className={className}>
      <rect x={x} y={y + 5} width={w} height={h} rx={h * 0.28} fill={tone === 'cream' ? '#e5cbb3' : '#000'} opacity={tone === 'cream' ? 1 : 0.5} />
      <rect x={x} y={y} width={w} height={h} rx={h * 0.28} fill={fill} />
      <text x={x + w * 0.12} y={y + h * (sub ? 0.43 : 0.5)} dy="0.35em" fill={ink} fontFamily="Inter Variable, Inter, sans-serif" fontWeight="600" fontSize={h * 0.3}>
        {label}
      </text>
      {sub && (
        <text x={x + w * 0.12} y={y + h * 0.72} dy="0.35em" fill={ink} opacity="0.6" fontFamily="Inter Variable, Inter, sans-serif" fontWeight="500" fontSize={h * 0.17}>
          {sub}
        </text>
      )}
    </g>
  )
}

/** The gate arch from the logo. */
function Gate({ x, y, w, h, stroke = EMBER, width = 10, className }: { x: number; y: number; w: number; h: number; stroke?: string; width?: number; className?: string }) {
  const r = w / 2
  return (
    <path
      className={className}
      d={`M${x} ${y + h}V${y + r}a${r} ${r} 0 0 1 ${w} 0V${y + h}`}
      fill="none"
      stroke={stroke}
      strokeWidth={width}
      strokeLinecap="round"
    />
  )
}

/** Dotted flowing route. */
function Route({ d, stroke = INK, className = 'flow', width = 2.4, opacity = 0.55 }: { d: string; stroke?: string; className?: string; width?: number; opacity?: number }) {
  return <path d={d} fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" opacity={opacity} className={className} />
}

/** A dot that travels along a path (CSS offset-path). */
function Traveller({ d, r = 5, fill = EMBER, delay = '' }: { d: string; r?: number; fill?: string; delay?: string }) {
  return <circle r={r} cx="0" cy="0" fill={fill} className={`travel ${delay}`} style={{ offsetPath: `path('${d}')` }} />
}

function Lines({ x, y, w, n, gap = 12, stroke = INK, opacity = 0.25 }: { x: number; y: number; w: number; n: number; gap?: number; stroke?: string; opacity?: number }) {
  return (
    <g stroke={stroke} strokeOpacity={opacity} strokeWidth="4" strokeLinecap="round">
      {Array.from({ length: n }, (_, i) => (
        <path key={i} d={`M${x} ${y + i * gap}h${i === n - 1 ? w * 0.55 : w}`} />
      ))}
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* Wide card art (290 x 220)                                            */
/* ------------------------------------------------------------------ */

const W = 290
const H = 220

const wide: Record<string, () => ReactNode> = {
  quote: () => (
    <Frame w={W} h={H}>
      <rect x="34" y="40" width="222" height="140" rx="22" fill={CREAM} />
      <text x="56" y="72" fontFamily="Inter Variable, sans-serif" fontSize="11" fill={INK_SOFT}>You pay</text>
      <text x="56" y="100" fontFamily="Inter Variable, sans-serif" fontWeight="600" fontSize="24" fill={INK}>0.5 XMR</text>
      <path d="M56 116h178" stroke={SAND} strokeWidth="2" />
      <text x="56" y="140" fontFamily="Inter Variable, sans-serif" fontSize="11" fill={INK_SOFT}>You receive ≈</text>
      <text x="56" y="164" fontFamily="Inter Variable, sans-serif" fontWeight="600" fontSize="18" fill={EMBER_D}>0.356 SPYx</text>
      <Coin x={214} y={92} r={18} label="XMR" tone="ink" className="float" size={8} />
      <Coin x={222} y={150} r={14} label="x" className="float-2" size={11} />
    </Frame>
  ),
  address: () => (
    <Frame w={W} h={H} glow={[0.3, 0.3]}>
      <rect x="30" y="86" width="230" height="52" rx="26" fill={CREAM} />
      <circle cx="58" cy="112" r="12" fill={EMBER} />
      <path d="M53 112h10M59 107l5 5-5 5" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <g fill={INK}>
        {Array.from({ length: 14 }, (_, i) => (
          <circle key={i} cx={84 + i * 11} cy="112" r="3.2" opacity={i > 3 && i < 10 ? 0.25 : 0.85} className={i === 13 ? 'blink' : undefined} />
        ))}
      </g>
      <Route d="M60 60 C 110 20, 180 20, 230 60" className="flow-slow" />
      <Route d="M60 164 C 110 204, 180 204, 230 164" className="flow-slow" />
      <Coin x={60} y={58} r={11} tone="ink" className="float" />
      <Coin x={230} y={166} r={11} className="float-2" />
    </Frame>
  ),
  index: () => (
    <Frame w={W} h={H}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={46 + i * 34} y={170 - (i * 16 + 26)} width="22" height={i * 16 + 26} rx="6" fill={i % 2 ? EMBER : CREAM} className="tick" style={{ animationDelay: `${-i * 0.5}s` }} />
      ))}
      <Plate x={150} y={30} w={96} h={40} label="SPYx" tone="ink" className="float" />
      <Plate x={44} y={30} w={96} h={40} label="QQQx" className="float-2" />
      <path d="M40 182h214" stroke={INK} strokeOpacity="0.2" strokeWidth="2" />
    </Frame>
  ),
  gold: () => (
    <Frame w={W} h={H} glow={[0.5, 0.2]}>
      {[
        [70, 132],
        [150, 132],
        [110, 92],
      ].map(([x, y], i) => (
        <g key={i} className={i === 2 ? 'float' : undefined}>
          <path d={`M${x} ${y + 40}l12-40h56l12 40z`} fill="#d89a3a" />
          <path d={`M${x + 12} ${y}h56l-6 -8h-44z`} fill="#f6d189" />
        </g>
      ))}
      <Plate x={186} y={34} w={76} h={34} label="GLDx" tone="ink" className="float-2" />
    </Frame>
  ),
  stocks: () => (
    <Frame w={W} h={H}>
      {['NVDAx', 'TSLAx', 'AAPLx', 'MSFTx', 'METAx', 'COINx'].map((t, i) => (
        <Plate
          key={t}
          x={34 + (i % 2) * 116}
          y={34 + Math.floor(i / 2) * 54}
          w={104}
          h={40}
          label={t}
          tone={i === 0 ? 'ember' : i === 3 ? 'ink' : 'cream'}
          className={i % 3 === 0 ? 'float' : i % 3 === 1 ? 'float-2' : 'float-3'}
        />
      ))}
    </Frame>
  ),
  usdc: () => (
    <Frame w={W} h={H} glow={[0.4, 0.3]}>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <ellipse cx="145" cy={168 - i * 16} rx="62" ry="18" fill={i % 2 ? '#e2c9b1' : '#d2b497'} />
          <ellipse cx="145" cy={162 - i * 16} rx="62" ry="18" fill={CREAM} />
        </g>
      ))}
      <g className="float">
        <ellipse cx="145" cy="78" rx="62" ry="18" fill="#2f5fb3" />
        <ellipse cx="145" cy="72" rx="62" ry="18" fill="#3e74d1" />
        <text x="145" y="72" dy="0.35em" textAnchor="middle" fill="#fff" fontFamily="Inter Variable, sans-serif" fontWeight="700" fontSize="16">USDC</text>
      </g>
    </Frame>
  ),
  eth: () => (
    <Frame w={W} h={H} dark glow={[0.5, 0.45]}>
      <Coin x={145} y={104} r={50} label="ETH" tone="ink" className="float" />
      <circle cx="145" cy="108" r="78" fill="none" stroke={GLOW} strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="2 8" className="spin" />
      <circle cx="145" cy="108" r="98" fill="none" stroke={GLOW} strokeOpacity="0.18" strokeWidth="1.5" />
    </Frame>
  ),
  keys: () => (
    <Frame w={W} h={H}>
      <Gate x={98} y={40} w={94} h={140} width={16} />
      <g className="float" transform="translate(0 0)">
        <circle cx="145" cy="104" r="20" fill="none" stroke={INK} strokeWidth="9" />
        <path d="M145 124v44M145 150h16M145 162h12" stroke={INK} strokeWidth="9" strokeLinecap="round" />
      </g>
    </Frame>
  ),
  community: () => (
    <Frame w={W} h={H} glow={[0.5, 0.6]}>
      {[
        [80, 96, CREAM],
        [118, 80, EMBER_L],
        [160, 92, '#2a231d'],
        [200, 104, CREAM],
      ].map(([x, y, c], i) => (
        <g key={i} className={i % 2 ? 'float' : 'float-2'}>
          <circle cx={x as number} cy={(y as number) + 4} r="24" fill="#000" opacity="0.08" />
          <circle cx={x as number} cy={y as number} r="24" fill={c as string} stroke="#fff" strokeWidth="3" />
        </g>
      ))}
      <Coin x={145} y={160} r={26} label="$NERO" size={10} className="float-3" />
    </Frame>
  ),
  notes: () => (
    <Frame w={W} h={H} glow={[0.3, 0.3]}>
      <g className="float-2">
        <rect x="104" y="34" width="132" height="160" rx="16" fill="#e5cbb3" transform="rotate(8 170 114)" />
      </g>
      <g className="float">
        <rect x="70" y="30" width="132" height="160" rx="16" fill={CREAM} />
        <Lines x={92} y={64} w={86} n={5} gap={18} />
        <circle cx="186" cy="174" r="18" fill={EMBER} />
        <path d="M178 174l6 6 11-12" stroke="#fff" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </Frame>
  ),
}

/* ------------------------------------------------------------------ */
/* Tall card art (320 x 180)                                            */
/* ------------------------------------------------------------------ */

const TW = 320
const TH = 180

const tall: Record<string, () => ReactNode> = {
  noaccount: () => (
    <Frame w={TW} h={TH}>
      <g className="float">
        <rect x="104" y="30" width="112" height="124" rx="14" fill={CREAM} />
        <rect x="120" y="50" width="80" height="14" rx="7" fill={SAND} />
        <rect x="120" y="74" width="80" height="14" rx="7" fill={SAND} />
        <rect x="120" y="98" width="80" height="14" rx="7" fill={SAND} />
        <rect x="120" y="124" width="46" height="16" rx="8" fill={INK} opacity="0.2" />
      </g>
      <path d="M92 150L228 34" stroke={EMBER} strokeWidth="9" strokeLinecap="round" />
    </Frame>
  ),
  onetime: () => (
    <Frame w={TW} h={TH} glow={[0.5, 0.4]}>
      <rect x="112" y="26" width="96" height="96" rx="12" fill={CREAM} />
      <g fill={INK}>
        {Array.from({ length: 36 }, (_, i) => {
          const cx = i % 6
          const cy = Math.floor(i / 6)
          const on = (cx * 7 + cy * 5 + cx * cy) % 3 !== 0
          return on ? <rect key={i} x={122 + cx * 13} y={36 + cy * 13} width="10" height="10" rx="2" className={i % 7 === 0 ? 'blink' : undefined} /> : null
        })}
      </g>
      <Plate x={128} y={130} w={64} h={30} label="1 use" tone="ember" className="float" />
    </Frame>
  ),
  destination: () => {
    const d = 'M50 120 C 110 120, 120 60, 170 60 S 240 90, 268 90'
    return (
      <Frame w={TW} h={TH}>
        <Route d={d} />
        <Traveller d={d} />
        <Traveller d={d} delay="travel-b" r={4} fill={INK} />
        <Coin x={50} y={120} r={16} tone="ink" />
        <g className="float">
          <path d="M268 50c-14 0-24 10-24 23 0 17 24 37 24 37s24-20 24-37c0-13-10-23-24-23z" fill={EMBER} />
          <circle cx="268" cy="73" r="8" fill={CREAM} />
        </g>
      </Frame>
    )
  },
  refund: () => {
    const d = 'M232 70 C 232 20, 88 20, 88 70'
    return (
      <Frame w={TW} h={TH}>
        <Route d={d} className="flow-slow" stroke={EMBER_D} opacity={0.7} />
        <Traveller d={d} fill={EMBER} />
        <Coin x={88} y={100} r={30} label="XMR" tone="ink" className="float" />
        <g className="float-2">
          <rect x="196" y="84" width="72" height="44" rx="12" fill={CREAM} />
          <path d="M214 106h36M224 96l-10 10 10 10" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </Frame>
    )
  },
  wallet: () => (
    <Frame w={TW} h={TH} dark glow={[0.5, 0.5]}>
      <g className="float">
        <rect x="100" y="52" width="120" height="84" rx="16" fill="#241d18" stroke={GLOW} strokeOpacity="0.5" />
        <rect x="174" y="80" width="56" height="28" rx="10" fill={EMBER} />
        <circle cx="190" cy="94" r="5" fill="#fff" />
      </g>
      <rect x="112" y="40" width="96" height="20" rx="8" fill="#3a2f27" />
    </Frame>
  ),
  aggregator: () => {
    const paths = ['M40 50 C 120 50, 150 90, 240 90', 'M40 90 C 120 90, 150 90, 240 90', 'M40 130 C 120 130, 150 90, 240 90']
    return (
      <Frame w={TW} h={TH} dark glow={[0.75, 0.5]}>
        {paths.map((d, i) => (
          <g key={i}>
            <Route d={d} stroke={GLOW} opacity={0.5} className="flow-slow" />
            <Traveller d={d} fill={EMBER_L} r={4} delay={['', 'travel-b', 'travel-c'][i]} />
            <circle cx="40" cy={50 + i * 40} r="7" fill="#3a2f27" />
          </g>
        ))}
        <Coin x={252} y={90} r={22} tone="ember" className="pulse" />
      </Frame>
    )
  },
  thor: () => (
    <Frame w={TW} h={TH} dark glow={[0.5, 0.5]}>
      <rect x="116" y="70" width="88" height="44" rx="22" fill="#241d18" stroke={GLOW} strokeOpacity="0.45" />
      <g className="toggle">
        <circle cx="140" cy="92" r="16" fill={EMBER} />
      </g>
      <text x="160" y="140" textAnchor="middle" fontFamily="Inter Variable, sans-serif" fontSize="11" fill="#9d948a">non-custodial route</text>
    </Frame>
  ),
  edge: () => (
    <Frame w={TW} h={TH} dark glow={[0.5, 0.5]}>
      <g className="spin">
        <circle cx="160" cy="90" r="56" fill="none" stroke={GLOW} strokeOpacity="0.35" />
        <ellipse cx="160" cy="90" rx="56" ry="20" fill="none" stroke={GLOW} strokeOpacity="0.25" />
        <ellipse cx="160" cy="90" rx="22" ry="56" fill="none" stroke={GLOW} strokeOpacity="0.25" />
      </g>
      {[
        [118, 60],
        [204, 72],
        [180, 128],
        [128, 120],
        [160, 36],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="5" fill={EMBER_L} className={i % 2 ? 'pulse' : 'pulse-2'} />
      ))}
    </Frame>
  ),
  'eth-address': () => (
    <Frame w={TW} h={TH}>
      <g className="float">
        <rect x="70" y="62" width="180" height="48" rx="24" fill={CREAM} />
        <circle cx="96" cy="86" r="12" fill={INK} />
        <g fill={INK}>
          {Array.from({ length: 10 }, (_, i) => (
            <circle key={i} cx={122 + i * 11} cy="86" r="3" opacity={i > 2 && i < 7 ? 0.25 : 0.85} />
          ))}
        </g>
      </g>
      <rect x="130" y="124" width="60" height="22" rx="11" fill={EMBER} className="float-2" />
      <text x="160" y="135" dy="0.35em" textAnchor="middle" fontFamily="Inter Variable, sans-serif" fontWeight="600" fontSize="10" fill="#fff" className="float-2">paste</text>
    </Frame>
  ),
  'xmr-wallet': () => (
    <Frame w={TW} h={TH} glow={[0.5, 0.3]}>
      <g className="float-2">
        <rect x="110" y="40" width="100" height="110" rx="16" fill="#2a231d" />
        <rect x="122" y="54" width="76" height="40" rx="8" fill="#3a2f27" />
        <text x="134" y="74" dy="0.35em" fontFamily="Inter Variable, sans-serif" fontWeight="600" fontSize="13" fill="#fff">0.5 XMR</text>
        <rect x="122" y="108" width="76" height="26" rx="8" fill={EMBER} />
      </g>
      <Coin x={226} y={56} r={16} label="XMR" tone="ink" size={7} className="float" />
    </Frame>
  ),
  'refund-address': () => {
    const d = 'M220 120 C 260 120, 260 50, 200 50 L 120 50'
    return (
      <Frame w={TW} h={TH}>
        <Route d={d} className="flow" />
        <Traveller d={d} />
        <rect x="70" y="100" width="150" height="42" rx="21" fill={CREAM} />
        <text x="92" y="121" dy="0.35em" fontFamily="Inter Variable, sans-serif" fontWeight="600" fontSize="13" fill={INK}>4… or 8…</text>
        <Coin x={98} y={50} r={18} tone="ink" className="float" />
      </Frame>
    )
  },
}

/* ------------------------------------------------------------------ */
/* Ticker tiles for the "picked most often" cards                       */
/* ------------------------------------------------------------------ */

export function TickerArt({ ticker, name, index }: { ticker: string; name: string; index: number }) {
  const dark = index % 3 === 1
  const id = useIds()
  return (
    <Frame w={W} h={190} dark={dark} glow={[index % 2 ? 0.2 : 0.8, 0.2]}>
      <defs>
        <pattern id={id('p')} width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="9" cy="9" r="1.4" fill={dark ? GLOW : INK} opacity={dark ? 0.35 : 0.14} />
        </pattern>
      </defs>
      <rect width={W} height="190" fill={`url(#${id('p')})`} />
      <Gate x={196} y={52} w={64} h={120} stroke={dark ? GLOW : EMBER} width={12} />
      <text x="30" y="98" fontFamily="Hanken Grotesk Variable, sans-serif" fontWeight="600" fontSize="44" letterSpacing="-0.02em" fill={dark ? '#fff' : INK}>
        {ticker}
      </text>
      <text x="32" y="128" fontFamily="Inter Variable, sans-serif" fontWeight="500" fontSize="14" fill={dark ? '#d8cfc5' : INK_SOFT}>
        {name}
      </text>
    </Frame>
  )
}

/* ------------------------------------------------------------------ */
/* Big pieces                                                           */
/* ------------------------------------------------------------------ */

/** "No account" promise card: the gate with XMR going in and an asset coming out. */
export function PromiseArt() {
  const d = 'M70 250 C 170 250, 210 170, 290 170 S 420 110, 510 110'
  return (
    <Frame w={580} h={327} dark glow={[0.5, 0.45]}>
      <Gate x={236} y={70} w={108} h={190} stroke={GLOW} width={18} />
      <Route d={d} stroke={GLOW} opacity={0.6} className="flow-slow" width={3} />
      <Traveller d={d} r={7} fill={EMBER_L} />
      <Traveller d={d} r={5} fill="#fff" delay="travel-b" />
      <Coin x={70} y={250} r={30} label="XMR" tone="ink" className="float" />
      <Plate x={452} y={84} w={104} h={50} label="SPYx" sub="S&P 500" tone="ember" className="float-2" />
      <text x="290" y="296" textAnchor="middle" fontFamily="Inter Variable, sans-serif" fontWeight="600" fontSize="12" letterSpacing="0.3em" fill="#d8cfc5">
        MONERO IN · ASSETS OUT
      </text>
    </Frame>
  )
}

/** Leg one: XMR coins travel through the gate and land as ETH. */
export function LegOneArt() {
  const d = 'M110 140 C 200 140, 220 120, 290 120 S 400 140, 470 140'
  return (
    <Frame w={580} h={249} glow={[0.5, 0.3]} fit="meet">
      <Gate x={250} y={46} w={80} h={160} width={14} />
      <Route d={d} className="flow" width={3} />
      <Traveller d={d} r={8} />
      <Traveller d={d} r={6} fill={INK} delay="travel-b" />
      <Traveller d={d} r={7} fill={EMBER_L} delay="travel-c" />
      <Coin x={110} y={136} r={42} label="XMR" tone="ink" className="float" />
      <Coin x={470} y={136} r={42} label="ETH" tone="cream" className="float-2" />
    </Frame>
  )
}

/** Leg two (replaces the reference's looping video): ETH fans out into asset tokens. */
export function LegTwoArt() {
  const targets = [
    [440, 60, 'SPYx'],
    [470, 126, 'GLDx'],
    [440, 192, 'NVDAx'],
  ] as const
  return (
    <Frame w={580} h={249} dark glow={[0.3, 0.5]} fit="meet">
      {targets.map(([x, y], i) => {
        const d = `M150 126 C 260 126, 300 ${y}, ${x - 50} ${y}`
        return (
          <g key={i}>
            <Route d={d} stroke={GLOW} opacity={0.55} className="flow-slow" width={2.5} />
            <Traveller d={d} r={5} fill={EMBER_L} delay={['', 'travel-b', 'travel-c'][i]} />
          </g>
        )
      })}
      <Coin x={130} y={122} r={48} label="ETH" tone="ink" className="pulse" />
      {targets.map(([x, y, t], i) => (
        <Plate key={t} x={x - 50} y={y - 20} w={104} h={40} label={t} tone={i === 1 ? 'ember' : 'cream'} className={['float', 'float-2', 'float-3'][i]} />
      ))}
    </Frame>
  )
}

/** Self-custody: a key ring holding asset tokens, on white like the section. */
export function CustodyArt() {
  return (
    <div className="art w-full h-full" aria-hidden="true">
      <svg viewBox="0 0 580 436">
        <ellipse cx="300" cy="372" rx="170" ry="22" fill="#f3e3d3" />
        <g className="float">
          <Gate x={196} y={70} w={208} h={260} width={30} />
        </g>
        <Coin x={300} y={232} r={70} label="SPYx" tone="ember" className="float-2" size={30} />
        <Coin x={196} y={316} r={44} label="GLDx" tone="cream" className="float-3" size={17} />
        <Coin x={410} y={300} r={52} label="NVDAx" tone="ink" className="float" size={18} />
      </svg>
    </div>
  )
}

/** Step backgrounds for the two dark "how it works" cards: art fills the card, copy sits on top. */
export function StepArt({ step }: { step: 0 | 1 }) {
  return (
    <div className="art absolute inset-0" aria-hidden="true">
      <svg viewBox="0 0 375 400" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id={`step-glow-${step}`} cx="0.6" cy="0.55" r="0.55">
            <stop offset="0" stopColor={GLOW} stopOpacity="0.55" />
            <stop offset="1" stopColor={GLOW} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="375" height="400" fill="#0b0907" />
        <rect width="375" height="400" fill={`url(#step-glow-${step})`} />
        {step === 0 ? (
          <g>
            {Array.from({ length: 9 }, (_, i) => {
              const hgt = 60 + ((i * 53) % 150)
              return (
                <rect
                  key={i}
                  x={30 + i * 37}
                  y={330 - hgt}
                  width="24"
                  height={hgt}
                  rx="7"
                  fill={i === 6 ? EMBER : i % 3 === 0 ? '#5a2c14' : '#3a2419'}
                  stroke={GLOW}
                  strokeOpacity={i === 6 ? 0 : 0.25}
                  className="tick"
                  style={{ animationDelay: `${-i * 0.4}s` }}
                />
              )
            })}
            <path d="M24 250 C 90 220, 140 270, 210 200 S 320 140, 356 120" fill="none" stroke={EMBER_L} strokeWidth="3" strokeLinecap="round" className="flow-slow" />
            <circle cx="255" cy="168" r="9" fill="#fff" className="pulse" />
          </g>
        ) : (
          <g>
            {[0, 1, 2, 3].map((i) => (
              <g key={i} className={['float', 'float-2', 'float-3', 'float'][i]}>
                <rect x={26 + i * 84} y={176 + (i % 2) * 40} width="66" height="66" rx="16" fill={i === 3 ? EMBER : '#3a2419'} stroke={GLOW} strokeOpacity="0.45" />
                <text x={59 + i * 84} y={209 + (i % 2) * 40} dy="0.35em" textAnchor="middle" fontFamily="Inter Variable, sans-serif" fontWeight="600" fontSize="12" fill="#fff" opacity={i === 3 ? 1 : 0.7}>
                  {['XMR', 'ETH', 'sign', 'NVDAx'][i]}
                </text>
              </g>
            ))}
            <path d="M92 220h18M176 248h18M260 220h18" stroke={EMBER_L} strokeWidth="3" strokeLinecap="round" className="flow" />
          </g>
        )}
      </svg>
    </div>
  )
}

/** Custody note card: two routes, the live one solid and the coming one dotted. */
export function SwitchArt() {
  return (
    <Frame w={592} h={444} dark glow={[0.55, 0.5]}>
      <g fill="#2a221c">
        {Array.from({ length: 48 }, (_, i) => (
          <circle key={i} cx={66 + (i % 8) * 66} cy={70 + Math.floor(i / 8) * 62} r="20" opacity={0.5 + ((i * 13) % 5) / 10} />
        ))}
      </g>
      <path d="M66 256 H 198 C 240 256, 240 194, 282 194 H 528" fill="none" stroke={GLOW} strokeWidth="5" strokeLinecap="round" />
      <path d="M66 256 H 198 C 240 256, 240 318, 282 318 H 528" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="3" strokeDasharray="3 10" strokeLinecap="round" />
      <Coin x={66} y={256} r={26} label="XMR" tone="ink" size={11} />
      <Coin x={528} y={194} r={22} tone="ember" />
      <circle cx="528" cy="318" r="22" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="3" strokeDasharray="4 6" />
    </Frame>
  )
}

/** Guide thumbnails (16:9). */
export function GuideArt({ name }: { name: 'refund' | 'erc20' | 'clock' }) {
  if (name === 'refund')
    return (
      <Frame w={379} h={213} dark glow={[0.3, 0.4]}>
        <path d="M290 130 C 290 60, 110 60, 110 120" fill="none" stroke={GLOW} strokeWidth="4" strokeLinecap="round" />
        <path d="M98 108l12 14 14-12" fill="none" stroke={GLOW} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <Coin x={110} y={150} r={26} label="XMR" tone="ink" size={11} />
        <rect x="240" y="130" width="100" height="40" rx="20" fill="#2a221c" />
        <text x="290" y="150" dy="0.35em" textAnchor="middle" fontFamily="Inter Variable, sans-serif" fontWeight="600" fontSize="13" fill="#fff">4… or 8…</text>
      </Frame>
    )
  if (name === 'erc20')
    return (
      <Frame w={379} h={213} glow={[0.7, 0.3]}>
        <Plate x={70} y={76} w={110} h={56} label="SPYx" sub="ERC-20" tone="ink" />
        <Plate x={200} y={76} w={110} h={56} label="USDC" sub="ERC-20" tone="cream" />
        <rect x="50" y="56" width="280" height="96" rx="28" fill="none" stroke={INK} strokeOpacity="0.25" strokeDasharray="4 8" strokeWidth="2" />
      </Frame>
    )
  return (
    <Frame w={379} h={213} glow={[0.5, 0.4]}>
      <circle cx="190" cy="106" r="66" fill={CREAM} />
      <path d="M190 106 L190 58 A48 48 0 0 1 228 135 Z" fill={EMBER} opacity="0.9" />
      <circle cx="190" cy="106" r="66" fill="none" stroke={INK} strokeOpacity="0.15" strokeWidth="2" />
      <path d="M190 106V70M190 106l24 14" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <text x="282" y="70" fontFamily="Inter Variable, sans-serif" fontWeight="600" fontSize="16" fill={INK}>10–30</text>
      <text x="282" y="90" fontFamily="Inter Variable, sans-serif" fontSize="12" fill={INK_SOFT}>minutes</text>
    </Frame>
  )
}

/** Wide 16:9 art for the "also on the menu" carousel. */
export function MenuArt({ name }: { name: 'usdc' | 'eth' }) {
  return name === 'usdc' ? (
    <Frame w={368} h={207} glow={[0.5, 0.3]}>
      {[0, 1, 2].map((i) => (
        <g key={i} className={['float', 'float-2', 'float-3'][i]}>
          <ellipse cx={120 + i * 64} cy={124} rx="44" ry="44" fill="#2f5fb3" />
          <circle cx={120 + i * 64} cy={118} r="44" fill="#3e74d1" stroke="#fff" strokeWidth="3" />
          <text x={120 + i * 64} y={118} dy="0.35em" textAnchor="middle" fontFamily="Inter Variable, sans-serif" fontWeight="700" fontSize="22" fill="#fff">$</text>
        </g>
      ))}
    </Frame>
  ) : (
    <Frame w={368} h={207} dark glow={[0.5, 0.5]}>
      <Coin x={184} y={100} r={54} label="ETH" tone="ink" className="float" />
      <circle cx="184" cy="104" r="84" fill="none" stroke={GLOW} strokeOpacity="0.3" strokeDasharray="2 8" strokeWidth="1.5" className="spin" />
    </Frame>
  )
}

export function Art({ name }: { name: string }) {
  const draw = wide[name] ?? tall[name]
  return draw ? <>{draw()}</> : null
}
