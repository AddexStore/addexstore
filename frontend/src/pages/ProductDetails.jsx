import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useToast } from '../context/ToastContext'
import { useRecentlyViewed } from '../hooks/useRecentlyViewed'
import { productService } from '../services/productService'
import { categoryService } from '../services/categoryService'
import { reviewService } from '../services/reviewService'
import { mapProduct, mapCategory } from '../services/mappers'
import { formatPrice, formatDate } from '../utils/helpers'
import { getAssetUrl } from '../services/api'
import ImageWithFallback from '../components/ImageWithFallback'
import StarRating from '../components/StarRating'
import QuantitySelector from '../components/QuantitySelector'
import ProductCard from '../components/ProductCard'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Icon from '../components/ui/Icon'
import EmptyState from '../components/EmptyState'

const COLOR_MAP = {
  Black: '#000', White: '#fff', Navy: '#1e3a5f', Red: '#dc2626',
  Gold: '#C2A366', Beige: '#f5f5dc', Brown: '#8b4513', Gray: '#6b7280',
  Pink: '#e8a0b4', Blue: '#3b82f6', Green: '#22c55e', Purple: '#7c3aed',
  Nude: '#e8c5a0', Silver: '#c0c0c0', Berry: '#8a2be2', Ivory: '#fffff0',
  Tan: '#d2b48c', Olive: '#556b2f',
}

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const toast = useToast()
  const { addRecentlyViewed } = useRecentlyViewed()

  const [product, setProduct] = useState(null)
  const [categories, setCategories] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    const numId = Number(id)
    Promise.all([
      productService.getProduct(numId).then((r) => mapProduct(r.data)).catch(() => null),
      reviewService.getReviews(numId, 0, 20).then((r) => (r.data?.content || r.content || []).map((rv) => ({
        id: rv.id,
        user: rv.userName || 'Customer',
        avatar: rv.userAvatar || '',
        rating: rv.rating,
        date: rv.createdAt,
        text: rv.comment,
        verified: true,
      }))).catch(() => []),
      productService.getProducts({ page: 0, size: 50 }).then((r) => (r.content || r.data?.content || r.data || []).map(mapProduct)).catch(() => []),
      categoryService.getAll().then((r) => (r.data || []).map(mapCategory)).catch(() => []),
    ]).then(([p, rv, prods, cats]) => {
      setProduct(p)
      setReviews(rv)
      setAllProducts(prods)
      setCategories(cats)
      setNotFound(!p)
    }).finally(() => setLoading(false))
  }, [id])

  const category = categories.find((c) => c.name === product?.category)

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [activeAccordion, setActiveAccordion] = useState(null)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
  const [isZoomed, setIsZoomed] = useState(false)

  useEffect(() => {
    if (product) {
      addRecentlyViewed(product)
      setSelectedColor('')
      setSelectedSize('')
      setQuantity(1)
      setSelectedImage(0)
      setActiveAccordion(null)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id, product, addRecentlyViewed])

  if (loading) return null

  if (!product || notFound) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-surface">
            <Icon name="SearchX" size="xl" className="text-sub" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-ink">Product Not Found</h2>
          <p className="mb-6 text-sm text-sub">
            This product may have been removed or is no longer available.
          </p>
          <Button variant="primary" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const inWishlist = isInWishlist(product.id)
  const hasDiscount = product.discountPercentage > 0
  const hasCompareAt = product.originalPrice && Number(product.originalPrice) > Number(product.price)
  const fallbackImage = '/assets/placeholders/product.svg'
  const gallery = product.gallery && product.gallery.length ? product.gallery : [fallbackImage]

  const handleColorSelect = (color) => setSelectedColor(color)
  const handleSizeSelect = (size) => setSelectedSize(size)

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize || product.sizes?.[0], selectedColor || product.colors?.[0])
  }

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedSize || product.sizes?.[0], selectedColor || product.colors?.[0])
    navigate('/checkout')
  }

  const handleToggleWishlist = () => toggleWishlist(product)

  const handleMouseMove = (e) => {
    if (!isZoomed) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x, y })
  }

  const relatedProducts = allProducts.filter(
    (p) => p.subCategory === product.subCategory && p.id !== product.id
  ).slice(0, 4)

  const accordionSections = [
    { key: 'description', label: 'Description', content: product.description },
    {
      key: 'info',
      label: 'Additional Information',
      content: (
        <dl className="space-y-2 text-sm text-sub">
          <p><span className="font-medium text-ink">Brand:</span> {product.brand}</p>
          <p><span className="font-medium text-ink">Category:</span> {product.category}</p>
          <p><span className="font-medium text-ink">Subcategory:</span> {product.subCategory}</p>
          <p><span className="font-medium text-ink">SKU:</span> {product.sku || '—'}</p>
        </dl>
      ),
    },
    {
      key: 'shipping',
      label: 'Shipping & Returns',
      content: (
        <div className="space-y-3 text-sm text-sub">
          <p><span className="font-medium text-ink">Shipping:</span> Complimentary express shipping on all orders. Delivery within 2-5 business days internationally.</p>
          <p><span className="font-medium text-ink">Returns:</span> Free returns within 30 days of delivery. Items must be unused with original tags and packaging.</p>
          <p><span className="font-medium text-ink">Warranty:</span> All AddexStores products come with a 2-year international warranty against manufacturing defects.</p>
        </div>
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 lg:pb-8">
      <nav className="mb-8 hidden items-center gap-2 text-sm text-sub lg:flex" aria-label="Breadcrumb">
        <Link to="/" className="transition-colors hover:text-ink">Home</Link>
        <Icon name="ChevronRight" size="xs" />
        {category && (
          <>
            <Link to={`/category/${category.slug}`} className="transition-colors hover:text-ink">
              {category.name}
            </Link>
            {product.subCategory && (
              <>
                <Icon name="ChevronRight" size="xs" />
                <span>{product.subCategory}</span>
              </>
            )}
            <Icon name="ChevronRight" size="xs" />
          </>
        )}
        <span className="truncate font-medium text-ink">{product.name}</span>
      </nav>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:mb-16 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-4">
          <div
            className="relative aspect-square cursor-crosshair overflow-hidden rounded-card bg-inset"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
          >
            <div
              className="h-full w-full transition-transform duration-200"
              style={{
                transform: isZoomed ? 'scale(2)' : 'scale(1)',
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
              }}
            >
              <ImageWithFallback
                src={getAssetUrl(gallery[selectedImage])}
                alt={product.name}
                className="h-full w-full"
                eager
              />
            </div>
            {hasDiscount && (
              <Badge
                tone="danger"
                size="md"
                className="absolute left-4 top-4 z-10"
              >
                -{product.discountPercentage}%
              </Badge>
            )}
          </div>

          {gallery.length > 1 && (
            <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-2">
              {gallery.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-field border-2 transition sm:h-20 sm:w-20 ${
                    selectedImage === index
                      ? 'border-gold-500 ring-2 ring-gold-500/25'
                      : 'border-line hover:border-gold-500/60'
                  }`}
                  aria-label={`View image ${index + 1}`}
                  aria-current={selectedImage === index}
                >
                  <ImageWithFallback src={getAssetUrl(img)} alt={`${product.name} ${index + 1}`} className="h-full w-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.brand && (
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
              {product.brand}
            </p>
          )}
          <h1 className="heading-display mb-3 text-2xl sm:text-3xl">
            {product.name}
          </h1>

          <div className="mb-4">
            <StarRating rating={product.rating} totalReviews={product.totalReviews} />
          </div>

          <div className="mb-6 flex items-center gap-3">
            <span className="text-2xl font-bold text-ink">
              {formatPrice(product.price)}
            </span>
            {hasCompareAt && (
              <span className="text-lg text-sub line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            {hasDiscount && (
              <Badge tone="danger">Save {product.discountPercentage}%</Badge>
            )}
          </div>

          <p className="mb-8 text-sm leading-relaxed text-sub">
            {product.description}
          </p>

          {product.colors?.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink">
                Color: <span className="font-normal normal-case text-sub">{selectedColor || 'Select'}</span>
              </h3>
              <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-2">
                {product.colors.map((color) => {
                  const light = color === 'White' || color === 'Beige' || color === 'Nude' || color === 'Ivory'
                  return (
                    <button
                      key={color}
                      onClick={() => handleColorSelect(color)}
                      className={`h-11 w-11 shrink-0 rounded-full border-2 transition-all ${
                        selectedColor === color
                          ? 'scale-110 border-gold-500 ring-2 ring-gold-500/30'
                          : 'border-line hover:border-gold-500'
                      }`}
                      style={{ backgroundColor: COLOR_MAP[color] || '#e5e7eb' }}
                      title={color}
                      aria-label={`Color ${color}`}
                      aria-pressed={selectedColor === color}
                    >
                      {selectedColor === color && (
                        <span className="flex h-full w-full items-center justify-center">
                          <Icon name="Check" size="sm" className={light ? 'text-charcoal-700' : 'text-white'} />
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {product.sizes?.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink">
                Size: <span className="font-normal normal-case text-sub">{selectedSize || 'Select'}</span>
              </h3>
              <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSizeSelect(size)}
                    className={`min-w-[52px] shrink-0 rounded-field border px-4 py-2.5 text-sm font-medium transition-all ${
                      selectedSize === size
                        ? 'border-gold-500 bg-gold-50 text-gold-800 ring-1 ring-gold-500/30'
                        : 'border-line text-sub hover:border-gold-500 hover:text-ink'
                    }`}
                    aria-pressed={selectedSize === size}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink">Quantity</h3>
            <QuantitySelector value={quantity} onChange={setQuantity} min={1} max={product.stock || 10} size="lg" />
          </div>

          <div className="mb-8 hidden items-center gap-3 lg:flex">
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              icon="ShoppingBag"
              disabled={product.stock === 0}
              onClick={handleAddToCart}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              icon="Zap"
              disabled={product.stock === 0}
              onClick={handleBuyNow}
            >
              Buy Now
            </Button>
            <Button
              variant="outline"
              size="iconLg"
              rounded="full"
              aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              onClick={handleToggleWishlist}
              className={inWishlist ? 'border-gold-500 text-gold-600' : ''}
            >
              <Icon
                name="Heart"
                className={inWishlist ? 'text-gold-500' : ''}
                fill={inWishlist ? 'currentColor' : 'none'}
              />
            </Button>
          </div>

          {product.stock > 0 && (
            <div className="mb-6 flex items-center gap-2 text-xs text-sub">
              <Icon name="CheckCircle2" size="sm" className="text-success" />
              <span>{product.stock > 10 ? 'In Stock' : `Only ${product.stock} left in stock`}</span>
            </div>
          )}

          <div className="border-t border-line pt-6">
            <div className="space-y-3">
              {accordionSections.map((section) => (
                <div key={section.key} className="overflow-hidden rounded-field border border-line">
                  <button
                    onClick={() => setActiveAccordion(activeAccordion === section.key ? null : section.key)}
                    className="flex min-h-[52px] w-full items-center justify-between bg-subtle px-5 py-4 text-left transition-colors hover:bg-line/50"
                    aria-expanded={activeAccordion === section.key}
                  >
                    <span className="text-sm font-medium text-ink">{section.label}</span>
                    <Icon
                      name="ChevronDown"
                      size="sm"
                      className={`shrink-0 text-sub transition-transform duration-300 ${activeAccordion === section.key ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <div
                    className={`transition-all duration-300 ${
                      activeAccordion === section.key ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    } overflow-hidden`}
                  >
                    <div className="px-5 pb-4 text-sm leading-relaxed text-sub">
                      {section.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="mb-16">
        <h2 className="heading-display mb-8 text-xl font-bold">
          Customer Reviews
        </h2>
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="shrink-0 lg:w-64">
            <div className="rounded-card border border-line bg-surface p-6 text-center shadow-card">
              <div className="mb-1 text-4xl font-bold text-ink">{product.rating}</div>
              <div className="mb-2 flex justify-center">
                <StarRating rating={product.rating} />
              </div>
              <p className="text-sm text-sub">{product.totalReviews} reviews</p>
            </div>
          </div>
          <div className="flex-1 space-y-5">
            {reviews.length === 0 ? (
              <EmptyState
                title="No reviews yet"
                message="Be the first to review this product."
                compact
              />
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="border-b border-line pb-5 last:border-0">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-subtle text-xs font-semibold text-sub">
                        {review.avatar ? (
                          <img src={getAssetUrl(review.avatar)} alt="" className="h-full w-full object-cover" />
                        ) : (
                          review.user.charAt(0)
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-ink">{review.user}</span>
                        {review.verified && (
                          <Badge tone="success" size="sm">
                            <Icon name="BadgeCheck" size="xs" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-faint">{formatDate(review.date)}</span>
                  </div>
                  <StarRating rating={review.rating} />
                  <p className="mt-2 text-sm text-sub">{review.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section>
          <h2 className="heading-display mb-8 text-xl font-bold">
            You May Also Like
          </h2>
          <div className="hide-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-4 lg:mx-0 lg:grid lg:grid-cols-4 lg:px-0 lg:pb-0 lg:gap-6">
            {relatedProducts.map((p) => (
              <div key={p.id} className="w-48 shrink-0 lg:w-auto">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-line bg-surface px-4 py-3 shadow-card lg:hidden">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-ink">{formatPrice(product.price)}</span>
            {hasCompareAt && (
              <span className="ml-2 text-sm text-sub line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            fullWidth
            icon="ShoppingBag"
            disabled={product.stock === 0}
            onClick={handleAddToCart}
          >
            Add to Cart
          </Button>
          <Button
            variant="primary"
            fullWidth
            icon="Zap"
            disabled={product.stock === 0}
            onClick={handleBuyNow}
          >
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  )
}
