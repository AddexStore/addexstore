import { Link } from 'react-router-dom'
import { getAssetUrl } from '../services/api'
import SafeIcon from './SafeIcon'
import { isSvgMarkup } from '../utils/sanitizeSvg'

export default function CategoryCard({ icon, name, productCount, slug }) {
  const isSvg = isSvgMarkup(icon)
  const isImage = !!icon && !isSvg

  return (
    <Link
      to={`/category/${slug || ''}`}
      className="flex flex-col items-center p-4 sm:p-6 bg-[var(--bg-card)] rounded-2xl border border-transparent shadow-lg shadow-black/10 hover:border-[#C6A972]/30 sm:hover:-translate-y-1 transition-all duration-300 group active:scale-95 w-[130px] sm:w-[160px]"
    >
      {isImage ? (
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#EDE8E1] overflow-hidden flex items-center justify-center">
          <img
            src={getAssetUrl(icon)}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
      ) : isSvg ? (
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#EDE8E1] flex items-center justify-center text-[var(--text-secondary)] group-hover:bg-[#C6A972] group-hover:text-black transition-all duration-300">
          <SafeIcon icon={icon} className="w-full h-full flex items-center justify-center" />
        </div>
      ) : (
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#EDE8E1] flex items-center justify-center transition-all duration-300" />
      )}

      <h3 className="mt-3 sm:mt-4 text-xs sm:text-sm font-semibold text-[var(--text-primary)] group-hover:text-[#C6A972] transition text-center">
        {name || 'Category'}
      </h3>

      {productCount !== undefined && (
        <p className="mt-1 text-[10px] sm:text-xs text-[var(--text-secondary)]">
          {productCount} {productCount === 1 ? 'Product' : 'Products'}
        </p>
      )}
    </Link>
  )
}
