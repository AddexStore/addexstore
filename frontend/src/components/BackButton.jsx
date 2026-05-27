import { useNavigate } from 'react-router-dom'

export default function BackButton({ to, className = '' }) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => (to ? navigate(to) : navigate(-1))}
      className={`inline-flex items-center gap-1.5 text-xs text-[#B8B8C2] hover:text-white transition-colors min-h-[44px] ${className}`}
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
      </svg>
      Back
    </button>
  )
}
