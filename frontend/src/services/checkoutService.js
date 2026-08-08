import { api } from './api';

export const checkoutService = {
  getQuote: (data) => api.post('/checkout/quote', data),
  createPayment: (data) => api.post('/checkout/create-payment', data),
  getPaymentMethods: () => api.get('/checkout/payment-methods'),
};
