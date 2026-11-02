import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { getActor } from './session';
import { logActivity } from './activityService';
import { deleteFile } from './storageService';

const mapDoc = (d) => ({ id: d.id, ...d.data() });

const LABELS = {
  programs: 'program',
  trainers: 'trainer',
  gallery: 'gallery image',
  testimonials: 'testimonial',
  offers: 'offer',
  membershipPlans: 'membership plan',
};

// ── Singleton sections: hero, about, contact ───────────────────────────────

export async function getSection(id) {
  const snap = await getDoc(doc(db, 'websiteSettings', id));
  return snap.exists() ? snap.data() : null;
}

export async function saveSection(id, data) {
  await setDoc(doc(db, 'websiteSettings', id), { ...data, updatedAt: serverTimestamp(), updatedBy: getActor().uid }, { merge: true });
  logActivity(`Updated website ${id}`, 'website', id);
}

// ── Ordered collections: programs, trainers, gallery, testimonials, offers, plans ──

export async function listItems(name) {
  const order = name === 'offers' ? orderBy('endDate', 'desc') : orderBy('displayOrder');
  const snap = await getDocs(query(collection(db, name), order));
  return snap.docs.map(mapDoc);
}

export async function createItem(name, data, nextOrder = 0) {
  const actor = getActor();
  const ref = await addDoc(collection(db, name), {
    ...data,
    displayOrder: nextOrder,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: actor.uid,
    updatedBy: actor.uid,
  });
  logActivity(`Added ${LABELS[name] || name}`, name, ref.id, data.name || data.title || '');
  return ref.id;
}

export async function updateItem(name, id, data, { previousImagePath } = {}) {
  await updateDoc(doc(db, name, id), { ...data, updatedAt: serverTimestamp(), updatedBy: getActor().uid });
  const newPath = data.imagePath ?? data.photoPath;
  if (previousImagePath && newPath !== undefined && previousImagePath !== newPath) deleteFile(previousImagePath).catch(() => {});
  logActivity(`Updated ${LABELS[name] || name}`, name, id, data.name || data.title || '');
}

export async function setItemFields(name, id, fields) {
  await updateDoc(doc(db, name, id), { ...fields, updatedAt: serverTimestamp(), updatedBy: getActor().uid });
  logActivity(`Updated ${LABELS[name] || name}`, name, id, Object.keys(fields).join(', '));
}

export async function deleteItem(name, item) {
  await deleteDoc(doc(db, name, item.id));
  const path = item.imagePath || item.photoPath;
  if (path) deleteFile(path).catch(() => {});
  logActivity(`Deleted ${LABELS[name] || name}`, name, item.id, item.name || item.title || '');
}

/** Swaps the display order of two neighbouring items. */
export async function swapOrder(name, a, b) {
  const batch = writeBatch(db);
  batch.update(doc(db, name, a.id), { displayOrder: b.displayOrder ?? 0 });
  batch.update(doc(db, name, b.id), { displayOrder: a.displayOrder ?? 0 });
  await batch.commit();
}

/** Re-numbers display order 0..n after a move, so gaps/duplicates self-heal. */
export async function reorderItems(name, items) {
  const batch = writeBatch(db);
  items.forEach((item, i) => batch.update(doc(db, name, item.id), { displayOrder: i }));
  await batch.commit();
}

export async function countActive(name) {
  const snap = await getCountFromServer(query(collection(db, name), where('active', '==', true)));
  return snap.data().count;
}
