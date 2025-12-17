function downloadBlob(content, mime, filename) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// PUBLIC_INTERFACE
export function exportJSON(data, filename = 'export.json') {
  downloadBlob(JSON.stringify(data, null, 2), 'application/json', filename);
}

// PUBLIC_INTERFACE
export function exportCSV(rows, filename = 'export.csv') {
  if (!rows || rows.length === 0) {
    downloadBlob('', 'text/csv', filename);
    return;
  }
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => {
      const val = r[h] != null ? String(r[h]) : '';
      const needsQuote = /[",\n]/.test(val);
      const safe = val.replace(/"/g, '""');
      return needsQuote ? `"${safe}"` : safe;
    }).join(',')),
  ].join('\n');
  downloadBlob(csv, 'text/csv', filename);
}
