import { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminService } from '../../services/adminService'
import { formatPrice, formatDate } from '../../utils/helpers'
import BackButton from '../../components/BackButton'

const STATUS_STYLES = {
  PENDING: 'bg-yellow-500/20 text-yellow-600',
  PENDING_PAYMENT: 'bg-orange-500/20 text-orange-600',
  PROCESSING: 'bg-blue-500/20 text-blue-400',
  SHIPPED: 'bg-purple-500/20 text-purple-400',
  DELIVERED: 'bg-green-500/20 text-green-600',
  CANCELLED: 'bg-red-500/20 text-red-600',
  REFUNDED: 'bg-gray-500/20 text-gray-500',
}

function StatusBadge({ status }) {
  const normalized = (status || '').toUpperCase()
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded-full text-[10px] font-medium ${STATUS_STYLES[normalized] || 'bg-gray-500/20 text-gray-500'}`}>
      {normalized.replace('_', ' ')}
    </span>
  )
}

function TrendArrow({ direction }) {
  if (direction === 'up') {
    return (
      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 5l7 7h-5v7h-4v-7H5l7-7z" />
      </svg>
    )
  }
  if (direction === 'down') {
    return (
      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 19l-7-7h5V5h4v7h5l-7 7z" />
      </svg>
    )
  }
  return (
    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M5 12h14v2H5z" />
    </svg>
  )
}

function StatCard({ label, value, change, link }) {
  const hasChange = Number.isFinite(change)
  const direction = hasChange ? (change > 0 ? 'up' : change < 0 ? 'down' : 'flat') : null
  const trendColor = direction === 'up' ? 'text-green-600' : direction === 'down' ? 'text-red-600' : 'text-[var(--text-secondary)]'

  const content = (
    <div className="h-full rounded-lg border border-[var(--border-color)]/50 bg-[var(--bg-card)] px-3 py-2.5 transition-colors hover:border-[#C6A972]/40">
      <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-secondary)]">{label}</p>
      <p className="mt-1 text-lg font-bold text-[var(--text-primary)] leading-tight">{value}</p>
      {hasChange && (
        <p className={`mt-0.5 flex items-center gap-1 text-[11px] font-medium ${trendColor}`}>
          <TrendArrow direction={direction} />
          <span>{Math.abs(change).toFixed(1)}%</span>
          <span className="font-normal text-[var(--text-secondary)]">vs 30d</span>
        </p>
      )}
    </div>
  )

  if (!link) return content
  return (
    <Link to={link} className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A972]">
      {content}
    </Link>
  )
}

function Card({ title, action, children }) {
  return (
    <section className="flex flex-col rounded-lg border border-[var(--border-color)]/50 bg-[var(--bg-card)] p-3 min-h-0">
      <header className="mb-2 flex flex-shrink-0 items-center justify-between gap-2">
        <h2 className="text-xs font-semibold text-[var(--text-primary)]">{title}</h2>
        {action}
      </header>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </section>
  )
}

function RevenueChart({ data }) {
  const gradientId = useId().replace(/:/g, '')
  const geometry = useMemo(() => {
    const W = 320
    const H = 120
    const padX = 8
    const padTop = 8
    const padBottom = 8
    const max = Math.max(...data.map((d) => Number(d.revenue) || 0), 1)
    const n = Math.max(data.length, 2)
    const step = (W - padX * 2) / (n - 1)
    const pts = data.map((d, i) => {
      const x = padX + i * step
      const y = H - padBottom - ((Number(d.revenue) || 0) / max) * (H - padTop - padBottom)
      return `${x},${y}`
    })
    return {
      line: pts.join(' '),
      area: `${pts.join(' ')} ${W - padX},${H - padBottom} ${padX},${H - padBottom}`,
    }
  }, [data])

  const labels = useMemo(() => data.map((d) => d.label), [data])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-[120px] flex-1">
        <svg
          className="h-full w-full"
          viewBox="0 0 320 120"
          preserveAspectRatio="none"
          role="img"
          aria-label="Revenue by month, last 12 months"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C6A972" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#C6A972" stopOpacity="0.01" />
            </linearGradient>
          </defs>
          <polyline points={geometry.line} fill="none" stroke="#C6A972" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          <polygon points={geometry.area} fill={`url(#${gradientId})`} />
        </svg>
      </div>
      <div className="mt-1 flex justify-between">
        {labels.map((label) => (
          <span key={label} className="flex-1 text-center text-[10px] text-[var(--text-secondary)]">
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

function OrdersBarChart({ data }) {
  const max = useMemo(() => Math.max(...data.map((d) => Number(d.orderCount) || 0), 1), [data])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 items-end gap-1.5" role="img" aria-label="Orders placed in the last 7 days">
        {data.map((d) => (
          <div key={d.label} className="flex min-w-0 flex-1 flex-col items-center justify-end self-stretch">
            <span className="mb-1 text-[10px] text-[var(--text-secondary)]">{d.orderCount}</span>
            <div
              className="w-full rounded-t-sm"
              style={{
                height: `${((Number(d.orderCount) || 0) / max) * 100}%`,
                minHeight: d.orderCount > 0 ? '4px' : '2px',
                background: 'linear-gradient(to top, #C6A972, #f0d060)',
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-1.5">
        {data.map((d) => (
          <span key={d.label} className="flex-1 text-center text-[10px] text-[var(--text-secondary)]">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  )
}

function TopProducts({ data }) {
  if (!data.length) {
    return <p className="py-6 text-center text-xs text-[var(--text-secondary)]">No sales data yet</p>
  }
  return (
    <ol className="flex flex-1 flex-col justify-center gap-2.5">
      {data.map((p, i) => (
        <li key={p.productId} className="flex items-center gap-2.5">
          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--bg-hover)] text-[10px] font-semibold text-[var(--text-secondary)]">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <p className="truncate text-xs font-medium text-[var(--text-primary)]">{p.productName}</p>
              <span className="whitespace-nowrap text-[10px] text-[var(--text-secondary)]">{p.totalQuantity} sold</span>
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}

function ActivityFeed({ items }) {
  if (!items.length) {
    return <p className="py-6 text-center text-xs text-[var(--text-secondary)]">No recent activity</p>
  }
  return (
    <ul className="space-y-0.5">
      {items.map((item) => {
        const isUser = item.type === 'user'
        return (
          <li key={`${item.type}-${item.id}`} className="flex items-center gap-2 border-b border-[var(--border-color)]/20 py-1.5 last:border-0">
            <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${isUser ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {isUser ? (
                  <>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </>
                ) : (
                  <>
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </>
                )}
              </svg>
            </span>
            <p className="min-w-0 flex-1 truncate text-xs text-[var(--text-primary)]">{item.text}</p>
            <time className="whitespace-nowrap text-[10px] text-[var(--text-secondary)]">{formatDate(item.createdAt)}</time>
          </li>
        )
      })}
    </ul>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-lg border border-[var(--border-color)]/50 bg-[var(--bg-card)] px-3 py-2.5 animate-pulse">
      <div className="mb-2 h-3 w-16 rounded bg-[var(--border-color)]" />
      <div className="h-5 w-20 rounded bg-[var(--border-color)]" />
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex h-full flex-col gap-3 py-4">
      <div className="flex items-center gap-3">
        <BackButton />
        <h1 className="text-lg font-bold text-[var(--text-primary)] font-['Playfair_Display']">Dashboard</h1>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-lg border border-[var(--border-color)]/50 bg-[var(--bg-card)]" />
        ))}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await adminService.getDashboardOverview()
      setData(result)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err?.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const summary = data?.summary || {}
  const revenueSeries = data?.revenueSeries || []
  const dailyOrders = data?.dailyOrders || []
  const topProducts = data?.topProducts || []
  const recentOrders = data?.recentOrders || []
  const recentActivity = data?.recentActivity || []

  const hasRevenue = useMemo(() => revenueSeries.some((p) => Number(p.revenue) > 0), [revenueSeries])
  const hasOrders = useMemo(() => dailyOrders.some((d) => Number(d.orderCount) > 0), [dailyOrders])

  const statCards = [
    { label: 'Total Revenue', value: formatPrice(summary.totalRevenue), change: summary.revenueChange, link: '/admin/orders' },
    { label: 'Orders', value: (summary.totalOrders ?? 0).toLocaleString(), change: summary.ordersChange, link: '/admin/orders' },
    { label: 'Customers', value: (summary.totalUsers ?? 0).toLocaleString(), change: summary.usersChange, link: '/admin/users' },
    { label: 'Open Orders', value: (summary.pendingOrders ?? 0).toLocaleString(), change: null, link: '/admin/orders' },
    { label: 'Products', value: (summary.totalProducts ?? 0).toLocaleString(), change: null, link: '/admin/products' },
    { label: 'Low Stock', value: (summary.lowStockProducts ?? 0).toLocaleString(), change: null, link: '/admin/inventory' },
  ]

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="flex h-full flex-col gap-3 py-4">
      <div className="flex flex-shrink-0 items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-lg font-bold text-[var(--text-primary)] font-['Playfair_Display']">Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="hidden text-[11px] text-[var(--text-secondary)] sm:inline">
              Updated {formatDate(lastUpdated)}
            </span>
          )}
          <button
            onClick={load}
            className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] p-2 text-[var(--text-secondary)] transition-colors hover:border-[#C6A972]/50 hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A972]"
            aria-label="Refresh dashboard"
            title="Refresh dashboard"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex flex-shrink-0 flex-col items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-6 text-center">
          <p className="text-sm font-medium text-[var(--text-primary)]">Failed to load dashboard data</p>
          <p className="max-w-md text-xs text-[var(--text-secondary)]">{error}</p>
          <button
            onClick={load}
            className="mt-1 rounded-lg bg-[#C6A972] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#B8965F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A972]"
          >
            Retry
          </button>
        </div>
      )}

      {data && (
        <>
          <div className="grid flex-shrink-0 grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
            {statCards.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-3">
            <Card title="Revenue" action={<span className="text-[10px] text-[var(--text-secondary)]">Last 12 months</span>}>
              {hasRevenue ? <RevenueChart data={revenueSeries} /> : <p className="flex flex-1 items-center justify-center text-xs text-[var(--text-secondary)]">No revenue recorded yet</p>}
            </Card>
            <Card title="Orders" action={<span className="text-[10px] text-[var(--text-secondary)]">Last 7 days</span>}>
              {hasOrders ? <OrdersBarChart data={dailyOrders} /> : <p className="flex flex-1 items-center justify-center text-xs text-[var(--text-secondary)]">No orders placed yet</p>}
            </Card>
            <Card title="Top Products" action={<span className="text-[10px] text-[var(--text-secondary)]">By units sold</span>}>
              <TopProducts data={topProducts} />
            </Card>
          </div>

          <div className="grid flex-shrink-0 grid-cols-1 gap-3 lg:grid-cols-2">
            <Card title="Recent Orders" action={<Link to="/admin/orders" className="text-[11px] font-medium text-[#C6A972] hover:text-[#B8965F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A972] rounded">View all</Link>}>
              {recentOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[var(--border-color)] text-left text-[11px] text-[var(--text-secondary)]">
                        <th scope="col" className="py-1.5 pr-2 font-medium">Order</th>
                        <th scope="col" className="py-1.5 pr-2 font-medium">Customer</th>
                        <th scope="col" className="py-1.5 pr-2 font-medium">Status</th>
                        <th scope="col" className="py-1.5 text-right font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="border-b border-[var(--border-color)]/30 last:border-0">
                          <td className="py-2 pr-2 font-mono text-[11px] text-[var(--text-primary)]">{order.orderNumber || order.id}</td>
                          <td className="py-2 pr-2 text-[var(--text-secondary)]">{order.customerName || 'Guest'}</td>
                          <td className="py-2 pr-2">
                            <StatusBadge status={order.status} />
                          </td>
                          <td className="py-2 text-right font-medium text-[var(--text-primary)]">{formatPrice(order.totalAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="py-6 text-center text-xs text-[var(--text-secondary)]">No orders yet</p>
              )}
            </Card>

            <Card title="Recent Activity">
              <ActivityFeed items={recentActivity} />
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
