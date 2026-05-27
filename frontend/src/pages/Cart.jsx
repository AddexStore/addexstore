import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/helpers'
import ImageWithFallback from '../components/ImageWithFallback'
import QuantitySelector from '../components/QuantitySelector'
import EmptyState from '../components/EmptyState'
import BackButton from '../components/BackButton'

const SHIPPING_THRESHOLD = 100

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart()
  const navigate = useNavigate()

  const subtotal = getCartTotal()
  const shipping = subtotal >= SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 15
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const handleCheckout = () => {
    navigate('/checkout')
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#0F0F10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex items-center gap-3 mb-8">
            <BackButton />
            <h1 className="font-playfair-display text-2xl sm:text-3xl font-bold text-white">
              Shopping Cart
            </h1>
          </div>
          <EmptyState
            title="Your cart is empty"
            message="Looks like you haven't added anything yet. Browse our collection and find something you love."
            actionLabel="Continue Shopping"
            actionLink="/products"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F0F10] pb-28 lg:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex items-center gap-3 mb-8">
          <BackButton />
          <h1 className="font-playfair-display text-2xl sm:text-3xl font-bold text-white">
            Shopping Cart ({cartItems.length})
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-4">
            {cartItems.map((item) => {
              const itemSubtotal = item.price * item.quantity
              return (
                <div
                  key={item._cartKey || `${item.id}-${item.size}-${item.color}`}
                  className="bg-[#232326] rounded-xl shadow-lg shadow-black/20 p-4 flex gap-4"
                >
                  <Link
                    to={`/product/${item.id}`}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-[#18181B] flex-shrink-0"
                  >
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        {item.brand && (
                          <p className="text-[10px] uppercase tracking-widest text-[#6B7280] font-medium">
                            {item.brand}
                          </p>
                        )}
                        <Link
                          to={`/product/${item.id}`}
                          className="text-sm font-medium text-white hover:text-[#D4AF37] transition line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {item.size && (
                            <span className="text-xs text-[#B8B8C2]">Size: {item.size}</span>
                          )}
                          {item.color && item.color !== 'Default' && (
                            <span className="text-xs text-[#B8B8C2]">Color: {item.color}</span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          removeFromCart(item.id, item.size, item.color)
                        }
                        className="w-9 h-9 rounded-full flex items-center justify-center text-[#6B7280] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition flex-shrink-0 active:scale-[0.95]"
                        aria-label="Remove item"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3 sm:mt-4">
                      <QuantitySelector
                        value={item.quantity}
                        onChange={(qty) =>
                          updateQuantity(item.id, qty, item.size, item.color)
                        }
                        min={1}
                        max={item.stock || 99}
                      />
                      <span className="text-sm font-semibold text-white whitespace-nowrap ml-3">
                        {formatPrice(itemSubtotal)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="hidden lg:block w-80">
            <div className="bg-[#232326] rounded-xl shadow-lg shadow-black/20 p-6 sticky top-24">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Order Summary
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-[#B8B8C2]">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#B8B8C2]">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-[#22C55E] font-medium">Free</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                {subtotal > 0 && subtotal < SHIPPING_THRESHOLD && (
                  <p className="text-[11px] text-[#6B7280]">
                    Add {formatPrice(SHIPPING_THRESHOLD - subtotal)} more for free shipping
                  </p>
                )}
                <div className="flex justify-between text-[#B8B8C2]">
                  <span>Tax (8%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="border-t border-[#2D2D30] pt-3 flex justify-between font-semibold text-white">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="mt-6 w-full py-3 bg-[#D4AF37] text-black text-sm font-medium rounded-full hover:bg-[#C9A84C] transition active:scale-[0.98] shadow-lg shadow-black/20"
              >
                Proceed to Checkout
              </button>

              <Link
                to="/products"
                className="mt-3 w-full inline-flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-[#B8B8C2] rounded-full border border-[#2D2D30] hover:bg-[#2A2A2E] hover:text-white transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[#18181B] border-t border-[#2D2D30] px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[#B8B8C2]">Total</span>
          <span className="text-lg font-bold text-white">{formatPrice(total)}</span>
        </div>
        <div className="flex gap-3">
          <Link
            to="/products"
            className="flex-1 py-3 text-sm font-medium text-[#B8B8C2] rounded-full border border-[#2D2D30] hover:bg-[#2A2A2E] hover:text-white transition text-center active:scale-[0.98]"
          >
            Continue Shopping
          </Link>
          <button
            onClick={handleCheckout}
            className="flex-1 py-3 bg-[#D4AF37] text-black text-sm font-semibold rounded-full hover:bg-[#C9A84C] transition active:scale-[0.98] min-h-[48px]"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  )
}
