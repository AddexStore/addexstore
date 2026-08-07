import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { categoryService } from '../services/categoryService'
import { getAssetUrl } from '../services/api'
import { mapCategory } from '../services/mappers'
import { isSvgMarkup } from '../utils/sanitizeSvg'
import SafeIcon from '../components/SafeIcon'
import BackButton from '../components/BackButton'

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    categoryService.getAll()
      .then((r) => setCategories((r.data || []).map(mapCategory)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const renderIcon = (icon, alt) => {
    if (isSvgMarkup(icon)) {
      return <SafeIcon icon={icon} className="w-10 h-10 sm:w-12 sm:h-12" />
    } else if (icon) {
      return <img src={getAssetUrl(icon)} alt={alt} className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover" />
    }
    return null
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] pb-16 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center gap-3">
            <BackButton />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-playfair-display font-bold text-[var(--text-primary)]">
              Categories
            </h1>
          </div>
          <p className="text-[var(--text-secondary)] text-sm sm:text-base mt-2">
            Explore our premium collections
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#C6A972] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="flex flex-col items-center p-6 sm:p-8 bg-[var(--bg-card)] rounded-2xl border border-transparent shadow-lg shadow-black/5 hover:border-[#C6A972]/30 hover:-translate-y-1 transition-all duration-300 group active:scale-[0.98]"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[#C6A972] transition-colors duration-300">
                  {renderIcon(cat.icon, cat.name)}
                </div>
                <h3 className="mt-4 text-sm sm:text-base font-semibold text-[var(--text-primary)] group-hover:text-[#C6A972] transition text-center">
                  {cat.name}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)]">
                  {cat.productCount} Products
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
