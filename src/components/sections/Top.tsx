import { HeroScene } from '@/components/art/HeroScene'
import { Art, CustodyArt, LegOneArt, LegTwoArt, PromiseArt } from '@/components/art/Art'
import { ArrowLong, Button, HCard, SectionHead, TextLink } from '@/components/ui/primitives'
import { Section } from '@/components/ui/Section'
import { useReveal } from '@/hooks/useReveal'
import { CATEGORIES, HERO, PROMISE, ROUTE, SELF_CUSTODY, STATS } from '@/data/site'

export function Hero() {
  return (
    <section id="top" className="w-full" data-navbar-color-scheme="inverted">
      <div className="w-full flex flex-col justify-center items-center">
        <div className="w-full flex flex-col h-[100svh] min-h-[640px] max-h-[1200px] relative z-0 py-30">
          <div className="absolute inset-0 z-[-1] bg-black">
            <HeroScene />
          </div>
          <div className="container flex-1 h-full flex flex-col justify-center items-center">
            <div className="w-full flex flex-row justify-center xs:max-w-[780px] md:max-w-[900px]">
              <div className="flex flex-col items-center text-center gap-y-14">
                <div className="flex flex-col gap-y-6">
                  <h1 className="text-darkest-inverted text-display-sm">
                    {HERO.title[0]} <br className="hidden xs:block" />
                    {HERO.title[1]}
                  </h1>
                  <p className="text-title-lg text-dark-inverted">{HERO.subtitle}</p>
                </div>
                <div className="flex flex-row flex-wrap justify-center gap-4">
                  <Button href={HERO.primary.href}>{HERO.primary.label}</Button>
                  <Button href={HERO.secondary.href} variant="secondary-inverted">
                    {HERO.secondary.label}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden sm:flex absolute container bottom-0 left-1/2 -translate-x-1/2">
            <div className="flex gap-6 justify-center items-center w-full py-6">
              {HERO.anchors.map((a) => (
                <div key={a.label} className="w-full md:w-[464px]">
                  <a
                    href={a.href}
                    className="group anchor-link flex flex-row justify-between items-center w-full gap-6 state-layer inverted px-6 py-4 bg-veil-white-4 backdrop-blur border border-veil-white-16 text-darkest-inverted"
                  >
                    <span className="text-title-sm">{a.label}</span>
                    <span className="transition ease-in duration-150 group-hover:translate-x-2">
                      <ArrowLong />
                    </span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Stats() {
  const ref = useReveal<HTMLDivElement>(0.2)
  return (
    <Section className="w-full bg-white">
      <div className="container py-14 xs:py-16 md:py-20">
        <div ref={ref} className="reveal-stagger flex flex-col xs:flex-row justify-center items-center gap-6">
          {STATS.map((s, i) => (
            <div key={s.label} className="w-full" style={{ ['--i' as string]: i }}>
              <div className={`rounded-3xl w-full flex min-h-[180px] py-6 pl-6 pr-6 sm:pr-18 overflow-hidden ${i === 0 ? 'display-bg-light' : 'display-bg-neutral'}`}>
                <div className="flex flex-col items-start justify-between">
                  <p className="text-label-sm">{s.label}</p>
                  <p className="text-headline-sm">{s.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

/** Left: eyebrow, big headline, lead, actions. Right: artwork. Shared by the promise and self-custody blocks. */
function SplitIntro({
  eyebrow,
  title,
  lead,
  body,
  actions,
  art,
}: {
  eyebrow?: string
  title: string
  lead: string
  body?: string
  actions: React.ReactNode
  art: React.ReactNode
}) {
  return (
    <div className="flex gap-10 xs:gap-6 w-full items-center justify-between flex-col-reverse xs:flex-row">
      <div className="w-full xs:w-1/2">
        <div className="sm:pr-[92px] lg:pr-[102px] text-balance">
          <div className="flex flex-col justify-start text-left gap-y-14">
            <div className="flex flex-col gap-y-6">
              {eyebrow && <span className="text-title-sm text-dark">{eyebrow}</span>}
              <h2 className="text-darkest text-display-sm">{title}</h2>
              <span className="text-title-lg text-dark pr-4 md:pr-16 lg:pr-18 xl:pr-20">{lead}</span>
              {body && <p className="text-body-lg text-dark pr-4 md:pr-16 lg:pr-18 xl:pr-20">{body}</p>}
            </div>
            <div className="flex flex-row flex-wrap gap-4">{actions}</div>
          </div>
        </div>
      </div>
      <div className="w-full xs:w-1/2 aspect-[4/3] items-center flex">{art}</div>
    </div>
  )
}

export function Promise() {
  return (
    <Section className="w-full">
      <div className="container py-14 sm:py-20 lg:py-30 flex justify-center items-center flex-col gap-14 xs:gap-20 w-full">
        <SplitIntro
          eyebrow={PROMISE.eyebrow}
          title={PROMISE.title}
          lead={PROMISE.subtitle}
          actions={<Button href={PROMISE.cta.href}>{PROMISE.cta.label}</Button>}
          art={
            <div className="w-full aspect-[580/327] overflow-hidden rounded-3xl">
              <PromiseArt />
            </div>
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {PROMISE.cards.map((c) => (
            <HCard key={c.title} href={c.href} title={c.title} body={c.body} art={<Art name={c.art} />} />
          ))}
        </div>
      </div>
    </Section>
  )
}

export function RouteAndAssets() {
  return (
    <Section id={ROUTE.id}>
      <div className="container py-14 sm:py-20 lg:py-30 flex justify-center items-center flex-col gap-14 xs:gap-20 sm:gap-30 w-full">
        <div className="flex flex-col gap-14 w-full">
          <SectionHead
            title={ROUTE.title}
            subtitle={<p className="text-body-lg text-dark max-w-[628px]">{ROUTE.subtitle}</p>}
          />
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-6">
            {ROUTE.legs.map((leg, i) => (
              <a key={leg.title} href={leg.href} className="[&>div]:h-full block">
                <div
                  className={`flex w-full overflow-hidden rounded-4xl items-center text-center flex-col ${i === 0 ? 'bg-color-gradient' : 'bg-ink-0'}`}
                >
                  <div className="w-full aspect-[4/3] xs:aspect-video sm:aspect-[21/9]">{i === 0 ? <LegOneArt /> : <LegTwoArt />}</div>
                  <div className="flex flex-col w-full h-full gap-2 xs:gap-4 items-center py-8 px-6 xs:px-12 xs:pb-12 sm:px-16 justify-start text-center">
                    <h3 className={`text-title-lg xs:text-headline-sm ${i === 0 ? 'cta-title' : 'cta-title-inverted'}`}>{leg.title}</h3>
                    <p className={`text-label-md xs:text-label-lg ${i === 0 ? 'cta-text' : 'cta-text-inverted'}`}>{leg.body}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
        <div id={CATEGORIES.id} className="flex flex-col gap-[56px] items-center w-full scroll-mt-24">
          <SectionHead title={CATEGORIES.title}>
            <TextLink href={CATEGORIES.link.href}>{CATEGORIES.link.label}</TextLink>
          </SectionHead>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
            {CATEGORIES.items.map((c) => (
              <HCard key={c.title} href="/app/assets" title={c.title} body={c.body} art={<Art name={c.art} />} />
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}

export function SelfCustody() {
  return (
    <Section>
      <div className="container py-14 xs:py-20 lg:py-30">
        <SplitIntro
          title={SELF_CUSTODY.title}
          lead={SELF_CUSTODY.subtitle}
          body={SELF_CUSTODY.body}
          actions={
            <>
              <Button href={SELF_CUSTODY.primary.href}>{SELF_CUSTODY.primary.label}</Button>
              <Button href={SELF_CUSTODY.secondary.href} variant="secondary">
                {SELF_CUSTODY.secondary.label}
              </Button>
            </>
          }
          art={<CustodyArt />}
        />
      </div>
    </Section>
  )
}
