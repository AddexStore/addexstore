import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingFallback from '../components/LoadingFallback'

export default function AdminProtectedRoute() {
  const { isAuthenticated, isAdmin, loading } = useAuth()

  if (loading) {
    return <LoadingFallback />
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}
