import api, { isMockMode } from '../client';

/**
 * TR-069 Protocol API module
 * Handles TR-069/ACS operations
 */

// PUBLIC_INTERFACE
export async function tr069GetParameterValues({ deviceId, parameters }) {
  /**
   * Get TR-069 parameter values
   * @param {Object} params - TR-069 GET parameters
   * @param {string} params.deviceId - Target device ID
   * @param {string[]} params.parameters - Array of parameter names
   * @returns {Promise<Object>} Parameter values
   */
  if (isMockMode()) {
    return {
      success: true,
      parameters: parameters.map(p => ({
        name: p,
        value: 'mock-value',
        type: 'string',
      })),
      timestamp: new Date().toISOString(),
    };
  }
  const { data } = await api.post('/protocols/tr069/get-parameter-values', {
    deviceId,
    parameters,
  });
  return data;
}

// PUBLIC_INTERFACE
export async function tr069SetParameterValues({ deviceId, parameters }) {
  /**
   * Set TR-069 parameter values
   * @param {Object} params - TR-069 SET parameters
   * @param {string} params.deviceId - Target device ID
   * @param {Array<{name, value, type}>} params.parameters - Parameters to set
   * @returns {Promise<Object>} Set operation result
   */
  if (isMockMode()) {
    return {
      success: true,
      status: 'completed',
      parameters: parameters.map(p => ({
        name: p.name,
        previousValue: 'old-value',
        newValue: p.value,
      })),
      timestamp: new Date().toISOString(),
    };
  }
  const { data } = await api.post('/protocols/tr069/set-parameter-values', {
    deviceId,
    parameters,
  });
  return data;
}

// PUBLIC_INTERFACE
export async function tr069GetParameterNames({ deviceId, path, nextLevel = false }) {
  /**
   * Get TR-069 parameter names
   * @param {Object} params - TR-069 GET PARAMETER NAMES parameters
   * @param {string} params.deviceId - Target device ID
   * @param {string} params.path - Parameter path
   * @param {boolean} params.nextLevel - Only immediate children if true
   * @returns {Promise<Object>} Parameter names
   */
  if (isMockMode()) {
    return {
      success: true,
      path,
      parameters: [
        { name: 'InternetGatewayDevice.DeviceInfo.Manufacturer', writable: false },
        { name: 'InternetGatewayDevice.DeviceInfo.ModelName', writable: false },
        { name: 'InternetGatewayDevice.ManagementServer.URL', writable: true },
      ],
      timestamp: new Date().toISOString(),
    };
  }
  const { data } = await api.post('/protocols/tr069/get-parameter-names', {
    deviceId,
    path,
    nextLevel,
  });
  return data;
}

// PUBLIC_INTERFACE
export async function tr069Reboot({ deviceId }) {
  /**
   * Reboot device via TR-069
   * @param {Object} params - TR-069 REBOOT parameters
   * @param {string} params.deviceId - Target device ID
   * @returns {Promise<Object>} Reboot task result
   */
  if (isMockMode()) {
    return {
      success: true,
      taskId: `task-${Date.now()}`,
      status: 'pending',
      message: 'Reboot task initiated (mock)',
      timestamp: new Date().toISOString(),
    };
  }
  const { data } = await api.post('/protocols/tr069/reboot', { deviceId });
  return data;
}

// PUBLIC_INTERFACE
export async function tr069FactoryReset({ deviceId }) {
  /**
   * Factory reset device via TR-069
   * @param {Object} params - TR-069 FACTORY RESET parameters
   * @param {string} params.deviceId - Target device ID
   * @returns {Promise<Object>} Factory reset task result
   */
  if (isMockMode()) {
    return {
      success: true,
      taskId: `task-${Date.now()}`,
      status: 'pending',
      message: 'Factory reset task initiated (mock)',
      timestamp: new Date().toISOString(),
    };
  }
  const { data } = await api.post('/protocols/tr069/factory-reset', { deviceId });
  return data;
}

// PUBLIC_INTERFACE
export async function tr069Download({ deviceId, fileType, url, username, password }) {
  /**
   * Trigger download (firmware, config) via TR-069
   * @param {Object} params - TR-069 DOWNLOAD parameters
   * @param {string} params.deviceId - Target device ID
   * @param {string} params.fileType - File type (1=Firmware, 3=VendorConfig)
   * @param {string} params.url - Download URL
   * @param {string} params.username - Optional username
   * @param {string} params.password - Optional password
   * @returns {Promise<Object>} Download task result
   */
  if (isMockMode()) {
    return {
      success: true,
      taskId: `task-${Date.now()}`,
      status: 'pending',
      message: 'Download task initiated (mock)',
      timestamp: new Date().toISOString(),
    };
  }
  const { data } = await api.post('/protocols/tr069/download', {
    deviceId,
    fileType,
    url,
    username,
    password,
  });
  return data;
}

// PUBLIC_INTERFACE
export async function tr069GetTaskStatus({ taskId }) {
  /**
   * Get TR-069 task status
   * @param {Object} params - Task status query
   * @param {string} params.taskId - Task ID
   * @returns {Promise<Object>} Task status
   */
  if (isMockMode()) {
    return {
      success: true,
      taskId,
      status: 'completed',
      progress: 100,
      message: 'Task completed (mock)',
      timestamp: new Date().toISOString(),
    };
  }
  const { data } = await api.get(`/protocols/tr069/tasks/${taskId}`);
  return data;
}
