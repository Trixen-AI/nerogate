import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'


export function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5.5 14.5l9-9M7 5.5h7.5V13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ArrowRight({ className, size = 14 }: { className?: string; size?: number }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M1.5 7h10.5M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ArrowLong({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3.5 12h16.5M14 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

type Variant = 'primary' | 'secondary' | 'secondary-inverted' | 'ghost'

/** Pill-free action button (8px radius) with the trailing up-right arrow that nudges on hover. */
export function Button({
  href,
  variant = 'primary',
  children,
  icon = true,
  external = false,
}: {
  href: string
  variant?: Variant
  children: ReactNode
  icon?: boolean
  external?: boolean
}) {
  const bg = {
    primary: 'btn-bg-primary',
    secondary: 'btn-bg-secondary',
    'secondary-inverted': 'btn-bg-secondary-inverted inverted',
    ghost: 'btn-bg-ghost inverted',
  }[variant]
  return (
    <a
      href={href}
      className={cx('group btn state-layer', bg)}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <span className="py-2 px-4 flex">
        <span className="flex flex-row items-center justify-center gap-x-3 text-label-md p-1">
          <span>{children}</span>
          {icon && (
            <ArrowUpRight className="h-5 w-5 transition-transform ease-in duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          )}
        </span>
      </span>
    </a>
  )
}

/** Small text link with a trailing arrow that slides on hover. */
export function TextLink({ href, children, inverted = false }: { href: string; children: ReactNode; inverted?: boolean }) {
  return (
    <a href={href} className="inline-flex">
      <span
        className={cx(
          'relative flex items-center gap-2 cursor-pointer group max-w-max text-label-sm',
          inverted ? 'text-ember-60' : 'text-ember-40',
        )}
      >
        {children}
        <span className="transform transition-transform ease-in duration-300 group-hover:translate-x-1">
          <ArrowRight />
        </span>
      </span>
    </a>
  )
}

/** Centered section heading block used by most sections. */
export function SectionHead({
  title,
  as: Tag = 'h2',
  size = 'headline-sm',
  subtitle,
  children,
  align = 'center',
}: {
  title: ReactNode
  as?: 'h2' | 'h3'
  size?: 'headline-sm' | 'headline-md'
  subtitle?: ReactNode
  children?: ReactNode
  align?: 'center' | 'left'
}) {
  return (
    <div
      className={cx(
        'flex flex-col',
        align === 'center' ? 'items-center text-center' : 'justify-start text-left',
        size === 'headline-md' ? 'gap-y-10' : 'gap-y-6',
      )}
    >
      <div className={cx('flex flex-col', subtitle && size === 'headline-md' ? 'gap-y-6' : 'gap-y-4')}>
        <Tag className={cx('text-darkest', `text-${size}`)}>{title}</Tag>
        {subtitle}
      </div>
      {children}
    </div>
  )
}

/** Wide card: copy on the left half, artwork on the right half (stacks on phones). */
export function HCard({
  href,
  title,
  body,
  art,
  bordered = true,
  fixed = true,
  external = false,
}: {
  href: string
  title: ReactNode
  body: ReactNode
  art: ReactNode
  bordered?: boolean
  /** true: 220px tall on desktop. false: grows to the tallest card in its row. */
  fixed?: boolean
  /** Opens in a new tab (outside links such as X). */
  external?: boolean
}) {
  return (
    <a
      href={href}
      className={cx('block', !fixed && '[&>div]:h-full')}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <div
        className={cx(
          'flex flex-col-reverse sm:flex-row w-full sm:h-[220px] overflow-hidden rounded-4xl group bg-white',
          'hover:shadow-lg transition-[transform,box-shadow] hover:-translate-y-1 duration-300',
          bordered && 'border border-veil-black-16',
        )}
      >
        <div className="flex flex-col justify-center text-start pt-8 pl-8 pb-12 pr-4 sm:w-1/2 gap-2 xs:gap-4">
          <p className="text-title-lg text-ink-10 group-hover:text-ember-40 transition-colors duration-200">{title}</p>
          <p className="text-body-md text-ink-30">{body}</p>
        </div>
        <div className="flex-1 aspect-video sm:aspect-auto sm:flex-none sm:w-1/2 sm:h-full overflow-hidden rounded-4xl">
          {art}
        </div>
      </div>
    </a>
  )
}

/** Tall card: artwork on top, title + text below. */
export function VCard({
  href,
  title,
  body,
  art,
  inverted = false,
  artClass = 'aspect-video',
  as: Tag = 'h3',
}: {
  href: string
  title: ReactNode
  body?: ReactNode
  art: ReactNode
  inverted?: boolean
  artClass?: string
  as?: 'h3' | 'h4'
}) {
  return (
    <a href={href} className="[&>div]:h-full block h-full">
      <div
        className={cx(
          'w-full flex flex-col items-center overflow-hidden rounded-3xl border card-container',
          'hover:shadow-lg hover:-translate-y-1 transition-[transform,box-shadow] duration-300',
          inverted ? 'border-veil-white-16 card-bg-inverted' : 'border-veil-black-16 card-bg-default',
        )}
      >
        <div className={cx('w-full overflow-hidden', artClass)}>{art}</div>
        <div
          className={cx(
            'flex flex-col justify-end items-start py-8 px-6 self-stretch gap-6',
            inverted ? 'card-text-medium-inverted' : 'card-text-medium',
          )}
        >
          <div className="flex flex-col items-start self-stretch w-full gap-4">
            <Tag className={cx('text-title-sm', inverted ? 'text-darkest-inverted' : 'text-darkest')}>{title}</Tag>
            {body && <p className="text-label-md">{body}</p>}
          </div>
        </div>
      </div>
    </a>
  )
}

/** Big split card (copy + artwork) used for the call-to-action blocks. */
export function SplitCta({
  art,
  title,
  lead,
  body,
  links,
  dark = true,
  reverse = true,
  titleTag: TitleTag = 'h2',
}: {
  art: ReactNode
  title: ReactNode
  lead?: ReactNode
  body?: ReactNode
  links: ReactNode
  dark?: boolean
  reverse?: boolean
  titleTag?: 'h2' | 'h3'
}) {
  return (
    <div
      className={cx(
        'flex w-full overflow-hidden rounded-4xl items-center text-center flex-col',
        reverse ? 'sm:flex-row-reverse' : 'sm:flex-row',
        dark ? 'bg-ink-0' : 'bg-color-gradient',
      )}
    >
      <div className="w-full aspect-[4/3] xs:aspect-video sm:w-1/2 sm:aspect-[4/3]">{art}</div>
      <div className="flex flex-col w-full h-full gap-2 xs:gap-4 items-center sm:w-1/2 py-8 px-6 xs:px-12 xs:pb-12 sm:px-16 justify-start text-center">
        <TitleTag className={cx('text-title-lg xs:text-headline-sm', dark ? 'cta-title-inverted' : 'cta-title')}>{title}</TitleTag>
        {lead && <p className={cx('text-label-md xs:text-label-lg', dark ? 'cta-text-inverted' : 'cta-text')}>{lead}</p>}
        {body && <p className={cx('text-body-lg', dark ? 'cta-text-inverted' : 'cta-text')}>{body}</p>}
        <div className="flex items-center justify-center gap-6 pt-6 xs:pt-8">
          <div className="flex gap-4 flex-wrap justify-center">{links}</div>
        </div>
      </div>
    </div>
  )
}

