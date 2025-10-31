import axiosInstance from './axios';

// PUBLIC_INTERFACE
/**
 * Get all devices for current user
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.pageSize - Items per page
 * @param {string} params.sort - Sort field and direction
 * @returns {Promise<Object>} Paginated device list
 */
export const getDevices = async (params = {}) => {
  const response = await axiosInstance.get('/devices', { params });
  return response.data;
};

// PUBLIC_INTERFACE
/**
 * Get device by ID
 * @param {string} deviceId - Device ID
 * @returns {Promise<Object>} Device details
 */
export const getDevice = async (deviceId) => {
  const response = await axiosInstance.get(`/devices/${deviceId}`);
  return response.data;
};

// PUBLIC_INTERFACE
/**
 * Create new device
 * @param {Object} deviceData - Device data
 * @returns {Promise<Object>} Created device
 */
export const createDevice = async (deviceData) => {
  const response = await axiosInstance.post('/devices', deviceData);
  return response.data;
};

// PUBLIC_INTERFACE
/**
 * Update device
 * @param {string} deviceId - Device ID
 * @param {Object} deviceData - Updated device data
 * @returns {Promise<Object>} Updated device
 */
export const updateDevice = async (deviceId, deviceData) => {
  const response = await axiosInstance.put(`/devices/${deviceId}`, deviceData);
  return response.data;
};

// PUBLIC_INTERFACE
/**
 * Delete device
 * @param {string} deviceId - Device ID
 * @returns {Promise<void>}
 */
export const deleteDevice = async (deviceId) => {
  const response = await axiosInstance.delete(`/devices/${deviceId}`);
  return response.data;
};

// PUBLIC_INTERFACE
/**
 * Get device statistics
 * @returns {Promise<Object>} Device statistics
 */
export const getDeviceStats = async () => {
  const response = await axiosInstance.get('/devices/stats');
  return response.data;
};
