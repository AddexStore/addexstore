export default function StarRating({ rating = 0, totalReviews }) {
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
      <div className="flex items-center">
        {stars.map((type, i) => (
          <svg key={i} className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none">
            <defs>
              <clipPath id={`half-clip-${i}`}>
                <rect x="0" y="0" width="10" height="20" />
              </clipPath>
            </defs>
            <path
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              fill={type === 'empty' ? '#E7E2DA' : '#C6A972'}
              stroke={type === 'empty' ? '#E7E2DA' : '#C6A972'}
              strokeWidth="0.5"
            />
            {type === 'half' && (
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                fill="#C6A972"
                clipPath={`url(#half-clip-${i})`}
              />
            )}
          </svg>
        ))}
      </div>
      {totalReviews !== undefined && (
        <span className="text-[11px] text-[var(--text-secondary)]">({totalReviews})</span>
      )}
    </div>
  )
}
