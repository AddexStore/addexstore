import { useState, useMemo, useEffect, Fragment } from 'react'
import { orderService } from '../../services/orderService'
import { getAssetUrl } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import { formatPrice, formatDate, getCurrencySymbol } from '../../utils/helpers'
import BackButton from '../../components/BackButton'

const PAGE_SIZE = 20

const TABS = ['All', 'Pending', 'Pending Payment', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded']

const statusColors = {
  Pending: 'bg-yellow-500/20 text-yellow-600',
  'Pending Payment': 'bg-amber-500/20 text-amber-600',
  Processing: 'bg-blue-500/20 text-blue-400',
  Shipped: 'bg-purple-500/20 text-purple-400',
  Delivered: 'bg-green-500/20 text-green-600',
  Cancelled: 'bg-red-500/20 text-red-600',
  Refunded: 'bg-gray-500/20 text-gray-400',
}

const VALID_TRANSITIONS = {
  Pending: ['Pending Payment', 'Processing', 'Cancelled'],
  'Pending Payment': ['Processing', 'Cancelled'],
  Processing: ['Shipped', 'Cancelled', 'Refunded'],
  Shipped: ['Delivered', 'Cancelled', 'Refunded'],
  Delivered: ['Refunded'],
  Cancelled: [],
  Refunded: [],
}

const toDisplayStatus = (status = '') =>
  status.toLowerCase().replace(/(^|_)([a-z])/g, (_, __, char) => char.toUpperCase())

const toApiStatus = (status = '') => status.toUpperCase().replace(/\s+/g, '_')

const mapOrder = (order) => ({
  id: order.id,
  orderNumber: order.orderNumber || `ORD-${order.id}`,
  userId: order.userId,
  customerName: order.userName || 'Unknown',
  customerEmail: order.userEmail || '',
  items: (order.items || []).map((item) => ({
    id: item.id,
    productId: item.productId,
    name: item.productName || 'Product',
    image: item.productImage || '/assets/placeholders/product.svg',
    price: Number(item.price || 0),
    quantity: item.quantity || 0,
    subtotal: Number(item.subtotal || 0),
  })),
  subtotal: Number(order.subtotal || 0),
  tax: Number(order.tax || 0),
  shippingCost: Number(order.shippingCost || 0),
  totalAmount: Number(order.totalAmount || 0),
  currency: order.currency || 'USD',
  status: toDisplayStatus(order.status || 'PENDING'),
  shippingAddress: order.shippingAddress || {},
  paymentMethod: order.paymentMethod || '',
  notes: order.notes || '',
  createdAt: order.createdAt,
})

export default function AdminOrders() {
  const { showToast } = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setPage(0)
  }, [activeTab, searchTerm])

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const status = activeTab === 'All' ? undefined : toApiStatus(activeTab)
        const res = await orderService.getAdminOrders({
          page,
          size: PAGE_SIZE,
          status,
          search: searchTerm || undefined,
        })
        const data = res.data || {}
        setOrders((data.content || []).map(mapOrder))
        setTotalPages(data.totalPages || 0)
        setTotalElements(data.totalElements || 0)
      } catch (e) {
        showToast(e.message || 'Failed to load orders', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [activeTab, searchTerm, page])

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await orderService.updateAdminOrderStatus(orderId, toApiStatus(newStatus))
      const updated = mapOrder(res.data)
      setOrders((prev) => prev.map((order) => (order.id === orderId ? updated : order)))
      showToast(`Order ${updated.orderNumber} updated to ${newStatus}`, 'success')
    } catch (e) {
      showToast(e.message || 'Failed to update order status', 'error')
    }
  }

  const renderedOrders = useMemo(() => orders, [orders])

  return (
    <div className="h-full flex flex-col gap-2 py-3">
      <div className="flex items-center justify-between flex-shrink-0 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-lg font-bold text-[var(--text-primary)] font-['Playfair_Display']">Orders</h1>
        </div>
        <input
          type="text"
          placeholder="Search order or customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-52 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#C6A972]"
        />
      </div>

      <div className="flex gap-1 flex-shrink-0 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setExpandedId(null)
              setActiveTab(tab)
            }}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              activeTab === tab
                ? 'bg-[#C6A972] text-white'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)]/50 overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#C6A972] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-auto flex-1">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--border-color)] sticky top-0 bg-[var(--bg-card)]">
                  <th className="text-left py-2 px-2 text-[var(--text-secondary)] font-medium">ID</th>
                  <th className="text-left py-2 px-2 text-[var(--text-secondary)] font-medium">Customer</th>
                  <th className="text-center py-2 px-2 text-[var(--text-secondary)] font-medium">Items</th>
                  <th className="text-right py-2 px-2 text-[var(--text-secondary)] font-medium">Total</th>
                  <th className="text-left py-2 px-2 text-[var(--text-secondary)] font-medium">Status</th>
                  <th className="text-right py-2 px-2 text-[var(--text-secondary)] font-medium w-8"></th>
                </tr>
              </thead>
              <tbody>
                {renderedOrders.map((order) => {
                  const isExpanded = expandedId === order.id
                  const transitions = VALID_TRANSITIONS[order.status] || []
                  return (
                    <Fragment key={order.id}>
                      <tr
                        className="border-b border-[var(--border-color)]/30 hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                      >
                        <td className="py-1.5 px-2 text-[var(--text-primary)] font-mono text-[10px]">{order.orderNumber}</td>
                        <td className="py-1.5 px-2 text-[var(--text-secondary)]">{order.customerName}</td>
                        <td className="py-1.5 px-2 text-center text-[var(--text-secondary)]">{order.items.length}</td>
                        <td className="py-1.5 px-2 text-right text-[var(--text-primary)]">{formatPrice(order.totalAmount, getCurrencySymbol(order.currency))}</td>
                        <td className="py-1.5 px-2">
                          {transitions.length === 0 ? (
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${statusColors[order.status] || 'bg-gray-500/20 text-gray-400'}`}>
                              {order.status}
                            </span>
                          ) : (
                            <select
                              value={order.status}
                              onChange={(e) => {
                                e.stopPropagation()
                                handleStatusChange(order.id, e.target.value)
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium border cursor-pointer focus:outline-none ${
                                statusColors[order.status] || 'bg-gray-500/20 text-gray-400'
                              }`}
                            >
                              <option value={order.status} disabled className="bg-[var(--bg-card)] text-[var(--text-secondary)]">
                                {order.status}
                              </option>
                              {transitions.map((s) => (
                                <option key={s} value={s} className="bg-[var(--bg-card)] text-[var(--text-secondary)]">
                                  {s}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td className="py-1.5 px-2 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setExpandedId(isExpanded ? null : order.id)
                            }}
                            className="p-1 rounded text-[var(--text-secondary)] hover:text-[#C6A972] transition-colors"
                          >
                            <svg
                              className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                            >
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="p-3 bg-[var(--bg-page)]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <p className="text-[var(--text-secondary)] mb-1 font-medium">Items</p>
                                {order.items.map((item) => (
                                  <div key={item.id || item.productId} className="flex items-center gap-2 py-1">
                                    <img
                                      src={getAssetUrl(item.image)}
                                      alt={item.name}
                                      onError={(e) => {
                                        e.currentTarget.src = '/assets/placeholders/product.svg'
                                      }}
                                      className="w-8 h-8 rounded object-cover bg-[var(--bg-card)]"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[var(--text-primary)] truncate">{item.name}</p>
                                      <p className="text-[var(--text-secondary)] text-[10px]">
                                        x{item.quantity} @ {formatPrice(item.price, getCurrencySymbol(order.currency))}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                                <div className="flex justify-between pt-2 mt-1 border-t border-[var(--border-color)]">
                                  <span className="text-[var(--text-secondary)]">Subtotal</span>
                                  <span className="text-[var(--text-primary)]">{formatPrice(order.subtotal, getCurrencySymbol(order.currency))}</span>
                                </div>
                                <div className="flex justify-between pt-1">
                                  <span className="text-[var(--text-secondary)]">Tax</span>
                                  <span className="text-[var(--text-primary)]">{formatPrice(order.tax, getCurrencySymbol(order.currency))}</span>
                                </div>
                                <div className="flex justify-between pt-1">
                                  <span className="text-[var(--text-secondary)]">Shipping</span>
                                  <span className="text-[var(--text-primary)]">{formatPrice(order.shippingCost, getCurrencySymbol(order.currency))}</span>
                                </div>
                                <div className="flex justify-between pt-2 mt-1 border-t border-[var(--border-color)]">
                                  <span className="text-[var(--text-secondary)]">Total</span>
                                  <span className="text-[var(--text-primary)] font-semibold">{formatPrice(order.totalAmount, getCurrencySymbol(order.currency))}</span>
                                </div>
                              </div>
                              <div>
                                <p className="text-[var(--text-secondary)] mb-1 font-medium">Customer</p>
                                <p className="text-[var(--text-primary)]">{order.customerName}</p>
                                <p className="text-[var(--text-secondary)] text-[10px]">{order.customerEmail}</p>
                                <p className="text-[var(--text-secondary)] mt-2 mb-1 font-medium">Payment</p>
                                <p className="text-[var(--text-primary)]">{order.paymentMethod || 'Not available'}</p>
                                <p className="text-[var(--text-secondary)] mt-2 mb-1 font-medium">Placed</p>
                                <p className="text-[var(--text-primary)] text-[10px]">{formatDate(order.createdAt)}</p>
                                <p className="text-[var(--text-secondary)] mt-2 mb-1 font-medium">Shipping</p>
                                <p className="text-[var(--text-primary)]">{order.shippingAddress.street || 'Not available'}</p>
                                <p className="text-[var(--text-secondary)] text-[10px]">
                                  {[order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.zip, order.shippingAddress.country].filter(Boolean).join(', ')}
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && renderedOrders.length === 0 && (
          <div className="text-center py-6 text-[var(--text-secondary)] text-xs">No orders found</div>
        )}

        {!loading && totalPages > 0 && (
          <div className="flex-shrink-0 flex items-center justify-between px-3 py-2 border-t border-[var(--border-color)]">
            <span className="text-[10px] text-[var(--text-secondary)]">
              {totalElements} order{totalElements === 1 ? '' : 's'}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-2 py-1 rounded text-[10px] font-medium bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-[10px] text-[var(--text-secondary)]">
                Page {page + 1} of {Math.max(1, totalPages)}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-2 py-1 rounded text-[10px] font-medium bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
