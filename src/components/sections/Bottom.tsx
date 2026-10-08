import { Art, GuideArt, SwitchArt } from '@/components/art/Art'
import { Ribbons } from '@/components/art/Ribbons'
import { Logo } from '@/components/brand/Logo'
import { Button, SectionHead, SplitCta, TextLink, VCard } from '@/components/ui/primitives'
import { Section } from '@/components/ui/Section'
import { scopeSvgIds } from '@/lib/svg'
import { Link } from 'react-router'
import { FOOTER, GUIDES, SOCIALS, START, WHY } from '@/data/site'
import { GUIDE_LIST } from '@/data/guides'

// Official platform glyphs, inlined (sources: src/assets/logos/SOURCES.md).
const socialFiles = import.meta.glob<string>('/src/assets/social/*.svg', { query: '?raw', import: 'default', eager: true })
const socialIcon = (file: string, slot: number) => {
  const raw = socialFiles[`/src/assets/social/${file}.svg`]
  return raw ? scopeSvgIds(raw, `so-${file}-${slot}`) : ''
}

export function Why() {
  return (
    <Section id={WHY.id} inverted className="w-full box-border relative overflow-hidden bg-ink-4">
      <Ribbons />
      <div className="container py-14 xs:py-20 lg:py-30 flex justify-center items-center flex-col gap-14 xs:gap-20 sm:gap-30 w-full relative z-10">
        <div className="w-full sm:w-[952px] text-center">
          <div className="flex flex-col items-center text-center gap-y-14">
            <div className="flex flex-col gap-y-6">
              <h2 className="text-darkest-inverted text-display-sm">{WHY.title}</h2>
              <p className="text-title-lg text-dark-inverted">
                <span className="block">{WHY.subtitle[0]}</span>
                <span className="block">{WHY.subtitle[1]}</span>
              </p>
              <p className="text-body-lg text-dark-inverted">{WHY.body}</p>
            </div>
            <div className="flex flex-row flex-wrap justify-center gap-4">
              <Button href={WHY.primary.href}>{WHY.primary.label}</Button>
              <Button href={WHY.secondary.href} variant="secondary-inverted" external>
                {WHY.secondary.label}
              </Button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-6 w-full">
          {WHY.cards.map((c) => (
            <VCard key={c.title} inverted href="/app/status" title={c.title} body={c.body} art={<Art name={c.art} />} />
          ))}
        </div>
        <SplitCta
          art={<SwitchArt />}
          titleTag="h3"
          title={WHY.custody.title}
          lead={WHY.custody.body}
          links={WHY.custody.links.map((l) => (
            <TextLink key={l.label} href={l.href} inverted>
              {l.label}
            </TextLink>
          ))}
        />
      </div>
    </Section>
  )
}

export function Guides() {
  return (
    <Section id={GUIDES.id} className="w-full">
      <div className="container flex flex-col gap-6 xs:gap-10 sm:gap-20 py-14 xs:py-20 lg:py-30">
        <div className="max-w-[800px]">
          <SectionHead align="left" title={GUIDES.title} />
        </div>
        <div className="grid grid-cols-1 xs:grid-cols-3 gap-6">
          {GUIDE_LIST.map((g) => (
            <Link key={g.slug} to={`/guides/${g.slug}`} className="block h-full">
              <div className="blogpost-card w-full flex flex-col items-center cursor-pointer group">
                <div className="w-full overflow-hidden rounded-2xl aspect-video">
                  <div className="w-full h-full transform transition-transform ease-out duration-500 group-hover:scale-110">
                    <GuideArt name={g.art} />
                  </div>
                </div>
                <div className="flex flex-col items-start pt-6 pb-4 gap-3 w-full">
                  <div className="flex flex-wrap gap-2">
                    {g.tags.map((t) => (
                      <span key={t} className="badge inline-flex items-center justify-center px-2 py-1 text-label-sm text-darkest">
                        {t}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-title-sm blogpost-card-title">{g.title}</h3>
                  <p className="text-label-sm blogpost-card-meta">{g.meta}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Section>
  )
}

export function Start() {
  return (
    <Section className="w-full">
      <div className="container py-14 xs:py-20 lg:py-30 flex flex-col gap-6 xs:gap-10 sm:gap-20">
        <SectionHead
          align="left"
          size="headline-md"
          title={START.title}
          subtitle={<span className="text-title-md text-dark">{START.subtitle}</span>}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {START.items.map((s) => (
            <VCard key={s.title} href="/app" title={s.title} art={<Art name={s.art} />} />
          ))}
        </div>
      </div>
    </Section>
  )
}

export function Footer() {
  return (
    <footer className="bg-darkest text-white relative overflow-hidden bg-ink-10">
      <div className="container py-8 relative">
        <div className="grid grid-cols-2 gap-6 xs:grid-cols-4">
          {FOOTER.columns.map((col) => (
            <div key={col.title} className="flex flex-col gap-y-4">
              <span className="text-ink-100 text-label-lg">{col.title}</span>
              <div className="flex flex-col gap-y-2">
                {col.links.map((l) => (
                  <a key={l.label} href={l.href} className="text-ink-80 text-label-md max-w-max hover:text-white transition-colors">
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <hr className="my-6 border-0 h-px bg-veil-white-16" />
        <div className="flex flex-col items-start md:items-end w-full gap-6">
          <div className="flex flex-col items-start md:flex-row w-full justify-between gap-y-8 md:gap-y-0">
            <div className="flex flex-col xs:flex-row gap-x-4 gap-y-3 xs:items-center">
              <Logo inverted />
              <span className="text-ink-60 text-body-sm">© 2026 Nerogate. Self-custody, your jurisdiction, your call.</span>
            </div>
            <div className="grid grid-cols-2 xs:flex xs:flex-nowrap gap-4 xs:gap-6">
              {FOOTER.legal.map((l) => (
                <a key={l.label} href={l.href} className="text-ink-80 text-label-sm whitespace-nowrap max-w-max hover:text-white transition-colors">
                  {l.label}
                </a>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {SOCIALS.map((s, i) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="group btn state-layer btn-bg-ghost inverted max-w-max"
              >
                <span className="p-2 flex">
                  <span className="flex flex-row items-center justify-center p-1">
                    <span className="social-icon block w-5 h-5" aria-hidden="true" dangerouslySetInnerHTML={{ __html: socialIcon(s.icon, i) }} />
                  </span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
