import api, { isMockMode } from './client';

/**
 * Activity API module
 * Handles automatic logging of protocol operation executions into query history
 */

const HISTORY_STORAGE_KEY = 'dmgr.history';

/**
 * QueryRecord shape - shared structure for all logged operations
 * @typedef {Object} QueryRecord
 * @property {string} id - Unique ID for the query
 * @property {string} protocol - Protocol used (snmp, webpa, tr069, tr369)
 * @property {string} deviceId - Device identifier
 * @property {string} target - Target (IP/MAC/serial/endpoint)
 * @property {string} operation - Operation type (GET, SET, WALK, etc.)
 * @property {string} action - Action method name
 * @property {Object} parameters - Request parameters
 * @property {string} status - 'success', 'failed', 'pending'
 * @property {number} duration - Duration in milliseconds
 * @property {Object|null} response - Response payload (null if failed)
 * @property {string|null} error - Error message (null if success)
 * @property {string} user - User email/identifier
 * @property {string} executedAt - ISO timestamp
 * @property {boolean} isFavorite - Favorite status (default false)
 * @property {string|null} requestId - Backend request ID if available
 * @property {string|null} resultSummary - Brief summary of results
 */

// PUBLIC_INTERFACE
export function buildQueryRecord({
  protocol,
  target,
  action,
  params,
  status,
  duration,
  response,
  error,
  user,
  deviceId,
  operation,
  requestId,
}) {
  /**
   * Build a normalized QueryRecord from protocol execution metadata
   * @param {Object} metadata - Execution metadata
   * @returns {QueryRecord} Normalized query record
   */
  const record = {
    id: requestId || `qry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    protocol: protocol || 'unknown',
    deviceId: deviceId || target || 'N/A',
    target: target || deviceId || 'N/A',
    operation: operation || action || 'EXECUTE',
    action: action || operation || 'execute',
    parameters: params || {},
    status: status || 'unknown',
    duration: duration || 0,
    response: status === 'success' ? response : null,
    error: status === 'failed' ? error : null,
    user: user || 'unknown',
    executedAt: new Date().toISOString(),
    isFavorite: false,
    requestId: requestId || null,
    resultSummary: generateResultSummary(status, response, error, protocol, operation || action),
  };

  return record;
}

/**
 * Generate a brief result summary for display
 */
function generateResultSummary(status, response, error, protocol, operation) {
  if (status === 'failed') {
    return `Failed: ${error?.substring(0, 100) || 'Unknown error'}`;
  }

  if (!response) {
    return 'No response data';
  }

  // Protocol-specific summaries
  if (protocol === 'snmp') {
    if (operation?.toLowerCase().includes('walk') && Array.isArray(response.results)) {
      return `Retrieved ${response.results.length} OID(s)`;
    }
    if (response.value) {
      return `Value: ${String(response.value).substring(0, 50)}`;
    }
  } else if (protocol === 'webpa') {
    if (response.value !== undefined) {
      return `Value: ${String(response.value).substring(0, 50)}`;
    }
  } else if (protocol === 'tr069') {
    if (Array.isArray(response.parameters)) {
      return `${response.parameters.length} parameter(s)`;
    }
    if (response.taskId) {
      return `Task ${response.taskId}: ${response.status || 'initiated'}`;
    }
  } else if (protocol === 'tr369') {
    if (Array.isArray(response.results)) {
      return `${response.results.length} item(s)`;
    }
    if (response.instancePath) {
      return `Created: ${response.instancePath}`;
    }
  }

  return 'Success';
}

// PUBLIC_INTERFACE
export async function createQueryLog(payload) {
  /**
   * Create a query log entry (main history record)
   * @param {QueryRecord} payload - Query record to log
   * @returns {Promise<Object>} Created log entry
   */
  if (isMockMode()) {
    // Mock fallback: store in localStorage
    try {
      const existing = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '[]');
      existing.unshift(payload); // Add to beginning
      // Keep only last 100 entries
      const trimmed = existing.slice(0, 100);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmed));
      return {
        success: true,
        id: payload.id,
        message: 'Query logged locally (mock mode)',
      };
    } catch (err) {
      console.warn('Failed to log query to localStorage:', err);
      return {
        success: false,
        error: err.message,
      };
    }
  }

  try {
    const { data } = await api.post('/queries', payload);
    return data;
  } catch (err) {
    console.warn('Failed to log query to backend:', err);
    // Non-blocking - return success:false but don't throw
    return {
      success: false,
      error: err.response?.data?.error?.message || err.message,
    };
  }
}

// PUBLIC_INTERFACE
export async function createQueryResult(payload) {
  /**
   * Create a query result entry (detailed result for a query)
   * This is optional and used when backend separates query metadata from results
   * @param {Object} payload - Result payload with queryId and result data
   * @returns {Promise<Object>} Result entry
   */
  if (isMockMode()) {
    // In mock mode, results are embedded in the query record
    return {
      success: true,
      message: 'Results embedded in query log (mock mode)',
    };
  }

  try {
    const { queryId, ...resultData } = payload;
    const { data } = await api.post(`/queries/${queryId}/results`, resultData);
    return data;
  } catch (err) {
    console.warn('Failed to log query result to backend:', err);
    return {
      success: false,
      error: err.response?.data?.error?.message || err.message,
    };
  }
}

// PUBLIC_INTERFACE
export function getLocalHistoryRecords() {
  /**
   * Retrieve local history records from localStorage (mock mode only)
   * @returns {Array<QueryRecord>} Array of query records
   */
  try {
    return JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '[]');
  } catch (err) {
    console.error('Failed to read local history:', err);
    return [];
  }
}

// PUBLIC_INTERFACE
export function clearLocalHistory() {
  /**
   * Clear local history records (mock mode only)
   */
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear local history:', err);
  }
}
