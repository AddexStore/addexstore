import { api } from './api';

export const reviewService = {
  getReviews: (productId, page = 0, size = 10) => api.get(`/products/${productId}/reviews?page=${page}&size=${size}`),
  addReview: (productId, data) => api.post(`/products/${productId}/reviews`, data),
  getAdminReviews: (page = 0, size = 10, approved) => {
    let url = `/admin/reviews?page=${page}&size=${size}`;
    if (approved !== undefined) url += `&approved=${approved}`;
    return api.get(url).then(r => r.data);
  },
  approveReview: (id) => api.put(`/admin/reviews/${id}/approve`),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`),
};
