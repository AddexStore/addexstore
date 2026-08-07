import { Link } from 'react-router-dom'
import { getAssetUrl } from '../services/api'
import SafeIcon from './SafeIcon'
import Icon from './ui/Icon'
import { isSvgMarkup } from '../utils/sanitizeSvg'

export default function CategoryCard({ icon, name, productCount, slug, className = '' }) {
  const isSvg = isSvgMarkup(icon)
  const isImage = !!icon && !isSvg

  return (
    <Link
      to={`/category/${slug || ''}`}
      className={`group relative flex aspect-[4/5] w-full flex-col justify-end overflow-hidden rounded-card bg-charcoal-900 shadow-card transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-card-hover active:scale-[0.99] ${className}`}
    >
      {isImage ? (
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={getAssetUrl(icon)}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.08]"
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gold-700/45 via-charcoal-800/60 to-charcoal-900" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/85 via-charcoal-900/25 to-transparent" />

      <div className="pointer-events-none absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-gold-300 backdrop-blur-md transition-all duration-300 group-hover:border-gold-400 group-hover:bg-gold-500 group-hover:text-white">
        {isImage || isSvg ? (
          <span className="flex h-6 w-6 items-center justify-center">
            {isSvg ? <SafeIcon icon={icon} className="flex h-full w-full items-center justify-center" /> : <Icon name="Sparkles" size={18} />}
          </span>
        ) : (
          <Icon name="Layers" size={18} />
        )}
      </div>

      <div className="relative z-10 p-5">
        <p className="eyebrow mb-2 text-gold-300/90">Collection</p>
        <h3 className="heading-display text-xl leading-tight text-white line-clamp-2 transition-colors">
          {name || 'Category'}
        </h3>
        {productCount !== undefined && (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-white/60">
              {productCount} {productCount === 1 ? 'Product' : 'Products'}
            </p>
            <span className="flex h-8 w-8 -translate-x-1 items-center justify-center rounded-full bg-white/10 text-white opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
              <Icon name="ArrowRight" size={14} />
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
