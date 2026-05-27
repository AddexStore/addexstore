import { useState, useMemo } from 'react'
import { orders as staticOrders } from '../data/orders'
import { useAuth } from '../context/AuthContext'
import { formatPrice, formatDate } from '../utils/helpers'
import { ORDER_STATUS } from '../constants'
import ImageWithFallback from '../components/ImageWithFallback'
import EmptyState from '../components/EmptyState'
import BackButton from '../components/BackButton'

const STATUS_STEPS = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.PROCESSING,
  ORDER_STATUS.SHIPPED,
  ORDER_STATUS.DELIVERED,
]

const STATUS_STYLES = {
  [ORDER_STATUS.PENDING]: 'bg-yellow-100 text-yellow-700',
  [ORDER_STATUS.PROCESSING]: 'bg-blue-100 text-blue-700',
  [ORDER_STATUS.SHIPPED]: 'bg-purple-100 text-purple-700',
  [ORDER_STATUS.DELIVERED]: 'bg-green-100 text-green-700',
  [ORDER_STATUS.CANCELLED]: 'bg-red-100 text-red-700',
}

const TABS = ['All', ORDER_STATUS.PENDING, ORDER_STATUS.PROCESSING, ORDER_STATUS.SHIPPED, ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED]

export default function Orders() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('All')
  const [expandedOrder, setExpandedOrder] = useState(null)

  const allOrders = useMemo(() => {
    const local = JSON.parse(localStorage.getItem('sifr_orders') || '[]')
    const combined = [...local, ...staticOrders.filter((o) => o.userId === user?.id)]
    combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return combined
  }, [user?.id])

  const userOrders = allOrders

  const filteredOrders = useMemo(() => {
    if (activeTab === 'All') return userOrders
    return userOrders.filter((o) => o.status === activeTab)
  }, [userOrders, activeTab])

  const getStepIndex = (status) => {
    if (status === ORDER_STATUS.CANCELLED) return -1
    return STATUS_STEPS.indexOf(status)
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
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
    <div className="min-h-screen bg-[#0F0F10] pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <BackButton />
            <h1 className="text-2xl sm:text-3xl font-playfair-display font-bold text-white">My Orders</h1>
          </div>
          <p className="text-sm text-[#B8B8C2] mt-1">View and track all your orders.</p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          {TABS.map((tab) => {
            const count = tab === 'All' ? userOrders.length : userOrders.filter((o) => o.status === tab).length
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition flex-shrink-0 min-h-[44px] ${
                  activeTab === tab
                    ? 'bg-[#D4AF37] text-black'
                    : 'bg-[#232326] text-[#B8B8C2] hover:bg-[#2A2A2E]'
                }`}
              >
                {tab}
                <span className={`text-xs ${activeTab === tab ? 'text-black/70' : 'text-[#6B7280]'}`}>
                  ({count})
                </span>
              </button>
            )
          })}
        </div>

        {filteredOrders.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            }
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
                <div key={order.id} className="bg-[#232326] rounded-2xl shadow-lg shadow-black/20 border border-[#2D2D30] overflow-hidden">
                  <button
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    className="w-full text-left min-h-[44px]"
                  >
                    <div className="p-5 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div>
                          <p className="text-sm font-medium text-white">{order.id}</p>
                          <p className="text-xs text-[#B8B8C2] mt-0.5">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[order.status] || 'bg-[#232326] text-[#B8B8C2]'}`}>
                            {order.status}
                          </span>
                          <span className="text-sm font-semibold text-white">{formatPrice(order.totalAmount)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {order.items.slice(0, 3).map((item, i) => (
                              <div key={i} className="w-8 h-8 rounded-full border-2 border-[#232326] overflow-hidden bg-[#18181B]">
                                <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <div className="w-8 h-8 rounded-full border-2 border-[#232326] bg-[#18181B] flex items-center justify-center text-[10px] font-medium text-[#B8B8C2]">
                                +{order.items.length - 3}
                              </div>
                            )}
                          </div>
                          <span className="text-sm text-[#B8B8C2]">{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                        </div>
                        <svg
                          className={`w-5 h-5 text-[#6B7280] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </button>

                  <div
                    className={`transition-all duration-300 ${
                      isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                    } overflow-hidden`}
                  >
                    <div className="border-t border-[#2D2D30] px-5 sm:px-6 py-5 space-y-6">
                      {order.status !== ORDER_STATUS.CANCELLED && (
                        <div>
                          <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Order Progress</h4>
                          <div className="relative">
                            <div className="flex items-center justify-between">
                              {STATUS_STEPS.map((step, i) => {
                                const isCompleted = stepIndex >= i
                                const isCurrent = stepIndex === i
                                return (
                                  <div key={step} className="flex flex-col items-center relative z-10">
                                    <div
                                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                        isCompleted
                                          ? 'bg-[#D4AF37] text-black'
                                          : 'bg-[#18181B] text-[#6B7280]'
                                      } ${isCurrent ? 'ring-2 ring-[#D4AF37]/30 scale-110' : ''}`}
                                    >
                                      {isCompleted ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                      ) : (
                                        i + 1
                                      )}
                                    </div>
                                    <span className={`text-[10px] mt-1.5 whitespace-nowrap ${isCompleted ? 'text-white font-medium' : 'text-[#6B7280]'}`}>
                                      {step}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                            <div className="absolute top-4 left-4 right-4 h-0.5 bg-[#2D2D30] -z-0">
                              <div
                                className="h-full bg-[#D4AF37] transition-all duration-500"
                                style={{ width: `${Math.max(0, stepIndex) * (100 / (STATUS_STEPS.length - 1))}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {order.status === ORDER_STATUS.CANCELLED && (
                        <div className="flex items-center gap-2 px-4 py-3 bg-[#EF4444]/10 rounded-xl">
                          <svg className="w-4 h-4 text-[#EF4444] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <span className="text-sm text-[#EF4444]">This order has been cancelled.</span>
                        </div>
                      )}

                      <div>
                        <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Items</h4>
                        <div className="space-y-3">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#18181B] flex-shrink-0">
                                <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{item.name}</p>
                                <div className="flex items-center gap-2 text-xs text-[#B8B8C2] mt-0.5 flex-wrap">
                                  {item.color && <span>{item.color}</span>}
                                  {item.size && <span>Size: {item.size}</span>}
                                  <span>Qty: {item.quantity}</span>
                                </div>
                              </div>
                              <span className="text-sm font-medium text-white whitespace-nowrap">{formatPrice(item.price)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-[#2D2D30] pt-4 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-[#B8B8C2]">Subtotal</span>
                          <span className="text-sm text-white">{formatPrice(order.totalAmount)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-[#B8B8C2]">Shipping</span>
                          <span className="text-sm text-[#22C55E] font-medium">Free</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-[#2D2D30] mt-2">
                          <span className="text-sm font-semibold text-white">Total</span>
                          <span className="text-base font-bold text-white">{formatPrice(order.totalAmount)}</span>
                        </div>
                      </div>

                      <div className="border-t border-[#2D2D30] pt-4">
                        <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-2">Shipping Address</h4>
                        <p className="text-sm text-[#B8B8C2] leading-relaxed">
                          {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                          {order.shippingAddress.state} {order.shippingAddress.zip},{' '}
                          {order.shippingAddress.country}
                        </p>
                        <p className="text-xs text-[#6B7280] mt-2">Payment: {order.paymentMethod}</p>
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
