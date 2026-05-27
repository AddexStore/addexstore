import { useState } from 'react'
import { categories as initialCategories } from '../../data/categories'
import { products } from '../../data/products'
import { useToast } from '../../context/ToastContext'
import BackButton from '../../components/BackButton'

export default function AdminCategories() {
  const { showToast } = useToast()
  const [categories, setCategories] = useState(initialCategories)
  const [showModal, setShowModal] = useState(false)
  const [editingCat, setEditingCat] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', icon: '' })

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
      setCategories((prev) => [...prev, { id: newId, name: form.name, slug: form.name.toLowerCase().replace(/\s+/g, '-'), image: '/assets/placeholders/product.svg', icon: form.icon || '', productCount: 0, description: form.description }])
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

  return (
    <div className="h-full flex flex-col gap-2 py-3">
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-lg font-bold text-white font-['Playfair_Display']">Categories</h1>
        </div>
        <button onClick={openAdd} className="px-4 py-1.5 bg-[#D4AF37] text-black rounded-lg text-xs font-semibold hover:bg-[#C9A84C] transition-colors">+ Add</button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {categories.map((cat) => {
            const count = getProductCount(cat.name)
            return (
              <div key={cat.id} className="bg-[#232326] rounded-lg p-3 border border-[#2D2D30]/50 hover:border-[#D4AF37]/30 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center" dangerouslySetInnerHTML={{ __html: cat.icon }} />
                </div>
                <h3 className="text-white text-sm font-semibold truncate">{cat.name}</h3>
                <p className="text-[#6B7280] text-[10px]">{count} products</p>
                <div className="flex gap-1 mt-2 pt-2 border-t border-[#2D2D30]/50">
                  <button onClick={() => openEdit(cat)} className="flex-1 py-1 rounded text-[10px] font-medium text-[#B8B8C2] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors">Edit</button>
                  <button onClick={() => setDeleteConfirm(cat.id)} className="flex-1 py-1 rounded text-[10px] font-medium text-[#B8B8C2] hover:text-red-400 hover:bg-red-500/10 transition-colors">Delete</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setShowModal(false)}>
          <div className="bg-[#232326] rounded-xl border border-[#2D2D30] w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[#2D2D30]">
              <h2 className="text-base font-semibold text-white">{editingCat ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setShowModal(false)} className="text-[#6B7280] hover:text-white"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs text-[#B8B8C2] mb-1">Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-[#0F0F10] border border-[#2D2D30] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]" />
              </div>
              <div>
                <label className="block text-xs text-[#B8B8C2] mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full bg-[#0F0F10] border border-[#2D2D30] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37] resize-none" />
              </div>
              <div>
                <label className="block text-xs text-[#B8B8C2] mb-1">Icon (SVG)</label>
                <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full bg-[#0F0F10] border border-[#2D2D30] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]" />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-[#2D2D30]">
              <button onClick={() => setShowModal(false)} className="px-4 py-1.5 rounded-lg text-xs text-[#B8B8C2] hover:text-white bg-[#0F0F10] hover:bg-[#2A2A2E] transition-colors">Cancel</button>
              <button onClick={handleSave} className="px-4 py-1.5 rounded-lg text-xs font-semibold text-black bg-[#D4AF37] hover:bg-[#C9A84C] transition-colors">{editingCat ? 'Update' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-[#232326] rounded-xl border border-[#2D2D30] p-5 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-white mb-2">Confirm Delete</h3>
            <p className="text-xs text-[#B8B8C2] mb-4">Are you sure you want to delete this category?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-1.5 rounded-lg text-xs text-[#B8B8C2] hover:text-white bg-[#0F0F10] hover:bg-[#2A2A2E] transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
