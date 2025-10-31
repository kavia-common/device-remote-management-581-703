import axios from 'axios';
import store from '../store/slices/../index';
import { logoutUser } from '../store/slices/authSlice';

// PUBLIC_INTERFACE
/**
 * Central axios instance for API calls.
 * - baseURL: from REACT_APP_API_URL (defaults to /api)
 * - timeout: from REACT_APP_API_TIMEOUT (ms) default 10000
 * - Authorization: Bearer <token> if present
 * - X-Tenant-Id: if present
 * - 401 handling: dispatch logout
 * - Normalizes errors to { error: { code, message, details?, timestamp, path?, status? } }
 */
const baseURL = process.env.REACT_APP_API_URL || '/api';
const timeoutEnv = Number(process.env.REACT_APP_API_TIMEOUT || 10000);
const timeout = Number.isFinite(timeoutEnv) ? timeoutEnv : 10000;

const instance = axios.create({
  baseURL,
  timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(
  (config) => {
    const state = store.getState ? store.getState() : {};
    const token = state?.auth?.token || localStorage.getItem('token');
    const tenantId = state?.auth?.currentTenant || localStorage.getItem('tenantId') || localStorage.getItem('currentTenant');

    config.headers = config.headers || {};
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (tenantId) {
      config.headers['X-Tenant-Id'] = tenantId;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      try {
        store.dispatch(logoutUser());
      } catch (_) {
        localStorage.removeItem('token');
        localStorage.removeItem('tenantId');
        localStorage.removeItem('currentTenant');
      }
    }
    const normalized = {
      error: {
        code:
          error?.response?.data?.error?.code ||
          `HTTP_${status || 'NETWORK'}`,
        message:
          error?.response?.data?.error?.message ||
          error?.message ||
          'Request failed',
        details: error?.response?.data?.error?.details,
        timestamp:
          error?.response?.data?.error?.timestamp ||
          new Date().toISOString(),
        path:
          error?.response?.data?.error?.path ||
          error?.config?.url ||
          undefined,
        status,
      },
    };
    return Promise.reject(normalized);
  }
);

export default instance;
