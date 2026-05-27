import { useState, useMemo } from 'react'
import { users as initialUsers } from '../../data/users'
import { orders } from '../../data/orders'
import { useToast } from '../../context/ToastContext'
import { formatDate, formatPrice } from '../../utils/helpers'
import BackButton from '../../components/BackButton'

export default function AdminUsers() {
  const { showToast } = useToast()
  const [users, setUsers] = useState(initialUsers)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [viewingUser, setViewingUser] = useState(null)

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (search) {
        const q = search.toLowerCase()
        if (!u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false
      }
      if (roleFilter === 'admin' && u.role !== 'admin') return false
      if (roleFilter === 'user' && u.role !== 'user') return false
      return true
    })
  }, [users, search, roleFilter])

  const toggleBlock = (id) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isBlocked: !u.isBlocked } : u)))
    const user = users.find((u) => u.id === id)
    showToast(`${user?.name} ${user?.isBlocked ? 'unblocked' : 'blocked'}`, 'success')
  }

  const userOrders = viewingUser ? orders.filter((o) => o.userId === viewingUser.id) : []

  return (
    <div className="h-full flex flex-col gap-2 py-3">
      <div className="flex items-center justify-between flex-shrink-0 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-lg font-bold text-white font-['Playfair_Display']">Users</h1>
        </div>
        <div className="flex gap-2">
          <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-48 bg-[#232326] border border-[#2D2D30] rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#D4AF37]" />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#232326] border border-[#2D2D30] rounded-lg px-3 py-1.5 text-xs text-[#B8B8C2] focus:outline-none focus:border-[#D4AF37]">
            <option value="">All</option>
            <option value="admin">Admins</option>
            <option value="user">Users</option>
          </select>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-[#232326] rounded-lg border border-[#2D2D30]/50 overflow-hidden">
        <div className="overflow-auto h-full">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#2D2D30] sticky top-0 bg-[#232326]">
                <th className="text-left py-2 px-2 text-[#6B7280] font-medium">User</th>
                <th className="text-left py-2 px-2 text-[#6B7280] font-medium hidden sm:table-cell">Email</th>
                <th className="text-left py-2 px-2 text-[#6B7280] font-medium">Role</th>
                <th className="text-left py-2 px-2 text-[#6B7280] font-medium">Status</th>
                <th className="text-right py-2 px-2 text-[#6B7280] font-medium w-16">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-[#2D2D30]/30 hover:bg-[#2A2A2E] transition-colors">
                  <td className="py-1.5 px-2">
                    <div className="flex items-center gap-2">
                      <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full bg-[#232326]" />
                      <span className="text-white font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-1.5 px-2 text-[#B8B8C2] hidden sm:table-cell">{user.email}</td>
                  <td className="py-1.5 px-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${user.role === 'admin' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-blue-500/20 text-blue-400'}`}>{user.role}</span>
                  </td>
                  <td className="py-1.5 px-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${user.isBlocked ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>{user.isBlocked ? 'Blocked' : 'Active'}</span>
                  </td>
                  <td className="py-1.5 px-2 text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      <button onClick={() => setViewingUser(user)} className="p-1 rounded text-[#6B7280] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors" title="Details">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                      <button onClick={() => toggleBlock(user.id)}
                        className={`p-1 rounded transition-colors ${user.isBlocked ? 'text-green-400 hover:bg-green-500/10' : 'text-[#6B7280] hover:text-red-400 hover:bg-red-500/10'}`} title={user.isBlocked ? 'Unblock' : 'Block'}>
                        {user.isBlocked ? (
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="text-center py-6 text-[#6B7280] text-xs">No users found</div>}
      </div>

      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setViewingUser(null)}>
          <div className="bg-[#232326] rounded-xl border border-[#2D2D30] w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[#2D2D30]">
              <div className="flex items-center gap-3">
                <img src={viewingUser.avatar} alt={viewingUser.name} className="w-10 h-10 rounded-full bg-[#232326]" />
                <div><h2 className="text-base font-semibold text-white">{viewingUser.name}</h2><p className="text-xs text-[#B8B8C2]">{viewingUser.email}</p></div>
              </div>
              <button onClick={() => setViewingUser(null)} className="text-[#6B7280] hover:text-white"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#0F0F10] rounded-lg p-3"><p className="text-[#6B7280] text-[10px] uppercase tracking-wider">Role</p><p className="text-white text-sm mt-0.5 capitalize">{viewingUser.role}</p></div>
                <div className="bg-[#0F0F10] rounded-lg p-3"><p className="text-[#6B7280] text-[10px] uppercase tracking-wider">Status</p><p className={`text-sm mt-0.5 ${viewingUser.isBlocked ? 'text-red-400' : 'text-green-400'}`}>{viewingUser.isBlocked ? 'Blocked' : 'Active'}</p></div>
                <div className="bg-[#0F0F10] rounded-lg p-3"><p className="text-[#6B7280] text-[10px] uppercase tracking-wider">Phone</p><p className="text-white text-sm mt-0.5">{viewingUser.phone || '-'}</p></div>
                <div className="bg-[#0F0F10] rounded-lg p-3"><p className="text-[#6B7280] text-[10px] uppercase tracking-wider">Joined</p><p className="text-white text-sm mt-0.5">{formatDate(viewingUser.joinDate)}</p></div>
              </div>
              <div className="bg-[#0F0F10] rounded-lg p-3"><p className="text-[#6B7280] text-[10px] uppercase tracking-wider">Address</p><p className="text-white text-xs mt-0.5">{viewingUser.address.street}, {viewingUser.address.city}, {viewingUser.address.state} {viewingUser.address.zip}</p></div>
              <div><h3 className="text-white text-xs font-semibold mb-2">Orders ({userOrders.length})</h3>
                {userOrders.length === 0 && <p className="text-[#6B7280] text-xs">No orders yet</p>}
                {userOrders.map((order) => (
                  <div key={order.id} className="bg-[#0F0F10] rounded-lg p-2 flex items-center justify-between mb-1"><div><p className="text-white text-xs font-medium">{order.id}</p><p className="text-[#6B7280] text-[10px]">{order.items.length} item(s)</p></div><div className="text-right"><p className="text-white text-xs">{formatPrice(order.totalAmount)}</p><span className={`text-[10px] font-medium ${order.status === 'Delivered' ? 'text-green-400' : order.status === 'Cancelled' ? 'text-red-400' : 'text-yellow-400'}`}>{order.status}</span></div></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
