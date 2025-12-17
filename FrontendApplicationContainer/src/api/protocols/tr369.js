import api, { isMockMode } from '../client';

/**
 * TR-369/USP Protocol API module
 * Handles TR-369 User Services Platform operations
 */

// PUBLIC_INTERFACE
export async function tr369Get({ deviceId, paths }) {
  /**
   * TR-369 GET operation
   * @param {Object} params - TR-369 GET parameters
   * @param {string} params.deviceId - Target device ID
   * @param {string[]} params.paths - Array of parameter paths
   * @returns {Promise<Object>} GET response with parameter values
   */
  if (isMockMode()) {
    return {
      success: true,
      results: paths.map(path => ({
        path,
        value: 'mock-value',
        type: 'string',
      })),
      timestamp: new Date().toISOString(),
    };
  }
  const { data } = await api.post('/protocols/tr369/get', {
    deviceId,
    paths,
  });
  return data;
}

// PUBLIC_INTERFACE
export async function tr369Set({ deviceId, parameters }) {
  /**
   * TR-369 SET operation
   * @param {Object} params - TR-369 SET parameters
   * @param {string} params.deviceId - Target device ID
   * @param {Array<{path, value, required}>} params.parameters - Parameters to set
   * @returns {Promise<Object>} SET response
   */
  if (isMockMode()) {
    return {
      success: true,
      results: parameters.map(p => ({
        path: p.path,
        status: 'success',
        previousValue: 'old-value',
        newValue: p.value,
      })),
      timestamp: new Date().toISOString(),
    };
  }
  const { data } = await api.post('/protocols/tr369/set', {
    deviceId,
    parameters,
  });
  return data;
}

// PUBLIC_INTERFACE
export async function tr369Add({ deviceId, path, parameters }) {
  /**
   * TR-369 ADD operation (create object instance)
   * @param {Object} params - TR-369 ADD parameters
   * @param {string} params.deviceId - Target device ID
   * @param {string} params.path - Object path to add instance to
   * @param {Object} params.parameters - Initial parameter values
   * @returns {Promise<Object>} ADD response with new instance path
   */
  if (isMockMode()) {
    return {
      success: true,
      path,
      instancePath: `${path}${Date.now()}.`,
      timestamp: new Date().toISOString(),
    };
  }
  const { data } = await api.post('/protocols/tr369/add', {
    deviceId,
    path,
    parameters,
  });
  return data;
}

// PUBLIC_INTERFACE
export async function tr369Delete({ deviceId, paths }) {
  /**
   * TR-369 DELETE operation (remove object instance)
   * @param {Object} params - TR-369 DELETE parameters
   * @param {string} params.deviceId - Target device ID
   * @param {string[]} params.paths - Paths to delete
   * @returns {Promise<Object>} DELETE response
   */
  if (isMockMode()) {
    return {
      success: true,
      results: paths.map(path => ({
        path,
        status: 'deleted',
      })),
      timestamp: new Date().toISOString(),
    };
  }
  const { data } = await api.post('/protocols/tr369/delete', {
    deviceId,
    paths,
  });
  return data;
}

// PUBLIC_INTERFACE
export async function tr369Operate({ deviceId, command, commandKey, inputArgs = {} }) {
  /**
   * TR-369 OPERATE operation (execute command)
   * @param {Object} params - TR-369 OPERATE parameters
   * @param {string} params.deviceId - Target device ID
   * @param {string} params.command - Command path (e.g., 'Device.Reboot()')
   * @param {string} params.commandKey - Unique command identifier
   * @param {Object} params.inputArgs - Command arguments
   * @returns {Promise<Object>} OPERATE response
   */
  if (isMockMode()) {
    return {
      success: true,
      command,
      commandKey,
      status: 'completed',
      outputArgs: {},
      timestamp: new Date().toISOString(),
    };
  }
  const { data } = await api.post('/protocols/tr369/operate', {
    deviceId,
    command,
    commandKey,
    inputArgs,
  });
  return data;
}

// PUBLIC_INTERFACE
export async function tr369GetSupportedDM({ deviceId, paths, firstLevelOnly = false }) {
  /**
   * TR-369 GET SUPPORTED DM operation (get data model info)
   * @param {Object} params - TR-369 GET SUPPORTED DM parameters
   * @param {string} params.deviceId - Target device ID
   * @param {string[]} params.paths - Paths to query
   * @param {boolean} params.firstLevelOnly - Only immediate children
   * @returns {Promise<Object>} Supported data model information
   */
  if (isMockMode()) {
    return {
      success: true,
      results: paths.map(path => ({
        path,
        access: 'readWrite',
        type: 'parameter',
        valueType: 'string',
      })),
      timestamp: new Date().toISOString(),
    };
  }
  const { data } = await api.post('/protocols/tr369/get-supported-dm', {
    deviceId,
    paths,
    firstLevelOnly,
  });
  return data;
}

// PUBLIC_INTERFACE
export async function tr369GetInstances({ deviceId, path, firstLevelOnly = false }) {
  /**
   * TR-369 GET INSTANCES operation
   * @param {Object} params - TR-369 GET INSTANCES parameters
   * @param {string} params.deviceId - Target device ID
   * @param {string} params.path - Multi-instance object path
   * @param {boolean} params.firstLevelOnly - Only immediate children
   * @returns {Promise<Object>} Instance information
   */
  if (isMockMode()) {
    return {
      success: true,
      path,
      instances: ['1', '2', '3'],
      timestamp: new Date().toISOString(),
    };
  }
  const { data } = await api.post('/protocols/tr369/get-instances', {
    deviceId,
    path,
    firstLevelOnly,
  });
  return data;
}
