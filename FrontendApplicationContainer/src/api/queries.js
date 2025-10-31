import api from './axios';

// PUBLIC_INTERFACE
/**
 * Get query history with pagination
 * Returns: { items, page, pageSize, totalPages, totalItems, hasNext, hasPrevious }
 */
export const getHistory = async (page = 1, pageSize = 50, sort) => {
  const params = { page, pageSize };
  if (sort) params.sort = sort;
  const { data } = await api.get('/queries/history', { params });
  return data;
};

// PUBLIC_INTERFACE
/** Get query details. Returns: { query } */
export const getQueryDetails = async (id) => {
  const { data } = await api.get(`/queries/${id}`);
  return data;
};

// PUBLIC_INTERFACE
/** Toggle favorite. Returns: { id, favorite } */
export const toggleFavorite = async (id, favorite) => {
  const { data } = await api.post(`/queries/${id}/favorite`, { favorite });
  return data;
};

// PUBLIC_INTERFACE
// Favorites CRUD used in slices
export const listFavorites = async (params = {}) => {
  const { data } = await api.get('/queries/favorites', { params });
  return data;
};
export const createFavorite = async (payload) => {
  const { data } = await api.post('/queries/favorites', payload);
  return data;
};
export const getFavorite = async (favoriteId) => {
  const { data } = await api.get(`/queries/favorites/${favoriteId}`);
  return data;
};
export const deleteFavorite = async (favoriteId) => {
  const { data } = await api.delete(`/queries/favorites/${favoriteId}`);
  return data;
};
export const updateFavorite = async (favoriteId, payload) => {
  const { data } = await api.put(`/queries/favorites/${favoriteId}`, payload);
  return data;
};
export const starQuery = async (jobId, payload = {}) => {
  const { data } = await api.post(`/queries/${jobId}/star`, payload);
  return data;
};
export const unstarQuery = async (jobId) => {
  const { data } = await api.delete(`/queries/${jobId}/star`);
  return data;
};
