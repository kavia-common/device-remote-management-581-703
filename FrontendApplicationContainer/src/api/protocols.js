import api from './axios';

// Helper to standardize submit returning { jobId }
const submit = async (path, payload) => {
  const { data } = await api.post(path, payload);
  // Expected: { jobId }
  return data;
};

// PUBLIC_INTERFACE
// SNMP operations
export const snmpGet = (payload) => submit('/protocols/snmp/get', payload);
export const snmpSet = (payload) => submit('/protocols/snmp/set', payload);
export const snmpWalk = (payload) => submit('/protocols/snmp/walk', payload);

// PUBLIC_INTERFACE
// WebPA operations
export const webpaGet = (payload) => submit('/protocols/webpa/get', payload);
export const webpaSet = (payload) => submit('/protocols/webpa/set', payload);

// PUBLIC_INTERFACE
// TR69 operations
export const tr69Get = (payload) => submit('/protocols/tr69/get', payload);
export const tr69Set = (payload) => submit('/protocols/tr69/set', payload);

// PUBLIC_INTERFACE
// TR369 operations
export const tr369Get = (payload) => submit('/protocols/tr369/get', payload);
export const tr369Set = (payload) => submit('/protocols/tr369/set', payload);

// PUBLIC_INTERFACE
// Query status/results and history
export const getQueryStatus = async (jobId) => {
  const { data } = await api.get(`/queries/${jobId}/status`);
  return data;
};
export const getQueryResults = async (jobId) => {
  const { data } = await api.get(`/queries/${jobId}/results`);
  return data;
};
export const getQueryHistory = async (params = {}) => {
  const { data } = await api.get('/queries/history', { params });
  return data;
};

// PUBLIC_INTERFACE
// Cancel job by id (protocol-agnostic)
export const cancelQuery = async (jobId) => {
  const { data } = await api.post(`/queries/${jobId}/cancel`);
  return data;
};
