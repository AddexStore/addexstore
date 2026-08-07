import { useTheme } from '../context/ThemeContext'
import Icon from './ui/Icon'

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      className={`relative flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-sub transition-colors hover:text-gold-600 hover:border-gold-400 ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Icon name={isDark ? 'Sun' : 'Moon'} size={18} className="transition-transform duration-300" />
    </button>
  )
}
