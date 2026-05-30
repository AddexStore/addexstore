import { useState, useMemo } from 'react'
import { orders as initialOrders } from '../../data/orders'
import { users } from '../../data/users'
import { useToast } from '../../context/ToastContext'
import { formatPrice, formatDate } from '../../utils/helpers'
import BackButton from '../../components/BackButton'

const TABS = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

const statusColors = {
  Pending: 'bg-yellow-500/20 text-yellow-600', Processing: 'bg-blue-500/20 text-blue-400',
  Shipped: 'bg-purple-500/20 text-purple-400', Delivered: 'bg-green-500/20 text-green-600',
  Cancelled: 'bg-red-500/20 text-red-600',
}

export default function AdminOrders() {
  const { showToast } = useToast()
  const [orders, setOrders] = useState(initialOrders)
  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  const filtered = useMemo(() => {
    let result = orders
    if (activeTab !== 'All') result = result.filter((o) => o.status === activeTab)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((o) => {
        const user = users.find((u) => u.id === o.userId)
        return o.id.toLowerCase().includes(q) || user?.name.toLowerCase().includes(q)
      })
    }
    return result
  }, [orders, activeTab, search])

  const handleStatusChange = (orderId, newStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o)))
    showToast(`Order ${orderId} → ${newStatus}`, 'success')
  }

  return (
    <div className="h-full flex flex-col gap-2 py-3">
      <div className="flex items-center justify-between flex-shrink-0 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-lg font-bold text-[var(--text-primary)] font-['Playfair_Display']">Orders</h1>
        </div>
        <input type="text" placeholder="Search ID or customer..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-48 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#C6A972]" />
      </div>

      <div className="flex gap-1 flex-shrink-0 flex-wrap">
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${activeTab === tab ? 'bg-[#C6A972] text-white' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
            {tab}
            {tab !== 'All' && <span className="ml-1 text-[10px] opacity-60">({orders.filter((o) => o.status === tab).length})</span>}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)]/50 overflow-hidden flex flex-col">
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
                const user = users.find((u) => u.id === order.userId)
                const isExpanded = expandedId === order.id
                return (
                  <tr key={order.id} className="border-b border-[var(--border-color)]/30 hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}>
                    <td className="py-1.5 px-2 text-[var(--text-primary)] font-mono text-[10px]">{order.id}</td>
                    <td className="py-1.5 px-2 text-[var(--text-secondary)]">{user?.name || 'Unknown'}</td>
                    <td className="py-1.5 px-2 text-center text-[var(--text-secondary)]">{order.items.length}</td>
                    <td className="py-1.5 px-2 text-right text-[var(--text-primary)]">{formatPrice(order.totalAmount)}</td>
                    <td className="py-1.5 px-2">
                      <select value={order.status} onChange={(e) => { e.stopPropagation(); handleStatusChange(order.id, e.target.value) }}
                        onClick={(e) => e.stopPropagation()}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium border cursor-pointer focus:outline-none ${statusColors[order.status] || 'bg-gray-500/20 text-gray-400'}`}>
                        {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((s) => (
                          <option key={s} value={s} className="bg-[var(--bg-card)] text-[var(--text-secondary)]">{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-1.5 px-2 text-right">
                      <button onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : order.id) }}
                        className="p-1 rounded text-[var(--text-secondary)] hover:text-[#C6A972] transition-colors">
                        <svg className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="text-center py-6 text-[var(--text-secondary)] text-xs">No orders found</div>}

        {expandedId && (() => {
          const order = orders.find((o) => o.id === expandedId)
          if (!order) return null
          const user = users.find((u) => u.id === order.userId)
          return (
            <div className="border-t border-[var(--border-color)]/50 p-3 text-xs flex-shrink-0 max-h-48 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[var(--text-secondary)] mb-1 font-medium">Items</p>
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 py-1">
                      <img src={item.image} alt={item.name} className="w-8 h-8 rounded object-cover bg-[var(--bg-card)]" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[var(--text-primary)] truncate">{item.name}</p>
                        <p className="text-[var(--text-secondary)] text-[10px]">x{item.quantity} @ {formatPrice(item.price)}</p>
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
                  <p className="text-[var(--text-primary)]">{user?.name}</p>
                  <p className="text-[var(--text-secondary)] text-[10px]">{user?.email}</p>
                  <p className="text-[var(--text-secondary)] mt-2 mb-1 font-medium">Shipping</p>
                  <p className="text-[var(--text-primary)]">{order.shippingAddress.street}</p>
                  <p className="text-[var(--text-secondary)] text-[10px]">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                </div>
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
