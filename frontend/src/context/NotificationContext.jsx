import { createContext, useContext, useState, useMemo, useEffect } from 'react'
import { notifications as initialNotifications } from '../data/notifications'

const NotificationContext = createContext()

const STORAGE_KEY = 'sifr_notifications'

const loadNotifications = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return initialNotifications
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(loadNotifications)
  const [lastOrderNotifId, setLastOrderNotifId] = useState(null)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications)) } catch {}
  }, [notifications])

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  )

  const markAsRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const addNotification = (notif) => {
    const newId = Math.max(...notifications.map((n) => n.id), 0) + 1
    setNotifications((prev) => [{ id: newId, ...notif }, ...prev])
  }

  const getUserNotifications = (userId) => {
    if (!userId) return []
    return notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  const getUserUnreadCount = (userId) => {
    if (!userId) return 0
    return notifications.filter((n) => n.userId === userId && !n.read).length
  }

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      addNotification,
      getUserNotifications,
      getUserUnreadCount,
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}
