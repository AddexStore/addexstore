import { Link } from 'react-router-dom'

export default function EmptyState({ icon, title, message, actionLabel, actionLink }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon ? (
        <div className="w-20 h-20 rounded-full bg-[#f5e6c8] flex items-center justify-center text-[#D4AF37] mb-6">
          {icon}
        </div>
      ) : (
        <div className="w-20 h-20 rounded-full bg-[#232326] flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
      )}

      <h3 className="text-lg font-semibold text-white mb-1">
        {title || 'Nothing here yet'}
      </h3>

      <p className="text-sm text-[#B8B8C2] max-w-xs mb-6">
        {message || 'Your section is currently empty.'}
      </p>

      {actionLabel && actionLink && (
        <Link
          to={actionLink}
          className="px-6 py-2.5 bg-[#18181B] text-white text-sm font-medium rounded-full hover:bg-[#2A2A2E] transition active:scale-[0.98]"
        >
          {actionLabel}
        </Link>
      )}

      {actionLabel && !actionLink && (
        <span className="px-6 py-2.5 bg-[#18181B] text-white text-sm font-medium rounded-full">
          {actionLabel}
        </span>
      )}
    </div>
  )
}
