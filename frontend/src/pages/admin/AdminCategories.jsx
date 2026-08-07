import { useState, useEffect } from 'react'
import { categoryService } from '../../services/categoryService'
import { getAssetUrl } from '../../services/api'
import { mapCategory } from '../../services/mappers'
import { isSvgMarkup } from '../../utils/sanitizeSvg'
import SafeIcon from '../../components/SafeIcon'
import { useToast } from '../../context/ToastContext'
import Icon from '../../components/ui/Icon'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal, { ConfirmDialog } from '../../components/ui/Modal'
import { Field, Input, Textarea } from '../../components/ui/Input'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/EmptyState'
import Spinner from '../../components/ui/Spinner'

export default function AdminCategories() {
  const { showToast } = useToast()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editingCat, setEditingCat] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', icon: '' })
  const [subForm, setSubForm] = useState({ name: '', icon: '' })
  const [showSubModal, setShowSubModal] = useState(false)
  const [subParentId, setSubParentId] = useState(null)
  const [editingSub, setEditingSub] = useState(null)
  const [deleteSubConfirm, setDeleteSubConfirm] = useState(null)
  const [uploading, setUploading] = useState(false)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setLoadError('')
      const res = await categoryService.getAllAdmin()
      setCategories((res.data || []).map(mapCategory))
    } catch (e) {
      setLoadError(e.message || 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const openAdd = () => {
    setEditingCat(null)
    setForm({ name: '', description: '', icon: '' })
    setShowModal(true)
  }

  const openEdit = (cat) => {
    setEditingCat(cat)
    setForm({ name: cat.name, description: cat.description || '', icon: cat.icon ?? '' })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name) { showToast('Category name is required', 'error'); return }
    const payload = { name: form.name, description: form.description }
    if (form.icon) payload.icon = form.icon
    try {
      if (editingCat) {
        await categoryService.update(editingCat.id, payload)
        showToast(`Category "${form.name}" updated`, 'success')
      } else {
        await categoryService.create(payload)
        showToast(`Category "${form.name}" added`, 'success')
      }
      setShowModal(false)
      await fetchCategories()
    } catch (e) {
      showToast(e.message || 'Failed to save category', 'error')
    }
  }

  const handleDelete = async (id) => {
    try {
      await categoryService.delete(id)
      showToast('Category deleted', 'success')
      setDeleteConfirm(null)
      await fetchCategories()
    } catch (e) {
      showToast(e.message || 'Failed to delete category', 'error')
    }
  }

  const handleCategoryIconUpload = async (catId, file) => {
    try {
      setUploading(true)
      const res = await categoryService.uploadCategoryIcon(catId, file)
      if (res?.data?.icon) {
        setForm(prev => ({ ...prev, icon: res.data.icon }))
      }
      showToast('Icon uploaded', 'success')
      await fetchCategories()
    } catch (e) {
      showToast(e.message || 'Failed to upload icon', 'error')
    } finally {
      setUploading(false)
    }
  }

  const openAddSub = (catId) => {
    setSubForm({ name: '', icon: '' })
    setSubParentId(catId)
    setEditingSub(null)
    setShowSubModal(true)
  }

  const openEditSub = (catId, sub) => {
    setSubForm({ name: sub.name, icon: sub.icon ?? '' })
    setSubParentId(catId)
    setEditingSub(sub)
    setShowSubModal(true)
  }

  const handleSaveSub = async () => {
    if (!subForm.name) { showToast('Subcategory name is required', 'error'); return }
    const payload = { name: subForm.name }
    if (subForm.icon) payload.icon = subForm.icon
    try {
      if (editingSub) {
        await categoryService.updateSubCategory(editingSub.id, payload)
        showToast(`Subcategory "${subForm.name}" updated`, 'success')
      } else {
        await categoryService.addSubCategory(subParentId, payload)
        showToast(`Subcategory "${subForm.name}" added`, 'success')
      }
      setShowSubModal(false)
      await fetchCategories()
    } catch (e) {
      showToast(e.message || 'Failed to save subcategory', 'error')
    }
  }

  const handleDeleteSub = async (catId, subId) => {
    try {
      await categoryService.deleteSubCategory(subId)
      showToast('Subcategory deleted', 'success')
      setDeleteSubConfirm(null)
      await fetchCategories()
    } catch (e) {
      showToast(e.message || 'Failed to delete subcategory', 'error')
    }
  }

  const handleSubIconUpload = async (subId, file) => {
    try {
      setUploading(true)
      const res = await categoryService.uploadSubCategoryIcon(subId, file)
      if (res?.data?.icon) {
        setSubForm(prev => ({ ...prev, icon: res.data.icon }))
      }
      showToast('Subcategory icon uploaded', 'success')
      await fetchCategories()
    } catch (e) {
      showToast(e.message || 'Failed to upload subcategory icon', 'error')
    } finally {
      setUploading(false)
    }
  }

  const renderIcon = (icon, alt, className = 'w-8 h-8') => {
    if (isSvgMarkup(icon)) {
      return <SafeIcon icon={icon} className={className} />
    } else if (icon) {
      return <img src={getAssetUrl(icon)} alt={alt} className={`${className} object-cover rounded-lg`} />
    }
    return null
  }

  const toggleActive = async (cat) => {
    try {
      await categoryService.update(cat.id, { name: cat.name, active: !cat.active })
      showToast(`Category "${cat.name}" ${cat.active ? 'deactivated' : 'activated'}`, 'success')
      await fetchCategories()
    } catch (e) {
      showToast(e.message || 'Failed to update category status', 'error')
    }
  }

  const filteredCategories = categories.filter((cat) => {
    if (statusFilter === 'active' && !cat.active) return false
    if (statusFilter === 'inactive' && cat.active) return false
    if (search && !cat.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex h-full flex-col gap-4 py-4">
        <PageHeader title="Categories" />
        <div className="flex flex-1 items-center justify-center">
          <Spinner label="Loading categories" />
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex h-full flex-col gap-4 py-4">
        <PageHeader title="Categories" />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-card border border-danger/30 bg-danger/8 px-4 py-6 text-center">
          <p className="text-sm text-sub">{loadError}</p>
          <Button size="sm" icon="RefreshCw" onClick={fetchCategories}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 py-4">
      <PageHeader
        title="Categories"
        description="Organize your storefront with categories and subcategories."
        actions={
          <Button variant="primary" size="sm" icon="Plus" onClick={openAdd}>
            Add Category
          </Button>
        }
      />

      <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-72">
          <Icon name="Search" size="sm" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-field border border-line bg-inset pl-10 pr-4 text-sm text-ink placeholder-faint focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/25"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-11 rounded-field border border-line bg-inset px-3 text-sm text-sub focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/25"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {filteredCategories.length === 0 ? (
          <EmptyState
            compact
            icon="LayoutGrid"
            title="No categories found"
            message="Try adjusting your filters or add a new category."
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredCategories.map((cat) => {
              const isExpanded = expandedId === cat.id
              const subCount = cat.subcategories?.length || 0
              return (
                <div
                  key={cat.id}
                  className={`overflow-hidden rounded-card border bg-surface shadow-card transition-all hover:shadow-card-hover ${cat.active ? 'border-line' : 'border-danger/30'}`}
                >
                  <div className={`p-3 ${isExpanded ? 'border-b border-line' : ''}`}>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-soft bg-gold-100 text-gold-600">
                        {renderIcon(cat.icon, cat.name)}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleActive(cat)}
                          title={cat.active ? 'Deactivate' : 'Activate'}
                          className="transition-opacity hover:opacity-80"
                        >
                          <Badge tone={cat.active ? 'success' : 'danger'} size="sm">
                            {cat.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </button>
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : cat.id)}
                          aria-label="Toggle subcategories"
                          className="rounded-soft p-1 text-sub transition-colors hover:text-gold-600"
                        >
                          <Icon name="ChevronDown" size="sm" className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>
                    <h3 className="truncate text-sm font-semibold text-ink">{cat.name}</h3>
                    <p className="text-[10px] text-sub">
                      {cat.productCount} products{subCount > 0 && ` · ${subCount} subcategories`}
                    </p>
                    <div className="mt-2 flex gap-1 border-t border-line pt-2">
                      <button
                        onClick={() => openEdit(cat)}
                        className="flex-1 rounded-soft py-1 text-[10px] font-medium text-sub transition-colors hover:bg-gold-100 hover:text-gold-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(cat.id)}
                        className="flex-1 rounded-soft py-1 text-[10px] font-medium text-sub transition-colors hover:bg-danger/10 hover:text-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="px-3 pb-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-sub">
                          Subcategories ({subCount})
                        </span>
                        <button
                          onClick={() => openAddSub(cat.id)}
                          className="inline-flex items-center gap-1 text-[10px] font-medium text-gold-600 transition-colors hover:text-gold-700"
                        >
                          <Icon name="Plus" size="xs" />
                          Add
                        </button>
                      </div>
                      {subCount === 0 ? (
                        <p className="text-[10px] italic text-faint">No subcategories yet</p>
                      ) : (
                        <div className="space-y-1">
                          {cat.subcategories.map((sub) => (
                            <div key={sub.id} className="flex items-center justify-between rounded-soft bg-inset px-2 py-1.5">
                              <div className="flex min-w-0 items-center gap-2">
                                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center overflow-hidden rounded bg-gold-100 text-gold-600">
                                  {renderIcon(sub.icon, sub.name, 'w-3 h-3')}
                                </div>
                                <span className="truncate text-xs text-ink">{sub.name}</span>
                                <span className="flex-shrink-0 text-[10px] text-faint">({sub.productCount})</span>
                              </div>
                              <div className="ml-2 flex flex-shrink-0 items-center gap-1">
                                <label
                                  className="cursor-pointer p-1 text-sub transition-colors hover:text-gold-600"
                                  title="Upload icon"
                                >
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => { const f = e.target.files[0]; if (f) handleSubIconUpload(sub.id, f); e.target.value = '' }}
                                  />
                                  <Icon name="Upload" size="sm" />
                                </label>
                                <button
                                  onClick={() => openEditSub(cat.id, sub)}
                                  className="p-1 text-sub transition-colors hover:text-gold-600"
                                  title="Edit"
                                >
                                  <Icon name="Pencil" size="sm" />
                                </button>
                                <button
                                  onClick={() => setDeleteSubConfirm({ catId: cat.id, subId: sub.id, name: sub.name })}
                                  className="p-1 text-sub transition-colors hover:text-danger"
                                  title="Delete"
                                >
                                  <Icon name="Trash2" size="sm" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingCat ? 'Edit Category' : 'Add Category'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>{editingCat ? 'Update' : 'Save'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Name" required>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Category name" />
          </Field>
          <Field label="Description">
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          </Field>
          <Field label="Icon (SVG or Image URL)">
            <div className="flex gap-2">
              <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="Paste SVG or image URL" />
              {editingCat && (
                <label
                  className={`inline-flex h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-gold-500/50 px-4 text-xs font-medium text-gold-600 transition-colors hover:bg-gold-500 hover:text-white ${uploading ? 'pointer-events-none opacity-50' : ''}`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => { const f = e.target.files[0]; if (f) await handleCategoryIconUpload(editingCat.id, f); e.target.value = '' }}
                  />
                  {uploading ? '...' : 'Upload'}
                </label>
              )}
            </div>
          </Field>
        </div>
      </Modal>

      <Modal
        open={showSubModal}
        onClose={() => setShowSubModal(false)}
        title={editingSub ? 'Edit Subcategory' : 'Add Subcategory'}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowSubModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveSub}>{editingSub ? 'Update' : 'Save'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Subcategory Name" required>
            <Input value={subForm.name} onChange={(e) => setSubForm({ ...subForm, name: e.target.value })} placeholder="e.g. Casual Shoes" />
          </Field>
          <Field label="Icon (SVG or Image URL)">
            <div className="flex gap-2">
              <Input value={subForm.icon} onChange={(e) => setSubForm({ ...subForm, icon: e.target.value })} placeholder="Paste SVG or image URL" />
              {editingSub && (
                <label
                  className={`inline-flex h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-gold-500/50 px-4 text-xs font-medium text-gold-600 transition-colors hover:bg-gold-500 hover:text-white ${uploading ? 'pointer-events-none opacity-50' : ''}`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => { const f = e.target.files[0]; if (f) await handleSubIconUpload(editingSub.id, f); e.target.value = '' }}
                  />
                  {uploading ? '...' : 'Upload'}
                </label>
              )}
            </div>
          </Field>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm)}
        title="Delete Category?"
        message="This will also remove all subcategories under this category."
        confirmLabel="Delete"
        danger
      />

      <ConfirmDialog
        open={!!deleteSubConfirm}
        onClose={() => setDeleteSubConfirm(null)}
        onConfirm={() => handleDeleteSub(deleteSubConfirm.catId, deleteSubConfirm.subId)}
        title="Delete Subcategory?"
        message={<>Are you sure you want to delete <span className="font-medium text-ink">{deleteSubConfirm?.name}</span>?</>}
        confirmLabel="Delete"
        danger
      />
    </div>
  )
}
