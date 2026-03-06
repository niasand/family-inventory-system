import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
});

api.interceptors.response.use(
  response => response.data,
  error => {
    const message = error.response?.data?.message || error.message || '请求失败';
    return Promise.reject(new Error(message));
  }
);

export const itemAPI = {
  getAll: (params) => api.get('/items', { params }),
  getById: (id) => api.get(`/items/${id}`),
  create: (data) => api.post('/items', data),
  update: (id, data) => api.put(`/items/${id}`, data),
  delete: (id) => api.delete(`/items/${id}`),
  getCategories: () => api.get('/items/categories'),
  getTags: () => api.get('/items/tags'),
  getStatuses: () => api.get('/items/statuses')  // 新增：获取状态列表
};

export const locationAPI = {
  getAll: () => api.get('/locations'),
  getById: (id) => api.get(`/locations/${id}`),
  create: (data) => api.post('/locations', data),
  update: (id, data) => api.put(`/locations/${id}`, data),
  delete: (id) => api.delete(`/locations/${id}`),
  getItemCounts: () => api.get('/locations/counts')  // 获取各位置的物品数量
};

export const backupAPI = {
  export: () => api.get('/backup/export', { responseType: 'blob' }),
  import: (data, overwrite = false) => api.post('/backup/import', { data, overwrite }),
  getInfo: () => api.get('/backup/info')
};

export default api;
