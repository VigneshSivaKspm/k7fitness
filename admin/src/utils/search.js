import { normalizePhone } from './format';

const MAX_TOKEN = 30;

/**
 * Builds lowercase prefix tokens so trainees can be found by any of:
 * first/last name prefix, full-name prefix, phone prefix or last digits,
 * member ID ("k7-0012", "0012", "12"). Queried with `array-contains`.
 */
export function buildSearchTokens({ fullName, phone, altPhone, memberId }) {
  const tokens = new Set();
  const words = String(fullName || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  for (const w of words) {
    for (let i = 1; i <= Math.min(w.length, 15); i++) tokens.add(w.slice(0, i));
  }
  const full = words.join(' ');
  for (let i = 2; i <= Math.min(full.length, MAX_TOKEN); i++) tokens.add(full.slice(0, i));

  for (const p of [phone, altPhone]) {
    const d = normalizePhone(p);
    if (d.length >= 4) {
      for (let i = 3; i <= d.length; i++) tokens.add(d.slice(0, i));
      tokens.add(d.slice(-4));
      tokens.add(d.slice(-5));
    }
  }

  if (memberId) {
    const id = String(memberId).toLowerCase();
    for (let i = 2; i <= id.length; i++) tokens.add(id.slice(0, i));
    const num = id.split('-').pop();
    if (num) {
      tokens.add(num);
      tokens.add(String(Number(num)));
    }
  }
  return [...tokens];
}

/** Normalises what the admin typed into a single token to query with. */
export function normalizeSearchTerm(term) {
  const t = String(term || '').trim().toLowerCase();
  if (!t) return '';
  if (/^[+\d\s-]+$/.test(t) && /\d{3,}/.test(t)) {
    const digits = normalizePhone(t);
    return digits.slice(0, MAX_TOKEN);
  }
  return t.replace(/\s+/g, ' ').slice(0, MAX_TOKEN);
}
