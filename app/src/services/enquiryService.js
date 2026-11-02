import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { getActor } from './session';
import { logActivity } from './activityService';

const col = () => collection(db, 'enquiries');

export async function listEnquiries({ status = 'all', pageSize = 20, cursor = null } = {}) {
  const parts = [];
  if (status !== 'all') parts.push(where('status', '==', status));
  parts.push(orderBy('createdAt', 'desc'));
  if (cursor) parts.push(startAfter(cursor));
  parts.push(limit(pageSize + 1));
  const snap = await getDocs(query(col(), ...parts));
  const docs = snap.docs.slice(0, pageSize);
  return {
    items: docs.map((d) => ({ id: d.id, ...d.data() })),
    cursor: docs[docs.length - 1] || null,
    hasMore: snap.docs.length > pageSize,
  };
}

export async function recentEnquiries(max = 5) {
  const snap = await getDocs(query(col(), orderBy('createdAt', 'desc'), limit(max)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function countNewEnquiries() {
  const snap = await getCountFromServer(query(col(), where('status', '==', 'new')));
  return snap.data().count;
}

export async function updateEnquiry(id, data) {
  await updateDoc(doc(db, 'enquiries', id), { ...data, updatedAt: serverTimestamp(), updatedBy: getActor().uid });
  if (data.status) logActivity(`Marked enquiry as ${data.status}`, 'enquiry', id);
}

export async function deleteEnquiry(id, name) {
  await deleteDoc(doc(db, 'enquiries', id));
  logActivity('Deleted enquiry', 'enquiry', id, name);
}
