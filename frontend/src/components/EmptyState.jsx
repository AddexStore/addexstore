import Button from './ui/Button'
import Icon from './ui/Icon'

export default function EmptyState({
  icon = 'PackageOpen',
  title = 'Nothing here yet',
  message = 'Your section is currently empty.',
  actionLabel,
  actionLink,
  onAction,
  size = 'lg',
  compact = false,
}) {
  return (
    <div className={`flex flex-col items-center justify-center px-4 text-center ${compact ? 'py-8' : 'py-16'}`}>
      <div
        className={`mb-6 flex items-center justify-center rounded-full bg-gold-100 text-gold-600 ${
          size === 'lg' ? 'h-20 w-20' : 'h-16 w-16'
        } ${compact ? 'mb-4 h-14 w-14' : ''}`}
      >
        <Icon name={icon} size={size === 'lg' ? 32 : 26} strokeWidth={1.5} />
      </div>
      <h3 className="heading-display text-xl text-ink">{title}</h3>
      <p className="mt-2 max-w-xs text-sm text-sub">{message}</p>
      {actionLabel && actionLink && (
        <Button variant="secondary" className="mt-6" to={actionLink} icon="ArrowRight">
          {actionLabel}
        </Button>
      )}
      {actionLabel && onAction && (
        <Button variant="secondary" className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
