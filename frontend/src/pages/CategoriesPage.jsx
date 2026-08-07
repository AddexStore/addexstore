import { useState, useEffect } from 'react'
import { categoryService } from '../services/categoryService'
import { mapCategory } from '../services/mappers'
import CategoryCard from '../components/CategoryCard'
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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6">
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                icon={cat.icon}
                name={cat.name}
                productCount={cat.productCount}
                slug={cat.slug}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
