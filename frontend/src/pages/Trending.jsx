import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { products } from '../data/products'
import { SORT_OPTIONS } from '../constants'
import ProductCard from '../components/ProductCard'
import SkeletonLoader from '../components/SkeletonLoader'
import EmptyState from '../components/EmptyState'
import BackButton from '../components/BackButton'

const ITEMS_PER_PAGE = 12

const normalizeProduct = (p) => ({
  ...p,
  discount: p.discountPercentage,
  numReviews: p.totalReviews,
  images: p.image ? [p.image] : [],
})

export default function Trending() {
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)

  const trending = useMemo(() => {
    let result = products.filter((p) => p.trending).map(normalizeProduct)
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    }
    return result
  }, [sortBy])

  const totalPages = Math.ceil(trending.length / ITEMS_PER_PAGE)
  const paginated = trending.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#0F0F10]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BackButton />
              <nav className="flex items-center gap-2 text-sm text-[#B8B8C2]">
                <Link to="/" className="hover:text-white transition">Home</Link>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-white font-medium">Trending</span>
              </nav>
            </div>
            <h1 className="font-playfair-display text-2xl sm:text-3xl font-bold text-white">
              Trending Now
            </h1>
            <p className="text-[#B8B8C2] text-sm mt-1">
              Most popular picks loved by our community
            </p>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 border border-[#2D2D30] rounded-full text-sm text-[#B8B8C2] bg-[#232326] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] cursor-pointer min-h-[44px]"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <SkeletonLoader type="product" count={ITEMS_PER_PAGE} />
        ) : paginated.length === 0 ? (
          <EmptyState
            title="No trending products"
            message="Check back later for trending picks."
            actionLabel="Browse All Products"
            actionLink="/products"
          />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {paginated.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="min-w-[44px] min-h-[44px] rounded-xl border border-[#2D2D30] text-[#B8B8C2] hover:bg-[#2A2A2E] disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`min-w-[44px] min-h-[44px] rounded-xl text-sm font-medium transition ${
                      page === currentPage
                        ? 'bg-[#D4AF37] text-white'
                        : 'border border-[#2D2D30] text-[#B8B8C2] hover:bg-[#2A2A2E]'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="min-w-[44px] min-h-[44px] rounded-xl border border-[#2D2D30] text-[#B8B8C2] hover:bg-[#2A2A2E] disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
