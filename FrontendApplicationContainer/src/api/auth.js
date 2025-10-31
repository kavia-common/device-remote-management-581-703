import axiosInstance from './axios';

// PUBLIC_INTERFACE
/**
 * User login
 * @param {Object} credentials - User credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<Object>} Login response with token and user data
 */
export const login = async (credentials) => {
  const response = await axiosInstance.post('/auth/login', credentials);
  return response.data;
};

// PUBLIC_INTERFACE
/**
 * User registration
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @param {string} userData.name - User full name
 * @returns {Promise<Object>} Registration response
 */
export const register = async (userData) => {
  const response = await axiosInstance.post('/auth/register', userData);
  return response.data;
};

// PUBLIC_INTERFACE
/**
 * User logout
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    await axiosInstance.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// PUBLIC_INTERFACE
/**
 * Get current user profile
 * @returns {Promise<Object>} User profile data
 */
export const getCurrentUser = async () => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
};
