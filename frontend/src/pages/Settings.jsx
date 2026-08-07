import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Field, Input, Toggle } from '../components/ui/Input'
import Button from '../components/ui/Button'
import Icon from '../components/ui/Icon'
import EmptyState from '../components/EmptyState'
import { ConfirmDialog } from '../components/ui/Modal'

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
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <EmptyState
          icon="User"
          title="Sign In Required"
          message="Please sign in to manage your settings."
          actionLabel="Sign In"
          actionLink="/login"
        />
      </div>
    )
  }

  const sectionClass = 'rounded-card border border-line bg-surface p-6 shadow-card sm:p-8'
  const sectionTitle = 'mb-6 text-lg font-semibold text-ink'

  return (
    <div className="min-h-screen bg-page pb-16">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <p className="eyebrow mb-2 text-gold-600">Account</p>
          <h1 className="heading-display text-2xl sm:text-3xl">Settings</h1>
          <p className="mt-1 text-sm text-sub">Manage your account preferences and information.</p>
        </div>

        <div className="space-y-6 sm:space-y-8">
          <section className={sectionClass}>
            <h2 className={sectionTitle}>Profile Settings</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Full Name">
                <Input type="text" name="name" value={profile.name} onChange={handleProfileChange} />
              </Field>
              <Field label="Email Address">
                <Input type="email" name="email" value={profile.email} onChange={handleProfileChange} />
              </Field>
              <Field label="Phone Number">
                <Input type="tel" name="phone" value={profile.phone} onChange={handleProfileChange} />
              </Field>
              <Field label="Street Address">
                <Input type="text" name="street" value={profile.street} onChange={handleProfileChange} />
              </Field>
              <Field label="City">
                <Input type="text" name="city" value={profile.city} onChange={handleProfileChange} />
              </Field>
              <Field label="State">
                <Input type="text" name="state" value={profile.state} onChange={handleProfileChange} />
              </Field>
              <Field label="ZIP / Postal Code">
                <Input type="text" name="zip" value={profile.zip} onChange={handleProfileChange} />
              </Field>
              <Field label="Country">
                <Input type="text" name="country" value={profile.country} onChange={handleProfileChange} />
              </Field>
            </div>
            <div className="mt-6 border-t border-line pt-6">
              <Button variant="primary" onClick={handleSaveProfile} loading={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </section>

          <section className={sectionClass}>
            <h2 className={sectionTitle}>Notification Preferences</h2>
            <div className="divide-y divide-line">
              {[
                { key: 'email', label: 'Email Notifications', description: 'Receive order updates and promotions via email' },
                { key: 'sms', label: 'SMS Alerts', description: 'Get text message alerts for order status changes' },
                { key: 'push', label: 'Push Notifications', description: 'Enable browser push notifications for real-time updates' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-4 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">{item.label}</p>
                    <p className="mt-0.5 text-xs text-sub">{item.description}</p>
                  </div>
                  <Toggle
                    checked={notifications[item.key]}
                    onChange={() => handleToggle(item.key)}
                    aria-label={`Toggle ${item.label}`}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className={sectionClass}>
            <h2 className={sectionTitle}>Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-5">
              <Field label="Current Password">
                <Input
                  type="password"
                  name="current"
                  value={passwordForm.current}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                />
              </Field>
              <Field label="New Password">
                <Input
                  type="password"
                  name="new"
                  value={passwordForm.new}
                  onChange={handlePasswordChange}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                />
              </Field>
              <Field label="Confirm New Password">
                <Input
                  type="password"
                  name="confirm"
                  value={passwordForm.confirm}
                  onChange={handlePasswordChange}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                />
              </Field>
              <div className="pt-2">
                <Button type="submit" variant="secondary">
                  Update Password
                </Button>
              </div>
            </form>
          </section>

          <section className={sectionClass}>
            <h2 className={sectionTitle}>Account</h2>
            <p className="mb-6 text-sm text-sub">
              Permanently delete your account and all associated data.
            </p>
            <Button
              variant="danger"
              icon="Trash2"
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete Account
            </Button>
          </section>
        </div>

        <ConfirmDialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDeleteAccount}
          title="Delete Account"
          message="Are you sure you want to delete your account? This action cannot be undone. All your data, orders, and preferences will be permanently removed."
          confirmLabel="Delete My Account"
          danger
        />
      </div>
    </div>
  )
}
