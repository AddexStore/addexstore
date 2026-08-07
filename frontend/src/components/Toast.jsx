import { useToast } from '../context/ToastContext'
import Icon from './ui/Icon'

const typeConfig = {
  success: { icon: 'CheckCircle2', tone: 'text-success' },
  error: { icon: 'XCircle', tone: 'text-danger' },
  info: { icon: 'Info', tone: 'text-info' },
  warning: { icon: 'AlertTriangle', tone: 'text-warning' },
}

export default function Toast() {
  const { toasts, removeToast } = useToast()

  if (!toasts || toasts.length === 0) return null

  return (
    <div className="pointer-events-none fixed top-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2.5 px-4 sm:px-0">
      {toasts.map((toast) => {
        const config = typeConfig[toast.type] || typeConfig.info

        return (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex items-start gap-3 rounded-field border border-line bg-surface p-4 shadow-overlay animate-slide-in-right"
          >
            <Icon name={config.icon} className={`mt-0.5 shrink-0 ${config.tone}`} />
            <p className="flex-1 text-sm font-medium leading-snug text-ink">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 rounded-full p-1 text-faint transition-colors hover:bg-subtle hover:text-ink"
              aria-label="Dismiss notification"
            >
              <Icon name="X" size="xs" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
