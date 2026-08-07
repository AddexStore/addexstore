import { useState } from 'react'

export default function ImageWithFallback({ src, alt, fallback, className, eager = false }) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const fallbackSrc = fallback || '/assets/placeholders/product.svg'

  const handleLoad = () => setIsLoading(false)
  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  return (
    <div className={`relative overflow-hidden bg-subtle ${className || ''}`}>
      {isLoading && <div className="skeleton absolute inset-0" aria-hidden="true" />}
      <img
        src={hasError ? fallbackSrc : src}
        alt={alt || ''}
        loading={eager ? 'eager' : 'lazy'}
        onLoad={handleLoad}
        onError={handleError}
        className={`h-full w-full object-cover transition-opacity duration-500 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  )
}
