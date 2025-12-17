import api, { isMockMode } from './client';

/**
 * Configuration API module
 * Handles MIB uploads, parameter management, and configuration templates
 */

// PUBLIC_INTERFACE
export async function uploadMIB({ file, deviceId, description }) {
  /**
   * Upload MIB file for SNMP operations
   * @param {Object} params - MIB upload parameters
   * @param {File} params.file - MIB file to upload
   * @param {string} params.deviceId - Optional device ID to associate with
   * @param {string} params.description - Optional description
   * @returns {Promise<Object>} Upload result
   */
  if (isMockMode()) {
    return {
      success: true,
      mibId: `mib-${Date.now()}`,
      filename: file.name,
      size: file.size,
      message: 'MIB uploaded successfully (mock)',
      timestamp: new Date().toISOString(),
    };
  }
  const formData = new FormData();
  formData.append('file', file);
  if (deviceId) formData.append('deviceId', deviceId);
  if (description) formData.append('description', description);

  const { data } = await api.post('/configuration/mib/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

// PUBLIC_INTERFACE
export async function listMIBs({ page = 1, pageSize = 10 } = {}) {
  /**
   * List uploaded MIBs
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.pageSize - Items per page
   * @returns {Promise<Object>} Paginated MIB list
   */
  if (isMockMode()) {
    return {
      page,
      pageSize,
      totalPages: 1,
      totalItems: 2,
      items: [
        { id: 'mib-1', filename: 'IF-MIB.txt', uploadedAt: new Date().toISOString() },
        { id: 'mib-2', filename: 'SNMPv2-MIB.txt', uploadedAt: new Date().toISOString() },
      ],
    };
  }
  const { data } = await api.get('/configuration/mib', { params: { page, pageSize } });
  return data;
}

// PUBLIC_INTERFACE
export async function deleteMIB(mibId) {
  /**
   * Delete MIB by ID
   * @param {string} mibId - MIB ID to delete
   * @returns {Promise<Object>} Deletion result
   */
  if (isMockMode()) {
    return {
      success: true,
      message: 'MIB deleted (mock)',
    };
  }
  const { data } = await api.delete(`/configuration/mib/${mibId}`);
  return data;
}

// PUBLIC_INTERFACE
export async function getParameterMetadata({ protocol, parameter }) {
  /**
   * Get parameter metadata (description, type, constraints)
   * @param {Object} params - Query parameters
   * @param {string} params.protocol - Protocol (snmp, webpa, tr069, tr369)
   * @param {string} params.parameter - Parameter name or OID
   * @returns {Promise<Object>} Parameter metadata
   */
  if (isMockMode()) {
    return {
      success: true,
      protocol,
      parameter,
      metadata: {
        description: 'Mock parameter description',
        dataType: 'string',
        access: 'read-write',
        range: null,
      },
    };
  }
  const { data } = await api.get('/configuration/parameter-metadata', {
    params: { protocol, parameter },
  });
  return data;
}

// PUBLIC_INTERFACE
export async function saveConfigurationTemplate({ name, deviceId, protocol, parameters }) {
  /**
   * Save configuration template for reuse
   * @param {Object} params - Template data
   * @param {string} params.name - Template name
   * @param {string} params.deviceId - Target device ID
   * @param {string} params.protocol - Protocol
   * @param {Array} params.parameters - Parameters to include
   * @returns {Promise<Object>} Saved template
   */
  if (isMockMode()) {
    return {
      success: true,
      templateId: `tpl-${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
    };
  }
  const { data } = await api.post('/configuration/templates', {
    name,
    deviceId,
    protocol,
    parameters,
  });
  return data;
}

// PUBLIC_INTERFACE
export async function listConfigurationTemplates({ page = 1, pageSize = 10 } = {}) {
  /**
   * List configuration templates
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Paginated template list
   */
  if (isMockMode()) {
    return {
      page,
      pageSize,
      totalPages: 1,
      totalItems: 1,
      items: [
        {
          id: 'tpl-1',
          name: 'WiFi Configuration',
          protocol: 'webpa',
          createdAt: new Date().toISOString(),
        },
      ],
    };
  }
  const { data } = await api.get('/configuration/templates', { params: { page, pageSize } });
  return data;
}
