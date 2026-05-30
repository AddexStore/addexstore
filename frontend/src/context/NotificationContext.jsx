import { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react'
import { notificationService } from '../services/notificationService'
import { useAuth } from './AuthContext'

const NotificationContext = createContext()

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      setLoading(true)
      notificationService.getNotifications()
        .then((res) => { setNotifications(res.data || []) })
        .catch(() => {})
        .finally(() => setLoading(false))
    } else {
      setNotifications([])
      setLoading(false)
    }
  }, [user])

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications])

  const markAsRead = useCallback((id) => {
    notificationService.markAsRead(id).catch(() => {})
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const markAllAsRead = useCallback(() => {
    notificationService.markAllAsRead().catch(() => {})
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const deleteNotification = useCallback((id) => {
    notificationService.deleteNotification(id).catch(() => {})
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const addNotification = useCallback((notif) => {
    setNotifications((prev) => [{ id: Date.now(), ...notif }, ...prev])
  }, [])

  const getUserNotifications = useCallback((userId) => {
    if (!userId || !user) return []
    return notifications
      .filter((n) => n.userId === userId || n.userId === user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [notifications, user])

  const getUserUnreadCount = useCallback((userId) => {
    if (!userId || !user) return 0
    return notifications.filter((n) => (n.userId === userId || n.userId === user.id) && !n.read).length
  }, [notifications, user])

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, loading,
      markAsRead, markAllAsRead, deleteNotification, addNotification,
      getUserNotifications, getUserUnreadCount,
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
