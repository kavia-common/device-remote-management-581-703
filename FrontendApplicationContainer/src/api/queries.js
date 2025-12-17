import api, { isMockMode } from './client';
import { getLocalHistoryRecords } from './activity';

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
    // Get from localStorage history and filter favorites
    const localHistory = getLocalHistoryRecords();
    const items = favorites ? localHistory.filter(q => q.isFavorite) : localHistory.slice(0, 20);
    
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
    const localHistory = getLocalHistoryRecords();
    const found = localHistory.find(q => q.id === queryId);
    if (found) return found;
    
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
    // Remove from localStorage
    const localHistory = getLocalHistoryRecords();
    const updated = localHistory.filter(q => q.id !== queryId);
    localStorage.setItem('dmgr.history', JSON.stringify(updated));
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
    // Update in localStorage
    const localHistory = getLocalHistoryRecords();
    const query = localHistory.find(q => q.id === queryId);
    if (query) {
      query.isFavorite = isFavorite;
      localStorage.setItem('dmgr.history', JSON.stringify(localHistory));
    }
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
    // Get from localStorage
    const localHistory = getLocalHistoryRecords();

    // Apply filters
    let filtered = [...localHistory];
    if (protocol) filtered = filtered.filter(q => q.protocol === protocol);
    if (status) filtered = filtered.filter(q => q.status === status);
    if (deviceId) filtered = filtered.filter(q => q.deviceId === deviceId || q.target === deviceId);
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(q => 
        q.target?.toLowerCase().includes(s) ||
        q.operation?.toLowerCase().includes(s) ||
        q.deviceId?.toLowerCase().includes(s) ||
        q.action?.toLowerCase().includes(s)
      );
    }
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter(q => new Date(q.executedAt) >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(q => new Date(q.executedAt) <= toDate);
    }

    // Sort
    if (sort) {
      const [field, order] = sort.split(':');
      filtered.sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];
        if (order === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
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

// PUBLIC_INTERFACE
export function addLocalQueryRecord(record) {
  /**
   * Add a query record to local storage (used by mock fallback)
   * This helper ensures schema consistency with QueryHistory expectations
   * @param {Object} record - Query record to add
   */
  try {
    const existing = JSON.parse(localStorage.getItem('dmgr.history') || '[]');
    existing.unshift(record);
    const trimmed = existing.slice(0, 100);
    localStorage.setItem('dmgr.history', JSON.stringify(trimmed));
  } catch (err) {
    console.error('Failed to add local query record:', err);
  }
}
