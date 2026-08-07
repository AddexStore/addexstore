export default function Card({
  as: Tag = 'div',
  interactive = false,
  padded = true,
  className = '',
  children,
  ...props
}) {
  return (
    <Tag
      className={[
        'bg-surface border border-line rounded-card',
        padded && 'p-5 sm:p-6',
        interactive &&
          'transition-all duration-300 ease-out hover:shadow-card-hover hover:-translate-y-0.5 hover:border-gold-300',
        'shadow-sm',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </Tag>
  )
}
