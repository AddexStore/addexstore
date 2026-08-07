import Skeleton from './ui/Skeleton'

export default function SkeletonLoader({ type = 'text', count = 1 }) {
  const items = Array.from({ length: count }, (_, i) => i)

  const renderSkeleton = () => {
    switch (type) {
      case 'product':
        return (
          <div className="overflow-hidden rounded-card border border-line bg-surface shadow-sm">
            <Skeleton rounded="none" className="aspect-square w-full" />
            <div className="space-y-3 p-4">
              <Skeleton className="h-3 w-16" rounded="full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex gap-1">
                {[...Array(5)].map((_, j) => (
                  <Skeleton key={j} className="h-3 w-3" rounded="full" />
                ))}
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-10 w-24" rounded="full" />
              </div>
            </div>
          </div>
        )

      case 'banner':
        return (
          <Skeleton rounded="none" className="h-[45vh] w-full sm:h-[60vh]" />
        )

      case 'category':
        return (
          <div className="flex flex-col items-center rounded-card border border-line bg-surface p-6 shadow-sm">
            <Skeleton className="h-16 w-16" rounded="full" />
            <Skeleton className="mt-4 h-4 w-24" />
            <Skeleton className="mt-1.5 h-3 w-16" />
          </div>
        )

      case 'cart':
        return (
          <div className="flex items-center gap-4 rounded-card border border-line bg-surface p-4 shadow-sm">
            <Skeleton className="h-20 w-20 shrink-0" rounded="soft" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-5 w-1/4" />
            </div>
            <Skeleton className="h-9 w-24" rounded="full" />
          </div>
        )

      case 'text':
      default:
        return (
          <div className="space-y-2.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        )
    }
  }

  const gridClass =
    type === 'product'
      ? 'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-6'
      : type === 'category'
        ? 'flex gap-3 sm:gap-4'
        : 'space-y-4'

  return (
    <div className={gridClass} aria-busy="true" aria-label="Loading">
      {items.map((i) => (
        <div key={i} className={type === 'category' ? 'w-[150px] shrink-0' : ''}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  )
}
