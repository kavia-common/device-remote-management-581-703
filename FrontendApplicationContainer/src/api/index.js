import api, { getApiBase, isMockMode } from './client';

// PUBLIC_INTERFACE
export * from './auth';
export * from './devices';
export * from './exports';
export * from './configuration';
export { 
  saveQuery, 
  listQueries, 
  getQueryById, 
  deleteQuery, 
  toggleFavorite, 
  getQueryHistory,
  rerunQuery,
  addLocalQueryRecord
} from './queries';
export { 
  buildQueryRecord, 
  createQueryLog, 
  createQueryResult,
  getLocalHistoryRecords,
  clearLocalHistory
} from './activity';
export * from './protocols/snmp';
export * from './protocols/webpa';
export * from './protocols/tr069';
export * from './protocols/tr369';

// Export client utilities
export { isMockMode };

// PUBLIC_INTERFACE
export function currentApiBase() {
  /**
   * Get current API base URL
   * @returns {string} API base URL
   */
  return getApiBase();
}

// PUBLIC_INTERFACE
export async function apiHealth() {
  /**
   * Check API health status
   * @returns {Promise<Object>} Health status
   */
  if (isMockMode()) {
    return {
      status: 'ok',
      mode: 'mock',
      message: 'Mock API is running',
      timestamp: new Date().toISOString(),
    };
  }
  
  const healthPath = process.env.REACT_APP_HEALTHCHECK_PATH || '/health';
  
  try {
    const { data } = await api.get(healthPath);
    return {
      status: 'ok',
      mode: 'real',
      endpoint: getApiBase() + healthPath,
      ...data,
    };
  } catch (error) {
    return {
      status: 'error',
      mode: 'real',
      endpoint: getApiBase() + healthPath,
      error: error.message,
    };
  }
}
