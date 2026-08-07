import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { SORT_OPTIONS, COLORS, SIZES } from '../constants'
import { productService } from '../services/productService'
import { categoryService } from '../services/categoryService'
import { mapProduct, mapCategory } from '../services/mappers'
import { getAssetUrl } from '../services/api'
import ProductCard from '../components/ProductCard'
import SkeletonLoader from '../components/SkeletonLoader'
import EmptyState from '../components/EmptyState'
import Button from '../components/ui/Button'
import Icon from '../components/ui/Icon'
import { Select, Input, Checkbox } from '../components/ui/Input'
import Pagination from '../components/ui/Pagination'
import SafeIcon from '../components/SafeIcon'
import { isSvgMarkup } from '../utils/sanitizeSvg'

const ITEMS_PER_PAGE = 12

const COLOR_MAP = {
  Black: '#000', White: '#fff', Navy: '#1e3a5f', Red: '#dc2626',
  Gold: '#C2A366', Beige: '#f5f5dc', Brown: '#8b4513', Gray: '#6b7280',
  Pink: '#e8a0b4', Blue: '#3b82f6', Green: '#22c55e', Purple: '#7c3aed',
}

export default function CategoryProducts() {
  const { categoryName } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedSub = searchParams.get('sub')

  const [category, setCategory] = useState(null)
  const [categoryLoading, setCategoryLoading] = useState(true)
  const [allCategoryProducts, setAllCategoryProducts] = useState([])
  const [productLoading, setProductLoading] = useState(false)

  useEffect(() => {
    setCategoryLoading(true)
    categoryService.getBySlug(categoryName)
      .then((res) => setCategory(mapCategory(res.data)))
      .catch(() => setCategory(null))
      .finally(() => setCategoryLoading(false))
  }, [categoryName])

  useEffect(() => {
    if (!category?.id) return
    setProductLoading(true)
    productService.getProducts({ category: category.id, page: 0, size: 100, sort: 'createdAt,desc' })
      .then((data) => setAllCategoryProducts((data.content || []).map(mapProduct)))
      .catch(() => setAllCategoryProducts([]))
      .finally(() => setProductLoading(false))
  }, [category?.id])

  const normalizedSubcategories = useMemo(() => {
    if (!category?.subcategories) return []
    return category.subcategories.map((sub) =>
      typeof sub === 'string' ? { name: sub, slug: sub.toLowerCase().replace(/\s+/g, '-') } : sub
    )
  }, [category])

  const loading = categoryLoading || productLoading
  const [selectedSubcategories, setSelectedSubcategories] = useState([])
  const [priceRange, setPriceRange] = useState([0, 50000])
  const [selectedBrands, setSelectedBrands] = useState([])
  const [selectedColors, setSelectedColors] = useState([])
  const [selectedSizes, setSelectedSizes] = useState([])
  const [sortBy, setSortBy] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)

  useEffect(() => {
    setCurrentPage(1)
    setSelectedSubcategories([])
    setPriceRange([0, 50000])
    setSelectedBrands([])
    setSelectedColors([])
    setSelectedSizes([])
    setSortBy('')
  }, [categoryName, selectedSub])

  const categoryProducts = allCategoryProducts

  const sidebarSubcategories = useMemo(
    () => [...new Set(categoryProducts.map((p) => p.subCategory))],
    [categoryProducts]
  )

  const brands = useMemo(
    () => [...new Set(categoryProducts.map((p) => p.brand))],
    [categoryProducts]
  )

  const filteredProducts = useMemo(() => {
    let result = [...categoryProducts]

    if (selectedSub) {
      result = result.filter((p) => p.subCategory === selectedSub)
    } else if (selectedSubcategories.length > 0) {
      result = result.filter((p) => selectedSubcategories.includes(p.subCategory))
    }

    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    )

    if (selectedBrands.length > 0) {
      result = result.filter((p) => selectedBrands.includes(p.brand))
    }

    if (selectedColors.length > 0) {
      result = result.filter((p) =>
        p.colors?.some((c) => selectedColors.includes(c))
      )
    }

    if (selectedSizes.length > 0) {
      result = result.filter((p) =>
        p.sizes?.some((s) => selectedSizes.includes(s))
      )
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
      case 'rating':
        result.sort((a, b) => b.rating - a.rating)
        break
    }

    return result
  }, [categoryProducts, selectedSub, selectedSubcategories, priceRange, selectedBrands, selectedColors, selectedSizes, sortBy])

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const toggleSubcategory = (sub) => {
    setSelectedSubcategories((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    )
  }

  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    )
  }

  const toggleColor = (color) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    )
  }

  const toggleSize = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    )
  }

  const clearAllFilters = () => {
    setSelectedSubcategories([])
    setPriceRange([0, 50000])
    setSelectedBrands([])
    setSelectedColors([])
    setSelectedSizes([])
    setSortBy('')
  }

  const hasActiveFilters =
    selectedSubcategories.length > 0 ||
    selectedBrands.length > 0 ||
    selectedColors.length > 0 ||
    selectedSizes.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 50000

  if (categoryLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Icon name="Loader2" size="lg" className="animate-spin text-gold-600" />
      </div>
    )
  }

  if (!category) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <EmptyState
          title="Category Not Found"
          message="The category you're looking for doesn't exist or has been removed."
          actionLabel="Browse Categories"
          actionLink="/categories"
        />
      </div>
    )
  }

  const filterSectionClass = 'border-t border-line pt-6'

  const FilterContent = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink">
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs font-medium text-gold-600 transition-colors hover:text-gold-700"
          >
            Clear All
          </button>
        )}
      </div>

      <div>
        <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
          Subcategory
        </h4>
        <div className="space-y-2.5">
          {sidebarSubcategories.map((sub) => (
            <Checkbox
              key={sub}
              label={sub}
              checked={selectedSubcategories.includes(sub) || selectedSub === sub}
              onChange={() => {
                if (selectedSub) {
                  setSearchParams({})
                } else {
                  toggleSubcategory(sub)
                }
              }}
            />
          ))}
        </div>
      </div>

      <div className={filterSectionClass}>
        <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
          Price Range
        </h4>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={priceRange[0]}
            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
            placeholder="Min"
            aria-label="Minimum price"
          />
          <span className="text-faint">—</span>
          <Input
            type="number"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
            placeholder="Max"
            aria-label="Maximum price"
          />
        </div>
      </div>

      {brands.length > 0 && (
        <div className={filterSectionClass}>
          <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
            Brand
          </h4>
          <div className="max-h-48 space-y-2.5 overflow-y-auto pr-1">
            {brands.map((brand) => (
              <Checkbox
                key={brand}
                label={brand}
                checked={selectedBrands.includes(brand)}
                onChange={() => toggleBrand(brand)}
              />
            ))}
          </div>
        </div>
      )}

      <div className={filterSectionClass}>
        <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
          Color
        </h4>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => {
            const isSelected = selectedColors.includes(color)
            const light = color === 'White' || color === 'Beige'
            return (
              <button
                key={color}
                onClick={() => toggleColor(color)}
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
                  isSelected
                    ? 'scale-110 border-gold-500 ring-2 ring-gold-500/30'
                    : 'border-line hover:border-gold-500'
                }`}
                style={{ backgroundColor: COLOR_MAP[color] || '#e5e7eb' }}
                title={color}
                aria-label={`Color ${color}`}
                aria-pressed={isSelected}
              >
                {isSelected && (
                  <Icon name="Check" size="xs" className={light ? 'text-charcoal-700' : 'text-white'} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className={filterSectionClass}>
        <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
          Size
        </h4>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`min-w-[44px] rounded-field border px-3 py-1.5 text-xs font-medium transition-all ${
                selectedSizes.includes(size)
                  ? 'border-gold-500 bg-gold-50 text-gold-800 ring-1 ring-gold-500/30'
                  : 'border-line text-sub hover:border-gold-500'
              }`}
              aria-pressed={selectedSizes.includes(size)}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const CategoryHero = () => (
    <div className="relative mb-10 overflow-hidden rounded-card">
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-charcoal-900/80 via-charcoal-900/50 to-transparent" />
      <img
        src={getAssetUrl(category.image)}
        alt={category.name}
        className="h-48 w-full object-cover sm:h-64"
      />
      <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 sm:px-12">
        <h1 className="heading-display mb-2 text-3xl text-white sm:text-4xl lg:text-5xl">
          {selectedSub || category.name}
        </h1>
        <p className="mb-3 max-w-xl text-sm text-white/80 sm:text-base">
          {category.description}
        </p>
        <span className="text-sm font-medium text-gold-300">
          {selectedSub ? filteredProducts.length : category.productCount} Products
        </span>
      </div>
    </div>
  )

  if (!selectedSub && normalizedSubcategories.length > 0) {
    return (
      <div className="container-lux py-8">
        <nav className="mb-6 flex items-center gap-2 text-sm text-sub" aria-label="Breadcrumb">
          <Link to="/" className="transition-colors hover:text-ink">Home</Link>
          <Icon name="ChevronRight" size="xs" />
          <span className="font-medium text-ink">{category.name}</span>
        </nav>

        <CategoryHero />

        <h2 className="mb-6 text-xl font-semibold text-ink">Shop by Category</h2>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
          {normalizedSubcategories.map((sub) => {
            const count = categoryProducts.filter((p) => p.subCategory === sub.name).length
            return (
              <button
                key={sub.name}
                onClick={() => setSearchParams({ sub: sub.name })}
                className="group rounded-card border border-line bg-surface p-6 text-left shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/50 hover:shadow-card-hover active:scale-[0.98]"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gold-100 text-gold-600 transition-colors group-hover:bg-gold-500 group-hover:text-white">
                  {isSvgMarkup(sub.icon) ? (
                    <SafeIcon icon={sub.icon} className="h-6 w-6" />
                  ) : sub.icon ? (
                    <img src={getAssetUrl(sub.icon)} alt={sub.name} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <h3 className="mb-1 text-base font-medium text-ink">{sub.name}</h3>
                <p className="text-sm text-sub">{count} {count === 1 ? 'Product' : 'Products'}</p>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="container-lux py-8">
      <div className="mb-6">
        <nav className="mb-4 flex items-center gap-2 text-sm text-sub" aria-label="Breadcrumb">
          <Link to="/" className="transition-colors hover:text-ink">Home</Link>
          <Icon name="ChevronRight" size="xs" />
          {selectedSub ? (
            <>
              <button onClick={() => setSearchParams({})} className="transition-colors hover:text-ink">
                {category.name}
              </button>
              <Icon name="ChevronRight" size="xs" />
              <span className="font-medium text-ink">{selectedSub}</span>
            </>
          ) : (
            <span className="font-medium text-ink">{category.name}</span>
          )}
        </nav>
      </div>

      <CategoryHero />

      <div className="flex gap-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-28 rounded-card border border-line bg-surface p-6 shadow-card">
            <FilterContent />
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex w-full items-center gap-3 sm:w-auto">
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
              <p className="whitespace-nowrap text-sm text-sub">
                <span className="font-medium text-ink">{filteredProducts.length}</span> products
              </p>
            </div>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort products"
              className="w-full sm:w-56"
            >
              <option value="">Sort by</option>
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6">
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <SkeletonLoader key={i} type="product" />
              ))}
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="flex min-h-[40vh] flex-col items-center justify-center">
              <EmptyState
                icon="PackageOpen"
                title="No Products Found"
                message="Try adjusting your filters or search criteria to find what you're looking for."
                actionLabel="Clear Filters"
                onAction={clearAllFilters}
              />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <div className="mt-12">
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  onPageChange={(p) => {
                    setCurrentPage(p)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                />
              </div>
            </>
          )}
        </main>
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
