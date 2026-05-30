import { useState } from 'react'
import { Link, useNavigate, Navigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

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
    } catch {
      showToast('Signup failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="font-playfair-display text-3xl font-bold text-[var(--text-primary)]">
            AddexStores
          </Link>
          <p className="text-sm text-[var(--text-secondary)] mt-2">Create your account</p>
        </div>

        <div className="bg-[var(--bg-card)] rounded-2xl shadow-lg shadow-black/5 p-6 sm:p-8">
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
                placeholder="John Doe"
                className={`w-full min-h-[48px] px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C6A972] focus:border-transparent transition bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] ${
                  errors.name ? 'border-[#C53030] bg-[#C53030]/10' : 'border-[var(--border-color)]'
                }`}
              />
              {errors.name && (
                <p className="text-xs text-[#C53030] mt-1.5">{errors.name}</p>
              )}
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
                placeholder="you@example.com"
                className={`w-full min-h-[48px] px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C6A972] focus:border-transparent transition bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] ${
                  errors.email ? 'border-[#C53030] bg-[#C53030]/10' : 'border-[var(--border-color)]'
                }`}
              />
              {errors.email && (
                <p className="text-xs text-[#C53030] mt-1.5">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create a password"
                className={`w-full min-h-[48px] px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C6A972] focus:border-transparent transition bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] ${
                  errors.password ? 'border-[#C53030] bg-[#C53030]/10' : 'border-[var(--border-color)]'
                }`}
              />
              {errors.password && (
                <p className="text-xs text-[#C53030] mt-1.5">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className={`w-full min-h-[48px] px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C6A972] focus:border-transparent transition bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] ${
                  errors.confirmPassword
                    ? 'border-[#C53030] bg-[#C53030]/10'
                    : 'border-[var(--border-color)]'
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-[#C53030] mt-1.5">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] py-3 bg-[#C6A972] text-white text-sm font-medium rounded-xl hover:bg-[#B8965F] transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              Already have an account?{' '}
              <Link
                to={redirect !== '/' ? `/login?redirect=${redirect}` : '/login'}
                className="text-[#C6A972] hover:text-[#B8965F] font-medium transition"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
