export default function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-[#2D2D30] border-t-[#D4AF37] rounded-full animate-spin" />
        <p className="text-sm text-[#B8B8C2] font-medium">Loading...</p>
      </div>
    </div>
  )
}
