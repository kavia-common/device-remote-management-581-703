import api from './axios';

// PUBLIC_INTERFACE
/**
 * Search devices with pagination.
 * Returns: { items, page, pageSize, totalPages, totalItems, hasNext, hasPrevious }
 */
export const getDevices = async (params = {}) => {
  const { data } = await api.get('/devices', { params });
  return data;
};

// PUBLIC_INTERFACE
/** Get device details. Returns: { device } */
export const getDevice = async (id) => {
  const { data } = await api.get(`/devices/${id}`);
  return data;
};

// PUBLIC_INTERFACE
/** Cancel an ongoing job by jobId. Returns backend cancel response. */
export const cancelJob = async (jobId) => {
  const { data } = await api.post(`/jobs/${jobId}/cancel`);
  return data;
};

// PUBLIC_INTERFACE
/** Stats helper if backend supports it. */
export const getDeviceStats = async () => {
  const { data } = await api.get('/devices/stats');
  return data;
};

// PUBLIC_INTERFACE
/** CRUD helpers if needed by UI (kept for compatibility) */
export const createDevice = async (deviceData) => {
  const { data } = await api.post('/devices', deviceData);
  return data;
};
export const updateDevice = async (deviceId, deviceData) => {
  const { data } = await api.put(`/devices/${deviceId}`, deviceData);
  return data;
};
export const deleteDevice = async (deviceId) => {
  const { data } = await api.delete(`/devices/${deviceId}`);
  return data;
};
