import { useState, useEffect, useMemo } from 'react'
import { productService } from '../../services/productService'
import { useToast } from '../../context/ToastContext'
import BackButton from '../../components/BackButton'

export default function AdminInventory() {
  const { showToast } = useToast()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [editingStock, setEditingStock] = useState(null)
  const [stockValue, setStockValue] = useState('')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [bulkStock, setBulkStock] = useState('')
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [savingId, setSavingId] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        let all = []
        let page = 0
        let totalPages = 1
        while (page < totalPages) {
          const res = await productService.getAdminProducts({ page, size: 100 })
          const data = res || {}
          all = all.concat(Array.isArray(data.content) ? data.content : [])
          totalPages = data.totalPages ?? page + 1
          page += 1
        }
        if (!cancelled) setProducts(all)
      } catch (err) {
        showToast('Failed to load products', 'error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [showToast])

  const filtered = useMemo(() => {
    if (filter === 'low') return products.filter((p) => (p.stock ?? 0) >= 1 && (p.stock ?? 0) <= 10)
    if (filter === 'out') return products.filter((p) => (p.stock ?? 0) === 0)
    return products
  }, [products, filter])

  const lowStockCount = products.filter((p) => (p.stock ?? 0) >= 1 && (p.stock ?? 0) <= 10).length
  const outOfStockCount = products.filter((p) => (p.stock ?? 0) === 0).length

  const handleStockUpdate = async (id) => {
    const val = parseInt(stockValue)
    if (isNaN(val) || val < 0) { showToast('Please enter a valid stock number', 'error'); return }
    setSavingId(id)
    try {
      await productService.patchProduct(id, { stock: val })
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock: val } : p)))
      showToast('Stock updated successfully', 'success')
      setEditingStock(null)
    } catch (err) {
      showToast(err.message || 'Failed to update stock', 'error')
    } finally {
      setSavingId(null)
    }
  }

  const toggleSelect = (id) => {
    setSelectedIds((prev) => { const s = new Set(prev); if (s.has(id)) s.delete(id); else s.add(id); return s })
  }

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(filtered.map((p) => p.id)))
  }

  const applyBulkStock = async () => {
    const val = parseInt(bulkStock)
    if (isNaN(val) || val < 0) { showToast('Please enter a valid stock number', 'error'); return }
    if (selectedIds.size === 0) { showToast('No products selected', 'error'); return }
    const ids = [...selectedIds]
    let updated = 0
    for (const id of ids) {
      try {
        await productService.patchProduct(id, { stock: val })
        updated++
      } catch (err) {
        console.error(`Failed to update product ${id}:`, err)
      }
    }
    setProducts((prev) => prev.map((p) => (selectedIds.has(p.id) ? { ...p, stock: val } : p)))
    showToast(`Stock updated for ${updated} product(s)`, 'success')
    setShowBulkModal(false)
    setSelectedIds(new Set())
  }

  if (loading) {
    return (
      <div className="h-full flex flex-col gap-2 py-3">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-lg font-bold text-[var(--text-primary)] font-['Playfair_Display']">Inventory</h1>
        </div>
        <div className="flex-1 bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)]/50 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col gap-2 py-3">
      <div className="flex items-center justify-between flex-shrink-0 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-lg font-bold text-[var(--text-primary)] font-['Playfair_Display']">Inventory</h1>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <button onClick={() => setShowBulkModal(true)} className="px-3 py-1.5 bg-[#C6A972]/20 text-[#C6A972] rounded-lg text-xs font-medium hover:bg-[#C6A972]/30 transition-colors">
              Bulk ({selectedIds.size})
            </button>
          )}
          <div className="flex gap-1">
            {['all', 'low', 'out'].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-[#C6A972] text-white' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                {f === 'all' ? `All (${products.length})` : f === 'low' ? `Low (${lowStockCount})` : `OOS (${outOfStockCount})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)]/50 overflow-hidden">
        <div className="overflow-auto h-full">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--border-color)] sticky top-0 bg-[var(--bg-card)]">
                <th className="py-2 px-2 w-8"><input type="checkbox" checked={filtered.length > 0 && selectedIds.size === filtered.length} onChange={toggleAll} className="accent-[#C6A972]" /></th>
                <th className="text-left py-2 px-2 text-[var(--text-secondary)] font-medium">Name</th>
                <th className="text-left py-2 px-2 text-[var(--text-secondary)] font-medium hidden sm:table-cell">SKU</th>
                <th className="text-left py-2 px-2 text-[var(--text-secondary)] font-medium hidden sm:table-cell">Category</th>
                <th className="text-right py-2 px-2 text-[var(--text-secondary)] font-medium">Stock</th>
                <th className="text-left py-2 px-2 text-[var(--text-secondary)] font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => {
                const stock = product.stock ?? 0
                const isEditing = editingStock === product.id
                const status = stock === 0 ? { label: 'OOS', color: 'text-red-600 bg-red-500/10' } : stock <= 10 ? { label: 'Low', color: 'text-yellow-600 bg-yellow-500/10' } : { label: 'In Stock', color: 'text-green-600 bg-green-500/10' }
                return (
                  <tr key={product.id} className="border-b border-[var(--border-color)]/30 hover:bg-[var(--bg-hover)] transition-colors">
                    <td className="py-1.5 px-2"><input type="checkbox" checked={selectedIds.has(product.id)} onChange={() => toggleSelect(product.id)} className="accent-[#C6A972]" /></td>
                    <td className="py-1.5 px-2 text-[var(--text-primary)] truncate max-w-[160px]">{product.name}</td>
                    <td className="py-1.5 px-2 text-[var(--text-secondary)] font-mono text-[10px] hidden sm:table-cell">SKU-{String(product.id).padStart(4, '0')}</td>
                    <td className="py-1.5 px-2 text-[var(--text-secondary)] hidden sm:table-cell">{product.category?.name || product.category || ''}</td>
                    <td className="py-1.5 px-2 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <input type="number" value={stockValue} onChange={(e) => setStockValue(e.target.value)} autoFocus className="w-16 bg-[var(--bg-input)] border border-[#C6A972] rounded px-1.5 py-0.5 text-xs text-[var(--text-primary)] focus:outline-none" />
                          <button onClick={() => handleStockUpdate(product.id)} disabled={savingId === product.id} className="text-green-600 hover:text-green-300">
                            {savingId === product.id ? (
                              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8"/></svg>
                            ) : (
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                            )}
                          </button>
                          <button onClick={() => setEditingStock(null)} className="text-red-600 hover:text-red-300"><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditingStock(product.id); setStockValue(String(stock)) }} className="inline-flex items-center gap-1 text-[var(--text-primary)] hover:text-[#C6A972] transition-colors">
                          <span className="font-medium">{stock}</span>
                          <svg className="w-3 h-3 text-[var(--text-secondary)] group-hover:text-[#C6A972]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
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
        {filtered.length === 0 && !loading && <div className="text-center py-6 text-[var(--text-secondary)] text-xs">No products found</div>}
      </div>

      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setShowBulkModal(false)}>
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-5 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">Bulk Stock Update</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-3">Update stock for <span className="text-[var(--text-primary)] font-medium">{selectedIds.size}</span> product(s)</p>
            <input type="number" value={bulkStock} onChange={(e) => setBulkStock(e.target.value)} placeholder="Enter stock value"
              className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#C6A972] mb-3" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowBulkModal(false)} className="px-4 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-input)] hover:bg-[var(--bg-hover)] transition-colors">Cancel</button>
              <button onClick={applyBulkStock} className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#C6A972] hover:bg-[#B8965F] transition-colors">Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
