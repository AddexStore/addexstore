import { api } from './api';

export const settingsService = {
  getPublic: () => api.get('/settings'),
  getAdmin: () => api.get('/admin/settings'),
  update: (data) => api.put('/admin/settings', data),
};
