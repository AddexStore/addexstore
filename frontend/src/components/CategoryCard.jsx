import { Link } from 'react-router-dom'

export default function CategoryCard({ icon, name, productCount, slug }) {
  return (
    <Link
      to={`/category/${slug || ''}`}
      className="flex flex-col items-center p-4 sm:p-6 bg-[#232326] rounded-2xl border border-transparent shadow-lg shadow-black/20 hover:border-[#D4AF37]/30 sm:hover:-translate-y-1 transition-all duration-300 group active:scale-95 w-[130px] sm:w-[160px]"
    >
      {icon ? (
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#2A2A2E] flex items-center justify-center text-[#B8B8C2] group-hover:bg-[#D4AF37] group-hover:text-black transition-all duration-300">
          {icon}
        </div>
      ) : (
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#2A2A2E] flex items-center justify-center group-hover:bg-[#D4AF37]/20 transition-all duration-300">
          <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[#B8B8C2] group-hover:text-[#D4AF37] transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </div>
      )}

      <h3 className="mt-3 sm:mt-4 text-xs sm:text-sm font-semibold text-white group-hover:text-[#D4AF37] transition text-center">
        {name || 'Category'}
      </h3>

      {productCount !== undefined && (
        <p className="mt-1 text-[10px] sm:text-xs text-[#B8B8C2]">
          {productCount} {productCount === 1 ? 'Product' : 'Products'}
        </p>
      )}
    </Link>
  )
}
