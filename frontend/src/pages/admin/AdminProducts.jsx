import { useState, useMemo, useEffect, useCallback } from 'react'
import { categories } from '../../data/categories'
import { productService } from '../../services/productService'
import { mapProduct } from '../../services/mappers'
import { useToast } from '../../context/ToastContext'
import { formatPrice, getDiscountPrice } from '../../utils/helpers'
import { COLORS, SIZES } from '../../constants'
import BackButton from '../../components/BackButton'

const ITEMS_PER_PAGE = 5

export default function AdminProducts() {
  const { showToast } = useToast()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageInfo, setPageInfo] = useState({ totalElements: 0, totalPages: 0 })

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [subcategoryFilter, setSubcategoryFilter] = useState('')
  const [stockFilter, setStockFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)

  const fetchProducts = useCallback(() => {
    setLoading(true)
    productService.getProducts({ page: 0, size: 100, sort: 'createdAt,desc' })
      .then((data) => {
        const list = (data.content || []).map(mapProduct)
        setProducts(list)
        setPageInfo({ totalElements: data.totalElements || list.length, totalPages: data.totalPages || 1 })
      })
      .catch(() => showToast('Failed to load products', 'error'))
      .finally(() => setLoading(false))
  }, [showToast])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
      if (categoryFilter && p.category !== categoryFilter) return false
      if (subcategoryFilter && p.subCategory !== subcategoryFilter) return false
      if (stockFilter === 'in') return p.stock > 10
      if (stockFilter === 'low') return p.stock >= 1 && p.stock <= 10
      if (stockFilter === 'out') return p.stock === 0
      return true
    })
  }, [products, search, categoryFilter, subcategoryFilter, stockFilter])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const filterSubcategories = useMemo(() => {
    const cat = categories.find((c) => c.name === categoryFilter)
    return cat?.subcategories || []
  }, [categoryFilter])

  useEffect(() => {
    setSubcategoryFilter('')
  }, [categoryFilter])

  const getDefaultForm = () => ({
    name: '', category: '', subCategory: '', description: '', brand: '',
    price: '', discount: '', stock: '', colors: [], sizes: [], featured: false,
    trending: false, image: '',
  })

  const [form, setForm] = useState(getDefaultForm())

  const modalSubcategories = useMemo(() => {
    const cat = categories.find((c) => c.name === form.category)
    return cat?.subcategories || []
  }, [form.category])

  const handleImageUpload = (file) => {
    if (!file) return
    setImageUploading(true)
    productService.uploadImage(file)
      .then((url) => setForm({ ...form, image: url }))
      .catch(() => {
        const reader = new FileReader()
        reader.onload = (e) => setForm({ ...form, image: e.target.result })
        reader.readAsDataURL(file)
      })
      .finally(() => setImageUploading(false))
  }

  const lookupCategoryId = (name) => {
    const cat = categories.find((c) => c.name === name)
    return cat ? cat.id : null
  }

  const lookupSubCategoryId = (catName, subName) => {
    const cat = categories.find((c) => c.name === catName)
    if (!cat) return null
    const sub = cat.subcategories.find((s) => s.name === subName)
    return sub ? sub.id : null
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

  const handleSave = async () => {
    const price = parseFloat(form.price)
    if (!form.name || !form.category || !price) {
      showToast('Please fill in required fields (Name, Category, Price)', 'error')
      return
    }
    setSaving(true)
    try {
      const categoryId = lookupCategoryId(form.category)
      const subCategoryId = form.subCategory ? lookupSubCategoryId(form.category, form.subCategory) : null

      const payload = {
        name: form.name,
        slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: form.description || '',
        brand: form.brand || '',
        sku: '',
        price,
        originalPrice: price,
        discountPercentage: form.discount ? parseFloat(form.discount) : 0,
        stock: parseInt(form.stock) || 0,
        featured: form.featured,
        trending: form.trending,
        newArrival: false,
        onSale: false,
        categoryId,
        subCategoryId,
        images: form.image ? [form.image] : [],
        variants: [],
      }

      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, payload)
        showToast(`Product "${form.name}" updated successfully`, 'success')
      } else {
        await productService.createProduct(payload)
        showToast(`Product "${form.name}" added successfully`, 'success')
      }
      setShowModal(false)
      fetchProducts()
    } catch (err) {
      showToast(err.message || 'Failed to save product', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    const product = products.find((p) => p.id === id)
    try {
      await productService.deleteProduct(id)
      setSelectedIds((prev) => { const s = new Set(prev); s.delete(id); return s })
      showToast(`Product "${product?.name}" deleted`, 'success')
      fetchProducts()
    } catch (err) {
      showToast(err.message || 'Failed to delete product', 'error')
    }
    setDeletingId(null)
    setDeleteConfirm(null)
  }

  const toggleFeatured = async (id) => {
    const product = products.find((p) => p.id === id)
    if (!product) return
    try {
      const categoryId = lookupCategoryId(product.category)
      const subCategoryId = product.subCategory ? lookupSubCategoryId(product.category, product.subCategory) : null
      await productService.updateProduct(id, {
        name: product.name,
        slug: product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: product.description || '',
        brand: product.brand || '',
        sku: '',
        price: product.price,
        originalPrice: product.originalPrice || product.price,
        discountPercentage: product.discountPercentage || 0,
        stock: product.stock || 0,
        featured: !product.featured,
        trending: product.trending || false,
        newArrival: false,
        onSale: false,
        categoryId,
        subCategoryId,
        images: product.images || (product.image ? [product.image] : []),
        variants: [],
      })
      fetchProducts()
    } catch (err) {
      showToast(err.message || 'Failed to update product', 'error')
    }
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

  const deleteSelected = async () => {
    if (selectedIds.size === 0) return
    setBulkDeleting(true)
    try {
      await Promise.all(Array.from(selectedIds).map((id) => productService.deleteProduct(id)))
      showToast(`${selectedIds.size} product(s) deleted`, 'success')
      setSelectedIds(new Set())
      fetchProducts()
    } catch (err) {
      showToast(err.message || 'Failed to delete products', 'error')
    }
    setBulkDeleting(false)
  }

  const toggleArrayItem = (arr, item) =>
    arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]

  return (
    <div className="h-full flex flex-col gap-2 py-3">
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-lg font-bold text-[var(--text-primary)] font-['Playfair_Display']">Products</h1>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <button onClick={deleteSelected} disabled={bulkDeleting} className="px-3 py-1.5 bg-red-500/20 text-red-600 rounded-lg text-xs font-medium hover:bg-red-500/30 transition-colors disabled:opacity-40">
              {bulkDeleting ? 'Deleting...' : `Delete (${selectedIds.size})`}
            </button>
          )}
          <button onClick={openAdd} className="px-4 py-1.5 bg-[#C6A972] text-white rounded-lg text-xs font-semibold hover:bg-[#B8965F] transition-colors">
            + Add
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
        <input
          type="text" placeholder="Search..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
          className="w-full sm:flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#C6A972]"
        />
        <div className="flex gap-2">
          <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1) }}
            className="flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs text-[var(--text-secondary)] focus:outline-none focus:border-[#C6A972]">
            <option value="">All</option>
            {categories.map((c) => (<option key={c.id} value={c.name}>{c.name}</option>))}
          </select>
          {filterSubcategories.length > 0 && (
            <select value={subcategoryFilter} onChange={(e) => { setSubcategoryFilter(e.target.value); setCurrentPage(1) }}
              className="flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs text-[var(--text-secondary)] focus:outline-none focus:border-[#C6A972]">
              <option value="">All Sub</option>
              {filterSubcategories.map((s) => (<option key={s.id} value={s.name}>{s.name}</option>))}
            </select>
          )}
          <select value={stockFilter} onChange={(e) => { setStockFilter(e.target.value); setCurrentPage(1) }}
            className="flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs text-[var(--text-secondary)] focus:outline-none focus:border-[#C6A972]">
            <option value="">All Stock</option>
            <option value="in">In Stock</option>
            <option value="low">Low</option>
            <option value="out">OOS</option>
          </select>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)]/50 overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--border-color)] sticky top-0 bg-[var(--bg-card)]">
                <th className="py-2 px-2 w-8">
                  <input type="checkbox" checked={paginated.length > 0 && selectedIds.size === paginated.length} onChange={toggleAll} className="accent-[#C6A972]" />
                </th>
                <th className="text-left py-2 px-2 text-[var(--text-secondary)] font-medium w-10 hidden sm:table-cell">Image</th>
                <th className="text-left py-2 px-2 text-[var(--text-secondary)] font-medium">Name</th>
                <th className="text-left py-2 px-2 text-[var(--text-secondary)] font-medium hidden md:table-cell">Category</th>
                <th className="text-right py-2 px-2 text-[var(--text-secondary)] font-medium">Price</th>
                <th className="text-right py-2 px-2 text-[var(--text-secondary)] font-medium hidden sm:table-cell">Stock</th>
                <th className="text-right py-2 px-2 text-[var(--text-secondary)] font-medium w-16 sm:w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((product) => (
                <tr key={product.id} className="border-b border-[var(--border-color)]/30 hover:bg-[var(--bg-hover)] transition-colors">
                  <td className="py-1.5 px-2">
                    <input type="checkbox" checked={selectedIds.has(product.id)} onChange={() => toggleBulkSelect(product.id)} className="accent-[#C6A972]" />
                  </td>
                  <td className="py-2 px-2 hidden sm:table-cell">
                    <img src={product.image || '/assets/placeholders/product.svg'} alt="" className="w-8 h-8 rounded object-cover bg-[var(--bg-input)]" onError={(e) => { e.target.src = '/assets/placeholders/product.svg' }} />
                  </td>
                  <td className="py-2 px-2 text-[var(--text-primary)] truncate max-w-[120px] sm:max-w-[160px] text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-block sm:hidden w-2 h-2 rounded-full flex-shrink-0 ${product.stock === 0 ? 'bg-red-400' : product.stock <= 10 ? 'bg-yellow-400' : 'bg-green-400'}`} />
                      <span className="truncate">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-2 px-2 text-[var(--text-secondary)] hidden md:table-cell text-xs">{product.category}</td>
                  <td className="py-2 px-2 text-right text-[var(--text-primary)] text-xs sm:text-sm whitespace-nowrap">
                    ₹{product.price.toLocaleString()}
                    {product.discountPercentage > 0 && <span className="text-[#EF4444] text-[10px] ml-1">-{product.discountPercentage}%</span>}
                  </td>
                  <td className="py-2 px-2 text-right hidden sm:table-cell">
                    <span className={`font-medium text-xs ${product.stock === 0 ? 'text-red-600' : product.stock <= 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      <button onClick={() => toggleFeatured(product.id)}
                        className={`p-1.5 sm:p-1 rounded transition-colors ${product.featured ? 'text-[#C6A972]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                        title={product.featured ? 'Unfeature' : 'Feature'}>
                        <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill={product.featured ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      </button>
                      <button onClick={() => openEdit(product)}
                        className="p-1.5 sm:p-1 rounded text-[var(--text-secondary)] hover:text-[#C6A972] transition-colors" title="Edit">
                        <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button onClick={() => setDeleteConfirm(product.id)}
                        className="p-1.5 sm:p-1 rounded text-[var(--text-secondary)] hover:text-red-600 transition-colors" title="Delete">
                        <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr><td colSpan={7} className="text-center py-8 text-[var(--text-secondary)] text-xs">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading...
                  </div>
                </td></tr>
              )}
              {!loading && paginated.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-[var(--text-secondary)] text-xs">No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-2 border-t border-[var(--border-color)]/50 flex-shrink-0">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 text-xs font-medium transition-colors">Prev</button>
            <span className="text-[11px] text-[var(--text-secondary)] font-medium">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 text-xs font-medium transition-colors">Next</button>
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border-color)] shadow-xl max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[var(--text-primary)] font-semibold mb-2">Delete Product</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} disabled={deletingId !== null} className="flex-1 py-2 border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition disabled:opacity-40">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} disabled={deletingId === deleteConfirm}
                className="flex-1 py-2 bg-red-500/20 text-red-600 rounded-lg text-sm font-medium hover:bg-red-500/30 transition disabled:opacity-40">
                {deletingId === deleteConfirm ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 overflow-y-auto" onClick={() => setShowModal(false)}>
          <div className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border-color)] shadow-xl max-w-2xl w-full mx-4 my-8" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#C6A972]" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Category *</label>
                <select value={form.category} onChange={(e) => { setForm({ ...form, category: e.target.value, subCategory: '' }) }}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#C6A972]">
                  <option value="">Select</option>
                  {categories.map((c) => (<option key={c.id} value={c.name}>{c.name}</option>))}
                </select>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Subcategory</label>
                <select value={form.subCategory} onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#C6A972] disabled:opacity-40"
                  disabled={!form.category || modalSubcategories.length === 0}>
                  <option value="">{!form.category ? 'Select category first' : 'None'}</option>
                  {modalSubcategories.map((s) => (<option key={s.id} value={s.name}>{s.name}</option>))}
                </select>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Brand</label>
                <input type="text" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#C6A972]" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Price *</label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#C6A972]" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Discount (%)</label>
                <input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#C6A972]" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Stock</label>
                <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#C6A972]" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#C6A972]" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Product Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {form.image ? (
                      <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-6 h-6 text-[var(--text-secondary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0])}
                    className="flex-1 text-xs text-[var(--text-secondary)] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-[var(--border-color)] file:text-xs file:bg-[var(--bg-input)] file:text-[var(--text-secondary)] hover:file:bg-[var(--bg-hover)] file:cursor-pointer file:transition-colors" />
                </div>
              </div>
              <div className="flex items-center gap-4 col-span-2">
                <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="accent-[#C6A972]" /> Featured
                </label>
                <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <input type="checkbox" checked={form.trending} onChange={(e) => setForm({ ...form, trending: e.target.checked })} className="accent-[#C6A972]" /> Trending
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} disabled={saving} className="px-5 py-2 border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition disabled:opacity-40">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2 bg-[#C6A972] text-white rounded-lg text-sm font-semibold hover:bg-[#B8965F] transition disabled:opacity-40">
                {saving ? 'Saving...' : (editingProduct ? 'Update' : 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
