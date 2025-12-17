import api, { isMockMode, getApiBase } from './client';
import { mockLogin, mockHealth, mockListDevices } from './mockApi';

/**
 * Main API index - exports all API modules and functions
 */

// Re-export client utilities
export { isMockMode, getApiBase };

// Import and re-export all API modules
export * from './devices';
export * from './protocols/snmp';
export * from './protocols/webpa';
export * from './protocols/tr069';
export * from './protocols/tr369';
export * from './configuration';
export * from './queries';
export * from './exports';

/**
 * Types (JSDoc)
 * 
 * @typedef {Object} ErrorItem
 * @property {string} code
 * @property {string} message
 * @property {string[]} [details]
 * @property {string} timestamp
 * @property {string} [path]
 * 
 * // PUBLIC_INTERFACE
 * @typedef {Object} ErrorResponse
 * @property {{code:string,message:string,details?:string[],timestamp:string,path?:string}} error
 * 
 * // PUBLIC_INTERFACE
 * @typedef {Object} PaginationResponse
 * @property {number} page
 * @property {number} pageSize
 * @property {number} totalPages
 * @property {number} totalItems
 * @property {boolean} [hasNext]
 * @property {boolean} [hasPrevious]
 */

/** Endpoints registry */
export const endpoints = {
  // Auth
  login: process.env.REACT_APP_AUTH_LOGIN_PATH || '/auth/login',
  refresh: process.env.REACT_APP_AUTH_REFRESH_PATH || '/auth/refresh',
  
  // Core
  health: process.env.REACT_APP_HEALTHCHECK_PATH || '/health',
  
  // Devices
  devices: '/devices',
  
  // Protocols
  snmp: '/protocols/snmp',
  webpa: '/protocols/webpa',
  tr069: '/protocols/tr069',
  tr369: '/protocols/tr369',
  
  // Configuration
  configuration: '/configuration',
  mib: '/configuration/mib',
  templates: '/configuration/templates',
  
  // Queries
  queries: '/queries',
  queryHistory: '/queries/history',
  
  // Exports
  exports: '/exports',
};

// PUBLIC_INTERFACE
export async function apiLogin({ email, password }) {
  /**
   * Login endpoint (kept for backward compatibility)
   */
  if (isMockMode()) {
    return mockLogin({ email, password });
  }
  const { data } = await api.post(endpoints.login, { email, password });
  return data;
}

// PUBLIC_INTERFACE
export async function apiHealth() {
  /**
   * Health check endpoint
   */
  if (isMockMode()) {
    return mockHealth();
  }
  const { data } = await api.get(endpoints.health);
  return data;
}

// PUBLIC_INTERFACE
export async function apiListDevices({ page = 1, pageSize = 10, sort } = {}) {
  /**
   * List devices endpoint (kept for backward compatibility)
   */
  if (isMockMode()) {
    return mockListDevices({ page, pageSize, sort });
  }
  const { data } = await api.get(endpoints.devices, { params: { page, pageSize, sort } });
  return data;
}

// PUBLIC_INTERFACE
export function currentApiBase() {
  /**
   * Get current API base URL
   */
  return getApiBase();
}
