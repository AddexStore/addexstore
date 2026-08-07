import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from './ui/Icon'

export default function SearchBar({ placeholder = 'Search AddexStores...', onSearch, inputRef, className = '' }) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return

    if (onSearch) {
      onSearch(trimmed)
    } else {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`)
    }
  }

  const handleClear = () => {
    setQuery('')
    if (inputRef?.current) inputRef.current.focus()
  }

  return (
    <form onSubmit={handleSubmit} className={`relative w-full ${className}`} role="search">
      <Icon
        name="Search"
        size="sm"
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint"
      />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-11 w-full rounded-full border border-line bg-surface pl-11 pr-10 text-sm text-ink placeholder-faint transition-all duration-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/25 focus:outline-none"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full text-faint transition-colors hover:bg-subtle hover:text-ink"
          aria-label="Clear search"
        >
          <Icon name="X" size="xs" />
        </button>
      )}
    </form>
  )
}
