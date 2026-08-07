import { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import { formatPrice } from '../../utils/helpers'
import { colors } from '../../constants/theme'
import PageHeader from '../../components/ui/PageHeader'
import Tabs from '../../components/ui/Tabs'

const ranges = ['This Week', 'This Month', 'This Year']
const monthLabels = ['J','F','M','A','M','J','J','A','S','O','N','D']

function StatCard({ label, value, progress, barClass }) {
  return (
    <div className="rounded-card border border-line bg-surface px-4 py-3.5 shadow-sm transition-colors hover:border-gold-500/40">
      <p className="text-[11px] font-medium uppercase tracking-wider text-sub">{label}</p>
      <p className="mt-1 text-xl font-bold leading-tight text-ink">{value}</p>
      <div className="mt-2 h-1 w-full rounded-full bg-subtle">
        <div className={`h-1 rounded-full ${barClass}`} style={{ width: progress }} />
      </div>
    </div>
  )
}

function Card({ title, children }) {
  return (
    <section className="flex flex-col rounded-card border border-line bg-surface p-4 shadow-sm min-h-0">
      <h2 className="mb-3 flex-shrink-0 text-xs font-semibold uppercase tracking-wider text-ink">{title}</h2>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </section>
  )
}

function BarChart({ data, max, gradient }) {
  if (!data.length) {
    return <p className="flex flex-1 items-center justify-center text-xs text-sub">No data</p>
  }
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 items-end gap-1.5">
        {data.map((item) => (
          <div key={item.month} className="flex min-w-0 flex-1 flex-col items-center justify-end self-stretch">
            <div
              className="w-full rounded-t-sm"
              style={{
                height: `${(item.value / max) * 100}%`,
                minHeight: item.value > 0 ? '4px' : 0,
                background: gradient,
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-1.5">
        {data.map((m) => (
          <span key={m.month} className="flex-1 text-center text-[10px] text-sub">
            {m.month}
          </span>
        ))}
      </div>
    </div>
  )
}

function TopProducts({ data }) {
  if (!data.length) {
    return <p className="py-4 text-center text-xs text-sub">No sales data yet</p>
  }
  return (
    <ol className="flex flex-col justify-center gap-2.5">
      {data.map((p, i) => (
        <li key={p.productId || i} className="flex items-center gap-2.5">
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

export default function AdminAnalytics() {
  const [activeRange, setActiveRange] = useState('This Year')
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const a = await adminService.getAnalytics()
        if (!cancelled) setAnalytics(a)
      } catch (err) {
        console.error('Failed to load analytics:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="flex h-full flex-col gap-4 py-4">
        <h1 className="heading-display text-2xl text-ink">Analytics</h1>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-card border border-line bg-surface px-4 py-3.5">
              <div className="mb-2 h-3 w-16 rounded bg-line" />
              <div className="h-5 w-20 rounded bg-line" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const monthlyRevenue = analytics?.monthlyRevenue || []
  const weeklyOrders = analytics?.weeklyOrders || []
  const topSelling = analytics?.topSellingProducts || []

  const totalRevenue = monthlyRevenue.reduce((sum, m) => sum + Number(m.revenue || 0), 0)
  const totalOrders = weeklyOrders.reduce((sum, w) => sum + Number(w.orderCount || 0), 0)

  const monthlySalesChart = monthlyRevenue.map((m) => ({
    month: monthLabels[(m.month || 1) - 1] || 'J',
    value: Number(m.revenue) || 0,
  }))

  const growthChart = monthlyRevenue.map((m) => ({
    month: monthLabels[(m.month || 1) - 1] || 'J',
    value: Number(m.orderCount) || 0,
  }))

  const maxSales = monthlySalesChart.length > 0 ? Math.max(...monthlySalesChart.map((m) => m.value)) : 1
  const maxGrowth = growthChart.length > 0 ? Math.max(...growthChart.map((m) => m.value)) : 1

  return (
    <div className="flex h-full flex-col gap-4 py-4">
      <PageHeader
        title="Analytics"
        description="Revenue, orders, and top-selling products across your store."
      />

      <div className="flex-shrink-0">
        <Tabs tabs={ranges.map((r) => ({ key: r, label: r }))} activeKey={activeRange} onChange={setActiveRange} />
      </div>

      <div className="grid flex-shrink-0 grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Sales" value={formatPrice(totalRevenue)} progress="78%" barClass="bg-gold-500" />
        <StatCard label="Revenue" value={formatPrice(totalRevenue * 0.72)} progress="72%" barClass="bg-success" />
        <StatCard label="Orders" value={totalOrders} progress="65%" barClass="bg-info" />
        <StatCard label="Conversion" value="3.42%" progress="34%" barClass="bg-chart-purple" />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
        <Card title="Sales">
          <BarChart
            data={monthlySalesChart}
            max={maxSales}
            gradient={`linear-gradient(to top, ${colors.chart.gold}, ${colors.gold[300]})`}
          />
        </Card>
        <Card title="Orders by Month">
          <BarChart
            data={growthChart}
            max={maxGrowth}
            gradient={`linear-gradient(to top, ${colors.chart.purple}, ${colors.chart.purple}59)`}
          />
        </Card>
      </div>

      <div className="flex-shrink-0">
        <Card title="Top Products">
          <TopProducts data={topSelling} />
        </Card>
      </div>
    </div>
  )
}
