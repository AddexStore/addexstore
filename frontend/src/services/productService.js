import { api } from './api';

export const productService = {
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') query.set(k, v); });
    return api.get(`/products?${query}`);
  },
  getAdminProducts: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') query.set(k, v); });
    return api.get(`/admin/products?${query}`);
  },
  getProduct: (id) => api.get(`/products/${id}`),
  getProductBySlug: (slug) => api.get(`/products/slug/${slug}`),
  getFeatured: (page = 0, size = 10) => api.get(`/products/featured?page=${page}&size=${size}`),
  getTrending: (page = 0, size = 10) => api.get(`/products/trending?page=${page}&size=${size}`),
  getNewArrivals: (page = 0, size = 10) => api.get(`/products/new-arrivals?page=${page}&size=${size}`),
  getSales: (page = 0, size = 10) => api.get(`/products/sales?page=${page}&size=${size}`),
  createProduct: (data) => api.post('/admin/products', data).then(r => r.data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data).then(r => r.data),
  patchProduct: (id, patch) => api.patch(`/admin/products/${id}`, patch).then(r => r.data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  deleteImage: (imageUrl) => api.delete('/admin/products/image', { imageUrl }).then(r => r.data),
  uploadImage: (file, onProgress) => api.upload('/admin/products/upload-image', file, onProgress).then(r => r.data),
};
