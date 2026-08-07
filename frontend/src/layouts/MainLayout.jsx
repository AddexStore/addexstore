import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import MobileBottomNav from '../components/MobileBottomNav'
import Toast from '../components/Toast'
import ScrollToTop from '../components/ScrollToTop'
import CelebrationOverlay from '../components/CelebrationOverlay'
import { Outlet } from 'react-router-dom'

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-page font-sans text-ink">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1 pb-16 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      <div className="lg:hidden">
        <MobileBottomNav />
      </div>
      <Toast />
      <CelebrationOverlay />
    </div>
  )
}
