export default function Skeleton({ className = '', rounded = 'soft' }) {
  const radius = { none: '', sm: 'rounded-soft', soft: 'rounded-soft', md: 'rounded-field', card: 'rounded-card', full: 'rounded-full' }
  return <div aria-hidden="true" className={`skeleton ${radius[rounded]} ${className}`} />
}
