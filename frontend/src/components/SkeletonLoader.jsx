export default function SkeletonLoader({ type = 'text', count = 1 }) {
  const items = Array.from({ length: count }, (_, i) => i)

  const renderSkeleton = () => {
    switch (type) {
      case 'product':
        return (
          <div className="bg-[var(--bg-card)] rounded-xl shadow-lg shadow-black/10 overflow-hidden">
            <div className="aspect-square bg-[var(--bg-card)] animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="h-3 w-16 bg-[var(--bg-card)] animate-pulse rounded" />
              <div className="h-4 w-3/4 bg-[var(--bg-card)] animate-pulse rounded" />
              <div className="h-3 w-1/2 bg-[var(--bg-card)] animate-pulse rounded" />
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="w-3 h-3 bg-[var(--bg-card)] animate-pulse rounded" />
                ))}
              </div>
              <div className="h-5 w-20 bg-[var(--bg-card)] animate-pulse rounded" />
              <div className="h-10 w-full bg-[var(--bg-card)] animate-pulse rounded-full" />
            </div>
          </div>
        )

      case 'banner':
        return (
          <div className="w-full h-[60vh] sm:h-screen bg-[var(--bg-card)] animate-pulse rounded-xl" />
        )

      case 'category':
        return (
          <div className="flex flex-col items-center p-6 bg-[var(--bg-card)] rounded-2xl shadow-lg shadow-black/10">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-card)] animate-pulse" />
            <div className="mt-4 h-4 w-24 bg-[var(--bg-card)] animate-pulse rounded" />
            <div className="mt-1 h-3 w-16 bg-[var(--bg-card)] animate-pulse rounded" />
          </div>
        )

      case 'cart':
        return (
          <div className="flex items-center gap-4 p-4 bg-[var(--bg-card)] rounded-xl shadow-lg shadow-black/10">
            <div className="w-20 h-20 rounded-lg bg-[var(--bg-card)] animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-[var(--bg-card)] animate-pulse rounded" />
              <div className="h-3 w-1/3 bg-[var(--bg-card)] animate-pulse rounded" />
              <div className="h-5 w-1/4 bg-[var(--bg-card)] animate-pulse rounded" />
            </div>
            <div className="w-24 h-8 bg-[var(--bg-card)] animate-pulse rounded-full" />
          </div>
        )

      case 'text':
      default:
        return (
          <div className="space-y-2">
            <div className="h-4 w-full bg-[var(--bg-card)] animate-pulse rounded" />
            <div className="h-4 w-5/6 bg-[var(--bg-card)] animate-pulse rounded" />
            <div className="h-4 w-2/3 bg-[var(--bg-card)] animate-pulse rounded" />
          </div>
        )
    }
  }

  return (
    <div className={`grid gap-4 ${type === 'product' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : ''} ${type === 'category' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : ''}`}>
      {items.map((i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </div>
  )
}
