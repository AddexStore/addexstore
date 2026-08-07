import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { formatDate } from '../utils/helpers'
import Button from '../components/ui/Button'
import Icon from '../components/ui/Icon'
import { Field, Input } from '../components/ui/Input'

const QUICK_LINKS = [
  { label: 'My Orders', path: '/orders', icon: 'ShoppingBag' },
  { label: 'My Wishlist', path: '/wishlist', icon: 'Heart' },
  { label: 'Settings', path: '/settings', icon: 'Settings' },
]

export default function Profile() {
  const { user, isAuthenticated, updateProfile } = useAuth()
  const { showToast } = useToast()

  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
  })

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      })
    }
  }, [user])

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile({
        name: form.name,
        email: form.email,
        phone: form.phone,
      })
      showToast('Profile updated successfully', 'success')
      setIsEditing(false)
    } catch {
      showToast('Failed to update profile', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-page pb-16">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-8">
          <p className="eyebrow mb-2 text-gold-600">Account</p>
          <h1 className="heading-display text-2xl sm:text-3xl">My Profile</h1>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          <div className="flex-1 space-y-6">
            <div className="rounded-card border border-line bg-surface p-6 shadow-card sm:p-8">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-2xl font-bold text-white shadow-gold-soft sm:h-16 sm:w-16 sm:text-xl">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="text-center sm:text-left">
                    <h2 className="text-lg font-semibold text-ink sm:text-xl">
                      {user.name || 'User'}
                    </h2>
                    <p className="text-sm text-sub">
                      Member since {user.joinDate ? formatDate(user.joinDate) : 'Today'}
                    </p>
                  </div>
                </div>
                <Button
                  variant={isEditing ? 'outline' : 'goldOutline'}
                  size="sm"
                  icon={isEditing ? 'X' : 'Pencil'}
                  onClick={() => setIsEditing(!isEditing)}
                  className="self-center sm:self-start"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <Field label="Full Name" required>
                    <Input type="text" name="name" value={form.name} onChange={handleChange} required />
                  </Field>
                  <Field label="Email" required>
                    <Input type="email" name="email" value={form.email} onChange={handleChange} required />
                  </Field>
                  <Field label="Phone">
                    <Input type="tel" name="phone" value={form.phone} onChange={handleChange} />
                  </Field>
                  <div className="pt-2">
                    <Button type="submit" variant="primary" loading={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              ) : (
                <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-faint">Email</dt>
                    <dd className="mt-1 text-sm text-ink">{user.email || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-faint">Phone</dt>
                    <dd className="mt-1 text-sm text-ink">{user.phone || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-faint">Role</dt>
                    <dd className="mt-1 text-sm capitalize text-ink">{user.role || 'customer'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-faint">Member Since</dt>
                    <dd className="mt-1 text-sm text-ink">
                      {user.joinDate ? formatDate(user.joinDate) : 'Today'}
                    </dd>
                  </div>
                </dl>
              )}
            </div>

            {user.address && (
              <div className="rounded-card border border-line bg-surface p-6 shadow-card sm:p-8">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-ink">
                  Saved Address
                </h3>
                <div className="space-y-1 text-sm leading-relaxed text-sub">
                  <p>{user.address.street}</p>
                  <p>
                    {user.address.city}, {user.address.state} {user.address.zip}
                  </p>
                  <p>{user.address.country}</p>
                </div>
              </div>
            )}
          </div>

          <aside className="w-full space-y-3 lg:w-80">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink">
              Quick Links
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-col">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  className="group flex flex-col items-center gap-2 rounded-card border border-line bg-surface p-4 text-center shadow-card transition-all hover:border-gold-500/40 hover:shadow-card-hover sm:flex-row sm:text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-subtle text-sub transition-colors group-hover:bg-gold-100 group-hover:text-gold-600">
                    <Icon name={link.icon} size="sm" />
                  </div>
                  <span className="text-xs font-medium text-ink transition-colors group-hover:text-gold-600 sm:text-sm">
                    {link.label}
                  </span>
                  <Icon name="ChevronRight" size="sm" className="ml-auto hidden text-faint transition-colors group-hover:text-gold-600 sm:block" />
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
