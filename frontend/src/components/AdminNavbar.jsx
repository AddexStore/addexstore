export default function AdminNavbar({ onToggleSidebar }) {
  return (
    <header className="sticky top-0 z-50 bg-[#0F0F10] border-b border-[#2D2D30] h-16 flex items-center px-4 lg:px-6">
      <button
        onClick={onToggleSidebar}
        className="lg:hidden p-2 mr-3 rounded-lg text-[#B8B8C2] hover:text-white hover:bg-[#2A2A2E] transition-colors"
        aria-label="Toggle sidebar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <div className="flex-1 flex items-center justify-center lg:justify-start">
        <h1 className="text-lg font-medium text-white font-['Playfair_Display'] tracking-wide">
          Admin Panel
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg text-[#B8B8C2] hover:text-white hover:bg-[#2A2A2E] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#EF4444] rounded-full text-[10px] font-bold flex items-center justify-center text-white">
            3
          </span>
        </button>

        <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-black font-bold text-sm uppercase">
          A
        </div>
      </div>
    </header>
  )
}
