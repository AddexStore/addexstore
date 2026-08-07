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

const ProductCard = memo(function ProductCard({ product, compact = false, editorial = false }) {
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

  if (editorial) {
    return (
      <Link
        to={`/product/${productId}`}
        className="group relative flex h-full min-h-[440px] flex-col justify-end overflow-hidden rounded-card bg-charcoal-900 shadow-card transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-card-hover active:scale-[0.99]"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="h-full w-full transition-transform duration-[1200ms] ease-out group-hover:scale-[1.07]">
            <ImageWithFallback src={productImage} alt={name || 'Product'} className="h-full w-full" />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/90 via-charcoal-900/25 to-charcoal-900/10" />

        <button
          onClick={handleWishlistToggle}
          className={`absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-200 active:scale-90 ${
            inWishlist
              ? 'border-gold-400 bg-gold-500 text-white shadow-gold-soft'
              : 'border-white/40 bg-white/10 text-white hover:bg-white/25'
          }`}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Icon name="Heart" size={15} strokeWidth={inWishlist ? 2 : 1.75} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>

        <div className="pointer-events-none absolute left-4 top-4 z-10 flex flex-col items-start gap-1.5">
          {discountPercent && discountPercent > 0 && (
            <Badge tone="danger" size="sm">-{discountPercent}%</Badge>
          )}
        </div>

        {outOfStock && (
          <div className="absolute inset-0 z-[5] flex items-center justify-center bg-charcoal-900/55 backdrop-blur-[1px]">
            <span className="rounded-full bg-surface px-4 py-1.5 text-xs font-medium text-ink shadow-sm">
              Out of Stock
            </span>
          </div>
        )}

        <div className="relative z-10 p-6 sm:p-7">
          {brand && (
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-300">{brand}</p>
          )}
          <h3 className="heading-display text-2xl leading-tight text-white line-clamp-2 sm:text-3xl">
            {name || 'Product Name'}
          </h3>
          <div className="mt-2.5 flex items-center gap-2">
            <span className="text-lg font-semibold tracking-tight text-white">{formatPrice(price)}</span>
            {originalPrice && originalPrice > price && (
              <span className="text-sm text-white/50 line-through">{formatPrice(originalPrice)}</span>
            )}
            {!compact && (
              <span className="ml-2">
                <StarRating rating={rating || 0} totalReviews={numReviews || 0} size="xs" />
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className={`mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-medium backdrop-blur-md transition-all duration-200 ${
              outOfStock
                ? 'cursor-not-allowed bg-white/10 text-white/40'
                : 'bg-white text-charcoal-800 hover:bg-gold-500 hover:text-white active:scale-[0.98]'
            }`}
          >
            <Icon name="ShoppingBag" size={15} />
            {outOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={`/product/${productId}`}
      className="group flex flex-col overflow-hidden rounded-card bg-surface shadow-card transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-card-hover active:scale-[0.99]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-subtle">
        <div className="h-full w-full transition-transform duration-[1100ms] ease-out lg:group-hover:scale-[1.07]">
          <ImageWithFallback src={productImage} alt={name || 'Product'} className="h-full w-full" />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/45 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <button
          onClick={handleWishlistToggle}
          className={`absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-200 active:scale-90 ${
            inWishlist
              ? 'border-gold-400 bg-gold-500 text-white shadow-gold-soft'
              : 'border-white/40 bg-white/80 text-charcoal-600 hover:bg-white'
          }`}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Icon name="Heart" size={15} strokeWidth={inWishlist ? 2 : 1.75} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>

        <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
          {discountPercent && discountPercent > 0 && (
            <Badge tone="danger" size="sm">-{discountPercent}%</Badge>
          )}
          {category && (
            <Badge tone="neutral" size="sm" className="bg-white/85 backdrop-blur-md">
              {typeof category === 'string' ? category : category?.name || ''}
            </Badge>
          )}
        </div>

        {outOfStock && (
          <div className="absolute inset-0 z-[5] flex items-center justify-center bg-charcoal-900/50 backdrop-blur-[1px]">
            <span className="rounded-full bg-surface px-4 py-1.5 text-xs font-medium text-ink shadow-sm">
              Out of Stock
            </span>
          </div>
        )}

        <div className="absolute inset-x-3 bottom-3 z-10 translate-y-3 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 lg:opacity-0">
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className={`flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-medium shadow-overlay backdrop-blur-md transition-all duration-200 ${
              outOfStock
                ? 'cursor-not-allowed bg-surface/80 text-faint'
                : 'bg-white/95 text-charcoal-800 hover:bg-gold-500 hover:text-white active:scale-[0.98]'
            }`}
          >
            <Icon name="ShoppingBag" size={15} />
            {outOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-2 px-4 pb-4 pt-3.5">
        <div>
          <div className="flex items-center justify-between gap-2">
            {brand && (
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-600">{brand}</p>
            )}
            {!compact && <StarRating rating={rating || 0} totalReviews={numReviews || 0} size="xs" />}
          </div>
          <h3 className={`mt-1 font-medium leading-snug text-ink line-clamp-2 ${compact ? 'text-sm' : 'text-[15px]'}`}>
            {name || 'Product Name'}
          </h3>
        </div>

        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-[17px] font-semibold tracking-tight text-ink">{formatPrice(price)}</span>
          {originalPrice && originalPrice > price && (
            <span className="text-xs text-faint line-through">{formatPrice(originalPrice)}</span>
          )}
        </div>
      </div>
    </Link>
  )
})

export default ProductCard
