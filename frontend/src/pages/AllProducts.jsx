import { useState, useEffect, useCallback, useRef } from 'react'
import { SORT_OPTIONS } from '../constants'
import { productService } from '../services/productService'
import { categoryService } from '../services/categoryService'
import { mapProduct, mapCategory } from '../services/mappers'
import ProductCard from '../components/ProductCard'
import SkeletonLoader from '../components/SkeletonLoader'
import EmptyState from '../components/EmptyState'
import BackButton from '../components/BackButton'

const ITEMS_PER_PAGE = 12

const getSortParam = (sortBy) => {
  switch (sortBy) {
    case 'price-asc': return 'price,asc'
    case 'price-desc': return 'price,desc'
    case 'rating': return 'rating,desc'
    case 'newest':
    default: return 'createdAt,desc'
  }
}

export default function AllProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubCategory, setSelectedSubCategory] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [currentPage, setCurrentPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const initialLoadDone = useRef(false)

  useEffect(() => {
    categoryService.getAll()
      .then((r) => setCategories((r.data || []).map(mapCategory)))
      .catch(() => {})
  }, [])

  const fetchProducts = useCallback(() => {
    setLoading(true)
    const params = {
      page: currentPage,
      size: ITEMS_PER_PAGE,
      sort: getSortParam(sortBy),
    }
    const cat = categories.find((c) => c.name === selectedCategory)
    if (cat) params.category = cat.id
    if (selectedSubCategory) {
      const sub = cat?.subcategories?.find((s) => s.name === selectedSubCategory)
      if (sub) params.subcategory = sub.id
    }
    if (priceRange.min !== '') params.minPrice = priceRange.min
    if (priceRange.max !== '') params.maxPrice = priceRange.max

    productService.getProducts(params)
      .then((data) => {
        const list = (data.content || []).map(mapProduct)
        setProducts(list)
        setTotalPages(data.totalPages || 0)
        setTotalElements(data.totalElements || 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [currentPage, sortBy, selectedCategory, selectedSubCategory, priceRange.min, priceRange.max, categories])

  useEffect(() => {
    if (categories.length > 0 || !initialLoadDone.current) {
      initialLoadDone.current = true
      fetchProducts()
    }
  }, [fetchProducts, categories.length])

  const handlePageChange = (page) => {
    setCurrentPage(page - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearFilters = () => {
    setSelectedCategory('')
    setSelectedSubCategory('')
    setPriceRange({ min: '', max: '' })
    setCurrentPage(0)
  }

  const hasActiveFilters = selectedCategory !== '' || selectedSubCategory !== '' || priceRange.min !== '' || priceRange.max !== ''

  const availableSubCategories = selectedCategory
    ? (categories.find((c) => c.name === selectedCategory)?.subcategories || [])
    : []

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Category</h3>
        <div className="space-y-2">
          <button
            onClick={() => { setSelectedCategory(''); setSelectedSubCategory(''); setCurrentPage(0) }}
            className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition min-h-[44px] ${!selectedCategory ? 'text-[#C6A972] bg-[#C6A972]/10' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'}`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.name); setSelectedSubCategory(''); setCurrentPage(0) }}
              className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition min-h-[44px] ${selectedCategory === cat.name ? 'text-[#C6A972] bg-[#C6A972]/10' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {selectedCategory && availableSubCategories.length > 0 && (
        <div className="border-t border-[var(--border-color)] pt-6">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Subcategory</h3>
          <div className="space-y-2">
            <button
              onClick={() => { setSelectedSubCategory(''); setCurrentPage(0) }}
              className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition min-h-[44px] ${!selectedSubCategory ? 'text-[#C6A972] bg-[#C6A972]/10' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'}`}
            >
              All
            </button>
            {availableSubCategories.map((sub) => (
              <button
                key={sub}
                onClick={() => { setSelectedSubCategory(sub); setCurrentPage(0) }}
                className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition min-h-[44px] ${selectedSubCategory === sub ? 'text-[#C6A972] bg-[#C6A972]/10' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'}`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-[var(--border-color)] pt-6">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Price Range</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={priceRange.min}
            onChange={(e) => { setPriceRange((p) => ({ ...p, min: e.target.value })); setCurrentPage(0) }}
            className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#C6A972]/50 min-h-[48px]"
          />
          <input
            type="number"
            placeholder="Max"
            value={priceRange.max}
            onChange={(e) => { setPriceRange((p) => ({ ...p, max: e.target.value })); setCurrentPage(0) }}
            className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#C6A972]/50 min-h-[48px]"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full py-3 text-sm font-medium text-[#C6A972] border border-[var(--border-color)] rounded-full hover:bg-[var(--bg-hover)] transition active:scale-[0.98] min-h-[48px]"
        >
          Clear All Filters
        </button>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="bg-[var(--bg-page)] min-h-screen py-12">
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
    <div className="min-h-screen bg-[var(--bg-page)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <BackButton />
              <h1 className="text-2xl sm:text-3xl font-playfair-display font-bold text-[var(--text-primary)]">All Products</h1>
            </div>
            <p className="text-[var(--text-secondary)] text-sm mt-1">{totalElements} products</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFilterDrawerOpen(true)}
              className="lg:hidden inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-[var(--border-color)] rounded-full text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition active:scale-[0.98] min-h-[44px]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[#C6A972]" />
              )}
            </button>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(0) }}
              className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-secondary)] focus:outline-none focus:border-[#C6A972]/50 min-h-[44px]"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-[var(--bg-secondary)] rounded-xl p-6 sticky top-24">
              <FilterContent />
            </div>
          </aside>

          <div className="flex-1">
            {!loading && products.length === 0 ? (
              <div className="min-h-[40vh] flex items-center justify-center">
                <EmptyState
                  title="No products found"
                  message="Try adjusting your filters."
                />
              </div>
            ) : loading && products.length === 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonLoader key={i} type="product" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <button
                      onClick={() => handlePageChange(currentPage)}
                      disabled={currentPage === 0}
                      className="min-w-[44px] h-11 flex items-center justify-center rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] px-3 text-sm"
                    >
                      <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span className="hidden sm:inline">Previous</span>
                    </button>

                    <span className="sm:hidden text-sm text-[var(--text-secondary)]">
                      Page {currentPage + 1} of {totalPages}
                    </span>

                    <div className="hidden sm:flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-11 h-11 rounded-xl text-sm font-medium transition active:scale-[0.98] ${page === currentPage + 1 ? 'bg-[#C6A972] text-white' : 'border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'}`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 2)}
                      disabled={currentPage + 1 >= totalPages}
                      className="min-w-[44px] h-11 flex items-center justify-center rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] px-3 text-sm"
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
          className={`absolute top-0 left-0 h-full w-80 max-w-[85vw] bg-[var(--bg-card)] border-r border-[var(--border-color)] overflow-y-auto transform transition-transform duration-300 ${
            filterDrawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="sticky top-0 bg-[var(--bg-card)] z-10 flex items-center justify-between p-4 border-b border-[var(--border-color)]">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">Filters</h3>
            <button
              onClick={() => setFilterDrawerOpen(false)}
              className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-[var(--bg-hover)] transition active:scale-[0.98]"
              aria-label="Close filters"
            >
              <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
