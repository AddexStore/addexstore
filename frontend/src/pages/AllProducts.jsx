import { useState, useMemo } from 'react'
import { products } from '../data/products'
import { categories } from '../data/categories'
import { SORT_OPTIONS } from '../constants'
import ProductCard from '../components/ProductCard'
import SkeletonLoader from '../components/SkeletonLoader'
import EmptyState from '../components/EmptyState'
import BackButton from '../components/BackButton'

const ITEMS_PER_PAGE = 12

export default function AllProducts() {
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubCategory, setSelectedSubCategory] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)

  const filtered = useMemo(() => {
    let result = [...products]
    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory)
    }
    if (selectedSubCategory) {
      result = result.filter((p) => p.subCategory === selectedSubCategory)
    }
    if (priceRange.min !== '') {
      result = result.filter((p) => p.price >= Number(priceRange.min))
    }
    if (priceRange.max !== '') {
      result = result.filter((p) => p.price <= Number(priceRange.max))
    }
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
  }, [selectedCategory, selectedSubCategory, sortBy, priceRange])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearFilters = () => {
    setSelectedCategory('')
    setSelectedSubCategory('')
    setPriceRange({ min: '', max: '' })
    setCurrentPage(1)
  }

  const hasActiveFilters = selectedCategory !== '' || selectedSubCategory !== '' || priceRange.min !== '' || priceRange.max !== ''

  const availableSubCategories = selectedCategory
    ? [...new Set(products.filter((p) => p.category === selectedCategory && p.subCategory).map((p) => p.subCategory))]
    : []

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Category</h3>
        <div className="space-y-2">
          <button
            onClick={() => { setSelectedCategory(''); setSelectedSubCategory(''); setCurrentPage(1) }}
            className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition min-h-[44px] ${!selectedCategory ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-[#B8B8C2] hover:text-white hover:bg-[#2A2A2E]'}`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.name); setSelectedSubCategory(''); setCurrentPage(1) }}
              className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition min-h-[44px] ${selectedCategory === cat.name ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-[#B8B8C2] hover:text-white hover:bg-[#2A2A2E]'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {selectedCategory && availableSubCategories.length > 0 && (
        <div className="border-t border-[#2D2D30] pt-6">
          <h3 className="text-sm font-semibold text-white mb-3">Subcategory</h3>
          <div className="space-y-2">
            <button
              onClick={() => { setSelectedSubCategory(''); setCurrentPage(1) }}
              className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition min-h-[44px] ${!selectedSubCategory ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-[#B8B8C2] hover:text-white hover:bg-[#2A2A2E]'}`}
            >
              All
            </button>
            {availableSubCategories.map((sub) => (
              <button
                key={sub}
                onClick={() => { setSelectedSubCategory(sub); setCurrentPage(1) }}
                className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition min-h-[44px] ${selectedSubCategory === sub ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-[#B8B8C2] hover:text-white hover:bg-[#2A2A2E]'}`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-[#2D2D30] pt-6">
        <h3 className="text-sm font-semibold text-white mb-3">Price Range</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={priceRange.min}
            onChange={(e) => { setPriceRange((p) => ({ ...p, min: e.target.value })); setCurrentPage(1) }}
            className="w-full bg-[#232326] border border-[#2D2D30] rounded-lg px-3 py-2 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#D4AF37]/50 min-h-[48px]"
          />
          <input
            type="number"
            placeholder="Max"
            value={priceRange.max}
            onChange={(e) => { setPriceRange((p) => ({ ...p, max: e.target.value })); setCurrentPage(1) }}
            className="w-full bg-[#232326] border border-[#2D2D30] rounded-lg px-3 py-2 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#D4AF37]/50 min-h-[48px]"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full py-3 text-sm font-medium text-[#D4AF37] border border-[#2D2D30] rounded-full hover:bg-[#2A2A2E] transition active:scale-[0.98] min-h-[48px]"
        >
          Clear All Filters
        </button>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="bg-[#0F0F10] min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-48 skeleton-pulse rounded mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonLoader key={i} type="product" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F0F10]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <BackButton />
              <h1 className="text-2xl sm:text-3xl font-playfair-display font-bold text-white">All Products</h1>
            </div>
            <p className="text-[#B8B8C2] text-sm mt-1">{filtered.length} products</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFilterDrawerOpen(true)}
              className="lg:hidden inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-[#2D2D30] rounded-full text-sm font-medium text-[#B8B8C2] hover:bg-[#2A2A2E] transition active:scale-[0.98] min-h-[44px]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
              )}
            </button>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1) }}
              className="bg-[#18181B] border border-[#2D2D30] rounded-xl px-4 py-2.5 text-sm text-[#B8B8C2] focus:outline-none focus:border-[#D4AF37]/50 min-h-[44px]"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-[#18181B] rounded-xl p-6 sticky top-24">
              <FilterContent />
            </div>
          </aside>

          <div className="flex-1">
            {paginated.length === 0 ? (
              <div className="min-h-[40vh] flex items-center justify-center">
                <EmptyState
                  title="No products found"
                  message="Try adjusting your filters."
                />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {paginated.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="min-w-[44px] h-11 flex items-center justify-center rounded-xl border border-[#2D2D30] text-[#B8B8C2] hover:bg-[#2A2A2E] transition disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] px-3 text-sm"
                    >
                      <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span className="hidden sm:inline">Previous</span>
                    </button>

                    <span className="sm:hidden text-sm text-[#B8B8C2]">
                      Page {currentPage} of {totalPages}
                    </span>

                    <div className="hidden sm:flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-11 h-11 rounded-xl text-sm font-medium transition active:scale-[0.98] ${page === currentPage ? 'bg-[#D4AF37] text-black' : 'border border-[#2D2D30] text-[#B8B8C2] hover:bg-[#2A2A2E]'}`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="min-w-[44px] h-11 flex items-center justify-center rounded-xl border border-[#2D2D30] text-[#B8B8C2] hover:bg-[#2A2A2E] transition disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] px-3 text-sm"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
          filterDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-0 bg-black/60"
          onClick={() => setFilterDrawerOpen(false)}
        />
        <div
          className={`absolute top-0 left-0 h-full w-80 max-w-[85vw] bg-[#0F0F10] border-r border-[#2D2D30] overflow-y-auto transform transition-transform duration-300 ${
            filterDrawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="sticky top-0 bg-[#0F0F10] z-10 flex items-center justify-between p-4 border-b border-[#2D2D30]">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Filters</h3>
            <button
              onClick={() => setFilterDrawerOpen(false)}
              className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-[#2A2A2E] transition active:scale-[0.98]"
              aria-label="Close filters"
            >
              <svg className="w-5 h-5 text-[#B8B8C2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4">
            <FilterContent />
          </div>
        </div>
      </div>
    </div>
  )
}
