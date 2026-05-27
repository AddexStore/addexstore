import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { products } from '../data/products'
import { categories } from '../data/categories'
import { useRecentlyViewed } from '../hooks/useRecentlyViewed'
import HeroBanner from '../components/HeroBanner'
import CategoryCard from '../components/CategoryCard'
import ProductCard from '../components/ProductCard'

const normalizeProduct = (p) => ({
  ...p,
  discount: p.discountPercentage,
  numReviews: p.totalReviews,
  images: p.image ? [p.image] : [],
})

const flashSaleProducts = products
  .filter((p) => p.discountPercentage > 0)
  .map(normalizeProduct)

const trendingProducts = products
  .filter((p) => p.trending)
  .map(normalizeProduct)

const featuredProducts = products
  .filter((p) => p.featured)
  .map(normalizeProduct)

const allNormalized = products.map(normalizeProduct)

function getRandomProducts(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 24,
    minutes: 0,
    seconds: 0,
  })

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
    <div className="flex items-center gap-3">
      {[
        { label: 'Hours', value: pad(timeLeft.hours) },
        { label: 'Minutes', value: pad(timeLeft.minutes) },
        { label: 'Seconds', value: pad(timeLeft.seconds) },
      ].map(({ label, value }) => (
        <div key={label} className="text-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-[#232326] rounded-xl shadow-lg shadow-black/20 flex items-center justify-center">
            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-white font-inter">
              {value}
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-white/70 mt-1 block">
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}

function SectionHeader({ title, linkTo, linkText }) {
  return (
    <div className="flex items-end justify-between mb-6 sm:mb-8">
      <h2 className="font-playfair-display text-xl sm:text-2xl lg:text-3xl font-bold text-white">
        {title}
      </h2>
      {linkTo && linkText && (
        <Link
          to={linkTo}
          className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-[#D4AF37] hover:text-[#C9A84C] transition"
        >
          {linkText}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      )}
    </div>
  )
}

export default function Home() {
  const { getRecentlyViewed } = useRecentlyViewed()
  const recentlyViewed = getRecentlyViewed()

  const recommended = useMemo(
    () => getRandomProducts(allNormalized, 4),
    []
  )

  const recentlyViewedProducts = useMemo(
    () =>
      recentlyViewed
        .map((rv) => allNormalized.find((p) => p.id === rv.id))
        .filter(Boolean),
    [recentlyViewed]
  )

  return (
    <div className="min-h-screen bg-[#0F0F10]">
      <HeroBanner />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
        <SectionHeader title="Shop by Category" linkTo="/categories" linkText="View All" />
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map((cat) => (
            <div key={cat.id} className="flex-shrink-0 w-[130px] sm:w-[160px]">
              <CategoryCard
                icon={
                  <span dangerouslySetInnerHTML={{ __html: cat.icon }} />
                }
                name={cat.name}
                productCount={cat.productCount}
                slug={cat.slug}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
        <SectionHeader title="Trending Now" linkTo="/trending" linkText="View All" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {trendingProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
        <SectionHeader title="Featured Collection" linkTo="/products" linkText="View All" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {featuredProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {flashSaleProducts.length > 0 && (
        <section className="bg-gradient-to-r from-[#0F0F10] via-[#18181B] to-[#0F0F10] py-10 sm:py-14 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-6 sm:mb-10">
              <div>
                <h2 className="font-playfair-display text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                  Flash Sale
                </h2>
                <p className="text-[#B8B8C2] text-xs sm:text-sm mt-1">
                  Limited time offers — grab them before they're gone
                </p>
              </div>
              <CountdownTimer />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {flashSaleProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
        <SectionHeader title="You May Also Like" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {recommended.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {recentlyViewedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
          <SectionHeader title="Recently Viewed" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {recentlyViewedProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="bg-[#18181B] py-10 sm:py-14 lg:py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-playfair-display text-xl sm:text-2xl lg:text-3xl font-bold text-white">
            Stay in the Loop
          </h2>
          <p className="text-[#B8B8C2] text-xs sm:text-sm mt-3 mb-6 sm:mb-8 max-w-md mx-auto">
            Subscribe for exclusive access to new drops, private sales, and member-only perks.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-5 py-3 rounded-xl sm:rounded-l-full border border-[#2D2D30] bg-[#232326] text-sm text-white placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 bg-[#D4AF37] text-black text-sm font-medium rounded-xl sm:rounded-r-full hover:bg-[#C9A84C] transition active:scale-[0.98] shadow-lg shadow-black/20"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
