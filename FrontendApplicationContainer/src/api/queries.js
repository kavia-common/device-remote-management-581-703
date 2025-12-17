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
    return {
      page,
      pageSize,
      totalPages: 1,
      totalItems: 2,
      items: [
        {
          id: 'qry-1',
          name: 'Get WiFi Status',
          protocol: 'webpa',
          isFavorite: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'qry-2',
          name: 'SNMP Interface Stats',
          protocol: 'snmp',
          isFavorite: false,
          createdAt: new Date().toISOString(),
        },
      ],
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
export async function getQueryHistory({ page = 1, pageSize = 10, protocol, deviceId } = {}) {
  /**
   * Get query execution history
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.pageSize - Items per page
   * @param {string} params.protocol - Filter by protocol
   * @param {string} params.deviceId - Filter by device
   * @returns {Promise<Object>} Paginated history
   */
  if (isMockMode()) {
    return {
      page,
      pageSize,
      totalPages: 1,
      totalItems: 3,
      items: [
        {
          id: 'hist-1',
          protocol: 'snmp',
          deviceId: 'dev-1',
          operation: 'GET',
          status: 'success',
          executedAt: new Date().toISOString(),
        },
        {
          id: 'hist-2',
          protocol: 'webpa',
          deviceId: 'dev-2',
          operation: 'SET',
          status: 'success',
          executedAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ],
    };
  }
  const params = { page, pageSize };
  if (protocol) params.protocol = protocol;
  if (deviceId) params.deviceId = deviceId;
  const { data } = await api.get('/queries/history', { params });
  return data;
}
