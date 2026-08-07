import { useState, useEffect } from 'react'
import BackButton from '../../components/BackButton'
import { getAssetUrl } from '../../services/api'

const STORAGE_KEY = 'sifr_banners'

const defaultBanners = [
  {
    id: 1,
    title: 'New Arrivals',
    subtitle: 'Discover premium styles only at AddexStores',
    cta: 'Shop Now',
    ctaLink: '/new-arrivals',
    bgColor: '#F5F2ED',
    image: '/assets/placeholders/banner.svg',
    active: true,
    order: 0,
  },
  {
    id: 2,
    title: 'Luxury Collection',
    subtitle: 'Elevate your lifestyle',
    cta: 'Explore',
    ctaLink: '/products',
    bgColor: '#F5F2ED',
    image: '/assets/placeholders/banner.svg',
    active: true,
    order: 1,
  },
  {
    id: 3,
    title: 'Trending Products',
    subtitle: 'Handpicked for you',
    cta: 'View All',
    ctaLink: '/trending',
    bgColor: '#F5F2ED',
    image: '/assets/placeholders/banner.svg',
    active: true,
    order: 2,
  },
]

let nextId = 4

function loadBanners() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      const maxId = parsed.reduce((max, b) => Math.max(max, b.id || 0), 0)
      if (maxId >= nextId) nextId = maxId + 1
      return parsed
    }
  } catch {}
  return JSON.parse(JSON.stringify(defaultBanners))
}

function saveBanners(banners) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(banners))
}

function getUniqueId() {
  return nextId++
}

export default function AdminBanners() {
  const [banners, setBanners] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [preview, setPreview] = useState(null)
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    cta: 'Shop Now',
    ctaLink: '/products',
    bgColor: '#F5F2ED',
    image: '',
    active: true,
  })

  useEffect(() => {
    setBanners(loadBanners())
  }, [])

  const activeBanners = banners.filter((b) => b.active)
  const inactiveBanners = banners.filter((b) => !b.active)

  function reorder(banners) {
    return banners.map((b, i) => ({ ...b, order: i }))
  }

  function handleSave() {
    if (!form.title.trim()) return
    const image = preview || form.image || '/assets/placeholders/banner.svg'
    if (editing) {
      const updated = banners.map((b) =>
        b.id === editing.id
          ? { ...form, id: b.id, order: b.order, image }
          : b
      )
      setBanners(reorder(updated))
      saveBanners(reorder(updated))
    } else {
      const newBanner = { ...form, id: getUniqueId(), image, order: banners.length }
      const updated = [...banners, newBanner]
      setBanners(reorder(updated))
      saveBanners(reorder(updated))
    }
    resetForm()
  }

  function handleEdit(banner) {
    setEditing(banner)
    setForm({
      title: banner.title,
      subtitle: banner.subtitle,
      cta: banner.cta,
      ctaLink: banner.ctaLink,
      bgColor: banner.bgColor,
      image: banner.image,
      active: banner.active,
    })
    setPreview(null)
    setShowForm(true)
  }

  function handleDelete(id) {
    const updated = banners.filter((b) => b.id !== id)
    setBanners(reorder(updated))
    saveBanners(reorder(updated))
  }

  function handleToggleActive(id) {
    const updated = banners.map((b) =>
      b.id === id ? { ...b, active: !b.active } : b
    )
    setBanners(updated)
    saveBanners(updated)
  }

  function handleMoveUp(index) {
    if (index === 0) return
    const updated = [...banners]
    ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
    setBanners(reorder(updated))
    saveBanners(reorder(updated))
  }

  function handleMoveDown(index) {
    if (index === banners.length - 1) return
    const updated = [...banners]
    ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
    setBanners(reorder(updated))
    saveBanners(reorder(updated))
  }

  function handleImageUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  function resetForm() {
    setEditing(null)
    setShowForm(false)
    setPreview(null)
    setForm({
      title: '',
      subtitle: '',
      cta: 'Shop Now',
      ctaLink: '/products',
    bgColor: '#F5F2ED',
    image: '',
    active: true,
    })
  }

  return (
    <div className="h-full flex flex-col gap-3 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-lg font-bold text-[var(--text-primary)] font-['Playfair_Display']">Banners</h1>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="px-3 py-2 bg-[#C6A972] text-white text-xs font-medium rounded-md hover:bg-[#B8965F] transition"
        >
          + New Banner
        </button>
      </div>

      {showForm && (
        <div className="bg-[var(--bg-card)] rounded-lg p-4 border border-[var(--border-color)]/50 space-y-3">
          <h2 className="text-[var(--text-primary)] text-sm font-semibold">
            {editing ? 'Edit Banner' : 'New Banner'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-wider mb-1">Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 rounded-md bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[#C6A972] transition"
                placeholder="Banner title"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-wider mb-1">Subtitle</label>
              <input
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="w-full px-3 py-2 rounded-md bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[#C6A972] transition"
                placeholder="Banner subtitle"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-wider mb-1">CTA Text</label>
              <input
                value={form.cta}
                onChange={(e) => setForm({ ...form, cta: e.target.value })}
                className="w-full px-3 py-2 rounded-md bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[#C6A972] transition"
                placeholder="Shop Now"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-wider mb-1">CTA Link</label>
              <input
                value={form.ctaLink}
                onChange={(e) => setForm({ ...form, ctaLink: e.target.value })}
                className="w-full px-3 py-2 rounded-md bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[#C6A972] transition"
                placeholder="/products"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-wider mb-1">Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.bgColor}
                  onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="text-[10px] text-[var(--text-secondary)] font-mono">{form.bgColor}</span>
              </div>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <div className={`w-9 h-5 rounded-full transition-colors relative ${form.active ? 'bg-[#C6A972]' : 'bg-[var(--bg-hover)]'}`}>
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-[var(--bg-card)] transition-transform ${form.active ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
                <span className="text-[11px] text-[var(--text-secondary)]">Active</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-wider mb-1">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full text-xs text-[var(--text-secondary)] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:bg-[var(--bg-hover)] file:text-[var(--text-primary)] hover:file:bg-[#E5E7EB] file:transition file:cursor-pointer cursor-pointer"
            />
            {(preview || form.image) && (
              <img
                src={preview || getAssetUrl(form.image)}
                alt="Preview"
                className="mt-2 h-20 w-auto rounded object-cover"
                onError={(e) => { e.target.style.display = 'none' }}
              />
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={resetForm}
              className="px-4 py-2 rounded-md text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#C6A972] text-white text-xs font-medium rounded-md hover:bg-[#B8965F] transition"
            >
              {editing ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-auto space-y-2">
        {banners.length === 0 && (
          <p className="text-[var(--text-secondary)] text-xs text-center py-8">No banners yet. Create your first banner.</p>
        )}

        {activeBanners.length > 0 && (
          <>
            <p className="text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-wider">Active</p>
            {activeBanners.map((banner, index) => (
              <BannerCard
                key={banner.id}
                banner={banner}
                index={index}
                total={banners.length}
                onEdit={() => handleEdit(banner)}
                onDelete={() => handleDelete(banner.id)}
                onToggleActive={() => handleToggleActive(banner.id)}
                onMoveUp={() => handleMoveUp(index)}
                onMoveDown={() => handleMoveDown(index)}
              />
            ))}
          </>
        )}

        {inactiveBanners.length > 0 && (
          <>
            <p className="text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-wider mt-3">Inactive</p>
            {inactiveBanners.map((banner) => (
              <BannerCard
                key={banner.id}
                banner={banner}
                index={banners.indexOf(banner)}
                total={banners.length}
                onEdit={() => handleEdit(banner)}
                onDelete={() => handleDelete(banner.id)}
                onToggleActive={() => handleToggleActive(banner.id)}
                onMoveUp={() => handleMoveUp(banners.indexOf(banner))}
                onMoveDown={() => handleMoveDown(banners.indexOf(banner))}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
}

function BannerCard({ banner, index, total, onEdit, onDelete, onToggleActive, onMoveUp, onMoveDown }) {
  return (
    <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)]/50 overflow-hidden">
      <div className="flex gap-3 p-3">
        <div className="w-24 h-16 sm:w-32 sm:h-20 rounded-md overflow-hidden flex-shrink-0 bg-[var(--bg-input)]">
          <img
            src={getAssetUrl(banner.image)}
            alt={banner.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[var(--text-primary)] text-sm font-semibold truncate">{banner.title}</h3>
          <p className="text-[var(--text-secondary)] text-xs truncate mt-0.5">{banner.subtitle}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] text-[#C6A972]">{banner.cta} →</span>
            {banner.ctaLink && (
              <span className="text-[9px] text-[var(--text-secondary)] font-mono">{banner.ctaLink}</span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1 flex-shrink-0">
          <div className="flex gap-1 justify-end">
            <button onClick={onEdit} className="w-7 h-7 rounded-md bg-[var(--bg-hover)] flex items-center justify-center hover:bg-[var(--bg-hover)] transition" title="Edit">
              <svg className="w-3.5 h-3.5 text-[var(--text-secondary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button onClick={onDelete} className="w-7 h-7 rounded-md bg-[var(--bg-hover)] flex items-center justify-center hover:bg-[#C53030]/20 transition" title="Delete">
              <svg className="w-3.5 h-3.5 text-[#C53030]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
          <div className="flex gap-1 justify-end">
            <button onClick={onToggleActive} className="w-7 h-7 rounded-md bg-[var(--bg-hover)] flex items-center justify-center hover:bg-[var(--bg-hover)] transition" title={banner.active ? 'Deactivate' : 'Activate'}>
              {banner.active ? (
                <svg className="w-3.5 h-3.5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 text-[var(--text-secondary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              )}
            </button>
            <button onClick={onMoveUp} disabled={index === 0} className={`w-7 h-7 rounded-md bg-[var(--bg-hover)] flex items-center justify-center transition ${index === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[var(--bg-hover)]'}`} title="Move up">
              <svg className="w-3.5 h-3.5 text-[var(--text-secondary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </button>
            <button onClick={onMoveDown} disabled={index === total - 1} className={`w-7 h-7 rounded-md bg-[var(--bg-hover)] flex items-center justify-center transition ${index === total - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[var(--bg-hover)]'}`} title="Move down">
              <svg className="w-3.5 h-3.5 text-[var(--text-secondary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
