import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // send cookies (session stored in Postgres)
});

export const authService = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', {
      fullName: data.name,
      email: data.email,
      password: data.password,
      contactNumber: null,
      address: null,
    }),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const requestService = {
  getAll: (params?: Record<string, string>) => api.get('/requests', { params }),
  getMyRequests: () => api.get('/requests/my-requests'),
  getById: (id: string) => api.get(`/requests/${id}`),
  create: (data: FormData) => api.post('/requests', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  approve: (id: string) => api.put(`/requests/${id}/approve`, {}),
  reject: (id: string, remarks: string) => api.put(`/requests/${id}/reject`, { remarks }),
  release: (id: string) => api.put(`/requests/${id}/release`, {}),
};

export const certificateService = {
  getTypes: () => api.get('/certificate-types'),
  create: (data: any) => api.post('/certificate-types', data),
  update: (id: string, data: any) => api.put(`/certificate-types/${id}`, data),
  delete: (id: string) => api.delete(`/certificate-types/${id}`),
};

export const certificateDocService = {
  getByRequestId: (requestId: string) => api.get(`/certificates/request/${requestId}`),
  updateByRequestId: (requestId: string, content: string) => api.put(`/certificates/request/${requestId}`, { content }),
  downloadPdfByRequestId: (requestId: string) => api.get(`/certificates/request/${requestId}/download`, { responseType: 'blob' }),
  downloadDocxByRequestId: (requestId: string) =>
    api.get(`/certificates/request/${requestId}/download-docx`, { responseType: 'blob' }),
  uploadDocxByRequestId: (requestId: string, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post(`/certificates/request/${requestId}/upload-docx`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const userService = {
  getResidents: () => api.get('/users'),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
};

export default api;
