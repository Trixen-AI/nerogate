import { useEffect, useRef } from 'react'

/*
  Hero backdrop: a dotted horizon (a slow-turning globe seen edge-on) on warm ink, with ember
  routes that lift off one point of the surface and land on another. Value leaves one place and
  arrives somewhere you control. Canvas 2D, DPR-sharp, paused off screen, static under reduced motion.
*/
type Arc = { a: number; b: number; la: number; lb: number; t: number; speed: number; lift: number }

export function HeroScene() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let w = 0
    let h = 0
    let dpr = 1
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // Points on a sphere (fibonacci lattice) so the horizon reads as a globe.
    const N = 2600
    const pts: [number, number, number][] = []
    const golden = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const th = golden * i
      pts.push([Math.cos(th) * r, y, Math.sin(th) * r])
    }

    // Deterministic pseudo-random so the composition is the same every load.
    let seed = 7
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    let rot = 0
    // Endpoints are chosen on the front-facing cap (the only part of the globe inside the hero).
    const place = (arc: Arc) => {
      arc.a = rot + Math.PI / 2 + (rnd() - 0.5) * 2.4
      arc.b = arc.a + (rnd() < 0.5 ? -1 : 1) * (0.5 + rnd() * 1.1)
      arc.la = 1.0 + rnd() * 0.32
      arc.lb = 1.0 + rnd() * 0.32
    }
    const arcs: Arc[] = Array.from({ length: 12 }, () => {
      const arc: Arc = { a: 0, b: 0, la: 0, lb: 0, t: rnd(), speed: 0.0016 + rnd() * 0.0018, lift: 0.04 + rnd() * 0.08 }
      place(arc)
      return arc
    })
    let raf = 0
    let visible = true

    const frame = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      // ground
      const bg = ctx.createLinearGradient(0, 0, 0, h)
      bg.addColorStop(0, '#000000')
      bg.addColorStop(0.55, '#0b0705')
      bg.addColorStop(1, '#1a0d06')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)

      // globe geometry: big sphere whose top edge sits ~58% down the hero
      const R = Math.max(w * 0.95, h * 1.25)
      const cx = w * 0.5
      const cy = h * 0.58 + R * 0.92
      const tilt = 0.32

      // atmosphere glow along the horizon
      const glow = ctx.createRadialGradient(cx, cy, R * 0.86, cx, cy, R * 1.12)
      glow.addColorStop(0, 'rgba(255,122,51,0)')
      glow.addColorStop(0.62, 'rgba(255,122,51,0.22)')
      glow.addColorStop(0.75, 'rgba(232,89,12,0.08)')
      glow.addColorStop(1, 'rgba(232,89,12,0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, w, h)

      const project = (x: number, y: number, z: number) => {
        // rotate around Y, then tilt toward the viewer
        const cr = Math.cos(rot)
        const sr = Math.sin(rot)
        const x1 = x * cr + z * sr
        const z1 = -x * sr + z * cr
        const ct = Math.cos(tilt)
        const st = Math.sin(tilt)
        const y1 = y * ct - z1 * st
        const z2 = y * st + z1 * ct
        return { sx: cx + x1 * R, sy: cy - y1 * R, z: z2 }
      }

      // dots
      for (const [x, y, z] of pts) {
        const p = project(x, y, z)
        if (p.z < 0.05 || p.sy > h + 4 || p.sx < -4 || p.sx > w + 4) continue
        const a = Math.min(1, p.z * 1.6)
        ctx.fillStyle = `rgba(255, 196, 160, ${0.12 + a * 0.38})`
        const s = 0.8 + a * 1.1
        ctx.fillRect(p.sx, p.sy, s, s)
      }

      // routes
      for (const arc of arcs) {
        const surf = (ang: number, lat: number) =>
          [Math.cos(ang) * Math.cos(lat), Math.sin(lat), Math.sin(ang) * Math.cos(lat)] as const
        const A = surf(arc.a, arc.la)
        const B = surf(arc.b, arc.lb)
        const steps = 48
        const head = arc.t
        ctx.lineWidth = 1.6
        let prev: { sx: number; sy: number; z: number } | null = null
        for (let i = 0; i <= steps; i++) {
          const u = i / steps
          if (u > head) break
          const lift = 1 + Math.sin(Math.PI * u) * arc.lift
          const x = (A[0] * (1 - u) + B[0] * u) * lift
          const y = (A[1] * (1 - u) + B[1] * u) * lift
          const z = (A[2] * (1 - u) + B[2] * u) * lift
          const p = project(x, y, z)
          if (prev && p.z > -0.1 && prev.z > -0.1) {
            const fade = Math.max(0, 1 - (head - u) * 2.4)
            ctx.strokeStyle = `rgba(255, 138, 76, ${0.08 + fade * 0.7})`
            ctx.beginPath()
            ctx.moveTo(prev.sx, prev.sy)
            ctx.lineTo(p.sx, p.sy)
            ctx.stroke()
          }
          prev = p
        }
        if (prev && prev.z > 0) {
          ctx.fillStyle = 'rgba(255, 220, 190, 0.9)'
          ctx.beginPath()
          ctx.arc(prev.sx, prev.sy, 2, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // vignette so copy stays readable
      const v = ctx.createLinearGradient(0, 0, 0, h)
      v.addColorStop(0, 'rgba(0,0,0,0.55)')
      v.addColorStop(0.45, 'rgba(0,0,0,0.1)')
      v.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = v
      ctx.fillRect(0, 0, w, h)
    }

    const tick = () => {
      rot += 0.0007
      for (const arc of arcs) {
        arc.t += arc.speed
        if (arc.t > 1.35) {
          arc.t = 0
          place(arc)
        }
      }
      frame()
      if (visible) raf = requestAnimationFrame(tick)
    }

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      cancelAnimationFrame(raf)
      if (visible && !reduce) raf = requestAnimationFrame(tick)
    })
    io.observe(canvas)

    if (reduce) {
      for (const arc of arcs) arc.t = 0.9
      frame()
    }

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
    }
  }, [])

  return <canvas ref={ref} className="block w-full h-full" aria-hidden="true" />
}
