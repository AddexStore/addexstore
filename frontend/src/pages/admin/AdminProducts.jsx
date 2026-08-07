import { useState, useEffect, useCallback } from 'react'
import { categoryService } from '../../services/categoryService'
import { productService } from '../../services/productService'
import { mapProduct, mapCategory } from '../../services/mappers'
import { useToast } from '../../context/ToastContext'
import { formatPrice } from '../../utils/helpers'
import { getAssetUrl } from '../../services/api'
import BackButton from '../../components/BackButton'

const ITEMS_PER_PAGE = 10
const MAX_IMAGES = 10
const MAX_VARIANTS = 50

const getDefaultForm = () => ({
  name: '',
  sku: '',
  category: '',
  subCategory: '',
  description: '',
  brand: '',
  price: '',
  originalPrice: '',
  discount: '',
  stock: '',
  active: true,
  featured: false,
  trending: false,
  newArrival: false,
  onSale: false,
  images: [],
  variants: [],
})

const getEmptyVariant = () => ({ size: '', color: '', stock: 0, priceOverride: '', sku: '' })

export default function AdminProducts() {
  const { showToast } = useToast()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
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
  const [form, setForm] = useState(getDefaultForm())

  const fetchProducts = useCallback(() => {
    setLoading(true)
    const params = { page: currentPage - 1, size: ITEMS_PER_PAGE, sort: 'createdAt,desc' }
    if (search) params.search = search
    const cat = categories.find((c) => c.name === categoryFilter)
    if (cat) params.category = cat.id
    const sub = cat?.subcategories?.find((s) => s.name === subcategoryFilter)
    if (sub) params.subcategory = sub.id
    if (stockFilter) params.stockStatus = stockFilter
    productService.getProducts(params)
      .then((data) => {
        const list = (data.content || []).map(mapProduct)
        setProducts(list)
        setPageInfo({ totalElements: data.totalElements || list.length, totalPages: data.totalPages || 1 })
      })
      .catch(() => showToast('Failed to load products', 'error'))
      .finally(() => setLoading(false))
  }, [currentPage, search, categoryFilter, subcategoryFilter, stockFilter, categories, showToast])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  useEffect(() => {
    categoryService.getAllAdmin()
      .then((res) => setCategories((res.data || []).map(mapCategory)))
      .catch(() => showToast('Failed to load categories', 'error'))
  }, [showToast])

  const filterSubcategories = useCallback(() => {
    const cat = categories.find((c) => c.name === categoryFilter)
    return cat?.subcategories || []
  }, [categories, categoryFilter])

  const modalSubcategories = useCallback(() => {
    const cat = categories.find((c) => c.name === form.category)
    return cat?.subcategories || []
  }, [categories, form.category])

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

  const productToPayload = (product) => ({
    name: product.name,
    sku: product.sku || '',
    description: product.description || '',
    brand: product.brand || '',
    price: product.price,
    originalPrice: product.originalPrice || null,
    discountPercentage: product.discountPercentage || 0,
    stock: product.stock || 0,
    featured: product.featured,
    trending: product.trending,
    newArrival: product.isNewArrival,
    onSale: product.isOnSale,
    active: product.active !== false,
    categoryId: lookupCategoryId(product.category),
    subCategoryId: product.subCategory ? lookupSubCategoryId(product.category, product.subCategory) : null,
    images: product.images || [],
    variants: (product.variants || []).map((v) => ({
      size: v.size || '',
      color: v.color || '',
      stock: v.stock || 0,
      priceOverride: v.priceOverride || null,
      sku: v.sku || '',
    })),
  })

  const handleImageUpload = (file) => {
    if (!file) return
    setImageUploading(true)
    productService.uploadImage(file)
      .then((url) => {
        if (!url) throw new Error('Upload returned no URL')
        setForm((prev) => ({ ...prev, images: prev.images.length >= MAX_IMAGES ? prev.images : [...prev.images, url] }))
      })
      .catch((err) => showToast(err.message || 'Failed to upload image', 'error'))
      .finally(() => setImageUploading(false))
  }

  const moveImage = (index, dir) => {
    setForm((prev) => {
      const images = [...prev.images]
      const target = index + dir
      if (target < 0 || target >= images.length) return prev
      ;[images[index], images[target]] = [images[target], images[index]]
      return { ...prev, images }
    })
  }

  const removeImage = (index) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  const updateVariant = (index, field, value) => {
    setForm((prev) => {
      const variants = prev.variants.map((v, i) => (i === index ? { ...v, [field]: value } : v))
      return { ...prev, variants }
    })
  }

  const openAdd = () => {
    setEditingProduct(null)
    setForm(getDefaultForm())
    setShowModal(true)
  }

  const openEdit = (product) => {
    setEditingProduct(product)
    setForm({
      name: product.name,
      sku: product.sku || '',
      category: product.category,
      subCategory: product.subCategory || '',
      description: product.description || '',
      brand: product.brand || '',
      price: product.price != null ? String(product.price) : '',
      originalPrice: product.originalPrice && Number(product.originalPrice) !== Number(product.price) ? String(product.originalPrice) : '',
      discount: product.discountPercentage && product.discountPercentage > 0 ? String(product.discountPercentage) : '',
      stock: product.stock != null ? String(product.stock) : '',
      active: product.active !== false,
      featured: !!product.featured,
      trending: !!product.trending,
      newArrival: !!product.isNewArrival,
      onSale: !!product.isOnSale,
      images: product.gallery && product.gallery.length ? [...product.gallery] : (product.image ? [product.image] : []),
      variants: (product.variants || []).map((v) => ({
        size: v.size || '',
        color: v.color || '',
        stock: v.stock || 0,
        priceOverride: v.priceOverride != null ? String(v.priceOverride) : '',
        sku: v.sku || '',
      })),
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    const name = (form.name || '').trim()
    const sku = (form.sku || '').trim()
    const price = parseFloat(form.price)
    if (!name || !sku || !form.category || !price || price <= 0) {
      showToast('Please fill in required fields (Name, SKU, Category, Price)', 'error')
      return
    }
    if (form.images.length > MAX_IMAGES) {
      showToast(`A product can have at most ${MAX_IMAGES} images`, 'error')
      return
    }
    if (form.variants.length > MAX_VARIANTS) {
      showToast(`A product can have at most ${MAX_VARIANTS} variants`, 'error')
      return
    }
    const variants = form.variants
      .map((v) => ({
        size: (v.size || '').trim(),
        color: (v.color || '').trim(),
        stock: parseInt(v.stock, 10) || 0,
        priceOverride: v.priceOverride === '' ? null : parseFloat(v.priceOverride),
        sku: (v.sku || '').trim(),
      }))
      .filter((v) => v.size || v.color)

    const payload = {
      name,
      sku,
      description: form.description || '',
      brand: form.brand || '',
      price,
      originalPrice: form.originalPrice === '' ? null : parseFloat(form.originalPrice),
      discountPercentage: form.discount === '' ? 0 : Math.min(100, Math.max(0, parseFloat(form.discount) || 0)),
      stock: parseInt(form.stock, 10) || 0,
      featured: form.featured,
      trending: form.trending,
      newArrival: form.newArrival,
      onSale: form.onSale,
      active: form.active,
      categoryId: lookupCategoryId(form.category),
      subCategoryId: form.subCategory ? lookupSubCategoryId(form.category, form.subCategory) : null,
      images: form.images.filter(Boolean),
      variants,
    }

    setSaving(true)
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, payload)
        showToast(`Product "${name}" updated successfully`, 'success')
      } else {
        await productService.createProduct(payload)
        showToast(`Product "${name}" added successfully`, 'success')
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
      await productService.updateProduct(id, productToPayload({ ...product, featured: !product.featured }))
      fetchProducts()
    } catch (err) {
      showToast(err.message || 'Failed to update product', 'error')
    }
  }

  const toggleActive = async (id) => {
    const product = products.find((p) => p.id === id)
    if (!product) return
    try {
      await productService.updateProduct(id, productToPayload({ ...product, active: !(product.active !== false) }))
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
    if (selectedIds.size === products.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(products.map((p) => p.id)))
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

  const subcategories = filterSubcategories()
  const modalSubs = modalSubcategories()

  return (
    <div className="h-full flex flex-col gap-2 py-3">
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-lg font-bold text-[var(--text-primary)] font-['Playfair_Display']">Products</h1>
          <span className="text-xs text-[var(--text-secondary)]">{pageInfo.totalElements}</span>
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
          <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setSubcategoryFilter(''); setCurrentPage(1) }}
            className="flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs text-[var(--text-secondary)] focus:outline-none focus:border-[#C6A972]">
            <option value="">All</option>
            {categories.map((c) => (<option key={c.id} value={c.name}>{c.name}</option>))}
          </select>
          {subcategories.length > 0 && (
            <select value={subcategoryFilter} onChange={(e) => { setSubcategoryFilter(e.target.value); setCurrentPage(1) }}
              className="flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs text-[var(--text-secondary)] focus:outline-none focus:border-[#C6A972]">
              <option value="">All Sub</option>
              {subcategories.map((s) => (<option key={s.id} value={s.name}>{s.name}</option>))}
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
                  <input type="checkbox" checked={products.length > 0 && selectedIds.size === products.length} onChange={toggleAll} className="accent-[#C6A972]" />
                </th>
                <th className="text-left py-2 px-2 text-[var(--text-secondary)] font-medium w-10 hidden sm:table-cell">Image</th>
                <th className="text-left py-2 px-2 text-[var(--text-secondary)] font-medium">Name</th>
                <th className="text-left py-2 px-2 text-[var(--text-secondary)] font-medium hidden lg:table-cell">SKU</th>
                <th className="text-left py-2 px-2 text-[var(--text-secondary)] font-medium hidden md:table-cell">Category</th>
                <th className="text-right py-2 px-2 text-[var(--text-secondary)] font-medium">Price</th>
                <th className="text-right py-2 px-2 text-[var(--text-secondary)] font-medium hidden sm:table-cell">Stock</th>
                <th className="text-left py-2 px-2 text-[var(--text-secondary)] font-medium hidden md:table-cell">Status</th>
                <th className="text-right py-2 px-2 text-[var(--text-secondary)] font-medium w-20 sm:w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className={`border-b border-[var(--border-color)]/30 hover:bg-[var(--bg-hover)] transition-colors ${product.active === false ? 'opacity-60' : ''}`}>
                  <td className="py-1.5 px-2">
                    <input type="checkbox" checked={selectedIds.has(product.id)} onChange={() => toggleBulkSelect(product.id)} className="accent-[#C6A972]" />
                  </td>
                  <td className="py-2 px-2 hidden sm:table-cell">
                    <img src={getAssetUrl(product.image) || '/assets/placeholders/product.svg'} alt="" className="w-8 h-8 rounded object-cover bg-[var(--bg-input)]" onError={(e) => { e.target.src = '/assets/placeholders/product.svg' }} />
                  </td>
                  <td className="py-2 px-2 text-[var(--text-primary)] truncate max-w-[120px] sm:max-w-[160px] text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-block sm:hidden w-2 h-2 rounded-full flex-shrink-0 ${product.stock === 0 ? 'bg-red-400' : product.stock <= 10 ? 'bg-yellow-400' : 'bg-green-400'}`} />
                      <span className="truncate">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-2 px-2 text-[var(--text-secondary)] hidden lg:table-cell text-[11px] font-mono">{product.sku || '—'}</td>
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
                  <td className="py-2 px-2 hidden md:table-cell">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${product.active === false ? 'bg-red-500/10 text-red-600' : 'bg-green-500/10 text-green-600'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${product.active === false ? 'bg-red-500' : 'bg-green-500'}`} />
                      {product.active === false ? 'Inactive' : 'Active'}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      <button onClick={() => toggleFeatured(product.id)}
                        className={`p-1.5 sm:p-1 rounded transition-colors ${product.featured ? 'text-[#C6A972]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                        title={product.featured ? 'Unfeature' : 'Feature'}>
                        <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill={product.featured ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      </button>
                      <button onClick={() => toggleActive(product.id)}
                        className={`p-1.5 sm:p-1 rounded transition-colors ${product.active === false ? 'text-red-600' : 'text-[var(--text-secondary)] hover:text-green-600'}`}
                        title={product.active === false ? 'Activate' : 'Deactivate'}>
                        <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/></svg>
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
                <tr><td colSpan={9} className="text-center py-8 text-[var(--text-secondary)] text-xs">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading...
                  </div>
                </td></tr>
              )}
              {!loading && products.length === 0 && (
                <tr><td colSpan={9} className="text-center py-8 text-[var(--text-secondary)] text-xs">No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {pageInfo.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-2 border-t border-[var(--border-color)]/50 flex-shrink-0">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 text-xs font-medium transition-colors">Prev</button>
            <span className="text-[11px] text-[var(--text-secondary)] font-medium">Page {currentPage} of {pageInfo.totalPages}</span>
            <button onClick={() => setCurrentPage((p) => Math.min(pageInfo.totalPages, p + 1))} disabled={currentPage >= pageInfo.totalPages}
              className="px-3 py-1.5 rounded-lg bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 text-xs font-medium transition-colors">Next</button>
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border-color)] shadow-xl max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[var(--text-primary)] font-semibold mb-2">Delete Product</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">Are you sure you want to delete this product? It will be hidden from the storefront.</p>
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
          <div className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border-color)] shadow-xl max-w-3xl w-full mx-4 my-8 max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#C6A972]" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs text-[var(--text-secondary)] mb-1">SKU *</label>
                <input type="text" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="e.g. GUC-TS-001"
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
                  disabled={!form.category || modalSubs.length === 0}>
                  <option value="">{!form.category ? 'Select category first' : 'None'}</option>
                  {modalSubs.map((s) => (<option key={s.id} value={s.name}>{s.name}</option>))}
                </select>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Brand</label>
                <input type="text" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#C6A972]" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Price *</label>
                <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#C6A972]" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Compare-at Price</label>
                <input type="number" min="0" step="0.01" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#C6A972]" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Discount (%)</label>
                <input type="number" min="0" max="100" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#C6A972]" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Stock</label>
                <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#C6A972]" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#C6A972]" />
              </div>

              <div className="col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs text-[var(--text-secondary)]">Gallery ({form.images.length}/{MAX_IMAGES})</label>
                  <label className="text-xs text-[#C6A972] cursor-pointer font-medium">
                    {imageUploading ? 'Uploading...' : '+ Upload image'}
                    <input type="file" accept="image/*" className="hidden" disabled={imageUploading || form.images.length >= MAX_IMAGES}
                      onChange={(e) => handleImageUpload(e.target.files[0])} />
                  </label>
                </div>
                {form.images.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {form.images.map((url, index) => (
                      <div key={`${index}-${url}`} className="relative flex-shrink-0">
                        <div className="w-20 h-20 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] overflow-hidden">
                          <img src={getAssetUrl(url)} alt={`Product ${index + 1}`} className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = '/assets/placeholders/product.svg' }} />
                        </div>
                        {index === 0 && (
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-[#C6A972] text-white text-[9px] font-semibold rounded">Primary</span>
                        )}
                        <div className="absolute -bottom-1 -right-1 flex gap-0.5">
                          <button type="button" onClick={() => moveImage(index, -1)} disabled={index === 0}
                            className="w-6 h-6 rounded bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs disabled:opacity-30">‹</button>
                          <button type="button" onClick={() => moveImage(index, 1)} disabled={index === form.images.length - 1}
                            className="w-6 h-6 rounded bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs disabled:opacity-30">›</button>
                          <button type="button" onClick={() => removeImage(index)}
                            className="w-6 h-6 rounded bg-red-500/20 text-red-600 text-xs hover:bg-red-500/30">×</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {form.images.length === 0 && (
                  <p className="text-xs text-[var(--text-secondary)]">No images yet. Upload product images (first image becomes primary).</p>
                )}
              </div>

              <div className="col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs text-[var(--text-secondary)]">Variants ({form.variants.length}/{MAX_VARIANTS})</label>
                  <button type="button" onClick={() => setForm((prev) => prev.variants.length >= MAX_VARIANTS ? prev : { ...prev, variants: [...prev.variants, getEmptyVariant()] })}
                    className="text-xs text-[#C6A972] font-medium">+ Add variant</button>
                </div>
                {form.variants.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-[var(--text-secondary)]">
                          <th className="py-1 pr-2 font-medium">Size</th>
                          <th className="py-1 pr-2 font-medium">Color</th>
                          <th className="py-1 pr-2 font-medium w-20">Stock</th>
                          <th className="py-1 pr-2 font-medium w-24">Price</th>
                          <th className="py-1 pr-2 font-medium">Variant SKU</th>
                          <th className="py-1 w-8" />
                        </tr>
                      </thead>
                      <tbody>
                        {form.variants.map((v, index) => (
                          <tr key={index}>
                            <td className="py-1 pr-2">
                              <input type="text" value={v.size} maxLength={20} placeholder="M"
                                onChange={(e) => updateVariant(index, 'size', e.target.value)}
                                className="w-14 bg-[var(--bg-input)] border border-[var(--border-color)] rounded px-2 py-1 text-[var(--text-primary)] focus:outline-none focus:border-[#C6A972]" />
                            </td>
                            <td className="py-1 pr-2">
                              <input type="text" value={v.color} maxLength={50} placeholder="Black"
                                onChange={(e) => updateVariant(index, 'color', e.target.value)}
                                className="w-24 bg-[var(--bg-input)] border border-[var(--border-color)] rounded px-2 py-1 text-[var(--text-primary)] focus:outline-none focus:border-[#C6A972]" />
                            </td>
                            <td className="py-1 pr-2">
                              <input type="number" min="0" value={v.stock}
                                onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                                className="w-16 bg-[var(--bg-input)] border border-[var(--border-color)] rounded px-2 py-1 text-[var(--text-primary)] focus:outline-none focus:border-[#C6A972]" />
                            </td>
                            <td className="py-1 pr-2">
                              <input type="number" min="0" step="0.01" value={v.priceOverride}
                                onChange={(e) => updateVariant(index, 'priceOverride', e.target.value)}
                                className="w-20 bg-[var(--bg-input)] border border-[var(--border-color)] rounded px-2 py-1 text-[var(--text-primary)] focus:outline-none focus:border-[#C6A972]" />
                            </td>
                            <td className="py-1 pr-2">
                              <input type="text" value={v.sku} maxLength={50}
                                onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                className="w-28 bg-[var(--bg-input)] border border-[var(--border-color)] rounded px-2 py-1 text-[var(--text-primary)] focus:outline-none focus:border-[#C6A972]" />
                            </td>
                            <td className="py-1">
                              <button type="button" onClick={() => setForm((prev) => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }))}
                                className="w-6 h-6 rounded bg-red-500/20 text-red-600 text-xs hover:bg-red-500/30">×</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 col-span-2">
                <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="accent-[#C6A972]" /> Featured
                </label>
                <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <input type="checkbox" checked={form.trending} onChange={(e) => setForm({ ...form, trending: e.target.checked })} className="accent-[#C6A972]" /> Trending
                </label>
                <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <input type="checkbox" checked={form.newArrival} onChange={(e) => setForm({ ...form, newArrival: e.target.checked })} className="accent-[#C6A972]" /> New Arrival
                </label>
                <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <input type="checkbox" checked={form.onSale} onChange={(e) => setForm({ ...form, onSale: e.target.checked })} className="accent-[#C6A972]" /> On Sale
                </label>
                <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="accent-[#C6A972]" /> Active
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
