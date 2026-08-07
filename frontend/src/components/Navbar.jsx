import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useNotifications } from '../context/NotificationContext'
import SearchBar from './SearchBar'
import ThemeToggle from './ThemeToggle'
import Icon from './ui/Icon'
import { SITE_NAME } from '../constants'

const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Shop', path: '/products' },
  { name: 'Categories', path: '/categories' },
  { name: 'New Arrivals', path: '/new-arrivals' },
  { name: 'About', path: '/about' },
]

function BadgeCount({ count, tone = 'gold' }) {
  if (!count) return null
  return (
    <span
      className={`absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none ${
        tone === 'gold' ? 'bg-gold-500 text-white' : 'bg-danger text-white'
      }`}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}

function IconButton({ to, onClick, label, count, tone, children }) {
  const base = 'relative flex h-11 w-11 items-center justify-center rounded-full text-sub transition-colors hover:bg-subtle hover:text-ink lg:h-10 lg:w-10'
  if (to) {
    return (
      <Link to={to} className={base} aria-label={label}>
        {children}
        <BadgeCount count={count} tone={tone} />
      </Link>
    )
  }
  return (
    <button onClick={onClick} className={base} aria-label={label}>
      {children}
      <BadgeCount count={count} tone={tone} />
    </button>
  )
}

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { cartItems } = useCart()
  const { wishlistItems } = useWishlist()
  const { getUserUnreadCount } = useNotifications()
  const navigate = useNavigate()
  const location = useLocation()

  const [scrolled, setScrolled] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const dropdownRef = useRef(null)
  const mobileSearchInputRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (mobileSearchOpen && mobileSearchInputRef.current) mobileSearchInputRef.current.focus()
  }, [mobileSearchOpen])

  const cartCount = cartItems?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0
  const wishlistCount = wishlistItems?.length || 0
  const unreadCount = getUserUnreadCount(user?.id)
  const isAdmin = user?.role === 'admin'

  return (
    <nav className={`sticky top-0 z-50 border-b border-line/80 bg-surface/90 backdrop-blur-xl transition-all duration-300 ${scrolled ? 'shadow-sm' : ''}`}>
      <div className="relative overflow-hidden bg-charcoal-900 text-center">
        <p className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.18em] text-gold-300">
          <Icon name="Sparkles" size={12} className="mr-1.5 inline -mt-0.5 text-gold-400" />
          Complimentary shipping on orders over $100 · Worldwide delivery
        </p>
      </div>

      <div className="container-lux">
        <div className="flex h-16 items-center justify-between gap-4 lg:h-20">
          <Link to="/" className="mr-2 flex-shrink-0 lg:mr-8">
            <span className="heading-display text-xl text-gold-600 lg:text-2xl">
              {SITE_NAME}
            </span>
          </Link>

          <div className="hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.path
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative text-sm font-medium transition-colors hover:text-ink ${
                    isActive ? 'text-ink' : 'text-sub'
                  }`}
                >
                  {link.name}
                  <span
                    className={`absolute -bottom-1.5 left-0 h-[2px] bg-gold-500 transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0'
                    }`}
                  />
                </Link>
              )
            })}
            {isAdmin && (
              <Link to="/admin" className="text-sm font-medium text-gold-600 transition-colors hover:text-gold-700">
                Admin
              </Link>
            )}
          </div>

          <div className="hidden max-w-xs flex-1 lg:block">
            <SearchBar />
          </div>

          <div className="flex items-center lg:gap-1">
            <IconButton label="Open search" onClick={() => setMobileSearchOpen((v) => !v)}>
              <Icon name="Search" className="lg:hidden" />
            </IconButton>

            <div className="hidden lg:block">
              <ThemeToggle />
            </div>

            <IconButton to="/wishlist" label="Wishlist" count={wishlistCount}>
              <Icon name="Heart" />
            </IconButton>

            <IconButton to="/cart" label="Shopping cart" count={cartCount}>
              <Icon name="ShoppingBag" />
            </IconButton>

            <IconButton to="/notifications" label="Notifications" count={unreadCount}>
              <Icon name="Bell" />
            </IconButton>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => (isAuthenticated ? setProfileOpen((v) => !v) : navigate('/login'))}
                className="ml-1 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-line bg-surface text-sm font-semibold text-ink transition-colors hover:border-gold-400 lg:h-9 lg:w-9"
                aria-label="Account"
                aria-expanded={profileOpen}
              >
                {isAuthenticated && user?.name ? (
                  <span className="bg-gold-100 flex h-full w-full items-center justify-center text-gold-700">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <Icon name="User" size={18} />
                )}
              </button>

              {profileOpen && isAuthenticated && (
                <div className="absolute right-0 mt-2 w-56 rounded-card border border-line bg-surface py-2 shadow-overlay animate-scale-in">
                  <div className="border-b border-line px-5 py-3">
                    <p className="truncate text-sm font-semibold text-ink">{user?.name}</p>
                    <p className="truncate text-xs text-sub">{user?.email}</p>
                  </div>
                  {[
                    { label: 'My Profile', to: '/profile', icon: 'User' },
                    { label: 'Orders', to: '/orders', icon: 'Package' },
                    { label: 'Wishlist', to: '/wishlist', icon: 'Heart' },
                    { label: 'Settings', to: '/settings', icon: 'Settings' },
                    ...(isAdmin ? [{ label: 'Admin Dashboard', to: '/admin', icon: 'LayoutDashboard' }] : []),
                  ].map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-5 py-2.5 text-sm text-sub transition-colors hover:bg-subtle hover:text-ink"
                    >
                      <Icon name={item.icon} size={16} />
                      {item.label}
                    </Link>
                  ))}
                  <div className="mt-1 border-t border-line pt-1">
                    <button
                      onClick={() => {
                        setProfileOpen(false)
                        logout()
                        navigate('/')
                      }}
                      className="flex w-full items-center gap-3 px-5 py-2.5 text-left text-sm text-danger transition-colors hover:bg-danger/10"
                    >
                      <Icon name="LogOut" size={16} />
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
        className={`overflow-hidden border-t border-line transition-all duration-300 lg:hidden ${
          mobileSearchOpen ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-surface px-4 py-3">
          <SearchBar inputRef={mobileSearchInputRef} />
        </div>
      </div>
    </nav>
  )
}
