import api, { isMockMode } from './client';
import { mockListDevices } from './mockApi';

/**
 * Devices API module
 * Handles device listing, details, create, update operations
 */

// PUBLIC_INTERFACE
export async function listDevices({ page = 1, pageSize = 10, sort, filter } = {}) {
  /**
   * List devices with pagination, sorting, and filtering
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (1-indexed)
   * @param {number} options.pageSize - Items per page
   * @param {string} options.sort - Sort field and direction (e.g., 'name:asc')
   * @param {Object} options.filter - Filter criteria
   * @returns {Promise<{page, pageSize, totalPages, totalItems, hasNext, hasPrevious, items}>}
   */
  if (isMockMode()) {
    return mockListDevices({ page, pageSize, sort, filter });
  }
  const params = { page, pageSize };
  if (sort) params.sort = sort;
  if (filter) params.filter = JSON.stringify(filter);
  
  const { data } = await api.get('/devices', { params });
  return data;
}

// PUBLIC_INTERFACE
export async function getDeviceById(deviceId) {
  /**
   * Get device details by ID
   * @param {string} deviceId - Device ID
   * @returns {Promise<Object>} Device details
   */
  if (isMockMode()) {
    // Mock implementation
    return {
      id: deviceId,
      name: `Device-${deviceId}`,
      ip: '192.168.1.100',
      protocol: 'SNMP',
      status: 'Online',
      createdAt: new Date().toISOString(),
      details: {
        model: 'Router-X1000',
        firmware: '1.2.3',
        uptime: '30d 12h',
      }
    };
  }
  const { data } = await api.get(`/devices/${deviceId}`);
  return data;
}

// PUBLIC_INTERFACE
export async function createDevice(deviceData) {
  /**
   * Create a new device
   * @param {Object} deviceData - Device creation data
   * @returns {Promise<Object>} Created device
   */
  if (isMockMode()) {
    return { ...deviceData, id: `dev-${Date.now()}`, createdAt: new Date().toISOString() };
  }
  const { data } = await api.post('/devices', deviceData);
  return data;
}

// PUBLIC_INTERFACE
export async function updateDevice(deviceId, deviceData) {
  /**
   * Update device by ID
   * @param {string} deviceId - Device ID
   * @param {Object} deviceData - Device update data
   * @returns {Promise<Object>} Updated device
   */
  if (isMockMode()) {
    return { ...deviceData, id: deviceId, updatedAt: new Date().toISOString() };
  }
  const { data } = await api.put(`/devices/${deviceId}`, deviceData);
  return data;
}

// PUBLIC_INTERFACE
export async function deleteDevice(deviceId) {
  /**
   * Delete device by ID
   * @param {string} deviceId - Device ID
   * @returns {Promise<void>}
   */
  if (isMockMode()) {
    return { success: true, message: 'Device deleted (mock)' };
  }
  const { data } = await api.delete(`/devices/${deviceId}`);
  return data;
}
