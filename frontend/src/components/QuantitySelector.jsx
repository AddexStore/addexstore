import Icon from './ui/Icon'

export default function QuantitySelector({ value = 1, onChange, min = 1, max = 99, size = 'md' }) {
  const handleDecrement = () => {
    if (value > min) onChange?.(value - 1)
  }

  const handleIncrement = () => {
    if (value < max) onChange?.(value + 1)
  }

  const isMin = value <= min
  const isMax = value >= max
  const dim = size === 'lg' ? 'h-11 w-11 text-sm' : 'h-9 w-9 text-xs'

  return (
    <div className="inline-flex items-center rounded-full border border-line bg-surface">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={isMin}
        className={`flex items-center justify-center rounded-l-full transition ${dim} ${
          isMin ? 'text-faint cursor-not-allowed' : 'text-sub hover:bg-subtle hover:text-ink active:bg-line'
        }`}
        aria-label="Decrease quantity"
      >
        <Icon name="Minus" size={size === 'lg' ? 16 : 14} />
      </button>

      <span className={`flex items-center justify-center font-semibold text-ink select-none ${dim}`}>
        {value}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={isMax}
        className={`flex items-center justify-center rounded-r-full transition ${dim} ${
          isMax ? 'text-faint cursor-not-allowed' : 'text-sub hover:bg-subtle hover:text-ink active:bg-line'
        }`}
        aria-label="Increase quantity"
      >
        <Icon name="Plus" size={size === 'lg' ? 16 : 14} />
      </button>
    </div>
  )
}
