import { useState } from 'react'

export default function ImageWithFallback({ src, alt, fallback, className }) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const fallbackSrc = fallback || '/assets/placeholders/product.svg'

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  return (
    <div className={`relative overflow-hidden ${className || ''}`}>
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-[#232326] animate-pulse" />
      )}

      {/* Hidden image for loading/error tracking */}
      <img
        src={hasError ? fallbackSrc : src}
        alt={alt || ''}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  )
}
