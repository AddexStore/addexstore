import { api } from './api';

export const categoryService = {
  getAll: () => api.get('/categories'),
  getBySlug: (slug) => api.get(`/categories/${slug}`),

  create: (data) => api.post('/admin/categories', data),
  update: (id, data) => api.put(`/admin/categories/${id}`, data),
  delete: (id) => api.delete(`/admin/categories/${id}`),

  addSubCategory: (categoryId, data) => api.post(`/admin/categories/${categoryId}/subcategories`, data),
  updateSubCategory: (subCategoryId, data) => api.put(`/admin/categories/subcategories/${subCategoryId}`, data),
  deleteSubCategory: (subCategoryId) => api.delete(`/admin/categories/subcategories/${subCategoryId}`),

  uploadIcon: (file) => api.upload('/admin/categories/upload-icon', file),
  uploadCategoryIcon: (categoryId, file) => api.upload(`/admin/categories/${categoryId}/upload-icon`, file),
  uploadSubCategoryIcon: (subCategoryId, file) => api.upload(`/admin/categories/subcategories/${subCategoryId}/upload-icon`, file),
};
