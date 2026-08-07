import Icon from './ui/Icon'

export default function StarRating({ rating = 0, totalReviews, size = 'sm', showValue = false }) {
  const px = { xs: 12, sm: 14, md: 16, lg: 18 }
  const stars = []

  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push('full')
    } else if (rating >= i - 0.5) {
      stars.push('half')
    } else {
      stars.push('empty')
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="flex items-center gap-px" aria-label={`Rated ${rating || 0} out of 5`}>
        {stars.map((type, i) => (
          <Icon
            key={i}
            name="Star"
            size={px[size] || 14}
            strokeWidth={type === 'full' ? 0 : 1.5}
            className={type === 'empty' ? 'text-ivory-300' : 'text-gold-500'}
            fill={type === 'empty' ? 'none' : 'currentColor'}
          />
        ))}
      </span>
      {showValue && <span className="text-xs font-semibold text-ink">{rating || 0}</span>}
      {totalReviews !== undefined && (
        <span className="text-xs text-faint">({totalReviews})</span>
      )}
    </div>
  )
}
