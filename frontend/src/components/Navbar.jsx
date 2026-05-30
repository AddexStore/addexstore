import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useNotifications } from '../context/NotificationContext'
import SearchBar from './SearchBar'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { cartItems } = useCart()
  const { wishlistItems } = useWishlist()
  const navigate = useNavigate()

  const [scrolled, setScrolled] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const dropdownRef = useRef(null)
  const mobileSearchInputRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (mobileSearchOpen && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus()
    }
  }, [mobileSearchOpen])

  const { getUserUnreadCount } = useNotifications()
  const cartCount = cartItems?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0
  const wishlistCount = wishlistItems?.length || 0
  const unreadNotifCount = getUserUnreadCount(user?.id)

  return (
    <nav
      className={`sticky top-0 z-50 bg-[var(--bg-card)]/90 backdrop-blur-md transition-shadow duration-300 ${
        scrolled ? 'shadow-lg shadow-black/5' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 lg:h-20">
          <Link to="/" className="flex-shrink-0">
            <span className="font-playfair-display text-lg sm:text-xl lg:text-2xl font-bold" style={{ color: '#C6A972' }}>
              AddexStores
            </span>
          </Link>

          <div className="hidden lg:flex items-center space-x-8">
            <Link to="/" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[#C6A972] transition">Home</Link>
            <Link to="/products" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[#C6A972] transition">Shop</Link>
            <Link to="/categories" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[#C6A972] transition">Categories</Link>
            <Link to="/new-arrivals" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[#C6A972] transition">New Arrivals</Link>
            <Link to="/about" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[#C6A972] transition">About</Link>
          </div>

          <div className="hidden lg:flex items-center space-x-6">
            {isAuthenticated && user?.role === 'admin' && (
              <Link to="/admin" className="text-sm font-medium text-[#C6A972] hover:text-[#B8965F] transition">Admin</Link>
            )}
          </div>
          <div className="hidden lg:block flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          <div className="flex items-center lg:space-x-1">
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="lg:hidden p-3 rounded-full hover:bg-[var(--bg-hover)] transition min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle search"
            >
              <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <ThemeToggle />
            <Link to="/wishlist" className="hidden lg:flex relative p-2 rounded-full hover:bg-[var(--bg-hover)] transition">
              <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#C6A972] text-[var(--text-primary)] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </Link>

            <Link to="/cart" className="relative p-3 lg:p-2 rounded-full hover:bg-[var(--bg-hover)] transition min-w-[44px] min-h-[44px] flex items-center justify-center">
              <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#C6A972] text-[var(--text-primary)] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            <Link to="/notifications" className="relative p-3 lg:p-2 rounded-full hover:bg-[var(--bg-hover)] transition min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Notifications">
              <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.05 17a2 2 0 0 0 3.9 0" />
              </svg>
              {unreadNotifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#C53030] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadNotifCount > 99 ? '99+' : unreadNotifCount}
                </span>
              )}
            </Link>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login')
                  } else {
                    setProfileDropdownOpen(!profileDropdownOpen)
                  }
                }}
                className="min-w-[44px] min-h-[44px] lg:w-8 lg:h-8 rounded-full bg-[var(--bg-card)] flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-[#C6A972] transition"
                aria-label="Profile"
              >
                {isAuthenticated && user?.name ? (
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <svg className="w-5 h-5 lg:w-4 lg:h-4 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </button>

              {profileDropdownOpen && isAuthenticated && (
                <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-card)] rounded-xl shadow-lg shadow-black/5 border border-[var(--border-color)] py-2 z-50">
                  <div className="px-4 py-2 border-b border-[var(--border-color)]">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{user?.name}</p>
                    <p className="text-xs text-[var(--text-secondary)] truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition"
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition"
                  >
                    Orders
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition"
                  >
                    Settings
                  </Link>
                  {user?.role === 'admin' && (
                    <>
                      <div className="border-t border-[var(--border-color)]" />
                      <Link
                        to="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-[#C6A972] hover:bg-[var(--bg-hover)] transition font-medium"
                      >
                        Admin Dashboard
                      </Link>
                    </>
                  )}
                  <div className="border-t border-[var(--border-color)] mt-1 pt-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false)
                        logout()
                        navigate('/')
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-[#C53030] hover:bg-[var(--bg-hover)] transition"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileSearchOpen ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-2 border-t border-[var(--border-color)] bg-[var(--bg-card)]/95">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <SearchBar inputRef={mobileSearchInputRef} />
            </div>
            <button
              onClick={() => setMobileSearchOpen(false)}
              className="p-3 rounded-full hover:bg-[var(--bg-hover)] transition min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close search"
            >
              <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
