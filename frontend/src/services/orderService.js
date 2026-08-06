import { api } from './api';

export const orderService = {
  create: (data) => api.post('/orders', data),
  getMyOrders: (page = 0, size = 10) => api.get(`/orders?page=${page}&size=${size}`),
  getByOrderNumber: (orderNumber) => api.get(`/orders/number/${orderNumber}`),
  getById: (id) => api.get(`/orders/${id}`),
  getAdminOrders: ({ page = 0, size = 100, status, search } = {}) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    return api.get(`/admin/orders?${params.toString()}`);
  },
  updateAdminOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),
};

export const paymentService = {
  getPaymentByOrderId: (orderId) => api.get(`/payments/order/${orderId}`),
  createStripePaymentIntent: (data) => api.post('/payments/stripe/create-intent', data),
  getStripePaymentStatus: (paymentIntentId) => api.get(`/payments/stripe/status/${paymentIntentId}`),
  cancelStripePayment: (paymentIntentId) => api.post(`/payments/stripe/cancel/${paymentIntentId}`),
};
