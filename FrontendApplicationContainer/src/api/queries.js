import api, { isMockMode } from './client';

/**
 * Queries API module
 * Handles query history, favorites, and saved queries
 */

// PUBLIC_INTERFACE
export async function saveQuery({ name, protocol, deviceId, parameters, isFavorite = false }) {
  /**
   * Save query for reuse
   * @param {Object} params - Query data
   * @param {string} params.name - Query name
   * @param {string} params.protocol - Protocol used
   * @param {string} params.deviceId - Device ID
   * @param {Object} params.parameters - Query parameters
   * @param {boolean} params.isFavorite - Mark as favorite
   * @returns {Promise<Object>} Saved query
   */
  if (isMockMode()) {
    return {
      success: true,
      queryId: `qry-${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
    };
  }
  const { data } = await api.post('/queries', {
    name,
    protocol,
    deviceId,
    parameters,
    isFavorite,
  });
  return data;
}

// PUBLIC_INTERFACE
export async function listQueries({ page = 1, pageSize = 10, favorites = false } = {}) {
  /**
   * List saved queries
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.pageSize - Items per page
   * @param {boolean} params.favorites - Only favorites
   * @returns {Promise<Object>} Paginated query list
   */
  if (isMockMode()) {
    const allItems = [
      {
        id: 'qry-1',
        name: 'Get WiFi Status',
        protocol: 'webpa',
        deviceId: 'dev-002',
        parameters: { parameter: 'Device.WiFi.SSID.1.Status' },
        isFavorite: true,
        createdAt: new Date().toISOString(),
        executedAt: new Date().toISOString(),
        status: 'success',
        user: 'admin@example.com',
      },
      {
        id: 'qry-2',
        name: 'SNMP Interface Stats',
        protocol: 'snmp',
        deviceId: 'dev-001',
        parameters: { oid: '1.3.6.1.2.1.2.2.1.10', version: 'v2c' },
        isFavorite: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        executedAt: new Date(Date.now() - 3600000).toISOString(),
        status: 'success',
        user: 'admin@example.com',
      },
      {
        id: 'qry-3',
        name: 'TR-069 Model Info',
        protocol: 'tr069',
        deviceId: 'dev-003',
        parameters: { parameters: ['Device.DeviceInfo.ModelName'] },
        isFavorite: false,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        executedAt: new Date(Date.now() - 7200000).toISOString(),
        status: 'success',
        user: 'operator@example.com',
      },
    ];
    
    const items = favorites ? allItems.filter(q => q.isFavorite) : allItems;
    
    return {
      page,
      pageSize,
      totalPages: Math.ceil(items.length / pageSize),
      totalItems: items.length,
      items: items.slice((page - 1) * pageSize, page * pageSize),
    };
  }
  const { data } = await api.get('/queries', { params: { page, pageSize, favorites } });
  return data;
}

// PUBLIC_INTERFACE
export async function getQueryById(queryId) {
  /**
   * Get query details by ID
   * @param {string} queryId - Query ID
   * @returns {Promise<Object>} Query details
   */
  if (isMockMode()) {
    return {
      id: queryId,
      name: 'Sample Query',
      protocol: 'snmp',
      deviceId: 'dev-1',
      parameters: { oid: '1.3.6.1.2.1.1.1.0' },
      isFavorite: false,
      createdAt: new Date().toISOString(),
    };
  }
  const { data } = await api.get(`/queries/${queryId}`);
  return data;
}

// PUBLIC_INTERFACE
export async function deleteQuery(queryId) {
  /**
   * Delete query by ID
   * @param {string} queryId - Query ID
   * @returns {Promise<Object>} Deletion result
   */
  if (isMockMode()) {
    return {
      success: true,
      message: 'Query deleted (mock)',
    };
  }
  const { data } = await api.delete(`/queries/${queryId}`);
  return data;
}

// PUBLIC_INTERFACE
export async function toggleFavorite(queryId, isFavorite) {
  /**
   * Toggle query favorite status
   * @param {string} queryId - Query ID
   * @param {boolean} isFavorite - New favorite status
   * @returns {Promise<Object>} Update result
   */
  if (isMockMode()) {
    return {
      success: true,
      queryId,
      isFavorite,
    };
  }
  const { data } = await api.patch(`/queries/${queryId}/favorite`, { isFavorite });
  return data;
}

// PUBLIC_INTERFACE
export async function getQueryHistory({ 
  page = 1, 
  pageSize = 10, 
  protocol, 
  deviceId, 
  status, 
  search, 
  dateFrom, 
  dateTo,
  sort 
} = {}) {
  /**
   * Get query execution history with advanced filtering
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.pageSize - Items per page
   * @param {string} params.protocol - Filter by protocol
   * @param {string} params.deviceId - Filter by device
   * @param {string} params.status - Filter by status
   * @param {string} params.search - Text search
   * @param {string} params.dateFrom - Start date filter
   * @param {string} params.dateTo - End date filter
   * @param {string} params.sort - Sort field:order (e.g., 'executedAt:desc')
   * @returns {Promise<Object>} Paginated history
   */
  if (isMockMode()) {
    // Generate more realistic mock data
    const mockItems = [
      {
        id: 'hist-1',
        protocol: 'snmp',
        deviceId: 'dev-001',
        target: '192.168.1.100',
        operation: 'GET',
        action: 'snmpGet',
        parameters: { oid: '1.3.6.1.2.1.1.1.0', version: 'v2c' },
        status: 'success',
        duration: 234,
        user: 'admin@example.com',
        executedAt: new Date().toISOString(),
        response: { value: 'Linux Router 5.4.0', type: 'OctetString' },
        isFavorite: true,
      },
      {
        id: 'hist-2',
        protocol: 'webpa',
        deviceId: 'dev-002',
        target: 'device-mac-123456',
        operation: 'SET',
        action: 'webpaSetParameter',
        parameters: { parameter: 'Device.WiFi.SSID.1.Enable', value: 'true' },
        status: 'success',
        duration: 567,
        user: 'admin@example.com',
        executedAt: new Date(Date.now() - 3600000).toISOString(),
        response: { success: true },
        isFavorite: false,
      },
      {
        id: 'hist-3',
        protocol: 'tr069',
        deviceId: 'dev-003',
        target: 'cpe-serial-789',
        operation: 'GET_PARAMETER_VALUES',
        action: 'tr069GetParameterValues',
        parameters: { parameters: ['Device.DeviceInfo.ModelName'] },
        status: 'failed',
        duration: 1200,
        user: 'operator@example.com',
        executedAt: new Date(Date.now() - 7200000).toISOString(),
        error: 'Timeout waiting for device response',
        isFavorite: false,
      },
      {
        id: 'hist-4',
        protocol: 'tr369',
        deviceId: 'dev-004',
        target: 'usp-endpoint-456',
        operation: 'GET',
        action: 'tr369Get',
        parameters: { paths: ['Device.LocalAgent.'] },
        status: 'success',
        duration: 890,
        user: 'admin@example.com',
        executedAt: new Date(Date.now() - 10800000).toISOString(),
        response: { results: [{ path: 'Device.LocalAgent.', value: {} }] },
        isFavorite: true,
      },
    ];

    // Apply filters
    let filtered = [...mockItems];
    if (protocol) filtered = filtered.filter(q => q.protocol === protocol);
    if (status) filtered = filtered.filter(q => q.status === status);
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(q => 
        q.target?.toLowerCase().includes(s) ||
        q.operation?.toLowerCase().includes(s) ||
        q.deviceId?.toLowerCase().includes(s)
      );
    }

    return {
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
      totalItems: filtered.length,
      items: filtered.slice((page - 1) * pageSize, page * pageSize),
    };
  }
  const params = { page, pageSize };
  if (protocol) params.protocol = protocol;
  if (deviceId) params.deviceId = deviceId;
  if (status) params.status = status;
  if (search) params.search = search;
  if (dateFrom) params.dateFrom = dateFrom;
  if (dateTo) params.dateTo = dateTo;
  if (sort) params.sort = sort;
  const { data } = await api.get('/queries/history', { params });
  return data;
}

// PUBLIC_INTERFACE
export async function rerunQuery(queryId) {
  /**
   * Rerun a previous query
   * @param {string} queryId - Query ID to rerun
   * @returns {Promise<Object>} Rerun result
   */
  if (isMockMode()) {
    return {
      success: true,
      queryId: `qry-rerun-${Date.now()}`,
      message: 'Query rerun initiated (mock)',
      status: 'pending',
    };
  }
  const { data } = await api.post(`/queries/${queryId}/rerun`);
  return data;
}
