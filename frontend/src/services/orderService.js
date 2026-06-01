import { api } from './api';

export const orderService = {
  create: (data) => api.post('/orders', data),
  getMyOrders: (page = 0, size = 10) => api.get(`/orders?page=${page}&size=${size}`),
  getByOrderNumber: (orderNumber) => api.get(`/orders/number/${orderNumber}`),
  getById: (id) => api.get(`/orders/${id}`),
  getAdminOrders: ({ page = 0, size = 100, status } = {}) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (status) params.set('status', status);
    return api.get(`/admin/orders?${params.toString()}`);
  },
  updateAdminOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),
};

export const paymentService = {
  createPayPalOrder: (data) => api.post('/payments/paypal/create', data),
  capturePayPalOrder: (data) => api.post('/payments/paypal/capture', data),
  createRazorpayOrder: (data) => api.post('/payments/razorpay/create', data),
  verifyRazorpayPayment: (data) => api.post('/payments/razorpay/verify', data),
  getPaymentByOrderId: (orderId) => api.get(`/payments/order/${orderId}`),
};
