import { api } from './api';

export const orderService = {
  create: (data) => api.post('/orders', data),
  getMyOrders: (page = 0, size = 10) => api.get(`/orders?page=${page}&size=${size}`),
  getByOrderNumber: (orderNumber) => api.get(`/orders/number/${orderNumber}`),
  getById: (id) => api.get(`/orders/${id}`),
};
