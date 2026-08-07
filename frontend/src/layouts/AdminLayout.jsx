import { useState } from 'react'
import AdminSidebar from '../components/AdminSidebar'
import AdminNavbar from '../components/AdminNavbar'
import Toast from '../components/Toast'
import ScrollToTop from '../components/ScrollToTop'
import CelebrationOverlay from '../components/CelebrationOverlay'
import { Outlet } from 'react-router-dom'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-page font-sans text-ink">
      <ScrollToTop />
      <AdminNavbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      <div className="flex flex-1">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-ink/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        <main className="min-h-[calc(100vh-64px)] flex-1 overflow-y-auto bg-page p-4 sm:p-6 lg:ml-72">
          <div className="mx-auto w-full max-w-[100rem]">
            <Outlet />
          </div>
        </main>
      </div>
      <Toast />
      <CelebrationOverlay />
    </div>
  )
}
