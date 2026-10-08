import type { ReactNode } from 'react'
import { useReveal } from '@/hooks/useReveal'

/** Page section that fades up once on entry. `inverted` tells the nav to switch to light text over it. */
export function Section({
  id,
  className = '',
  inverted = false,
  children,
}: {
  id?: string
  className?: string
  inverted?: boolean
  children: ReactNode
}) {
  const ref = useReveal<HTMLElement>(0.05)
  return (
    <section
      id={id}
      ref={ref}
      className={`will-animate scroll-mt-24 ${className}`}
      data-navbar-color-scheme={inverted ? 'inverted' : undefined}
    >
      {children}
    </section>
  )
}
