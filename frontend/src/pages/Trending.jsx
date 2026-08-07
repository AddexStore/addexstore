import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productService } from '../services/productService'
import { mapProduct } from '../services/mappers'
import ProductCard from '../components/ProductCard'
import SkeletonLoader from '../components/SkeletonLoader'
import EmptyState from '../components/EmptyState'
import BackButton from '../components/BackButton'

const ITEMS_PER_PAGE = 12

export default function Trending() {
  const [products, setProducts] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [loading, setLoading] = useState(true)

  const sortOptions = [
    { value: 'createdAt,desc', label: 'Newest' },
    { value: 'price,asc', label: 'Price: Low to High' },
    { value: 'price,desc', label: 'Price: High to Low' },
    { value: 'rating,desc', label: 'Top Rated' },
  ]
  const [sortBy, setSortBy] = useState('createdAt,desc')

  useEffect(() => {
    setLoading(true)
    productService.getProducts({ page: currentPage, size: ITEMS_PER_PAGE, sort: sortBy, trending: true })
      .then((data) => {
        setProducts((data.content || []).map(mapProduct))
        setTotalPages(data.totalPages || 0)
        setTotalElements(data.totalElements || 0)
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [currentPage, sortBy])

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BackButton />
              <nav className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <Link to="/" className="hover:text-[var(--text-primary)] transition">Home</Link>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-[var(--text-primary)] font-medium">Trending</span>
              </nav>
            </div>
            <h1 className="font-playfair-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              Trending Now
            </h1>
            <p className="text-[var(--text-secondary)] text-sm mt-1">
              Most popular picks loved by our community
            </p>
          </div>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setCurrentPage(0) }}
            className="w-full sm:w-auto px-4 py-2.5 border border-[var(--border-color)] rounded-full text-sm text-[var(--text-secondary)] bg-[var(--bg-secondary)] focus:outline-none focus:ring-1 focus:ring-[#C6A972] cursor-pointer min-h-[44px]"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {loading && products.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonLoader key={i} type="product" />)}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            title="No trending products"
            message="Check back later for trending picks."
            actionLabel="Browse All Products"
            actionLink="/products"
          />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="min-w-[44px] min-h-[44px] rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page - 1)}
                    className={`min-w-[44px] min-h-[44px] rounded-xl text-sm font-medium transition ${
                      page === currentPage + 1
                        ? 'bg-[#C6A972] text-[var(--text-primary)]'
                        : 'border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage + 1 >= totalPages}
                  className="min-w-[44px] min-h-[44px] rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center justify-center"
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
