import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/helpers'
import { getAssetUrl } from '../services/api'
import ImageWithFallback from '../components/ImageWithFallback'
import QuantitySelector from '../components/QuantitySelector'
import EmptyState from '../components/EmptyState'
import Button from '../components/ui/Button'
import Icon from '../components/ui/Icon'

const SHIPPING_THRESHOLD = 100

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart()

  const subtotal = getCartTotal()
  const shipping = subtotal >= SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 15
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax
  const freeShippingRemaining = SHIPPING_THRESHOLD - subtotal
  const progress = Math.min(100, (subtotal / SHIPPING_THRESHOLD) * 100)

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-page">
        <div className="container-lux py-8 sm:py-12">
          <h1 className="heading-display mb-8 text-2xl sm:text-3xl">Shopping Cart</h1>
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
    <div className="min-h-screen bg-page pb-28 lg:pb-12">
      <div className="container-lux py-8 sm:py-12">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="heading-display text-2xl sm:text-3xl">
            Shopping Cart
          </h1>
          <span className="text-sm text-sub">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {freeShippingRemaining > 0 && (
          <div className="mb-8 rounded-card border border-gold-500/30 bg-gold-50 p-4 dark:bg-gold-500/5">
            <p className="mb-2 text-xs text-gold-800 dark:text-gold-300">
              You're {formatPrice(freeShippingRemaining)} away from complimentary shipping.
            </p>
            <div className="h-1.5 overflow-hidden rounded-full bg-gold-500/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="flex-1 space-y-4">
            {cartItems.map((item) => {
              const itemSubtotal = item.price * item.quantity
              return (
                <div
                  key={item._cartKey || `${item.id}-${item.size}-${item.color}`}
                  className="flex gap-4 rounded-card border border-line bg-surface p-4 shadow-card sm:gap-5 sm:p-5"
                >
                  <Link
                    to={`/product/${item.id}`}
                    className="h-24 w-24 shrink-0 overflow-hidden rounded-field bg-inset sm:h-28 sm:w-28"
                  >
                    <ImageWithFallback
                      src={getAssetUrl(item.image)}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        {item.brand && (
                          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">
                            {item.brand}
                          </p>
                        )}
                        <Link
                          to={`/product/${item.id}`}
                          className="mt-0.5 line-clamp-1 text-sm font-medium text-ink transition-colors hover:text-gold-600"
                        >
                          {item.name}
                        </Link>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-sub">
                          {item.size && <span>Size: {item.size}</span>}
                          {item.color && item.color !== 'Default' && (
                            <span>Color: {item.color}</span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id, item.size, item.color)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sub transition-colors hover:bg-danger/10 hover:text-danger active:scale-95"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Icon name="Trash2" size="sm" />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <QuantitySelector
                        value={item.quantity}
                        onChange={(qty) => updateQuantity(item.id, qty, item.size, item.color)}
                        min={1}
                        max={item.stock || 99}
                      />
                      <span className="whitespace-nowrap pl-3 text-sm font-semibold text-ink">
                        {formatPrice(itemSubtotal)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <aside className="w-full lg:w-80">
            <div className="sticky top-28 rounded-card border border-line bg-surface p-6 shadow-card">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-ink">
                Order Summary
              </h3>

              <dl className="space-y-3 text-sm">
                <div className="flex justify-between text-sub">
                  <dt>Subtotal</dt>
                  <dd>{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between text-sub">
                  <dt>Shipping</dt>
                  <dd>
                    {shipping === 0 ? (
                      <span className="font-medium text-success">Free</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </dd>
                </div>
                <div className="flex justify-between text-sub">
                  <dt>Tax (8%)</dt>
                  <dd>{formatPrice(tax)}</dd>
                </div>
                <div className="flex justify-between border-t border-line pt-3 text-base font-semibold text-ink">
                  <dt>Total</dt>
                  <dd>{formatPrice(total)}</dd>
                </div>
              </dl>

              <Button
                variant="primary"
                fullWidth
                size="lg"
                className="mt-6"
                to="/checkout"
              >
                Proceed to Checkout
              </Button>

              <Button
                variant="ghost"
                fullWidth
                icon="ArrowLeft"
                to="/products"
                className="mt-2"
              >
                Continue Shopping
              </Button>
            </div>
          </aside>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-line bg-surface px-4 py-3 shadow-card lg:hidden">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-sub">Total</span>
          <span className="text-lg font-bold text-ink">{formatPrice(total)}</span>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            fullWidth
            to="/products"
          >
            Continue Shopping
          </Button>
          <Button
            variant="primary"
            fullWidth
            to="/checkout"
          >
            Checkout
          </Button>
        </div>
      </div>
    </div>
  )
}
