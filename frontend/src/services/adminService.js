import { api } from './api';

function buildQuery(params) {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  });
  return query.toString();
}

export const adminService = {
  getDashboardOverview: () => api.get('/admin/dashboard/overview').then(r => r.data),
  getAnalytics: () => api.get('/admin/analytics').then(r => r.data),
  getUsers: (params = {}) => api.get(`/admin/users?${buildQuery(params)}`).then(r => r.data),
  getUser: (id) => api.get(`/admin/users/${id}`).then(r => r.data),
  updateUserStatus: (id, blocked) => api.patch(`/admin/users/${id}/status`, { blocked }).then(r => r.data),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }).then(r => r.data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};
