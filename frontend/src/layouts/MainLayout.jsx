import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import MobileBottomNav from '../components/MobileBottomNav'
import Toast from '../components/Toast'
import ScrollToTop from '../components/ScrollToTop'
import { Outlet } from 'react-router-dom'

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0F0F10] font-['Inter']">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1 pb-16 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      <div className="block lg:hidden">
        <MobileBottomNav />
      </div>
      <Toast />
    </div>
  )
}
