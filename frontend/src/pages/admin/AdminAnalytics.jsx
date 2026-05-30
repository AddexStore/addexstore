import { useState } from 'react'
import { products } from '../../data/products'
import { orders } from '../../data/orders'
import { formatPrice } from '../../utils/helpers'
import BackButton from '../../components/BackButton'

const ranges = ['This Week', 'This Month', 'This Year']

const monthlySales = [
  { month: 'J', value: 45 }, { month: 'F', value: 52 }, { month: 'M', value: 68 },
  { month: 'A', value: 58 }, { month: 'M', value: 78 }, { month: 'J', value: 72 },
  { month: 'J', value: 85 }, { month: 'A', value: 92 }, { month: 'S', value: 88 },
  { month: 'O', value: 95 }, { month: 'N', value: 108 }, { month: 'D', value: 128 },
]

const customerGrowth = [
  { month: 'J', value: 120 }, { month: 'F', value: 180 }, { month: 'M', value: 250 },
  { month: 'A', value: 310 }, { month: 'M', value: 400 }, { month: 'J', value: 480 },
  { month: 'J', value: 560 }, { month: 'A', value: 650 }, { month: 'S', value: 740 },
  { month: 'O', value: 820 }, { month: 'N', value: 950 }, { month: 'D', value: 1100 },
]

const maxSales = Math.max(...monthlySales.map((m) => m.value))
const maxGrowth = Math.max(...customerGrowth.map((m) => m.value))

export default function AdminAnalytics() {
  const [activeRange, setActiveRange] = useState('This Year')

  const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0)
  const totalOrders = orders.length
  const totalProducts = products.length
  const conversionRate = 3.42

  const topProducts = [...products].sort((a, b) => (b.totalReviews || 0) - (a.totalReviews || 0)).slice(0, 5)

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
          <p className="text-lg font-bold text-[var(--text-primary)] mt-0.5">{formatPrice(totalSales)}</p>
          <div className="mt-1 w-full bg-[#2A2A2A] rounded-full h-1"><div className="bg-[#C6A972] h-1 rounded-full" style={{ width: '78%' }} /></div>
        </div>
        <div className="bg-[var(--bg-card)] rounded-lg p-3 border border-[var(--border-color)]/50">
          <p className="text-[var(--text-secondary)] text-[10px] font-medium uppercase tracking-wider">Revenue</p>
          <p className="text-lg font-bold text-[var(--text-primary)] mt-0.5">{formatPrice(totalSales * 0.72)}</p>
          <div className="mt-1 w-full bg-[#2A2A2A] rounded-full h-1"><div className="bg-[#2F855A] h-1 rounded-full" style={{ width: '72%' }} /></div>
        </div>
        <div className="bg-[var(--bg-card)] rounded-lg p-3 border border-[var(--border-color)]/50">
          <p className="text-[var(--text-secondary)] text-[10px] font-medium uppercase tracking-wider">Orders</p>
          <p className="text-lg font-bold text-[var(--text-primary)] mt-0.5">{totalOrders}</p>
          <div className="mt-1 w-full bg-[#2A2A2A] rounded-full h-1"><div className="bg-[#4A5568] h-1 rounded-full" style={{ width: '65%' }} /></div>
        </div>
        <div className="bg-[var(--bg-card)] rounded-lg p-3 border border-[var(--border-color)]/50">
          <p className="text-[var(--text-secondary)] text-[10px] font-medium uppercase tracking-wider">Conversion</p>
          <p className="text-lg font-bold text-[var(--text-primary)] mt-0.5">{conversionRate}%</p>
          <div className="mt-1 w-full bg-[#2A2A2A] rounded-full h-1"><div className="bg-purple-400 h-1 rounded-full" style={{ width: '34%' }} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 min-h-0">
        <div className="bg-[var(--bg-card)] rounded-lg p-3 border border-[var(--border-color)]/50 flex flex-col">
          <h3 className="text-[var(--text-primary)] text-xs font-semibold mb-1">Sales</h3>
          <div className="flex-1 flex gap-[2px]">
            {monthlySales.map((item) => (
              <div key={item.month} className="flex-1 self-stretch flex flex-col justify-end items-center">
                <div className="w-full rounded-sm" style={{ height: `${(item.value / maxSales) * 100}%`, background: 'linear-gradient(to top, #C6A972, #f0d060)', minHeight: item.value > 0 ? '4px' : 0 }} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">{monthlySales.map((m) => <span key={m.month} className="text-[8px] text-[var(--text-secondary)] flex-1 text-center">{m.month}</span>)}</div>
        </div>
        <div className="bg-[var(--bg-card)] rounded-lg p-3 border border-[var(--border-color)]/50 flex flex-col">
          <h3 className="text-[var(--text-primary)] text-xs font-semibold mb-1">Customer Growth</h3>
          <div className="flex-1 flex gap-[2px]">
            {customerGrowth.map((item) => (
              <div key={item.month} className="flex-1 self-stretch flex flex-col justify-end items-center">
                <div className="w-full rounded-sm" style={{ height: `${(item.value / maxGrowth) * 100}%`, background: 'linear-gradient(to top, #8B5CF6, #a78bfa)', minHeight: item.value > 0 ? '4px' : 0 }} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">{customerGrowth.map((m) => <span key={m.month} className="text-[8px] text-[var(--text-secondary)] flex-1 text-center">{m.month}</span>)}</div>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] rounded-lg p-3 border border-[var(--border-color)]/50 flex-shrink-0">
        <h3 className="text-[var(--text-primary)] text-xs font-semibold mb-2">Top Products</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {topProducts.map((product, i) => (
            <div key={product.id} className="flex items-center gap-2">
              <span className="text-[10px] text-[var(--text-secondary)] w-4 font-medium">{i + 1}</span>
              <img src={product.image} alt={product.name} className="w-6 h-6 rounded object-cover bg-[var(--bg-card)]" />
              <div className="flex-1 min-w-0"><p className="text-xs text-[var(--text-primary)] truncate">{product.name}</p><p className="text-[10px] text-[var(--text-secondary)]">{formatPrice(product.price)}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
