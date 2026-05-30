import { useState, useMemo } from 'react'
import { useNotifications } from '../../context/NotificationContext'
import { useToast } from '../../context/ToastContext'
import { formatDate } from '../../utils/helpers'
import BackButton from '../../components/BackButton'

const typeIcons = {
  order_confirmation: 'bg-blue-500/20 text-blue-400', shipping_update: 'bg-purple-500/20 text-purple-400',
  delivery_confirmation: 'bg-green-500/20 text-green-600', processing_update: 'bg-yellow-500/20 text-yellow-600',
  cancellation: 'bg-red-500/20 text-red-600', promotion: 'bg-pink-500/20 text-pink-400',
  review_request: 'bg-orange-500/20 text-orange-400', system: 'bg-cyan-500/20 text-cyan-400',
}

const typeSvgs = {
  order_confirmation: <><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></>,
  shipping_update: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></>,
  delivery_confirmation: <><polyline points="20 6 9 17 4 12"/></>,
  processing_update: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>,
  cancellation: <><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>,
  promotion: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
  review_request: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
  system: <><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></>,
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

  return (
    <div className="h-full flex flex-col gap-2 py-3">
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-lg font-bold text-[var(--text-primary)] font-['Playfair_Display']">Notifications</h1>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="px-3 py-1.5 bg-[#C6A972]/20 text-[#C6A972] rounded-lg text-xs font-medium hover:bg-[#C6A972]/30 transition-colors">Mark All Read</button>
          )}
          <div className="flex gap-1">
            {['All', 'Unread'].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-[#C6A972] text-white' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                {f}{f === 'Unread' && unreadCount > 0 && <span className="ml-1 bg-red-500 text-white text-[9px] px-1 py-0.5 rounded-full">{unreadCount}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-1">
        {filtered.length === 0 && <div className="text-center py-8 text-[var(--text-secondary)] text-xs">{filter === 'Unread' ? 'No unread notifications' : 'No notifications'}</div>}
        {filtered.map((notification) => (
          <div key={notification.id} className={`bg-[var(--bg-card)] rounded-lg border transition-colors ${notification.read ? 'border-[var(--border-color)]/30 opacity-70' : 'border-[#C6A972]/20'}`}>
            <div className="flex items-start gap-3 p-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${typeIcons[notification.type] || 'bg-gray-500/20 text-gray-400'}`}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {typeSvgs[notification.type] || <circle cx="12" cy="12" r="10"/>}
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className={`text-xs ${notification.read ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)] font-semibold'}`}>{notification.title}</h4>
                  {!notification.read && <span className="w-1.5 h-1.5 rounded-full bg-[#C6A972] flex-shrink-0 mt-1" />}
                </div>
                <p className="text-xs text-[var(--text-secondary)]">{notification.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-[var(--text-secondary)]">{formatDate(notification.createdAt)}</span>
                  {!notification.read && <button onClick={() => markAsRead(notification.id)} className="text-[10px] text-[#C6A972] hover:underline">Read</button>}
                  <button onClick={() => handleDelete(notification.id)} className="text-[10px] text-[var(--text-secondary)] hover:text-red-600 ml-auto">Delete</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
