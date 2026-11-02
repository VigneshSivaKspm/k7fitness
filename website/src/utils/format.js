const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export function formatCurrency(value) {
  const n = Number(value);
  return Number.isFinite(n) ? inr.format(n) : '';
}

/** "per month", "per quarter", "for 6 months" style labels for pricing cards. */
export function formatDuration(duration, unit) {
  const n = Number(duration) || 0;
  if (unit === 'years') return n === 1 ? 'year' : `${n} years`;
  if (unit === 'days') return n === 1 ? 'day' : `${n} days`;
  if (n === 1) return 'month';
  if (n === 3) return 'quarter';
  if (n === 12) return 'year';
  return `${n} months`;
}

export function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDate(value) {
  const d = toDate(value);
  return d ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
}

export function phoneDigits(phone) {
  return String(phone || '').replace(/\D/g, '');
}

/** wa.me needs the international number without "+". Assumes India (+91) for 10-digit numbers. */
export function whatsappLink(phone, message = '') {
  let digits = phoneDigits(phone);
  if (digits.length === 10) digits = `91${digits}`;
  if (!digits) return '';
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}

export function telLink(phone) {
  const digits = phoneDigits(phone);
  if (!digits) return '';
  return `tel:${digits.length === 10 ? `+91${digits}` : `+${digits}`}`;
}

/** Only allow links the CMS should reasonably produce (blocks javascript: etc.). */
export function safeUrl(url, fallback = '#') {
  const value = String(url || '').trim();
  return /^(https?:\/\/|#|\/|mailto:|tel:)/i.test(value) ? value : fallback;
}

export function isExternal(url) {
  return /^https?:\/\//i.test(String(url || ''));
}
