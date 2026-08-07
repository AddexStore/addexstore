import { memo } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import ImageWithFallback from './ImageWithFallback'
import StarRating from './StarRating'
import Icon from './ui/Icon'
import Badge from './ui/Badge'
import { formatPrice } from '../utils/helpers'
import { getAssetUrl } from '../services/api'

const ProductCard = memo(function ProductCard({ product, compact = false }) {
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
  const productImage = getAssetUrl(images?.[0] || image) || '/assets/placeholders/product.svg'
  const inWishlist = isInWishlist(productId)
  const outOfStock = stock === 0
  const discountPercent = discount || (originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : null)

  const handleWishlistToggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (inWishlist) removeFromWishlist(productId)
    else addToWishlist(product)
  }

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!outOfStock) addToCart(product, 1)
  }

  return (
    <Link
      to={`/product/${productId}`}
      className="group flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-card-hover hover:border-gold-300 active:scale-[0.99]"
    >
      <div className="relative aspect-square overflow-hidden bg-subtle">
        <div className="h-full w-full transition-transform duration-700 ease-out lg:group-hover:scale-[1.06]">
          <ImageWithFallback src={productImage} alt={name || 'Product'} className="h-full w-full" />
        </div>

        <button
          onClick={handleWishlistToggle}
          className={`absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-sm transition-all duration-200 active:scale-90 ${
            inWishlist
              ? 'border-gold-400 bg-gold-500 text-white shadow-gold-soft'
              : 'border-white/40 bg-white/80 text-charcoal-600 hover:bg-white'
          }`}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Icon name="Heart" size={16} strokeWidth={inWishlist ? 2 : 1.75} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>

        <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
          {discountPercent && discountPercent > 0 && (
            <Badge tone="danger" size="sm">-{discountPercent}%</Badge>
          )}
          {category && (
            <Badge tone="neutral" size="sm" className="bg-white/80 backdrop-blur-sm">
              {typeof category === 'string' ? category : category?.name || ''}
            </Badge>
          )}
        </div>

        {outOfStock && (
          <div className="absolute inset-0 z-[5] flex items-center justify-center bg-ink/45 backdrop-blur-[1px]">
            <span className="rounded-full bg-surface px-4 py-1.5 text-xs font-medium text-ink shadow-sm">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between gap-2 p-4">
        <div>
          {brand && (
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-600">{brand}</p>
          )}
          <h3 className={`font-medium leading-snug text-ink line-clamp-2 ${compact ? 'text-sm' : 'text-[15px]'}`}>
            {name || 'Product Name'}
          </h3>
          <div className="mt-1.5">
            <StarRating rating={rating || 0} totalReviews={numReviews || 0} size="xs" />
          </div>
        </div>

        <div className="flex items-end justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-semibold text-ink">{formatPrice(price)}</span>
            {originalPrice && originalPrice > price && (
              <span className="text-xs text-faint line-through">{formatPrice(originalPrice)}</span>
            )}
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className={`mt-1 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full text-sm font-medium transition-all duration-200 ${
            outOfStock
              ? 'cursor-not-allowed bg-subtle text-faint'
              : 'bg-charcoal-800 text-ivory-50 hover:bg-gold-500 hover:text-white hover:shadow-gold-soft active:scale-[0.98]'
          }`}
        >
          <Icon name="ShoppingBag" size={15} />
          {outOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  )
})

export default ProductCard
