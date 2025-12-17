import api, { isMockMode } from '../client';

/**
 * WebPA Protocol API module
 * Handles WebPA parameter operations
 */

// PUBLIC_INTERFACE
export async function webpaGetParameter({ deviceId, parameter }) {
  /**
   * Get WebPA parameter value
   * @param {Object} params - WebPA GET parameters
   * @param {string} params.deviceId - Target device ID
   * @param {string} params.parameter - Parameter name (e.g., 'Device.WiFi.SSID.1.SSID')
   * @returns {Promise<Object>} Parameter value and metadata
   */
  if (isMockMode()) {
    return {
      success: true,
      parameter,
      value: 'MyWiFiNetwork',
      dataType: 'string',
      timestamp: new Date().toISOString(),
    };
  }
  const { data } = await api.post('/protocols/webpa/get', {
    deviceId,
    parameter,
  });
  return data;
}

// PUBLIC_INTERFACE
export async function webpaSetParameter({ deviceId, parameter, value, dataType = 'string' }) {
  /**
   * Set WebPA parameter value
   * @param {Object} params - WebPA SET parameters
   * @param {string} params.deviceId - Target device ID
   * @param {string} params.parameter - Parameter name
   * @param {any} params.value - Value to set
   * @param {string} params.dataType - Data type (string, int, boolean, etc.)
   * @returns {Promise<Object>} Set operation result
   */
  if (isMockMode()) {
    return {
      success: true,
      parameter,
      previousValue: 'OldValue',
      newValue: value,
      timestamp: new Date().toISOString(),
    };
  }
  const { data } = await api.post('/protocols/webpa/set', {
    deviceId,
    parameter,
    value,
    dataType,
  });
  return data;
}

// PUBLIC_INTERFACE
export async function webpaGetAttributes({ deviceId, parameter }) {
  /**
   * Get WebPA parameter attributes
   * @param {Object} params - WebPA GET ATTRIBUTES parameters
   * @param {string} params.deviceId - Target device ID
   * @param {string} params.parameter - Parameter name
   * @returns {Promise<Object>} Parameter attributes
   */
  if (isMockMode()) {
    return {
      success: true,
      parameter,
      attributes: {
        notify: 1,
        accessControlList: 'rw',
      },
      timestamp: new Date().toISOString(),
    };
  }
  const { data } = await api.post('/protocols/webpa/get-attributes', {
    deviceId,
    parameter,
  });
  return data;
}

// PUBLIC_INTERFACE
export async function webpaSetAttributes({ deviceId, parameter, attributes }) {
  /**
   * Set WebPA parameter attributes
   * @param {Object} params - WebPA SET ATTRIBUTES parameters
   * @param {string} params.deviceId - Target device ID
   * @param {string} params.parameter - Parameter name
   * @param {Object} params.attributes - Attributes to set (notify, accessControlList)
   * @returns {Promise<Object>} Set attributes result
   */
  if (isMockMode()) {
    return {
      success: true,
      parameter,
      attributes,
      timestamp: new Date().toISOString(),
    };
  }
  const { data } = await api.post('/protocols/webpa/set-attributes', {
    deviceId,
    parameter,
    attributes,
  });
  return data;
}

// PUBLIC_INTERFACE
export async function webpaGetParameterNames({ deviceId, path, nextLevel = false }) {
  /**
   * Get WebPA parameter names under a given path
   * @param {Object} params - WebPA GET PARAMETER NAMES parameters
   * @param {string} params.deviceId - Target device ID
   * @param {string} params.path - Parameter path
   * @param {boolean} params.nextLevel - If true, only return immediate children
   * @returns {Promise<Object>} List of parameter names
   */
  if (isMockMode()) {
    return {
      success: true,
      path,
      parameters: [
        'Device.WiFi.SSID.1.SSID',
        'Device.WiFi.SSID.1.Enable',
        'Device.WiFi.Radio.1.Channel',
      ],
      timestamp: new Date().toISOString(),
    };
  }
  const { data } = await api.post('/protocols/webpa/get-parameter-names', {
    deviceId,
    path,
    nextLevel,
  });
  return data;
}
