import { useState, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { products } from '../data/products'
import { SORT_OPTIONS } from '../constants'
import ProductCard from '../components/ProductCard'
import EmptyState from '../components/EmptyState'
import BackButton from '../components/BackButton'

const normalizeProduct = (p) => ({
  ...p,
  discount: p.discountPercentage,
  numReviews: p.totalReviews,
  images: p.image ? [p.image] : [],
})

const allProducts = products.map(normalizeProduct)

const allCategories = [...new Set(allProducts.map((p) => p.category))]

function filterProducts(query, productsList, selectedCategories, priceMin, priceMax, sort) {
  let filtered = productsList

  if (query) {
    const q = query.toLowerCase()
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.subCategory.toLowerCase().includes(q)
    )
  }

  if (selectedCategories.length > 0) {
    filtered = filtered.filter((p) => selectedCategories.includes(p.category))
  }

  if (priceMin !== '') {
    filtered = filtered.filter((p) => p.price >= Number(priceMin))
  }

  if (priceMax !== '') {
    filtered = filtered.filter((p) => p.price <= Number(priceMax))
  }

  switch (sort) {
    case 'price-asc':
      filtered.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      filtered.sort((a, b) => b.price - a.price)
      break
    case 'newest':
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      break
    case 'rating':
      filtered.sort((a, b) => b.rating - a.rating)
      break
    default:
      break
  }

  return filtered
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const sortParam = searchParams.get('sort') || ''

  const [selectedCategories, setSelectedCategories] = useState([])
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [sort, setSort] = useState(sortParam)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)

  const results = useMemo(
    () => filterProducts(query, allProducts, selectedCategories, priceMin, priceMax, sort),
    [query, selectedCategories, priceMin, priceMax, sort]
  )

  const handleCategoryToggle = useCallback((cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }, [])

  const handleSortChange = useCallback((value) => {
    setSort(value)
    setSearchParams((prev) => {
      if (value) {
        prev.set('sort', value)
      } else {
        prev.delete('sort')
      }
      return prev
    })
  }, [setSearchParams])

  const handleClearFilters = useCallback(() => {
    setSelectedCategories([])
    setPriceMin('')
    setPriceMax('')
    setSort('')
  }, [])

  const hasFilters = selectedCategories.length > 0 || priceMin !== '' || priceMax !== '' || sort !== ''

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">
          Filters
        </h3>
        {hasFilters && (
          <button
            onClick={handleClearFilters}
            className="text-xs text-[#C6A972] hover:text-[#B8965F] font-medium transition"
          >
            Clear All
          </button>
        )}
      </div>

      <div>
        <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
          Category
        </h4>
        <div className="space-y-2">
          {allCategories.map((cat) => (
            <label
              key={cat}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat)}
                onChange={() => handleCategoryToggle(cat)}
                className="w-4 h-4 rounded border-[var(--border-color)] text-[#C6A972] focus:ring-[#C6A972] accent-[#C6A972] bg-[var(--bg-secondary)]"
              />
              <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition">
                {cat}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
          Price Range
        </h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C6A972] focus:border-transparent transition bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)]"
          />
          <span className="text-[var(--text-secondary)] text-sm">â€”</span>
          <input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C6A972] focus:border-transparent transition bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)]"
          />
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
          Sort By
        </h4>
        <select
          value={sort}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full px-3 py-2.5 text-sm border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#C6A972] focus:border-transparent transition"
        >
          <option value="">Default</option>
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => setFilterDrawerOpen(false)}
        className="w-full py-3 bg-[#C6A972] text-white text-sm font-semibold rounded-full hover:bg-[#B8965F] transition active:scale-[0.98] min-h-[48px] lg:hidden"
      >
        Apply Filters
      </button>
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
            {results.length} {results.length === 1 ? 'product' : 'products'} found
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
              <button
                onClick={() => setFilterDrawerOpen(true)}
                className="lg:hidden inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-[var(--border-color)] rounded-full text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition active:scale-[0.98] min-h-[44px]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
                {hasFilters && (
                  <span className="w-2 h-2 rounded-full bg-[#C6A972]" />
                )}
              </button>
            </div>

            {results.length === 0 ? (
              <div className="flex items-center justify-center min-h-[40vh]">
                <EmptyState
                  title="No products found"
                  message={
                    query
                      ? `We couldn't find any matches for "${query}". Try adjusting your search or filters.`
                      : 'No products match your current filters. Try broadening your criteria.'
                  }
                  actionLabel="Clear Filters"
                  actionLink={hasFilters ? undefined : '/'}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {results.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
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
          className={`absolute bottom-0 left-0 right-0 max-h-[85vh] bg-[var(--bg-card)] border-t border-[var(--border-color)] rounded-t-2xl overflow-y-auto transform transition-transform duration-300 ${
            filterDrawerOpen ? 'translate-y-0' : 'translate-y-full'
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
