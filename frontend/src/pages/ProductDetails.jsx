import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { products } from '../data/products'
import { categories } from '../data/categories'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useToast } from '../context/ToastContext'
import { useRecentlyViewed } from '../hooks/useRecentlyViewed'
import { formatPrice, getDiscountPrice, formatDate } from '../utils/helpers'
import ImageWithFallback from '../components/ImageWithFallback'
import StarRating from '../components/StarRating'
import QuantitySelector from '../components/QuantitySelector'
import ProductCard from '../components/ProductCard'

const mockReviews = [
  { id: 1, user: 'James W.', rating: 5, date: '2025-12-15T10:00:00Z', text: 'Absolutely stunning piece. The craftsmanship is impeccable and it exceeded all my expectations.', verified: true },
  { id: 2, user: 'Sophia L.', rating: 4, date: '2025-12-10T14:30:00Z', text: 'Beautiful product with amazing quality. Shipping was fast and packaging was elegant.', verified: true },
  { id: 3, user: 'Oliver C.', rating: 5, date: '2025-11-28T09:15:00Z', text: 'Worth every penny. The attention to detail is remarkable. Will definitely purchase again.', verified: true },
  { id: 4, user: 'Isabella R.', rating: 4, date: '2025-11-20T16:45:00Z', text: 'Lovely addition to my collection. Slightly different shade than expected but still gorgeous.', verified: false },
]

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const toast = useToast()
  const { addRecentlyViewed } = useRecentlyViewed()

  const product = products.find((p) => p.id === Number(id) || p._id === id)
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

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-[var(--bg-card)] flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Product Not Found</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6">This product may have been removed or is no longer available.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 bg-[#C6A972] text-white text-sm font-medium rounded-full hover:bg-[#B8965F] transition active:scale-[0.98]"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const inWishlist = isInWishlist(product.id)
  const hasDiscount = product.discountPercentage > 0
  const discountedPrice = getDiscountPrice(product.price, product.discountPercentage)
  const productImages = [product.image, product.image, product.image, product.image]

  const handleColorSelect = (color) => {
    setSelectedColor(color)
  }

  const handleSizeSelect = (size) => {
    setSelectedSize(size)
  }

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize || product.sizes?.[0], selectedColor || product.colors?.[0])
  }

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedSize || product.sizes?.[0], selectedColor || product.colors?.[0])
    navigate('/checkout')
  }

  const handleToggleWishlist = () => {
    toggleWishlist(product)
  }

  const handleMouseMove = (e) => {
    if (!isZoomed) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x, y })
  }

  const relatedProducts = products.filter(
    (p) => p.subCategory === product.subCategory && p.id !== product.id
  ).slice(0, 4)

  const accordionSections = [
    { key: 'description', label: 'Description', content: product.description },
    {
      key: 'info',
      label: 'Additional Information',
      content: (
        <div className="space-y-2 text-sm text-[var(--text-secondary)]">
          <p><span className="font-medium text-[var(--text-primary)]">Brand:</span> {product.brand}</p>
          <p><span className="font-medium text-[var(--text-primary)]">Category:</span> {product.category}</p>
          <p><span className="font-medium text-[var(--text-primary)]">Subcategory:</span> {product.subCategory}</p>
          <p><span className="font-medium text-[var(--text-primary)]">SKU:</span> ADX-{String(product.id).padStart(4, '0')}</p>
          <p><span className="font-medium text-[var(--text-primary)]">Material:</span> Premium quality materials</p>
        </div>
      ),
    },
    {
      key: 'shipping',
      label: 'Shipping & Returns',
      content: (
        <div className="space-y-3 text-sm text-[var(--text-secondary)]">
          <p><span className="font-medium text-[var(--text-primary)]">Shipping:</span> Complimentary express shipping on all orders. Delivery within 2-5 business days internationally.</p>
          <p><span className="font-medium text-[var(--text-primary)]">Returns:</span> Free returns within 30 days of delivery. Items must be unused with original tags and packaging.</p>
          <p><span className="font-medium text-[var(--text-primary)]">Warranty:</span> All AddexStores products come with a 2-year international warranty against manufacturing defects.</p>
        </div>
      ),
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
      <nav className="hidden lg:flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-8">
        <Link to="/" className="hover:text-[var(--text-primary)] transition">Home</Link>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {category && (
          <>
            <Link to={`/category/${category.slug}`} className="hover:text-[var(--text-primary)] transition">
              {category.name}
            </Link>
            {product.subCategory && (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-[var(--text-secondary)]">{product.subCategory}</span>
              </>
            )}
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </>
        )}
        <span className="text-[var(--text-primary)] font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 mb-8 lg:mb-16">
        <div className="space-y-4">
          <div
            className="relative aspect-square rounded-2xl overflow-hidden bg-[var(--bg-secondary)] cursor-crosshair"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
          >
            <div
              className="w-full h-full transition-transform duration-200"
              style={{
                transform: isZoomed ? 'scale(2)' : 'scale(1)',
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
              }}
            >
              <ImageWithFallback
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {hasDiscount && (
              <span className="absolute top-4 left-4 px-3 py-1.5 bg-[#C53030] text-[var(--text-primary)] text-xs font-bold rounded-full z-10">
                -{product.discountPercentage}%
              </span>
            )}
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {productImages.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition ${
                  selectedImage === index ? 'border-[#C6A972]' : 'border-[var(--border-color)] hover:border-[#C6A972]'
                }`}
              >
                <ImageWithFallback src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div>
          {product.brand && (
            <p className="text-xs uppercase tracking-widest text-[#C6A972] font-semibold mb-2">
              {product.brand}
            </p>
          )}
          <h1 className="text-2xl sm:text-3xl font-playfair-display font-bold text-[var(--text-primary)] mb-3">
            {product.name}
          </h1>

          <div className="flex items-center gap-4 mb-4">
            <StarRating rating={product.rating} totalReviews={product.totalReviews} />
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl font-bold text-[var(--text-primary)]">
              {formatPrice(discountedPrice)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-lg text-[var(--text-secondary)] line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="px-2 py-0.5 bg-[#C53030]/10 text-[#C53030] text-xs font-semibold rounded-full">
                  Save {product.discountPercentage}%
                </span>
              </>
            )}
          </div>

          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-8">
            {product.description}
          </p>

          {product.colors?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-3">
                Color: <span className="text-[var(--text-secondary)] font-normal normal-case">{selectedColor || 'Select'}</span>
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {product.colors.map((color) => {
                  const colorMap = {
                    Black: '#000', White: '#fff', Navy: '#1e3a5f', Red: '#dc2626',
                    Gold: '#C6A972', Beige: '#f5f5dc', Brown: '#8b4513', Gray: '#6b7280',
                    Pink: '#e8a0b4', Blue: '#3b82f6', Green: '#22c55e', Purple: '#7c3aed',
                    Nude: '#e8c5a0', Silver: '#c0c0c0', Berry: '#8a2be2', Ivory: '#fffff0',
                    Tan: '#d2b48c', Olive: '#556b2f',
                  }
                  return (
                    <button
                      key={color}
                      onClick={() => handleColorSelect(color)}
                      className={`w-11 h-11 rounded-full border-2 flex-shrink-0 transition-all ${
                        selectedColor === color
                          ? 'border-[#C6A972] scale-110 ring-2 ring-[#C6A972]/30'
                          : 'border-[var(--border-color)] hover:border-[#C6A972]'
                      }`}
                      style={{ backgroundColor: colorMap[color] || '#e5e7eb' }}
                      title={color}
                    >
                      {selectedColor === color && (
                        <svg className="w-full h-full p-2.5" viewBox="0 0 24 24" fill={color === 'White' || color === 'Beige' || color === 'Nude' || color === 'Ivory' ? '#000' : '#fff'}>
                          <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {product.sizes?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-3">
                Size: <span className="text-[var(--text-secondary)] font-normal normal-case">{selectedSize || 'Select'}</span>
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSizeSelect(size)}
                    className={`min-w-[48px] px-4 py-2.5 text-sm font-medium rounded-lg border transition-all flex-shrink-0 ${
                      selectedSize === size
                        ? 'border-[#C6A972] bg-[#C6A972]/10 text-[#C6A972]'
                        : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[#C6A972] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-3">Quantity</h3>
            <QuantitySelector value={quantity} onChange={setQuantity} min={1} max={product.stock || 10} />
          </div>

          <div className="hidden lg:flex items-center gap-3 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 flex items-center justify-center gap-2 px-8 py-3.5 bg-[#C6A972] text-white text-sm font-semibold rounded-full hover:bg-[#B8965F] transition disabled:bg-[var(--border-color)] disabled:text-[var(--text-muted)] disabled:cursor-not-allowed active:scale-[0.98]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="flex-1 flex items-center justify-center gap-2 px-8 py-3.5 bg-[#C6A972] text-white text-sm font-semibold rounded-full hover:bg-[#B8965F] transition disabled:bg-[var(--border-color)] disabled:text-[var(--text-muted)] disabled:cursor-not-allowed active:scale-[0.98]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Buy Now
            </button>
            <button
              onClick={handleToggleWishlist}
              className="w-12 h-12 flex items-center justify-center rounded-full border border-[var(--border-color)] hover:border-[#C6A972] transition bg-[var(--bg-hover)] active:scale-[0.95]"
              aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <svg
                className="w-5 h-5 transition"
                fill={inWishlist ? '#C6A972' : 'none'}
                stroke={inWishlist ? '#C6A972' : '#666666'}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          {product.stock > 0 && (
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-6">
              <svg className="w-3.5 h-3.5 text-[#2F855A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{product.stock > 10 ? 'In Stock' : `Only ${product.stock} left in stock`}</span>
            </div>
          )}

          <div className="border-t border-[var(--border-color)] pt-6">
            <div className="space-y-4">
              {accordionSections.map((section) => (
                <div key={section.key} className="border border-[var(--border-color)] rounded-xl overflow-hidden">
                  <button
                    onClick={() => setActiveAccordion(activeAccordion === section.key ? null : section.key)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left bg-[var(--bg-hover)] transition min-h-[52px]"
                  >
                    <span className="text-sm font-medium text-[var(--text-primary)]">{section.label}</span>
                    <svg
                      className={`w-4 h-4 text-[var(--text-secondary)] transition-transform flex-shrink-0 ${activeAccordion === section.key ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div
                    className={`transition-all duration-300 ${
                      activeAccordion === section.key ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    } overflow-hidden`}
                  >
                    <div className="px-5 pb-4 text-sm text-[var(--text-secondary)] leading-relaxed">
                      {section.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-xl font-playfair-display font-bold text-[var(--text-primary)] mb-8">
          Customer Reviews
        </h2>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-[var(--bg-secondary)] rounded-2xl p-6 text-center">
              <div className="text-4xl font-bold text-[var(--text-primary)] mb-1">{product.rating}</div>
              <div className="flex justify-center mb-2">
                <StarRating rating={product.rating} />
              </div>
              <p className="text-sm text-[var(--text-secondary)]">{product.totalReviews} reviews</p>
            </div>
          </div>
          <div className="flex-1 space-y-5">
            {mockReviews.map((review) => (
              <div key={review.id} className="border-b border-[var(--border-color)] pb-5 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--bg-card)] flex items-center justify-center text-xs font-semibold text-[var(--text-secondary)]">
                      {review.user.charAt(0)}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-[var(--text-primary)]">{review.user}</span>
                      {review.verified && (
                        <span className="ml-2 px-1.5 py-0.5 bg-[#2F855A]/10 text-[#2F855A] text-[10px] font-medium rounded">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-[var(--text-secondary)]">{formatDate(review.date)}</span>
                </div>
                <StarRating rating={review.rating} />
                <p className="text-sm text-[var(--text-secondary)] mt-2">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-xl font-playfair-display font-bold text-[var(--text-primary)] mb-8">
            You May Also Like
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 lg:hidden scrollbar-hide">
            {relatedProducts.map((p) => (
              <div key={p.id} className="w-48 flex-shrink-0">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
          <div className="hidden lg:grid grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[var(--bg-secondary)] border-t border-[var(--border-color)] px-4 py-3 shadow-lg shadow-black/10">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-lg font-bold text-[var(--text-primary)]">{formatPrice(discountedPrice)}</span>
            {hasDiscount && (
              <span className="ml-2 text-sm text-[var(--text-secondary)] line-through">{formatPrice(product.price)}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#C6A972] text-white text-sm font-semibold rounded-full hover:bg-[#B8965F] transition disabled:bg-[var(--border-color)] disabled:text-[var(--text-muted)] disabled:cursor-not-allowed active:scale-[0.98] min-h-[44px]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            disabled={product.stock === 0}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#C6A972] text-white text-sm font-semibold rounded-full hover:bg-[#B8965F] transition disabled:bg-[var(--border-color)] disabled:text-[var(--text-muted)] disabled:cursor-not-allowed active:scale-[0.98] min-h-[44px]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Buy Now
          </button>
        </div>
      </div>
    </div>
  )
}
