import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { api } from '../services/api'
import { cartService } from '../services/cartService'
import { checkoutService } from '../services/checkoutService'
import { formatPrice } from '../utils/helpers'
import StripeCheckout from '../components/StripeCheckout'
import RazorpayCheckout from '../components/RazorpayCheckout'
import { Field, Input, Select } from '../components/ui/Input'
import Button from '../components/ui/Button'
import Icon from '../components/ui/Icon'
import EmptyState from '../components/EmptyState'

const STEPS = ['Shipping', 'Payment']

const PAYMENT_METHODS = [
  {
    id: 'STRIPE',
    label: 'Credit / Debit Card',
    description: 'Pay with card, Apple Pay, or Google Pay',
    icon: 'CreditCard',
  },
  {
    id: 'RAZORPAY',
    label: 'UPI / Cards / Net Banking',
    description: 'Pay with UPI, Cards, Net Banking, or Wallets',
    icon: 'Landmark',
  },
]

export default function Checkout() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { cartItems, getCartTotal, clearCart } = useCart()
  const { showToast } = useToast()
  const [paymentMethod, setPaymentMethod] = useState('STRIPE')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const [step, setStep] = useState(0)

  const [shipping, setShipping] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  })

  const [quote, setQuote] = useState(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const cs = quote?.currencySymbol || '$'

  const getCurrencyForCountry = (country) => {
    const currencyMap = {
      US: 'USD', UK: 'GBP', GB: 'GBP', CA: 'USD',
      AE: 'AED', FR: 'EUR', IT: 'EUR', IN: 'INR',
    }
    return currencyMap[country] || 'USD'
  }

  const subtotal = quote ? Number(quote.subtotal) : getCartTotal()
  const shippingCost = quote ? Number(quote.shippingCost) : (getCartTotal() >= 100 ? 0 : 15)
  const tax = quote ? Number(quote.tax) : getCartTotal() * 0.08
  const total = quote ? Number(quote.total) : subtotal + shippingCost + tax

  const updateShipping = (field, value) =>
    setShipping((prev) => ({ ...prev, [field]: value }))

  const isShippingValid = () =>
    Object.values(shipping).every((v) => v.trim().length > 0)

  const fetchQuote = useCallback(async () => {
    if (cartItems.length === 0) return
    setQuoteLoading(true)
    try {
      const items = cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      }))
      const res = await checkoutService.getQuote({
        country: shipping.country,
        state: shipping.state,
        currency: getCurrencyForCountry(shipping.country),
        items,
      })
      setQuote(res.data || res)
    } catch (err) {
      showToast(err.message || 'Failed to load pricing', 'error')
    } finally {
      setQuoteLoading(false)
    }
  }, [shipping.country, shipping.state, cartItems])

  useEffect(() => {
    fetchQuote()
  }, [fetchQuote])

  const syncCartWithBackend = async () => {
    await cartService.syncCart(cartItems.map(item => ({
      productId: item.id,
      quantity: item.quantity
    })))
  }

  const handlePaymentSuccess = async (paymentData) => {
    clearCart()
    showToast('Order placed successfully!', 'success')
    const orderNumber = paymentData?.orderNumber || `ORD-${Date.now()}`

    if (paymentData?.paymentIntentId) {
      try {
        await api.get(`/payments/stripe/status/${paymentData.paymentIntentId}`)
      } catch {
        // non-blocking — order status will sync on confirmation page fallback
      }
    }

    navigate(`/order-confirmation/${orderNumber}`)
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page px-4">
        <div className="max-w-md text-center">
          <EmptyState
            title="Your cart is empty"
            message="Add some items before checking out."
          />
          <Button variant="primary" icon="ArrowLeft" to="/cart">
            Back to Cart
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page pb-28 lg:pb-12">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <nav className="mb-6 flex items-center gap-2 text-sm text-sub" aria-label="Breadcrumb">
          <Link to="/cart" className="transition-colors hover:text-ink">Cart</Link>
          <Icon name="ChevronRight" size="xs" />
          <span className="font-medium text-ink">Checkout</span>
        </nav>

        <div className="mb-8 flex items-center justify-between">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-all ${
                  i <= step
                    ? 'bg-gold-500 text-white shadow-gold-soft'
                    : 'border border-line bg-surface text-sub'
                }`}
                aria-current={i === step ? 'step' : undefined}
              >
                {i < step ? <Icon name="Check" size="sm" /> : i + 1}
              </div>
              <span className={`hidden text-sm font-medium sm:inline ${i <= step ? 'text-ink' : 'text-sub'}`}>
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`mx-2 hidden h-px w-12 sm:block ${i < step ? 'bg-gold-500' : 'bg-line'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="flex-1">
            {step === 0 && (
              <div className="rounded-card border border-line bg-surface p-6 shadow-card">
                <h2 className="mb-6 text-lg font-semibold text-ink">Shipping Information</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="First Name" required>
                    <Input type="text" value={shipping.firstName} onChange={(e) => updateShipping('firstName', e.target.value)} placeholder="John" />
                  </Field>
                  <Field label="Last Name" required>
                    <Input type="text" value={shipping.lastName} onChange={(e) => updateShipping('lastName', e.target.value)} placeholder="Doe" />
                  </Field>
                  <Field label="Email" required>
                    <Input type="email" value={shipping.email} onChange={(e) => updateShipping('email', e.target.value)} placeholder="john@example.com" />
                  </Field>
                  <Field label="Phone" required>
                    <Input type="tel" value={shipping.phone} onChange={(e) => updateShipping('phone', e.target.value)} placeholder="+1 (555) 000-0000" />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Street Address" required>
                      <Input type="text" value={shipping.street} onChange={(e) => updateShipping('street', e.target.value)} placeholder="123 Main Street" />
                    </Field>
                  </div>
                  <Field label="City" required>
                    <Input type="text" value={shipping.city} onChange={(e) => updateShipping('city', e.target.value)} placeholder="New York" />
                  </Field>
                  <Field label="State" required>
                    <Input type="text" value={shipping.state} onChange={(e) => updateShipping('state', e.target.value)} placeholder="NY" />
                  </Field>
                  <Field label="ZIP Code" required>
                    <Input type="text" value={shipping.zip} onChange={(e) => updateShipping('zip', e.target.value)} placeholder="10001" />
                  </Field>
                  <Field label="Country" required>
                    <Select value={shipping.country} onChange={(e) => updateShipping('country', e.target.value)}>
                      <option value="US">United States</option>
                      <option value="UK">United Kingdom</option>
                      <option value="CA">Canada</option>
                      <option value="AE">UAE</option>
                      <option value="FR">France</option>
                      <option value="IT">Italy</option>
                    </Select>
                  </Field>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="rounded-card border border-line bg-surface p-6 shadow-card">
                <h2 className="mb-6 text-lg font-semibold text-ink">Payment Method</h2>
                <div className="mb-6 space-y-3">
                  {PAYMENT_METHODS.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`flex cursor-pointer items-start gap-4 rounded-field border-2 p-4 transition-all ${
                        paymentMethod === method.id
                          ? 'border-gold-500 bg-gold-50 ring-1 ring-gold-500/20 dark:bg-gold-500/5'
                          : 'border-line bg-transparent hover:border-ink/30'
                      }`}
                      role="radio"
                      aria-checked={paymentMethod === method.id}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setPaymentMethod(method.id)
                        }
                      }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2.5">
                          <Icon name={method.icon} size="md" className="text-gold-600" />
                          <span className="text-sm font-semibold text-ink">{method.label}</span>
                        </div>
                        <p className="mt-1 pl-9 text-xs text-sub">{method.description}</p>
                      </div>
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                          paymentMethod === method.id ? 'border-gold-500' : 'border-line'
                        }`}
                      >
                        {paymentMethod === method.id && (
                          <span className="h-2.5 w-2.5 rounded-full bg-gold-500" />
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                {paymentMethod === 'STRIPE' && (
                  <StripeCheckout
                    shipping={shipping}
                    onSuccess={handlePaymentSuccess}
                    onError={() => {}}
                    onSyncCart={syncCartWithBackend}
                  />
                )}

                {paymentMethod === 'RAZORPAY' && (
                  <RazorpayCheckout
                    shipping={shipping}
                    onSuccess={handlePaymentSuccess}
                    onError={() => {}}
                    onSyncCart={syncCartWithBackend}
                  />
                )}
              </div>
            )}
          </div>

          <aside className="w-full lg:w-80">
            <div className="sticky top-28 rounded-card border border-line bg-surface p-6 shadow-card">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-ink">
                Order Summary
              </h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between text-sub">
                  <dt>Subtotal ({cartItems.length} items)</dt>
                  <dd>{formatPrice(subtotal, cs)}</dd>
                </div>
                <div className="flex justify-between text-sub">
                  <dt>Shipping</dt>
                  <dd>
                    {shippingCost === 0 ? (
                      <span className="font-medium text-success">Free</span>
                    ) : (
                      formatPrice(shippingCost, cs)
                    )}
                  </dd>
                </div>
                <div className="flex justify-between text-sub">
                  <dt>Tax</dt>
                  <dd>{formatPrice(tax, cs)}</dd>
                </div>
                <div className="flex justify-between border-t border-line pt-3 text-base font-semibold text-ink">
                  <dt>Total</dt>
                  <dd>{formatPrice(total, cs)}</dd>
                </div>
              </dl>
              {quoteLoading && (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-faint">
                  <Icon name="Loader2" size="xs" className="animate-spin" />
                  Refreshing quote…
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-line bg-surface px-4 py-3 shadow-card lg:static lg:mt-8 lg:border-t-0 lg:bg-transparent lg:px-0 lg:py-0 lg:shadow-none">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          {step > 0 ? (
            <Button variant="outline" icon="ArrowLeft" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          ) : (
            <Button variant="outline" to="/cart">
              Back to Cart
            </Button>
          )}

          {step === 0 && (
            <Button
              variant="primary"
              icon="ArrowRight"
              iconPosition="right"
              disabled={!isShippingValid()}
              onClick={() => setStep(step + 1)}
            >
              Continue to Payment
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
