export const SITE_NAME = 'AddexStores';

export const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Categories', path: '/categories' },
  { name: 'Products', path: '/products' },
  { name: 'New Arrivals', path: '/new-arrivals' },
  { name: 'Trending', path: '/trending' },
  { name: 'Sales', path: '/sales' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

export const SORT_OPTIONS = [
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'rating', label: 'Top Rated' },
];

export const ORDER_STATUS = {
  PENDING: 'Pending',
  PENDING_PAYMENT: 'Pending Payment',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export const ADMIN_SIDEBAR_LINKS = [
  { name: 'Dashboard', path: '/admin', icon: 'LayoutDashboard' },
  { name: 'Products', path: '/admin/products', icon: 'Package' },
  { name: 'Categories', path: '/admin/categories', icon: 'Grid3x3' },
  { name: 'Orders', path: '/admin/orders', icon: 'ShoppingCart' },
  { name: 'Users', path: '/admin/users', icon: 'Users' },
  { name: 'Inventory', path: '/admin/inventory', icon: 'Warehouse' },
  { name: 'Analytics', path: '/admin/analytics', icon: 'BarChart3' },
  { name: 'Reviews', path: '/admin/reviews', icon: 'Star' },
  { name: 'Banners', path: '/admin/banners', icon: 'Image' },
  { name: 'Payments', path: '/admin/payments', icon: 'CreditCard' },
  { name: 'Notifications', path: '/admin/notifications', icon: 'Bell' },
  { name: 'Settings', path: '/admin/settings', icon: 'Settings' },
];

export const COLORS = [
  'Black',
  'White',
  'Navy',
  'Red',
  'Gold',
  'Beige',
  'Brown',
  'Gray',
  'Pink',
  'Blue',
  'Green',
  'Purple',
];

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
