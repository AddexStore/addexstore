import { api } from './api';

export const orderService = {
  create: (data) => api.post('/orders', data),
  getMyOrders: (page = 0, size = 10) => api.get(`/orders?page=${page}&size=${size}`),
  getByOrderNumber: (orderNumber) => api.get(`/orders/number/${orderNumber}`),
  getById: (id) => api.get(`/orders/${id}`),
};

export const paymentService = {
  createPayPalOrder: (data) => api.post('/payments/paypal/create', data),
  capturePayPalOrder: (data) => api.post('/payments/paypal/capture', data),
  createRazorpayOrder: (data) => api.post('/payments/razorpay/create', data),
  verifyRazorpayPayment: (data) => api.post('/payments/razorpay/verify', data),
  getPaymentByOrderId: (orderId) => api.get(`/payments/order/${orderId}`),
};
