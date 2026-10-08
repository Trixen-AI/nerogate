import './art.css'

/* Backdrop for the dark "why" section: fanned ember bands that sway slowly, fading into the ink below. */
export function Ribbons() {
  const bands = Array.from({ length: 9 }, (_, i) => i)
  return (
    <div className="art absolute top-0 left-0 w-full aspect-[16/9] z-0 pointer-events-none" aria-hidden="true">
      <svg viewBox="0 0 1440 810" preserveAspectRatio="xMidYMin slice">
        <defs>
          <linearGradient id="rb-band" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#3a1405" />
            <stop offset="0.55" stopColor="#c8400c" />
            <stop offset="0.8" stopColor="#ff8a4c" />
            <stop offset="1" stopColor="#5a1f07" />
          </linearGradient>
          <linearGradient id="rb-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0f0c0a" stopOpacity="0" />
            <stop offset="0.6" stopColor="#0f0c0a" stopOpacity="0.35" />
            <stop offset="1" stopColor="#0f0c0a" stopOpacity="1" />
          </linearGradient>
        </defs>
        <rect width="1440" height="810" fill="#0f0c0a" />
        <g className="sway">
          {bands.map((i) => (
            <path
              key={i}
              d={`M${-120 + i * 70} 900 C ${180 + i * 60} ${560 - i * 30}, ${520 + i * 40} ${120 + i * 10}, ${1560} ${-40 + i * 56}`}
              fill="none"
              stroke="url(#rb-band)"
              strokeWidth={46 - i * 2}
              strokeOpacity={0.18 + (i % 3) * 0.1}
              strokeLinecap="round"
            />
          ))}
        </g>
        <g className="sway-2">
          {bands.slice(0, 6).map((i) => (
            <path
              key={i}
              d={`M${1560 - i * 60} 860 C ${1200 - i * 50} ${520 - i * 26}, ${900 - i * 30} ${160 + i * 14}, ${-80} ${30 + i * 48}`}
              fill="none"
              stroke="url(#rb-band)"
              strokeWidth={30 - i * 2}
              strokeOpacity={0.12 + (i % 2) * 0.1}
              strokeLinecap="round"
            />
          ))}
        </g>
        <rect width="1440" height="810" fill="url(#rb-fade)" />
      </svg>
    </div>
  )
}
