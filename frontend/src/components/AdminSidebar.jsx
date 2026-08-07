import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ADMIN_SIDEBAR_LINKS, SITE_NAME } from '../constants'
import Icon from './ui/Icon'

export default function AdminSidebar({ isOpen, onClose }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  return (
    <aside
      className={`fixed top-16 left-0 z-40 flex h-[calc(100vh-64px)] w-72 flex-col border-r border-line bg-surface text-ink transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:z-auto ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center gap-3 border-b border-line px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-500 font-display text-sm font-bold text-white">
          S
        </div>
        <span className="heading-display text-lg tracking-wide">{SITE_NAME}</span>
        <span className="ml-auto rounded-full bg-gold-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold-700">
          Admin
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
        {ADMIN_SIDEBAR_LINKS.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === '/admin'}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-field px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gold-500 text-white shadow-gold-soft'
                  : 'text-sub hover:bg-subtle hover:text-ink'
              }`
            }
          >
            <Icon name={link.icon} size={17} />
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-line p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-field px-4 py-2.5 text-sm font-medium text-sub transition-colors hover:bg-danger/10 hover:text-danger"
        >
          <Icon name="LogOut" size={17} />
          Logout
        </button>
      </div>
    </aside>
  )
}
