import { useState, useEffect } from 'react'
import { categories as initialCategories } from '../../data/categories'
import { products } from '../../data/products'
import { useToast } from '../../context/ToastContext'
import BackButton from '../../components/BackButton'

const STORAGE_KEY = 'sifr_admin_categories'

const loadCategories = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return initialCategories
}

export default function AdminCategories() {
  const { showToast } = useToast()
  const [categories, setCategories] = useState(loadCategories)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(categories)) } catch {}
  }, [categories])

  const [showModal, setShowModal] = useState(false)
  const [editingCat, setEditingCat] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', icon: '' })
  const [subForm, setSubForm] = useState({ name: '' })
  const [showSubModal, setShowSubModal] = useState(false)
  const [subParentId, setSubParentId] = useState(null)
  const [deleteSubConfirm, setDeleteSubConfirm] = useState(null)

  const getProductCount = (catName) =>
    products.filter((p) => p.category === catName).length

  const openAdd = () => {
    setEditingCat(null)
    setForm({ name: '', description: '', icon: '' })
    setShowModal(true)
  }

  const openEdit = (cat) => {
    setEditingCat(cat)
    setForm({ name: cat.name, description: cat.description, icon: cat.icon })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.name) { showToast('Category name is required', 'error'); return }
    if (editingCat) {
      setCategories((prev) => prev.map((c) => c.id === editingCat.id ? { ...c, name: form.name, description: form.description, icon: form.icon } : c))
      showToast(`Category "${form.name}" updated`, 'success')
    } else {
      const newId = Math.max(...categories.map((c) => c.id), 0) + 1
      setCategories((prev) => [...prev, { id: newId, name: form.name, slug: form.name.toLowerCase().replace(/\s+/g, '-'), image: '/assets/placeholders/product.svg', icon: form.icon || '', productCount: 0, description: form.description, subcategories: [] }])
      showToast(`Category "${form.name}" added`, 'success')
    }
    setShowModal(false)
  }

  const handleDelete = (id) => {
    const cat = categories.find((c) => c.id === id)
    setCategories((prev) => prev.filter((c) => c.id !== id))
    showToast(`Category "${cat?.name}" deleted`, 'success')
    setDeleteConfirm(null)
  }

  const openAddSub = (catId) => {
    setSubForm({ name: '' })
    setSubParentId(catId)
    setShowSubModal(true)
  }

  const handleSaveSub = () => {
    if (!subForm.name) { showToast('Subcategory name is required', 'error'); return }
    const parent = categories.find((c) => c.id === subParentId)
    const existingIds = parent.subcategories.map((s) => s.id)
    const newId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : subParentId * 100 + 1
    const slug = subForm.name.toLowerCase().replace(/\s+/g, '-')
    setCategories((prev) => prev.map((c) => c.id === subParentId ? { ...c, subcategories: [...c.subcategories, { id: newId, name: subForm.name, slug, productCount: 0 }] } : c))
    showToast(`Subcategory "${subForm.name}" added`, 'success')
    setShowSubModal(false)
  }

  const handleDeleteSub = (catId, subId) => {
    const cat = categories.find((c) => c.id === catId)
    const sub = cat?.subcategories.find((s) => s.id === subId)
    setCategories((prev) => prev.map((c) => c.id === catId ? { ...c, subcategories: c.subcategories.filter((s) => s.id !== subId) } : c))
    showToast(`Subcategory "${sub?.name}" deleted`, 'success')
    setDeleteSubConfirm(null)
  }

  return (
    <div className="h-full flex flex-col gap-2 py-3">
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-lg font-bold text-white font-['Playfair_Display']">Categories</h1>
        </div>
        <button onClick={openAdd} className="px-4 py-1.5 bg-[#C6A972] text-white rounded-lg text-xs font-semibold hover:bg-[#B8965F] transition-colors">+ Add</button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {categories.map((cat) => {
            const count = getProductCount(cat.name)
            const isExpanded = expandedId === cat.id
            const subCount = cat.subcategories?.length || 0
            return (
              <div key={cat.id} className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)]/50 overflow-hidden">
                <div className={`p-3 transition-all ${isExpanded ? 'border-b border-[var(--border-color)]/50' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[#C6A972]/10 text-[#C6A972] flex items-center justify-center" dangerouslySetInnerHTML={{ __html: cat.icon }} />
                    <button onClick={() => setExpandedId(isExpanded ? null : cat.id)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                      <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                  </div>
                  <h3 className="text-white text-sm font-semibold truncate">{cat.name}</h3>
                  <p className="text-[var(--text-secondary)] text-[10px]">{count} products{subCount > 0 && ` \u00B7 ${subCount} subcategories`}</p>
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
                              <span className="text-xs text-white truncate">{sub.name}</span>
                              <span className="text-[10px] text-[var(--text-muted)] flex-shrink-0">({sub.productCount})</span>
                            </div>
                            <button onClick={() => setDeleteSubConfirm({ catId: cat.id, subId: sub.id, name: sub.name })} className="text-[var(--text-secondary)] hover:text-red-600 transition-colors flex-shrink-0 ml-2">
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
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
              <h2 className="text-base font-semibold text-white">{editingCat ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C6A972]" />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C6A972] resize-none" />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Icon (SVG)</label>
                <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C6A972]" />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-[var(--border-color)]">
              <button onClick={() => setShowModal(false)} className="px-4 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] transition-colors">Cancel</button>
              <button onClick={handleSave} className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#C6A972] hover:bg-[#B8965F] transition-colors">{editingCat ? 'Update' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {showSubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setShowSubModal(false)}>
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
              <h2 className="text-base font-semibold text-white">Add Subcategory</h2>
              <button onClick={() => setShowSubModal(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <div className="p-4">
              <label className="block text-xs text-[var(--text-secondary)] mb-1">Subcategory Name *</label>
              <input value={subForm.name} onChange={(e) => setSubForm({ name: e.target.value })} placeholder="e.g. Casual Shoes" className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C6A972]" />
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-[var(--border-color)]">
              <button onClick={() => setShowSubModal(false)} className="px-4 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] transition-colors">Cancel</button>
              <button onClick={handleSaveSub} className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#C6A972] hover:bg-[#B8965F] transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-5 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-white mb-2">Delete Category?</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">This will also remove all subcategories under this category.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {deleteSubConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setDeleteSubConfirm(null)}>
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-5 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-white mb-2">Delete Subcategory?</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">Are you sure you want to delete <span className="text-white font-medium">{deleteSubConfirm.name}</span>?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteSubConfirm(null)} className="px-4 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] transition-colors">Cancel</button>
              <button onClick={() => handleDeleteSub(deleteSubConfirm.catId, deleteSubConfirm.subId)} className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
