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
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
          Filters
        </h3>
        {hasFilters && (
          <button
            onClick={handleClearFilters}
            className="text-xs text-[#D4AF37] hover:text-[#C9A84C] font-medium transition"
          >
            Clear All
          </button>
        )}
      </div>

      <div>
        <h4 className="text-xs font-semibold text-[#B8B8C2] uppercase tracking-wider mb-3">
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
                className="w-4 h-4 rounded border-[#2D2D30] text-[#D4AF37] focus:ring-[#D4AF37] accent-[#D4AF37] bg-[#18181B]"
              />
              <span className="text-sm text-[#B8B8C2] group-hover:text-white transition">
                {cat}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-[#B8B8C2] uppercase tracking-wider mb-3">
          Price Range
        </h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-[#2D2D30] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition bg-[#18181B] text-white placeholder-[#6B7280]"
          />
          <span className="text-[#6B7280] text-sm">—</span>
          <input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-[#2D2D30] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition bg-[#18181B] text-white placeholder-[#6B7280]"
          />
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-[#B8B8C2] uppercase tracking-wider mb-3">
          Sort By
        </h4>
        <select
          value={sort}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full px-3 py-2.5 text-sm border border-[#2D2D30] rounded-lg bg-[#18181B] text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition"
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
        className="w-full py-3 bg-[#D4AF37] text-black text-sm font-semibold rounded-full hover:bg-[#C9A84C] transition active:scale-[0.98] min-h-[48px] lg:hidden"
      >
        Apply Filters
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0F0F10]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <BackButton />
            <h1 className="font-playfair-display text-2xl sm:text-3xl font-bold text-white">
              {query ? `Results for "${query}"` : 'All Products'}
            </h1>
          </div>
          <p className="text-sm text-[#B8B8C2] mt-1">
            {results.length} {results.length === 1 ? 'product' : 'products'} found
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-[#232326] rounded-xl shadow-lg shadow-black/20 p-6 sticky top-24">
              <FilterContent />
            </div>
          </aside>

          <main className="flex-1">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setFilterDrawerOpen(true)}
                className="lg:hidden inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-[#2D2D30] rounded-full text-sm font-medium text-[#B8B8C2] hover:bg-[#2A2A2E] transition active:scale-[0.98] min-h-[44px]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
                {hasFilters && (
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
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
          className={`absolute bottom-0 left-0 right-0 max-h-[85vh] bg-[#0F0F10] border-t border-[#2D2D30] rounded-t-2xl overflow-y-auto transform transition-transform duration-300 ${
            filterDrawerOpen ? 'translate-y-0' : 'translate-y-full'
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
