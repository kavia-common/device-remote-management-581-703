import axiosInstance from './axios';

// Query Favorites Operations

// PUBLIC_INTERFACE
/**
 * Get list of favorite queries for current user
 * Requires 'queries:favorites:read' permission
 * @param {Object} params - Query parameters (pagination, filters)
 * @returns {Promise<Object>} Paginated list of favorite queries
 */
export const listFavorites = async (params = {}) => {
  const response = await axiosInstance.get('/queries/favorites', { params });
  return response.data;
};

// PUBLIC_INTERFACE
/**
 * Create a new favorite query
 * Requires 'queries:favorites:write' permission
 * @param {Object} data - Favorite query data
 * @param {string} data.name - Name of the favorite query
 * @param {string} data.protocol - Protocol type (SNMP, WebPA, TR69, TR369)
 * @param {string} data.operation - Operation type (GET, SET, etc.)
 * @param {Object} data.parameters - Query parameters (oids, parameters, paths, etc.)
 * @param {string} [data.description] - Optional description
 * @param {string} [data.deviceId] - Optional device ID
 * @returns {Promise<Object>} Created favorite query
 */
export const createFavorite = async (data) => {
  const response = await axiosInstance.post('/queries/favorites', data);
  return response.data;
};

// PUBLIC_INTERFACE
/**
 * Get a specific favorite query by ID
 * Requires 'queries:favorites:read' permission
 * @param {string} favoriteId - Favorite query ID
 * @returns {Promise<Object>} Favorite query details
 */
export const getFavorite = async (favoriteId) => {
  const response = await axiosInstance.get(`/queries/favorites/${favoriteId}`);
  return response.data;
};

// PUBLIC_INTERFACE
/**
 * Delete a favorite query
 * Requires 'queries:favorites:write' permission
 * @param {string} favoriteId - Favorite query ID to delete
 * @returns {Promise<Object>} Deletion result
 */
export const deleteFavorite = async (favoriteId) => {
  const response = await axiosInstance.delete(`/queries/favorites/${favoriteId}`);
  return response.data;
};

// PUBLIC_INTERFACE
/**
 * Update a favorite query
 * Requires 'queries:favorites:write' permission
 * @param {string} favoriteId - Favorite query ID
 * @param {Object} data - Updated favorite query data
 * @returns {Promise<Object>} Updated favorite query
 */
export const updateFavorite = async (favoriteId, data) => {
  const response = await axiosInstance.put(`/queries/favorites/${favoriteId}`, data);
  return response.data;
};

// Query History Star/Unstar Operations

// PUBLIC_INTERFACE
/**
 * Star (mark as favorite) a query from history
 * Requires 'queries:favorites:write' permission
 * Creates a favorite based on an existing query
 * @param {string} jobId - Job ID from query history
 * @param {Object} data - Additional metadata (name, description)
 * @returns {Promise<Object>} Created favorite
 */
export const starQuery = async (jobId, data = {}) => {
  const response = await axiosInstance.post(`/queries/${jobId}/star`, data);
  return response.data;
};

// PUBLIC_INTERFACE
/**
 * Unstar (remove favorite) a query
 * Requires 'queries:favorites:write' permission
 * @param {string} jobId - Job ID to unstar
 * @returns {Promise<Object>} Result of unstar operation
 */
export const unstarQuery = async (jobId) => {
  const response = await axiosInstance.delete(`/queries/${jobId}/star`);
  return response.data;
};
