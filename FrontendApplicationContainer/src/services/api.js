import axios from 'axios';
import { store } from '../store/store';
import { logout, refreshTokenAsync } from '../store/slices/authSlice';

// Get API base URL from environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        await store.dispatch(refreshTokenAsync());
        const newToken = store.getState().auth.token;
        
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        store.dispatch(logout());
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // If not a 401 or refresh failed, redirect to login for 401s
    if (error.response?.status === 401) {
      store.dispatch(logout());
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authApi = {
  // PUBLIC_INTERFACE
  login: (username, password) =>
    api.post('/auth/login', { username, password }),
  
  // PUBLIC_INTERFACE
  logout: () => api.post('/auth/logout'),
  
  // PUBLIC_INTERFACE
  refreshToken: () => {
    const refreshToken = localStorage.getItem('refreshToken');
    return api.post('/auth/refresh', { refreshToken });
  },
  
  // PUBLIC_INTERFACE
  getCurrentUser: () => api.get('/auth/me'),
};

// Health check API
export const healthApi = {
  // PUBLIC_INTERFACE
  getHealth: () => api.get('/health'),
};

// Device API endpoints
export const deviceApi = {
  // PUBLIC_INTERFACE
  getDevices: (params) => api.get('/devices', { params }),
  
  // PUBLIC_INTERFACE
  getDevice: (id) => api.get(`/devices/${id}`),
  
  // PUBLIC_INTERFACE
  createDevice: (data) => api.post('/devices', data),
  
  // PUBLIC_INTERFACE
  updateDevice: (id, data) => api.put(`/devices/${id}`, data),
  
  // PUBLIC_INTERFACE
  deleteDevice: (id) => api.delete(`/devices/${id}`),
};

// Protocol API endpoints
export const protocolApi = {
  // PUBLIC_INTERFACE
  getSnmpData: (deviceId, oid) => api.get(`/protocols/snmp/${deviceId}`, { params: { oid } }),
  
  // PUBLIC_INTERFACE
  getWebpaData: (deviceId, parameter) => api.get(`/protocols/webpa/${deviceId}`, { params: { parameter } }),
  
  // PUBLIC_INTERFACE
  getTr69Data: (deviceId, parameter) => api.get(`/protocols/tr69/${deviceId}`, { params: { parameter } }),
  
  // PUBLIC_INTERFACE
  getTr369Data: (deviceId, parameter) => api.get(`/protocols/tr369/${deviceId}`, { params: { parameter } }),
};

// Query history API
export const historyApi = {
  // PUBLIC_INTERFACE
  getQueryHistory: (params) => api.get('/query-history', { params }),
  
  // PUBLIC_INTERFACE
  deleteQueryHistory: (id) => api.delete(`/query-history/${id}`),
};

// Settings API
export const settingsApi = {
  // PUBLIC_INTERFACE
  getUserSettings: () => api.get('/user/settings'),
  
  // PUBLIC_INTERFACE
  updateUserSettings: (data) => api.put('/user/settings', data),
};

export default api;
