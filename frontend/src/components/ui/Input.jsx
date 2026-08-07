import { forwardRef, useId } from 'react'
import Icon from './Icon'

export function Field({ label, htmlFor, required, error, hint, children, className = '' }) {
  const autoId = useId()
  const id = htmlFor || autoId
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-sub"
        >
          {label}
          {required && <span className="ml-1 text-gold-600">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-faint">{hint}</p>}
      {error && <p className="mt-1.5 flex items-center gap-1 text-xs text-danger"><Icon name="AlertCircle" size="xs" />{error}</p>}
    </div>
  )
}

const baseControl =
  'w-full bg-inset border rounded-field px-4 text-sm text-ink placeholder-faint transition-colors duration-200 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/25 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]'

const stateClass = (error) => (error ? 'border-danger/60' : 'border-line')

export const Input = forwardRef(function Input({ error, className = '', ...props }, ref) {
  return <input ref={ref} className={`${baseControl} ${stateClass(error)} ${className}`} {...props} />
})

export const Textarea = forwardRef(function Textarea({ error, className = '', ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={`${baseControl} min-h-[96px] py-3 resize-y ${stateClass(error)} ${className}`}
      {...props}
    />
  )
})

export const Select = forwardRef(function Select({ error, className = '', children, ...props }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={`${baseControl} appearance-none pr-10 cursor-pointer ${stateClass(error)} ${className}`}
        {...props}
      >
        {children}
      </select>
      <Icon
        name="ChevronDown"
        size="sm"
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sub"
      />
    </div>
  )
})

export const Checkbox = forwardRef(function Checkbox({ label, className = '', ...props }, ref) {
  return (
    <label className={`inline-flex cursor-pointer items-center gap-2.5 text-sm text-ink ${className}`}>
      <input
        ref={ref}
        type="checkbox"
        className="h-[18px] w-[18px] shrink-0 cursor-pointer appearance-none rounded-[5px] border border-line bg-inset checked:bg-gold-500 checked:border-gold-500 checked:bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22white%22%20stroke-width=%223.5%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22%3E%3Cpath%20d=%22M20%206L9%2017l-5-5%22/%3E%3C/svg%3E')] bg-center bg-[length:12px] focus:outline-none focus:ring-2 focus:ring-gold-500/30 transition-colors"
        {...props}
      />
      {label && <span>{label}</span>}
    </label>
  )
})

export const Toggle = forwardRef(function Toggle({ label, className = '', ...props }, ref) {
  return (
    <label className={`inline-flex cursor-pointer items-center gap-3 ${className}`}>
      <input ref={ref} type="checkbox" className="peer sr-only" {...props} />
      <span className="relative h-6 w-11 rounded-full bg-line transition-colors duration-200 peer-checked:bg-gold-500 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:duration-200 peer-checked:after:translate-x-5" />
      {label && <span className="text-sm text-ink">{label}</span>}
    </label>
  )
})
