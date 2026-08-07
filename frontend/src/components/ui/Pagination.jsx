import Icon from './Icon'

function getVisiblePages(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set([1, total, current, current - 1, current + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const out = []
  let prev = 0
  for (const p of sorted) {
    if (p - prev > 1) out.push('…')
    out.push(p)
    prev = p
  }
  return out
}

/**
 * Shared pagination. `page` is 1-based, `onPageChange(page)` receives 1-based page.
 */
export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null
  const pages = getVisiblePages(page, totalPages)

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="inline-flex h-11 items-center justify-center gap-1.5 rounded-field border border-line px-3 text-sm text-sub transition-colors hover:border-gold-500 hover:text-gold-600 disabled:opacity-40 disabled:pointer-events-none"
      >
        <Icon name="ChevronLeft" size="sm" className="lg:hidden" />
        <span className="hidden lg:inline">Previous</span>
      </button>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="px-1 text-sm text-faint">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`inline-flex h-11 min-w-11 items-center justify-center rounded-field px-3 text-sm font-medium transition-all ${
              p === page
                ? 'bg-gold-500 text-white shadow-gold-soft'
                : 'border border-line text-sub hover:border-gold-500 hover:text-gold-600'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className="inline-flex h-11 items-center justify-center gap-1.5 rounded-field border border-line px-3 text-sm text-sub transition-colors hover:border-gold-500 hover:text-gold-600 disabled:opacity-40 disabled:pointer-events-none"
      >
        <span className="hidden lg:inline">Next</span>
        <Icon name="ChevronRight" size="sm" className="lg:hidden" />
      </button>
    </nav>
  )
}
