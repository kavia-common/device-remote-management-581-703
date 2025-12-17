import axios from 'axios';
import { store } from './storeRef';
import { showSnackbar } from '../store/uiSlice';
import { logout, loginSuccess } from '../store/authSlice';
import { refreshAccessToken } from './auth';

/**
 * Resolve API base: prefer REACT_APP_API_BASE, then REACT_APP_BACKEND_URL. If none, use mock mode.
 */
export function getApiBase() {
  const base = process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL || '';
  return base?.replace(/\/*$/, ''); // trim trailing slash
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

let isRefreshing = false;
let pendingQueue = [];

/**
 * Process queued requests after refresh completes.
 */
function processQueue(error, token = null) {
  pendingQueue.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error);
    } else {
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      resolve(api(config));
    }
  });
  pendingQueue = [];
}

api.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    const { response, config } = error || {};
    const originalRequest = config || {};
    const status = response?.status;

    // Only try refresh for 401 responses on real API and not for login/refresh endpoints themselves
    const refreshPath = process.env.REACT_APP_AUTH_REFRESH_PATH;
    const loginPath = process.env.REACT_APP_AUTH_LOGIN_PATH || '/auth/login';
    const isAuthEndpoint = !!originalRequest?.url && (
      originalRequest.url.includes(loginPath) ||
      (refreshPath && originalRequest.url.includes(refreshPath))
    );

    if (!isMockMode() && status === 401 && !isAuthEndpoint && refreshPath) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshed = await refreshAccessToken();
          if (refreshed?.token) {
            // update store
            store.dispatch(loginSuccess({ token: refreshed.token, refreshToken: refreshed.refreshToken }));
            processQueue(null, refreshed.token);
            // retry original
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${refreshed.token}`;
            return api(originalRequest);
          }
          // no token from refresh -> logout
          store.dispatch(logout());
        } catch (err) {
          processQueue(err, null);
          store.dispatch(logout());
        } finally {
          isRefreshing = false;
        }
      }

      // queue requests while refreshing
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject, config: originalRequest });
      });
    }

    const message = response?.data?.error?.message || error.message || 'Request failed';
    store.dispatch(showSnackbar({ message, severity: 'error' }));
    return Promise.reject(error);
  }
);

export default api;
