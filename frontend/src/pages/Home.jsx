import { useState, useEffect } from 'react'
import { useRecentlyViewed } from '../hooks/useRecentlyViewed'
import { productService } from '../services/productService'
import { categoryService } from '../services/categoryService'
import { mapProduct, mapCategory } from '../services/mappers'
import HeroBanner from '../components/HeroBanner'
import CategoryCard from '../components/CategoryCard'
import ProductCard from '../components/ProductCard'
import SectionHeading from '../components/ui/SectionHeading'
import Reveal from '../components/ui/Reveal'
import Icon from '../components/ui/Icon'
import SkeletonLoader from '../components/SkeletonLoader'

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ hours: 24, minutes: 0, seconds: 0 })

  useEffect(() => {
    const end = Date.now() + 24 * 60 * 60 * 1000
    const interval = setInterval(() => {
      const diff = Math.max(0, end - Date.now())
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const pad = (n) => String(n).padStart(2, '0')

  return (
    <div className="flex items-center gap-2 sm:gap-3" role="timer" aria-label="Sale ends in">
      {[
        { label: 'Hours', value: pad(timeLeft.hours) },
        { label: 'Min', value: pad(timeLeft.minutes) },
        { label: 'Sec', value: pad(timeLeft.seconds) },
      ].map(({ label, value }) => (
        <div key={label} className="text-center">
          <div className="flex h-14 w-14 flex-col items-center justify-center rounded-field border border-line bg-surface shadow-sm lg:h-16 lg:w-16">
            <span className="text-xl font-bold tabular-nums text-ink lg:text-2xl">{value}</span>
          </div>
          <span className="mt-1.5 block text-[10px] font-semibold uppercase tracking-wider text-sub">
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}

const PERKS = [
  { icon: 'Truck', title: 'Complimentary Shipping', text: 'On all orders over $100' },
  { icon: 'RotateCcw', title: 'Easy Returns', text: '30-day free returns' },
  { icon: 'ShieldCheck', title: 'Authenticity Guaranteed', text: 'Certified luxury pieces' },
  { icon: 'Sparkles', title: 'White-Glove Support', text: 'Concierge 24/7 care' },
]

export default function Home() {
  const { getRecentlyViewed } = useRecentlyViewed()
  const [featured, setFeatured] = useState([])
  const [trending, setTrending] = useState([])
  const [sales, setSales] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [categories, setCategories] = useState([])
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const recentlyViewedIds = getRecentlyViewed().slice(0, 4).map((rv) => rv.id)
    Promise.all([
      productService.getFeatured(0, 8).then((r) => (r.data?.content || r.content || []).map(mapProduct)).catch(() => []),
      productService.getTrending(0, 8).then((r) => (r.data?.content || r.content || []).map(mapProduct)).catch(() => []),
      productService.getSales(0, 4).then((r) => (r.data?.content || r.content || []).map(mapProduct)).catch(() => []),
      productService.getNewArrivals(0, 4).then((r) => (r.data?.content || r.content || []).map(mapProduct)).catch(() => []),
      categoryService.getAll().then((r) => (r.data || []).map(mapCategory)).catch(() => []),
      ...recentlyViewedIds.map((rvId) => productService.getProduct(rvId).then((r) => mapProduct(r.data)).catch(() => null)),
    ]).then(([f, t, s, n, cats, ...rvProds]) => {
      setFeatured(f)
      setTrending(t)
      setSales(s)
      setNewArrivals(n)
      setCategories(cats)
      setRecentlyViewedProducts(rvProds.filter(Boolean))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-page">
      <HeroBanner />

      <div className="border-b border-line bg-surface">
        <div className="container-lux grid grid-cols-1 gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:py-10">
          {PERKS.map((perk, i) => (
            <Reveal key={perk.title} delay={i * 80} className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-100 text-gold-600">
                <Icon name={perk.icon} size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">{perk.title}</p>
                <p className="text-xs text-sub">{perk.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <section className="section-lux container-lux">
        <Reveal>
          <SectionHeading
            eyebrow="The Edit"
            title="Shop by Category"
            linkTo="/categories"
            linkText="View All"
          />
        </Reveal>
        {loading ? (
          <SkeletonLoader type="category" count={5} />
        ) : (
          <div className="hide-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 sm:gap-4">
            {(categories || []).map((cat) => (
              <CategoryCard
                key={cat.id}
                icon={cat.icon}
                name={cat.name}
                productCount={cat.productCount}
                slug={cat.slug}
              />
            ))}
          </div>
        )}
      </section>

      <section className="section-lux bg-secondary-surface">
        <div className="container-lux">
          <Reveal>
            <SectionHeading
              eyebrow="Most Loved"
              title="Trending Now"
              description="The pieces our clients are coveting this season."
              linkTo="/trending"
              linkText="View All"
            />
          </Reveal>
          {loading ? (
            <SkeletonLoader type="product" count={4} />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
              {trending.slice(0, 8).map((product, i) => (
                <Reveal key={product.id} delay={(i % 4) * 70}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section-lux container-lux">
        <Reveal>
          <SectionHeading
            eyebrow="Curated For You"
            title="Featured Collection"
            description="A considered selection of timeless, investment-worthy pieces."
            linkTo="/products"
            linkText="View All"
          />
        </Reveal>
        {loading ? (
          <SkeletonLoader type="product" count={4} />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
            {featured.slice(0, 8).map((product, i) => (
              <Reveal key={product.id} delay={(i % 4) * 70}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {sales.length > 0 && (
        <section className="section-lux relative overflow-hidden bg-charcoal-900 text-white">
          <div className="absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle_at_center,gold_1px,transparent_1px)] [background-size:26px_26px]" />
          <div className="container-lux relative">
            <div className="mb-8 flex flex-col gap-6 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow mb-2 text-gold-300">Limited Time</p>
                <h2 className="heading-display text-3xl sm:text-4xl">The Flash Sale</h2>
                <p className="mt-2 text-sm text-white/70">
                  Exceptional offers — while they last.
                </p>
              </div>
              <CountdownTimer />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
              {sales.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section-lux container-lux">
        <Reveal>
          <SectionHeading
            eyebrow="Just Landed"
            title="New Arrivals"
            linkTo="/new-arrivals"
            linkText="View All"
          />
        </Reveal>
        {loading ? (
          <SkeletonLoader type="product" count={4} />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
            {newArrivals.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {recentlyViewedProducts.length > 0 && (
        <section className="section-lux bg-secondary-surface">
          <div className="container-lux">
            <Reveal>
              <SectionHeading eyebrow="Continue Where You Left Off" title="Recently Viewed" />
            </Reveal>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
              {recentlyViewedProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section-lux relative overflow-hidden border-t border-line bg-charcoal-900">
        <div className="absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-gold-500/15 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="container-lux relative">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow mb-3 text-gold-300">Private Access</p>
            <h2 className="heading-display text-3xl text-white sm:text-4xl">Stay in the Loop</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Subscribe for exclusive access to new drops, private sales, and member-only perks.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                aria-label="Email address"
                className="h-12 min-w-0 flex-1 rounded-full border border-white/15 bg-white/10 px-5 text-sm text-white placeholder-white/50 backdrop-blur-sm transition-colors focus:border-gold-400 focus:ring-2 focus:ring-gold-500/30 focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-gold-500 px-8 text-sm font-medium text-white transition-all duration-200 hover:bg-gold-400 hover:shadow-gold active:scale-[0.98]"
              >
                Subscribe <Icon name="ArrowRight" size={15} />
              </button>
            </form>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
