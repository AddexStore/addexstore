import { api } from './api';

export const productService = {
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') query.set(k, v); });
    return api.get(`/products?${query}`);
  },
  getProduct: (id) => api.get(`/products/${id}`),
  getProductBySlug: (slug) => api.get(`/products/slug/${slug}`),
  getFeatured: (page = 0, size = 10) => api.get(`/products/featured?page=${page}&size=${size}`),
  getTrending: (page = 0, size = 10) => api.get(`/products/trending?page=${page}&size=${size}`),
  getNewArrivals: (page = 0, size = 10) => api.get(`/products/new-arrivals?page=${page}&size=${size}`),
  getSales: (page = 0, size = 10) => api.get(`/products/sales?page=${page}&size=${size}`),
};
