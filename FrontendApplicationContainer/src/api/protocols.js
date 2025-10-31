import axiosInstance from './axios';

// SNMP Protocol Operations

// PUBLIC_INTERFACE
/**
 * Execute SNMP GET operation
 * @param {Object} data - SNMP GET request data
 * @param {string} data.deviceId - Device ID
 * @param {string[]} data.oids - List of OIDs to query
 * @returns {Promise<Object>} Query result with job ID
 */
export const snmpGet = async (data) => {
  const response = await axiosInstance.post('/protocols/snmp/get', data);
  return response.data;
};

// PUBLIC_INTERFACE
/**
 * Execute SNMP SET operation
 * @param {Object} data - SNMP SET request data
 * @returns {Promise<Object>} Operation result
 */
export const snmpSet = async (data) => {
  const response = await axiosInstance.post('/protocols/snmp/set', data);
  return response.data;
};

// PUBLIC_INTERFACE
/**
 * Execute SNMP WALK operation
 * @param {Object} data - SNMP WALK request data
 * @returns {Promise<Object>} Query result with job ID
 */
export const snmpWalk = async (data) => {
  const response = await axiosInstance.post('/protocols/snmp/walk', data);
  return response.data;
};

// WebPA Protocol Operations

// PUBLIC_INTERFACE
/**
 * Execute WebPA GET operation
 * @param {Object} data - WebPA GET request data
 * @param {string} data.deviceId - Device ID
 * @param {string[]} data.parameters - List of parameters to query
 * @returns {Promise<Object>} Query result with job ID
 */
export const webpaGet = async (data) => {
  const response = await axiosInstance.post('/protocols/webpa/get', data);
  return response.data;
};

// PUBLIC_INTERFACE
/**
 * Execute WebPA SET operation
 * @param {Object} data - WebPA SET request data
 * @returns {Promise<Object>} Operation result
 */
export const webpaSet = async (data) => {
  const response = await axiosInstance.post('/protocols/webpa/set', data);
  return response.data;
};

// TR69 Protocol Operations

// PUBLIC_INTERFACE
/**
 * Execute TR69 GetParameterValues operation
 * @param {Object} data - TR69 request data
 * @param {string} data.deviceId - Device ID
 * @param {string[]} data.parameters - List of parameters to query
 * @returns {Promise<Object>} Query result with job ID
 */
export const tr69GetParameters = async (data) => {
  const response = await axiosInstance.post('/protocols/tr69/get-parameters', data);
  return response.data;
};

// PUBLIC_INTERFACE
/**
 * Execute TR69 SetParameterValues operation
 * @param {Object} data - TR69 SET request data
 * @returns {Promise<Object>} Operation result
 */
export const tr69SetParameters = async (data) => {
  const response = await axiosInstance.post('/protocols/tr69/set-parameters', data);
  return response.data;
};

// TR369 Protocol Operations

// PUBLIC_INTERFACE
/**
 * Execute TR369/USP GET operation
 * @param {Object} data - TR369 request data
 * @param {string} data.deviceId - Device ID
 * @param {string[]} data.paths - List of data model paths to query
 * @returns {Promise<Object>} Query result with job ID
 */
export const tr369Get = async (data) => {
  const response = await axiosInstance.post('/protocols/tr369/get', data);
  return response.data;
};

// PUBLIC_INTERFACE
/**
 * Execute TR369/USP SET operation
 * @param {Object} data - TR369 SET request data
 * @returns {Promise<Object>} Operation result
 */
export const tr369Set = async (data) => {
  const response = await axiosInstance.post('/protocols/tr369/set', data);
  return response.data;
};

// Query Status and Results

// PUBLIC_INTERFACE
/**
 * Get query job status
 * @param {string} jobId - Job ID
 * @returns {Promise<Object>} Job status and results
 */
export const getQueryStatus = async (jobId) => {
  const response = await axiosInstance.get(`/queries/${jobId}/status`);
  return response.data;
};

// PUBLIC_INTERFACE
/**
 * Get query results
 * @param {string} jobId - Job ID
 * @returns {Promise<Object>} Query results
 */
export const getQueryResults = async (jobId) => {
  const response = await axiosInstance.get(`/queries/${jobId}/results`);
  return response.data;
};

// PUBLIC_INTERFACE
/**
 * Get query history
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Paginated query history
 */
export const getQueryHistory = async (params = {}) => {
  const response = await axiosInstance.get('/queries/history', { params });
  return response.data;
};
