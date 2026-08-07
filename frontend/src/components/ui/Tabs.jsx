/**
 * Pill-style tab row. `tabs` is an array of `{ key, label, count }`.
 * Active tab gets the gold treatment; inactive gets the surface treatment.
 */
export default function Tabs({ tabs, activeKey, onChange, className = '' }) {
  return (
    <div role="tablist" className={`flex flex-wrap gap-2 ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={`flex min-h-[44px] items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 ${
              isActive
                ? 'bg-gold-500 text-white shadow-gold-soft'
                : 'border border-line bg-surface text-sub hover:border-gold-500/50 hover:text-ink'
            }`}
          >
            {tab.label}
            {typeof tab.count === 'number' && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gold-100 text-gold-700'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
