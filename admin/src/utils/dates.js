import { Timestamp } from 'firebase/firestore';

/**
 * All membership dates are stored as Firestore Timestamps at local midnight.
 * Expiry dates are INCLUSIVE: a 1-month plan starting 5 Oct is valid through 4 Nov.
 */

const DAY_MS = 86_400_000;

export function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value.toDate === 'function') return value.toDate();
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return parseDateInput(value);
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function toTimestamp(value) {
  const d = toDate(value);
  return d ? Timestamp.fromDate(d) : null;
}

export function startOfDay(value = new Date()) {
  const d = new Date(toDate(value) ?? new Date());
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(value = new Date()) {
  const d = new Date(toDate(value) ?? new Date());
  d.setHours(23, 59, 59, 999);
  return d;
}

export function addDays(value, n) {
  const d = new Date(toDate(value));
  d.setDate(d.getDate() + n);
  return d;
}

/** Adds months, clamping to the last day of the month (31 Jan + 1 month → 28/29 Feb). */
export function addMonths(value, n) {
  const d = new Date(toDate(value));
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + n);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, lastDay));
  return d;
}

/** Inclusive expiry date for a plan duration starting on `start`. */
export function calculateExpiry(start, duration, unit) {
  const s = startOfDay(start);
  const n = Number(duration);
  if (!Number.isFinite(n) || n <= 0) return null;
  let next;
  if (unit === 'days') next = addDays(s, n);
  else if (unit === 'years') next = addMonths(s, n * 12);
  else next = addMonths(s, n);
  return addDays(next, -1);
}

/** Whole calendar days from today until `value` (negative when in the past). */
export function daysUntil(value) {
  const d = toDate(value);
  if (!d) return null;
  return Math.round((startOfDay(d) - startOfDay()) / DAY_MS);
}

export function startOfMonth(value = new Date()) {
  const d = startOfDay(value);
  d.setDate(1);
  return d;
}

export function startOfWeek(value = new Date()) {
  const d = startOfDay(value);
  const day = (d.getDay() + 6) % 7; // Monday = 0
  return addDays(d, -day);
}

/** "2026-10-05" for <input type="date"> (local time, no UTC shift). */
export function toDateInput(value) {
  const d = toDate(value);
  if (!d) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function parseDateInput(str) {
  if (!str) return null;
  const [y, m, d] = String(str).split('-').map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 ? date : null;
}

export function todayInput() {
  return toDateInput(new Date());
}

const dateFmt = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const shortFmt = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' });
const dateTimeFmt = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});
const monthFmt = new Intl.DateTimeFormat('en-IN', { month: 'short', year: '2-digit' });

export const formatDate = (v) => (toDate(v) ? dateFmt.format(toDate(v)) : '—');
export const formatShortDate = (v) => (toDate(v) ? shortFmt.format(toDate(v)) : '—');
export const formatDateTime = (v) => (toDate(v) ? dateTimeFmt.format(toDate(v)) : '—');
export const formatMonth = (v) => (toDate(v) ? monthFmt.format(toDate(v)) : '');

/** "Today", "Tomorrow", "In 5 days", "3 days ago". */
export function relativeDays(value) {
  const n = daysUntil(value);
  if (n === null) return '';
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  if (n === -1) return 'Yesterday';
  return n > 0 ? `In ${n} days` : `${Math.abs(n)} days ago`;
}

export function timeAgo(value) {
  const d = toDate(value);
  if (!d) return '';
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(d);
}

export function ageFrom(dob) {
  const d = toDate(dob);
  if (!d) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  if (now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) age--;
  return age;
}
