import { Link } from 'react-router-dom'
import Icon from './Icon'

/**
 * Section heading with consistent luxury typography.
 * `linkTo`/`linkText` render a hairline "View all" action.
 */
export default function SectionHeading({
  title,
  eyebrow,
  description,
  linkTo,
  linkText = 'View All',
  align = 'left',
  className = '',
}) {
  const centered = align === 'center'
  return (
    <div
      className={`mb-8 sm:mb-10 flex flex-col gap-4 ${
        centered ? 'items-center text-center' : 'sm:flex-row sm:items-end sm:justify-between'
      } ${className}`}
    >
      <div className={centered ? 'max-w-2xl mx-auto' : 'max-w-xl'}>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="heading-display text-2xl sm:text-3xl lg:text-[2.5rem] leading-tight">{title}</h2>
        {description && <p className="mt-2.5 text-sm text-sub leading-relaxed">{description}</p>}
      </div>
      {linkTo && (
        <Link
          to={linkTo}
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-gold-600 transition-colors hover:text-gold-700 hover:gap-2.5"
        >
          {linkText}
          <Icon name="ArrowRight" size="sm" />
        </Link>
      )}
    </div>
  )
}
