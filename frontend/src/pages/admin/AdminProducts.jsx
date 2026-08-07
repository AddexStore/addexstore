import { useState, useEffect, useCallback, useRef } from 'react'
import { categoryService } from '../../services/categoryService'
import { productService } from '../../services/productService'
import { mapProduct, mapCategory } from '../../services/mappers'
import { useToast } from '../../context/ToastContext'
import { formatPrice } from '../../utils/helpers'
import { getAssetUrl } from '../../services/api'
import BackButton from '../../components/BackButton'

const MAX_IMAGES = 10
const MAX_VARIANTS = 50
const MAX_FILE_SIZE = 5 * 1024 * 1024
const PAGE_SIZES = [10, 25, 50, 100]

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
  stock: '0',
  active: true,
  featured: false,
  trending: false,
  newArrival: false,
  onSale: false,
  images: [],
  variants: [],
})

const getEmptyVariant = () => ({ id: null, size: '', color: '', stock: 0, priceOverride: '', sku: '' })

const emptyErrors = () => ({
  name: '', sku: '', category: '', subCategory: '', price: '', originalPrice: '',
  discount: '', stock: '', variants: '', images: '',
})

const formatDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

const buildFormFromProduct = (product) => ({
  name: product.name,
  sku: product.sku || '',
  category: product.category || '',
  subCategory: product.subCategory || '',
  description: product.description || '',
  brand: product.brand || '',
  price: product.price != null ? String(product.price) : '',
  originalPrice: product.originalPrice && Number(product.originalPrice) !== Number(product.price) ? String(product.originalPrice) : '',
  discount: product.discountPercentage > 0 ? String(product.discountPercentage) : '',
  stock: product.stock != null ? String(product.stock) : '0',
  active: product.active !== false,
  featured: !!product.featured,
  trending: !!product.trending,
  newArrival: !!product.isNewArrival,
  onSale: !!product.isOnSale,
  images: [...(product.gallery && product.gallery.length ? product.gallery : (product.image ? [product.image] : []))],
  variants: (product.variants || []).map((v) => ({
    id: v.id ?? null,
    size: v.size || '',
    color: v.color || '',
    stock: v.stock ?? 0,
    priceOverride: v.priceOverride != null ? String(v.priceOverride) : '',
    sku: v.sku || '',
  })),
})

function StockBadge({ stock }) {
  const n = Number(stock) || 0
  const color = n === 0 ? 'text-red-600 bg-red-500/10' : n <= 10 ? 'text-yellow-600 bg-yellow-500/10' : 'text-green-600 bg-green-500/10'
  const label = n === 0 ? 'OOS' : n <= 10 ? 'Low' : 'In Stock'
  return <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${color}`}>{label} · {n}</span>
}

function FlagToggle({ active, title, onClick, disabled, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1 rounded transition-colors ${active ? 'text-[#C6A972]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'} disabled:opacity-40`}
    >
      {children}
    </button>
  )
}

export default function AdminProducts() {
  const { showToast } = useToast()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageInfo, setPageInfo] = useState({ totalElements: 0, totalPages: 0 })

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [subcategoryFilter, setSubcategoryFilter] = useState('')
  const [stockFilter, setStockFilter] = useState('')
  const [sortField, setSortField] = useState('createdAt')
  const [sortDir, setSortDir] = useState('desc')
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)
  const [closeConfirm, setCloseConfirm] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [pendingToggles, setPendingToggles] = useState(new Set())
  const [form, setForm] = useState(getDefaultForm())
  const [formErrors, setFormErrors] = useState(emptyErrors())
  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [pendingReplaceIndex, setPendingReplaceIndex] = useState(null)
  const fileInputRef = useRef(null)

  const requestIdRef = useRef(0)
  const debounceRef = useRef(null)

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

  const loadCategories = useCallback(() => {
    categoryService.getAllAdmin()
      .then((res) => setCategories((res.data || []).map(mapCategory)))
      .catch(() => showToast('Failed to load categories', 'error'))
  }, [showToast])

  useEffect(() => { loadCategories() }, [loadCategories])

  const fetchProducts = useCallback(() => {
    const requestId = ++requestIdRef.current
    setLoading(true)
    const params = { page: currentPage - 1, size: pageSize, sort: `${sortField},${sortDir}` }
    if (search) params.search = search
    const cat = categories.find((c) => c.name === categoryFilter)
    if (cat) params.category = cat.id
    const sub = cat?.subcategories?.find((s) => s.name === subcategoryFilter)
    if (sub) params.subcategory = sub.id
    if (stockFilter) params.stockStatus = stockFilter
    productService.getAdminProducts(params)
      .then((data) => {
        if (requestId !== requestIdRef.current) return
        const list = (data.content || []).map(mapProduct)
        const totalPages = data.totalPages || 1
        setProducts(list)
        setPageInfo({ totalElements: data.totalElements || list.length, totalPages })
        if (currentPage > totalPages) setCurrentPage(Math.max(1, totalPages))
      })
      .catch(() => { if (requestId === requestIdRef.current) showToast('Failed to load products', 'error') })
      .finally(() => { if (requestId === requestIdRef.current) setLoading(false) })
  }, [currentPage, search, categoryFilter, subcategoryFilter, stockFilter, sortField, sortDir, pageSize, categories, showToast])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  useEffect(() => () => clearTimeout(debounceRef.current), [])

  const onSearchChange = (e) => {
    const value = e.target.value
    setSearchInput(value)
    setCurrentPage(1)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setSearch(value.trim()), 350)
  }

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
    setCurrentPage(1)
  }

  const filterSubcategories = useCallback(() => {
    const cat = categories.find((c) => c.name === categoryFilter)
    return cat?.subcategories || []
  }, [categories, categoryFilter])

  const modalSubcategories = useCallback(() => {
    const cat = categories.find((c) => c.name === form.category)
    return cat?.subcategories || []
  }, [categories, form.category])

  const openAdd = () => {
    setEditingProduct(null)
    setForm(getDefaultForm())
    setFormErrors(emptyErrors())
    setCloseConfirm(false)
    setShowModal(true)
  }

  const openEdit = (product) => {
    setEditingProduct(product)
    setForm(buildFormFromProduct(product))
    setFormErrors(emptyErrors())
    setCloseConfirm(false)
    setShowModal(true)
  }

  const openDuplicate = (product) => {
    setEditingProduct(null)
    setForm({ ...buildFormFromProduct(product), name: `${product.name} (copy)`, sku: `${(product.sku || 'PRODUCT').slice(0, 40)}-COPY` })
    setFormErrors(emptyErrors())
    setCloseConfirm(false)
    setShowModal(true)
  }

  const tryCloseModal = () => {
    if (formDirty()) setCloseConfirm(true)
    else { setShowModal(false); setEditingProduct(null) }
  }

  const formDirty = () => {
    const f = JSON.stringify(form)
    const base = editingProduct ? JSON.stringify(buildFormFromProduct(editingProduct)) : JSON.stringify(getDefaultForm())
    return f !== base
  }

  const validateForm = () => {
    const errors = emptyErrors()
    let ok = true
    const name = (form.name || '').trim()
    const sku = (form.sku || '').trim()
    const price = parseFloat(form.price)
    const originalPrice = form.originalPrice === '' ? null : parseFloat(form.originalPrice)
    const discount = form.discount === '' ? 0 : parseFloat(form.discount)
    const stock = parseInt(form.stock, 10)

    if (!name) { errors.name = 'Name is required'; ok = false } else if (name.length > 200) { errors.name = 'Max 200 characters'; ok = false }
    if (!sku) { errors.sku = 'SKU is required'; ok = false } else if (sku.length > 50) { errors.sku = 'Max 50 characters'; ok = false }
    if (!form.category) { errors.category = 'Category is required'; ok = false } else if (!lookupCategoryId(form.category)) { errors.category = 'Category is invalid'; ok = false }
    if (isNaN(price) || price <= 0) { errors.price = 'Enter a price greater than 0'; ok = false }
    if (form.originalPrice !== '' && (isNaN(originalPrice) || originalPrice < 0)) { errors.originalPrice = 'Invalid compare-at price'; ok = false }
    else if (originalPrice !== null && originalPrice < price) { errors.originalPrice = 'Compare-at price must be ≥ selling price'; ok = false }
    if (form.discount !== '' && (isNaN(discount) || discount < 0 || discount > 100)) { errors.discount = 'Discount must be between 0 and 100'; ok = false }
    if (isNaN(stock)) { errors.stock = 'Enter a valid stock number'; ok = false } else if (stock < 0) { errors.stock = 'Stock cannot be negative'; ok = false }

    const seen = new Set()
    const variants = []
    for (const v of form.variants) {
      const size = (v.size || '').trim()
      const color = (v.color || '').trim()
      if (!size && !color) continue
      const vs = parseInt(v.stock, 10)
      const po = v.priceOverride === '' ? null : parseFloat(v.priceOverride)
      if (isNaN(vs) || vs < 0) { errors.variants = 'Variant stock cannot be negative'; ok = false; break }
      if (po !== null && (isNaN(po) || po < 0)) { errors.variants = 'Variant price cannot be negative'; ok = false; break }
      const key = `${size}|${color}`
      if (seen.has(key)) { errors.variants = `Duplicate variant (${size || 'No size'}, ${color || 'No color'})`; ok = false; break }
      seen.add(key)
      variants.push({ id: v.id ?? null, size, color, stock: vs, priceOverride: po, sku: (v.sku || '').trim() })
    }
    if (variants.length > MAX_VARIANTS) { errors.variants = `A product can have at most ${MAX_VARIANTS} variants`; ok = false }

    const images = [...new Set(form.images.filter(Boolean))]
    if (images.length > MAX_IMAGES) { errors.images = `A product can have at most ${MAX_IMAGES} images`; ok = false }

    setFormErrors(errors)
    return ok ? { variants, images } : null
  }

  const handleSave = async () => {
    const result = validateForm()
    if (!result) {
      showToast('Please fix the highlighted fields', 'error')
      return
    }
    const { variants, images } = result
    const name = (form.name || '').trim()
    const sku = (form.sku || '').trim()
    const price = parseFloat(form.price)
    const originalPrice = form.originalPrice === '' ? null : parseFloat(form.originalPrice)
    const discount = form.discount === '' ? 0 : parseFloat(form.discount)
    const stock = parseInt(form.stock, 10)

    const payload = {
      name,
      sku,
      description: form.description || '',
      brand: form.brand || '',
      price,
      originalPrice,
      discountPercentage: discount,
      stock,
      featured: form.featured,
      trending: form.trending,
      newArrival: form.newArrival,
      onSale: form.onSale,
      active: form.active,
      categoryId: lookupCategoryId(form.category),
      subCategoryId: form.subCategory ? lookupSubCategoryId(form.category, form.subCategory) : null,
      images,
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
      setEditingProduct(null)
      fetchProducts()
      loadCategories()
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
      showToast(`Product "${product?.name || id}" deleted`, 'success')
      fetchProducts()
      loadCategories()
    } catch (err) {
      showToast(err.message || 'Failed to delete product', 'error')
    } finally {
      setDeletingId(null)
      setDeleteConfirm(null)
    }
  }

  const deleteSelected = async () => {
    if (selectedIds.size === 0) return
    setBulkDeleting(true)
    const ids = Array.from(selectedIds)
    let failed = 0
    for (const id of ids) {
      try {
        await productService.deleteProduct(id)
      } catch (err) {
        failed += 1
      }
    }
    const done = ids.length - failed
    showToast(done > 0 ? `${done} product(s) deleted${failed ? `, ${failed} failed` : ''}` : 'Delete failed', done > 0 ? 'success' : 'error')
    setSelectedIds(new Set())
    setBulkDeleteConfirm(false)
    fetchProducts()
    loadCategories()
    setBulkDeleting(false)
  }

  const toggleFlag = async (id, field, value) => {
    const product = products.find((p) => p.id === id)
    if (!product || pendingToggles.has(id)) return
    setPendingToggles((prev) => new Set(prev).add(id))
    try {
      const res = await productService.patchProduct(id, { [field]: value })
      const updated = mapProduct(res.data || res)
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)))
      if (field === 'active') loadCategories()
    } catch (err) {
      showToast(err.message || 'Failed to update product', 'error')
    } finally {
      setPendingToggles((prev) => { const s = new Set(prev); s.delete(id); return s })
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

  const handleImageUpload = (file, replaceIndex = null) => {
    if (!file) return
    if (!file.type || !file.type.startsWith('image/')) { showToast('Please choose an image file', 'error'); return }
    if (file.size > MAX_FILE_SIZE) { showToast('Image must be 5MB or smaller', 'error'); return }
    if (replaceIndex === null && form.images.length >= MAX_IMAGES) { showToast(`A product can have at most ${MAX_IMAGES} images`, 'error'); return }
    setUploadingImages(true)
    setUploadProgress(0)
    productService.uploadImage(file, (loaded, total) => {
      setUploadProgress(total ? Math.round((loaded / total) * 100) : 0)
    })
      .then((url) => {
        if (!url) throw new Error('Upload returned no URL')
        setForm((prev) => {
          if (replaceIndex !== null) {
            return { ...prev, images: prev.images.map((u, i) => (i === replaceIndex ? url : u)) }
          }
          return { ...prev, images: [...prev.images, url] }
        })
      })
      .catch((err) => showToast(err.message || 'Failed to upload image', 'error'))
      .finally(() => {
        setUploadingImages(false)
        setPendingReplaceIndex(null)
        setUploadProgress(0)
      })
  }

  const removeImage = (index) => {
    const url = form.images[index]
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
    if (!editingProduct && url) {
      productService.deleteImage(url).catch(() => {})
    }
  }

  const setPrimary = (index) => {
    setForm((prev) => {
      if (index === 0) return prev
      const images = [...prev.images]
      const [img] = images.splice(index, 1)
      images.unshift(img)
      return { ...prev, images }
    })
  }

  const updateVariant = (index, field, value) => {
    setForm((prev) => {
      const variants = prev.variants.map((v, i) => (i === index ? { ...v, [field]: value } : v))
      return { ...prev, variants }
    })
  }

  const subcategories = filterSubcategories()
  const modalSubs = modalSubcategories()

  const sortableTh = (label, field) => {
    const active = sortField === field
    return (
      <th className="text-left py-2 px-2 text-[var(--text-secondary)] font-medium whitespace-nowrap">
        <button onClick={() => toggleSort(field)} className="inline-flex items-center gap-1 uppercase tracking-wide text-[10px] hover:text-[var(--text-primary)] transition-colors">
          {label}
          <svg className={`w-3 h-3 ${active ? 'text-[#C6A972]' : 'opacity-40'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {active ? (sortDir === 'asc'
              ? <path d="M12 5v14M19 12l-7 7-7-7" />
              : <path d="M12 19V5M5 12l7-7 7 7" />)
              : <path d="M12 5v14M5 12l7-7 7 7" />}
          </svg>
        </button>
      </th>
    )
  }

  const pageNumbers = []
  const maxPages = pageInfo.totalPages
  let pStart = Math.max(1, currentPage - 2)
  let pEnd = Math.min(maxPages, pStart + 4)
  pStart = Math.max(1, pEnd - 4)
  for (let i = pStart; i <= pEnd; i++) pageNumbers.push(i)

  return (
    <div className="h-full flex flex-col gap-2 py-3">
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-lg font-bold text-[var(--text-primary)] font-['Playfair_Display']">Products</h1>
          <span className="text-xs text-[var(--text-secondary)]">{pageInfo.totalElements} items</span>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <button onClick={() => setBulkDeleteConfirm(true)} disabled={bulkDeleting}
              className="px-3 py-1.5 bg-red-500/20 text-red-600 rounded-lg text-xs font-medium hover:bg-red-500/30 transition-colors disabled:opacity-40">
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
          type="text" placeholder="Search by name or brand..."
          value={searchInput}
          onChange={onSearchChange}
          className="w-full sm:flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#C6A972]"
        />
        <div className="flex gap-2">
          <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setSubcategoryFilter(''); setCurrentPage(1) }}
            className="flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs text-[var(--text-secondary)] focus:outline-none focus:border-[#C6A972]">
            <option value="">All Categories</option>
            {categories.map((c) => (<option key={c.id} value={c.name}>{c.name}</option>))}
          </select>
          {subcategories.length > 0 && (
            <select value={subcategoryFilter} onChange={(e) => { setSubcategoryFilter(e.target.value); setCurrentPage(1) }}
              className="flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs text-[var(--text-secondary)] focus:outline-none focus:border-[#C6A972]">
              <option value="">All Subs</option>
              {subcategories.map((s) => (<option key={s.id} value={s.name}>{s.name}</option>))}
            </select>
          )}
          <select value={stockFilter} onChange={(e) => { setStockFilter(e.target.value); setCurrentPage(1) }}
            className="flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs text-[var(--text-secondary)] focus:outline-none focus:border-[#C6A972]">
            <option value="">All Stock</option>
            <option value="in">In Stock</option>
            <option value="low">Low</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)]/50 overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--border-color)] sticky top-0 bg-[var(--bg-card)] z-10">
                <th className="py-2 px-2 w-8">
                  <input type="checkbox" checked={products.length > 0 && selectedIds.size === products.length} onChange={toggleAll} className="accent-[#C6A972]" />
                </th>
                <th className="text-left py-2 px-2 text-[var(--text-secondary)] font-medium w-10">Image</th>
                {sortableTh('Name', 'name')}
                <th className="text-left py-2 px-2 text-[var(--text-secondary)] font-medium hidden xl:table-cell whitespace-nowrap">Brand</th>
                <th className="text-left py-2 px-2 text-[var(--text-secondary)] font-medium hidden lg:table-cell">Category</th>
                <th className="text-right py-2 px-2 text-[var(--text-secondary)] font-medium whitespace-nowrap">Original Price</th>
                <th className="text-right py-2 px-2 text-[var(--text-secondary)] font-medium whitespace-nowrap">Discount %</th>
                <th className="text-right py-2 px-2 text-[var(--text-secondary)] font-medium whitespace-nowrap">Discount Amt</th>
                {sortableTh('Selling Price', 'price')}
                {sortableTh('Stock', 'stock')}
                <th className="text-left py-2 px-2 text-[var(--text-secondary)] font-medium">Status</th>
                <th className="text-left py-2 px-2 text-[var(--text-secondary)] font-medium">Feat</th>
                <th className="text-left py-2 px-2 text-[var(--text-secondary)] font-medium">Trend</th>
                <th className="text-left py-2 px-2 text-[var(--text-secondary)] font-medium">New</th>
                <th className="text-left py-2 px-2 text-[var(--text-secondary)] font-medium">Sale</th>
                {sortableTh('Created', 'createdAt')}
                {sortableTh('Updated', 'updatedAt')}
                <th className="text-right py-2 px-2 text-[var(--text-secondary)] font-medium w-28">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const disabled = pendingToggles.has(product.id)
                const originalPrice = product.originalPrice && Number(product.originalPrice) > Number(product.price)
                  ? Number(product.originalPrice)
                  : null
                const discountPct = Number(product.discountPercentage) || 0
                const discountAmt = originalPrice != null
                  ? Math.max(0, originalPrice - Number(product.price))
                  : discountPct > 0 ? Math.round((Number(product.price) * discountPct) / 100 * 100) / 100 : 0
                return (
                  <tr key={product.id} className={`border-b border-[var(--border-color)]/30 hover:bg-[var(--bg-hover)] transition-colors ${product.active === false ? 'opacity-60' : ''}`}>
                    <td className="py-1.5 px-2">
                      <input type="checkbox" checked={selectedIds.has(product.id)} onChange={() => toggleBulkSelect(product.id)} className="accent-[#C6A972]" />
                    </td>
                    <td className="py-2 px-2">
                      <img src={getAssetUrl(product.image) || '/assets/placeholders/product.svg'} alt="" className="w-8 h-8 rounded object-cover bg-[var(--bg-input)]" onError={(e) => { e.target.src = '/assets/placeholders/product.svg' }} />
                    </td>
                    <td className="py-2 px-2 text-[var(--text-primary)] truncate max-w-[140px] xl:max-w-[200px]">
                      <span className="truncate">{product.name}</span>
                      <span className="block text-[10px] text-[var(--text-muted)] font-mono hidden sm:block">{product.sku}</span>
                    </td>
                    <td className="py-2 px-2 text-[var(--text-secondary)] hidden xl:table-cell">{product.brand || '—'}</td>
                    <td className="py-2 px-2 text-[var(--text-secondary)] hidden lg:table-cell">{product.category || '—'}</td>
                    <td className="py-2 px-2 text-right whitespace-nowrap">
                      {originalPrice != null
                        ? <span className="text-[var(--text-secondary)] line-through">{formatPrice(originalPrice, '₹')}</span>
                        : <span className="text-[var(--text-muted)]">—</span>}
                    </td>
                    <td className="py-2 px-2 text-right whitespace-nowrap">
                      {discountPct > 0 ? <span className="text-[#EF4444] font-semibold">-{discountPct}%</span> : <span className="text-[var(--text-muted)]">—</span>}
                    </td>
                    <td className="py-2 px-2 text-right whitespace-nowrap">
                      {discountAmt > 0 ? <span className="text-[#EF4444]">{formatPrice(discountAmt, '₹')}</span> : <span className="text-[var(--text-muted)]">—</span>}
                    </td>
                    <td className="py-2 px-2 text-right whitespace-nowrap text-[var(--text-primary)] font-semibold">{formatPrice(product.price, '₹')}</td>
                    <td className="py-2 px-2 text-right"><StockBadge stock={product.stock} /></td>
                    <td className="py-2 px-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${product.active === false ? 'bg-red-500/10 text-red-600' : 'bg-green-500/10 text-green-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${product.active === false ? 'bg-red-500' : 'bg-green-500'}`} />
                        {product.active === false ? 'Inactive' : 'Active'}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <FlagToggle active={product.featured} disabled={disabled} title={product.featured ? 'Remove Featured' : 'Mark Featured'} onClick={() => toggleFlag(product.id, 'featured', !product.featured)}>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill={product.featured ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                      </FlagToggle>
                    </td>
                    <td className="py-2 px-2">
                      <FlagToggle active={product.trending} disabled={disabled} title={product.trending ? 'Remove Trending' : 'Mark Trending'} onClick={() => toggleFlag(product.id, 'trending', !product.trending)}>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill={product.trending ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                      </FlagToggle>
                    </td>
                    <td className="py-2 px-2">
                      <FlagToggle active={product.isNewArrival} disabled={disabled} title={product.isNewArrival ? 'Remove New Arrival' : 'Mark New Arrival'} onClick={() => toggleFlag(product.id, 'newArrival', !product.isNewArrival)}>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill={product.isNewArrival ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                      </FlagToggle>
                    </td>
                    <td className="py-2 px-2">
                      <FlagToggle active={product.isOnSale} disabled={disabled} title={product.isOnSale ? 'Remove On Sale' : 'Mark On Sale'} onClick={() => toggleFlag(product.id, 'onSale', !product.isOnSale)}>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill={product.isOnSale ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
                      </FlagToggle>
                    </td>
                    <td className="py-2 px-2 text-[var(--text-muted)] whitespace-nowrap hidden lg:table-cell">{formatDate(product.createdAt)}</td>
                    <td className="py-2 px-2 text-[var(--text-muted)] whitespace-nowrap hidden lg:table-cell">{formatDate(product.updatedAt)}</td>
                    <td className="py-2 px-2 text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <button onClick={() => toggleFlag(product.id, 'active', !(product.active !== false))} disabled={disabled}
                          className={`p-1.5 sm:p-1 rounded transition-colors ${product.active === false ? 'text-red-600' : 'text-[var(--text-secondary)] hover:text-green-600'} disabled:opacity-40`}
                          title={product.active === false ? 'Activate' : 'Deactivate'}>
                          <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" /></svg>
                        </button>
                        <button onClick={() => openDuplicate(product)} className="p-1.5 sm:p-1 rounded text-[var(--text-secondary)] hover:text-[#C6A972] transition-colors" title="Duplicate">
                          <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                        </button>
                        <button onClick={() => openEdit(product)} className="p-1.5 sm:p-1 rounded text-[var(--text-secondary)] hover:text-[#C6A972] transition-colors" title="Edit">
                          <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button onClick={() => setDeleteConfirm(product.id)} className="p-1.5 sm:p-1 rounded text-[var(--text-secondary)] hover:text-red-600 transition-colors" title="Delete">
                          <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {loading && (
                <tr><td colSpan={18} className="text-center py-8 text-[var(--text-secondary)] text-xs">
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
                <tr><td colSpan={18} className="text-center py-8 text-[var(--text-secondary)] text-xs">No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {pageInfo.totalPages > 1 && (
          <div className="flex items-center justify-between gap-2 py-2 px-3 border-t border-[var(--border-color)]/50 flex-shrink-0 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-[var(--text-secondary)]">Rows</span>
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1) }}
                className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded px-1.5 py-1 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#C6A972]">
                {PAGE_SIZES.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="px-2.5 py-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] disabled:opacity-30 text-xs font-medium transition-colors">Prev</button>
              {pageNumbers.map((n) => (
                <button key={n} onClick={() => setCurrentPage(n)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${n === currentPage ? 'bg-[#C6A972] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'}`}>{n}</button>
              ))}
              <button onClick={() => setCurrentPage((p) => Math.min(maxPages, p + 1))} disabled={currentPage >= maxPages}
                className="px-2.5 py-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] disabled:opacity-30 text-xs font-medium transition-colors">Next</button>
            </div>
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

      {bulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setBulkDeleteConfirm(false)}>
          <div className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border-color)] shadow-xl max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[var(--text-primary)] font-semibold mb-2">Delete {selectedIds.size} Products</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">These products will be hidden from the storefront. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setBulkDeleteConfirm(false)} disabled={bulkDeleting} className="flex-1 py-2 border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition disabled:opacity-40">Cancel</button>
              <button onClick={deleteSelected} disabled={bulkDeleting}
                className="flex-1 py-2 bg-red-500/20 text-red-600 rounded-lg text-sm font-medium hover:bg-red-500/30 transition disabled:opacity-40">
                {bulkDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 overflow-y-auto" onClick={tryCloseModal}>
          <div className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border-color)] shadow-xl max-w-3xl w-full mx-4 my-8 max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Name *</label>
                <input type="text" value={form.name} maxLength={200} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#C6A972]" />
                {formErrors.name && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.name}</p>}
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs text-[var(--text-secondary)] mb-1">SKU *</label>
                <input type="text" value={form.sku} maxLength={50} placeholder="e.g. GUC-TS-001" onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#C6A972]" />
                {formErrors.sku && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.sku}</p>}
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Category *</label>
                <select value={form.category} onChange={(e) => { setForm({ ...form, category: e.target.value, subCategory: '' }) }}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#C6A972]">
                  <option value="">Select</option>
                  {categories.map((c) => (<option key={c.id} value={c.name}>{c.name}</option>))}
                </select>
                {formErrors.category && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.category}</p>}
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
                <input type="text" value={form.brand} maxLength={100} onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#C6A972]" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Selling Price (₹) *</label>
                <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#C6A972]" />
                {formErrors.price && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.price}</p>}
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Compare-at Price (₹)</label>
                <input type="number" min="0" step="0.01" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#C6A972]" />
                {formErrors.originalPrice && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.originalPrice}</p>}
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Discount (%)</label>
                <input type="number" min="0" max="100" step="0.01" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#C6A972]" />
                {formErrors.discount && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.discount}</p>}
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Stock</label>
                <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#C6A972]" />
                {formErrors.stock && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.stock}</p>}
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} maxLength={5000}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#C6A972]" />
              </div>

              <div className="col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs text-[var(--text-secondary)]">Gallery ({form.images.length}/{MAX_IMAGES})</label>
                  <label className={`text-xs text-[#C6A972] cursor-pointer font-medium ${uploadingImages || form.images.length >= MAX_IMAGES ? 'opacity-40 pointer-events-none' : ''}`} onClick={() => setPendingReplaceIndex(null)}>
                    {uploadingImages ? `Uploading ${uploadProgress}%` : '+ Upload image'}
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const file = e.target.files && e.target.files[0]; if (file) handleImageUpload(file, pendingReplaceIndex); e.target.value = '' }} />
                  </label>
                </div>
                {uploadingImages && (
                  <div className="h-1 w-full bg-[var(--bg-input)] rounded overflow-hidden mb-2">
                    <div className="h-full bg-[#C6A972] transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                )}
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
                          {index !== 0 && (
                            <button type="button" onClick={() => setPrimary(index)} title="Make primary"
                              className="w-6 h-6 rounded bg-[var(--bg-card)] border border-[var(--border-color)] text-[#C6A972] text-xs">★</button>
                          )}
                          <button type="button" onClick={() => { setPendingReplaceIndex(index); fileInputRef.current?.click() }}
                            disabled={uploadingImages}
                            className="w-6 h-6 rounded bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs disabled:opacity-40">↻</button>
                          <button type="button" onClick={() => removeImage(index)} disabled={uploadingImages}
                            className="w-6 h-6 rounded bg-red-500/20 text-red-600 text-xs hover:bg-red-500/30 disabled:opacity-40">×</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {form.images.length === 0 && (
                  <p className="text-xs text-[var(--text-secondary)]">No images yet. Upload product images (first image becomes primary).</p>
                )}
                {formErrors.images && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.images}</p>}
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
                          <tr key={v.id ?? `new-${index}`}>
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
                {formErrors.variants && <p className="text-[10px] text-red-500 mt-1">{formErrors.variants}</p>}
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
              <button onClick={tryCloseModal} disabled={saving} className="px-5 py-2 border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition disabled:opacity-40">Cancel</button>
              <button onClick={handleSave} disabled={saving || uploadingImages}
                className="px-5 py-2 bg-[#C6A972] text-white rounded-lg text-sm font-semibold hover:bg-[#B8965F] transition disabled:opacity-40">
                {saving ? 'Saving...' : (editingProduct ? 'Update' : 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {closeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setCloseConfirm(false)}>
          <div className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border-color)] shadow-xl max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[var(--text-primary)] font-semibold mb-2">Discard changes?</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">You have unsaved changes. Closing will discard them.</p>
            <div className="flex gap-3">
              <button onClick={() => setCloseConfirm(false)} className="flex-1 py-2 border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition">Keep Editing</button>
              <button onClick={() => { setCloseConfirm(false); setShowModal(false); setEditingProduct(null); setFormErrors(emptyErrors()) }}
                className="flex-1 py-2 bg-red-500/20 text-red-600 rounded-lg text-sm font-medium hover:bg-red-500/30 transition">Discard</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
