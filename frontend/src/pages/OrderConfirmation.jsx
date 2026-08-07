import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { orderService } from '../services/orderService'
import { mapOrder } from '../services/mappers'
import { formatPrice } from '../utils/helpers'
import { getAssetUrl } from '../services/api'
import Button from '../components/ui/Button'
import Icon from '../components/ui/Icon'
import EmptyState from '../components/EmptyState'
import StatusBadge from '../components/ui/StatusBadge'

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

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Icon name="Loader2" size="lg" className="animate-spin text-gold-600" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page px-4">
        <EmptyState
          icon="SearchX"
          title="Order not found"
          message="We couldn't find this order."
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-16 lg:px-8">
        <div className="mb-10">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
              <Icon name="CheckCircle2" size="xl" className="text-success" strokeWidth={1.5} />
            </div>
            <h1 className="heading-display mb-2 text-2xl sm:text-3xl">
              Order Confirmed!
            </h1>
            <p className="text-sm text-sub">
              Thank you for your purchase. Your order has been placed successfully.
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-card border border-line bg-surface p-6 shadow-card">
          <div className="mb-6 flex flex-col justify-between gap-2 border-b border-line pb-6 sm:flex-row sm:items-center">
            <div>
              <p className="mb-1 text-xs uppercase tracking-wider text-faint">Order Number</p>
              <p className="text-lg font-semibold text-ink">{order.orderNumber || order.id}</p>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <p className="mb-1 text-xs uppercase tracking-wider text-faint">Status</p>
                <StatusBadge status={order.status} />
              </div>
              <div>
                <p className="mb-1 text-xs uppercase tracking-wider text-faint">Payment</p>
                <p className="text-sm font-medium text-ink">
                  {paymentLabels[order.paymentMethod] || order.paymentMethod}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6 space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <img
                  src={getAssetUrl(item.image)}
                  alt={item.name}
                  className="h-14 w-14 rounded-field bg-inset object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                  <p className="text-xs text-sub">
                    Qty: {item.quantity} {item.size && `| ${item.size}`}
                  </p>
                </div>
                <span className="text-sm font-medium text-ink">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <dl className="space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between text-sub">
              <dt>Subtotal</dt>
              <dd>{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between text-sub">
              <dt>Shipping</dt>
              <dd>
                {order.shippingCost === 0 ? (
                  <span className="font-medium text-success">Free</span>
                ) : (
                  formatPrice(order.shippingCost)
                )}
              </dd>
            </div>
            <div className="flex justify-between text-sub">
              <dt>Tax</dt>
              <dd>{formatPrice(order.tax)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-lg font-bold text-ink">
              <dt>Total</dt>
              <dd>{formatPrice(order.totalAmount)}</dd>
            </div>
          </dl>
        </div>

        <div className="mb-8 rounded-card border border-line bg-surface p-6 shadow-card">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink">
            Shipping Address
          </h3>
          <div className="space-y-1 text-sm text-sub">
            <p className="text-ink">{order.shippingAddress.street}</p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
            </p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button variant="primary" fullWidth to="/orders">
            View My Orders
          </Button>
          <Button variant="outline" fullWidth to="/products">
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  )
}
