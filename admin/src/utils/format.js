const formatters = new Map();

/** ₹1,500 · ₹12,000 · ₹25,500 — whole rupees unless paise are present. */
export function formatCurrency(value, currency = 'INR') {
  const n = Number(value) || 0;
  const hasFraction = Math.round(n * 100) % 100 !== 0;
  const key = `${currency}-${hasFraction}`;
  if (!formatters.has(key)) {
    formatters.set(
      key,
      new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en', {
        style: 'currency',
        currency,
        minimumFractionDigits: hasFraction ? 2 : 0,
        maximumFractionDigits: hasFraction ? 2 : 0,
      }),
    );
  }
  return formatters.get(key).format(n);
}

export function currencySymbol(currency = 'INR') {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).formatToParts(0).find((x) => x.type === 'currency')?.value || currency;
  } catch {
    return currency;
  }
}

export function formatNumber(value) {
  return new Intl.NumberFormat('en-IN').format(Number(value) || 0);
}

/** Rounds money to paise to avoid floating point drift (0.1 + 0.2). */
export function roundMoney(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

export function phoneDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

/** Normalises Indian mobile numbers to 10 digits; leaves other formats as digits. */
export function normalizePhone(value) {
  const d = phoneDigits(value);
  if (d.length === 12 && d.startsWith('91')) return d.slice(2);
  if (d.length === 11 && d.startsWith('0')) return d.slice(1);
  return d;
}

export function formatPhone(value) {
  const d = normalizePhone(value);
  if (d.length === 10) return `${d.slice(0, 5)} ${d.slice(5)}`;
  return d || '';
}

export function telLink(value) {
  const d = normalizePhone(value);
  if (!d) return '';
  return d.length === 10 ? `tel:+91${d}` : `tel:+${d}`;
}

export function whatsappLink(value, message = '') {
  let d = normalizePhone(value);
  if (!d) return '';
  if (d.length === 10) d = `91${d}`;
  return `https://wa.me/${d}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}

/** Replaces {name}, {expiryDate}… placeholders in WhatsApp templates. */
export function fillTemplate(template, values) {
  return String(template || '').replace(/\{(\w+)\}/g, (match, key) => (values[key] ?? match));
}

export function initials(name) {
  return (
    String(name || '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || '?'
  );
}

export function durationLabel(duration, unit) {
  const n = Number(duration) || 0;
  const u = unit === 'days' ? 'day' : unit === 'years' ? 'year' : 'month';
  return `${n} ${u}${n === 1 ? '' : 's'}`;
}

export function pluralize(n, word, plural = `${word}s`) {
  return `${formatNumber(n)} ${n === 1 ? word : plural}`;
}

export function uid() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);
}

const WEBSITE_BASE = String(import.meta.env.VITE_WEBSITE_URL || '').replace(/\/$/, '');

/**
 * Website images bundled with the site are stored as paths like
 * "/images/hero.webp". The admin runs on a different domain, so resolve
 * them against the website URL for previews. Uploaded images are full URLs.
 */
export function mediaUrl(url) {
  return url && url.startsWith('/') ? `${WEBSITE_BASE}${url}` : url;
}
