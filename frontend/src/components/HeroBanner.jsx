import { useState, useEffect, useCallback, useRef } from 'react'
import { getAssetUrl } from '../services/api'
import Button from './ui/Button'
import Icon from './ui/Icon'

const STORAGE_KEY = 'sifr_banners'
const AUTOPLAY_MS = 5000

const fallbackSlides = [
  {
    title: 'New Arrivals',
    subtitle: 'Discover premium styles only at AddexStores',
    cta: 'Shop Now',
    ctaLink: '/new-arrivals',
    bgColor: '#181410',
    image: '/assets/placeholders/banner.svg',
  },
  {
    title: 'Luxury Collection',
    subtitle: 'Elevate your lifestyle',
    cta: 'Explore',
    ctaLink: '/products',
    bgColor: '#221D16',
    image: '/assets/placeholders/banner.svg',
  },
  {
    title: 'Trending Products',
    subtitle: 'Handpicked for you',
    cta: 'View All',
    ctaLink: '/trending',
    bgColor: '#2E2821',
    image: '/assets/placeholders/banner.svg',
  },
]

export default function HeroBanner({ slides: propSlides }) {
  const [current, setCurrent] = useState(0)
  const [slides, setSlides] = useState(propSlides || fallbackSlides)
  const [paused, setPaused] = useState(false)
  const touchStartRef = useRef(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

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
          setSlides(
            active.map((b) => ({
              title: b.title,
              subtitle: b.subtitle,
              cta: b.cta,
              ctaLink: b.ctaLink,
              bgColor: b.bgColor,
              image: b.image,
            }))
          )
          return
        }
      }
    } catch {}
    setSlides(fallbackSlides)
  }, [propSlides])

  const goTo = useCallback(
    (index) => {
      if (isTransitioning) return
      setIsTransitioning(true)
      setCurrent(index)
      setTimeout(() => setIsTransitioning(false), 700)
    },
    [isTransitioning]
  )

  const goNext = useCallback(() => goTo((current + 1) % slides.length), [current, slides.length, goTo])
  const goPrev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, slides.length, goTo])

  useEffect(() => {
    if (paused || slides.length <= 1) return
    const timer = setInterval(goNext, AUTOPLAY_MS)
    return () => clearInterval(timer)
  }, [goNext, paused, slides.length])

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
  const hasImage = slide.image && !slide.image.includes('placeholder')
  const padCount = (n) => String(n + 1).padStart(2, '0')

  return (
    <section
      className="relative h-[86svh] min-h-[560px] w-full overflow-hidden bg-charcoal-900"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured collections"
    >
      {slides.map((s, index) => {
        const active = index === current
        const activeSlideImage = s.image && !s.image.includes('placeholder')
        return (
          <div
            key={index}
            aria-hidden={!active}
            className={`absolute inset-0 transition-opacity duration-[1100ms] ease-out ${
              active ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div className="absolute inset-0" style={{ backgroundColor: s.bgColor || '#181410' }}>
              {activeSlideImage ? (
                <img
                  src={getAssetUrl(s.image)}
                  alt={s.title}
                  className={`h-full w-full object-cover transition-transform duration-[9000ms] ease-out ${
                    active ? 'scale-[1.08]' : 'scale-100'
                  }`}
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              ) : (
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-gold-700/35 via-charcoal-800/45 to-charcoal-900" />
                  <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_center,white_1px,transparent_1px)] [background-size:26px_26px]" />
                </div>
              )}
            </div>

            <div className="absolute inset-0 bg-gradient-to-r from-charcoal-900/90 via-charcoal-900/50 to-charcoal-900/15" />
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-charcoal-900/80 to-transparent" />

            <div className="relative z-10 flex h-full items-end pb-16 sm:pb-20">
              <div className="container-lux">
                <div
                  className={`max-w-2xl transition-all duration-[900ms] ease-out ${
                    active ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}
                >
                  <div className={`mb-5 flex items-center gap-3 transition-all delay-100 ${active ? 'opacity-100' : 'opacity-0'}`}>
                    <span className="h-px w-10 bg-gold-400" />
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-300">
                      AddexStores · Curated Luxury
                    </p>
                  </div>
                  <h1 className="heading-display text-[2.75rem] leading-[1.05] text-white sm:text-6xl lg:text-7xl">
                    {s.title}
                  </h1>
                  <p className="mt-5 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
                    {s.subtitle}
                  </p>
                  <div className="mt-9 flex flex-wrap items-center gap-3">
                    <Button to={s.ctaLink || '/'} size="lg" variant="primary">
                      {s.cta || 'Shop Now'}
                      <Icon name="ArrowRight" size={16} />
                    </Button>
                    <Button
                      to="/products"
                      size="lg"
                      variant="ghost"
                      className="border border-white/25 text-white hover:bg-white/10 hover:text-white"
                    >
                      Browse Collection
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {slides.length > 1 && (
        <>
          <div className="absolute right-4 top-4 z-20 flex items-center gap-2 sm:right-6 sm:top-6">
            <button
              onClick={goPrev}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/80 backdrop-blur-md transition-all duration-200 hover:border-gold-400 hover:text-white hover:bg-white/10 active:scale-90"
              aria-label="Previous slide"
            >
              <Icon name="ChevronLeft" size={18} />
            </button>
            <button
              onClick={goNext}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/80 backdrop-blur-md transition-all duration-200 hover:border-gold-400 hover:text-white hover:bg-white/10 active:scale-90"
              aria-label="Next slide"
            >
              <Icon name="ChevronRight" size={18} />
            </button>
          </div>

          <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4 sm:bottom-12">
            <span className="hidden font-mono text-[10px] tracking-[0.2em] text-white/50 sm:block">
              {padCount(current)} / {padCount(slides.length - 1)}
            </span>
            <div className="flex items-center gap-2.5">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goTo(index)}
                  className={`relative h-[3px] overflow-hidden rounded-full transition-all duration-300 ${
                    index === current ? 'w-12 bg-white/30' : 'w-6 bg-white/25 hover:bg-white/45'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                >
                  {index === current && (
                    <span
                      className="absolute inset-0 rounded-full bg-gold-400"
                      style={{ animation: `heroProgress ${AUTOPLAY_MS}ms linear forwards` }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <style>{`
            @keyframes heroProgress {
              from { width: 0; }
              to { width: 100%; }
            }
          `}</style>
        </>
      )}
    </section>
  )
}
