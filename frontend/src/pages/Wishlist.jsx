import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { formatPrice } from '../utils/helpers'
import ImageWithFallback from '../components/ImageWithFallback'
import StarRating from '../components/StarRating'
import EmptyState from '../components/EmptyState'
import BackButton from '../components/BackButton'

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
      <div className="min-h-screen bg-[#0F0F10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex items-center gap-3 mb-8">
            <BackButton />
            <h1 className="font-playfair-display text-2xl sm:text-3xl font-bold text-white">
              My Wishlist
            </h1>
          </div>
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
    <div className="min-h-screen bg-[#0F0F10]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BackButton />
            <h1 className="font-playfair-display text-2xl sm:text-3xl font-bold text-white">
              My Wishlist ({wishlistItems.length})
            </h1>
          </div>
          <Link
            to="/products"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-[#B8B8C2] hover:text-white transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#232326] rounded-xl shadow-lg shadow-black/20 overflow-hidden group"
            >
              <Link
                to={`/product/${item.id}`}
                className="block aspect-square overflow-hidden bg-[#18181B] relative"
              >
                <ImageWithFallback
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <button
                  onClick={(e) => {
                    e.preventDefault()
                    handleRemove(item.id)
                  }}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#232326]/90 backdrop-blur-sm shadow-lg shadow-black/20 flex items-center justify-center hover:bg-[#232326] transition z-10 active:scale-[0.95]"
                  aria-label="Remove from wishlist"
                >
                  <svg className="w-4 h-4 text-[#EF4444]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </Link>

              <div className="p-3 sm:p-4">
                {item.brand && (
                  <p className="text-[10px] uppercase tracking-widest text-[#6B7280] font-medium">
                    {item.brand}
                  </p>
                )}
                <Link
                  to={`/product/${item.id}`}
                  className="block text-sm font-medium text-white hover:text-[#D4AF37] transition line-clamp-1 mt-0.5"
                >
                  {item.name}
                </Link>

                <div className="mt-1">
                  <StarRating rating={4.5} />
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <span className="text-base font-semibold text-white">
                    {formatPrice(item.price)}
                  </span>
                  {item.originalPrice && item.originalPrice > item.price && (
                    <span className="text-sm text-[#6B7280] line-through">
                      {formatPrice(item.originalPrice)}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="flex-1 py-2.5 bg-[#D4AF37] text-black text-xs font-medium rounded-full hover:bg-[#C9A84C] transition active:scale-[0.98] min-h-[44px]"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="py-2.5 px-3 text-xs font-medium text-[#B8B8C2] rounded-full border border-[#2D2D30] hover:bg-[#2A2A2E] hover:text-white transition active:scale-[0.98] min-h-[44px]"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#B8B8C2] hover:text-white transition active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
