import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
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
      showToast('Invalid credentials', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-playfair-display text-[#C6A972] font-bold">AddexStores</h1>
          <p className="text-[var(--text-secondary)] mt-2 text-sm font-inter">Admin Dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-[var(--bg-card)] rounded-2xl p-8 shadow-2xl border border-[var(--border-color)]">
          <h2 className="text-2xl font-playfair-display text-[var(--text-primary)] mb-6">Admin Login</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1 font-inter">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#C6A972] transition font-inter"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1 font-inter">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#C6A972] transition font-inter"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C6A972] text-white font-semibold py-3 rounded-xl hover:bg-[#B8965F] transition disabled:opacity-50 font-inter"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
