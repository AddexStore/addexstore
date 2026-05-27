import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Login() {
  const { login, isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
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
      navigate(userData.role === 'admin' ? '/admin' : '/')
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
    <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="font-playfair-display text-3xl font-bold text-white">
            SIFR
          </Link>
          <p className="text-sm text-[#B8B8C2] mt-2">Sign in to your account</p>
        </div>

        <div className="bg-[#232326] rounded-2xl shadow-lg shadow-black/20 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-[#B8B8C2] uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full min-h-[48px] px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition bg-[#18181B] text-white placeholder-[#6B7280] ${
                  errors.email ? 'border-[#EF4444] bg-[#EF4444]/10' : 'border-[#2D2D30]'
                }`}
              />
              {errors.email && (
                <p className="text-xs text-[#EF4444] mt-1.5">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#B8B8C2] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full min-h-[48px] px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition bg-[#18181B] text-white placeholder-[#6B7280] ${
                  errors.password ? 'border-[#EF4444] bg-[#EF4444]/10' : 'border-[#2D2D30]'
                }`}
              />
              {errors.password && (
                <p className="text-xs text-[#EF4444] mt-1.5">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-[#D4AF37] hover:text-[#C9A84C] font-medium transition min-h-[44px]"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] py-3 bg-[#D4AF37] text-black text-sm font-medium rounded-xl hover:bg-[#C9A84C] transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#B8B8C2]">
              Don&apos;t have an account?{' '}
              <Link
                to="/signup"
                className="text-[#D4AF37] hover:text-[#C9A84C] font-medium transition"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
