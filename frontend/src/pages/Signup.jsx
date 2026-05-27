import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Signup() {
  const { signup, isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
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
      navigate('/')
    } catch {
      showToast('Signup failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="font-playfair-display text-3xl font-bold text-white">
            SIFR
          </Link>
          <p className="text-sm text-[#B8B8C2] mt-2">Create your account</p>
        </div>

        <div className="bg-[#232326] rounded-2xl shadow-lg shadow-black/20 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-[#B8B8C2] uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                className={`w-full min-h-[48px] px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition bg-[#18181B] text-white placeholder-[#6B7280] ${
                  errors.name ? 'border-[#EF4444] bg-[#EF4444]/10' : 'border-[#2D2D30]'
                }`}
              />
              {errors.name && (
                <p className="text-xs text-[#EF4444] mt-1.5">{errors.name}</p>
              )}
            </div>

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

            <div>
              <label className="block text-xs font-medium text-[#B8B8C2] uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full min-h-[48px] px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition bg-[#18181B] text-white placeholder-[#6B7280] ${
                  errors.confirmPassword
                    ? 'border-[#EF4444] bg-[#EF4444]/10'
                    : 'border-[#2D2D30]'
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-[#EF4444] mt-1.5">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] py-3 bg-[#D4AF37] text-black text-sm font-medium rounded-xl hover:bg-[#C9A84C] transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#B8B8C2]">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-[#D4AF37] hover:text-[#C9A84C] font-medium transition"
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
