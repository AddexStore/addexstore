import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon'

const VARIANTS = {
  primary:
    'bg-gold-500 text-white hover:bg-gold-400 active:bg-gold-600 shadow-gold-soft hover:shadow-gold border border-transparent',
  secondary:
    'bg-charcoal-800 text-ivory-50 hover:bg-charcoal-700 active:bg-charcoal-900 border border-transparent',
  outline:
    'bg-transparent text-ink border border-line hover:border-gold-500 hover:text-gold-600 hover:bg-gold-50',
  goldOutline:
    'bg-transparent text-gold-600 border border-gold-500/50 hover:bg-gold-500 hover:text-white',
  ghost:
    'bg-transparent text-sub hover:bg-subtle hover:text-ink border border-transparent',
  danger:
    'bg-transparent text-danger border border-danger/30 hover:bg-danger/10 active:bg-danger/15',
  dangerSolid:
    'bg-danger text-white hover:opacity-90 active:opacity-100 border border-transparent shadow-sm',
  success:
    'bg-success text-white hover:opacity-90 active:opacity-100 border border-transparent shadow-sm',
}

const SIZES = {
  sm: 'h-9 px-4 text-xs',
  md: 'h-11 px-6 text-sm',
  lg: 'h-12 px-8 text-sm',
  iconSm: 'h-9 w-9 p-0',
  icon: 'h-11 w-11 p-0',
  iconLg: 'h-12 w-12 p-0',
}

const ROUNDED = {
  full: 'rounded-full',
  field: 'rounded-field',
  soft: 'rounded-soft',
}

function renderIcon(iconProp, iconSize, position) {
  if (!iconProp) return null
  if (typeof iconProp === 'string') {
    return (
      <Icon
        name={iconProp}
        size={iconSize}
        className={position === 'left' ? '-ml-0.5' : 'order-2 -mr-0.5'}
      />
    )
  }
  return <span className={position === 'left' ? '-ml-0.5' : 'order-2 -mr-0.5'}>{iconProp}</span>
}

const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    rounded = 'full',
    loading = false,
    disabled = false,
    icon,
    iconPosition = 'left',
    leftIcon,
    rightIcon,
    fullWidth = false,
    className = '',
    children,
    type = 'button',
    to,
    href,
    ...props
  },
  ref
) {
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16

  const classes = [
    'inline-flex items-center justify-center gap-2 font-medium tracking-wide select-none',
    'transition-all duration-200 ease-out active:scale-[0.98]',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500',
    'disabled:opacity-45 disabled:pointer-events-none',
    VARIANTS[variant],
    SIZES[size],
    ROUNDED[rounded],
    fullWidth && 'w-full',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const content = loading ? (
    <Icon name="Loader2" size={iconSize} className="animate-spin" />
  ) : (
    <>
      {renderIcon(icon || leftIcon, iconSize, iconPosition)}
      {children}
      {renderIcon(rightIcon, iconSize, 'right')}
    </>
  )

  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} aria-disabled={disabled || loading} {...props}>
        {content}
      </Link>
    )
  }

  if (href) {
    return (
      <a ref={ref} href={href} className={classes} {...props}>
        {content}
      </a>
    )
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={classes}
      {...props}
    >
      {content}
    </button>
  )
})

export default Button
