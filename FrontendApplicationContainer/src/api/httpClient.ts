import axios from 'axios';
import { getApiBaseUrl } from './config';
import type { RootState } from '../store';
import { store } from '../store';
import { logout, setAccessToken } from '../store/slices/authSlice';

const http = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
});

// Attach Authorization header if token exists
http.interceptors.request.use((config) => {
  const state: RootState = store.getState();
  const token = state.auth.accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 with a simple refresh placeholder
let isRefreshing = false;
let pendingRequests: Array<() => void> = [];

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config ?? {};

    if (error?.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue pending requests until refresh is done
        await new Promise<void>((resolve) => {
          pendingRequests.push(resolve);
        });
        return http(originalRequest);
      }

      isRefreshing = true;
      try {
        // Placeholder refresh logic; integrate backend refresh endpoint here.
        const state = store.getState();
        const refreshToken = state.auth.refreshToken;

        if (!refreshToken) {
          // No refresh token, perform logout
          store.dispatch(logout());
          return Promise.reject(error);
        }

        // TODO: Replace with real refresh endpoint call.
        // const { data } = await axios.post(`${getApiBaseUrl()}/auth/refresh`, { refreshToken });
        // const newAccessToken = data?.accessToken as string;

        // Temporary: reuse existing token (no-op) to proceed for now.
        const newAccessToken = state.auth.accessToken;

        if (newAccessToken) {
          store.dispatch(setAccessToken(newAccessToken));
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          pendingRequests.forEach((resolve) => resolve());
          pendingRequests = [];
          return http(originalRequest);
        } else {
          store.dispatch(logout());
          return Promise.reject(error);
        }
      } catch (e) {
        store.dispatch(logout());
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    // For other 401s (e.g., if already retried), perform logout as a safeguard
    if (error?.response?.status === 401) {
      store.dispatch(logout());
    }

    return Promise.reject(error);
  }
);

export default http;
