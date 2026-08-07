import Button from '../components/ui/Button'
import Icon from '../components/ui/Icon'

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-page px-4 py-16">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-500/8 blur-3xl" />
      <div className="relative mx-auto w-full max-w-md text-center">
        <p className="eyebrow mb-4 text-gold-600">Error 404</p>
        <h1 className="heading-display text-[7rem] leading-none text-ink sm:text-[9rem]">
          404
        </h1>
        <div className="mx-auto mb-6 h-px w-16 bg-gold-500" />
        <h2 className="heading-display text-2xl text-ink">Page Not Found</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-sub">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button to="/" icon="Home">
            Back to Home
          </Button>
          <Button to="/products" variant="outline" icon="ShoppingBag">
            Explore Collection
          </Button>
        </div>
      </div>
    </div>
  )
}
