import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useSettings } from '../context/SettingsContext'

export default function Footer() {
  const { siteName, siteDescription, storeAddress } = useSettings()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

  return (
    <footer className="bg-[var(--bg-card)] text-[var(--text-primary)]/80 font-inter">
      {/* Newsletter */}
      <div className="border-b border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Join the {siteName} World</h3>
              <p className="text-sm text-[var(--text-primary)]/60 mt-1">Subscribe for exclusive access to new drops and offers.</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full sm:w-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="px-4 py-2.5 w-full sm:w-64 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-l-full text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#C6A972] transition"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#C6A972] text-white text-sm font-medium rounded-r-full hover:bg-[#B8965F] transition"
              >
                {subscribed ? 'Subscribed!' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* About */}
          <div>
            <h4 className="font-playfair-display text-lg font-bold text-[var(--text-primary)] mb-4">{siteName}</h4>
            <p className="text-sm leading-relaxed text-[var(--text-primary)]/60">
              {siteDescription || `${siteName} is a premium shopping destination offering handpicked collections that define elegance and sophistication. Experience unparalleled quality and timeless style.`}
            </p>
            {storeAddress && (
              <p className="text-sm text-[var(--text-primary)]/40 mt-4 whitespace-pre-line">
                {storeAddress}
              </p>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-playfair-display text-base font-semibold text-[var(--text-primary)] mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              <li><Link to="/" className="text-sm text-[var(--text-primary)]/60 hover:text-[#C6A972] transition">Home</Link></li>
              <li><Link to="/products" className="text-sm text-[var(--text-primary)]/60 hover:text-[#C6A972] transition">Shop</Link></li>
              <li><Link to="/about" className="text-sm text-[var(--text-primary)]/60 hover:text-[#C6A972] transition">About</Link></li>
              <li><Link to="/contact" className="text-sm text-[var(--text-primary)]/60 hover:text-[#C6A972] transition">Contact</Link></li>
              <li><Link to="/faq" className="text-sm text-[var(--text-primary)]/60 hover:text-[#C6A972] transition">FAQ</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-playfair-display text-base font-semibold text-[var(--text-primary)] mb-4">Customer Service</h4>
            <ul className="space-y-2.5">
              <li><Link to="/shipping" className="text-sm text-[var(--text-primary)]/60 hover:text-[#C6A972] transition">Shipping</Link></li>
              <li><Link to="/returns" className="text-sm text-[var(--text-primary)]/60 hover:text-[#C6A972] transition">Returns</Link></li>
              <li><Link to="/size-guide" className="text-sm text-[var(--text-primary)]/60 hover:text-[#C6A972] transition">Size Guide</Link></li>
              <li><Link to="/privacy-policy" className="text-sm text-[var(--text-primary)]/60 hover:text-[#C6A972] transition">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h4 className="font-playfair-display text-base font-semibold text-[var(--text-primary)] mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[var(--bg-page)] flex items-center justify-center hover:bg-[#C6A972]/20 transition group" aria-label="Instagram">
                <svg className="w-5 h-5 text-[var(--text-primary)]/60 group-hover:text-[#C6A972] transition" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[var(--bg-page)] flex items-center justify-center hover:bg-[#C6A972]/20 transition group" aria-label="Twitter">
                <svg className="w-5 h-5 text-[var(--text-primary)]/60 group-hover:text-[#C6A972] transition" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[var(--bg-page)] flex items-center justify-center hover:bg-[#C6A972]/20 transition group" aria-label="Facebook">
                <svg className="w-5 h-5 text-[var(--text-primary)]/60 group-hover:text-[#C6A972] transition" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[var(--bg-page)] flex items-center justify-center hover:bg-[#C6A972]/20 transition group" aria-label="Pinterest">
                <svg className="w-5 h-5 text-[var(--text-primary)]/60 group-hover:text-[#C6A972] transition" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.627 0 12-5.373 12-12 0-6.62-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-primary)]/40">
            &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
          <div className="flex items-center space-x-3">
            <span className="text-xs text-[var(--text-primary)]/40">We accept</span>
            <div className="flex items-center space-x-2">
              <svg className="w-8 h-5 text-[var(--text-primary)]/30" viewBox="0 0 36 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="0.5" y="0.5" width="35" height="23" rx="3" />
                <text x="18" y="16" textAnchor="middle" fontSize="10" fill="currentColor" stroke="none">VISA</text>
              </svg>
              <svg className="w-8 h-5 text-[var(--text-primary)]/30" viewBox="0 0 36 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="0.5" y="0.5" width="35" height="23" rx="3" />
                <text x="18" y="16" textAnchor="middle" fontSize="7" fill="currentColor" stroke="none">MC</text>
              </svg>
              <svg className="w-8 h-5 text-[var(--text-primary)]/30" viewBox="0 0 36 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="0.5" y="0.5" width="35" height="23" rx="3" />
                <text x="18" y="16" textAnchor="middle" fontSize="6" fill="currentColor" stroke="none">AMEX</text>
              </svg>
              <svg className="w-8 h-5 text-[var(--text-primary)]/30" viewBox="0 0 36 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="0.5" y="0.5" width="35" height="23" rx="3" />
                <text x="18" y="16" textAnchor="middle" fontSize="6" fill="currentColor" stroke="none">PP</text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
