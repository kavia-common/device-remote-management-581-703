import api, { isMockMode, getApiBase } from './client';
import { mockLogin, mockHealth, mockListDevices } from './mockApi';

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

/** Endpoints registry to prepare for real backend integration. */
export const endpoints = {
  login: '/auth/login',
  devices: '/devices',
  health: process.env.REACT_APP_HEALTHCHECK_PATH || '/health',
};

// PUBLIC_INTERFACE
export async function apiLogin({ email, password }) {
  if (isMockMode()) {
    return mockLogin({ email, password });
  }
  const { data } = await api.post(endpoints.login, { email, password });
  return data;
}

// PUBLIC_INTERFACE
export async function apiHealth() {
  if (isMockMode()) {
    return mockHealth();
  }
  const { data } = await api.get(endpoints.health);
  return data;
}

// PUBLIC_INTERFACE
export async function apiListDevices({ page = 1, pageSize = 10, sort } = {}) {
  if (isMockMode()) {
    return mockListDevices({ page, pageSize, sort });
  }
  const { data } = await api.get(endpoints.devices, { params: { page, pageSize, sort } });
  return data;
}

// PUBLIC_INTERFACE
export function currentApiBase() {
  return getApiBase();
}
