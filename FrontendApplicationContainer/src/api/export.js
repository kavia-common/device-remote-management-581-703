import axiosInstance from './axios';

// PUBLIC_INTERFACE
/**
 * Export query results as CSV
 * @param {string} jobId - Job ID
 * @returns {Promise<Blob>} CSV file blob
 */
export const exportResultsAsCSV = async (jobId) => {
  const response = await axiosInstance.get(`/export/${jobId}/csv`, {
    responseType: 'blob',
  });
  return response.data;
};

// PUBLIC_INTERFACE
/**
 * Export query results as JSON
 * @param {string} jobId - Job ID
 * @returns {Promise<Blob>} JSON file blob
 */
export const exportResultsAsJSON = async (jobId) => {
  const response = await axiosInstance.get(`/export/${jobId}/json`, {
    responseType: 'blob',
  });
  return response.data;
};
