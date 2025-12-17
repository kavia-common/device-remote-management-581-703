import axios from 'axios';
import { store } from './storeRef';
import { showSnackbar } from '../store/uiSlice';

/**
 * Resolve API base: prefer REACT_APP_API_BASE, then REACT_APP_BACKEND_URL. If none, use mock mode.
 */
export function getApiBase() {
  const base = process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL || '';
  return base?.replace(/\/+$/, ''); // trim trailing slash
}

// PUBLIC_INTERFACE
export function isMockMode() {
  return !getApiBase();
}

// Create axios instance if real API is present
const api = axios.create({
  baseURL: getApiBase() || undefined,
});

// Attach interceptors
api.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state?.auth?.token;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (resp) => resp,
  (error) => {
    const message = error?.response?.data?.error?.message || error.message || 'Request failed';
    store.dispatch(showSnackbar({ message, severity: 'error' }));
    return Promise.reject(error);
  }
);

export default api;
