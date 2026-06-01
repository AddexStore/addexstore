import { useState, useEffect } from 'react'
import { categoryService } from '../../services/categoryService'
import { getAssetUrl } from '../../services/api'
import { mapCategory } from '../../services/mappers'
import { useToast } from '../../context/ToastContext'
import BackButton from '../../components/BackButton'

export default function AdminCategories() {
  const { showToast } = useToast()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

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
      const res = await categoryService.getAll()
      setCategories((res.data || []).map(mapCategory))
    } catch (e) {
      showToast(e.message || 'Failed to load categories', 'error')
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
      console.log('Upload response:', JSON.stringify(res))
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
    if (icon && icon.trim().startsWith('<')) {
      return <span dangerouslySetInnerHTML={{ __html: icon }} className={className} />
    } else if (icon) {
      return <img src={getAssetUrl(icon)} alt={alt} className={`${className} object-cover rounded-lg`} />
    } else {
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      )
    }
  }

  if (loading) {
    return (
      <div className="h-full flex flex-col gap-2 py-3">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-lg font-bold text-black font-['Playfair_Display']">Categories</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#C6A972] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col gap-2 py-3">
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-lg font-bold text-black font-['Playfair_Display']">Categories</h1>
        </div>
        <button onClick={openAdd} className="px-4 py-1.5 bg-[#C6A972] text-black rounded-lg text-xs font-semibold hover:bg-[#B8965F] transition-colors">+ Add</button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {categories.map((cat) => {
            const isExpanded = expandedId === cat.id
            const subCount = cat.subcategories?.length || 0
            return (
              <div key={cat.id} className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)]/50 overflow-hidden">
                <div className={`p-3 transition-all ${isExpanded ? 'border-b border-[var(--border-color)]/50' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[#C6A972]/10 text-[#C6A972] flex items-center justify-center overflow-hidden">
                      {renderIcon(cat.icon, cat.name)}
                    </div>
                    <button onClick={() => setExpandedId(isExpanded ? null : cat.id)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                      <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                    </button>
                  </div>
                  <h3 className="text-black text-sm font-semibold truncate">{cat.name}</h3>
                  <p className="text-[var(--text-secondary)] text-[10px]">{cat.productCount} products{subCount > 0 && ` · ${subCount} subcategories`}</p>
                  <div className="flex gap-1 mt-2 pt-2 border-t border-[var(--border-color)]/50">
                    <button onClick={() => openEdit(cat)} className="flex-1 py-1 rounded text-[10px] font-medium text-[var(--text-secondary)] hover:text-[#C6A972] hover:bg-[#C6A972]/10 transition-colors">Edit</button>
                    <button onClick={() => setDeleteConfirm(cat.id)} className="flex-1 py-1 rounded text-[10px] font-medium text-[var(--text-secondary)] hover:text-red-600 hover:bg-red-500/10 transition-colors">Delete</button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-3 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider">Subcategories ({subCount})</span>
                      <button onClick={() => openAddSub(cat.id)} className="text-[10px] text-[#C6A972] hover:text-[#B8965F] font-medium transition-colors">+ Add</button>
                    </div>
                    {subCount === 0 ? (
                      <p className="text-[10px] text-[var(--text-muted)] italic">No subcategories yet</p>
                    ) : (
                      <div className="space-y-1">
                        {cat.subcategories.map((sub) => (
                          <div key={sub.id} className="flex items-center justify-between bg-[var(--bg-input)] rounded px-2 py-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-5 h-5 rounded bg-[#C6A972]/10 text-[#C6A972] flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {renderIcon(sub.icon, sub.name, 'w-3 h-3')}
                              </div>
                              <span className="text-xs text-black truncate">{sub.name}</span>
                              <span className="text-[10px] text-[var(--text-muted)] flex-shrink-0">({sub.productCount})</span>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                              <label className="cursor-pointer text-[var(--text-secondary)] hover:text-[#C6A972] transition-colors p-1" title="Upload icon">
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files[0]; if (f) handleSubIconUpload(sub.id, f); e.target.value = '' }} />
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                              </label>
                              <button onClick={() => openEditSub(cat.id, sub)} className="text-[var(--text-secondary)] hover:text-[#C6A972] transition-colors p-1" title="Edit">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              </button>
                              <button onClick={() => setDeleteSubConfirm({ catId: cat.id, subId: sub.id, name: sub.name })} className="text-[var(--text-secondary)] hover:text-red-600 transition-colors p-1" title="Delete">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
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
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setShowModal(false)}>
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
              <h2 className="text-base font-semibold text-black">{editingCat ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:border-[#C6A972]" />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:border-[#C6A972] resize-none" />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Icon (SVG or Image URL)</label>
                <div className="flex gap-2">
                  <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="Paste SVG or image URL" className="flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:border-[#C6A972]" />
                  {editingCat && (
                    <label className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-black bg-[#C6A972] hover:bg-[#B8965F] cursor-pointer transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files[0]; if (f) await handleCategoryIconUpload(editingCat.id, f); e.target.value = '' }} />
                      {uploading ? '...' : 'Upload'}
                    </label>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-[var(--border-color)]">
              <button onClick={() => setShowModal(false)} className="px-4 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] transition-colors">Cancel</button>
              <button onClick={handleSave} className="px-4 py-1.5 rounded-lg text-xs font-semibold text-black bg-[#C6A972] hover:bg-[#B8965F] transition-colors">{editingCat ? 'Update' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {showSubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setShowSubModal(false)}>
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
              <h2 className="text-base font-semibold text-black">{editingSub ? 'Edit Subcategory' : 'Add Subcategory'}</h2>
              <button onClick={() => setShowSubModal(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Subcategory Name *</label>
                <input value={subForm.name} onChange={(e) => setSubForm({ ...subForm, name: e.target.value })} placeholder="e.g. Casual Shoes" className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:border-[#C6A972]" />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Icon (SVG or Image URL)</label>
                <div className="flex gap-2">
                  <input value={subForm.icon} onChange={(e) => setSubForm({ ...subForm, icon: e.target.value })} placeholder="Paste SVG or image URL" className="flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:border-[#C6A972]" />
                  {editingSub && (
                    <label className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-black bg-[#C6A972] hover:bg-[#B8965F] cursor-pointer transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files[0]; if (f) await handleSubIconUpload(editingSub.id, f); e.target.value = '' }} />
                      {uploading ? '...' : 'Upload'}
                    </label>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-[var(--border-color)]">
              <button onClick={() => setShowSubModal(false)} className="px-4 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] transition-colors">Cancel</button>
              <button onClick={handleSaveSub} className="px-4 py-1.5 rounded-lg text-xs font-semibold text-black bg-[#C6A972] hover:bg-[#B8965F] transition-colors">{editingSub ? 'Update' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-5 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-black mb-2">Delete Category?</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">This will also remove all subcategories under this category.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-1.5 rounded-lg text-xs font-semibold text-black bg-red-500 hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {deleteSubConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setDeleteSubConfirm(null)}>
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-5 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-black mb-2">Delete Subcategory?</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">Are you sure you want to delete <span className="text-black font-medium">{deleteSubConfirm.name}</span>?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteSubConfirm(null)} className="px-4 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] transition-colors">Cancel</button>
              <button onClick={() => handleDeleteSub(deleteSubConfirm.catId, deleteSubConfirm.subId)} className="px-4 py-1.5 rounded-lg text-xs font-semibold text-black bg-red-500 hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
