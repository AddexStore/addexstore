import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SORT_OPTIONS } from '../constants'
import { productService } from '../services/productService'
import { categoryService } from '../services/categoryService'
import { mapProduct, mapCategory } from '../services/mappers'
import ProductCard from '../components/ProductCard'
import SkeletonLoader from '../components/SkeletonLoader'
import EmptyState from '../components/EmptyState'
import Button from '../components/ui/Button'
import Icon from '../components/ui/Icon'
import { Select, Input, Checkbox } from '../components/ui/Input'
import Pagination from '../components/ui/Pagination'

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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
          Filters
        </h3>
        {hasFilters && (
          <button
            onClick={handleClearFilters}
            className="text-xs font-medium text-gold-600 transition-colors hover:text-gold-700"
          >
            Clear All
          </button>
        )}
      </div>

      <div>
        <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
          Category
        </h4>
        <div className="space-y-2.5">
          {categories.map((cat) => (
            <Checkbox
              key={cat.id}
              label={cat.name}
              checked={selectedCategories.includes(cat.name)}
              onChange={() => handleCategoryToggle(cat.name)}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-line pt-6">
        <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
          Price Range
        </h4>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => { setPriceMin(e.target.value); setCurrentPage(0) }}
            aria-label="Minimum price"
          />
          <span className="text-faint">—</span>
          <Input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => { setPriceMax(e.target.value); setCurrentPage(0) }}
            aria-label="Maximum price"
          />
        </div>
      </div>

      <div className="border-t border-line pt-6">
        <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
          Sort By
        </h4>
        <Select value={sort} onChange={(e) => handleSortChange(e.target.value)}>
          <option value="">Default</option>
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Select>
      </div>

      <Button
        variant="primary"
        fullWidth
        className="lg:hidden"
        onClick={() => setFilterDrawerOpen(false)}
      >
        Apply Filters
      </Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-page">
      <div className="container-lux py-8 sm:py-12">
        <div className="mb-8">
          <p className="eyebrow mb-2 text-gold-600">Search</p>
          <h1 className="heading-display text-2xl sm:text-3xl">
            {query ? `Results for “${query}”` : 'All Products'}
          </h1>
          <p className="mt-1 text-sm text-sub">
            {totalElements} {totalElements === 1 ? 'product' : 'products'} found
          </p>
        </div>

        <div className="flex flex-col gap-10 lg:flex-row">
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-28 rounded-card border border-line bg-surface p-6 shadow-card">
              <FilterContent />
            </div>
          </aside>

          <main className="flex-1">
            <div className="mb-6 flex items-center">
              <Button
                variant="outline"
                size="md"
                icon="SlidersHorizontal"
                className="lg:hidden"
                onClick={() => setFilterDrawerOpen(true)}
              >
                Filters
                {hasFilters && <span className="h-2 w-2 rounded-full bg-gold-500" />}
              </Button>
            </div>

            {loading && results.length === 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonLoader key={i} type="product" />
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="flex min-h-[40vh] items-center justify-center">
                <EmptyState
                  title="No products found"
                  message={query
                    ? `We couldn't find any matches for “${query}”. Try adjusting your search or filters.`
                    : 'No products match your current filters. Try broadening your criteria.'}
                />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6">
                  {results.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <div className="mt-12">
                  <Pagination
                    page={currentPage + 1}
                    totalPages={totalPages}
                    onPageChange={(p) => setCurrentPage(p - 1)}
                  />
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 lg:hidden ${
          filterDrawerOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="absolute inset-0 bg-black/60" onClick={() => setFilterDrawerOpen(false)} />
        <div
          className={`absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-card border-t border-line bg-surface transition-transform duration-300 ${
            filterDrawerOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
          role="dialog"
          aria-label="Filters"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-surface p-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink">
              Filters
            </h3>
            <button
              onClick={() => setFilterDrawerOpen(false)}
              className="flex h-11 w-11 items-center justify-center rounded-full text-sub transition-colors hover:bg-subtle hover:text-ink"
              aria-label="Close filters"
            >
              <Icon name="X" />
            </button>
          </div>
          <div className="p-5">
            <FilterContent />
          </div>
        </div>
      </div>
    </div>
  )
}
