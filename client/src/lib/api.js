import axios from 'axios';

// Create axios instance with correct baseURL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
});

// Set/remove authentication token
export function setToken(t) {
  if (t) {
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    // Also store in localStorage for persistence
    localStorage.setItem('token', t);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
}

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('Making API request to:', config.url);
    console.log('Request data:', config.data);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging and error handling
api.interceptors.response.use(
  (response) => {
    console.log('API response received:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API response error:', error);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Token expired or invalid
      setToken(null);
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Try to get token from localStorage on startup
const token = localStorage.getItem('token');
if (token) {
  setToken(token);
}

export default api;