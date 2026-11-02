import { normalizePhone } from './format';
import { parseDateInput } from './dates';

/**
 * Small, explicit validators. Each returns an error message or '' (valid).
 * Compose them per form with `collectErrors`.
 */
export const v = {
  required: (label) => (value) =>
    value === undefined || value === null || String(value).trim() === '' ? `${label} is required.` : '',

  minLength: (label, n) => (value) => (value && String(value).trim().length < n ? `${label} must be at least ${n} characters.` : ''),

  maxLength: (label, n) => (value) => (value && String(value).length > n ? `${label} must be ${n} characters or fewer.` : ''),

  phone: (label = 'Phone number') => (value) => {
    if (!value) return '';
    const d = normalizePhone(value);
    return /^[6-9]\d{9}$/.test(d) || (d.length >= 11 && d.length <= 13) ? '' : `${label} must be a valid 10-digit mobile number.`;
  },

  email: () => (value) => (!value || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value).trim()) ? '' : 'Enter a valid email address.'),

  number: (label, { min, max, integer, positive } = {}) => (value) => {
    if (value === '' || value === null || value === undefined) return '';
    const n = Number(value);
    if (!Number.isFinite(n)) return `${label} must be a number.`;
    if (integer && !Number.isInteger(n)) return `${label} must be a whole number.`;
    if (positive && n <= 0) return `${label} must be greater than 0.`;
    if (min !== undefined && n < min) return `${label} cannot be less than ${min}.`;
    if (max !== undefined && n > max) return `${label} cannot be more than ${max}.`;
    return '';
  },

  date: (label) => (value) => (!value || parseDateInput(value) ? '' : `${label} is not a valid date.`),

  notFuture: (label) => (value) => {
    const d = parseDateInput(value);
    return d && d > new Date() ? `${label} cannot be in the future.` : '';
  },

  url: (label = 'Link') => (value) => (!value || /^https?:\/\/\S+$/i.test(String(value).trim()) ? '' : `${label} must start with https://`),

  link: (label = 'Link') => (value) =>
    !value || /^(https?:\/\/\S+|#[\w-]+|\/\S*|tel:\S+|mailto:\S+)$/i.test(String(value).trim())
      ? ''
      : `${label} must be a full URL (https://…) or a section link like #contact.`,
};

/**
 * @param {object} values
 * @param {Record<string, Array<(value, values) => string>>} schema
 */
export function collectErrors(values, schema) {
  const errors = {};
  for (const [key, rules] of Object.entries(schema)) {
    for (const rule of rules) {
      const msg = rule(values[key], values);
      if (msg) {
        errors[key] = msg;
        break;
      }
    }
  }
  return errors;
}

/** Focuses the first invalid field so mobile users see the problem. */
export function focusFirstError(errors) {
  const key = Object.keys(errors)[0];
  if (!key) return;
  const el = document.querySelector(`[name="${key}"]`);
  if (el) {
    el.focus({ preventScroll: true });
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}
