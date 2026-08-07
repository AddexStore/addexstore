import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SORT_OPTIONS } from '../constants'
import { productService } from '../services/productService'
import { categoryService } from '../services/categoryService'
import { mapProduct, mapCategory } from '../services/mappers'
import ProductCard from '../components/ProductCard'
import SkeletonLoader from '../components/SkeletonLoader'
import EmptyState from '../components/EmptyState'
import BackButton from '../components/BackButton'

const ITEMS_PER_PAGE = 12

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const sortParam = searchParams.get('sort') || ''

  const [results, setResults] = useState([])
  const [categories, setCategories] = useState([])
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [loading, setLoading] = useState(true)

  const [selectedCategories, setSelectedCategories] = useState([])
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [sort, setSort] = useState(sortParam)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)

  useEffect(() => {
    categoryService.getAll()
      .then((r) => setCategories((r.data || []).map(mapCategory)))
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = {
      page: currentPage,
      size: ITEMS_PER_PAGE,
      sort: sort || 'createdAt,desc',
    }
    if (query) params.search = query
    const catIds = categories
      .filter((c) => selectedCategories.includes(c.name))
      .map((c) => c.id)
    if (catIds.length === 1) params.category = catIds[0]
    if (priceMin !== '') params.minPrice = priceMin
    if (priceMax !== '') params.maxPrice = priceMax

    productService.getProducts(params)
      .then((data) => {
        setResults((data.content || []).map(mapProduct))
        setTotalPages(data.totalPages || 0)
        setTotalElements(data.totalElements || 0)
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [query, currentPage, sort, selectedCategories, priceMin, priceMax, categories])

  const handleCategoryToggle = useCallback((cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
    setCurrentPage(0)
  }, [])

  const handleSortChange = useCallback((value) => {
    setSort(value)
    setCurrentPage(0)
    setSearchParams((prev) => {
      if (value) prev.set('sort', value)
      else prev.delete('sort')
      return prev
    })
  }, [setSearchParams])

  const handleClearFilters = useCallback(() => {
    setSelectedCategories([])
    setPriceMin('')
    setPriceMax('')
    setSort('')
    setCurrentPage(0)
  }, [])

  const hasFilters = selectedCategories.length > 0 || priceMin !== '' || priceMax !== '' || sort !== ''

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">Filters</h3>
        {hasFilters && (
          <button onClick={handleClearFilters} className="text-xs text-[#C6A972] hover:text-[#B8965F] font-medium transition">Clear All</button>
        )}
      </div>
      <div>
        <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Category</h4>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" checked={selectedCategories.includes(cat.name)}
                onChange={() => handleCategoryToggle(cat.name)}
                className="w-4 h-4 rounded border-[var(--border-color)] text-[#C6A972] focus:ring-[#C6A972] accent-[#C6A972] bg-[var(--bg-secondary)]" />
              <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Price Range</h4>
        <div className="flex items-center gap-2">
          <input type="number" placeholder="Min" value={priceMin} onChange={(e) => { setPriceMin(e.target.value); setCurrentPage(0) }}
            className="w-full px-3 py-2 text-sm border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C6A972] focus:border-transparent transition bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)]" />
          <span className="text-[var(--text-secondary)] text-sm">&mdash;</span>
          <input type="number" placeholder="Max" value={priceMax} onChange={(e) => { setPriceMax(e.target.value); setCurrentPage(0) }}
            className="w-full px-3 py-2 text-sm border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C6A972] focus:border-transparent transition bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)]" />
        </div>
      </div>
      <div>
        <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Sort By</h4>
        <select value={sort} onChange={(e) => handleSortChange(e.target.value)}
          className="w-full px-3 py-2.5 text-sm border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#C6A972] focus:border-transparent transition">
          <option value="">Default</option>
          {SORT_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
        </select>
      </div>
      <button onClick={() => setFilterDrawerOpen(false)}
        className="w-full py-3 bg-[#C6A972] text-white text-sm font-semibold rounded-full hover:bg-[#B8965F] transition active:scale-[0.98] min-h-[48px] lg:hidden">Apply Filters</button>
    </div>
  )

  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <BackButton />
            <h1 className="font-playfair-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              {query ? `Results for "${query}"` : 'All Products'}
            </h1>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {totalElements} {totalElements === 1 ? 'product' : 'products'} found
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-[var(--bg-card)] rounded-xl shadow-lg shadow-black/5 p-6 sticky top-24">
              <FilterContent />
            </div>
          </aside>

          <main className="flex-1">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setFilterDrawerOpen(true)}
                className="lg:hidden inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-[var(--border-color)] rounded-full text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition active:scale-[0.98] min-h-[44px]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
                {hasFilters && <span className="w-2 h-2 rounded-full bg-[#C6A972]" />}
              </button>
            </div>

            {loading && results.length === 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 8 }).map((_, i) => <SkeletonLoader key={i} type="product" />)}
              </div>
            ) : results.length === 0 ? (
              <div className="flex items-center justify-center min-h-[40vh]">
                <EmptyState title="No products found"
                  message={query ? `We couldn't find any matches for "${query}". Try adjusting your search or filters.` : 'No products match your current filters. Try broadening your criteria.'} />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {results.map((product) => <ProductCard key={product.id} product={product} />)}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <button onClick={() => setCurrentPage((p) => Math.max(0, p - 1))} disabled={currentPage === 0}
                      className="min-w-[44px] h-11 flex items-center justify-center rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] px-3 text-sm">
                      <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      <span className="hidden sm:inline">Previous</span>
                    </button>
                    <span className="sm:hidden text-sm text-[var(--text-secondary)]">Page {currentPage + 1} of {totalPages}</span>
                    <div className="hidden sm:flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button key={page} onClick={() => setCurrentPage(page - 1)}
                          className={`w-11 h-11 rounded-xl text-sm font-medium transition active:scale-[0.98] ${page === currentPage + 1 ? 'bg-[#C6A972] text-white' : 'border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'}`}>{page}</button>
                      ))}
                    </div>
                    <button onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))} disabled={currentPage + 1 >= totalPages}
                      className="min-w-[44px] h-11 flex items-center justify-center rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] px-3 text-sm">
                      <span className="hidden sm:inline">Next</span>
                      <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${filterDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60" onClick={() => setFilterDrawerOpen(false)} />
        <div className={`absolute bottom-0 left-0 right-0 max-h-[85vh] bg-[var(--bg-card)] border-t border-[var(--border-color)] rounded-t-2xl overflow-y-auto transform transition-transform duration-300 ${filterDrawerOpen ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="sticky top-0 bg-[var(--bg-card)] z-10 flex items-center justify-between p-4 border-b border-[var(--border-color)]">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">Filters</h3>
            <button onClick={() => setFilterDrawerOpen(false)} className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-[var(--bg-hover)] transition active:scale-[0.98]" aria-label="Close filters">
              <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="p-4"><FilterContent /></div>
        </div>
      </div>
    </div>
  )
}
