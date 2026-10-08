import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { Logo } from '@/components/brand/Logo'
import { NAV } from '@/data/site'

/**
 * Fixed, transparent nav with an 8px backdrop blur. Text flips to white while the nav sits over any
 * section marked data-navbar-color-scheme="inverted" (hero, quote card, "why" section).
 */
export function Nav() {
  const [inverted, setInverted] = useState(true)
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const probe = () => {
      const y = 45
      const dark = [...document.querySelectorAll<HTMLElement>('[data-navbar-color-scheme="inverted"]')].some((el) => {
        const r = el.getBoundingClientRect()
        return r.top <= y && r.bottom >= y
      })
      setInverted(dark)
    }
    probe()
    window.addEventListener('scroll', probe, { passive: true })
    window.addEventListener('resize', probe)
    return () => {
      window.removeEventListener('scroll', probe)
      window.removeEventListener('resize', probe)
    }
  }, [pathname])

  const tone = inverted && !open ? 'text-darkest-inverted' : 'text-darkest'
  return (
    <div className="fixed inset-x-0 top-0 z-50 max-h-screen flex flex-col">
      <nav className={`w-full backdrop-blur select-none transition-colors duration-300 ${open ? 'bg-white' : 'bg-transparent'} ${tone}`}>
        <div className="container flex flex-row items-center justify-between w-full h-[72px] sm:h-[90px]">
          <a href="/" aria-label="Nerogate home" className="flex">
            <Logo inverted={inverted && !open} />
          </a>
          <div className="hidden sm:flex items-center gap-2">
          <ul className="flex flex-row">
            {NAV.map((item) => (
              <li key={item.label} className="group">
                <a href={item.href} className="relative block py-8 px-4 text-label-md text-center transition-colors duration-200 hover:text-[color:var(--color-highlighted)]">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <Link to="/app" className="group btn state-layer btn-bg-primary ml-2">
            <span className="px-4 py-2.5 text-label-md">Launch app</span>
          </Link>
          </div>
          <button
            type="button"
            className="sm:hidden -mr-2 p-2"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
        {open && (
          <ul className="sm:hidden container flex flex-col pb-4">
            <li>
              <Link to="/app" onClick={() => setOpen(false)} className="btn btn-bg-primary state-layer mt-3 mb-2 w-full justify-center px-6 py-3.5 text-label-md">
                Launch app
              </Link>
            </li>
            {NAV.map((item) => (
              <li key={item.label}>
                <a href={item.href} onClick={() => setOpen(false)} className="block py-3 text-label-lg border-b border-veil-black-16">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </div>
  )
}
