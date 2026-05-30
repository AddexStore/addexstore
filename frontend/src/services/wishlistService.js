import { api } from './api';

export const wishlistService = {
  getWishlist: () => api.get('/wishlist'),
  addItem: (productId) => api.post('/wishlist', { productId }),
  removeItem: (productId) => api.delete(`/wishlist/${productId}`),
};
