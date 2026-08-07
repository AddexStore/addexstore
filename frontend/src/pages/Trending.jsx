import { useState, useEffect } from 'react'
import { productService } from '../services/productService'
import { mapProduct } from '../services/mappers'
import ProductCard from '../components/ProductCard'
import SkeletonLoader from '../components/SkeletonLoader'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { Select } from '../components/ui/Input'
import Pagination from '../components/ui/Pagination'

const ITEMS_PER_PAGE = 12

const SORT_OPTIONS = [
  { value: 'createdAt,desc', label: 'Newest' },
  { value: 'price,asc', label: 'Price: Low to High' },
  { value: 'price,desc', label: 'Price: High to Low' },
  { value: 'rating,desc', label: 'Top Rated' },
]

export default function Trending() {
  const [products, setProducts] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [loading, setLoading] = useState(true)
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
    setCurrentPage(page - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-page">
      <div className="container-lux py-8 sm:py-12">
        <PageHeader
          eyebrow="Most Loved"
          title="Trending Now"
          description={`Most popular picks loved by our community — ${totalElements} pieces.`}
          actions={
            <Select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(0) }}
              aria-label="Sort products"
              className="w-full sm:w-56"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Select>
          }
        />

        {loading && products.length === 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonLoader key={i} type="product" />
            ))}
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
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
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
  )
}
