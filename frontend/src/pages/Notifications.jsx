import { useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import { formatDate } from '../utils/helpers'
import EmptyState from '../components/EmptyState'
import Button from '../components/ui/Button'
import Icon from '../components/ui/Icon'

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

export default function Notifications() {
  const { user } = useAuth()
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications()
  const [activeTab, setActiveTab] = useState('All')

  const userNotifications = useMemo(
    () => notifications
      .filter((n) => n.userId === user?.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [notifications, user?.id]
  )

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'All') return userNotifications
    if (activeTab === 'Unread') return userNotifications.filter((n) => !n.read)
    return userNotifications
  }, [userNotifications, activeTab])

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <EmptyState
          title="Sign In Required"
          message="Please sign in to view your notifications."
          actionLabel="Sign In"
          actionLink="/login"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page pb-16">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow mb-2 text-gold-600">Updates</p>
            <h1 className="heading-display text-2xl sm:text-3xl">Notifications</h1>
            <p className="mt-1 text-sm text-sub">Stay updated with your orders and promotions.</p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="goldOutline"
              size="sm"
              icon="CheckCheck"
              onClick={markAllAsRead}
              className="self-start sm:self-auto"
            >
              Mark All as Read
            </Button>
          )}
        </div>

        <div className="mb-6 flex gap-2">
          {['All', 'Unread'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex min-h-[44px] items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-gold-500 text-white shadow-gold-soft'
                  : 'border border-line bg-surface text-sub hover:border-gold-500/50 hover:text-ink'
              }`}
            >
              {tab}
              {tab === 'Unread' && unreadCount > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${activeTab === tab ? 'bg-white/20' : 'bg-gold-100 text-gold-700'}`}>
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {filteredNotifications.length === 0 ? (
          <EmptyState
            icon="Bell"
            title={activeTab === 'Unread' ? 'No Unread Notifications' : 'No Notifications'}
            message={activeTab === 'Unread' ? 'You have no unread notifications.' : 'You have no notifications at the moment.'}
          />
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => {
              const iconName = NOTIFICATION_ICONS[notif.type] || NOTIFICATION_ICONS.system
              const tone = TYPE_TONES[notif.type] || 'neutral'
              const toneClass = {
                success: 'bg-success/12 text-success',
                info: 'bg-info/12 text-info',
                danger: 'bg-danger/12 text-danger',
                gold: 'bg-gold-100 text-gold-700',
                neutral: 'bg-subtle text-sub',
              }[tone]

              return (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`flex cursor-pointer items-start gap-4 rounded-card p-4 transition-all active:scale-[0.99] sm:p-5 ${
                    notif.read
                      ? 'bg-surface hover:bg-subtle'
                      : 'border border-gold-500/25 bg-gold-50 dark:bg-gold-500/5'
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      markAsRead(notif.id)
                    }
                  }}
                >
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10 ${toneClass}`}>
                    <Icon name={iconName} size="sm" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className={`text-sm ${notif.read ? 'font-medium text-ink' : 'font-semibold text-ink'}`}>
                          {notif.title}
                        </h4>
                        <p className="mt-0.5 text-xs leading-relaxed text-sub">{notif.message}</p>
                      </div>
                      {!notif.read && (
                        <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-gold-500" />
                      )}
                    </div>
                    <p className="mt-2 text-[10px] text-faint">{formatDate(notif.createdAt)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
