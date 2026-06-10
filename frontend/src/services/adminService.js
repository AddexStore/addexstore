import { api } from './api';

export const adminService = {
  getDashboardStats: () => api.get('/admin/dashboard/stats').then(r => r.data),
  getAnalytics: () => api.get('/admin/analytics').then(r => r.data),
};
