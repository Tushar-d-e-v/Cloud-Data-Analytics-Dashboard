import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  try {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (error) {
    // Ignore localStorage errors during SSR
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (email: string, password: string) =>
    api.post('/auth/register', { email, password }),
  getProfile: () => api.get('/auth/profile'),
};

// Dataset API
export const datasetAPI = {
  upload: (formData: FormData) =>
    api.post('/datasets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAll: () => api.get('/datasets'),
  getById: (id: string) => api.get(`/datasets/${id}`),
  delete: (id: string) => api.delete(`/datasets/${id}`),
  reprocess: (id: string) => api.post(`/datasets/${id}/reprocess`),
};

// Analytics API
export const analyticsAPI = {
  run: (datasetId: string, metric: string) =>
    api.post('/analytics/run', { datasetId, metric }),
  get: (datasetId: string, metric: string) =>
    api.get(`/analytics/${datasetId}?metric=${metric}`),
  getMetrics: (datasetId: string) =>
    api.get(`/analytics/${datasetId}/metrics`),
  invalidateCache: (datasetId: string) =>
    api.delete(`/analytics/${datasetId}/cache`),
};

// Reports API
export const reportsAPI = {
  generate: (datasetId: string, metrics: string[]) =>
    api.post('/reports/generate', { datasetId, metrics }),
  getInsights: (datasetId: string, metric: string) =>
    api.get(`/reports/${datasetId}/insights?metric=${metric}`),
};

export default api;