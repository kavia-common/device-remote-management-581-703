import axios from 'axios';
import store from '../store';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const API_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT || '30000', 10);

// PUBLIC_INTERFACE
/**
 * Configured axios instance with JWT interceptors
 * Automatically adds authentication token to requests and handles token refresh
 * Also injects X-Tenant-Id header when currentTenant is set
 */
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token and tenant header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Inject X-Tenant-Id header if currentTenant is set
    const state = store.getState();
    const currentTenant = state.auth?.currentTenant;
    if (currentTenant) {
      config.headers['X-Tenant-Id'] = currentTenant;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried, clear token and redirect to login
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
