import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { Field, Input } from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import Badge from '../../components/ui/Badge'
import { SITE_NAME } from '../../constants'

const PERKS = [
  { icon: 'ShieldCheck', text: 'Role-based admin access' },
  { icon: 'BarChart3', text: 'Real-time sales analytics' },
  { icon: 'LayoutDashboard', text: 'Full order and inventory control' },
]

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const loggedInUser = await login(email, password)
      if (loggedInUser?.role === 'admin') {
        showToast('Welcome to Admin Dashboard', 'success')
        navigate('/admin/dashboard')
      } else {
        showToast('Admin access required', 'error')
      }
    } catch {
      setError('Invalid credentials. Please check your email and password.')
      showToast('Invalid credentials', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-page">
      <aside className="relative hidden w-1/2 overflow-hidden bg-charcoal-900 lg:block">
        <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_center,#fff_1px,transparent_1px)] [background-size:28px_28px]" />
        <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-gold-500/15 blur-3xl" />
        <div className="absolute -left-20 bottom-1/4 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-3 text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-500/40 bg-gold-500/10">
              <Icon name="Gem" size="md" className="text-gold-300" />
            </span>
            <span className="heading-display text-xl">{SITE_NAME}</span>
          </Link>

          <div>
            <p className="eyebrow mb-4 text-gold-300">The Management Suite</p>
            <h2 className="heading-display text-3xl leading-tight text-white xl:text-4xl">
              Command your storefront
              <br />
              with confidence.
            </h2>
            <div className="mt-8 space-y-3">
              {PERKS.map((perk) => (
                <div key={perk.text} className="flex items-center gap-3 text-sm text-white/70">
                  <Icon name={perk.icon} size="sm" className="text-gold-300" />
                  {perk.text}
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-white/40">© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
        </div>
      </aside>

      <main className="flex w-full items-center justify-center px-4 py-12 sm:px-8 lg:w-1/2">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-10 flex items-center justify-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-500/40 bg-gold-100 text-gold-600">
              <Icon name="Gem" size="sm" />
            </span>
            <span className="heading-display text-lg text-ink">{SITE_NAME}</span>
          </Link>

          <Badge tone="gold" size="md" className="mb-3">
            Staff Only
          </Badge>
          <h1 className="heading-display text-2xl text-ink sm:text-3xl">Admin Login</h1>
          <p className="mt-2 text-sm text-sub">Sign in to manage your store.</p>

          {error && (
            <div className="mt-5 flex items-start gap-2.5 rounded-field border border-danger/30 bg-danger/8 px-4 py-3 text-sm text-danger">
              <Icon name="AlertCircle" size="sm" className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <Field label="Email" required>
              <Input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                placeholder="admin@addexstores.com"
                autoComplete="email"
                required
              />
            </Field>

            <Field label="Password" required>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-sub transition-colors hover:text-ink"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Icon name={showPassword ? 'EyeOff' : 'Eye'} size="sm" />
                </button>
              </div>
            </Field>

            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
