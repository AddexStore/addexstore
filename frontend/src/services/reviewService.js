import { api } from './api';

export const reviewService = {
  getReviews: (productId, page = 0, size = 10) => api.get(`/products/${productId}/reviews?page=${page}&size=${size}`),
  addReview: (productId, data) => api.post(`/products/${productId}/reviews`, data),
};
