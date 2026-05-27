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
          <h1 className="text-lg font-bold text-white font-['Playfair_Display']">Analytics</h1>
        </div>
        <div className="flex gap-1">
          {ranges.map((r) => (
            <button key={r} onClick={() => setActiveRange(r)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${activeRange === r ? 'bg-[#D4AF37] text-black' : 'bg-[#232326] text-[#B8B8C2] hover:text-white'}`}>{r}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-shrink-0">
        <div className="bg-[#232326] rounded-lg p-3 border border-[#2D2D30]/50">
          <p className="text-[#6B7280] text-[10px] font-medium uppercase tracking-wider">Sales</p>
          <p className="text-lg font-bold text-white mt-0.5">{formatPrice(totalSales)}</p>
          <div className="mt-1 w-full bg-[#2D2D30] rounded-full h-1"><div className="bg-[#D4AF37] h-1 rounded-full" style={{ width: '78%' }} /></div>
        </div>
        <div className="bg-[#232326] rounded-lg p-3 border border-[#2D2D30]/50">
          <p className="text-[#6B7280] text-[10px] font-medium uppercase tracking-wider">Revenue</p>
          <p className="text-lg font-bold text-white mt-0.5">{formatPrice(totalSales * 0.72)}</p>
          <div className="mt-1 w-full bg-[#2D2D30] rounded-full h-1"><div className="bg-green-400 h-1 rounded-full" style={{ width: '72%' }} /></div>
        </div>
        <div className="bg-[#232326] rounded-lg p-3 border border-[#2D2D30]/50">
          <p className="text-[#6B7280] text-[10px] font-medium uppercase tracking-wider">Orders</p>
          <p className="text-lg font-bold text-white mt-0.5">{totalOrders}</p>
          <div className="mt-1 w-full bg-[#2D2D30] rounded-full h-1"><div className="bg-blue-400 h-1 rounded-full" style={{ width: '65%' }} /></div>
        </div>
        <div className="bg-[#232326] rounded-lg p-3 border border-[#2D2D30]/50">
          <p className="text-[#6B7280] text-[10px] font-medium uppercase tracking-wider">Conversion</p>
          <p className="text-lg font-bold text-white mt-0.5">{conversionRate}%</p>
          <div className="mt-1 w-full bg-[#2D2D30] rounded-full h-1"><div className="bg-purple-400 h-1 rounded-full" style={{ width: '34%' }} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 min-h-0">
        <div className="bg-[#232326] rounded-lg p-3 border border-[#2D2D30]/50 flex flex-col">
          <h3 className="text-white text-xs font-semibold mb-1">Sales</h3>
          <div className="flex-1 flex gap-[2px]">
            {monthlySales.map((item) => (
              <div key={item.month} className="flex-1 self-stretch flex flex-col justify-end items-center">
                <div className="w-full rounded-sm" style={{ height: `${(item.value / maxSales) * 100}%`, background: 'linear-gradient(to top, #D4AF37, #f0d060)', minHeight: item.value > 0 ? '4px' : 0 }} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">{monthlySales.map((m) => <span key={m.month} className="text-[8px] text-[#6B7280] flex-1 text-center">{m.month}</span>)}</div>
        </div>
        <div className="bg-[#232326] rounded-lg p-3 border border-[#2D2D30]/50 flex flex-col">
          <h3 className="text-white text-xs font-semibold mb-1">Customer Growth</h3>
          <div className="flex-1 flex gap-[2px]">
            {customerGrowth.map((item) => (
              <div key={item.month} className="flex-1 self-stretch flex flex-col justify-end items-center">
                <div className="w-full rounded-sm" style={{ height: `${(item.value / maxGrowth) * 100}%`, background: 'linear-gradient(to top, #8B5CF6, #a78bfa)', minHeight: item.value > 0 ? '4px' : 0 }} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">{customerGrowth.map((m) => <span key={m.month} className="text-[8px] text-[#6B7280] flex-1 text-center">{m.month}</span>)}</div>
        </div>
      </div>

      <div className="bg-[#232326] rounded-lg p-3 border border-[#2D2D30]/50 flex-shrink-0">
        <h3 className="text-white text-xs font-semibold mb-2">Top Products</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {topProducts.map((product, i) => (
            <div key={product.id} className="flex items-center gap-2">
              <span className="text-[10px] text-[#6B7280] w-4 font-medium">{i + 1}</span>
              <img src={product.image} alt={product.name} className="w-6 h-6 rounded object-cover bg-[#232326]" />
              <div className="flex-1 min-w-0"><p className="text-xs text-white truncate">{product.name}</p><p className="text-[10px] text-[#6B7280]">{formatPrice(product.price)}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
