import { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import { formatPrice } from '../../utils/helpers'
import BackButton from '../../components/BackButton'

const ranges = ['This Week', 'This Month', 'This Year']
const monthLabels = ['J','F','M','A','M','J','J','A','S','O','N','D']

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
      <div className="h-full flex flex-col gap-2 py-3">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-lg font-bold text-[var(--text-primary)] font-['Playfair_Display']">Analytics</h1>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-shrink-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[var(--bg-card)] rounded-lg p-3 border border-[var(--border-color)]/50 animate-pulse">
              <div className="h-3 w-14 bg-[var(--border-color)] rounded mb-2" />
              <div className="h-6 w-24 bg-[var(--border-color)] rounded" />
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
    <div className="h-full flex flex-col gap-2 py-3">
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-lg font-bold text-[var(--text-primary)] font-['Playfair_Display']">Analytics</h1>
        </div>
        <div className="flex gap-1">
          {ranges.map((r) => (
            <button key={r} onClick={() => setActiveRange(r)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${activeRange === r ? 'bg-[#C6A972] text-white' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>{r}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-shrink-0">
        <div className="bg-[var(--bg-card)] rounded-lg p-3 border border-[var(--border-color)]/50">
          <p className="text-[var(--text-secondary)] text-[10px] font-medium uppercase tracking-wider">Sales</p>
          <p className="text-lg font-bold text-[var(--text-primary)] mt-0.5">{formatPrice(totalRevenue)}</p>
          <div className="mt-1 w-full bg-[#2A2A2A] rounded-full h-1"><div className="bg-[#C6A972] h-1 rounded-full" style={{ width: '78%' }} /></div>
        </div>
        <div className="bg-[var(--bg-card)] rounded-lg p-3 border border-[var(--border-color)]/50">
          <p className="text-[var(--text-secondary)] text-[10px] font-medium uppercase tracking-wider">Revenue</p>
          <p className="text-lg font-bold text-[var(--text-primary)] mt-0.5">{formatPrice(totalRevenue * 0.72)}</p>
          <div className="mt-1 w-full bg-[#2A2A2A] rounded-full h-1"><div className="bg-[#2F855A] h-1 rounded-full" style={{ width: '72%' }} /></div>
        </div>
        <div className="bg-[var(--bg-card)] rounded-lg p-3 border border-[var(--border-color)]/50">
          <p className="text-[var(--text-secondary)] text-[10px] font-medium uppercase tracking-wider">Orders</p>
          <p className="text-lg font-bold text-[var(--text-primary)] mt-0.5">{totalOrders}</p>
          <div className="mt-1 w-full bg-[#2A2A2A] rounded-full h-1"><div className="bg-[#4A5568] h-1 rounded-full" style={{ width: '65%' }} /></div>
        </div>
        <div className="bg-[var(--bg-card)] rounded-lg p-3 border border-[var(--border-color)]/50">
          <p className="text-[var(--text-secondary)] text-[10px] font-medium uppercase tracking-wider">Conversion</p>
          <p className="text-lg font-bold text-[var(--text-primary)] mt-0.5">3.42%</p>
          <div className="mt-1 w-full bg-[#2A2A2A] rounded-full h-1"><div className="bg-purple-400 h-1 rounded-full" style={{ width: '34%' }} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 min-h-0">
        <div className="bg-[var(--bg-card)] rounded-lg p-3 border border-[var(--border-color)]/50 flex flex-col">
          <h3 className="text-[var(--text-primary)] text-xs font-semibold mb-1">Sales</h3>
          {monthlySalesChart.length > 0 ? (
            <>
              <div className="flex-1 flex gap-[2px]">
                {monthlySalesChart.map((item) => (
                  <div key={item.month} className="flex-1 self-stretch flex flex-col justify-end items-center">
                    <div className="w-full rounded-sm" style={{ height: `${(item.value / maxSales) * 100}%`, background: 'linear-gradient(to top, #C6A972, #f0d060)', minHeight: item.value > 0 ? '4px' : 0 }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1">{monthlySalesChart.map((m) => <span key={m.month} className="text-[8px] text-[var(--text-secondary)] flex-1 text-center">{m.month}</span>)}</div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-[var(--text-secondary)]">No data</div>
          )}
        </div>
        <div className="bg-[var(--bg-card)] rounded-lg p-3 border border-[var(--border-color)]/50 flex flex-col">
          <h3 className="text-[var(--text-primary)] text-xs font-semibold mb-1">Orders by Month</h3>
          {growthChart.length > 0 ? (
            <>
              <div className="flex-1 flex gap-[2px]">
                {growthChart.map((item) => (
                  <div key={item.month} className="flex-1 self-stretch flex flex-col justify-end items-center">
                    <div className="w-full rounded-sm" style={{ height: `${(item.value / maxGrowth) * 100}%`, background: 'linear-gradient(to top, #8B5CF6, #a78bfa)', minHeight: item.value > 0 ? '4px' : 0 }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1">{growthChart.map((m) => <span key={m.month} className="text-[8px] text-[var(--text-secondary)] flex-1 text-center">{m.month}</span>)}</div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-[var(--text-secondary)]">No data</div>
          )}
        </div>
      </div>

      <div className="bg-[var(--bg-card)] rounded-lg p-3 border border-[var(--border-color)]/50 flex-shrink-0">
        <h3 className="text-[var(--text-primary)] text-xs font-semibold mb-2">Top Products</h3>
        {topSelling.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {topSelling.map((product, i) => (
              <div key={product.productId || i} className="flex items-center gap-2">
                <span className="text-[10px] text-[var(--text-secondary)] w-4 font-medium">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--text-primary)] truncate">{product.productName}</p>
                  <p className="text-[10px] text-[var(--text-secondary)]">{product.totalQuantity} sold</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[var(--text-secondary)] py-2">No sales data yet</p>
        )}
      </div>
    </div>
  )
}
