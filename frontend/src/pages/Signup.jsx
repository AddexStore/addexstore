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
  { icon: 'Gem', text: 'Access to private collections' },
]

export default function Signup() {
  const { signup, isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  if (isAuthenticated) {
    return <Navigate to={redirect} replace />
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) {
      errs.name = 'Name is required'
    }
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
    if (!form.confirmPassword) {
      errs.confirmPassword = 'Please confirm your password'
    } else if (form.password !== form.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match'
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
      await signup(form.name, form.email, form.password)
      showToast('Account created successfully!', 'success')
      navigate(redirect)
    } catch (err) {
      const msg = err?.message || ''
      if (msg.toLowerCase().includes('email')) {
        setErrors((prev) => ({ ...prev, email: msg }))
      } else {
        showToast(msg || 'Signup failed. Please try again.', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const passwordField = (name, value, placeholder, autoComplete) => (
    <div className="relative">
      <Input
        type={name === 'password' ? (showPassword ? 'text' : 'password') : (showConfirm ? 'text' : 'password')}
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        error={errors[name]}
        autoComplete={autoComplete}
        className="pr-12"
      />
      <button
        type="button"
        onClick={() => (name === 'password' ? setShowPassword((v) => !v) : setShowConfirm((v) => !v))}
        className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-sub transition-colors hover:text-ink"
        aria-label={name === 'password' ? 'Toggle password visibility' : 'Toggle confirm password visibility'}
      >
        <Icon
          name={name === 'password' ? (showPassword ? 'EyeOff' : 'Eye') : (showConfirm ? 'EyeOff' : 'Eye')}
          size="sm"
        />
      </button>
    </div>
  )

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
            <p className="eyebrow mb-4 text-gold-300">Become a Member</p>
            <h2 className="heading-display text-3xl leading-tight text-white xl:text-4xl">
              Join the inner circle
              <br />
              of discerning shoppers.
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
            New Member
          </Badge>
          <h1 className="heading-display text-2xl text-ink sm:text-3xl">Create your account</h1>
          <p className="mt-2 text-sm text-sub">Join us for a more considered shopping experience.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <Field label="Full Name" required error={errors.name}>
              <Input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                error={errors.name}
                autoComplete="name"
              />
            </Field>

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
              {passwordField('password', form.password, 'Create a password', 'new-password')}
            </Field>

            <Field label="Confirm Password" required error={errors.confirmPassword}>
              {passwordField('confirmPassword', form.confirmPassword, 'Confirm your password', 'new-password')}
            </Field>

            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-sub">
            Already have an account?{' '}
            <Link
              to={redirect !== '/' ? `/login?redirect=${redirect}` : '/login'}
              className="font-medium text-gold-600 transition-colors hover:text-gold-700"
            >
              Sign In
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
