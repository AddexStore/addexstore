export default function QuantitySelector({ value = 1, onChange, min = 1, max = 99 }) {
  const handleDecrement = () => {
    if (value > min) {
      onChange?.(value - 1)
    }
  }

  const handleIncrement = () => {
    if (value < max) {
      onChange?.(value + 1)
    }
  }

  const isMin = value <= min
  const isMax = value >= max

  return (
    <div className="flex items-center border border-[#2D2D30] rounded-full bg-[#232326]">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={isMin}
        className={`w-9 h-9 flex items-center justify-center rounded-l-full transition ${
          isMin
            ? 'text-[#6B7280] cursor-not-allowed'
            : 'text-[#B8B8C2] hover:bg-[#2A2A2E] active:bg-[#2A2A2E]'
        }`}
        aria-label="Decrease quantity"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>

      <span className="w-9 h-9 flex items-center justify-center text-sm font-semibold text-white select-none">
        {value}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={isMax}
        className={`w-9 h-9 flex items-center justify-center rounded-r-full transition ${
          isMax
            ? 'text-[#6B7280] cursor-not-allowed'
            : 'text-[#B8B8C2] hover:bg-[#2A2A2E] active:bg-[#2A2A2E]'
        }`}
        aria-label="Increase quantity"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  )
}
