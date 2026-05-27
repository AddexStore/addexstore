import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@sifr.com')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      const user = JSON.parse(localStorage.getItem('sifr_user'))
      if (user?.role === 'admin') {
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
    <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-playfair-display text-[#D4AF37] font-bold">SIFR</h1>
          <p className="text-[#B8B8C2] mt-2 text-sm font-inter">Admin Dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-[#232326] rounded-2xl p-8 shadow-2xl border border-[#2D2D30]">
          <h2 className="text-2xl font-playfair-display text-white mb-6">Admin Login</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#B8B8C2] mb-1 font-inter">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#232326] border border-[#2D2D30] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition font-inter"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-[#B8B8C2] mb-1 font-inter">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#232326] border border-[#2D2D30] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition font-inter"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D4AF37] text-black font-semibold py-3 rounded-xl hover:bg-[#C9A84C] transition disabled:opacity-50 font-inter"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
