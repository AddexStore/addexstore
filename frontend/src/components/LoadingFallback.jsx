export default function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-[var(--border-color)] border-t-[#C6A972] rounded-full animate-spin" />
        <p className="text-sm text-[var(--text-secondary)] font-medium">Loading...</p>
      </div>
    </div>
  )
}
