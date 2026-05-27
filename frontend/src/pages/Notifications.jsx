import { useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import { formatDate } from '../utils/helpers'
import EmptyState from '../components/EmptyState'
import BackButton from '../components/BackButton'

const NOTIFICATION_ICONS = {
  order_confirmation: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  shipping_update: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-1 2 1 2-1 2 1 2-1 2 1z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16V7.5a1 1 0 00-1-1H8" />
    </svg>
  ),
  delivery_confirmation: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
  ),
  processing_update: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  cancellation: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  promotion: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  review_request: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  system: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
}

const TYPE_COLORS = {
  order_confirmation: 'bg-green-500/20 text-green-400',
  shipping_update: 'bg-blue-500/20 text-blue-400',
  delivery_confirmation: 'bg-emerald-500/20 text-emerald-400',
  processing_update: 'bg-purple-500/20 text-purple-400',
  cancellation: 'bg-red-500/20 text-red-400',
  promotion: 'bg-[#D4AF37]/15 text-[#D4AF37]',
  review_request: 'bg-pink-500/20 text-pink-400',
  system: 'bg-gray-500/20 text-gray-400',
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
      <div className="min-h-[60vh] flex items-center justify-center px-4">
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
    <div className="min-h-screen bg-[#0F0F10] pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-3">
              <BackButton />
              <h1 className="text-2xl sm:text-3xl font-playfair-display font-bold text-white">Notifications</h1>
            </div>
            <p className="text-sm text-[#B8B8C2] mt-1">Stay updated with your orders and promotions.</p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="min-h-[44px] px-5 py-2.5 text-xs font-medium text-[#D4AF37] border border-[#D4AF37]/30 rounded-full hover:bg-[#D4AF37]/10 transition self-start sm:self-auto"
            >
              Mark All as Read
            </button>
          )}
        </div>

        <div className="flex gap-2 mb-6">
          {['All', 'Unread'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`min-h-[44px] px-5 py-2.5 rounded-full text-sm font-medium transition ${
                activeTab === tab
                  ? 'bg-[#D4AF37] text-black'
                  : 'bg-[#232326] text-[#B8B8C2] hover:bg-[#2A2A2E]'
              }`}
            >
              {tab}
              {tab === 'Unread' && unreadCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-black/20 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {filteredNotifications.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            }
            title={activeTab === 'Unread' ? 'No Unread Notifications' : 'No Notifications'}
            message={activeTab === 'Unread' ? 'You have no unread notifications.' : 'You have no notifications at the moment.'}
          />
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => {
              const Icon = NOTIFICATION_ICONS[notif.type] || NOTIFICATION_ICONS.system
              const colorClass = TYPE_COLORS[notif.type] || TYPE_COLORS.system

              return (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`flex items-start gap-4 p-4 sm:p-5 rounded-xl cursor-pointer transition active:scale-[0.99] ${
                    notif.read
                      ? 'bg-[#232326] hover:bg-[#2A2A2E]'
                      : 'bg-[#18181B] border border-[#D4AF37]/10'
                  }`}
                >
                  <div className={`w-11 h-11 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    {Icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className={`text-sm ${notif.read ? 'font-medium text-white' : 'font-semibold text-white'}`}>
                          {notif.title}
                        </h4>
                        <p className="text-xs text-[#B8B8C2] mt-0.5 leading-relaxed">{notif.message}</p>
                      </div>
                      {!notif.read && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-[10px] text-[#6B7280] mt-2">{formatDate(notif.createdAt)}</p>
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
