import { Link } from 'react-router-dom'
import { getAssetUrl } from '../services/api'
import SafeIcon from './SafeIcon'
import Icon from './ui/Icon'
import { isSvgMarkup } from '../utils/sanitizeSvg'

export default function CategoryCard({ icon, name, productCount, slug }) {
  const isSvg = isSvgMarkup(icon)
  const isImage = !!icon && !isSvg

  return (
    <Link
      to={`/category/${slug || ''}`}
      className="group flex w-[150px] flex-col items-center rounded-card border border-line bg-surface p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-gold-300 hover:shadow-card-hover active:scale-95"
    >
      {isImage ? (
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-subtle ring-1 ring-line transition-colors group-hover:ring-gold-300">
          <img
            src={getAssetUrl(icon)}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      ) : isSvg ? (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-subtle text-sub ring-1 ring-line transition-all duration-300 group-hover:bg-gold-500 group-hover:text-white group-hover:ring-gold-500">
          <SafeIcon icon={icon} className="flex h-full w-full items-center justify-center" />
        </div>
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-100 text-gold-600 transition-all duration-300 group-hover:bg-gold-500 group-hover:text-white">
          <Icon name="Layers" size={22} />
        </div>
      )}

      <h3 className="mt-3.5 text-sm font-semibold text-ink transition-colors group-hover:text-gold-600 text-center line-clamp-2">
        {name || 'Category'}
      </h3>

      {productCount !== undefined && (
        <p className="mt-1 text-xs text-faint">
          {productCount} {productCount === 1 ? 'Product' : 'Products'}
        </p>
      )}
    </Link>
  )
}
