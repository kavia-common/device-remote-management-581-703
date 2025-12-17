import api, { isMockMode } from './client';

/**
 * Exports API module
 * Handles result export operations
 */

// PUBLIC_INTERFACE
export async function exportResults({ format = 'csv', data, filename }) {
  /**
   * Export query results to file
   * @param {Object} params - Export parameters
   * @param {string} params.format - Export format (csv, json, xml)
   * @param {Array|Object} params.data - Data to export
   * @param {string} params.filename - Target filename
   * @returns {Promise<Blob>} Export file blob
   */
  if (isMockMode()) {
    // Client-side export for mock mode
    const { exportCSV, exportJSON } = await import('../utils/exporters');
    if (format === 'csv') {
      exportCSV(data, filename);
    } else if (format === 'json') {
      exportJSON(data, filename);
    }
    return { success: true, message: 'Export completed (mock)' };
  }
  
  const response = await api.post(
    '/exports',
    { format, data, filename },
    { responseType: 'blob' }
  );
  
  // Trigger download
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  
  return { success: true };
}

// PUBLIC_INTERFACE
export async function getExportHistory({ page = 1, pageSize = 10 } = {}) {
  /**
   * Get export history
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Paginated export history
   */
  if (isMockMode()) {
    return {
      page,
      pageSize,
      totalPages: 1,
      totalItems: 1,
      items: [
        {
          id: 'exp-1',
          format: 'csv',
          filename: 'devices-export.csv',
          createdAt: new Date().toISOString(),
          size: 1024,
        },
      ],
    };
  }
  const { data } = await api.get('/exports/history', { params: { page, pageSize } });
  return data;
}

// PUBLIC_INTERFACE
export async function scheduleExport({ format, query, schedule, recipients }) {
  /**
   * Schedule periodic export
   * @param {Object} params - Schedule parameters
   * @param {string} params.format - Export format
   * @param {Object} params.query - Query to export
   * @param {string} params.schedule - Cron schedule expression
   * @param {string[]} params.recipients - Email recipients
   * @returns {Promise<Object>} Scheduled export
   */
  if (isMockMode()) {
    return {
      success: true,
      scheduleId: `sched-${Date.now()}`,
      message: 'Export scheduled (mock)',
    };
  }
  const { data } = await api.post('/exports/schedule', {
    format,
    query,
    schedule,
    recipients,
  });
  return data;
}
