import { QUOTE } from '@/data/site'
import './art.css'

const F = 'Inter Variable, Inter, sans-serif'

/** The swap widget drawn as an illustration (scales with its box). Numbers are the concept's worked example. */
export function QuotePanelArt() {
  const q = QUOTE.example
  return (
    <div className="art w-full h-full" aria-hidden="true">
      <svg viewBox="0 0 592 444" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="qp-glow" cx="0.55" cy="0.45" r="0.6">
            <stop offset="0" stopColor="#ff7a33" stopOpacity="0.28" />
            <stop offset="1" stopColor="#ff7a33" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="592" height="444" fill="#0b0907" />
        <rect width="592" height="444" fill="url(#qp-glow)" />
        <g className="float-2">
          <rect x="96" y="38" width="400" height="368" rx="24" fill="#17120e" stroke="#ff7a33" strokeOpacity="0.35" />
          <text x="124" y="72" fontFamily={F} fontSize="11" fill="#9d948a" letterSpacing="0.08em">EXAMPLE QUOTE</text>

          <rect x="124" y="86" width="164" height="58" rx="12" fill="#221b16" />
          <text x="140" y="108" fontFamily={F} fontSize="11" fill="#9d948a">You pay</text>
          <text x="140" y="131" fontFamily={F} fontWeight="600" fontSize="19" fill="#fff">{q.pay} {q.payUnit}</text>

          <rect x="304" y="86" width="164" height="58" rx="12" fill="#221b16" />
          <text x="320" y="108" fontFamily={F} fontSize="11" fill="#9d948a">You want</text>
          <text x="320" y="131" fontFamily={F} fontWeight="600" fontSize="19" fill="#fff">{q.want}</text>
          <text x="384" y="131" fontFamily={F} fontSize="12" fill="#9d948a">{q.wantName}</text>

          <text x="124" y="172" fontFamily={F} fontSize="11" fill="#9d948a">Route</text>
          <text x="124" y="192" fontFamily={F} fontWeight="500" fontSize="12.5" fill="#ff8a4c">{q.route}</text>
          <path d="M124 206h344" stroke="#fff" strokeOpacity="0.08" />

          {q.rows.map((r, i) => (
            <g key={r.label}>
              <text x="124" y={230 + i * 24} fontFamily={F} fontSize="12" fill="#9d948a">{r.label}</text>
              <text x="468" y={230 + i * 24} textAnchor="end" fontFamily={F} fontWeight={i === 2 ? 600 : 500} fontSize="12.5" fill={i === 2 ? '#fff' : '#d8cfc5'}>
                {r.value}
              </text>
            </g>
          ))}

          <rect x="124" y="346" width="344" height="40" rx="8" fill="#c8400c" />
          <text x="296" y="366" dy="0.35em" textAnchor="middle" fontFamily={F} fontWeight="600" fontSize="13.5" fill="#fff">{q.cta}</text>
        </g>
      </svg>
    </div>
  )
}
