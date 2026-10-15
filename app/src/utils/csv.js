import { saveTextFile } from '../native/platform';

function escapeCell(value) {
  const s = value === null || value === undefined ? '' : String(value);
  // Neutralise spreadsheet formula injection.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/**
 * Downloads (browser) or shares (Android app) a CSV file.
 * @param {string} filename
 * @param {Array<{ header: string, value: (row) => any }>} columns
 * @param {Array<object>} rows
 */
export function downloadCsv(filename, columns, rows) {
  const lines = [columns.map((c) => escapeCell(c.header)).join(',')];
  for (const row of rows) lines.push(columns.map((c) => escapeCell(c.value(row))).join(','));
  // BOM so Excel opens UTF-8 (₹, names) correctly.
  return saveTextFile(filename, `﻿${lines.join('\r\n')}`, 'text/csv');
}
