import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});
// Add auth token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Documents API
export const fetchDocuments = (page = 1, limit = 10, search = '', tag = '') => {
  const params = new URLSearchParams({ page, limit });
  if (search) params.append('search', search);
  if (tag) params.append('tag', tag);
  
  return API.get(`/documents?${params}`);
};

export const fetchDocument = (id) => {
  return API.get(`/documents/${id}`);
};

export const createDocument = (document) => {
  return API.post('/documents', document);
};

export const updateDocument = (id, document) => {
  return API.put(`/documents/${id}`, document);
};

export const deleteDocument = (id) => {
  return API.delete(`/documents/${id}`);
};

export const generateSummary = (id) => {
  return API.post(`/documents/${id}/summary`);
};

export const generateTags = (id) => {
  return API.post(`/documents/${id}/tags`);
};

export const searchDocuments = (query, semantic = false) => {
  return API.post('/documents/search/query', { query, semantic });
};

export const answerQuestion = (question) => {
  return API.post('/documents/qa/answer', { question });
};

export const getRecentActivity = (limit = 5) => {
  return API.get(`/documents/activity/recent?limit=${limit}`);
};

// Auth API
export const login = (credentials) => {
  return API.post('/auth/login', credentials);
};

export const register = (userData) => {
  return API.post('/auth/register', userData);
};

export const getProfile = () => {
  return API.get('/auth/profile');
};