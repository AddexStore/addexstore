import Card from '../components/ui/Card'
import Icon from '../components/ui/Icon'
import SectionHeading from '../components/ui/SectionHeading'

const VALUES = [
  {
    icon: 'Gem',
    title: 'Craftsmanship',
    text: 'Every piece in our collection is thoughtfully selected for its quality, detailing, and enduring appeal. We partner with artisans and brands who share our commitment to excellence.',
  },
  {
    icon: 'Recycle',
    title: 'Sustainability',
    text: 'We believe fashion should respect both people and the planet. From responsible sourcing to eco-conscious packaging, we strive to minimise our footprint at every step.',
  },
  {
    icon: 'HeartHandshake',
    title: 'Inclusivity',
    text: 'Style has no boundaries. We celebrate diversity in all its forms and curate collections that empower every individual to express their unique identity.',
  },
]

const STATS = [
  { value: '5K+', label: 'Happy Customers' },
  { value: '500+', label: 'Curated Styles' },
  { value: '50+', label: 'Partner Brands' },
  { value: '10+', label: 'Years of Service' },
]

export default function About() {
  return (
    <div className="bg-page">
      <section className="relative overflow-hidden bg-charcoal-900 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-500/12 blur-3xl" />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="eyebrow mb-4 text-gold-400">Our Story</p>
          <h1 className="heading-display text-4xl text-ivory-50 sm:text-5xl">
            The Art of <span className="italic text-gold-400">Understated Luxury</span>
          </h1>
          <div className="mx-auto mt-6 h-px w-16 bg-gold-500" />
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ivory-50/70">
            Founded with a passion for timeless elegance, SIFR is more than just a fashion destination — it&apos;s a
            celebration of craftsmanship, individuality, and understated luxury. What began as a vision to bridge
            contemporary design with heritage artistry has grown into a curated haven for those who appreciate the
            finer things in life.
          </p>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            eyebrow="What We Stand For"
            title="Our Values"
            description="The principles that guide every piece we curate and every interaction we craft."
            align="center"
          />

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((v) => (
              <Card key={v.title} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold-100 text-gold-600 dark:bg-gold-500/10 dark:text-gold-400">
                  <Icon name={v.icon} size="lg" />
                </div>
                <h3 className="heading-display text-lg text-ink">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-sub">{v.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <SectionHeading
                eyebrow="Our Promise"
                title="An Experience, Not Just a Purchase"
                description="From the moment you step into our world, we are dedicated to providing an exceptional experience. Every interaction — whether browsing our collections, speaking with our team, or receiving your order — is designed to reflect the warmth, care, and sophistication that define SIFR."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {STATS.map((s) => (
                <div key={s.label} className="rounded-card border border-line bg-page p-6 text-center">
                  <p className="heading-display text-3xl text-gold-600 dark:text-gold-400">{s.value}</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wider text-sub">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
