import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { orderService } from '../services/orderService'
import { cartService } from '../services/cartService'
import { formatPrice } from '../utils/helpers'
import PayPalButton from '../components/PayPalButton'
import RazorpayButton from '../components/RazorpayButton'

const STEPS = ['Shipping', 'Payment', 'Review']

const PAYMENT_METHODS = [
  { id: 'COD', label: 'Cash on Delivery', description: 'Pay when you receive your order', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
  { id: 'PAYPAL', label: 'PayPal', description: 'Secure payment via PayPal', icon: 'M7 11.5V14m0-2.5v-6a1.5 1.5 0 013 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11' },
  { id: 'RAZORPAY', label: 'Razorpay', description: 'Pay via UPI, cards, or net banking', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
]

export default function Checkout() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { cartItems, getCartTotal, clearCart } = useCart()
  const { showToast } = useToast()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('')

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

  const subtotal = getCartTotal()
  const shippingCost = subtotal >= 100 || subtotal === 0 ? 0 : 15
  const tax = subtotal * 0.08
  const total = subtotal + shippingCost + tax

  const updateShipping = (field, value) =>
    setShipping((prev) => ({ ...prev, [field]: value }))

  const isShippingValid = () =>
    Object.values(shipping).every((v) => v.trim().length > 0)

  const syncCartWithBackend = async () => {
    try { await cartService.clearCart() } catch {}
    for (const item of cartItems) {
      await cartService.addItem({ productId: item.id, quantity: item.quantity })
    }
  }

  const handlePaymentSuccess = (paymentData) => {
    clearCart()
    showToast('Order placed successfully!', 'success')
    const orderNumber = paymentData?.orderNumber || `ORD-${Date.now()}`
    navigate(`/order-confirmation/${orderNumber}`)
  }

  const handlePlaceOrderCOD = async () => {
    setSubmitting(true)
    try {
      await syncCartWithBackend()
      const res = await orderService.create({
        street: shipping.street,
        city: shipping.city,
        state: shipping.state,
        zipCode: shipping.zip,
        country: shipping.country,
        paymentMethod: 'COD',
      })
      clearCart()
      showToast('Order placed successfully!', 'success')
      const orderNumber = res.data?.orderNumber || res.orderNumber || `ORD-${Date.now()}`
      navigate(`/order-confirmation/${orderNumber}`)
    } catch {
      showToast('Failed to place order. Please try again.', 'error')
    } finally {
      setSubmitting(false)
    }
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
                      <option value="UK">United Kingdom</option>
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
                  {PAYMENT_METHODS.map((method) => (
                    <label key={method.id} className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${
                      paymentMethod === method.id ? 'border-[#C6A972] bg-[#C6A972]/5' : 'border-[var(--border-color)] hover:border-[var(--text-muted)]'
                    }`}>
                      <input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id)} className="mt-1 accent-[#C6A972]" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-[#C6A972]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={method.icon} />
                          </svg>
                          <span className="text-sm font-semibold text-[var(--text-primary)]">{method.label}</span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] mt-1 ml-7">{method.description}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {paymentMethod === 'COD' && (
                  <div className="bg-[var(--bg-secondary)] rounded-lg p-4 text-sm text-[var(--text-secondary)]">
                    <p className="font-medium text-[var(--text-primary)] mb-1">Pay with Cash</p>
                    <p>Pay when your order is delivered. No additional fees.</p>
                  </div>
                )}

                {paymentMethod === 'PAYPAL' && (
                  <PayPalButton
                    shipping={shipping}
                    onSuccess={handlePaymentSuccess}
                    onError={() => {}}
                    disabled={!isShippingValid()}
                    onSyncCart={syncCartWithBackend}
                  />
                )}

                {paymentMethod === 'RAZORPAY' && (
                  <RazorpayButton
                    shipping={shipping}
                    onSuccess={handlePaymentSuccess}
                    onError={() => {}}
                    onSyncCart={syncCartWithBackend}
                  />
                )}
              </div>
            )}

            {step === 2 && (
              <div className="bg-[var(--bg-card)] rounded-xl shadow-lg shadow-black/5 p-6 border border-[var(--border-color)]">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Review Your Order</h2>
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-[#C6A972] uppercase tracking-wider mb-3">Shipping To</h3>
                  <div className="text-sm text-[var(--text-secondary)] space-y-1 bg-[var(--bg-secondary)] rounded-lg p-4">
                    <p className="text-[var(--text-primary)] font-medium">{shipping.firstName} {shipping.lastName}</p>
                    <p>{shipping.street}</p>
                    <p>{shipping.city}, {shipping.state} {shipping.zip}</p>
                    <p>{shipping.country}</p>
                    <p className="pt-2">{shipping.email}</p>
                    <p>{shipping.phone}</p>
                  </div>
                </div>
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-[#C6A972] uppercase tracking-wider mb-3">Payment Method</h3>
                  <div className="text-sm text-[var(--text-primary)] font-medium bg-[var(--bg-secondary)] rounded-lg p-4">
                    Cash on Delivery
                  </div>
                </div>
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-[#C6A972] uppercase tracking-wider mb-3">Items</h3>
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={`${item.id}-${item.size}-${item.color}`} className="flex items-center gap-3 bg-[var(--bg-secondary)] rounded-lg p-3">
                        <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover bg-[var(--bg-card)]" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.name}</p>
                          <p className="text-xs text-[var(--text-secondary)]">Qty: {item.quantity} {item.size && `| ${item.size}`} {item.color && item.color !== 'Default' && `| ${item.color}`}</p>
                        </div>
                        <span className="text-sm font-medium text-[var(--text-primary)]">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:w-80">
            <div className="bg-[var(--bg-card)] rounded-xl shadow-lg shadow-black/5 p-6 border border-[var(--border-color)] sticky top-24">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? <span className="text-[#2F855A] font-medium">Free</span> : formatPrice(shippingCost)}</span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Tax</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="border-t border-[var(--border-color)] pt-3 flex justify-between font-semibold text-[var(--text-primary)]">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
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

          {step === 1 && paymentMethod === 'COD' && (
            <button onClick={() => setStep(2)}
              className="px-8 py-3 bg-[#C6A972] text-white text-sm font-semibold rounded-full hover:bg-[#B8965F] transition active:scale-[0.98] min-h-[48px]">
              Continue to Review
            </button>
          )}

          {step === 2 && (
            <button onClick={handlePlaceOrderCOD} disabled={submitting}
              className="px-8 py-3 bg-[#C6A972] text-white text-sm font-semibold rounded-full hover:bg-[#B8965F] transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed min-h-[48px] inline-flex items-center gap-2">
              {submitting ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Placing Order...</>
              ) : `Place Order — ${formatPrice(total)}`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
