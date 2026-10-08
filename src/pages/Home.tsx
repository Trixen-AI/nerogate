import { Hero, Promise, RouteAndAssets, SelfCustody, Stats } from '@/components/sections/Top'
import { HowItWorks, Marquee, More, Popular, Privacy, QuoteCta } from '@/components/sections/Middle'
import { Guides, Start, Why } from '@/components/sections/Bottom'

export default function Home() {
  return (
    <main>
      <Hero />
      <Stats />
      <Promise />
      <RouteAndAssets />
      <SelfCustody />
      <Marquee />
      <Popular />
      <Privacy />
      <HowItWorks />
      <QuoteCta />
      <More />
      <Why />
      <Guides />
      <Start />
    </main>
  )
}
