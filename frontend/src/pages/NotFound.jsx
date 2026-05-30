import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center py-12 px-4">
      <div className="text-center max-w-md">
        <h1 className="font-playfair-display text-8xl sm:text-9xl font-bold text-[var(--text-primary)] leading-none">
          404
        </h1>

        <div className="w-16 h-0.5 bg-[#C6A972] mx-auto my-6" />

        <h2 className="font-playfair-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-3">
          Page Not Found
        </h2>

        <p className="text-sm text-[var(--text-secondary)] mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-3 bg-[#C6A972] text-white text-sm font-medium rounded-full hover:bg-[#B8965F] transition active:scale-[0.98]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  )
}
