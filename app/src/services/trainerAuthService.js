import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { hashPassword } from './memberAuthService';
import { AppError } from '../utils/errors';

export const TRAINER_SESSION_KEY = 'k7_trainer_session';

const mapDoc = (d) => ({ id: d.id, ...d.data() });

/**
 * List all registered trainers from the 'trainers' collection.
 */
export async function listAllTrainers() {
  try {
    const snap = await getDocs(collection(db, 'trainers'));
    return snap.docs.map(mapDoc);
  } catch (err) {
    console.error('Failed to list trainers:', err);
    return [];
  }
}

/**
 * Lookup a trainer by Name, ID, Phone, or Email.
 */
export async function findTrainerByIdentifier(identifier) {
  if (!identifier || !identifier.trim()) {
    throw new AppError('Please enter your Trainer Name, ID or Phone.');
  }

  const clean = identifier.trim().toLowerCase();
  const trainers = await listAllTrainers();

  const found = trainers.find((t) => {
    if (t.id?.toLowerCase() === clean) return true;
    if (t.name?.toLowerCase() === clean) return true;
    if (t.name?.toLowerCase().includes(clean)) return true;
    if (t.phone && t.phone.replace(/\D/g, '') === clean.replace(/\D/g, '')) return true;
    if (t.email && t.email.toLowerCase() === clean) return true;
    return false;
  });

  if (!found) {
    throw new AppError('No trainer profile found with these details. Please contact the gym manager.');
  }

  return found;
}

/**
 * Authenticate trainer with their password.
 */
export async function trainerLogin(trainerId, password) {
  if (!trainerId) throw new AppError('Trainer ID is required.');
  if (!password || !password.trim()) throw new AppError('Please enter your password.');

  const ref = doc(db, 'trainers', trainerId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    throw new AppError('Trainer profile could not be found.');
  }

  const trainer = mapDoc(snap);

  // If trainer has not set a password yet, instruct first-time setup
  if (!trainer.hasPassword || !trainer.firstLoginDone || !trainer.passwordHash) {
    throw new AppError('FIRST_TIME_LOGIN');
  }

  const inputHash = await hashPassword(password);
  if (inputHash !== trainer.passwordHash) {
    throw new AppError('Incorrect password. Please try again or ask reception to reset.');
  }

  const session = {
    id: trainer.id,
    name: trainer.name,
    specialization: trainer.specialization || 'Personal Trainer',
    photoUrl: trainer.photoUrl || '',
    phone: trainer.phone || '',
    email: trainer.email || '',
    role: 'trainer',
    signedInAt: Date.now(),
  };

  storeTrainerSession(session);
  return session;
}

/**
 * First-time password creation for a trainer.
 */
export async function trainerSetupPassword(trainerId, newPassword) {
  if (!trainerId) throw new AppError('Trainer ID is required.');
  if (!newPassword || newPassword.length < 6) {
    throw new AppError('Password must be at least 6 characters.');
  }

  const ref = doc(db, 'trainers', trainerId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new AppError('Trainer not found.');

  const passwordHash = await hashPassword(newPassword);

  await updateDoc(ref, {
    passwordHash,
    hasPassword: true,
    firstLoginDone: true,
    updatedAt: serverTimestamp(),
  });

  const trainer = mapDoc(snap);
  const session = {
    id: trainer.id,
    name: trainer.name,
    specialization: trainer.specialization || 'Personal Trainer',
    photoUrl: trainer.photoUrl || '',
    phone: trainer.phone || '',
    email: trainer.email || '',
    role: 'trainer',
    signedInAt: Date.now(),
  };

  storeTrainerSession(session);
  return session;
}

/**
 * Reset trainer password (admin action).
 */
export async function resetTrainerPassword(trainerId) {
  const ref = doc(db, 'trainers', trainerId);
  await updateDoc(ref, {
    hasPassword: false,
    firstLoginDone: false,
    passwordHash: null,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Fetch all Personal Training members assigned to this specific trainer.
 */
export async function listAssignedMembers(trainerId) {
  if (!trainerId) return [];
  try {
    const snap = await getDocs(collection(db, 'trainees'));
    const all = snap.docs.map(mapDoc);
    // Match by assignedTrainerId or assignedTrainerName
    return all.filter(
      (m) =>
        m.assignedTrainerId === trainerId ||
        (m.planType === 'personal_training' && m.assignedTrainerId === trainerId)
    );
  } catch (err) {
    console.error('Failed to list assigned PT members:', err);
    return [];
  }
}

/**
 * Local storage session persistence for trainer.
 */
export function storeTrainerSession(session) {
  try {
    localStorage.setItem(TRAINER_SESSION_KEY, JSON.stringify(session));
  } catch {}
}

export function getStoredTrainerSession() {
  try {
    const s = localStorage.getItem(TRAINER_SESSION_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function clearTrainerSession() {
  try {
    localStorage.removeItem(TRAINER_SESSION_KEY);
  } catch {}
}
