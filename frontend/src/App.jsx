import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { ToastProvider } from './context/ToastContext'
import { ThemeProvider } from './context/ThemeContext'
import { NotificationProvider } from './context/NotificationContext'
import { CelebrationProvider } from './context/CelebrationContext'
import ErrorBoundary from './components/ErrorBoundary'
import AppRoutes from './routes/AppRoutes'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <ThemeProvider>
              <CelebrationProvider>
                <CartProvider>
                  <WishlistProvider>
                    <NotificationProvider>
                      <AppRoutes />
                    </NotificationProvider>
                  </WishlistProvider>
                </CartProvider>
              </CelebrationProvider>
            </ThemeProvider>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
