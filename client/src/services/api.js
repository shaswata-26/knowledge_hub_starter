import axios from 'axios';

// CORRECT: API_BASE_URL should be a string, not an axios instance
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://knowledge-hub-starter.onrender.com/api';

const API = axios.create({
  baseURL: API_BASE_URL, // Now this is correct
  timeout: 15000, // 15 second timeout
});

// Add auth token to requests - This should be FIRST interceptor
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('Retrieved token:', token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('API Request:', config.method?.toUpperCase(), config.url);
  return config;
}, (error) => {
  console.error('Request error:', error);
  return Promise.reject(error);
});

// Response interceptor
API.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      url: error.config?.url
    });
    
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Cannot connect to server. Please check your connection.');
    } else if (error.response?.status === 0) {
      throw new Error('Network error. Please try again.');
    } else if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

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

export default API;