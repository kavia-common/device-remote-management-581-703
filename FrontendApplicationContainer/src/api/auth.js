import api, { isMockMode } from './client';
import { mockLogin } from './mockApi';

const ACCESS_TOKEN_KEY = 'drm_jwt';
const REFRESH_TOKEN_KEY = 'drm_refresh';
const USER_KEY = 'drm_user';

function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch { /* noop */ }
}

function safeRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch { /* noop */ }
}

function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

// PUBLIC_INTERFACE
export function loadPersistedAuth() {
  /** Load persisted auth state from localStorage. */
  const token = safeGet(ACCESS_TOKEN_KEY);
  const refreshToken = safeGet(REFRESH_TOKEN_KEY);
  let user = null;
  try {
    const raw = safeGet(USER_KEY);
    user = raw ? JSON.parse(raw) : null;
  } catch { /* noop */ }
  return { token, refreshToken, user };
}

// PUBLIC_INTERFACE
export function persistAuth({ token, refreshToken, user }) {
  /** Persist tokens and user. */
  if (token) safeSet(ACCESS_TOKEN_KEY, token);
  if (refreshToken) safeSet(REFRESH_TOKEN_KEY, refreshToken);
  if (user) safeSet(USER_KEY, JSON.stringify(user));
}

// PUBLIC_INTERFACE
export function clearPersistedAuth() {
  /** Clear persisted auth state. */
  safeRemove(ACCESS_TOKEN_KEY);
  safeRemove(REFRESH_TOKEN_KEY);
  safeRemove(USER_KEY);
}

// PUBLIC_INTERFACE
export async function loginWithPassword({ email, password }) {
  /**
   * Perform login. If mock mode, fallback to mockLogin.
   * Expected backend response: { access_token | token, refresh_token?, user? }
   */
  if (isMockMode()) {
    const data = await mockLogin({ email, password });
    const token = data.token || data.access_token;
    const refreshToken = data.refresh_token || null;
    const user = data.user || { email };
    return { token, refreshToken, user };
  }
  const path = process.env.REACT_APP_AUTH_LOGIN_PATH || '/auth/login';
  const { data } = await api.post(path, { email, password });
  const token = data.token || data.access_token;
  const refreshToken = data.refresh_token || null;
  const user = data.user || { email };
  return { token, refreshToken, user };
}

// PUBLIC_INTERFACE
export async function refreshAccessToken() {
  /**
   * Try refresh token if REACT_APP_AUTH_REFRESH_PATH present and refresh token exists.
   * Expected response: { access_token | token, refresh_token? }
   */
  const refreshPath = process.env.REACT_APP_AUTH_REFRESH_PATH;
  if (!refreshPath) return null;
  const refreshToken = safeGet(REFRESH_TOKEN_KEY);
  if (!refreshToken) return null;

  const { data } = await api.post(refreshPath, { refresh_token: refreshToken });
  const token = data.token || data.access_token;
  const newRefresh = data.refresh_token || refreshToken;
  if (!token) return null;
  persistAuth({ token, refreshToken: newRefresh });
  return { token, refreshToken: newRefresh };
}
