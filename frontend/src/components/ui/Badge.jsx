export const TONES = {
  neutral: 'bg-subtle text-sub',
  gold: 'bg-gold-100 text-gold-800',
  goldSolid: 'bg-gold-500 text-white',
  success: 'bg-success/12 text-success',
  danger: 'bg-danger/12 text-danger',
  warning: 'bg-warning/15 text-warning',
  info: 'bg-info/12 text-info',
  outline: 'border border-line text-sub',
}

export const getToneClass = (tone) => TONES[tone] || TONES.neutral

const SIZES = {
  sm: 'text-[10px] px-2 py-0.5 gap-1',
  md: 'text-xs px-2.5 py-1 gap-1.5',
  lg: 'text-sm px-3 py-1 gap-1.5',
}

/**
 * Pill badge. `icon` accepts a Lucide icon name (string).
 */
export default function Badge({ tone = 'neutral', size = 'md', icon, className = '', children, ...props }) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full font-medium tracking-wide uppercase',
        TONES[tone],
        SIZES[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </span>
  )
}
