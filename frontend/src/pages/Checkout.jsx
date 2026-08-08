import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { api } from '../services/api'
import { cartService } from '../services/cartService'
import { checkoutService } from '../services/checkoutService'
import { formatPrice } from '../utils/helpers'
import { getStoreSymbol } from '../utils/currency'
import StripeCheckout from '../components/StripeCheckout'
import RazorpayCheckout from '../components/RazorpayCheckout'

const STEPS = ['Shipping', 'Payment']

const METHOD_ICONS = {
  STRIPE: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  RAZORPAY: 'M12 11c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm6 0c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z',
}

export default function Checkout() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { cartItems, getCartTotal, clearCart } = useCart()
  const { showToast } = useToast()
  const [paymentMethods, setPaymentMethods] = useState([])
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState('')

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
  const cs = quote?.currencySymbol || getStoreSymbol()

  const subtotal = quote ? Number(quote.subtotal) : getCartTotal()
  const shippingCost = quote ? Number(quote.shippingCost) : null
  const tax = quote ? Number(quote.tax) : null
  const total = quote ? Number(quote.total) : null

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

  useEffect(() => {
    let cancelled = false
    setPaymentMethodsLoading(true)
    checkoutService.getPaymentMethods()
      .then((res) => {
        if (cancelled) return
        const methods = res.data || res || []
        const list = Array.isArray(methods) ? methods : []
        setPaymentMethods(list)
        if (list.length > 0) {
          setPaymentMethod((prev) => prev || list[0].code)
        }
      })
      .catch(() => {
        if (!cancelled) setPaymentMethods([])
      })
      .finally(() => {
        if (!cancelled) setPaymentMethodsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

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
      <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-[var(--bg-card)] flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Your cart is empty</h2>
          <p className="text-[var(--text-secondary)] text-sm mb-6">Add some items before checking out.</p>
          <Link to="/cart" className="inline-flex items-center gap-2 px-6 py-3 bg-[#C6A972] text-white text-sm font-medium rounded-full hover:bg-[#B8965F] transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Cart
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] pb-28 lg:pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <nav className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-6">
          <Link to="/cart" className="hover:text-[var(--text-primary)] transition">Cart</Link>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-[var(--text-primary)] font-medium">Checkout</span>
        </nav>

        <div className="flex items-center justify-between mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition ${
                i < step ? 'bg-[#C6A972] text-white' : i === step ? 'bg-[#C6A972] text-white' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)]'
              }`}>
                {i < step ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:inline ${i <= step ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`hidden sm:block w-12 h-px mx-2 ${i < step ? 'bg-[#C6A972]' : 'bg-[#EFEAE4]'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            {step === 0 && (
              <div className="bg-[var(--bg-card)] rounded-xl shadow-lg shadow-black/5 p-6 border border-[var(--border-color)]">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Shipping Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">First Name</label>
                    <input type="text" value={shipping.firstName} onChange={(e) => updateShipping('firstName', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[#C6A972]" placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Last Name</label>
                    <input type="text" value={shipping.lastName} onChange={(e) => updateShipping('lastName', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[#C6A972]" placeholder="Doe" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Email</label>
                    <input type="email" value={shipping.email} onChange={(e) => updateShipping('email', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[#C6A972]" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Phone</label>
                    <input type="tel" value={shipping.phone} onChange={(e) => updateShipping('phone', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[#C6A972]" placeholder="+1 (555) 000-0000" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Street Address</label>
                    <input type="text" value={shipping.street} onChange={(e) => updateShipping('street', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[#C6A972]" placeholder="123 Main Street" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">City</label>
                    <input type="text" value={shipping.city} onChange={(e) => updateShipping('city', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[#C6A972]" placeholder="New York" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">State</label>
                    <input type="text" value={shipping.state} onChange={(e) => updateShipping('state', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[#C6A972]" placeholder="NY" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">ZIP Code</label>
                    <input type="text" value={shipping.zip} onChange={(e) => updateShipping('zip', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[#C6A972]" placeholder="10001" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Country</label>
                    <select value={shipping.country} onChange={(e) => updateShipping('country', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#C6A972]">
                      <option value="US">United States</option>
                      <option value="GB">United Kingdom</option>
                      <option value="CA">Canada</option>
                      <option value="AE">UAE</option>
                      <option value="FR">France</option>
                      <option value="IT">Italy</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="bg-[var(--bg-card)] rounded-xl shadow-lg shadow-black/5 p-6 border border-[var(--border-color)]">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Payment Method</h2>
                <div className="space-y-3 mb-6">
                  {paymentMethodsLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <svg className="w-5 h-5 animate-spin text-[#C6A972]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </div>
                  ) : paymentMethods.length === 0 ? (
                    <p className="text-sm text-[var(--text-secondary)]">
                      No payment methods are currently available. Please contact support.
                    </p>
                  ) : (
                    paymentMethods.map((method) => (
                      <div
                        key={method.code}
                        onClick={() => setPaymentMethod(method.code)}
                        className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${
                          paymentMethod === method.code
                            ? 'border-[#C6A972] bg-[#C6A972]/5'
                            : 'border-[var(--border-color)] bg-transparent hover:border-[var(--text-secondary)]'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#C6A972]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={METHOD_ICONS[method.code] || 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'} />
                            </svg>
                            <span className="text-sm font-semibold text-[var(--text-primary)]">{method.label || method.code}</span>
                          </div>
                          {method.description && (
                            <p className="text-xs text-[var(--text-secondary)] mt-1 ml-7">{method.description}</p>
                          )}
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === method.code ? 'border-[#C6A972]' : 'border-[var(--border-color)]'
                        }`}>
                          {paymentMethod === method.code && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#C6A972]" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
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

          <div className="lg:w-80">
            <div className="bg-[var(--bg-card)] rounded-xl shadow-lg shadow-black/5 p-6 border border-[var(--border-color)] sticky top-24">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>{formatPrice(subtotal, cs)}</span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Shipping</span>
                  <span>
                    {shippingCost === 0 ? (
                      <span className="text-[#2F855A] font-medium">Free</span>
                    ) : shippingCost != null ? (
                      formatPrice(shippingCost, cs)
                    ) : (
                      <span className="text-[var(--text-muted)]">Calculated</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Tax</span>
                  <span>{tax != null ? formatPrice(tax, cs) : <span className="text-[var(--text-muted)]">Calculated</span>}</span>
                </div>
                <div className="border-t border-[var(--border-color)] pt-3 flex justify-between font-semibold text-[var(--text-primary)]">
                  <span>Total</span>
                  <span>{total != null ? formatPrice(total, cs) : <span className="text-[var(--text-muted)]">Calculated</span>}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 lg:static lg:mt-8 bg-[var(--bg-secondary)] lg:bg-transparent border-t lg:border-t-0 border-[var(--border-color)] px-4 py-3 lg:px-0 lg:py-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {step > 0 ? (
            <button onClick={() => setStep(step - 1)}
              className="px-6 py-3 text-sm font-medium text-[var(--text-secondary)] rounded-full border border-[var(--border-color)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition min-h-[48px]">
              Back
            </button>
          ) : (
            <Link to="/cart"
              className="px-6 py-3 text-sm font-medium text-[var(--text-secondary)] rounded-full border border-[var(--border-color)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition text-center min-h-[48px] inline-flex items-center">
              Back to Cart
            </Link>
          )}

          {step === 0 && (
            <button onClick={() => setStep(step + 1)} disabled={!isShippingValid()}
              className="px-8 py-3 bg-[#C6A972] text-white text-sm font-semibold rounded-full hover:bg-[#B8965F] transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed min-h-[48px]">
              Continue to Payment
            </button>
          )}


        </div>
      </div>
    </div>
  )
}
