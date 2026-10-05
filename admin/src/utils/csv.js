function escapeCell(value) {
  const s = value === null || value === undefined ? '' : String(value);
  // Neutralise spreadsheet formula injection.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/**
 * @param {string} filename
 * @param {Array<{ header: string, value: (row) => any }>} columns
 * @param {Array<object>} rows
 */
export function downloadCsv(filename, columns, rows) {
  const lines = [columns.map((c) => escapeCell(c.header)).join(',')];
  for (const row of rows) lines.push(columns.map((c) => escapeCell(c.value(row))).join(','));
  const blob = new Blob([`﻿${lines.join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
