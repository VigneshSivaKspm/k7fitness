import { addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp, startAfter, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getActor } from './session';

const col = () => collection(db, 'activityLogs');

/**
 * Append-only audit trail. Fire-and-forget: a logging failure must never
 * block or fail the action the admin just completed.
 */
export function logActivity(action, recordType, recordId = '', details = '') {
  const actor = getActor();
  if (!actor.uid) return;
  addDoc(col(), {
    adminUid: actor.uid,
    adminName: actor.name,
    action,
    recordType,
    recordId,
    details: String(details).slice(0, 300),
    createdAt: serverTimestamp(),
  }).catch(() => {});
}

export async function listActivity({ pageSize = 25, cursor = null } = {}) {
  const q = cursor
    ? query(col(), orderBy('createdAt', 'desc'), startAfter(cursor), limit(pageSize + 1))
    : query(col(), orderBy('createdAt', 'desc'), limit(pageSize + 1));
  const snap = await getDocs(q);
  const docs = snap.docs.slice(0, pageSize);
  return {
    items: docs.map((d) => ({ id: d.id, ...d.data() })),
    cursor: docs[docs.length - 1] || null,
    hasMore: snap.docs.length > pageSize,
  };
}

export async function listRecordActivity(recordId, max = 30) {
  const snap = await getDocs(query(col(), where('recordId', '==', recordId), orderBy('createdAt', 'desc'), limit(max)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
