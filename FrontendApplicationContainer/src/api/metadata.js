import axiosInstance from './axios';

// PUBLIC_INTERFACE
/**
 * Search for parameter metadata across protocols
 * @param {Object} params - Search parameters
 * @param {string} params.query - Search query string
 * @param {string} [params.protocol] - Filter by protocol (SNMP, WebPA, TR69, TR369)
 * @param {number} [params.page] - Page number (default: 1)
 * @param {number} [params.pageSize] - Items per page (default: 20)
 * @returns {Promise<Object>} Paginated search results with parameter metadata
 */
export const searchMetadata = async (params) => {
  const response = await axiosInstance.get('/metadata/search', { params });
  return response.data;
};

// PUBLIC_INTERFACE
/**
 * Get parameter description by identifier
 * @param {string} protocol - Protocol name (snmp, webpa, tr69, tr369)
 * @param {string} identifier - Parameter identifier (OID, parameter name, or path)
 * @returns {Promise<Object>} Parameter metadata including description, type, and usage
 */
export const getParameterDescription = async (protocol, identifier) => {
  const response = await axiosInstance.get(`/metadata/${protocol}/${encodeURIComponent(identifier)}`);
  return response.data;
};

// PUBLIC_INTERFACE
/**
 * Get common parameters for a protocol
 * @param {string} protocol - Protocol name (snmp, webpa, tr69, tr369)
 * @param {number} [limit] - Maximum number of results (default: 50)
 * @returns {Promise<Object[]>} List of common parameters with descriptions
 */
export const getCommonParameters = async (protocol, limit = 50) => {
  const response = await axiosInstance.get(`/metadata/${protocol}/common`, {
    params: { limit }
  });
  return response.data;
};

// PUBLIC_INTERFACE
/**
 * Get MIB information for SNMP OID
 * @param {string} oid - SNMP OID (e.g., "1.3.6.1.2.1.1.1.0")
 * @returns {Promise<Object>} MIB information including name, syntax, access, and description
 */
export const getMibInfo = async (oid) => {
  const response = await axiosInstance.get(`/metadata/snmp/mib/${encodeURIComponent(oid)}`);
  return response.data;
};

// PUBLIC_INTERFACE
/**
 * Get TR-181 data model information
 * @param {string} parameter - TR-181 parameter path (e.g., "Device.DeviceInfo.SoftwareVersion")
 * @returns {Promise<Object>} Data model information including type, access, and description
 */
export const getTr181Info = async (parameter) => {
  const response = await axiosInstance.get(`/metadata/tr181/${encodeURIComponent(parameter)}`);
  return response.data;
};
