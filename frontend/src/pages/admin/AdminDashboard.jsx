import { products } from '../../data/products'
import { orders } from '../../data/orders'
import { users } from '../../data/users'
import { formatPrice, formatDate } from '../../utils/helpers'
import { Link } from 'react-router-dom'
import BackButton from '../../components/BackButton'

const stats = [
  { label: 'Total Sales', value: '₹128.4K', change: '+12.5%', changeType: 'up' },
  { label: 'Revenue', value: '₹95.3K', change: '+8.3%', changeType: 'up' },
  { label: 'Users', value: '1,284', change: '+18.2%', changeType: 'up' },
  { label: 'Orders', value: '342', change: '+6.7%', changeType: 'up' },
  { label: 'Products', value: '126', change: '+3.4%', changeType: 'up' },
  { label: 'Low Stock', value: '12', change: '-2.1%', changeType: 'down' },
]

const monthlySales = [
  { month: 'J', value: 65 }, { month: 'F', value: 72 }, { month: 'M', value: 85 },
  { month: 'A', value: 78 }, { month: 'M', value: 92 }, { month: 'J', value: 88 },
  { month: 'J', value: 95 }, { month: 'A', value: 102 }, { month: 'S', value: 110 },
  { month: 'O', value: 98 }, { month: 'N', value: 120 }, { month: 'D', value: 135 },
]

const weeklyOrders = [
  { day: 'Mon', value: 28 }, { day: 'Tue', value: 35 }, { day: 'Wed', value: 42 },
  { day: 'Thu', value: 38 }, { day: 'Fri', value: 55 }, { day: 'Sat', value: 48 },
  { day: 'Sun', value: 30 },
]

const recentOrders = orders.slice(0, 3)

const activities = [
  { text: "New order #ORD-010", time: "2 min ago", type: "order" },
  { text: "Classic Leather Sneakers restocked", time: "15 min ago", type: "restock" },
  { text: "Emily Park registered", time: "1 hour ago", type: "user" },
  { text: "Order #ORD-008 shipped", time: "2 hours ago", type: "status" },
  { text: "Silk Evening Gown trending", time: "3 hours ago", type: "trending" },
]

const maxSale = Math.max(...monthlySales.map((m) => m.value))
const maxOrder = Math.max(...weeklyOrders.map((w) => w.value))

export default function AdminDashboard() {
  return (
    <div className="h-full flex flex-col gap-3 py-4">
      <div className="flex items-center gap-3">
        <BackButton />
        <h1 className="text-lg font-bold text-white font-['Playfair_Display']">Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.label === 'Products' ? '/admin/products' : stat.label === 'Orders' ? '/admin/orders' : stat.label === 'Users' ? '/admin/users' : '#'}
            className="bg-[#232326] rounded-lg px-3 py-2.5 border border-[#2D2D30]/50 block"
          >
            <p className="text-[#6B7280] text-[10px] font-medium uppercase tracking-wider">{stat.label}</p>
            <p className="text-base font-bold text-white mt-0.5">{stat.value}</p>
            <div className={`flex items-center gap-1 mt-0.5 text-[10px] font-medium ${stat.changeType === 'up' ? 'text-green-400' : 'text-red-400'}`}>
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                {stat.changeType === 'up' ? <path d="M12 5l7 7h-5v7h-4v-7H5l7-7z" /> : <path d="M12 19l-7-7h5V5h4v7h5l-7 7z" />}
              </svg>
              <span>{stat.change}</span>
            </div>
          </Link>
        ))}
        <Link
          to="/admin/banners"
          className="bg-[#232326] rounded-lg px-3 py-2.5 border border-[#2D2D30]/50 block flex flex-col justify-center items-center hover:border-[#D4AF37]/50 transition"
        >
          <svg className="w-5 h-5 text-[#D4AF37] mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <p className="text-[#B8B8C2] text-[10px] font-medium">Manage Banners</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 min-h-0">
        <div className="bg-[#232326] rounded-lg p-3 border border-[#2D2D30]/50 flex flex-col">
          <h3 className="text-white text-xs font-semibold mb-2">Sales</h3>
          <div className="flex-1 flex gap-[1px]">
            {monthlySales.map((item) => (
              <div key={item.month} className="flex-1 self-stretch flex flex-col justify-end items-center">
                <div className="w-full rounded-sm" style={{ height: `${(item.value / maxSale) * 100}%`, background: 'linear-gradient(to top, #D4AF37, #f0d060)', minHeight: item.value > 0 ? '2px' : 0 }} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {monthlySales.map((item) => (
              <span key={item.month} className="text-[8px] text-[#6B7280] flex-1 text-center">{item.month}</span>
            ))}
          </div>
        </div>

        <div className="bg-[#232326] rounded-lg p-3 border border-[#2D2D30]/50 flex flex-col">
          <h3 className="text-white text-xs font-semibold mb-2">Revenue</h3>
          <div className="flex-1 relative">
            <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.01" />
                </linearGradient>
              </defs>
              <polyline points="10,90 35,75 60,82 85,55 110,65 135,40 160,50 185,25 210,35 235,20 260,15 290,10" fill="none" stroke="#D4AF37" strokeWidth="2" vectorEffect="non-scaling-stroke" />
              <polygon points="10,90 35,75 60,82 85,55 110,65 135,40 160,50 185,25 210,35 235,20 260,15 290,10 290,100 10,100" fill="url(#revGrad)" />
            </svg>
          </div>
          <div className="flex justify-between mt-1">
            {['J','F','M','A','M','J','J','A','S','O','N','D'].map((m) => (
              <span key={m} className="text-[8px] text-[#6B7280]">{m}</span>
            ))}
          </div>
        </div>

        <div className="bg-[#232326] rounded-lg p-3 border border-[#2D2D30]/50 flex flex-col">
          <h3 className="text-white text-xs font-semibold mb-2">Weekly Orders</h3>
          <div className="flex-1 flex gap-[1px]">
            {weeklyOrders.map((item) => (
              <div key={item.day} className="flex-1 self-stretch flex flex-col justify-end items-center">
                <div className="w-full rounded-sm" style={{ height: `${(item.value / maxOrder) * 100}%`, background: 'linear-gradient(to top, #D4AF37, #f0d060)', minHeight: item.value > 0 ? '2px' : 0 }} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {weeklyOrders.map((item) => (
              <span key={item.day} className="text-[8px] text-[#6B7280] flex-1 text-center">{item.day}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-shrink-0">
        <div className="bg-[#232326] rounded-lg p-3 border border-[#2D2D30]/50 overflow-hidden">
          <h3 className="text-white text-xs font-semibold mb-2">Recent Orders</h3>
          <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-[#6B7280] border-b border-[#2D2D30]">
                <th className="text-left py-1.5 font-medium">ID</th>
                <th className="text-left py-1.5 font-medium">Customer</th>
                <th className="text-left py-1.5 font-medium">Status</th>
                <th className="text-right py-1.5 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => {
                const user = users.find((u) => u.id === order.userId)
                return (
                  <tr key={order.id} className="border-b border-[#2D2D30]/30">
                    <td className="py-1.5 text-white font-mono text-[10px]">{order.id}</td>
                    <td className="py-1.5 text-[#B8B8C2]">{user?.name || 'Unknown'}</td>
                    <td className="py-1.5">
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${
                        order.status === 'Delivered' ? 'bg-green-500/20 text-green-400' :
                        order.status === 'Processing' ? 'bg-blue-500/20 text-blue-400' :
                        order.status === 'Shipped' ? 'bg-purple-500/20 text-purple-400' :
                        order.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>{order.status}</span>
                    </td>
                    <td className="py-1.5 text-right text-white">{formatPrice(order.totalAmount)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        </div>

        <div className="bg-[#232326] rounded-lg p-3 border border-[#2D2D30]/50">
          <h3 className="text-white text-xs font-semibold mb-2">Activity</h3>
          <div className="space-y-1">
            {activities.map((a, i) => (
              <div key={i} className="flex items-center gap-2 py-1 border-b border-[#2D2D30]/20 last:border-0">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                  a.type === 'order' ? 'bg-blue-500/20 text-blue-400' :
                  a.type === 'restock' ? 'bg-green-500/20 text-green-400' :
                  a.type === 'user' ? 'bg-purple-500/20 text-purple-400' :
                  a.type === 'status' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-pink-500/20 text-pink-400'
                }`}>
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {a.type === 'order' && <><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></>}
                    {a.type === 'restock' && <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></>}
                    {a.type === 'user' && <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></>}
                    {a.type === 'status' && <><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></>}
                    {a.type === 'trending' && <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>}
                  </svg>
                </div>
                <p className="text-[11px] text-white flex-1 truncate">{a.text}</p>
                <span className="text-[9px] text-[#6B7280] flex-shrink-0">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
