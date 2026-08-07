import { api } from './api'

export const bannerService = {
  getAdminBanners: () => api.get('/admin/banners'),
  getActiveBanners: () => api.get(`/banners?t=${Date.now()}`),
  createBanner: (data) => api.post('/admin/banners', data),
  updateBanner: (id, data) => api.put(`/admin/banners/${id}`, data),
  deleteBanner: (id) => api.delete(`/admin/banners/${id}`),
  reorderBanners: (ids) => api.put('/admin/banners/reorder', ids),
  uploadImage: (file) => api.upload('/admin/banners/upload-image', file).then((r) => r.data),
}
