import { Link, useLocation } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'

const tabs = [
  {
    label: 'Home',
    path: '/',
    icon: (active) => (
      <svg className="w-6 h-6" fill={active ? '#D4AF37' : 'none'} stroke={active ? '#D4AF37' : '#B8B8C2'} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Categories',
    path: '/categories',
    icon: (active) => (
      <svg className="w-6 h-6" fill={active ? '#D4AF37' : 'none'} stroke={active ? '#D4AF37' : '#B8B8C2'} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    label: 'Search',
    path: '/search',
    icon: (active) => (
      <svg className="w-6 h-6" fill={active ? '#D4AF37' : 'none'} stroke={active ? '#D4AF37' : '#B8B8C2'} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    label: 'Wishlist',
    path: '/wishlist',
    icon: (active) => (
      <svg className="w-6 h-6" fill={active ? '#D4AF37' : 'none'} stroke={active ? '#D4AF37' : '#B8B8C2'} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    label: 'Profile',
    path: '/profile',
    icon: (active) => (
      <svg className="w-6 h-6" fill={active ? '#D4AF37' : 'none'} stroke={active ? '#D4AF37' : '#B8B8C2'} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
]

export default function MobileBottomNav() {
  const { pathname } = useLocation()
  const { items: wishlistItems } = useWishlist()

  const wishlistCount = wishlistItems?.length || 0

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0F0F10]/95 backdrop-blur-xl border-t border-[#2D2D30] shadow-lg shadow-black/20 lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = tab.path === '/' ? pathname === '/' : pathname.startsWith(tab.path)

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center justify-center w-full h-full relative active:scale-90 transition-transform ${
                isActive ? 'text-[#D4AF37]' : 'text-[#B8B8C2]'
              }`}
            >
              {tab.path === '/wishlist' && wishlistCount > 0 && (
                <span className="absolute top-0 right-1/2 translate-x-4 bg-[#D4AF37] text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center z-10">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
              {tab.icon(isActive)}
              <span className="text-[11px] mt-1 font-medium">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
