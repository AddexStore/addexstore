import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { orderService } from '../services/orderService'
import { mapOrder } from '../services/mappers'
import { formatPrice } from '../utils/helpers'
import BackButton from '../components/BackButton'

const MAX_POLLS = 5
const POLL_INTERVAL = 2000

export default function OrderConfirmation() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const pollCount = useRef(0)
  const timerRef = useRef(null)

  const fetchOrder = () => {
    orderService.getByOrderNumber(orderId)
      .then((res) => {
        const o = mapOrder(res.data || res)
        setOrder(o)
        if (o.status === 'PENDING_PAYMENT' && pollCount.current < MAX_POLLS) {
          pollCount.current++
          timerRef.current = setTimeout(fetchOrder, POLL_INTERVAL)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    setLoading(true)
    pollCount.current = 0
    fetchOrder()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [orderId])

  const paymentLabels = {
    STRIPE: 'Credit/Debit Card',
    COD: 'Cash on Delivery',
    PAYPAL: 'PayPal',
    RAZORPAY: 'Razorpay',
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-[var(--bg-card)] flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Order not found</h2>
          <p className="text-[var(--text-secondary)] text-sm mb-6">We couldn't find this order.</p>
          <Link to="/orders" className="inline-flex items-center gap-2 px-6 py-3 bg-[#C6A972] text-white text-sm font-medium rounded-full hover:bg-[#B8965F] transition">
            View My Orders
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="mb-10">
          <div className="mb-6"><BackButton /></div>
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-[#2F855A]/10 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-[#2F855A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="font-playfair-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2">
              Order Confirmed!
            </h1>
            <p className="text-[var(--text-secondary)] text-sm">
              Thank you for your purchase. Your order has been placed successfully.
            </p>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] rounded-xl shadow-lg shadow-black/5 border border-[var(--border-color)] p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6 pb-6 border-b border-[var(--border-color)]">
            <div>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">Order Number</p>
              <p className="text-lg font-semibold text-[var(--text-primary)] font-mono">{order.orderNumber || order.id}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">Status</p>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#C6A972]/10 text-[#C6A972] text-sm font-medium rounded-full">
                  <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'PENDING_PAYMENT' ? 'bg-yellow-500 animate-pulse' : 'bg-[#C6A972]'}`} />
                  {order.status === 'PENDING_PAYMENT' ? 'Confirmed' : order.status}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">Payment</p>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {paymentLabels[order.paymentMethod] || order.paymentMethod}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover bg-[var(--bg-card)]" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.name}</p>
                  <p className="text-xs text-[var(--text-secondary)]">Qty: {item.quantity} {item.size && `| ${item.size}`}</p>
                </div>
                <span className="text-sm font-medium text-[var(--text-primary)]">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-[var(--border-color)] pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Shipping</span>
              <span>{order.shippingCost === 0 ? <span className="text-[#2F855A] font-medium">Free</span> : formatPrice(order.shippingCost)}</span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Tax</span>
              <span>{formatPrice(order.tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-[var(--text-primary)] border-t border-[var(--border-color)] pt-3">
              <span>Total</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] rounded-xl shadow-lg shadow-black/5 border border-[var(--border-color)] p-6 mb-8">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-3">Shipping Address</h3>
          <div className="text-sm text-[var(--text-secondary)] space-y-1">
            <p className="text-[var(--text-primary)]">{order.shippingAddress.street}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/orders" className="w-full sm:w-auto px-8 py-3 bg-[#C6A972] text-white text-sm font-medium rounded-full hover:bg-[#B8965F] transition text-center active:scale-[0.98]">
            View My Orders
          </Link>
          <Link to="/products" className="w-full sm:w-auto px-8 py-3 text-sm font-medium text-[var(--text-secondary)] rounded-full border border-[var(--border-color)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition text-center active:scale-[0.98]">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
