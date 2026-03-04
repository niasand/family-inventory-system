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
  getTags: () => api.get('/items/tags')
};

export const backupAPI = {
  export: () => api.get('/backup/export', { responseType: 'blob' }),
  import: (data, overwrite = false) => api.post('/backup/import', { data, overwrite }),
  getInfo: () => api.get('/backup/info')
};

export default api;
