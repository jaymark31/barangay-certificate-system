import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bcms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authService = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: { name: string; email: string; password: string }) => api.post('/auth/register', data),
};

export const requestService = {
  getAll: (params?: Record<string, string>) => api.get('/requests', { params }),
  getById: (id: string) => api.get(`/requests/${id}`),
  create: (data: FormData) => api.post('/requests', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  approve: (id: string) => api.put(`/requests/${id}/approve`),
  reject: (id: string, remarks: string) => api.put(`/requests/${id}/reject`, { remarks }),
  release: (id: string) => api.put(`/requests/${id}/release`),
};

export const certificateService = {
  getTypes: () => api.get('/certificates'),
  create: (data: any) => api.post('/certificates', data),
  update: (id: string, data: any) => api.put(`/certificates/${id}`, data),
  delete: (id: string) => api.delete(`/certificates/${id}`),
};

export const userService = {
  getAll: () => api.get('/users'),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
};

export default api;
