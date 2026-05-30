import BackButton from '../components/BackButton'

export default function About() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <BackButton />
          <h1 className="text-2xl font-bold text-[var(--text-primary)] font-['Playfair_Display']">About SIFR</h1>
        </div>

        <div className="space-y-6">
          <div className="bg-[var(--bg-card)] rounded-lg p-6 border border-[var(--border-color)]/50">
            <h2 className="text-[var(--text-primary)] text-sm font-semibold mb-3 font-['Playfair_Display']">Our Story</h2>
            <p className="text-[var(--text-secondary)] text-xs leading-relaxed">
              Founded with a passion for timeless elegance, SIFR is more than just a fashion destination — it's a celebration
              of craftsmanship, individuality, and understated luxury. What began as a vision to bridge contemporary design
              with heritage artistry has grown into a curated haven for those who appreciate the finer things in life.
            </p>
          </div>

          <div className="bg-[var(--bg-card)] rounded-lg p-6 border border-[var(--border-color)]/50">
            <h2 className="text-[var(--text-primary)] text-sm font-semibold mb-3 font-['Playfair_Display']">Our Values</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-[var(--text-primary)] text-xs font-medium mb-1">Craftsmanship</h3>
                <p className="text-[var(--text-secondary)] text-xs leading-relaxed">
                  Every piece in our collection is thoughtfully selected for its quality, detailing, and enduring appeal.
                  We partner with artisans and brands who share our commitment to excellence.
                </p>
              </div>
              <div>
                <h3 className="text-[var(--text-primary)] text-xs font-medium mb-1">Sustainability</h3>
                <p className="text-[var(--text-secondary)] text-xs leading-relaxed">
                  We believe fashion should respect both people and the planet. From responsible sourcing to
                  eco-conscious packaging, we strive to minimise our footprint at every step.
                </p>
              </div>
              <div>
                <h3 className="text-[var(--text-primary)] text-xs font-medium mb-1">Inclusivity</h3>
                <p className="text-[var(--text-secondary)] text-xs leading-relaxed">
                  Style has no boundaries. We celebrate diversity in all its forms and curate collections that
                  empower every individual to express their unique identity.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] rounded-lg p-6 border border-[var(--border-color)]/50">
            <h2 className="text-[var(--text-primary)] text-sm font-semibold mb-3 font-['Playfair_Display']">Our Promise</h2>
            <p className="text-[var(--text-secondary)] text-xs leading-relaxed">
              From the moment you step into our world, we are dedicated to providing an exceptional experience.
              Every interaction — whether browsing our collections, speaking with our team, or receiving your
              order — is designed to reflect the warmth, care, and sophistication that define SIFR.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--bg-card)] rounded-lg p-5 border border-[var(--border-color)]/50 text-center">
              <p className="text-2xl font-bold text-[#C6A972] font-['Playfair_Display']">5K+</p>
              <p className="text-[var(--text-muted)] text-xs mt-1">Happy Customers</p>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-5 border border-[var(--border-color)]/50 text-center">
              <p className="text-2xl font-bold text-[#C6A972] font-['Playfair_Display']">500+</p>
              <p className="text-[var(--text-muted)] text-xs mt-1">Curated Styles</p>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-5 border border-[var(--border-color)]/50 text-center">
              <p className="text-2xl font-bold text-[#C6A972] font-['Playfair_Display']">50+</p>
              <p className="text-[var(--text-muted)] text-xs mt-1">Partner Brands</p>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-5 border border-[var(--border-color)]/50 text-center">
              <p className="text-2xl font-bold text-[#C6A972] font-['Playfair_Display']">10+</p>
              <p className="text-[var(--text-muted)] text-xs mt-1">Years of Service</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
