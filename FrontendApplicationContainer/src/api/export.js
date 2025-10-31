import api from './axios';

// PUBLIC_INTERFACE
/** Export results as CSV blob */
export const exportCSV = async (jobId) => {
  const { data } = await api.get(`/export/${jobId}/csv`, { responseType: 'blob' });
  return data;
};

// PUBLIC_INTERFACE
/** Export results as JSON blob */
export const exportJSON = async (jobId) => {
  const { data } = await api.get(`/export/${jobId}/json`, { responseType: 'blob' });
  return data;
};
