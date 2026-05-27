import { Link } from 'react-router-dom'
import { categories } from '../data/categories'
import BackButton from '../components/BackButton'

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-[#0F0F10] pb-16 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center gap-3">
            <BackButton />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-playfair-display font-bold text-white">
              Categories
            </h1>
          </div>
          <p className="text-[#B8B8C2] text-sm sm:text-base mt-2">
            Explore our premium collections
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="flex flex-col items-center p-6 sm:p-8 bg-[#232326] rounded-2xl border border-transparent shadow-lg shadow-black/20 hover:border-[#D4AF37]/30 hover:-translate-y-1 transition-all duration-300 group active:scale-[0.98]"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#2A2A2E] flex items-center justify-center text-[#B8B8C2] group-hover:bg-[#D4AF37] group-hover:text-black transition-all duration-300">
                <span dangerouslySetInnerHTML={{ __html: cat.icon }} className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <h3 className="mt-4 text-sm sm:text-base font-semibold text-white group-hover:text-[#D4AF37] transition text-center">
                {cat.name}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-[#B8B8C2]">
                {cat.productCount} Products
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
