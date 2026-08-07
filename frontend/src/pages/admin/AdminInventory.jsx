import { useState, useEffect, useMemo } from 'react'
import { productService } from '../../services/productService'
import { getAssetUrl } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import StatusBadge from '../../components/ui/StatusBadge'
import Badge from '../../components/ui/Badge'
import { Table, THead, TBody, TR, TH, TD } from '../../components/ui/Table'
import Pagination from '../../components/ui/Pagination'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/EmptyState'
import Modal from '../../components/ui/Modal'
import { Checkbox, Input } from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'

const PAGE_SIZE = 10

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
  const [page, setPage] = useState(1)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await productService.getProducts({ page: 0, size: 1000 })
        const list = Array.isArray(res) ? res : res?.content || []
        if (!cancelled) setProducts(list)
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pagedProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page])

  useEffect(() => {
    setPage(1)
  }, [filter])

  const handleStockUpdate = async (id) => {
    const val = parseInt(stockValue)
    if (isNaN(val) || val < 0) { showToast('Please enter a valid stock number', 'error'); return }
    setSavingId(id)
    try {
      await productService.updateProduct(id, { stock: val })
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
        await productService.updateProduct(id, { stock: val })
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
      <div className="flex h-full flex-col gap-4 py-4">
        <PageHeader title="Inventory" />
        <div className="flex-1 animate-pulse rounded-card border border-line bg-surface" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 py-4">
      <PageHeader
        title="Inventory"
        description="Monitor stock levels and update quantities across your catalog."
        actions={
          <>
            {selectedIds.size > 0 && (
              <Button variant="goldOutline" size="sm" icon="SlidersHorizontal" onClick={() => setShowBulkModal(true)}>
                Bulk ({selectedIds.size})
              </Button>
            )}
            <div className="flex gap-1 rounded-full border border-line bg-surface p-1">
              {['all', 'low', 'out'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${filter === f ? 'bg-gold-500 text-white shadow-gold-soft' : 'text-sub hover:text-ink'}`}
                >
                  {f === 'all' ? `All (${products.length})` : f === 'low' ? `Low (${lowStockCount})` : `OOS (${outOfStockCount})`}
                </button>
              ))}
            </div>
          </>
        }
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card">
        {filtered.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <EmptyState
              compact
              icon="Package"
              title="No products found"
              message="No products match the current stock filter."
            />
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-auto">
              <Table>
                <THead>
                  <TR className="border-0">
                    <TH className="w-8">
                      <Checkbox
                        checked={filtered.length > 0 && selectedIds.size === filtered.length}
                        onChange={toggleAll}
                        aria-label="Select all products"
                      />
                    </TH>
                    <TH className="w-10">Image</TH>
                    <TH>Name</TH>
                    <TH className="hidden sm:table-cell">SKU</TH>
                    <TH className="hidden sm:table-cell">Category</TH>
                    <TH className="text-right">Stock</TH>
                    <TH>Status</TH>
                  </TR>
                </THead>
                <TBody>
                  {pagedProducts.map((product) => {
                    const stock = product.stock ?? 0
                    const isEditing = editingStock === product.id
                    return (
                      <TR key={product.id} className="hover:bg-subtle">
                        <TD>
                          <Checkbox
                            checked={selectedIds.has(product.id)}
                            onChange={() => toggleSelect(product.id)}
                            aria-label={`Select ${product.name}`}
                          />
                        </TD>
                        <TD>
                          <img
                            src={getAssetUrl(product.image) || '/assets/placeholders/product.svg'}
                            alt={product.name}
                            onError={(e) => { e.currentTarget.src = '/assets/placeholders/product.svg' }}
                            className="h-10 w-10 rounded-soft bg-surface object-cover"
                          />
                        </TD>
                        <TD className="max-w-[160px] truncate font-medium text-ink">{product.name}</TD>
                        <TD className="hidden font-mono text-[10px] text-sub sm:table-cell">SKU-{String(product.id).padStart(4, '0')}</TD>
                        <TD className="hidden text-sub sm:table-cell">{product.category?.name || product.category || ''}</TD>
                        <TD className="text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1">
                              <input
                                type="number"
                                value={stockValue}
                                onChange={(e) => setStockValue(e.target.value)}
                                autoFocus
                                className="w-16 rounded-field border border-gold-500 bg-inset px-2 py-1 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-gold-500/25"
                              />
                              <button
                                onClick={() => handleStockUpdate(product.id)}
                                disabled={savingId === product.id}
                                className="p-1.5 text-success transition-colors hover:opacity-80"
                                aria-label="Save stock"
                              >
                                {savingId === product.id ? <Icon name="Loader2" size="sm" className="animate-spin" /> : <Icon name="Check" size="sm" />}
                              </button>
                              <button
                                onClick={() => setEditingStock(null)}
                                className="p-1.5 text-danger transition-colors hover:opacity-80"
                                aria-label="Cancel edit"
                              >
                                <Icon name="X" size="sm" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setEditingStock(product.id); setStockValue(String(stock)) }}
                              className="inline-flex items-center gap-1.5 rounded-soft text-ink transition-colors hover:text-gold-600"
                            >
                              <span className="font-medium">{stock}</span>
                              <Icon name="Pencil" size="sm" className="text-sub" />
                            </button>
                          )}
                        </TD>
                        <TD>
                          {stock === 0 ? (
                            <StatusBadge status="OUT_OF_STOCK" />
                          ) : stock <= 10 ? (
                            <StatusBadge status="LOW_STOCK" />
                          ) : (
                            <Badge tone="success" size="sm">In Stock</Badge>
                          )}
                        </TD>
                      </TR>
                    )
                  })}
                </TBody>
              </Table>
            </div>
            <div className="flex flex-shrink-0 flex-col items-center justify-between gap-3 border-t border-line px-4 py-3 sm:flex-row">
              <span className="text-[11px] text-sub">
                {filtered.length} product{filtered.length === 1 ? '' : 's'} · Page {page} of {totalPages}
              </span>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      <Modal
        open={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        title="Bulk Stock Update"
        description={`Update stock for ${selectedIds.size} product(s)`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowBulkModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={applyBulkStock}>Apply</Button>
          </>
        }
      >
        <Input type="number" value={bulkStock} onChange={(e) => setBulkStock(e.target.value)} placeholder="Enter stock value" />
      </Modal>
    </div>
  )
}
