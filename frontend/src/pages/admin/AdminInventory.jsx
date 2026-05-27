import { useState, useMemo } from 'react'
import { products as initialProducts } from '../../data/products'
import { useToast } from '../../context/ToastContext'
import { formatPrice } from '../../utils/helpers'
import BackButton from '../../components/BackButton'

export default function AdminInventory() {
  const { showToast } = useToast()
  const [products, setProducts] = useState(initialProducts)
  const [filter, setFilter] = useState('all')
  const [editingStock, setEditingStock] = useState(null)
  const [stockValue, setStockValue] = useState('')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [bulkStock, setBulkStock] = useState('')
  const [showBulkModal, setShowBulkModal] = useState(false)

  const filtered = useMemo(() => {
    if (filter === 'low') return products.filter((p) => p.stock >= 1 && p.stock <= 10)
    if (filter === 'out') return products.filter((p) => p.stock === 0)
    return products
  }, [products, filter])

  const lowStockCount = products.filter((p) => p.stock >= 1 && p.stock <= 10).length
  const outOfStockCount = products.filter((p) => p.stock === 0).length

  const handleStockUpdate = (id) => {
    const val = parseInt(stockValue)
    if (isNaN(val) || val < 0) { showToast('Please enter a valid stock number', 'error'); return }
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock: val } : p)))
    showToast('Stock updated successfully', 'success')
    setEditingStock(null)
  }

  const toggleSelect = (id) => {
    setSelectedIds((prev) => { const s = new Set(prev); if (s.has(id)) s.delete(id); else s.add(id); return s })
  }

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(filtered.map((p) => p.id)))
  }

  const applyBulkStock = () => {
    const val = parseInt(bulkStock)
    if (isNaN(val) || val < 0) { showToast('Please enter a valid stock number', 'error'); return }
    if (selectedIds.size === 0) { showToast('No products selected', 'error'); return }
    setProducts((prev) => prev.map((p) => (selectedIds.has(p.id) ? { ...p, stock: val } : p)))
    showToast(`Stock updated for ${selectedIds.size} product(s)`, 'success')
    setShowBulkModal(false)
    setSelectedIds(new Set())
  }

  return (
    <div className="h-full flex flex-col gap-2 py-3">
      <div className="flex items-center justify-between flex-shrink-0 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-lg font-bold text-white font-['Playfair_Display']">Inventory</h1>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <button onClick={() => setShowBulkModal(true)} className="px-3 py-1.5 bg-[#D4AF37]/20 text-[#D4AF37] rounded-lg text-xs font-medium hover:bg-[#D4AF37]/30 transition-colors">
              Bulk ({selectedIds.size})
            </button>
          )}
          <div className="flex gap-1">
            {['all', 'low', 'out'].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-[#D4AF37] text-black' : 'bg-[#232326] text-[#B8B8C2] hover:text-white'}`}>
                {f === 'all' ? `All (${products.length})` : f === 'low' ? `Low (${lowStockCount})` : `OOS (${outOfStockCount})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-[#232326] rounded-lg border border-[#2D2D30]/50 overflow-hidden">
        <div className="overflow-auto h-full">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#2D2D30] sticky top-0 bg-[#232326]">
                <th className="py-2 px-2 w-8"><input type="checkbox" checked={filtered.length > 0 && selectedIds.size === filtered.length} onChange={toggleAll} className="accent-[#D4AF37]" /></th>
                <th className="text-left py-2 px-2 text-[#6B7280] font-medium">Name</th>
                <th className="text-left py-2 px-2 text-[#6B7280] font-medium hidden sm:table-cell">SKU</th>
                <th className="text-left py-2 px-2 text-[#6B7280] font-medium hidden sm:table-cell">Category</th>
                <th className="text-right py-2 px-2 text-[#6B7280] font-medium">Stock</th>
                <th className="text-left py-2 px-2 text-[#6B7280] font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => {
                const isEditing = editingStock === product.id
                const status = product.stock === 0 ? { label: 'OOS', color: 'text-red-400 bg-red-500/10' } : product.stock <= 10 ? { label: 'Low', color: 'text-yellow-400 bg-yellow-500/10' } : { label: 'In Stock', color: 'text-green-400 bg-green-500/10' }
                return (
                  <tr key={product.id} className="border-b border-[#2D2D30]/30 hover:bg-[#2A2A2E] transition-colors">
                    <td className="py-1.5 px-2"><input type="checkbox" checked={selectedIds.has(product.id)} onChange={() => toggleSelect(product.id)} className="accent-[#D4AF37]" /></td>
                    <td className="py-1.5 px-2 text-white truncate max-w-[160px]">{product.name}</td>
                    <td className="py-1.5 px-2 text-[#B8B8C2] font-mono text-[10px] hidden sm:table-cell">SKU-{String(product.id).padStart(4, '0')}</td>
                    <td className="py-1.5 px-2 text-[#B8B8C2] hidden sm:table-cell">{product.category}</td>
                    <td className="py-1.5 px-2 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <input type="number" value={stockValue} onChange={(e) => setStockValue(e.target.value)} autoFocus className="w-16 bg-[#0F0F10] border border-[#D4AF37] rounded px-1.5 py-0.5 text-xs text-white focus:outline-none" />
                          <button onClick={() => handleStockUpdate(product.id)} className="text-green-400 hover:text-green-300"><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg></button>
                          <button onClick={() => setEditingStock(null)} className="text-red-400 hover:text-red-300"><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditingStock(product.id); setStockValue(String(product.stock)) }} className="inline-flex items-center gap-1 text-white hover:text-[#D4AF37] transition-colors">
                          <span className="font-medium">{product.stock}</span>
                          <svg className="w-3 h-3 text-[#6B7280] group-hover:text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                      )}
                    </td>
                    <td className="py-1.5 px-2"><span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${status.color}`}>{status.label}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="text-center py-6 text-[#6B7280] text-xs">No products found</div>}
      </div>

      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setShowBulkModal(false)}>
          <div className="bg-[#232326] rounded-xl border border-[#2D2D30] p-5 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-white mb-1">Bulk Stock Update</h3>
            <p className="text-xs text-[#B8B8C2] mb-3">Update stock for <span className="text-white font-medium">{selectedIds.size}</span> product(s)</p>
            <input type="number" value={bulkStock} onChange={(e) => setBulkStock(e.target.value)} placeholder="Enter stock value"
              className="w-full bg-[#0F0F10] border border-[#2D2D30] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37] mb-3" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowBulkModal(false)} className="px-4 py-1.5 rounded-lg text-xs text-[#B8B8C2] hover:text-white bg-[#0F0F10] hover:bg-[#2A2A2E] transition-colors">Cancel</button>
              <button onClick={applyBulkStock} className="px-4 py-1.5 rounded-lg text-xs font-semibold text-black bg-[#D4AF37] hover:bg-[#C9A84C] transition-colors">Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
