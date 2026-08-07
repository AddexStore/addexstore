import { useState, useMemo } from 'react'
import { useNotifications } from '../../context/NotificationContext'
import { useToast } from '../../context/ToastContext'
import { formatDate } from '../../utils/helpers'
import PageHeader from '../../components/ui/PageHeader'
import Tabs from '../../components/ui/Tabs'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import EmptyState from '../../components/EmptyState'

const NOTIFICATION_ICONS = {
  order_confirmation: 'CheckCircle2',
  shipping_update: 'Truck',
  delivery_confirmation: 'PackageCheck',
  processing_update: 'RefreshCw',
  cancellation: 'XCircle',
  promotion: 'Sparkles',
  review_request: 'Star',
  system: 'Settings',
}

const TYPE_TONES = {
  order_confirmation: 'success',
  shipping_update: 'info',
  delivery_confirmation: 'success',
  processing_update: 'info',
  cancellation: 'danger',
  promotion: 'gold',
  review_request: 'info',
  system: 'neutral',
}

const TONE_CLASS = {
  success: 'bg-success/12 text-success',
  info: 'bg-info/12 text-info',
  danger: 'bg-danger/12 text-danger',
  gold: 'bg-gold-100 text-gold-700',
  neutral: 'bg-subtle text-sub',
}

export default function AdminNotifications() {
  const { showToast } = useToast()
  const { notifications, markAsRead, markAllAsRead, deleteNotification, unreadCount } = useNotifications()
  const [filter, setFilter] = useState('All')

  const filtered = useMemo(() => {
    if (filter === 'Unread') return notifications.filter((n) => !n.read)
    return notifications
  }, [notifications, filter])

  const handleDelete = (id) => { deleteNotification(id); showToast('Notification deleted', 'success') }

  const tabs = [
    { key: 'All', label: 'All' },
    { key: 'Unread', label: 'Unread', count: unreadCount > 0 ? unreadCount : undefined },
  ]

  return (
    <div className="flex h-full flex-col gap-4 py-4">
      <PageHeader
        title="Notifications"
        description="Notifications sent to all customers across your store."
        actions={
          unreadCount > 0 && (
            <Button variant="goldOutline" size="sm" icon="CheckCheck" onClick={markAllAsRead}>
              Mark All as Read
            </Button>
          )
        }
      />

      <div className="flex-shrink-0">
        <Tabs tabs={tabs} activeKey={filter} onChange={setFilter} />
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
        {filtered.length === 0 ? (
          <EmptyState
            icon="Bell"
            compact
            title={filter === 'Unread' ? 'No Unread Notifications' : 'No Notifications'}
            message={filter === 'Unread' ? 'You have no unread notifications.' : 'You have no notifications at the moment.'}
          />
        ) : (
          filtered.map((notification) => {
            const iconName = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.system
            const tone = TYPE_TONES[notification.type] || 'neutral'
            const toneClass = TONE_CLASS[tone] || TONE_CLASS.neutral

            return (
              <div
                key={notification.id}
                className={`flex items-start gap-4 rounded-card p-4 transition-colors sm:p-5 ${
                  notification.read
                    ? 'bg-surface hover:bg-subtle'
                    : 'border border-gold-500/25 bg-gold-50 dark:bg-gold-500/5'
                }`}
              >
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10 ${toneClass}`}>
                  <Icon name={iconName} size="sm" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className={`text-sm ${notification.read ? 'font-medium text-ink' : 'font-semibold text-ink'}`}>
                        {notification.title}
                      </h4>
                      <p className="mt-0.5 text-xs leading-relaxed text-sub">{notification.message}</p>
                    </div>
                    {!notification.read && (
                      <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-gold-500" />
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] text-faint">{formatDate(notification.createdAt)}</span>
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="rounded-soft px-1.5 py-0.5 text-[10px] font-medium text-gold-600 transition-colors hover:bg-gold-100 hover:text-gold-700"
                      >
                        Read
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="ml-auto inline-flex items-center gap-1 rounded-soft px-1.5 py-0.5 text-[10px] font-medium text-sub transition-colors hover:bg-danger/8 hover:text-danger"
                    >
                      <Icon name="Trash2" size="xs" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
