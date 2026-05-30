import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'sifr_banners'

const fallbackSlides = [
  {
    title: 'New Arrivals',
    subtitle: 'Discover premium styles only at AddexStores',
    cta: 'Shop Now',
    ctaLink: '/new-arrivals',
    bgColor: '#F5F2ED',
    image: '/assets/placeholders/banner.svg',
  },
  {
    title: 'Luxury Collection',
    subtitle: 'Elevate your lifestyle',
    cta: 'Explore',
    ctaLink: '/products',
    bgColor: '#F5F2ED',
    image: '/assets/placeholders/banner.svg',
  },
  {
    title: 'Trending Products',
    subtitle: 'Handpicked for you',
    cta: 'View All',
    ctaLink: '/trending',
    bgColor: '#F5F2ED',
    image: '/assets/placeholders/banner.svg',
  },
]

export default function HeroBanner({ slides: propSlides }) {
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [slides, setSlides] = useState(propSlides || fallbackSlides)
  const touchStartRef = useRef(null)

  useEffect(() => {
    if (propSlides) {
      setSlides(propSlides)
      return
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        const active = parsed.filter((b) => b.active)
        if (active.length > 0) {
          setSlides(active.map((b) => ({
            title: b.title,
            subtitle: b.subtitle,
            cta: b.cta,
            ctaLink: b.ctaLink,
            bgColor: b.bgColor,
            image: b.image,
          })))
          return
        }
      }
    } catch {}
    setSlides(fallbackSlides)
  }, [propSlides])

  const goTo = useCallback((index) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrent(index)
    setTimeout(() => setIsTransitioning(false), 500)
  }, [isTransitioning])

  const goNext = useCallback(() => {
    goTo((current + 1) % slides.length)
  }, [current, slides.length, goTo])

  const goPrev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length)
  }, [current, slides.length, goTo])

  useEffect(() => {
    const timer = setInterval(goNext, 4000)
    return () => clearInterval(timer)
  }, [goNext])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goNext, goPrev])

  const handleTouchStart = (e) => {
    touchStartRef.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = (e) => {
    if (touchStartRef.current === null) return
    const diff = touchStartRef.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext()
      else goPrev()
    }
    touchStartRef.current = null
  }

  if (!slides || slides.length === 0) return null

  const slide = slides[current]

  return (
    <div
      className="relative w-full h-[45vh] sm:h-screen overflow-hidden bg-[var(--bg-page)]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {slides.map((s, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
            index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
          style={{ backgroundColor: s.bgColor || '#F5F2ED' }}
        >
          <div className="absolute inset-0">
            <img
              src={s.image}
              alt={s.title}
              className="w-full h-full object-cover opacity-40"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/20 to-transparent" />
          </div>

          <div className="relative z-10 h-full flex items-center">
            <div className="w-full px-6 sm:px-8 lg:px-12">
              <div
                className={`max-w-lg mx-auto sm:mx-0 transition-all duration-500 ease-out text-center sm:text-left ${
                  index === current
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-8 opacity-0'
                }`}
              >
                <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--text-primary)] leading-tight">
                  {s.title}
                </h1>
                <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-[var(--text-primary)]/80 max-w-md mx-auto sm:mx-0">
                  {s.subtitle}
                </p>
                <div className="mt-5 sm:mt-8 flex justify-center sm:justify-start">
                  <Link
                    to={s.ctaLink || '/'}
                    className="w-full max-w-xs sm:w-auto inline-flex items-center justify-center px-8 py-4 sm:py-3 bg-[#C6A972] text-white text-sm font-medium rounded-full hover:bg-[#B8965F] transition active:scale-[0.98] shadow-lg shadow-[#C6A972]/20"
                  >
                    {s.cta || 'Shop Now'}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={goPrev}
        className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm items-center justify-center hover:bg-black/50 transition"
        aria-label="Previous slide"
      >
        <svg className="w-5 h-5 text-[var(--text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={goNext}
        className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm items-center justify-center hover:bg-black/50 transition"
        aria-label="Next slide"
      >
        <svg className="w-5 h-5 text-[var(--text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="absolute bottom-5 sm:bottom-10 left-1/2 -translate-x-1/2 z-20 flex space-x-2.5">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            className={`rounded-full transition-all duration-300 ${
              index === current
                ? 'bg-[#C6A972] w-3 h-3 sm:w-8 sm:h-2.5'
                : 'bg-[#E7E2DA]/80 hover:bg-[#C6A972] w-3 h-3 sm:w-2.5 sm:h-2.5'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
