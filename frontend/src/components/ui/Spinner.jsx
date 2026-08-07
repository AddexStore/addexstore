import Icon from './Icon'

export default function Spinner({ size = 'md', className = '', label }) {
  const px = { sm: 14, md: 20, lg: 28 }
  return (
    <span
      role="status"
      aria-label={label || 'Loading'}
      className={['inline-flex items-center gap-2 text-gold-600', className].filter(Boolean).join(' ')}
    >
      <Icon name="Loader2" size={px[size] || 20} className="animate-spin" />
      {label && <span className="text-sm text-sub">{label}</span>}
    </span>
  )
}
