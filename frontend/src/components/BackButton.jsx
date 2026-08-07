import { useNavigate } from 'react-router-dom'
import Icon from './ui/Icon'

export default function BackButton({ to, className = '' }) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => (to ? navigate(to) : navigate(-1))}
      className={`inline-flex items-center gap-1.5 text-xs font-medium text-sub transition-colors hover:text-ink min-h-[44px] ${className}`}
      aria-label="Go back"
    >
      <Icon name="ArrowLeft" size="sm" />
      Back
    </button>
  )
}
