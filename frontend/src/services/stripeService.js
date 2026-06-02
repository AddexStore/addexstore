import { api } from './api';

export const stripeService = {
  createPaymentIntent: (data) => api.post('/payments/stripe/create-intent', data),
  getPaymentStatus: (paymentIntentId) => api.get(`/payments/stripe/status/${paymentIntentId}`),
  cancelPayment: (paymentIntentId) => api.post(`/payments/stripe/cancel/${paymentIntentId}`),
  getPaymentByOrderId: (orderId) => api.get(`/payments/order/${orderId}`),
};

export const adminPaymentService = {
  getAll: ({ page = 0, size = 20, status, search } = {}) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    return api.get(`/admin/payments?${params.toString()}`);
  },
  getById: (id) => api.get(`/admin/payments/${id}`),
  getTransactions: (id) => api.get(`/admin/payments/${id}/transactions`),
  getRefunds: (id) => api.get(`/admin/payments/${id}/refunds`),
  refund: (id, data) => api.post(`/admin/payments/${id}/refund`, data),
  refundByBody: (data) => api.post('/admin/payments/refund', data),
};
