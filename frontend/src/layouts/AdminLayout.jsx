import { useState } from 'react'
import AdminSidebar from '../components/AdminSidebar'
import AdminNavbar from '../components/AdminNavbar'
import Toast from '../components/Toast'
import ScrollToTop from '../components/ScrollToTop'
import { Outlet } from 'react-router-dom'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-[#0F0F10] text-white font-['Inter']">
      <ScrollToTop />
      <AdminNavbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      <div className="flex flex-1">
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <main className="flex-1 p-6 lg:ml-64 min-h-[calc(100vh-64px)] overflow-y-auto bg-[#18181B]">
          <Outlet />
        </main>
      </div>
      <Toast />
    </div>
  )
}
