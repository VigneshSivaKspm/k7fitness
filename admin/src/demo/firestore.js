/**
 * DEMO BUILD ONLY — an on-device stand-in for `firebase/firestore`.
 *
 * `vite build --mode demo` aliases `firebase/firestore` to this file, so the
 * Android debug APK runs fully offline with sample data and no Firebase
 * project. It implements just the API surface the admin services use, with
 * Firestore-like semantics (typed comparisons, missing fields excluded from
 * filters/orderBy, atomic transactions and batches). Data is kept in
 * localStorage on the device and seeded on first launch (see seed.js).
 */
import { buildSeed } from './seed';

const STORE_KEY = 'k7-demo-db-v1';

// ── Timestamp ──────────────────────────────────────────────────────────────

export class Timestamp {
  constructor(seconds, nanoseconds = 0) {
    this.seconds = seconds;
    this.nanoseconds = nanoseconds;
  }
  static fromMillis(ms) {
    return new Timestamp(Math.floor(ms / 1000), (ms % 1000) * 1e6);
  }
  static fromDate(date) {
    return Timestamp.fromMillis(date.getTime());
  }
  static now() {
    return Timestamp.fromMillis(Date.now());
  }
  toMillis() {
    return this.seconds * 1000 + Math.floor(this.nanoseconds / 1e6);
  }
  toDate() {
    return new Date(this.toMillis());
  }
  isEqual(other) {
    return other instanceof Timestamp && other.toMillis() === this.toMillis();
  }
  valueOf() {
    return String(this.toMillis()).padStart(16, '0');
  }
}

// ── Persistence ────────────────────────────────────────────────────────────

const encode = (v) => JSON.stringify(v, (_k, val) => (val instanceof Timestamp ? { __ts: val.toMillis() } : val));
const decode = (s) => JSON.parse(s, (_k, val) => (val && typeof val === 'object' && '__ts' in val ? Timestamp.fromMillis(val.__ts) : val));

/** { [collectionPath]: { [docId]: data } } */
let store = null;
let saveTimer = null;

function load() {
  if (store) return store;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    store = raw ? decode(raw) : null;
  } catch {
    store = null;
  }
  if (!store) {
    store = buildSeed(Timestamp);
    flush();
  }
  return store;
}

function flush() {
  clearTimeout(saveTimer);
  saveTimer = null;
  try {
    localStorage.setItem(STORE_KEY, encode(store));
  } catch (err) {
    console.warn('[demo] Could not save demo data', err);
  }
}

function scheduleSave() {
  if (!saveTimer) saveTimer = setTimeout(flush, 250);
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => saveTimer && flush());
  document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && saveTimer && flush());
}

/** Wipes all demo data; the next read re-seeds fresh sample data. */
export function resetDemoData() {
  clearTimeout(saveTimer);
  saveTimer = null;
  store = null;
  try {
    localStorage.removeItem(STORE_KEY);
  } catch {
    /* ignore */
  }
}

function clone(v) {
  if (v === null || typeof v !== 'object' || v instanceof Timestamp) return v;
  if (Array.isArray(v)) return v.map(clone);
  const out = {};
  for (const k of Object.keys(v)) out[k] = clone(v[k]);
  return out;
}

const tick = () => new Promise((r) => setTimeout(r, 0));

// ── Database, cache options & emulator (no-ops) ────────────────────────────

const DB = { type: 'firestore', demo: true };
export const initializeFirestore = () => DB;
export const getFirestore = () => DB;
export const memoryLocalCache = () => ({});
export const persistentLocalCache = () => ({});
export const persistentMultipleTabManager = () => ({});
export const connectFirestoreEmulator = () => {};

// ── References ─────────────────────────────────────────────────────────────

function autoId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 20; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function makeDocRef(path) {
  const parts = path.split('/');
  const id = parts.pop();
  const parentPath = parts.join('/');
  return { type: 'document', id, path, parent: { type: 'collection', path: parentPath, id: parts[parts.length - 1] }, firestore: DB };
}

export function collection(parent, ...segments) {
  const base = parent?.type === 'document' ? `${parent.path}/` : '';
  const path = base + segments.join('/');
  return { type: 'collection', path, id: segments[segments.length - 1], firestore: DB, constraints: [] };
}

export function doc(parent, ...segments) {
  if (parent?.type === 'collection') return makeDocRef(`${parent.path}/${segments.length ? segments.join('/') : autoId()}`);
  if (parent?.type === 'document') return makeDocRef(`${parent.path}/${segments.join('/')}`);
  return makeDocRef(segments.join('/'));
}

const split = (ref) => [ref.parent.path, ref.id];

function readRaw(ref) {
  const [col, id] = split(ref);
  const data = load()[col]?.[id];
  if (!data && col === 'admins') {
    return { name: 'Demo Owner', email: 'demo@k7fitness.app', role: 'owner', active: true };
  }
  return data;
}

// ── Field values ───────────────────────────────────────────────────────────

const SENTINEL = Symbol('fieldValue');
export const serverTimestamp = () => ({ [SENTINEL]: 'serverTimestamp' });
export const increment = (n) => ({ [SENTINEL]: 'increment', n });
export const deleteField = () => ({ [SENTINEL]: 'delete' });
export const arrayUnion = (...items) => ({ [SENTINEL]: 'arrayUnion', items });
export const arrayRemove = (...items) => ({ [SENTINEL]: 'arrayRemove', items });

function resolveValue(value, current) {
  if (value && typeof value === 'object' && SENTINEL in value) {
    switch (value[SENTINEL]) {
      case 'serverTimestamp':
        return Timestamp.now();
      case 'increment':
        return (typeof current === 'number' ? current : 0) + value.n;
      case 'arrayUnion': {
        const arr = Array.isArray(current) ? [...current] : [];
        value.items.forEach((i) => !arr.some((a) => equal(a, i)) && arr.push(i));
        return arr;
      }
      case 'arrayRemove':
        return Array.isArray(current) ? current.filter((a) => !value.items.some((i) => equal(a, i))) : [];
      default:
        return undefined;
    }
  }
  if (value === undefined) return undefined;
  if (value && typeof value === 'object' && !(value instanceof Timestamp) && !Array.isArray(value)) {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      const r = resolveValue(v, current?.[k]);
      if (r !== undefined && !(v && typeof v === 'object' && v[SENTINEL] === 'delete')) out[k] = r;
    }
    return out;
  }
  return clone(value);
}

const isDelete = (v) => v && typeof v === 'object' && v[SENTINEL] === 'delete';

function setPath(target, path, value) {
  const keys = path.split('.');
  let obj = target;
  for (const k of keys.slice(0, -1)) {
    if (!obj[k] || typeof obj[k] !== 'object') obj[k] = {};
    obj = obj[k];
  }
  const last = keys[keys.length - 1];
  if (isDelete(value)) delete obj[last];
  else {
    const r = resolveValue(value, obj[last]);
    if (r !== undefined) obj[last] = r;
  }
}

function getPath(data, path) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), data);
}

// ── Comparison (Firestore type ordering) ───────────────────────────────────

function rank(v) {
  if (v === null) return 0;
  if (typeof v === 'boolean') return 1;
  if (typeof v === 'number') return 2;
  if (v instanceof Timestamp) return 3;
  if (typeof v === 'string') return 4;
  if (Array.isArray(v)) return 5;
  return 6;
}

function compare(a, b) {
  const ra = rank(a);
  const rb = rank(b);
  if (ra !== rb) return ra - rb;
  switch (ra) {
    case 0:
      return 0;
    case 1:
    case 2:
      return Number(a) - Number(b);
    case 3:
      return a.toMillis() - b.toMillis();
    case 4:
      return a < b ? -1 : a > b ? 1 : 0;
    default: {
      const ea = encode(a);
      const eb = encode(b);
      return ea < eb ? -1 : ea > eb ? 1 : 0;
    }
  }
}

const equal = (a, b) => rank(a) === rank(b) && compare(a, b) === 0;

function matchesFilter(data, { field, op, value }) {
  const v = getPath(data, field);
  if (v === undefined) return false;
  switch (op) {
    case '==':
      return equal(v, value);
    case '!=':
      return v !== null && !equal(v, value);
    case '<':
      return rank(v) === rank(value) && compare(v, value) < 0;
    case '<=':
      return rank(v) === rank(value) && compare(v, value) <= 0;
    case '>':
      return rank(v) === rank(value) && compare(v, value) > 0;
    case '>=':
      return rank(v) === rank(value) && compare(v, value) >= 0;
    case 'in':
      return value.some((x) => equal(v, x));
    case 'not-in':
      return v !== null && !value.some((x) => equal(v, x));
    case 'array-contains':
      return Array.isArray(v) && v.some((x) => equal(x, value));
    case 'array-contains-any':
      return Array.isArray(v) && v.some((x) => value.some((y) => equal(x, y)));
    default:
      throw new Error(`[demo] Unsupported operator ${op}`);
  }
}

// ── Queries ────────────────────────────────────────────────────────────────

export const where = (field, op, value) => ({ kind: 'where', field, op, value });
export const orderBy = (field, dir = 'asc') => ({ kind: 'orderBy', field, dir });
export const limit = (n) => ({ kind: 'limit', n });
export const startAfter = (snap) => ({ kind: 'startAfter', snap });

export function query(ref, ...constraints) {
  return { ...ref, type: 'query', constraints: [...(ref.constraints || []), ...constraints] };
}

class DocumentSnapshot {
  constructor(ref, data) {
    this.ref = ref;
    this.id = ref.id;
    this._data = data;
  }
  exists() {
    return this._data !== undefined;
  }
  data() {
    return this._data === undefined ? undefined : clone(this._data);
  }
  get(field) {
    return clone(getPath(this._data, field));
  }
}

class QuerySnapshot {
  constructor(docs) {
    this.docs = docs;
    this.size = docs.length;
    this.empty = docs.length === 0;
  }
  forEach(fn) {
    this.docs.forEach(fn);
  }
}

function run(q) {
  const items = Object.entries(load()[q.path] || {}).map(([id, data]) => ({ id, data }));
  const cs = q.constraints || [];
  const filters = cs.filter((c) => c.kind === 'where');
  const orders = cs.filter((c) => c.kind === 'orderBy');
  const lim = cs.filter((c) => c.kind === 'limit').pop();
  const after = cs.filter((c) => c.kind === 'startAfter').pop();

  // Like Firestore, an inequality filter without an explicit orderBy orders by that field.
  if (!orders.length) {
    const ineq = filters.find((f) => ['<', '<=', '>', '>=', '!=', 'not-in'].includes(f.op));
    if (ineq) orders.push({ field: ineq.field, dir: 'asc' });
  }

  let rows = items.filter((r) => filters.every((f) => matchesFilter(r.data, f)));
  rows = rows.filter((r) => orders.every((o) => getPath(r.data, o.field) !== undefined));
  const lastDir = orders.length ? orders[orders.length - 1].dir : 'asc';
  rows.sort((a, b) => {
    for (const o of orders) {
      const c = compare(getPath(a.data, o.field), getPath(b.data, o.field));
      if (c) return o.dir === 'desc' ? -c : c;
    }
    const c = a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    return lastDir === 'desc' ? -c : c;
  });

  if (after?.snap) {
    const idx = rows.findIndex((r) => r.id === after.snap.id);
    if (idx >= 0) rows = rows.slice(idx + 1);
    else if (after.snap._data) {
      // Cursor document no longer matches: continue after its sort position.
      const pivot = { id: after.snap.id, data: after.snap._data };
      rows = rows.filter((r) => {
        for (const o of orders) {
          const c = compare(getPath(r.data, o.field), getPath(pivot.data, o.field));
          if (c) return (o.dir === 'desc' ? -c : c) > 0;
        }
        return (lastDir === 'desc' ? pivot.id > r.id : r.id > pivot.id);
      });
    }
  }
  if (lim) rows = rows.slice(0, lim.n);
  return rows.map((r) => new DocumentSnapshot(makeDocRef(`${q.path}/${r.id}`), r.data));
}

export async function getDocs(q) {
  await tick();
  return new QuerySnapshot(run(q));
}

export async function getDoc(ref) {
  await tick();
  return new DocumentSnapshot(ref, readRaw(ref));
}

// ── Aggregation ────────────────────────────────────────────────────────────

export const count = () => ({ kind: 'count' });
export const sum = (field) => ({ kind: 'sum', field });
export const average = (field) => ({ kind: 'avg', field });

export async function getCountFromServer(q) {
  await tick();
  const n = run(q).length;
  return { data: () => ({ count: n }) };
}

export async function getAggregateFromServer(q, spec) {
  await tick();
  const docs = run(q);
  const out = {};
  for (const [key, agg] of Object.entries(spec)) {
    if (agg.kind === 'count') out[key] = docs.length;
    else {
      const nums = docs.map((d) => getPath(d._data, agg.field)).filter((v) => typeof v === 'number');
      const total = nums.reduce((a, b) => a + b, 0);
      out[key] = agg.kind === 'sum' ? total : nums.length ? total / nums.length : null;
    }
  }
  return { data: () => out };
}

// ── Writes ─────────────────────────────────────────────────────────────────

function notFound(ref) {
  const err = new Error(`No document to update: ${ref.path}`);
  err.code = 'not-found';
  return err;
}

function applyWrite({ kind, ref, data, options }) {
  const db = load();
  const [col, id] = split(ref);
  db[col] ||= {};
  const current = db[col][id];
  if (kind === 'delete') {
    delete db[col][id];
    return;
  }
  if (kind === 'update') {
    if (!current) throw notFound(ref);
    const next = clone(current);
    for (const [k, v] of Object.entries(data)) setPath(next, k, v);
    db[col][id] = next;
    return;
  }
  // set
  if (options?.merge && current) {
    const next = clone(current);
    const mergeInto = (target, src) => {
      for (const [k, v] of Object.entries(src)) {
        if (isDelete(v)) delete target[k];
        else if (v && typeof v === 'object' && !(SENTINEL in v) && !(v instanceof Timestamp) && !Array.isArray(v)) {
          target[k] = target[k] && typeof target[k] === 'object' && !(target[k] instanceof Timestamp) ? target[k] : {};
          mergeInto(target[k], v);
        } else {
          const r = resolveValue(v, target[k]);
          if (r !== undefined) target[k] = r;
        }
      }
    };
    mergeInto(next, data);
    db[col][id] = next;
  } else {
    db[col][id] = resolveValue(data, undefined) || {};
  }
}

function commit(ops) {
  // Validate before applying so a failing batch leaves nothing half-written.
  const db = load();
  const created = new Set();
  for (const op of ops) {
    const key = op.ref.path;
    const [col, id] = split(op.ref);
    if (op.kind === 'set') created.add(key);
    else if (op.kind === 'delete') created.delete(key);
    else if (op.kind === 'update' && !db[col]?.[id] && !created.has(key)) throw notFound(op.ref);
  }
  ops.forEach(applyWrite);
  scheduleSave();
}

export async function setDoc(ref, data, options) {
  await tick();
  commit([{ kind: 'set', ref, data, options }]);
}

export async function updateDoc(ref, data) {
  await tick();
  commit([{ kind: 'update', ref, data }]);
}

export async function deleteDoc(ref) {
  await tick();
  commit([{ kind: 'delete', ref }]);
}

export async function addDoc(colRef, data) {
  const ref = doc(colRef);
  await setDoc(ref, data);
  return ref;
}

export function writeBatch() {
  const ops = [];
  const batch = {
    set: (ref, data, options) => (ops.push({ kind: 'set', ref, data, options }), batch),
    update: (ref, data) => (ops.push({ kind: 'update', ref, data }), batch),
    delete: (ref) => (ops.push({ kind: 'delete', ref }), batch),
    commit: async () => {
      await tick();
      commit(ops);
    },
  };
  return batch;
}

// Transactions run one at a time, so reads and writes never interleave.
let txQueue = Promise.resolve();

export function runTransaction(_db, fn) {
  const result = txQueue.then(async () => {
    const ops = [];
    const tx = {
      get: async (ref) => new DocumentSnapshot(ref, readRaw(ref)),
      set: (ref, data, options) => (ops.push({ kind: 'set', ref, data, options }), tx),
      update: (ref, data) => (ops.push({ kind: 'update', ref, data }), tx),
      delete: (ref) => (ops.push({ kind: 'delete', ref }), tx),
    };
    const value = await fn(tx);
    commit(ops);
    return value;
  });
  txQueue = result.catch(() => {});
  return result;
}

/** Live listeners are not used by the admin; provided as a one-shot read for safety. */
export function onSnapshot(ref, next) {
  const fire = () => (ref.type === 'document' ? getDoc(ref) : getDocs(ref)).then(next);
  fire();
  return () => {};
}
