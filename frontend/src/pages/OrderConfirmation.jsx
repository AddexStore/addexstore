import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { formatPrice, formatDate } from '../utils/helpers'
import BackButton from '../components/BackButton'

export default function OrderConfirmation() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    const last = localStorage.getItem('sifr_last_order')
    if (last) {
      const parsed = JSON.parse(last)
      if (parsed.id === orderId) {
        setOrder(parsed)
        return
      }
    }
    const all = JSON.parse(localStorage.getItem('sifr_orders') || '[]')
    const found = all.find((o) => o.id === orderId)
    if (found) {
      setOrder(found)
    }
  }, [orderId])

  if (!order) {
    return (
      <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-[#232326] flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Order not found</h2>
          <p className="text-[#B8B8C2] text-sm mb-6">We couldn't find this order.</p>
          <Link to="/orders" className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-black text-sm font-medium rounded-full hover:bg-[#C9A84C] transition">
            View My Orders
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F0F10]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="mb-10">
          <div className="mb-6"><BackButton /></div>
          <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-[#22C55E]/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="font-playfair-display text-2xl sm:text-3xl font-bold text-white mb-2">
            Order Confirmed!
          </h1>
          <p className="text-[#B8B8C2] text-sm">
            Thank you for your purchase. Your order has been placed successfully.
          </p>
        </div>
        </div>

        <div className="bg-[#232326] rounded-xl shadow-lg shadow-black/20 border border-[#2D2D30] p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6 pb-6 border-b border-[#2D2D30]">
            <div>
              <p className="text-xs text-[#B8B8C2] uppercase tracking-wider mb-1">Order Number</p>
              <p className="text-lg font-semibold text-white font-mono">{order.id}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#B8B8C2] uppercase tracking-wider mb-1">Status</p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-sm font-medium rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                {order.status}
              </span>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover bg-[#0F0F10]" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{item.name}</p>
                  <p className="text-xs text-[#B8B8C2]">Qty: {item.quantity} {item.size && `| ${item.size}`}</p>
                </div>
                <span className="text-sm font-medium text-white">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-[#2D2D30] pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-[#B8B8C2]">
              <span>Subtotal</span>
              <span>{formatPrice(order.items.reduce((s, i) => s + i.price * i.quantity, 0))}</span>
            </div>
            <div className="flex justify-between text-[#B8B8C2]">
              <span>Shipping</span>
              <span className="text-[#22C55E] font-medium">Free</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-white border-t border-[#2D2D30] pt-3">
              <span>Total</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#232326] rounded-xl shadow-lg shadow-black/20 border border-[#2D2D30] p-6 mb-8">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Shipping Address</h3>
          <div className="text-sm text-[#B8B8C2] space-y-1">
            <p className="text-white">{order.shippingAddress.street}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/orders"
            className="w-full sm:w-auto px-8 py-3 bg-[#D4AF37] text-black text-sm font-medium rounded-full hover:bg-[#C9A84C] transition text-center active:scale-[0.98]"
          >
            View My Orders
          </Link>
          <Link
            to="/products"
            className="w-full sm:w-auto px-8 py-3 text-sm font-medium text-[#B8B8C2] rounded-full border border-[#2D2D30] hover:bg-[#2A2A2E] hover:text-white transition text-center active:scale-[0.98]"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
