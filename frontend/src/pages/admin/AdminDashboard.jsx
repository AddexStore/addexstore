import { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import { formatPrice, formatDate } from '../../utils/helpers'
import { Link } from 'react-router-dom'
import BackButton from '../../components/BackButton'

const monthLabels = ['J','F','M','A','M','J','J','A','S','O','N','D']
const dayLabels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [s, a] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getAnalytics(),
        ])
        if (cancelled) return
        setStats(s)
        setAnalytics(a)
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="h-full flex flex-col gap-3 py-4">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-lg font-bold text-[var(--text-primary)] font-['Playfair_Display']">Dashboard</h1>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-[var(--bg-card)] rounded-lg px-3 py-2.5 border border-[var(--border-color)]/50 animate-pulse">
              <div className="h-3 w-16 bg-[var(--border-color)] rounded mb-2" />
              <div className="h-5 w-20 bg-[var(--border-color)] rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const statCards = stats ? [
    { label: 'Total Sales', value: formatPrice(stats.totalRevenue), change: '', changeType: 'up', link: '/admin/orders' },
    { label: 'Revenue', value: formatPrice(stats.totalRevenue), change: '', changeType: 'up', link: '/admin/orders' },
    { label: 'Users', value: stats.totalUsers.toLocaleString(), change: '', changeType: 'up', link: '/admin/users' },
    { label: 'Orders', value: stats.totalOrders.toLocaleString(), change: '', changeType: 'up', link: '/admin/orders' },
    { label: 'Products', value: stats.totalProducts.toLocaleString(), change: '', changeType: 'up', link: '/admin/products' },
    { label: 'Low Stock', value: stats.lowStockProducts.toLocaleString(), change: '', changeType: 'down', link: '/admin/inventory' },
  ] : []

  const monthlySales = analytics?.monthlyRevenue?.map((m) => ({
    month: monthLabels[(m.month || 1) - 1] || 'J',
    value: Number(m.revenue) || 0,
  })) || []

  const weeklyOrdersData = analytics?.weeklyOrders?.map((w, i) => ({
    day: dayLabels[i] || `Day ${i + 1}`,
    value: Number(w.orderCount) || 0,
  })) || []

  const maxSale = monthlySales.length > 0 ? Math.max(...monthlySales.map((m) => m.value)) : 1
  const maxOrd = weeklyOrdersData.length > 0 ? Math.max(...weeklyOrdersData.map((w) => w.value)) : 1

  const recentOrders = stats?.recentOrders || []

  const activities = [
    ...recentOrders.slice(0, 3).map((o) => ({
      text: `New order #${o.orderNumber || o.id}`,
      time: formatDate(o.createdAt),
      type: 'order',
    })),
    { text: "Classic Leather Sneakers restocked", time: "15 min ago", type: "restock" },
    { text: "Emily Park registered", time: "1 hour ago", type: "user" },
    ...(recentOrders.length > 0 ? [{
      text: `Order #${recentOrders[0].orderNumber || recentOrders[0].id} ${recentOrders[0].status?.toLowerCase()}`,
      time: formatDate(recentOrders[0].createdAt),
      type: 'status',
    }] : []),
  ]

  return (
    <div className="h-full flex flex-col gap-3 py-4">
      <div className="flex items-center gap-3">
        <BackButton />
        <h1 className="text-lg font-bold text-[var(--text-primary)] font-['Playfair_Display']">Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            to={stat.link}
            className="bg-[var(--bg-card)] rounded-lg px-3 py-2.5 border border-[var(--border-color)]/50 block"
          >
            <p className="text-[var(--text-secondary)] text-[10px] font-medium uppercase tracking-wider">{stat.label}</p>
            <p className="text-base font-bold text-[var(--text-primary)] mt-0.5">{stat.value}</p>
            {stat.change && (
              <div className={`flex items-center gap-1 mt-0.5 text-[10px] font-medium ${stat.changeType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                  {stat.changeType === 'up' ? <path d="M12 5l7 7h-5v7h-4v-7H5l7-7z" /> : <path d="M12 19l-7-7h5V5h4v7h5l-7 7z" />}
                </svg>
                <span>{stat.change}</span>
              </div>
            )}
          </Link>
        ))}
        <Link
          to="/admin/banners"
          className="bg-[var(--bg-card)] rounded-lg px-3 py-2.5 border border-[var(--border-color)]/50 block flex flex-col justify-center items-center hover:border-[#C6A972]/50 transition"
        >
          <svg className="w-5 h-5 text-[#C6A972] mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <p className="text-[var(--text-secondary)] text-[10px] font-medium">Manage Banners</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 min-h-0">
        <div className="bg-[var(--bg-card)] rounded-lg p-3 border border-[var(--border-color)]/50 flex flex-col">
          <h3 className="text-[var(--text-primary)] text-xs font-semibold mb-2">Sales</h3>
          <div className="flex-1 flex gap-[1px]">
            {monthlySales.map((item) => (
              <div key={item.month} className="flex-1 self-stretch flex flex-col justify-end items-center">
                <div className="w-full rounded-sm" style={{ height: `${(item.value / maxSale) * 100}%`, background: 'linear-gradient(to top, #C6A972, #f0d060)', minHeight: item.value > 0 ? '2px' : 0 }} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {monthlySales.map((item) => (
              <span key={item.month} className="text-[8px] text-[var(--text-secondary)] flex-1 text-center">{item.month}</span>
            ))}
          </div>
        </div>

        <div className="bg-[var(--bg-card)] rounded-lg p-3 border border-[var(--border-color)]/50 flex flex-col">
          <h3 className="text-[var(--text-primary)] text-xs font-semibold mb-2">Revenue</h3>
          <div className="flex-1 relative">
            {monthlySales.length > 0 && (
              <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C6A972" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#C6A972" stopOpacity="0.01" />
                  </linearGradient>
                </defs>
                {(() => {
                  const n = monthlySales.length
                  const maxV = maxSale || 1
                  const pts = monthlySales.map((m, i) => {
                    const x = 10 + (i / (n - 1 || 1)) * 280
                    const y = 90 - (m.value / maxV) * 75
                    return `${x},${y}`
                  }).join(' ')
                  const polyline = pts
                  const polygon = `${pts} 290,100 10,100`
                  return (
                    <>
                      <polyline points={polyline} fill="none" stroke="#C6A972" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                      <polygon points={polygon} fill="url(#revGrad)" />
                    </>
                  )
                })()}
              </svg>
            )}
          </div>
          <div className="flex justify-between mt-1">
            {monthLabels.slice(0, monthlySales.length).map((m) => (
              <span key={m} className="text-[8px] text-[var(--text-secondary)]">{m}</span>
            ))}
          </div>
        </div>

        <div className="bg-[var(--bg-card)] rounded-lg p-3 border border-[var(--border-color)]/50 flex flex-col">
          <h3 className="text-[var(--text-primary)] text-xs font-semibold mb-2">Weekly Orders</h3>
          <div className="flex-1 flex gap-[1px]">
            {weeklyOrdersData.map((item) => (
              <div key={item.day} className="flex-1 self-stretch flex flex-col justify-end items-center">
                <div className="w-full rounded-sm" style={{ height: `${(item.value / maxOrd) * 100}%`, background: 'linear-gradient(to top, #C6A972, #f0d060)', minHeight: item.value > 0 ? '2px' : 0 }} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {weeklyOrdersData.map((item) => (
              <span key={item.day} className="text-[8px] text-[var(--text-secondary)] flex-1 text-center">{item.day}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-shrink-0">
        <div className="bg-[var(--bg-card)] rounded-lg p-3 border border-[var(--border-color)]/50 overflow-hidden">
          <h3 className="text-[var(--text-primary)] text-xs font-semibold mb-2">Recent Orders</h3>
          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-[var(--text-secondary)] border-b border-[var(--border-color)]">
                    <th className="text-left py-1.5 font-medium">ID</th>
                    <th className="text-left py-1.5 font-medium">Customer</th>
                    <th className="text-left py-1.5 font-medium">Status</th>
                    <th className="text-right py-1.5 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-[var(--border-color)]/30">
                      <td className="py-1.5 text-[var(--text-primary)] font-mono text-[10px]">{order.orderNumber || order.id}</td>
                      <td className="py-1.5 text-[var(--text-secondary)]">{order.customerName || 'Unknown'}</td>
                      <td className="py-1.5">
                        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${
                          order.status === 'Delivered' ? 'bg-green-500/20 text-green-600' :
                          order.status === 'Processing' ? 'bg-blue-500/20 text-blue-400' :
                          order.status === 'Shipped' ? 'bg-purple-500/20 text-purple-400' :
                          order.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-600' :
                          'bg-red-500/20 text-red-600'
                        }`}>{order.status}</span>
                      </td>
                      <td className="py-1.5 text-right text-[var(--text-primary)]">{formatPrice(order.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-[var(--text-secondary)] py-4 text-center">No orders yet</p>
          )}
        </div>

        <div className="bg-[var(--bg-card)] rounded-lg p-3 border border-[var(--border-color)]/50">
          <h3 className="text-[var(--text-primary)] text-xs font-semibold mb-2">Activity</h3>
          <div className="space-y-1">
            {activities.map((a, i) => (
              <div key={i} className="flex items-center gap-2 py-1 border-b border-[var(--border-color)]/20 last:border-0">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                  a.type === 'order' ? 'bg-blue-500/20 text-blue-400' :
                  a.type === 'restock' ? 'bg-green-500/20 text-green-600' :
                  a.type === 'user' ? 'bg-purple-500/20 text-purple-400' :
                  a.type === 'status' ? 'bg-yellow-500/20 text-yellow-600' : 'bg-pink-500/20 text-pink-400'
                }`}>
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {a.type === 'order' && <><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></>}
                    {a.type === 'restock' && <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></>}
                    {a.type === 'user' && <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></>}
                    {a.type === 'status' && <><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></>}
                    {a.type === 'trending' && <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>}
                  </svg>
                </div>
                <p className="text-[11px] text-[var(--text-primary)] flex-1 truncate">{a.text}</p>
                <span className="text-[9px] text-[var(--text-secondary)] flex-shrink-0">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
