import axiosInstance from './axios';

// PUBLIC_INTERFACE
/**
 * Upload MIB file
 * @param {File} file - MIB file to upload
 * @returns {Promise<Object>} Upload result
 */
export const uploadMib = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axiosInstance.post('/config/mib/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// PUBLIC_INTERFACE
/**
 * Get list of uploaded MIBs
 * @returns {Promise<Array>} List of MIBs
 */
export const getMibs = async () => {
  const response = await axiosInstance.get('/config/mib');
  return response.data;
};

// PUBLIC_INTERFACE
/**
 * Delete MIB
 * @param {string} mibId - MIB ID
 * @returns {Promise<void>}
 */
export const deleteMib = async (mibId) => {
  const response = await axiosInstance.delete(`/config/mib/${mibId}`);
  return response.data;
};
