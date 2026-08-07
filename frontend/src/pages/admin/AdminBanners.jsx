import { useState, useEffect } from 'react'
import { getAssetUrl } from '../../services/api'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/EmptyState'
import { Field, Input, Toggle } from '../../components/ui/Input'

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
    <div className="flex h-full flex-col gap-4 py-4">
      <PageHeader
        title="Banners"
        description="Manage homepage banners, their placement, and visibility."
        actions={
          <Button icon="Plus" onClick={() => { resetForm(); setShowForm(true) }}>
            New Banner
          </Button>
        }
      />

      {showForm && (
        <div className="flex-shrink-0 rounded-card border border-line bg-surface p-4 shadow-sm">
          <h2 className="heading-display mb-3 text-lg text-ink">
            {editing ? 'Edit Banner' : 'New Banner'}
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Title" required>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Banner title"
              />
            </Field>
            <Field label="Subtitle">
              <Input
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                placeholder="Banner subtitle"
              />
            </Field>
            <Field label="CTA Text">
              <Input
                value={form.cta}
                onChange={(e) => setForm({ ...form, cta: e.target.value })}
                placeholder="Shop Now"
              />
            </Field>
            <Field label="CTA Link">
              <Input
                value={form.ctaLink}
                onChange={(e) => setForm({ ...form, ctaLink: e.target.value })}
                placeholder="/products"
              />
            </Field>
            <Field label="Background Color">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.bgColor}
                  onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                  className="h-9 w-9 cursor-pointer rounded-field border border-line bg-inset"
                />
                <span className="font-mono text-xs text-sub">{form.bgColor}</span>
              </div>
            </Field>
            <div className="flex items-end">
              <Toggle
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                label="Active"
              />
            </div>
          </div>

          <div className="mt-3">
            <Field label="Image">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full cursor-pointer text-xs text-sub file:mr-3 file:cursor-pointer file:rounded-field file:border-0 file:bg-subtle file:px-3 file:py-1.5 file:text-xs file:text-ink hover:file:bg-ivory-200"
              />
            </Field>
            {(preview || form.image) && (
              <img
                src={preview || getAssetUrl(form.image)}
                alt="Preview"
                className="mt-2 h-20 w-auto rounded-soft object-cover"
                onError={(e) => { e.target.style.display = 'none' }}
              />
            )}
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editing ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      )}

      <div className="min-h-0 flex-1 space-y-2 overflow-auto">
        {banners.length === 0 && (
          <EmptyState
            compact
            icon="Image"
            title="No banners yet"
            message="Create your first banner to get started."
          />
        )}

        {activeBanners.length > 0 && (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sub">Active</p>
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
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-sub">Inactive</p>
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
    <div className="overflow-hidden rounded-card border border-line bg-surface shadow-sm">
      <div className="flex gap-3 p-3">
        <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-soft bg-inset sm:h-20 sm:w-32">
          <img
            src={getAssetUrl(banner.image)}
            alt={banner.title}
            className="h-full w-full object-cover"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-ink">{banner.title}</h3>
          <p className="mt-0.5 truncate text-xs text-sub">{banner.subtitle}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-[10px] text-gold-600">{banner.cta} →</span>
            {banner.ctaLink && (
              <span className="font-mono text-[9px] text-sub">{banner.ctaLink}</span>
            )}
          </div>
        </div>
        <div className="flex flex-shrink-0 flex-col gap-1">
          <div className="flex justify-end gap-1">
            <button
              onClick={onEdit}
              className="flex h-7 w-7 items-center justify-center rounded-soft bg-subtle text-sub transition-colors hover:text-gold-600"
              title="Edit"
              aria-label="Edit"
            >
              <Icon name="Pencil" size="sm" />
            </button>
            <button
              onClick={onDelete}
              className="flex h-7 w-7 items-center justify-center rounded-soft bg-subtle text-danger transition-colors hover:bg-danger/10"
              title="Delete"
              aria-label="Delete"
            >
              <Icon name="Trash2" size="sm" />
            </button>
          </div>
          <div className="flex justify-end gap-1">
            <button
              onClick={onToggleActive}
              className="flex h-7 w-7 items-center justify-center rounded-soft bg-subtle text-sub transition-colors"
              title={banner.active ? 'Deactivate' : 'Activate'}
              aria-label={banner.active ? 'Deactivate' : 'Activate'}
            >
              {banner.active ? (
                <Icon name="Eye" size="sm" className="text-success" />
              ) : (
                <Icon name="EyeOff" size="sm" />
              )}
            </button>
            <button
              onClick={onMoveUp}
              disabled={index === 0}
              className={`flex h-7 w-7 items-center justify-center rounded-soft bg-subtle text-sub transition-colors ${index === 0 ? 'cursor-not-allowed opacity-30' : 'hover:text-gold-600'}`}
              title="Move up"
              aria-label="Move up"
            >
              <Icon name="ChevronUp" size="sm" />
            </button>
            <button
              onClick={onMoveDown}
              disabled={index === total - 1}
              className={`flex h-7 w-7 items-center justify-center rounded-soft bg-subtle text-sub transition-colors ${index === total - 1 ? 'cursor-not-allowed opacity-30' : 'hover:text-gold-600'}`}
              title="Move down"
              aria-label="Move down"
            >
              <Icon name="ChevronDown" size="sm" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
