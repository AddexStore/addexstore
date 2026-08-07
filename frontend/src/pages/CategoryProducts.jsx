import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { SORT_OPTIONS, COLORS, SIZES } from '../constants'
import { formatPrice, getDiscountPrice } from '../utils/helpers'
import { productService } from '../services/productService'
import { categoryService } from '../services/categoryService'
import { mapProduct, mapCategory } from '../services/mappers'
import { getAssetUrl } from '../services/api'
import ProductCard from '../components/ProductCard'
import SkeletonLoader from '../components/SkeletonLoader'
import EmptyState from '../components/EmptyState'
import BackButton from '../components/BackButton'
import SafeIcon from '../components/SafeIcon'
import { isSvgMarkup } from '../utils/sanitizeSvg'

const ITEMS_PER_PAGE = 12

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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C6A972] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <EmptyState
          title="Category Not Found"
          message="The category you're looking for doesn't exist or has been removed."
          actionLabel="Browse Categories"
          actionLink="/categories"
        />
      </div>
    )
  }

  const FilterContent = () => (
    <div className="bg-[var(--bg-card)] rounded-2xl shadow-lg shadow-black/5 border border-[var(--border-color)] p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-[#C6A972] hover:text-[#B8965F] font-medium transition"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-3">Subcategory</h4>
          <div className="space-y-2">
            {sidebarSubcategories.map((sub) => (
              <label key={sub} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedSubcategories.includes(sub) || selectedSub === sub}
                  onChange={() => {
                    if (selectedSub) {
                      setSearchParams({})
                    } else {
                      toggleSubcategory(sub)
                    }
                  }}
                  className="w-4 h-4 rounded border-[var(--border-color)] text-[#C6A972] focus:ring-[#C6A972] bg-[var(--bg-secondary)]"
                />
                <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition">{sub}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="border-t border-[var(--border-color)] pt-6">
          <h4 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-3">Price Range</h4>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
              className="w-full px-3 py-2 text-sm border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C6A972] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)]"
              placeholder="Min"
            />
            <span className="text-[var(--text-secondary)]">—</span>
            <input
              type="number"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="w-full px-3 py-2 text-sm border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C6A972] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)]"
              placeholder="Max"
            />
          </div>
        </div>

        <div className="border-t border-[var(--border-color)] pt-6">
          <h4 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-3">Brand</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {brands.map((brand) => (
              <label key={brand} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="w-4 h-4 rounded border-[var(--border-color)] text-[#C6A972] focus:ring-[#C6A972] bg-[var(--bg-secondary)]"
                />
                <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition">{brand}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="border-t border-[var(--border-color)] pt-6">
          <h4 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-3">Color</h4>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((color) => {
              const isSelected = selectedColors.includes(color)
              const colorMap = {
                Black: '#000', White: '#fff', Navy: '#1e3a5f', Red: '#dc2626',
                Gold: '#C6A972', Beige: '#f5f5dc', Brown: '#8b4513', Gray: '#6b7280',
                Pink: '#e8a0b4', Blue: '#3b82f6', Green: '#22c55e', Purple: '#7c3aed',
              }
              return (
                <button
                  key={color}
                  onClick={() => toggleColor(color)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    isSelected ? 'border-[#C6A972] scale-110' : 'border-[var(--border-color)] hover:border-[#C6A972]'
                  }`}
                  style={{ backgroundColor: colorMap[color] || '#e5e7eb' }}
                  title={color}
                >
                  {isSelected && (
                    <svg className="w-full h-full p-1.5" viewBox="0 0 24 24" fill={color === 'White' || color === 'Beige' ? '#000' : '#fff'}>
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="border-t border-[var(--border-color)] pt-6">
          <h4 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-3">Size</h4>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((size) => (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  selectedSizes.includes(size)
                    ? 'border-[#C6A972] bg-[#C6A972]/10 text-[#C6A972]'
                    : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[#C6A972]'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  if (!selectedSub && normalizedSubcategories.length > 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <nav className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-4">
            <Link to="/" className="hover:text-[var(--text-primary)] transition">Home</Link>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-[var(--text-primary)] font-medium">{category.name}</span>
          </nav>
        </div>

        <div className="relative rounded-2xl overflow-hidden mb-10">
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent z-10" />
          <img
            src={getAssetUrl(category.image)}
            alt={category.name}
            className="w-full h-48 sm:h-64 object-cover"
          />
          <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 sm:px-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-playfair-display text-[var(--text-primary)] font-bold mb-2">
              {category.name}
            </h1>
            <p className="text-[var(--text-primary)]/80 text-sm sm:text-base max-w-xl mb-3">
              {category.description}
            </p>
            <span className="text-[#C6A972] text-sm font-medium">
              {category.productCount} Products
            </span>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">Shop by Category</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {normalizedSubcategories.map((sub) => {
            const count = categoryProducts.filter((p) => p.subCategory === sub.name).length
            return (
              <button
                key={sub.name}
                onClick={() => setSearchParams({ sub: sub.name })}
                className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-color)] hover:border-[#C6A972]/50 hover:-translate-y-1 transition-all duration-300 text-left group"
              >
                <div className="w-12 h-12 rounded-full bg-[#C6A972]/10 flex items-center justify-center mb-4 group-hover:bg-[#C6A972]/20 transition-colors overflow-hidden">
                  {isSvgMarkup(sub.icon) ? (
                    <SafeIcon icon={sub.icon} className="w-6 h-6 text-[#C6A972]" />
                  ) : sub.icon ? (
                    <img src={getAssetUrl(sub.icon)} alt={sub.name} className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <h3 className="text-[var(--text-primary)] font-medium text-base mb-1">{sub.name}</h3>
                <p className="text-[var(--text-secondary)] text-sm">{count} {count === 1 ? 'Product' : 'Products'}</p>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <BackButton />
        <nav className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-4">
          <Link to="/" className="hover:text-[var(--text-primary)] transition">Home</Link>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {selectedSub ? (
            <>
              <button
                onClick={() => setSearchParams({})}
                className="hover:text-[var(--text-primary)] transition"
              >
                {category.name}
              </button>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-[var(--text-primary)] font-medium">{selectedSub}</span>
            </>
          ) : (
            <span className="text-[var(--text-primary)] font-medium">{category.name}</span>
          )}
        </nav>
        {selectedSub && normalizedSubcategories.length > 0 && (
          <button
            onClick={() => setSearchParams({})}
            className="inline-flex items-center gap-2 text-sm text-[#C6A972] hover:text-[#B8965F] transition font-medium mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {category.name}
          </button>
        )}
      </div>

      <div className="relative rounded-2xl overflow-hidden mb-10">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent z-10" />
        <img
          src={getAssetUrl(category.image)}
          alt={category.name}
          className="w-full h-48 sm:h-64 object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 sm:px-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-playfair-display text-[var(--text-primary)] font-bold mb-2">
            {selectedSub || category.name}
          </h1>
          <p className="text-[var(--text-primary)]/80 text-sm sm:text-base max-w-xl mb-3">
            {category.description}
          </p>
          <span className="text-[#C6A972] text-sm font-medium">
            {filteredProducts.length} Products
          </span>
        </div>
      </div>

      <div className="flex gap-8">
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <FilterContent />
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3 w-full sm:w-auto">
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
              <p className="text-sm text-[var(--text-secondary)] whitespace-nowrap">
                <span className="font-medium text-[var(--text-primary)]">{filteredProducts.length}</span> products
              </p>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 border border-[var(--border-color)] rounded-full text-sm text-[var(--text-secondary)] bg-[var(--bg-card)] focus:outline-none focus:ring-1 focus:ring-[#C6A972] cursor-pointer min-h-[44px]"
            >
              <option value="">Sort by</option>
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <SkeletonLoader type="product" count={ITEMS_PER_PAGE} />
          ) : paginatedProducts.length === 0 ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center">
              <EmptyState
                icon={
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                }
                title="No Products Found"
                message="Try adjusting your filters or search criteria to find what you're looking for."
                actionLabel="Clear Filters"
                actionLink={undefined}
              />
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 bg-[#C6A972] text-white text-sm font-medium rounded-full hover:bg-[#B8965F] transition active:scale-[0.98]"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="min-w-[44px] h-11 flex items-center justify-center rounded-full border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition active:scale-[0.98] px-3"
                  >
                    <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="hidden sm:inline text-sm">Previous</span>
                  </button>

                  <div className="hidden sm:flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-11 h-11 rounded-full text-sm font-medium transition active:scale-[0.98] ${
                          currentPage === page
                            ? 'bg-[#C6A972] text-white'
                            : 'border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <span className="sm:hidden text-sm text-[var(--text-secondary)]">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="min-w-[44px] h-11 flex items-center justify-center rounded-full border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition active:scale-[0.98] px-3"
                  >
                    <span className="hidden sm:inline text-sm">Next</span>
                    <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </main>
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
