import { useState, useMemo, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { orderService } from '../services/orderService'
import { mapOrder } from '../services/mappers'
import { formatPrice, formatDate, getCurrencySymbol } from '../utils/helpers'
import { getAssetUrl } from '../services/api'
import { ORDER_STATUS } from '../constants'
import ImageWithFallback from '../components/ImageWithFallback'
import EmptyState from '../components/EmptyState'
import StatusBadge from '../components/ui/StatusBadge'
import Icon from '../components/ui/Icon'

const STATUS_STEPS = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.PROCESSING,
  ORDER_STATUS.SHIPPED,
  ORDER_STATUS.DELIVERED,
]

const TABS = [
  'All',
  ORDER_STATUS.PENDING,
  ORDER_STATUS.PENDING_PAYMENT,
  ORDER_STATUS.PROCESSING,
  ORDER_STATUS.SHIPPED,
  ORDER_STATUS.DELIVERED,
  ORDER_STATUS.CANCELLED,
  ORDER_STATUS.REFUNDED,
]

export default function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [expandedOrder, setExpandedOrder] = useState(null)

  useEffect(() => {
    if (user) {
      setLoading(true)
      orderService.getMyOrders(0, 50)
        .then((res) => {
          const list = ((res.data?.content || res.content || res.data || [])).map(mapOrder)
          setOrders(list)
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [user])

  const userOrders = orders

  const filteredOrders = useMemo(() => {
    if (activeTab === 'All') return userOrders
    return userOrders.filter((o) => o.status === activeTab)
  }, [userOrders, activeTab])

  const getStepIndex = (status) => {
    if (status === ORDER_STATUS.CANCELLED || status === ORDER_STATUS.REFUNDED || status === ORDER_STATUS.PENDING_PAYMENT) return -1
    return STATUS_STEPS.indexOf(status)
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <EmptyState
          title="Sign In Required"
          message="Please sign in to view your orders."
          actionLabel="Sign In"
          actionLink="/login"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page pb-16">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <p className="eyebrow mb-2 text-gold-600">Account</p>
          <h1 className="heading-display text-2xl sm:text-3xl">My Orders</h1>
          <p className="mt-1 text-sm text-sub">View and track all your orders.</p>
        </div>

        <div className="hide-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          {TABS.map((tab) => {
            const count = tab === 'All' ? userOrders.length : userOrders.filter((o) => o.status === tab).length
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all min-h-[44px] ${
                  activeTab === tab
                    ? 'bg-gold-500 text-white shadow-gold-soft'
                    : 'border border-line bg-surface text-sub hover:border-gold-500/50 hover:text-ink'
                }`}
              >
                {tab}
                <span className={`text-xs ${activeTab === tab ? 'text-white/80' : 'text-faint'}`}>
                  ({count})
                </span>
              </button>
            )
          })}
        </div>

        {filteredOrders.length === 0 ? (
          <EmptyState
            icon="ShoppingBag"
            title="No Orders Found"
            message={activeTab === 'All' ? "You haven't placed any orders yet." : `No ${activeTab.toLowerCase()} orders.`}
            actionLabel={activeTab === 'All' ? 'Start Shopping' : undefined}
            actionLink={activeTab === 'All' ? '/products' : undefined}
          />
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const stepIndex = getStepIndex(order.status)
              const isExpanded = expandedOrder === order.id

              return (
                <div key={order.id} className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
                  <button
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    className="w-full text-left"
                    aria-expanded={isExpanded}
                  >
                    <div className="p-5 sm:p-6">
                      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div>
                          <p className="text-sm font-medium text-ink">{order.id}</p>
                          <p className="mt-0.5 text-xs text-sub">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusBadge status={order.status} />
                          <span className="text-sm font-semibold text-ink">{formatPrice(order.totalAmount, getCurrencySymbol(order.currency))}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {order.items.slice(0, 3).map((item, i) => (
                              <div key={i} className="h-8 w-8 overflow-hidden rounded-full border-2 border-surface bg-inset">
                                <ImageWithFallback src={getAssetUrl(item.image)} alt={item.name} className="h-full w-full" />
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-subtle text-[10px] font-medium text-sub">
                                +{order.items.length - 3}
                              </div>
                            )}
                          </div>
                          <span className="text-sm text-sub">
                            {order.items.length} item{order.items.length > 1 ? 's' : ''}
                          </span>
                        </div>
                        <Icon
                          name="ChevronDown"
                          size="sm"
                          className={`text-sub transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </div>
                    </div>
                  </button>

                  <div
                    className={`transition-all duration-300 ${
                      isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                    } overflow-hidden`}
                  >
                    <div className="space-y-6 border-t border-line px-5 py-5 sm:px-6">
                      {STATUS_STEPS.includes(order.status) && (
                        <div>
                          <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink">
                            Order Progress
                          </h4>
                          <div className="relative">
                            <div className="absolute left-4 right-4 top-4 h-0.5 bg-line">
                              <div
                                className="h-full bg-gold-500 transition-all duration-500"
                                style={{ width: `${Math.max(0, stepIndex) * (100 / (STATUS_STEPS.length - 1))}%` }}
                              />
                            </div>
                            <div className="relative flex items-center justify-between">
                              {STATUS_STEPS.map((step, i) => {
                                const isCompleted = stepIndex >= i
                                const isCurrent = stepIndex === i
                                return (
                                  <div key={step} className="flex flex-col items-center">
                                    <div
                                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                                        isCompleted
                                          ? 'bg-gold-500 text-white shadow-gold-soft'
                                          : 'bg-subtle text-sub'
                                      } ${isCurrent ? 'scale-110 ring-2 ring-gold-500/30' : ''}`}
                                    >
                                      {isCompleted ? (
                                        <Icon name="Check" size="sm" />
                                      ) : (
                                        i + 1
                                      )}
                                    </div>
                                    <span className={`mt-1.5 whitespace-nowrap text-[10px] ${isCompleted ? 'font-medium text-ink' : 'text-sub'}`}>
                                      {step}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {order.status === ORDER_STATUS.PENDING_PAYMENT && (
                        <div className="flex items-center gap-2 rounded-field bg-info/10 px-4 py-3">
                          <Icon name="AlertCircle" size="sm" className="shrink-0 text-info" />
                          <span className="text-sm text-info">This order is awaiting payment confirmation.</span>
                        </div>
                      )}

                      {order.status === ORDER_STATUS.CANCELLED && (
                        <div className="flex items-center gap-2 rounded-field bg-danger/10 px-4 py-3">
                          <Icon name="AlertTriangle" size="sm" className="shrink-0 text-danger" />
                          <span className="text-sm text-danger">This order has been cancelled.</span>
                        </div>
                      )}

                      {order.status === ORDER_STATUS.REFUNDED && (
                        <div className="flex items-center gap-2 rounded-field bg-subtle px-4 py-3">
                          <Icon name="RotateCcw" size="sm" className="shrink-0 text-sub" />
                          <span className="text-sm text-sub">This order has been refunded.</span>
                        </div>
                      )}

                      <div>
                        <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink">Items</h4>
                        <div className="space-y-3">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex items-center gap-4">
                              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-field bg-inset">
                                <ImageWithFallback src={getAssetUrl(item.image)} alt={item.name} className="h-full w-full" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-sub">
                                  {item.color && <span>{item.color}</span>}
                                  {item.size && <span>Size: {item.size}</span>}
                                  <span>Qty: {item.quantity}</span>
                                </div>
                              </div>
                              <span className="whitespace-nowrap text-sm font-medium text-ink">
                                {formatPrice(item.price, getCurrencySymbol(order.currency))}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1 border-t border-line pt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-sub">Subtotal</span>
                          <span className="text-sm text-ink">{formatPrice(order.subtotal, getCurrencySymbol(order.currency))}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-sub">Tax</span>
                          <span className="text-sm text-ink">{formatPrice(order.tax, getCurrencySymbol(order.currency))}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-sub">Shipping</span>
                          {Number(order.shippingCost) > 0 ? (
                            <span className="text-sm text-ink">{formatPrice(order.shippingCost, getCurrencySymbol(order.currency))}</span>
                          ) : (
                            <span className="text-sm font-medium text-success">Free</span>
                          )}
                        </div>
                        <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
                          <span className="text-sm font-semibold text-ink">Total</span>
                          <span className="text-base font-bold text-ink">{formatPrice(order.totalAmount, getCurrencySymbol(order.currency))}</span>
                        </div>
                      </div>

                      <div className="border-t border-line pt-4">
                        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink">
                          Shipping Address
                        </h4>
                        <p className="text-sm leading-relaxed text-sub">
                          {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                          {order.shippingAddress.state} {order.shippingAddress.zip},{' '}
                          {order.shippingAddress.country}
                        </p>
                        <p className="mt-2 text-xs text-sub">Payment: {order.paymentMethod}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
