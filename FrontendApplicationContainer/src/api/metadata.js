import api from './axios';

// PUBLIC_INTERFACE
/** Get parameter metadata for a protocol */
export const getParameters = async (protocol) => {
  const { data } = await api.get(`/metadata/${protocol}/parameters`);
  return data;
};

// PUBLIC_INTERFACE
/** Get device model metadata */
export const getDeviceModels = async () => {
  const { data } = await api.get('/metadata/device-models');
  return data;
};

// PUBLIC_INTERFACE
/** SNMP MIB info helper */
export const getMibInfo = async (oid) => {
  const { data } = await api.get(`/metadata/snmp/mib/${encodeURIComponent(oid)}`);
  return data;
};

// PUBLIC_INTERFACE
/** Get common parameters for a protocol with optional limit (default 50) */
export const getCommonParameters = async (protocol, limit = 50) => {
  const { data } = await api.get(`/metadata/${protocol}/common`, { params: { limit } });
  return data;
};

// PUBLIC_INTERFACE
/** Search parameter metadata across protocols with pagination/filter params */
export const searchMetadata = async (params = {}) => {
  const { data } = await api.get('/metadata/search', { params });
  return data;
};

// PUBLIC_INTERFACE
/** Get detailed parameter description for a given protocol and identifier */
export const getParameterDescription = async (protocol, identifier) => {
  const safeId = encodeURIComponent(identifier);
  const { data } = await api.get(`/metadata/${protocol}/${safeId}`);
  return data;
};
