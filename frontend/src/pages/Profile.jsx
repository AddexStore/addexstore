import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { formatDate } from '../utils/helpers'
import BackButton from '../components/BackButton'

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

  const quickLinks = [
    { label: 'My Orders', path: '/orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { label: 'My Wishlist', path: '/wishlist', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
    { label: 'Settings', path: '/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  ]

  return (
    <div className="min-h-screen bg-[var(--bg-page)] pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="flex items-center gap-3 mb-8">
          <BackButton />
          <h1 className="font-playfair-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            My Profile
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="flex-1 space-y-6">
            <div className="bg-[var(--bg-card)] rounded-xl shadow-lg shadow-black/5 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <div className="w-20 h-20 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#C6A972] to-[#B8965F] flex items-center justify-center text-black text-2xl sm:text-xl font-bold font-playfair-display flex-shrink-0">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="text-center sm:text-left">
                    <h2 className="text-xl sm:text-lg font-semibold text-[var(--text-primary)]">
                      {user.name || 'User'}
                    </h2>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Member since{' '}
                      {user.joinDate
                        ? formatDate(user.joinDate)
                        : 'Today'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`min-h-[44px] px-5 py-2 text-xs font-medium rounded-full border transition self-center sm:self-start ${
                    isEditing
                      ? 'border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                      : 'border-[#C6A972] text-[#C6A972] hover:bg-[#C6A972]/10'
                  }`}
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full min-h-[48px] px-4 py-3 text-sm border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C6A972] focus:border-transparent transition bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full min-h-[48px] px-4 py-3 text-sm border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C6A972] focus:border-transparent transition bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full min-h-[48px] px-4 py-3 text-sm border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C6A972] focus:border-transparent transition bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)]"
                    />
                  </div>
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full sm:w-auto min-h-[48px] px-8 py-3 bg-[#C6A972] text-white text-sm font-medium rounded-full hover:bg-[#B8965F] transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/5"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        Email
                      </p>
                      <p className="text-sm text-[var(--text-primary)] mt-1">
                        {user.email || 'â€”'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        Phone
                      </p>
                      <p className="text-sm text-[var(--text-primary)] mt-1">
                        {user.phone || 'â€”'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        Role
                      </p>
                      <p className="text-sm text-[var(--text-primary)] mt-1 capitalize">
                        {user.role || 'customer'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        Member Since
                      </p>
                      <p className="text-sm text-[var(--text-primary)] mt-1">
                        {user.joinDate
                          ? formatDate(user.joinDate)
                          : 'Today'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {user.address && (
              <div className="bg-[var(--bg-card)] rounded-xl shadow-lg shadow-black/5 p-6 sm:p-8">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">
                  Saved Address
                </h3>
                <div className="text-sm text-[var(--text-secondary)] space-y-1 leading-relaxed">
                  <p>{user.address.street}</p>
                  <p>
                    {user.address.city}, {user.address.state}{' '}
                    {user.address.zip}
                  </p>
                  <p>{user.address.country}</p>
                </div>
              </div>
            )}
          </div>

          <div className="lg:w-80 space-y-3">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-3">
              Quick Links
            </h3>
            <div className="grid grid-cols-2 sm:flex sm:flex-col gap-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 p-4 bg-[var(--bg-card)] rounded-xl shadow-lg shadow-black/5 hover:shadow-lg transition group text-center sm:text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center group-hover:bg-[#C6A972]/10 transition flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[#C6A972] transition"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d={link.icon}
                      />
                    </svg>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-[var(--text-primary)] group-hover:text-[#C6A972] transition">
                    {link.label}
                  </span>
                  <svg
                    className="w-4 h-4 hidden sm:block ml-auto text-[var(--text-secondary)] group-hover:text-[#C6A972] transition"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
