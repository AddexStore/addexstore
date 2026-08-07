import BackButton from '../BackButton'

/**
 * Standard page header used across storefront + admin.
 * title + optional eyebrow, action and back button.
 */
export default function PageHeader({
  title,
  eyebrow,
  description,
  backTo,
  showBack = true,
  actions,
  className = '',
}) {
  return (
    <header className={`mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${className}`}>
      <div>
        {showBack && <BackButton to={backTo} className="mb-2" />}
        {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
        <h1 className="heading-display text-3xl sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-xl text-sm text-sub">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </header>
  )
}
