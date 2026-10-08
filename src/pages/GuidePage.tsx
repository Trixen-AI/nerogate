import { Link, useParams } from 'react-router'
import { GuideArt } from '@/components/art/Art'
import { ArrowRight, Button } from '@/components/ui/primitives'
import { GUIDE_LIST, guideBySlug, type GuideBlock } from '@/data/guides'
import { usePageMeta } from '@/lib/seo'

function Block({ block }: { block: GuideBlock }) {
  switch (block.type) {
    case 'h2':
      return <h2 className="text-title-md text-darkest pt-6">{block.text}</h2>
    case 'list':
      return (
        <ul className="flex flex-col gap-3 pl-5 list-disc marker:text-ember-40 text-body-lg text-dark">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )
    case 'note':
      return <p className="rounded-2xl bg-ink-98 border border-veil-black-16 px-6 py-5 text-body-md text-dark">{block.text}</p>
    default:
      return <p className="text-body-lg text-dark">{block.text}</p>
  }
}

export default function GuidePage() {
  const { slug } = useParams()
  const guide = guideBySlug(slug)

  usePageMeta(
    guide ? `${guide.title} | Nerogate` : 'Guide not found | Nerogate',
    guide ? guide.summary : 'This guide does not exist or has moved.',
    `/guides/${slug ?? ''}`,
  )

  if (!guide) {
    return (
      <main className="container pt-40 pb-30 min-h-[70vh] flex flex-col items-start gap-6">
        <h1 className="text-headline-md text-darkest">Guide not found</h1>
        <p className="text-body-lg text-dark">This guide does not exist or has moved.</p>
        <Button href="/#risk" variant="secondary">
          Back to guides
        </Button>
      </main>
    )
  }

  const others = GUIDE_LIST.filter((g) => g.slug !== guide.slug)

  return (
    <main>
      <article className="container pt-32 sm:pt-40 pb-14 xs:pb-20">
        <div className="max-w-[760px] mx-auto flex flex-col gap-8">
          <a href="/#risk" className="group inline-flex items-center gap-2 text-label-sm text-ember-40 max-w-max">
            <span className="rotate-180 transition-transform duration-300 group-hover:-translate-x-1">
              <ArrowRight />
            </span>
            All guides
          </a>
          <header className="flex flex-col gap-5">
            <div className="flex flex-wrap gap-2">
              {guide.tags.map((t) => (
                <span key={t} className="badge inline-flex items-center px-2 py-1 text-label-sm text-darkest">
                  {t}
                </span>
              ))}
            </div>
            <h1 className="text-headline-md text-darkest">{guide.title}</h1>
            <p className="text-title-sm text-dark font-normal">{guide.summary}</p>
            <p className="text-label-sm blogpost-card-meta">{guide.meta}</p>
          </header>
          <div className="w-full aspect-video overflow-hidden rounded-3xl">
            <GuideArt name={guide.art} />
          </div>
          <div className="flex flex-col gap-5">
            {guide.body.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </div>
        </div>
      </article>

      <section className="bg-ink-98">
        <div className="container py-14 xs:py-20">
          <div className="max-w-[760px] mx-auto flex flex-col gap-8">
            <h2 className="text-headline-sm text-darkest">Keep reading</h2>
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-6">
              {others.map((g) => (
                <Link key={g.slug} to={`/guides/${g.slug}`} className="blogpost-card group flex flex-col gap-4">
                  <div className="w-full overflow-hidden rounded-2xl aspect-video">
                    <div className="w-full h-full transition-transform ease-out duration-500 group-hover:scale-110">
                      <GuideArt name={g.art} />
                    </div>
                  </div>
                  <h3 className="text-title-sm blogpost-card-title">{g.title}</h3>
                  <p className="text-label-sm blogpost-card-meta">{g.meta}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
