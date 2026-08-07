import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { categoryService } from '../services/categoryService'
import { getAssetUrl } from '../services/api'
import { mapCategory } from '../services/mappers'
import { isSvgMarkup } from '../utils/sanitizeSvg'
import SafeIcon from '../components/SafeIcon'
import PageHeader from '../components/ui/PageHeader'
import SkeletonLoader from '../components/SkeletonLoader'

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
      return <SafeIcon icon={icon} className="h-10 w-10 text-gold-600 sm:h-12 sm:w-12" />
    } else if (icon) {
      return <img src={getAssetUrl(icon)} alt={alt} className="h-14 w-14 rounded-full object-cover sm:h-16 sm:w-16" />
    }
    return null
  }

  return (
    <div className="min-h-screen bg-page pb-16 lg:pb-0">
      <div className="container-lux py-8 sm:py-12 lg:py-16">
        <PageHeader
          eyebrow="Collections"
          title="Categories"
          description="Explore our premium collections."
        />

        {loading ? (
          <SkeletonLoader type="category" count={10} />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 lg:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="group flex flex-col items-center rounded-card border border-line bg-surface p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/40 hover:shadow-card-hover active:scale-[0.98] sm:p-8"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-100 text-gold-600 transition-colors duration-300 group-hover:bg-gold-500 group-hover:text-white sm:h-20 sm:w-20">
                  {renderIcon(cat.icon, cat.name)}
                </div>
                <h3 className="mt-4 text-center text-sm font-semibold text-ink transition-colors group-hover:text-gold-600 sm:text-base">
                  {cat.name}
                </h3>
                <p className="mt-1 text-xs text-sub sm:text-sm">
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
