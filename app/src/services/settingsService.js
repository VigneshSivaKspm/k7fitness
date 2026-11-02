import { collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getActor } from './session';
import { logActivity } from './activityService';

const generalRef = () => doc(db, 'settings', 'general');
const contactRef = () => doc(db, 'websiteSettings', 'contact');

export async function getGeneralSettings() {
  const snap = await getDoc(generalRef());
  return snap.exists() ? snap.data() : null;
}

export async function saveGeneralSettings(data) {
  await setDoc(generalRef(), { ...data, updatedAt: serverTimestamp(), updatedBy: getActor().uid }, { merge: true });
  logActivity('Updated settings', 'settings', 'general');
}

/** Gym name, logo and contact details live in websiteSettings/contact (shared with the website). */
export async function getBusinessProfile() {
  const snap = await getDoc(contactRef());
  return snap.exists() ? snap.data() : null;
}

export async function listAdmins() {
  const snap = await getDocs(query(collection(db, 'admins'), orderBy('name')));
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
}

export async function updateAdmin(uid, data) {
  await updateDoc(doc(db, 'admins', uid), { ...data, updatedAt: serverTimestamp() });
  logActivity('Updated admin account', 'admin', uid, Object.keys(data).join(', '));
}
