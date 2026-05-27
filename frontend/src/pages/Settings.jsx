import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import BackButton from '../components/BackButton'

export default function Settings() {
  const { user, updateProfile } = useAuth()
  const toast = useToast()

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zip: user?.address?.zip || '',
    country: user?.address?.country || '',
  })

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
  })

  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  })

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleToggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      await updateProfile({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: {
          street: profile.street,
          city: profile.city,
          state: profile.state,
          zip: profile.zip,
          country: profile.country,
        },
      })
      toast.showToast('Profile updated successfully', 'success')
    } catch {
      toast.showToast('Failed to update profile', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = (e) => {
    e.preventDefault()
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      toast.showToast('Please fill in all password fields', 'warning')
      return
    }
    if (passwordForm.new.length < 8) {
      toast.showToast('New password must be at least 8 characters', 'warning')
      return
    }
    if (passwordForm.new !== passwordForm.confirm) {
      toast.showToast('Passwords do not match', 'error')
      return
    }
    toast.showToast('Password changed successfully', 'success')
    setPasswordForm({ current: '', new: '', confirm: '' })
  }

  const handleDeleteAccount = () => {
    toast.showToast('Account deletion request submitted', 'info')
    setShowDeleteDialog(false)
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-[#232326] flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Sign In Required</h2>
          <p className="text-sm text-[#B8B8C2] mb-6">Please sign in to manage your settings.</p>
          <a href="/login" className="inline-block min-h-[48px] px-8 py-3 bg-[#D4AF37] text-black text-sm font-medium rounded-full hover:bg-[#C9A84C] transition active:scale-[0.98]">
            Sign In
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F0F10] pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <BackButton />
            <h1 className="text-2xl sm:text-3xl font-playfair-display font-bold text-white">Settings</h1>
          </div>
          <p className="text-sm text-[#B8B8C2] mt-1">Manage your account preferences and information.</p>
        </div>

        <div className="space-y-6 sm:space-y-8">
          <section className="bg-[#232326] rounded-2xl shadow-lg shadow-black/20 border border-[#2D2D30] p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-white mb-6">Profile Settings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-[#B8B8C2] mb-1.5">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  className="w-full min-h-[48px] px-4 py-3 text-sm border border-[#2D2D30] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition bg-[#18181B] text-white placeholder-[#6B7280]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#B8B8C2] mb-1.5">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  className="w-full min-h-[48px] px-4 py-3 text-sm border border-[#2D2D30] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition bg-[#18181B] text-white placeholder-[#6B7280]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#B8B8C2] mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  className="w-full min-h-[48px] px-4 py-3 text-sm border border-[#2D2D30] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition bg-[#18181B] text-white placeholder-[#6B7280]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#B8B8C2] mb-1.5">Street Address</label>
                <input
                  type="text"
                  name="street"
                  value={profile.street}
                  onChange={handleProfileChange}
                  className="w-full min-h-[48px] px-4 py-3 text-sm border border-[#2D2D30] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition bg-[#18181B] text-white placeholder-[#6B7280]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#B8B8C2] mb-1.5">City</label>
                <input
                  type="text"
                  name="city"
                  value={profile.city}
                  onChange={handleProfileChange}
                  className="w-full min-h-[48px] px-4 py-3 text-sm border border-[#2D2D30] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition bg-[#18181B] text-white placeholder-[#6B7280]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#B8B8C2] mb-1.5">State</label>
                <input
                  type="text"
                  name="state"
                  value={profile.state}
                  onChange={handleProfileChange}
                  className="w-full min-h-[48px] px-4 py-3 text-sm border border-[#2D2D30] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition bg-[#18181B] text-white placeholder-[#6B7280]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#B8B8C2] mb-1.5">ZIP / Postal Code</label>
                <input
                  type="text"
                  name="zip"
                  value={profile.zip}
                  onChange={handleProfileChange}
                  className="w-full min-h-[48px] px-4 py-3 text-sm border border-[#2D2D30] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition bg-[#18181B] text-white placeholder-[#6B7280]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#B8B8C2] mb-1.5">Country</label>
                <input
                  type="text"
                  name="country"
                  value={profile.country}
                  onChange={handleProfileChange}
                  className="w-full min-h-[48px] px-4 py-3 text-sm border border-[#2D2D30] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition bg-[#18181B] text-white placeholder-[#6B7280]"
                />
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-[#2D2D30]">
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="w-full sm:w-auto min-h-[48px] px-8 py-3 bg-[#D4AF37] text-black text-sm font-semibold rounded-full hover:bg-[#C9A84C] transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </section>

          <section className="bg-[#232326] rounded-2xl shadow-lg shadow-black/20 border border-[#2D2D30] p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-white mb-6">Notification Preferences</h2>
            <div className="space-y-5">
              {[
                { key: 'email', label: 'Email Notifications', description: 'Receive order updates and promotions via email' },
                { key: 'sms', label: 'SMS Alerts', description: 'Get text message alerts for order status changes' },
                { key: 'push', label: 'Push Notifications', description: 'Enable browser push notifications for real-time updates' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-3 gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{item.label}</p>
                    <p className="text-xs text-[#B8B8C2] mt-0.5">{item.description}</p>
                  </div>
                  <button
                    onClick={() => handleToggle(item.key)}
                    className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${
                      notifications[item.key] ? 'bg-[#D4AF37]' : 'bg-[#2D2D30]'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-lg shadow-black/20 transition-transform ${
                        notifications[item.key] ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-[#232326] rounded-2xl shadow-lg shadow-black/20 border border-[#2D2D30] p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-white mb-6">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-[#B8B8C2] mb-1.5">Current Password</label>
                <input
                  type="password"
                  name="current"
                  value={passwordForm.current}
                  onChange={handlePasswordChange}
                  className="w-full min-h-[48px] px-4 py-3 text-sm border border-[#2D2D30] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition bg-[#18181B] text-white placeholder-[#6B7280]"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#B8B8C2] mb-1.5">New Password</label>
                <input
                  type="password"
                  name="new"
                  value={passwordForm.new}
                  onChange={handlePasswordChange}
                  className="w-full min-h-[48px] px-4 py-3 text-sm border border-[#2D2D30] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition bg-[#18181B] text-white placeholder-[#6B7280]"
                  placeholder="At least 8 characters"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#B8B8C2] mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  name="confirm"
                  value={passwordForm.confirm}
                  onChange={handlePasswordChange}
                  className="w-full min-h-[48px] px-4 py-3 text-sm border border-[#2D2D30] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition bg-[#18181B] text-white placeholder-[#6B7280]"
                  placeholder="Re-enter new password"
                />
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto min-h-[48px] px-8 py-3 bg-[#D4AF37] text-black text-sm font-semibold rounded-full hover:bg-[#C9A84C] transition active:scale-[0.98]"
                >
                  Update Password
                </button>
              </div>
            </form>
          </section>

          <section className="bg-[#232326] rounded-2xl shadow-lg shadow-black/20 border border-[#2D2D30] p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-white mb-2">Account</h2>
            <p className="text-sm text-[#B8B8C2] mb-6">Permanently delete your account and all associated data.</p>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="w-full sm:w-auto min-h-[48px] px-8 py-3 border border-[#EF4444]/30 text-[#EF4444] text-sm font-medium rounded-full hover:bg-[#EF4444]/10 transition active:scale-[0.98]"
            >
              Delete Account
            </button>
          </section>
        </div>

        {showDeleteDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteDialog(false)} />
            <div className="relative bg-[#232326] rounded-2xl shadow-xl max-w-md w-full p-6 sm:p-8 border border-[#2D2D30] mx-4">
              <div className="w-14 h-14 rounded-full bg-[#EF4444]/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-[#EF4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white text-center mb-2">Delete Account</h3>
              <p className="text-sm text-[#B8B8C2] text-center mb-6 leading-relaxed">
                Are you sure you want to delete your account? This action cannot be undone. All your data, orders, and preferences will be permanently removed.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="flex-1 min-h-[48px] px-4 py-3 border border-[#2D2D30] text-[#B8B8C2] text-sm font-medium rounded-full hover:bg-[#2A2A2E] transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 min-h-[48px] px-4 py-3 bg-[#EF4444] text-white text-sm font-medium rounded-full hover:bg-[#DC2626] transition"
                >
                  Delete My Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
