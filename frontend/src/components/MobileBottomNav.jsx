import { Link, useLocation } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import Icon from './ui/Icon'

const tabs = [
  { label: 'Home', path: '/', icon: 'Home' },
  { label: 'Categories', path: '/categories', icon: 'LayoutGrid' },
  { label: 'Search', path: '/search', icon: 'Search' },
  { label: 'Wishlist', path: '/wishlist', icon: 'Heart', badge: 'wishlist' },
  { label: 'Cart', path: '/cart', icon: 'ShoppingBag', badge: 'cart' },
]

export default function MobileBottomNav() {
  const { pathname } = useLocation()
  const { items: wishlistItems } = useWishlist()
  const { cartItems } = useCart()

  const wishlistCount = wishlistItems?.length || 0
  const cartCount = cartItems?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-surface/95 backdrop-blur-xl shadow-overlay lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Primary"
    >
      <div className="flex h-16 items-stretch justify-around">
        {tabs.map((tab) => {
          const isActive = tab.path === '/' ? pathname === '/' : pathname.startsWith(tab.path)
          const count = tab.badge === 'wishlist' ? wishlistCount : tab.badge === 'cart' ? cartCount : 0

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`relative flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? 'text-gold-600' : 'text-sub'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {count > 0 && (
                <span className="absolute right-[calc(50%-16px)] top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[9px] font-bold leading-none text-white">
                  {count > 99 ? '99+' : count}
                </span>
              )}
              <Icon
                name={tab.icon}
                size={20}
                className={`transition-transform ${isActive ? 'scale-110' : ''}`}
              />
              <span className="text-[10px] font-medium tracking-wide">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
