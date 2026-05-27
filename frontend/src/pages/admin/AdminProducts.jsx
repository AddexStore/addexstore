import { useState, useMemo, useEffect } from 'react'
import { products as initialProducts } from '../../data/products'
import { categories } from '../../data/categories'
import { useToast } from '../../context/ToastContext'
import { formatPrice, getDiscountPrice } from '../../utils/helpers'
import { COLORS, SIZES } from '../../constants'
import BackButton from '../../components/BackButton'

const ITEMS_PER_PAGE = 5

const STORAGE_KEY = 'sifr_admin_products'

const loadProducts = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return initialProducts
}

export default function AdminProducts() {
  const { showToast } = useToast()
  const [products, setProducts] = useState(loadProducts)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(products)) } catch {}
  }, [products])

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [stockFilter, setStockFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [currentPage, setCurrentPage] = useState(1)

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
      if (categoryFilter && p.category !== categoryFilter) return false
      if (stockFilter === 'in') return p.stock > 10
      if (stockFilter === 'low') return p.stock >= 1 && p.stock <= 10
      if (stockFilter === 'out') return p.stock === 0
      return true
    })
  }, [products, search, categoryFilter, stockFilter])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const getDefaultForm = () => ({
    name: '', category: '', subCategory: '', description: '', brand: '',
    price: '', discount: '', stock: '', colors: [], sizes: [], featured: false,
    trending: false, image: '',
  })

  const [form, setForm] = useState(getDefaultForm())

  const handleImageUpload = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => setForm({ ...form, image: e.target.result })
    reader.readAsDataURL(file)
  }

  const openAdd = () => {
    setEditingProduct(null)
    setForm(getDefaultForm())
    setShowModal(true)
  }

  const openEdit = (product) => {
    setEditingProduct(product)
    setForm({
      name: product.name, category: product.category, subCategory: product.subCategory || '',
      description: product.description || '', brand: product.brand || '',
      price: String(product.price), discount: String(product.discountPercentage || ''),
      stock: String(product.stock), colors: product.colors || [], sizes: product.sizes || [],
      featured: product.featured || false, trending: product.trending || false,
      image: product.image || '',
    })
    setShowModal(true)
  }

  const handleSave = () => {
    const price = parseFloat(form.price)
    if (!form.name || !form.category || !price) {
      showToast('Please fill in required fields (Name, Category, Price)', 'error')
      return
    }
    const productData = {
      name: form.name, category: form.category, subCategory: form.subCategory,
      description: form.description, brand: form.brand, price,
      originalPrice: price, discountPercentage: form.discount ? parseFloat(form.discount) : null,
      stock: parseInt(form.stock) || 0, colors: form.colors, sizes: form.sizes,
      featured: form.featured, trending: form.trending,
      image: form.image || '/assets/placeholders/product.svg',
      rating: 0, totalReviews: 0, createdAt: new Date().toISOString(),
    }
    if (editingProduct) {
      setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? { ...p, ...productData } : p)))
      showToast(`Product "${form.name}" updated successfully`, 'success')
    } else {
      const newId = Math.max(...products.map((p) => p.id), 0) + 1
      setProducts((prev) => [...prev, { id: newId, ...productData }])
      showToast(`Product "${form.name}" added successfully`, 'success')
    }
    setShowModal(false)
  }

  const handleDelete = (id) => {
    const product = products.find((p) => p.id === id)
    setProducts((prev) => prev.filter((p) => p.id !== id))
    setSelectedIds((prev) => { const s = new Set(prev); s.delete(id); return s })
    showToast(`Product "${product?.name}" deleted`, 'success')
    setDeleteConfirm(null)
  }

  const toggleFeatured = (id) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, featured: !p.featured } : p)))
  }

  const toggleBulkSelect = (id) => {
    setSelectedIds((prev) => {
      const s = new Set(prev)
      if (s.has(id)) s.delete(id); else s.add(id)
      return s
    })
  }

  const toggleAll = () => {
    if (selectedIds.size === paginated.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(paginated.map((p) => p.id)))
  }

  const deleteSelected = () => {
    if (selectedIds.size === 0) return
    setProducts((prev) => prev.filter((p) => !selectedIds.has(p.id)))
    showToast(`${selectedIds.size} product(s) deleted`, 'success')
    setSelectedIds(new Set())
  }

  const toggleArrayItem = (arr, item) =>
    arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]

  return (
    <div className="h-full flex flex-col gap-2 py-3">
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-lg font-bold text-white font-['Playfair_Display']">Products</h1>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <button onClick={deleteSelected} className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/30 transition-colors">
              Delete ({selectedIds.size})
            </button>
          )}
          <button onClick={openAdd} className="px-4 py-1.5 bg-[#D4AF37] text-black rounded-lg text-xs font-semibold hover:bg-[#C9A84C] transition-colors">
            + Add
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
        <input
          type="text" placeholder="Search..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
          className="w-full sm:flex-1 bg-[#232326] border border-[#2D2D30] rounded-lg px-3 py-2 text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#D4AF37]"
        />
        <div className="flex gap-2">
          <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1) }}
            className="flex-1 bg-[#232326] border border-[#2D2D30] rounded-lg px-3 py-2 text-xs text-[#B8B8C2] focus:outline-none focus:border-[#D4AF37]">
            <option value="">All</option>
            {categories.map((c) => (<option key={c.id} value={c.name}>{c.name}</option>))}
          </select>
          <select value={stockFilter} onChange={(e) => { setStockFilter(e.target.value); setCurrentPage(1) }}
            className="flex-1 bg-[#232326] border border-[#2D2D30] rounded-lg px-3 py-2 text-xs text-[#B8B8C2] focus:outline-none focus:border-[#D4AF37]">
            <option value="">All Stock</option>
            <option value="in">In Stock</option>
            <option value="low">Low</option>
            <option value="out">OOS</option>
          </select>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-[#232326] rounded-lg border border-[#2D2D30]/50 overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#2D2D30] sticky top-0 bg-[#232326]">
                <th className="py-2 px-2 w-8">
                  <input type="checkbox" checked={paginated.length > 0 && selectedIds.size === paginated.length} onChange={toggleAll} className="accent-[#D4AF37]" />
                </th>
                <th className="text-left py-2 px-2 text-[#6B7280] font-medium w-10 hidden sm:table-cell">Image</th>
                <th className="text-left py-2 px-2 text-[#6B7280] font-medium">Name</th>
                <th className="text-left py-2 px-2 text-[#6B7280] font-medium hidden md:table-cell">Category</th>
                <th className="text-right py-2 px-2 text-[#6B7280] font-medium">Price</th>
                <th className="text-right py-2 px-2 text-[#6B7280] font-medium hidden sm:table-cell">Stock</th>
                <th className="text-right py-2 px-2 text-[#6B7280] font-medium w-16 sm:w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((product) => (
                <tr key={product.id} className="border-b border-[#2D2D30]/30 hover:bg-[#2A2A2E] transition-colors">
                  <td className="py-1.5 px-2">
                    <input type="checkbox" checked={selectedIds.has(product.id)} onChange={() => toggleBulkSelect(product.id)} className="accent-[#D4AF37]" />
                  </td>
                  <td className="py-2 px-2 hidden sm:table-cell">
                    <img src={product.image || '/assets/placeholders/product.svg'} alt="" className="w-8 h-8 rounded object-cover bg-[#18181B]" onError={(e) => { e.target.src = '/assets/placeholders/product.svg' }} />
                  </td>
                  <td className="py-2 px-2 text-white truncate max-w-[120px] sm:max-w-[160px] text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-block sm:hidden w-2 h-2 rounded-full flex-shrink-0 ${product.stock === 0 ? 'bg-red-400' : product.stock <= 10 ? 'bg-yellow-400' : 'bg-green-400'}`} />
                      <span className="truncate">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-2 px-2 text-[#B8B8C2] hidden md:table-cell text-xs">{product.category}</td>
                  <td className="py-2 px-2 text-right text-white text-xs sm:text-sm whitespace-nowrap">
                    ₹{product.price.toLocaleString()}
                    {product.discountPercentage > 0 && <span className="text-[#EF4444] text-[10px] ml-1">-{product.discountPercentage}%</span>}
                  </td>
                  <td className="py-2 px-2 text-right hidden sm:table-cell">
                    <span className={`font-medium text-xs ${product.stock === 0 ? 'text-red-400' : product.stock <= 10 ? 'text-yellow-400' : 'text-green-400'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      <button onClick={() => toggleFeatured(product.id)}
                        className={`p-1.5 sm:p-1 rounded transition-colors ${product.featured ? 'text-[#D4AF37]' : 'text-[#6B7280] hover:text-white'}`}
                        title={product.featured ? 'Unfeature' : 'Feature'}>
                        <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill={product.featured ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      </button>
                      <button onClick={() => openEdit(product)}
                        className="p-1.5 sm:p-1 rounded text-[#6B7280] hover:text-[#D4AF37] transition-colors" title="Edit">
                        <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button onClick={() => setDeleteConfirm(product.id)}
                        className="p-1.5 sm:p-1 rounded text-[#6B7280] hover:text-red-400 transition-colors" title="Delete">
                        <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-[#6B7280] text-xs">No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-2 border-t border-[#2D2D30]/50 flex-shrink-0">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg bg-[#232326] text-[#B8B8C2] hover:text-white disabled:opacity-30 text-xs font-medium transition-colors">Prev</button>
            <span className="text-[11px] text-[#6B7280] font-medium">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg bg-[#232326] text-[#B8B8C2] hover:text-white disabled:opacity-30 text-xs font-medium transition-colors">Next</button>
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-[#232326] rounded-xl p-6 border border-[#2D2D30] shadow-xl max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-white font-semibold mb-2">Delete Product</h3>
            <p className="text-sm text-[#B8B8C2] mb-4">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2 border border-[#2D2D30] rounded-lg text-sm text-[#B8B8C2] hover:bg-[#2A2A2E] transition">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition">Delete</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 overflow-y-auto" onClick={() => setShowModal(false)}>
          <div className="bg-[#232326] rounded-xl p-6 border border-[#2D2D30] shadow-xl max-w-2xl w-full mx-4 my-8" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-4">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs text-[#B8B8C2] mb-1">Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#18181B] border border-[#2D2D30] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs text-[#B8B8C2] mb-1">Category *</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-[#18181B] border border-[#2D2D30] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]">
                  <option value="">Select</option>
                  {categories.map((c) => (<option key={c.id} value={c.name}>{c.name}</option>))}
                </select>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs text-[#B8B8C2] mb-1">Brand</label>
                <input type="text" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="w-full bg-[#18181B] border border-[#2D2D30] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs text-[#B8B8C2] mb-1">Price *</label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full bg-[#18181B] border border-[#2D2D30] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs text-[#B8B8C2] mb-1">Discount (%)</label>
                <input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })}
                  className="w-full bg-[#18181B] border border-[#2D2D30] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs text-[#B8B8C2] mb-1">Stock</label>
                <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="w-full bg-[#18181B] border border-[#2D2D30] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-[#B8B8C2] mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
                  className="w-full bg-[#18181B] border border-[#2D2D30] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-[#B8B8C2] mb-1">Product Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-[#18181B] border border-[#2D2D30] overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {form.image ? (
                      <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-6 h-6 text-[#6B7280]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0])}
                    className="flex-1 text-xs text-[#B8B8C2] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-[#2D2D30] file:text-xs file:bg-[#18181B] file:text-[#B8B8C2] hover:file:bg-[#2A2A2E] file:cursor-pointer file:transition-colors" />
                </div>
              </div>
              <div className="flex items-center gap-4 col-span-2">
                <label className="flex items-center gap-2 text-sm text-[#B8B8C2]">
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="accent-[#D4AF37]" /> Featured
                </label>
                <label className="flex items-center gap-2 text-sm text-[#B8B8C2]">
                  <input type="checkbox" checked={form.trending} onChange={(e) => setForm({ ...form, trending: e.target.checked })} className="accent-[#D4AF37]" /> Trending
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-5 py-2 border border-[#2D2D30] rounded-lg text-sm text-[#B8B8C2] hover:bg-[#2A2A2E] transition">Cancel</button>
              <button onClick={handleSave} className="px-5 py-2 bg-[#D4AF37] text-black rounded-lg text-sm font-semibold hover:bg-[#C9A84C] transition">{editingProduct ? 'Update' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
