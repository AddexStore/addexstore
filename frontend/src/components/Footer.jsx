import { Link } from 'react-router-dom'
import { useState } from 'react'
import BrandIcon from './ui/BrandIcon'
import Icon from './ui/Icon'
import { SITE_NAME } from '../constants'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

  const columns = [
    {
      title: 'Shop',
      links: [
        { label: 'All Products', to: '/products' },
        { label: 'New Arrivals', to: '/new-arrivals' },
        { label: 'Trending', to: '/trending' },
        { label: 'Categories', to: '/categories' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', to: '/about' },
        { label: 'Contact', to: '/contact' },
        { label: 'FAQ', to: '/faq' },
      ],
    },
    {
      title: 'Customer Care',
      links: [
        { label: 'Shipping', to: '/shipping' },
        { label: 'Returns', to: '/returns' },
        { label: 'Size Guide', to: '/size-guide' },
        { label: 'Privacy Policy', to: '/privacy-policy' },
      ],
    },
  ]

  const socials = [
    { name: 'Instagram', href: 'https://instagram.com' },
    { name: 'X', href: 'https://twitter.com' },
    { name: 'Facebook', href: 'https://facebook.com' },
    { name: 'Pinterest', href: 'https://pinterest.com' },
  ]

  return (
    <footer className="border-t border-line bg-surface">
      <div className="border-b border-line">
        <div className="container-lux">
          <div className="flex flex-col gap-6 py-10 sm:py-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-sm">
              <div className="mb-2 flex items-center gap-3">
                <span className="h-px w-8 bg-gold-400" />
                <p className="eyebrow">The {SITE_NAME} Journal</p>
              </div>
              <h3 className="heading-display text-2xl text-ink">Join the {SITE_NAME} World</h3>
              <p className="mt-1.5 text-sm text-sub">
                Subscribe for exclusive access to new drops and private offers.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full max-w-md gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                aria-label="Email address"
                className="h-12 min-w-0 flex-1 rounded-full border border-line bg-inset px-5 text-sm text-ink placeholder-faint transition-colors focus:border-gold-500 focus:ring-2 focus:ring-gold-500/25 focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-gold-500 px-7 text-sm font-medium text-white transition-all duration-200 hover:bg-gold-400 hover:shadow-gold-soft active:scale-[0.98]"
              >
                {subscribed ? (
                  <>
                    <Icon name="Check" size="sm" /> Subscribed
                  </>
                ) : (
                  <>
                    Subscribe <Icon name="Send" size={14} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="container-lux">
        <div className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 sm:py-16 lg:grid-cols-6 lg:gap-8">
          <div className="lg:col-span-2">
            <span className="heading-display text-2xl text-gold-600">{SITE_NAME}</span>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-sub">
              A premium luxury ecommerce destination offering handpicked collections that
              define elegance and sophistication. Experience unparalleled quality and
              timeless style.
            </p>
            <p className="mt-5 text-sm text-faint">
              123 Luxury Avenue, Suite 400
              <br />
              New York, NY 10001
            </p>
            <div className="mt-6 flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-sub transition-all duration-200 hover:border-gold-500 hover:bg-gold-500 hover:text-white"
                  aria-label={s.name}
                >
                  <BrandIcon name={s.name} size={17} />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-ink">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-sub transition-colors hover:text-gold-600">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden border-t border-line">
        <p
          aria-hidden="true"
          className="heading-display select-none whitespace-nowrap text-center text-[16vw] leading-none tracking-[0.02em] text-charcoal-100/70 dark:text-charcoal-800/60 lg:text-[12rem]"
        >
          {SITE_NAME}
        </p>
      </div>

      <div className="border-t border-line">
        <div className="container-lux flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="text-xs text-faint">
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-faint">We accept</span>
            <div className="flex items-center gap-1.5">
              {['VISA', 'MC', 'AMEX', 'PP'].map((mark) => (
                <span
                  key={mark}
                  className="flex h-6 items-center rounded-[4px] border border-line px-1.5 text-[9px] font-semibold tracking-wide text-faint"
                >
                  {mark}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
