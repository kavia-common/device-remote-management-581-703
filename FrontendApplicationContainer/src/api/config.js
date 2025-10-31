import api from './axios';

// PUBLIC_INTERFACE
/** Upload MIB file. Returns: { id, name, uploadedAt } */
export const uploadMib = async (file) => {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post('/config/mibs/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// PUBLIC_INTERFACE
/** List uploaded MIBs (paginated) */
export const listMibs = async (page = 1, pageSize = 50) => {
  const { data } = await api.get('/config/mibs', { params: { page, pageSize } });
  return data;
};
