import { forwardRef } from 'react'

export const Table = forwardRef(function Table({ className = '', children, ...props }, ref) {
  return (
    <div className="overflow-x-auto">
      <table ref={ref} className={`w-full text-sm text-ink ${className}`} {...props}>
        {children}
      </table>
    </div>
  )
})

export const THead = forwardRef(function THead({ className = '', ...props }, ref) {
  return (
    <thead
      ref={ref}
      className={`border-b border-line text-left text-[11px] uppercase tracking-[0.14em] text-sub ${className}`}
      {...props}
    />
  )
})

export const TBody = forwardRef(function TBody({ className = '', ...props }, ref) {
  return <tbody ref={ref} className={className} {...props} />
})

export const TR = forwardRef(function TR({ className = '', ...props }, ref) {
  return <tr ref={ref} className={`border-b border-faint-line transition-colors last:border-0 ${className}`} {...props} />
})

export const TH = forwardRef(function TH({ className = '', ...props }, ref) {
  return <th ref={ref} className={`px-4 py-3 font-semibold whitespace-nowrap ${className}`} {...props} />
})

export const TD = forwardRef(function TD({ className = '', ...props }, ref) {
  return <td ref={ref} className={`px-4 py-3 align-middle ${className}`} {...props} />
})
