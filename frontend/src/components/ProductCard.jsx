import { memo } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import ImageWithFallback from './ImageWithFallback'
import StarRating from './StarRating'
import { formatPrice } from '../utils/helpers'

const ProductCard = memo(function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { toggleWishlist: addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()

  if (!product) return null

  const {
    _id,
    id,
    name,
    brand,
    category,
    images,
    image,
    price,
    originalPrice,
    discount,
    rating,
    numReviews,
    stock,
  } = product

  const productId = _id || id
  const productImage = images?.[0] || image || '/assets/placeholders/product.svg'
  const inWishlist = isInWishlist(productId)
  const outOfStock = stock === 0
  const discountPercent = discount || (originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : null)

  const handleWishlistToggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (inWishlist) {
      removeFromWishlist(productId)
    } else {
      addToWishlist(product)
    }
  }

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!outOfStock) {
      addToCart(product, 1)
    }
  }

  return (
    <Link
      to={`/product/${productId}`}
      className="group flex flex-col bg-[var(--bg-card)] rounded-xl shadow-lg shadow-black/5 active:scale-[0.98] transition-all duration-300 overflow-hidden"
    >
        <div className="relative aspect-square overflow-hidden bg-[var(--bg-secondary)]">
        <div className="w-full h-full transition-transform duration-500 lg:group-hover:scale-105">
          <ImageWithFallback
            src={productImage}
            alt={name || 'Product'}
            className="w-full h-full object-cover"
          />
        </div>

        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 w-11 h-11 rounded-full bg-[var(--bg-card)]/90 backdrop-blur-sm shadow-sm flex items-center justify-center active:scale-[0.98] transition z-10"
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg
            className="w-[18px] h-[18px] transition"
            fill={inWishlist ? '#C6A972' : 'none'}
            stroke={inWishlist ? '#C6A972' : '#666666'}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {category && (
          <span className="absolute top-3 left-3 px-2 py-0.5 bg-[var(--bg-card)]/90 backdrop-blur-sm rounded-full text-[9px] font-medium text-[var(--text-secondary)] uppercase tracking-wider shadow-sm">
            {typeof category === 'string' ? category : category?.name || ''}
          </span>
        )}

        {discountPercent && discountPercent > 0 && (
          <span className="absolute bottom-3 left-3 px-2 py-0.5 bg-[#C53030] text-[var(--text-primary)] text-[9px] font-bold rounded-full">
            -{discountPercent}%
          </span>
        )}

        {outOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-[var(--bg-card)] px-4 py-1.5 rounded-full text-xs font-medium text-[var(--text-primary)]">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 justify-between p-3 sm:p-4">
        <div>
          {brand && (
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] mb-1 font-medium">{brand}</p>
          )}
          <h3 className="text-[13px] font-medium text-[var(--text-primary)] line-clamp-2 leading-snug">
            {name || 'Product Name'}
          </h3>

          <div className="mt-1.5">
            <StarRating rating={rating || 0} totalReviews={numReviews || 0} />
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span className="text-[15px] font-semibold text-[var(--text-primary)]">
              {formatPrice(price)}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-xs text-[var(--text-secondary)] line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className={`mt-3 w-full min-h-[44px] rounded-xl text-sm font-medium transition ${
            outOfStock
              ? 'bg-[var(--bg-secondary)] text-[#666] cursor-not-allowed'
              : 'bg-[#b5b5b5] text-white active:scale-[0.98]'
          }`}
        >
          {outOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  )
})

export default ProductCard
