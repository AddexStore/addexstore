import { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminService } from '../../services/adminService'
import { formatPrice, formatDate } from '../../utils/helpers'
import { colors } from '../../constants/theme'
import StatusBadge from '../../components/ui/StatusBadge'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import PageHeader from '../../components/ui/PageHeader'

function StatCard({ label, value, change, link }) {
  const hasChange = Number.isFinite(change)
  const direction = hasChange ? (change > 0 ? 'up' : change < 0 ? 'down' : 'flat') : null
  const trendColor = direction === 'up' ? 'text-success' : direction === 'down' ? 'text-danger' : 'text-sub'

  const content = (
    <div className="h-full rounded-card border border-line bg-surface px-4 py-3.5 shadow-sm transition-colors hover:border-gold-500/40">
      <p className="text-[11px] font-medium uppercase tracking-wider text-sub">{label}</p>
      <p className="mt-1 text-xl font-bold leading-tight text-ink">{value}</p>
      {hasChange && (
        <p className={`mt-1 flex items-center gap-1 text-[11px] font-medium ${trendColor}`}>
          <Icon name={direction === 'up' ? 'ArrowUp' : direction === 'down' ? 'ArrowDown' : 'Minus'} size={12} />
          <span>{Math.abs(change).toFixed(1)}%</span>
          <span className="font-normal text-sub">vs 30d</span>
        </p>
      )}
    </div>
  )

  if (!link) return content
  return (
    <Link to={link} className="block h-full rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500">
      {content}
    </Link>
  )
}

function Card({ title, action, children }) {
  return (
    <section className="flex flex-col rounded-card border border-line bg-surface p-4 shadow-sm min-h-0">
      <header className="mb-3 flex flex-shrink-0 items-center justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-ink">{title}</h2>
        {action}
      </header>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </section>
  )
}

function RevenueChart({ data }) {
  const gradientId = useId().replace(/:/g, '')
  const gold = colors.chart.gold
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
              <stop offset="0%" stopColor={gold} stopOpacity="0.25" />
              <stop offset="100%" stopColor={gold} stopOpacity="0.01" />
            </linearGradient>
          </defs>
          <polyline points={geometry.line} fill="none" stroke={gold} strokeWidth="2" vectorEffect="non-scaling-stroke" />
          <polygon points={geometry.area} fill={`url(#${gradientId})`} />
        </svg>
      </div>
      <div className="mt-1 flex justify-between">
        {labels.map((label) => (
          <span key={label} className="flex-1 text-center text-[10px] text-sub">
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
            <span className="mb-1 text-[10px] text-sub">{d.orderCount}</span>
            <div
              className="w-full rounded-t-sm"
              style={{
                height: `${((Number(d.orderCount) || 0) / max) * 100}%`,
                minHeight: d.orderCount > 0 ? '4px' : '2px',
                background: `linear-gradient(to top, ${colors.chart.gold}, ${colors.gold[300]})`,
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-1.5">
        {data.map((d) => (
          <span key={d.label} className="flex-1 text-center text-[10px] text-sub">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  )
}

function TopProducts({ data }) {
  if (!data.length) {
    return <p className="py-6 text-center text-xs text-sub">No sales data yet</p>
  }
  return (
    <ol className="flex flex-1 flex-col justify-center gap-2.5">
      {data.map((p, i) => (
        <li key={p.productId} className="flex items-center gap-2.5">
          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-subtle text-[10px] font-semibold text-sub">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <p className="truncate text-xs font-medium text-ink">{p.productName}</p>
              <span className="whitespace-nowrap text-[10px] text-sub">{p.totalQuantity} sold</span>
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}

function ActivityFeed({ items }) {
  if (!items.length) {
    return <p className="py-6 text-center text-xs text-sub">No recent activity</p>
  }
  return (
    <ul className="space-y-0.5">
      {items.map((item) => {
        const isUser = item.type === 'user'
        return (
          <li key={`${item.type}-${item.id}`} className="flex items-center gap-2 border-b border-line/30 py-1.5 last:border-0">
            <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${isUser ? 'bg-chart-purple/15 text-chart-purple' : 'bg-info/12 text-info'}`}>
              <Icon name={isUser ? 'User' : 'ShoppingCart'} size={12} />
            </span>
            <p className="min-w-0 flex-1 truncate text-xs text-ink">{item.text}</p>
            <time className="whitespace-nowrap text-[10px] text-sub">{formatDate(item.createdAt)}</time>
          </li>
        )
      })}
    </ul>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-card border border-line bg-surface px-4 py-3.5 animate-pulse">
      <div className="mb-2 h-3 w-16 rounded bg-line" />
      <div className="h-5 w-20 rounded bg-line" />
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex h-full flex-col gap-3 py-4">
      <div className="flex items-center gap-3">
        <h1 className="heading-display text-2xl text-ink">Dashboard</h1>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-card border border-line bg-surface" />
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
    <div className="flex h-full flex-col gap-4 py-4">
      <PageHeader
        title="Dashboard"
        description="Overview of your store's performance and recent activity."
        actions={
          <>
            {lastUpdated && (
              <span className="hidden text-[11px] text-sub sm:inline">
                Updated {formatDate(lastUpdated)}
              </span>
            )}
            <Button
              variant="ghost"
              size="iconSm"
              icon="RefreshCw"
              onClick={load}
              aria-label="Refresh dashboard"
              title="Refresh dashboard"
            />
          </>
        }
      />

      {error && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-card border border-danger/30 bg-danger/8 px-4 py-6 text-center">
          <p className="text-sm font-medium text-ink">Failed to load dashboard data</p>
          <p className="max-w-md text-xs text-sub">{error}</p>
          <Button size="sm" icon="RefreshCw" className="mt-1" onClick={load}>
            Retry
          </Button>
        </div>
      )}

      {data && (
        <>
          <div className="grid flex-shrink-0 grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {statCards.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-3">
            <Card title="Revenue" action={<span className="text-[10px] text-sub">Last 12 months</span>}>
              {hasRevenue ? <RevenueChart data={revenueSeries} /> : <p className="flex flex-1 items-center justify-center text-xs text-sub">No revenue recorded yet</p>}
            </Card>
            <Card title="Orders" action={<span className="text-[10px] text-sub">Last 7 days</span>}>
              {hasOrders ? <OrdersBarChart data={dailyOrders} /> : <p className="flex flex-1 items-center justify-center text-xs text-sub">No orders placed yet</p>}
            </Card>
            <Card title="Top Products" action={<span className="text-[10px] text-sub">By units sold</span>}>
              <TopProducts data={topProducts} />
            </Card>
          </div>

          <div className="grid flex-shrink-0 grid-cols-1 gap-4 lg:grid-cols-2">
            <Card title="Recent Orders" action={<Link to="/admin/orders" className="text-[11px] font-medium text-gold-600 hover:text-gold-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 rounded">View all</Link>}>
              {recentOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-line text-left text-[11px] text-sub">
                        <th scope="col" className="py-1.5 pr-2 font-medium">Order</th>
                        <th scope="col" className="py-1.5 pr-2 font-medium">Customer</th>
                        <th scope="col" className="py-1.5 pr-2 font-medium">Status</th>
                        <th scope="col" className="py-1.5 text-right font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="border-b border-line/30 last:border-0">
                          <td className="py-2 pr-2 font-mono text-[11px] text-ink">{order.orderNumber || order.id}</td>
                          <td className="py-2 pr-2 text-sub">{order.customerName || 'Guest'}</td>
                          <td className="py-2 pr-2">
                            <StatusBadge status={order.status} />
                          </td>
                          <td className="py-2 text-right font-medium text-ink">{formatPrice(order.totalAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="py-6 text-center text-xs text-sub">No orders yet</p>
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
