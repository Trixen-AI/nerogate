import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import { Art, MenuArt, StepArt, TickerArt } from '@/components/art/Art'
import { QuotePanelArt } from '@/components/art/QuotePanelArt'
import { ArrowUpRight, Button, HCard, SectionHead, SplitCta, TextLink, VCard } from '@/components/ui/primitives'
import { Section } from '@/components/ui/Section'
import { scopeSvgIds } from '@/lib/svg'
import { HOW, MORE, PARTNER_LOGOS, POPULAR, PRIVACY, QUOTE, ROUTED_THROUGH } from '@/data/site'

// Official brand SVGs, inlined as markup (sources: src/assets/logos/SOURCES.md).
const logoFiles = import.meta.glob<string>('/src/assets/logos/*.svg', { query: '?raw', import: 'default', eager: true })
const logoFor = (file: string, slot: number) => {
  const raw = logoFiles[`/src/assets/logos/${file}.svg`]
  return raw ? scopeSvgIds(raw, `lg-${file}-${slot}`) : null
}

export function Marquee() {
  const items = PARTNER_LOGOS.filter((l) => logoFiles[`/src/assets/logos/${l.file}.svg`])
  // Two passes so the loop always has more slides than fit on screen.
  const slides = [...items, ...items]
  return (
    <Section className="w-full bg-ink-0" inverted>
      <div className="py-3 xs:py-6">
        <div className="flex flex-col gap-6 py-8 xs:py-16">
          <p className="container w-full text-center text-title-md text-darkest-inverted">{ROUTED_THROUGH}</p>
          {slides.length > 0 && (
            <Swiper
              className="marquee w-full"
              modules={[Autoplay]}
              slidesPerView="auto"
              spaceBetween={0}
              speed={2000}
              loop
              autoplay={{ delay: 0, disableOnInteraction: true }}
              allowTouchMove
            >
              {slides.map((l, i) => (
                <SwiperSlide key={`${l.file}-${i}`} className="!w-[190px]">
                  <div
                    className="logo-slot flex items-center justify-center h-[108px] px-5"
                    role="img"
                    aria-label={l.label}
                    dangerouslySetInnerHTML={{ __html: logoFor(l.file, i) ?? '' }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </div>
    </Section>
  )
}

export function Popular() {
  return (
    <Section id={POPULAR.id} className="w-full bg-ink-98">
      <div className="container flex flex-col gap-12 xs:gap-20 py-14 xs:py-20 lg:py-30">
        <SectionHead title={POPULAR.title} />
        <div className="gap-6 grid grid-cols-1 xs:grid-cols-2">
          {POPULAR.items.map((p, i) => (
            <HCard
              key={p.ticker}
              fixed={false}
              href={`/app?asset=${p.ticker}`}
              title={p.ticker}
              body={p.body}
              art={<TickerArt ticker={p.ticker} name={p.name} index={i} />}
            />
          ))}
        </div>
        <div className="flex justify-center">
          <TextLink href={POPULAR.link.href}>{POPULAR.link.label}</TextLink>
        </div>
      </div>
    </Section>
  )
}

export function Privacy() {
  return (
    <Section className="bg-white">
      <div className="container flex flex-col gap-6 xs:gap-10 sm:gap-20 py-14 xs:py-20 lg:py-30">
        <SectionHead as="h2" size="headline-md" title={PRIVACY.title}>
          <TextLink href={PRIVACY.link.href}>{PRIVACY.link.label}</TextLink>
        </SectionHead>
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-6">
          {PRIVACY.items.map((p) => (
            <VCard key={p.title} href="#how-it-works" title={p.title} body={p.body} art={<Art name={p.art} />} />
          ))}
        </div>
      </div>
    </Section>
  )
}

export function HowItWorks() {
  return (
    <Section id={HOW.id} className="w-full bg-ink-98">
      <div className="container py-14 xs:py-20 lg:py-30 flex flex-col gap-14 xs:gap-20 md:gap-30">
        <div className="grid w-full items-center grid-cols-1 sm:grid-cols-[1fr_2fr] gap-8 sm:gap-6">
          <div className="flex flex-col justify-start text-left gap-y-10">
            <div className="flex flex-col gap-y-6">
              <h2 className="text-darkest text-headline-md">{HOW.title}</h2>
              <span className="text-title-md text-dark pr-4 md:pr-16 lg:pr-18 xl:pr-20">{HOW.subtitle}</span>
              <p className="text-body-lg text-dark pr-4 md:pr-16 lg:pr-18 xl:pr-20">{HOW.body}</p>
            </div>
            <div className="flex flex-row flex-wrap gap-4">
              <Button href={HOW.primary.href}>{HOW.primary.label}</Button>
              <Button href={HOW.secondary.href} variant="secondary">
                {HOW.secondary.label}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-6">
            {HOW.steps.map((s, i) => (
              <a key={s.title} href="/app" className="[&>div]:h-full block">
                <div className="relative flex flex-col px-8 pt-8 pb-12 rounded-3xl gap-8 cursor-pointer group min-h-[400px] bg-ink-0 overflow-hidden justify-between">
                  <StepArt step={i as 0 | 1} />
                  <div className="absolute inset-x-0 bottom-0 h-[50%] pointer-events-none rounded-b-3xl backdrop-blur" />
                  <div className="relative z-10 flex justify-between items-start gap-2">
                    <div className="flex flex-col gap-2">
                      <p className="text-label-sm text-ink-80">{s.eyebrow}</p>
                      <h3 className="text-title-md text-darkest-inverted">{s.title}</h3>
                    </div>
                    <ArrowUpRight className="text-darkest-inverted w-6 h-6 flex-none transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                  <p className="relative text-body-sm text-ink-80 line-clamp-3 z-10">{s.body}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-6">
          {HOW.extras.map((e) => (
            <HCard key={e.title} fixed={false} href={e.href} external={e.external} title={e.title} body={e.body} art={<Art name={e.art} />} />
          ))}
        </div>
      </div>
    </Section>
  )
}

export function QuoteCta() {
  return (
    <Section id={QUOTE.id} inverted>
      <div className="container py-14 xs:py-20 lg:py-30 flex justify-center items-center w-full">
        <SplitCta
          art={<QuotePanelArt />}
          title={QUOTE.title}
          lead={QUOTE.subtitle}
          body={QUOTE.body}
          links={
            <TextLink href={QUOTE.link.href} inverted>
              {QUOTE.link.label}
            </TextLink>
          }
        />
      </div>
    </Section>
  )
}

export function More() {
  return (
    <Section className="bg-white">
      <div className="container py-14 xs:py-20 lg:py-30 flex flex-col gap-6 xs:gap-10 sm:gap-20">
        <SectionHead as="h2" size="headline-md" title={MORE.title}>
          <TextLink href={MORE.link.href}>{MORE.link.label}</TextLink>
        </SectionHead>
        <Swiper
          className="!w-[calc(100%+2rem)] !p-4 !-m-4 [&_.swiper-wrapper]:items-stretch"
          slidesPerView={1}
          spaceBetween={24}
          breakpoints={{ 712: { slidesPerView: 2, spaceBetween: 24 } }}
        >
          {MORE.items.map((m) => (
            <SwiperSlide key={m.title} className="!h-auto">
              <a href={`/app?asset=${m.title}`} className="!h-full block [&>div]:h-full">
                <div className="w-full flex flex-col items-center overflow-hidden rounded-3xl border border-veil-black-16 card-bg-default card-container hover:shadow-lg hover:-translate-y-1 transition-[transform,box-shadow] duration-300">
                  <div className="w-full aspect-video">
                    <MenuArt name={m.art} />
                  </div>
                  <div className="flex flex-col justify-start items-start py-8 px-6 self-stretch gap-6 card-text-medium">
                    <p className="text-label-sm text-darkest">{m.tag}</p>
                    <h3 className="text-title-sm text-darkest">{m.title}</h3>
                    <p className="text-body-md">{m.body}</p>
                  </div>
                </div>
              </a>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </Section>
  )
}
