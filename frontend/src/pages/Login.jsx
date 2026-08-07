import { useState } from 'react'
import { Link, useNavigate, Navigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Field, Input } from '../components/ui/Input'
import Button from '../components/ui/Button'
import Icon from '../components/ui/Icon'
import Badge from '../components/ui/Badge'
import { SITE_NAME } from '../constants'

const PERKS = [
  { icon: 'Truck', text: 'Complimentary express shipping' },
  { icon: 'RefreshCw', text: 'Free 30-day returns' },
  { icon: 'Sparkles', text: 'Member-only private sales' },
]

export default function Login() {
  const { login, isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  if (isAuthenticated) {
    return <Navigate to={redirect} replace />
  }

  const validate = () => {
    const errs = {}
    if (!form.email.trim()) {
      errs.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = 'Invalid email address'
    }
    if (!form.password) {
      errs.password = 'Password is required'
    } else if (form.password.length < 6) {
      errs.password = 'Password must be at least 6 characters'
    }
    return errs
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setLoading(true)
    try {
      const userData = await login(form.email, form.password)
      showToast('Welcome back!', 'success')
      navigate(userData.role === 'admin' && redirect === '/' ? '/admin' : redirect)
    } catch {
      showToast('Login failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = () => {
    showToast('Coming Soon', 'info')
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
            <p className="eyebrow mb-4 text-gold-300">The Members&apos; Atelier</p>
            <h2 className="heading-display text-3xl leading-tight text-white xl:text-4xl">
              An elevated wardrobe,
              <br />
              curated for you.
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
            Welcome Back
          </Badge>
          <h1 className="heading-display text-2xl text-ink sm:text-3xl">Sign in</h1>
          <p className="mt-2 text-sm text-sub">Enter your details to access your account.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <Field label="Email" required error={errors.email}>
              <Input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                error={errors.email}
                autoComplete="email"
              />
            </Field>

            <Field label="Password" required error={errors.password}>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  error={errors.password}
                  autoComplete="current-password"
                  className="pr-12"
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

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="flex min-h-[44px] items-center text-xs font-medium text-gold-600 transition-colors hover:text-gold-700"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-sub">
            Don&apos;t have an account?{' '}
            <Link
              to={redirect !== '/' ? `/signup?redirect=${redirect}` : '/signup'}
              className="font-medium text-gold-600 transition-colors hover:text-gold-700"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
