import axiosInstance from './axios';

// PUBLIC_INTERFACE
/**
 * Fetch list of tenants available to the current user
 * @returns {Promise} Promise resolving to tenant list
 */
export const getTenants = async () => {
  const response = await axiosInstance.get('/tenants');
  return response.data;
};

// PUBLIC_INTERFACE
/**
 * Get details of a specific tenant
 * @param {string} tenantId - The tenant ID
 * @returns {Promise} Promise resolving to tenant details
 */
export const getTenant = async (tenantId) => {
  const response = await axiosInstance.get(`/tenants/${tenantId}`);
  return response.data;
};

// PUBLIC_INTERFACE
/**
 * Switch to a different tenant context
 * @param {string} tenantId - The tenant ID to switch to
 * @returns {Promise} Promise resolving when tenant is switched
 */
export const switchTenant = async (tenantId) => {
  const response = await axiosInstance.post('/tenants/switch', { tenantId });
  return response.data;
};

export default {
  getTenants,
  getTenant,
  switchTenant,
};
