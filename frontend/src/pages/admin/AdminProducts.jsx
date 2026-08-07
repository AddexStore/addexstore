import { useState, useEffect, useCallback } from 'react'
import { categoryService } from '../../services/categoryService'
import { productService } from '../../services/productService'
import { mapProduct, mapCategory } from '../../services/mappers'
import { useToast } from '../../context/ToastContext'
import { getAssetUrl } from '../../services/api'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Icon from '../../components/ui/Icon'
import Modal, { ConfirmDialog } from '../../components/ui/Modal'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/EmptyState'
import Pagination from '../../components/ui/Pagination'
import { Field, Input, Textarea, Select, Checkbox } from '../../components/ui/Input'
import { Table, THead, TBody, TR, TH, TD } from '../../components/ui/Table'

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
    <div className="flex h-full flex-col gap-4 py-4">
      <PageHeader
        title="Products"
        description={`${pageInfo.totalElements} product${pageInfo.totalElements === 1 ? '' : 's'} in your catalog.`}
        actions={
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <Button
                variant="dangerSolid"
                size="sm"
                icon="Trash2"
                onClick={deleteSelected}
                disabled={bulkDeleting}
                loading={bulkDeleting}
              >
                Delete ({selectedIds.size})
              </Button>
            )}
            <Button size="sm" icon="Plus" onClick={openAdd}>
              Add Product
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative sm:flex-1">
          <Icon name="Search" size="sm" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
            className="h-11 w-full rounded-field border border-line bg-inset pl-10 pr-4 text-sm text-ink placeholder-faint transition-colors focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/25"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setSubcategoryFilter(''); setCurrentPage(1) }}
            className="h-11 cursor-pointer rounded-field border border-line bg-inset px-3 text-sm text-sub focus:border-gold-500 focus:outline-none"
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (<option key={c.id} value={c.name}>{c.name}</option>))}
          </select>
          {subcategories.length > 0 && (
            <select
              value={subcategoryFilter}
              onChange={(e) => { setSubcategoryFilter(e.target.value); setCurrentPage(1) }}
              className="h-11 cursor-pointer rounded-field border border-line bg-inset px-3 text-sm text-sub focus:border-gold-500 focus:outline-none"
              aria-label="Filter by subcategory"
            >
              <option value="">All Sub</option>
              {subcategories.map((s) => (<option key={s.id} value={s.name}>{s.name}</option>))}
            </select>
          )}
          <select
            value={stockFilter}
            onChange={(e) => { setStockFilter(e.target.value); setCurrentPage(1) }}
            className="h-11 cursor-pointer rounded-field border border-line bg-inset px-3 text-sm text-sub focus:border-gold-500 focus:outline-none"
            aria-label="Filter by stock"
          >
            <option value="">All Stock</option>
            <option value="in">In Stock</option>
            <option value="low">Low</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-card border border-line bg-surface shadow-sm">
        <div className="min-h-0 flex-1 overflow-auto">
          <Table>
            <THead>
              <TR className="border-0">
                <TH className="w-10">
                  <Checkbox
                    checked={products.length > 0 && selectedIds.size === products.length}
                    onChange={toggleAll}
                    aria-label="Select all products"
                  />
                </TH>
                <TH className="w-12">Image</TH>
                <TH>Name</TH>
                <TH>SKU</TH>
                <TH>Category</TH>
                <TH className="text-right">Price</TH>
                <TH className="text-right">Stock</TH>
                <TH>Status</TH>
                <TH className="text-right">Actions</TH>
              </TR>
            </THead>
            <TBody>
              {products.map((product) => (
                <TR key={product.id} className={`hover:bg-subtle ${product.active === false ? 'opacity-60' : ''}`}>
                  <TD>
                    <Checkbox
                      checked={selectedIds.has(product.id)}
                      onChange={() => toggleBulkSelect(product.id)}
                      aria-label={`Select ${product.name}`}
                    />
                  </TD>
                  <TD>
                    <img
                      src={getAssetUrl(product.image) || '/assets/placeholders/product.svg'}
                      alt=""
                      className="h-9 w-9 rounded-soft bg-inset object-cover"
                      onError={(e) => { e.target.src = '/assets/placeholders/product.svg' }}
                    />
                  </TD>
                  <TD className="text-sm text-ink">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate">{product.name}</span>
                    </div>
                  </TD>
                  <TD className="font-mono text-[11px] text-sub">{product.sku || '—'}</TD>
                  <TD className="text-sub">{product.category}</TD>
                  <TD className="whitespace-nowrap text-right text-ink">
                    ₹{product.price.toLocaleString()}
                    {product.discountPercentage > 0 && (
                      <span className="ml-1 text-[10px] text-danger">-{product.discountPercentage}%</span>
                    )}
                  </TD>
                  <TD className="text-right">
                    <span className={`text-xs font-medium ${product.stock === 0 ? 'text-danger' : product.stock <= 10 ? 'text-warning' : 'text-success'}`}>
                      {product.stock}
                    </span>
                  </TD>
                  <TD>
                    <Badge tone={product.active === false ? 'danger' : 'success'} size="sm">
                      {product.active === false ? 'Inactive' : 'Active'}
                    </Badge>
                  </TD>
                  <TD>
                    <div className="flex items-center justify-end gap-0.5">
                      <Button
                        variant="ghost"
                        size="iconSm"
                        icon="Star"
                        fill={product.featured ? 'currentColor' : 'none'}
                        className={product.featured ? '!text-gold-600' : ''}
                        onClick={() => toggleFeatured(product.id)}
                        title={product.featured ? 'Unfeature' : 'Feature'}
                      />
                      <Button
                        variant="ghost"
                        size="iconSm"
                        icon={product.active === false ? 'EyeOff' : 'Eye'}
                        className={product.active === false ? '!text-danger' : ''}
                        onClick={() => toggleActive(product.id)}
                        title={product.active === false ? 'Activate' : 'Deactivate'}
                      />
                      <Button
                        variant="ghost"
                        size="iconSm"
                        icon="Pencil"
                        onClick={() => openEdit(product)}
                        title="Edit"
                      />
                      <Button
                        variant="ghost"
                        size="iconSm"
                        icon="Trash2"
                        className="!text-danger"
                        onClick={() => setDeleteConfirm(product.id)}
                        title="Delete"
                      />
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>

          {loading && (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-sub">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
              Loading...
            </div>
          )}
          {!loading && products.length === 0 && (
            <EmptyState
              compact
              icon="PackageOpen"
              title="No products found"
              message="Try adjusting your search or filters, or add a new product."
              actionLabel="Add Product"
              onAction={openAdd}
            />
          )}
        </div>

        {pageInfo.totalPages > 1 && (
          <div className="flex flex-shrink-0 items-center justify-between gap-3 border-t border-line px-4 py-3">
            <span className="text-[11px] text-sub">
              Page {currentPage} of {pageInfo.totalPages}
            </span>
            <Pagination
              page={currentPage}
              totalPages={pageInfo.totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteConfirm}
        danger
        title="Delete Product"
        message="Are you sure you want to delete this product? It will be hidden from the storefront."
        confirmLabel={deletingId === deleteConfirm ? 'Deleting...' : 'Delete'}
        loading={deletingId === deleteConfirm}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
      />

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowModal(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} loading={saving}>
              {editingProduct ? 'Update Product' : 'Save Product'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <Field label="Name" htmlFor="p-name" required>
              <Input id="p-name" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Field label="SKU" htmlFor="p-sku" required>
              <Input id="p-sku" type="text" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="e.g. GUC-TS-001" />
            </Field>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Field label="Category" htmlFor="p-category" required>
              <Select id="p-category" value={form.category} onChange={(e) => { setForm({ ...form, category: e.target.value, subCategory: '' }) }}>
                <option value="">Select</option>
                {categories.map((c) => (<option key={c.id} value={c.name}>{c.name}</option>))}
              </Select>
            </Field>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Field label="Subcategory" htmlFor="p-subcategory">
              <Select id="p-subcategory" value={form.subCategory} onChange={(e) => setForm({ ...form, subCategory: e.target.value })} disabled={!form.category || modalSubs.length === 0}>
                <option value="">{!form.category ? 'Select category first' : 'None'}</option>
                {modalSubs.map((s) => (<option key={s.id} value={s.name}>{s.name}</option>))}
              </Select>
            </Field>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Field label="Brand" htmlFor="p-brand">
              <Input id="p-brand" type="text" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            </Field>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Field label="Price" htmlFor="p-price" required>
              <Input id="p-price" type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </Field>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Field label="Compare-at Price" htmlFor="p-original">
              <Input id="p-original" type="number" min="0" step="0.01" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} />
            </Field>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Field label="Discount (%)" htmlFor="p-discount">
              <Input id="p-discount" type="number" min="0" max="100" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
            </Field>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Field label="Stock" htmlFor="p-stock">
              <Input id="p-stock" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Description" htmlFor="p-description">
              <Textarea id="p-description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
          </div>

          <div className="col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sub">
                Gallery ({form.images.length}/{MAX_IMAGES})
              </span>
              <label className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-gold-600 hover:text-gold-700">
                {imageUploading ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Icon name="Upload" size="sm" />
                    Upload image
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" disabled={imageUploading || form.images.length >= MAX_IMAGES}
                  onChange={(e) => handleImageUpload(e.target.files[0])} />
              </label>
            </div>
            {form.images.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {form.images.map((url, index) => (
                  <div key={`${index}-${url}`} className="relative flex-shrink-0">
                    <div className="h-20 w-20 overflow-hidden rounded-card border border-line bg-inset">
                      <img src={getAssetUrl(url)} alt={`Product ${index + 1}`} className="h-full w-full object-cover"
                        onError={(e) => { e.target.src = '/assets/placeholders/product.svg' }} />
                    </div>
                    {index === 0 && (
                      <Badge tone="goldSolid" className="absolute left-1 top-1 px-1.5 py-0.5 text-[9px]">
                        Primary
                      </Badge>
                    )}
                    <div className="absolute -bottom-1 -right-1 flex gap-0.5">
                      <button type="button" onClick={() => moveImage(index, -1)} disabled={index === 0}
                        className="flex h-6 w-6 items-center justify-center rounded-soft border border-line bg-surface text-sub transition-colors hover:text-ink disabled:opacity-30">
                        <Icon name="ChevronLeft" size={12} />
                      </button>
                      <button type="button" onClick={() => moveImage(index, 1)} disabled={index === form.images.length - 1}
                        className="flex h-6 w-6 items-center justify-center rounded-soft border border-line bg-surface text-sub transition-colors hover:text-ink disabled:opacity-30">
                        <Icon name="ChevronRight" size={12} />
                      </button>
                      <button type="button" onClick={() => removeImage(index)}
                        className="flex h-6 w-6 items-center justify-center rounded-soft bg-danger/15 text-danger transition-colors hover:bg-danger/25">
                        <Icon name="X" size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {form.images.length === 0 && (
              <p className="text-xs text-sub">No images yet. Upload product images (the first image becomes primary).</p>
            )}
          </div>

          <div className="col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sub">
                Variants ({form.variants.length}/{MAX_VARIANTS})
              </span>
              <button
                type="button"
                onClick={() => setForm((prev) => prev.variants.length >= MAX_VARIANTS ? prev : { ...prev, variants: [...prev.variants, getEmptyVariant()] })}
                className="flex items-center gap-1 text-xs font-medium text-gold-600 hover:text-gold-700"
              >
                <Icon name="Plus" size="sm" />
                Add variant
              </button>
            </div>
            {form.variants.length > 0 && (
              <div className="overflow-x-auto rounded-card border border-line">
                <Table className="text-xs">
                  <THead>
                    <TR className="border-0">
                      <TH>Size</TH>
                      <TH>Color</TH>
                      <TH>Stock</TH>
                      <TH>Price</TH>
                      <TH>Variant SKU</TH>
                      <TH className="w-8" />
                    </TR>
                  </THead>
                  <TBody>
                    {form.variants.map((v, index) => (
                      <TR key={index} className="border-0">
                        <TD>
                          <input type="text" value={v.size} maxLength={20} placeholder="M"
                            onChange={(e) => updateVariant(index, 'size', e.target.value)}
                            className="w-14 rounded-soft border border-line bg-inset px-2 py-1.5 text-sm text-ink focus:border-gold-500 focus:outline-none" />
                        </TD>
                        <TD>
                          <input type="text" value={v.color} maxLength={50} placeholder="Black"
                            onChange={(e) => updateVariant(index, 'color', e.target.value)}
                            className="w-24 rounded-soft border border-line bg-inset px-2 py-1.5 text-sm text-ink focus:border-gold-500 focus:outline-none" />
                        </TD>
                        <TD>
                          <input type="number" min="0" value={v.stock}
                            onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                            className="w-16 rounded-soft border border-line bg-inset px-2 py-1.5 text-sm text-ink focus:border-gold-500 focus:outline-none" />
                        </TD>
                        <TD>
                          <input type="number" min="0" step="0.01" value={v.priceOverride}
                            onChange={(e) => updateVariant(index, 'priceOverride', e.target.value)}
                            className="w-20 rounded-soft border border-line bg-inset px-2 py-1.5 text-sm text-ink focus:border-gold-500 focus:outline-none" />
                        </TD>
                        <TD>
                          <input type="text" value={v.sku} maxLength={50}
                            onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                            className="w-28 rounded-soft border border-line bg-inset px-2 py-1.5 text-sm text-ink focus:border-gold-500 focus:outline-none" />
                        </TD>
                        <TD>
                          <button
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }))}
                            className="flex h-6 w-6 items-center justify-center rounded-soft bg-danger/15 text-danger transition-colors hover:bg-danger/25"
                            aria-label="Remove variant"
                          >
                            <Icon name="X" size={12} />
                          </button>
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </div>
            )}
          </div>

          <div className="col-span-2 flex flex-wrap items-center gap-x-5 gap-y-2">
            <Checkbox label="Featured" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            <Checkbox label="Trending" checked={form.trending} onChange={(e) => setForm({ ...form, trending: e.target.checked })} />
            <Checkbox label="New Arrival" checked={form.newArrival} onChange={(e) => setForm({ ...form, newArrival: e.target.checked })} />
            <Checkbox label="On Sale" checked={form.onSale} onChange={(e) => setForm({ ...form, onSale: e.target.checked })} />
            <Checkbox label="Active" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
