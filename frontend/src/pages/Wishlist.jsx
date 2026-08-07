import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { formatPrice } from '../utils/helpers'
import { getAssetUrl } from '../services/api'
import ImageWithFallback from '../components/ImageWithFallback'
import EmptyState from '../components/EmptyState'
import Button from '../components/ui/Button'
import Icon from '../components/ui/Icon'

export default function Wishlist() {
  const { wishlistItems, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()
  const { showToast } = useToast()

  const handleAddToCart = (item) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.image,
      brand: item.brand,
      stock: 99,
    }, 1)
    showToast(`${item.name} added to cart`, 'success')
  }

  const handleRemove = (id) => {
    removeFromWishlist(id)
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-page">
        <div className="container-lux py-8 sm:py-12">
          <h1 className="heading-display mb-8 text-2xl sm:text-3xl">My Wishlist</h1>
          <EmptyState
            title="Your wishlist is empty"
            message="Save your favorite items here and come back to them later."
            actionLabel="Continue Shopping"
            actionLink="/products"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page">
      <div className="container-lux py-8 sm:py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow mb-2 text-gold-600">Saved For Later</p>
            <h1 className="heading-display text-2xl sm:text-3xl">
              My Wishlist ({wishlistItems.length})
            </h1>
          </div>
          <Button variant="ghost" icon="ArrowRight" iconPosition="right" to="/products" className="hidden sm:inline-flex">
            Continue Shopping
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="group overflow-hidden rounded-card border border-line bg-surface shadow-card transition-all duration-300 hover:shadow-card-hover"
            >
              <Link
                to={`/product/${item.id}`}
                className="relative block aspect-square overflow-hidden bg-inset"
              >
                <ImageWithFallback
                  src={getAssetUrl(item.image)}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <button
                  onClick={(e) => {
                    e.preventDefault()
                    handleRemove(item.id)
                  }}
                  className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 shadow-sm backdrop-blur-sm transition hover:bg-danger hover:text-white active:scale-95"
                  aria-label="Remove from wishlist"
                >
                  <Icon name="Heart" size="sm" className="text-danger" fill="currentColor" />
                </button>
              </Link>

              <div className="p-3 sm:p-4">
                {item.brand && (
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">
                    {item.brand}
                  </p>
                )}
                <Link
                  to={`/product/${item.id}`}
                  className="mt-0.5 line-clamp-1 block text-sm font-medium text-ink transition-colors hover:text-gold-600"
                >
                  {item.name}
                </Link>

                <div className="mt-2 flex items-center gap-2">
                  <span className="text-base font-semibold text-ink">
                    {formatPrice(item.price)}
                  </span>
                  {item.originalPrice && item.originalPrice > item.price && (
                    <span className="text-sm text-sub line-through">
                      {formatPrice(item.originalPrice)}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    icon="ShoppingBag"
                    onClick={() => handleAddToCart(item)}
                  >
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemove(item.id)}
                    aria-label={`Remove ${item.name}`}
                  >
                    <Icon name="Trash2" size="sm" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Button variant="ghost" icon="ArrowRight" iconPosition="right" to="/products">
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  )
}
