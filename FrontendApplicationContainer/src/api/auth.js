import api from './axios';

// PUBLIC_INTERFACE
/** Perform login and obtain JWT token. Returns: { token, user, expiresIn } */
export const login = async ({ email, password }) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

// PUBLIC_INTERFACE
/** Register a new user. Returns: { user, message } */
export const register = async (payload) => {
  const { data } = await api.post('/auth/register', payload);
  return data;
};

// PUBLIC_INTERFACE
/** Retrieve current user profile. Returns: { user } */
export const getCurrentUser = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

// PUBLIC_INTERFACE
/** Refresh token. Returns: { token, expiresIn } */
export const refresh = async () => {
  const { data } = await api.post('/auth/refresh');
  return data;
};

// PUBLIC_INTERFACE
/** Logout: invalidate server session if supported. */
export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch {
    // ignore
  } finally {
    localStorage.removeItem('token');
  }
};
