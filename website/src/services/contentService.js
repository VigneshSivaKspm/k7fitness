import { collection, doc, getDoc, getDocs, limit, orderBy, query, Timestamp, where } from 'firebase/firestore/lite';
import { db } from '../firebase/config';

const mapDocs = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }));

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

const singleton = (id) => () =>
  getDoc(doc(db, 'websiteSettings', id)).then((s) => (s.exists() ? s.data() : null));

const activeOrdered = (name, max = 50) => () =>
  getDocs(query(collection(db, name), where('active', '==', true), orderBy('displayOrder'), limit(max))).then(mapDocs);

/** Each query mirrors the public read constraints in firestore.rules. */
const loaders = {
  hero: singleton('hero'),
  about: singleton('about'),
  contact: singleton('contact'),
  plans: () =>
    getDocs(
      query(
        collection(db, 'membershipPlans'),
        where('active', '==', true),
        where('showOnWebsite', '==', true),
        orderBy('displayOrder'),
      ),
    ).then(mapDocs),
  programs: activeOrdered('programs'),
  trainers: activeOrdered('trainers'),
  gallery: activeOrdered('gallery', 60),
  testimonials: activeOrdered('testimonials', 30),
  offers: () =>
    getDocs(
      query(
        collection(db, 'offers'),
        where('active', '==', true),
        where('endDate', '>=', Timestamp.fromDate(startOfToday())),
        orderBy('endDate'),
        limit(5),
      ),
    ).then((snap) => {
      const now = Date.now();
      // Expired offers are excluded by the query; offers not yet started are hidden here.
      return mapDocs(snap).filter((o) => !o.startDate || o.startDate.toMillis() <= now);
    }),
};

/**
 * Loads every public section in parallel. A failure in one section (for
 * example an index still building) never takes down the whole page.
 */
export async function fetchWebsiteContent() {
  if (!db) return {};
  const keys = Object.keys(loaders);
  const results = await Promise.allSettled(keys.map((k) => loaders[k]()));
  return keys.reduce((acc, key, i) => {
    const r = results[i];
    if (r.status === 'fulfilled') acc[key] = r.value;
    else if (import.meta.env.DEV) console.warn(`[content] ${key} failed to load:`, r.reason?.message);
    return acc;
  }, {});
}
