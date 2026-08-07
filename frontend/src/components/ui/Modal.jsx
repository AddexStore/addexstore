import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Icon from './Icon'
import Button from './Button'

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

/**
 * Standardized dialog. Same width scale, padding, header, footer,
 * animation and typography everywhere.
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
  closeOnOverlay = true,
  hideCloseButton = false,
}) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div
        className="absolute inset-0 bg-ink/60 backdrop-blur-[2px] animate-fade-in"
        onClick={closeOnOverlay ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={[
          'relative w-full bg-surface rounded-t-card sm:rounded-card border border-line shadow-overlay animate-modal-in',
          'flex flex-col max-h-[92vh]',
          SIZES[size],
        ].join(' ')}
      >
        {!hideCloseButton && (
          <button
            onClick={onClose}
            className="absolute right-3.5 top-3.5 z-10 flex h-9 w-9 items-center justify-center rounded-full text-sub transition-colors hover:bg-subtle hover:text-ink"
            aria-label="Close dialog"
          >
            <Icon name="X" size="sm" />
          </button>
        )}

        {(title || description) && (
          <header className="border-b border-line px-6 pt-6 pb-5">
            {title && <h2 className="heading-display text-xl sm:text-2xl">{title}</h2>}
            {description && <p className="mt-1.5 text-sm text-sub">{description}</p>}
          </header>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>

        {footer && (
          <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-line px-6 py-4">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body
  )
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  loading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? 'dangerSolid' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-sub">{message}</p>
    </Modal>
  )
}
