import { useState, useMemo, useEffect, Fragment } from 'react'
import { orderService } from '../../services/orderService'
import { getAssetUrl } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import { formatPrice } from '../../utils/helpers'
import BackButton from '../../components/BackButton'

const TABS = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

const statusColors = {
  Pending: 'bg-yellow-500/20 text-yellow-600',
  Processing: 'bg-blue-500/20 text-blue-400',
  Shipped: 'bg-purple-500/20 text-purple-400',
  Delivered: 'bg-green-500/20 text-green-600',
  Cancelled: 'bg-red-500/20 text-red-600',
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
  const [expandedId, setExpandedId] = useState(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const status = activeTab === 'All' ? undefined : toApiStatus(activeTab)
      const res = await orderService.getAdminOrders({ page: 0, size: 100, status })
      setOrders((res.data?.content || []).map(mapOrder))
    } catch (e) {
      showToast(e.message || 'Failed to load orders', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [activeTab])

  const filtered = useMemo(() => {
    if (!search) return orders
    const q = search.toLowerCase()
    return orders.filter((order) =>
      String(order.orderNumber).toLowerCase().includes(q) ||
      String(order.id).toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.customerEmail.toLowerCase().includes(q)
    )
  }, [orders, search])

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

  const statusCounts = useMemo(() => {
    const counts = { All: orders.length }
    TABS.filter(t => t !== 'All').forEach(tab => {
      const apiStatus = toApiStatus(tab)
      counts[tab] = orders.filter(o => o.status === tab).length
    })
    return counts
  }, [orders])

  return (
    <div className="h-full flex flex-col gap-2 py-3">
      <div className="flex items-center justify-between flex-shrink-0 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-lg font-bold text-[var(--text-primary)] font-['Playfair_Display']">Orders</h1>
        </div>
        <input
          type="text"
          placeholder="Search ID or customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-48 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#C6A972]"
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
            {tab !== 'All' && (
              <span className="ml-1 text-[10px] opacity-60">({statusCounts[tab]})</span>
            )}
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
                {filtered.map((order) => {
                  const isExpanded = expandedId === order.id
                  return (
                    <Fragment key={order.id}>
                      <tr
                        className="border-b border-[var(--border-color)]/30 hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                      >
                        <td className="py-1.5 px-2 text-[var(--text-primary)] font-mono text-[10px]">{order.orderNumber}</td>
                        <td className="py-1.5 px-2 text-[var(--text-secondary)]">{order.customerName}</td>
                        <td className="py-1.5 px-2 text-center text-[var(--text-secondary)]">{order.items.length}</td>
                        <td className="py-1.5 px-2 text-right text-[var(--text-primary)]">{formatPrice(order.totalAmount)}</td>
                        <td className="py-1.5 px-2">
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
                            {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((s) => (
                              <option key={s} value={s} className="bg-[var(--bg-card)] text-[var(--text-secondary)]">
                                {s}
                              </option>
                            ))}
                          </select>
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
                                        x{item.quantity} @ {formatPrice(item.price)}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                                <div className="flex justify-between pt-2 mt-1 border-t border-[var(--border-color)]">
                                  <span className="text-[var(--text-secondary)]">Total</span>
                                  <span className="text-[var(--text-primary)] font-semibold">{formatPrice(order.totalAmount)}</span>
                                </div>
                              </div>
                              <div>
                                <p className="text-[var(--text-secondary)] mb-1 font-medium">Customer</p>
                                <p className="text-[var(--text-primary)]">{order.customerName}</p>
                                <p className="text-[var(--text-secondary)] text-[10px]">{order.customerEmail}</p>
                                <p className="text-[var(--text-secondary)] mt-2 mb-1 font-medium">Payment</p>
                                <p className="text-[var(--text-primary)]">{order.paymentMethod || 'Not available'}</p>
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

        {!loading && filtered.length === 0 && (
          <div className="text-center py-6 text-[var(--text-secondary)] text-xs">No orders found</div>
        )}
      </div>
    </div>
  )
}
