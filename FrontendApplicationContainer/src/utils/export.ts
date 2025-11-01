//
// Simple export utilities for CSV and JSON
//

// PUBLIC_INTERFACE
export function exportJSON(filename: string, data: unknown): void {
  /** Exports given data as a JSON file by creating a blob and anchor click. */
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = ensureExtension(filename, '.json');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// PUBLIC_INTERFACE
export function exportCSV(filename: string, rows: Array<Record<string, unknown>>): void {
  /**
   * Exports a list of records as CSV. Keys from first row become headers.
   * Values are stringified and escaped.
   */
  if (!rows || rows.length === 0) {
    // nothing to export
    return;
  }
  const headers = Array.from(
    rows.reduce<Set<string>>((set, row) => {
      Object.keys(row ?? {}).forEach((k) => set.add(k));
      return set;
    }, new Set<string>())
  );

  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((h) => serializeCsvCell(row[h]))
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = ensureExtension(filename, '.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function ensureExtension(name: string, ext: string): string {
  return name.endsWith(ext) ? name : `${name}${ext}`;
}

function serializeCsvCell(value: unknown): string {
  if (value == null) return '';
  const str = typeof value === 'string' ? value : JSON.stringify(value);
  const needsQuotes = /[",\n]/.test(str);
  const escaped = str.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}
