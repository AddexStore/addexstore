import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import AdminLayout from '../layouts/AdminLayout'
import ProtectedRoute from './ProtectedRoute'
import AdminProtectedRoute from './AdminProtectedRoute'
import PublicRoute from './PublicRoute'
import LoadingFallback from '../components/LoadingFallback'

const Home = React.lazy(() => import('../pages/Home'))
const AllProducts = React.lazy(() => import('../pages/AllProducts'))
const CategoriesPage = React.lazy(() => import('../pages/CategoriesPage'))
const CategoryProducts = React.lazy(() => import('../pages/CategoryProducts'))
const ProductDetails = React.lazy(() => import('../pages/ProductDetails'))
const Search = React.lazy(() => import('../pages/Search'))
const Cart = React.lazy(() => import('../pages/Cart'))
const Wishlist = React.lazy(() => import('../pages/Wishlist'))
const Login = React.lazy(() => import('../pages/Login'))
const Signup = React.lazy(() => import('../pages/Signup'))
const Profile = React.lazy(() => import('../pages/Profile'))
const Orders = React.lazy(() => import('../pages/Orders'))
const Notifications = React.lazy(() => import('../pages/Notifications'))
const Settings = React.lazy(() => import('../pages/Settings'))
const AdminLogin = React.lazy(() => import('../pages/admin/AdminLogin'))
const AdminDashboard = React.lazy(() => import('../pages/admin/AdminDashboard'))
const AdminProducts = React.lazy(() => import('../pages/admin/AdminProducts'))
const AdminCategories = React.lazy(() => import('../pages/admin/AdminCategories'))
const AdminOrders = React.lazy(() => import('../pages/admin/AdminOrders'))
const AdminUsers = React.lazy(() => import('../pages/admin/AdminUsers'))
const AdminInventory = React.lazy(() => import('../pages/admin/AdminInventory'))
const AdminAnalytics = React.lazy(() => import('../pages/admin/AdminAnalytics'))
const AdminReviews = React.lazy(() => import('../pages/admin/AdminReviews'))
const AdminNotifications = React.lazy(() => import('../pages/admin/AdminNotifications'))
const AdminBanners = React.lazy(() => import('../pages/admin/AdminBanners'))
const AdminSettings = React.lazy(() => import('../pages/admin/AdminSettings'))
const NewArrivals = React.lazy(() => import('../pages/NewArrivals'))
const Trending = React.lazy(() => import('../pages/Trending'))
const Checkout = React.lazy(() => import('../pages/Checkout'))
const OrderConfirmation = React.lazy(() => import('../pages/OrderConfirmation'))
const About = React.lazy(() => import('../pages/About'))
const Contact = React.lazy(() => import('../pages/Contact'))
const NotFound = React.lazy(() => import('../pages/NotFound'))

function SuspenseWrapper({ children }) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      {children}
    </Suspense>
  )
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<SuspenseWrapper><Home /></SuspenseWrapper>} />
        <Route path="products" element={<SuspenseWrapper><AllProducts /></SuspenseWrapper>} />
        <Route path="categories" element={<SuspenseWrapper><CategoriesPage /></SuspenseWrapper>} />
        <Route path="category/:categoryName" element={<SuspenseWrapper><CategoryProducts /></SuspenseWrapper>} />
        <Route path="product/:id" element={<SuspenseWrapper><ProductDetails /></SuspenseWrapper>} />
        <Route path="search" element={<SuspenseWrapper><Search /></SuspenseWrapper>} />
        <Route path="new-arrivals" element={<SuspenseWrapper><NewArrivals /></SuspenseWrapper>} />
        <Route path="trending" element={<SuspenseWrapper><Trending /></SuspenseWrapper>} />
        <Route path="checkout" element={<SuspenseWrapper><Checkout /></SuspenseWrapper>} />
        <Route path="order-confirmation/:orderId" element={<SuspenseWrapper><OrderConfirmation /></SuspenseWrapper>} />
        <Route path="cart" element={<SuspenseWrapper><Cart /></SuspenseWrapper>} />
        <Route path="wishlist" element={<SuspenseWrapper><Wishlist /></SuspenseWrapper>} />
        <Route path="login" element={<SuspenseWrapper><PublicRoute><Login /></PublicRoute></SuspenseWrapper>} />
        <Route path="signup" element={<SuspenseWrapper><PublicRoute><Signup /></PublicRoute></SuspenseWrapper>} />

        <Route element={<ProtectedRoute />}>
          <Route path="profile" element={<SuspenseWrapper><Profile /></SuspenseWrapper>} />
          <Route path="orders" element={<SuspenseWrapper><Orders /></SuspenseWrapper>} />
          <Route path="notifications" element={<SuspenseWrapper><Notifications /></SuspenseWrapper>} />
          <Route path="settings" element={<SuspenseWrapper><Settings /></SuspenseWrapper>} />
        </Route>
        <Route path="about" element={<SuspenseWrapper><About /></SuspenseWrapper>} />
        <Route path="contact" element={<SuspenseWrapper><Contact /></SuspenseWrapper>} />
      </Route>

      <Route path="admin/login" element={<SuspenseWrapper><AdminLogin /></SuspenseWrapper>} />

      <Route element={<AdminProtectedRoute />}>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<SuspenseWrapper><AdminDashboard /></SuspenseWrapper>} />
          <Route path="dashboard" element={<SuspenseWrapper><AdminDashboard /></SuspenseWrapper>} />
          <Route path="products" element={<SuspenseWrapper><AdminProducts /></SuspenseWrapper>} />
          <Route path="categories" element={<SuspenseWrapper><AdminCategories /></SuspenseWrapper>} />
          <Route path="orders" element={<SuspenseWrapper><AdminOrders /></SuspenseWrapper>} />
          <Route path="users" element={<SuspenseWrapper><AdminUsers /></SuspenseWrapper>} />
          <Route path="inventory" element={<SuspenseWrapper><AdminInventory /></SuspenseWrapper>} />
          <Route path="analytics" element={<SuspenseWrapper><AdminAnalytics /></SuspenseWrapper>} />
          <Route path="reviews" element={<SuspenseWrapper><AdminReviews /></SuspenseWrapper>} />
          <Route path="notifications" element={<SuspenseWrapper><AdminNotifications /></SuspenseWrapper>} />
          <Route path="banners" element={<SuspenseWrapper><AdminBanners /></SuspenseWrapper>} />
          <Route path="settings" element={<SuspenseWrapper><AdminSettings /></SuspenseWrapper>} />
        </Route>
      </Route>

      <Route path="*" element={<SuspenseWrapper><NotFound /></SuspenseWrapper>} />
    </Routes>
  )
}
