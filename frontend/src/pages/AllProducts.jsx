import { useState, useEffect, useCallback, useRef } from 'react'
import { SORT_OPTIONS } from '../constants'
import { productService } from '../services/productService'
import { categoryService } from '../services/categoryService'
import { mapProduct, mapCategory } from '../services/mappers'
import ProductCard from '../components/ProductCard'
import SkeletonLoader from '../components/SkeletonLoader'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Icon from '../components/ui/Icon'
import { Select, Input } from '../components/ui/Input'
import Pagination from '../components/ui/Pagination'

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

  const filterBtnClass = (active) =>
    `flex w-full min-h-[44px] items-center justify-between rounded-field px-4 py-2.5 text-left text-sm transition-colors ${
      active
        ? 'bg-gold-50 font-medium text-gold-800 ring-1 ring-gold-500/40'
        : 'text-sub hover:bg-subtle hover:text-ink'
    }`

  const FilterContent = () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
          Category
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => { setSelectedCategory(''); setSelectedSubCategory(''); setCurrentPage(0) }}
            className={filterBtnClass(!selectedCategory)}
          >
            All
            {!selectedCategory && <Icon name="Check" size="sm" className="text-gold-600" />}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.name); setSelectedSubCategory(''); setCurrentPage(0) }}
              className={filterBtnClass(selectedCategory === cat.name)}
            >
              {cat.name}
              {selectedCategory === cat.name && <Icon name="Check" size="sm" className="text-gold-600" />}
            </button>
          ))}
        </div>
      </div>

      {selectedCategory && availableSubCategories.length > 0 && (
        <div className="border-t border-line pt-6">
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
            Subcategory
          </h3>
          <div className="space-y-1">
            <button
              onClick={() => { setSelectedSubCategory(''); setCurrentPage(0) }}
              className={filterBtnClass(!selectedSubCategory)}
            >
              All
              {!selectedSubCategory && <Icon name="Check" size="sm" className="text-gold-600" />}
            </button>
            {availableSubCategories.map((sub) => (
              <button
                key={sub}
                onClick={() => { setSelectedSubCategory(sub); setCurrentPage(0) }}
                className={filterBtnClass(selectedSubCategory === sub)}
              >
                {sub}
                {selectedSubCategory === sub && <Icon name="Check" size="sm" className="text-gold-600" />}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-line pt-6">
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
          Price Range
        </h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={priceRange.min}
            onChange={(e) => { setPriceRange((p) => ({ ...p, min: e.target.value })); setCurrentPage(0) }}
            aria-label="Minimum price"
          />
          <span className="text-faint">—</span>
          <Input
            type="number"
            placeholder="Max"
            value={priceRange.max}
            onChange={(e) => { setPriceRange((p) => ({ ...p, max: e.target.value })); setCurrentPage(0) }}
            aria-label="Maximum price"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <Button
          variant="outline"
          fullWidth
          icon="X"
          onClick={clearFilters}
        >
          Clear All Filters
        </Button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-page">
      <div className="container-lux py-8 sm:py-12">
        <PageHeader
          title="All Products"
          description={`${totalElements} ${totalElements === 1 ? 'piece' : 'pieces'}`}
        />

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="outline"
            size="md"
            icon="SlidersHorizontal"
            className="lg:hidden"
            onClick={() => setFilterDrawerOpen(true)}
          >
            Filters
            {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-gold-500" />}
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-xs uppercase tracking-[0.14em] text-faint sm:inline">
              Sort
            </span>
            <Select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(0) }}
              aria-label="Sort products"
              className="w-56"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex gap-10">
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-28 rounded-card border border-line bg-surface p-6 shadow-card">
              <h2 className="mb-5 text-xs font-semibold uppercase tracking-[0.14em] text-ink">
                Refine
              </h2>
              <FilterContent />
            </div>
          </aside>

          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonLoader key={i} type="product" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex min-h-[40vh] items-center justify-center">
                <EmptyState
                  title="No products found"
                  message="Try adjusting your filters."
                />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                <div className="mt-12">
                  <Pagination
                    page={currentPage + 1}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 lg:hidden ${
          filterDrawerOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="absolute inset-0 bg-black/60" onClick={() => setFilterDrawerOpen(false)} />
        <div
          className={`absolute left-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto border-r border-line bg-surface transition-transform duration-300 ${
            filterDrawerOpen ? 'translate-x-0' : '-translate-x-full'
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
