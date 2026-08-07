import ThemeToggle from './ThemeToggle'
import Icon from './ui/Icon'

export default function AdminNavbar({ onToggleSidebar, title = 'Admin Panel' }) {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center border-b border-line bg-surface px-4 lg:px-6">
      <button
        onClick={onToggleSidebar}
        className="mr-3 flex h-10 w-10 items-center justify-center rounded-field text-sub transition-colors hover:bg-subtle hover:text-ink lg:hidden"
        aria-label="Toggle sidebar"
      >
        <Icon name="Menu" />
      </button>

      <div className="flex flex-1 items-center justify-center lg:justify-start">
        <h1 className="heading-display text-xl tracking-wide">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <button
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line text-sub transition-colors hover:text-ink"
          aria-label="Notifications"
        >
          <Icon name="Bell" size={18} />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white">
            3
          </span>
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-500 text-sm font-bold uppercase text-white">
          A
        </div>
      </div>
    </header>
  )
}
