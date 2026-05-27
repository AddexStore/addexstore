import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { formatPrice } from '../utils/helpers'

const STEPS = ['Shipping', 'Payment', 'Review']

export default function Checkout() {
  const navigate = useNavigate()
  const { cartItems, getCartTotal, clearCart } = useCart()
  const { showToast } = useToast()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)

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

  const [payment, setPayment] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  })

  const subtotal = getCartTotal()
  const shippingCost = subtotal >= 100 || subtotal === 0 ? 0 : 15
  const tax = subtotal * 0.08
  const total = subtotal + shippingCost + tax

  const updateShipping = (field, value) =>
    setShipping((prev) => ({ ...prev, [field]: value }))

  const updatePayment = (field, value) =>
    setPayment((prev) => ({ ...prev, [field]: value }))

  const isShippingValid = () =>
    Object.values(shipping).every((v) => v.trim().length > 0)

  const isPaymentValid = () =>
    Object.values(payment).every((v) => v.trim().length > 0)

  const handlePlaceOrder = () => {
    setSubmitting(true)

    const order = {
      id: `ORD-${Date.now().toString(36).toUpperCase()}`,
      items: cartItems.map((item) => ({
        productId: item.id,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      })),
      totalAmount: total,
      status: 'Processing',
      shippingAddress: {
        street: shipping.street,
        city: shipping.city,
        state: shipping.state,
        zip: shipping.zip,
        country: shipping.country,
      },
      paymentMethod: 'Credit Card',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const existing = JSON.parse(localStorage.getItem('sifr_orders') || '[]')
    existing.unshift(order)
    localStorage.setItem('sifr_orders', JSON.stringify(existing))
    localStorage.setItem('sifr_last_order', JSON.stringify(order))

    clearCart()
    showToast('Order placed successfully!', 'success')

    setTimeout(() => {
      setSubmitting(false)
      navigate(`/order-confirmation/${order.id}`)
    }, 800)
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-[#232326] flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Your cart is empty</h2>
          <p className="text-[#B8B8C2] text-sm mb-6">Add some items before checking out.</p>
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-black text-sm font-medium rounded-full hover:bg-[#C9A84C] transition"
          >
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
    <div className="min-h-screen bg-[#0F0F10] pb-28 lg:pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <nav className="flex items-center gap-2 text-sm text-[#B8B8C2] mb-6">
          <Link to="/cart" className="hover:text-white transition">Cart</Link>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-white font-medium">Checkout</span>
        </nav>

        <div className="flex items-center justify-between mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition ${
                  i < step
                    ? 'bg-[#D4AF37] text-black'
                    : i === step
                    ? 'bg-[#D4AF37] text-black'
                    : 'bg-[#232326] text-[#6B7280] border border-[#2D2D30]'
                }`}
              >
                {i < step ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className={`text-sm font-medium hidden sm:inline ${i <= step ? 'text-white' : 'text-[#6B7280]'}`}>
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`hidden sm:block w-12 h-px mx-2 ${i < step ? 'bg-[#D4AF37]' : 'bg-[#2D2D30]'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            {step === 0 && (
              <div className="bg-[#232326] rounded-xl shadow-lg shadow-black/20 p-6 border border-[#2D2D30]">
                <h2 className="text-lg font-semibold text-white mb-6">Shipping Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#B8B8C2] mb-1.5">First Name</label>
                    <input
                      type="text"
                      value={shipping.firstName}
                      onChange={(e) => updateShipping('firstName', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-[#2D2D30] rounded-lg bg-[#18181B] text-white placeholder-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#B8B8C2] mb-1.5">Last Name</label>
                    <input
                      type="text"
                      value={shipping.lastName}
                      onChange={(e) => updateShipping('lastName', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-[#2D2D30] rounded-lg bg-[#18181B] text-white placeholder-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                      placeholder="Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#B8B8C2] mb-1.5">Email</label>
                    <input
                      type="email"
                      value={shipping.email}
                      onChange={(e) => updateShipping('email', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-[#2D2D30] rounded-lg bg-[#18181B] text-white placeholder-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#B8B8C2] mb-1.5">Phone</label>
                    <input
                      type="tel"
                      value={shipping.phone}
                      onChange={(e) => updateShipping('phone', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-[#2D2D30] rounded-lg bg-[#18181B] text-white placeholder-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[#B8B8C2] mb-1.5">Street Address</label>
                    <input
                      type="text"
                      value={shipping.street}
                      onChange={(e) => updateShipping('street', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-[#2D2D30] rounded-lg bg-[#18181B] text-white placeholder-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#B8B8C2] mb-1.5">City</label>
                    <input
                      type="text"
                      value={shipping.city}
                      onChange={(e) => updateShipping('city', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-[#2D2D30] rounded-lg bg-[#18181B] text-white placeholder-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                      placeholder="New York"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#B8B8C2] mb-1.5">State</label>
                    <input
                      type="text"
                      value={shipping.state}
                      onChange={(e) => updateShipping('state', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-[#2D2D30] rounded-lg bg-[#18181B] text-white placeholder-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                      placeholder="NY"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#B8B8C2] mb-1.5">ZIP Code</label>
                    <input
                      type="text"
                      value={shipping.zip}
                      onChange={(e) => updateShipping('zip', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-[#2D2D30] rounded-lg bg-[#18181B] text-white placeholder-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                      placeholder="10001"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#B8B8C2] mb-1.5">Country</label>
                    <select
                      value={shipping.country}
                      onChange={(e) => updateShipping('country', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-[#2D2D30] rounded-lg bg-[#18181B] text-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                    >
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
              <div className="bg-[#232326] rounded-xl shadow-lg shadow-black/20 p-6 border border-[#2D2D30]">
                <h2 className="text-lg font-semibold text-white mb-6">Payment Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#B8B8C2] mb-1.5">Card Number</label>
                    <input
                      type="text"
                      value={payment.cardNumber}
                      onChange={(e) => updatePayment('cardNumber', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-[#2D2D30] rounded-lg bg-[#18181B] text-white placeholder-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                      placeholder="4242 4242 4242 4242"
                      maxLength={19}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#B8B8C2] mb-1.5">Cardholder Name</label>
                    <input
                      type="text"
                      value={payment.cardName}
                      onChange={(e) => updatePayment('cardName', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-[#2D2D30] rounded-lg bg-[#18181B] text-white placeholder-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#B8B8C2] mb-1.5">Expiry Date</label>
                      <input
                        type="text"
                        value={payment.expiry}
                        onChange={(e) => updatePayment('expiry', e.target.value)}
                        className="w-full px-4 py-2.5 text-sm border border-[#2D2D30] rounded-lg bg-[#18181B] text-white placeholder-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#B8B8C2] mb-1.5">CVV</label>
                      <input
                        type="text"
                        value={payment.cvv}
                        onChange={(e) => updatePayment('cvv', e.target.value)}
                        className="w-full px-4 py-2.5 text-sm border border-[#2D2D30] rounded-lg bg-[#18181B] text-white placeholder-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                        placeholder="123"
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-[#232326] rounded-xl shadow-lg shadow-black/20 p-6 border border-[#2D2D30]">
                <h2 className="text-lg font-semibold text-white mb-6">Review Your Order</h2>

                <div className="mb-6">
                  <h3 className="text-sm font-medium text-[#D4AF37] uppercase tracking-wider mb-3">Shipping To</h3>
                  <div className="text-sm text-[#B8B8C2] space-y-1 bg-[#18181B] rounded-lg p-4">
                    <p className="text-white font-medium">{shipping.firstName} {shipping.lastName}</p>
                    <p>{shipping.street}</p>
                    <p>{shipping.city}, {shipping.state} {shipping.zip}</p>
                    <p>{shipping.country}</p>
                    <p className="pt-2">{shipping.email}</p>
                    <p>{shipping.phone}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-medium text-[#D4AF37] uppercase tracking-wider mb-3">Items</h3>
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={`${item.id}-${item.size}-${item.color}`} className="flex items-center gap-3 bg-[#18181B] rounded-lg p-3">
                        <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover bg-[#0F0F10]" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{item.name}</p>
                          <p className="text-xs text-[#B8B8C2]">Qty: {item.quantity} {item.size && `| ${item.size}`} {item.color && item.color !== 'Default' && `| ${item.color}`}</p>
                        </div>
                        <span className="text-sm font-medium text-white">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:w-80">
            <div className="bg-[#232326] rounded-xl shadow-lg shadow-black/20 p-6 border border-[#2D2D30] sticky top-24">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-[#B8B8C2]">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#B8B8C2]">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? <span className="text-[#22C55E] font-medium">Free</span> : formatPrice(shippingCost)}</span>
                </div>
                <div className="flex justify-between text-[#B8B8C2]">
                  <span>Tax</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="border-t border-[#2D2D30] pt-3 flex justify-between font-semibold text-white">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 lg:static lg:mt-8 bg-[#18181B] lg:bg-transparent border-t lg:border-t-0 border-[#2D2D30] px-4 py-3 lg:px-0 lg:py-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 text-sm font-medium text-[#B8B8C2] rounded-full border border-[#2D2D30] hover:bg-[#2A2A2E] hover:text-white transition min-h-[48px]"
            >
              Back
            </button>
          ) : (
            <Link
              to="/cart"
              className="px-6 py-3 text-sm font-medium text-[#B8B8C2] rounded-full border border-[#2D2D30] hover:bg-[#2A2A2E] hover:text-white transition text-center min-h-[48px] inline-flex items-center"
            >
              Back to Cart
            </Link>
          )}

          {step < 2 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 0 ? !isShippingValid() : !isPaymentValid()}
              className="px-8 py-3 bg-[#D4AF37] text-black text-sm font-semibold rounded-full hover:bg-[#C9A84C] transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed min-h-[48px]"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handlePlaceOrder}
              disabled={submitting}
              className="px-8 py-3 bg-[#D4AF37] text-black text-sm font-semibold rounded-full hover:bg-[#C9A84C] transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed min-h-[48px] inline-flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Placing Order...
                </>
              ) : (
                `Place Order — ${formatPrice(total)}`
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
