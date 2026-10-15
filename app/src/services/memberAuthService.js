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
import { AppError } from '../utils/errors';

export const MEMBER_SESSION_KEY = 'k7_member_session';

/** Simple, reliable client-side password hashing using Web Crypto API. */
export async function hashPassword(password, salt = 'k7-fitness-salt') {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password + salt),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: 10000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt']
  );
  const exported = await crypto.subtle.exportKey('raw', key);
  return Array.from(new Uint8Array(exported))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Check if a member exists by their Member ID (case-insensitive: e.g. K7-001 or k7-001). */
export async function findMemberById(memberId) {
  if (!memberId || !memberId.trim()) {
    throw new AppError('Please enter your Member ID.');
  }

  const cleanId = memberId.trim().toUpperCase();
  const lowerId = cleanId.toLowerCase();

  // Try direct memberId match
  const colRef = collection(db, 'trainees');
  let q = query(colRef, where('memberId', '==', cleanId), limit(1));
  let snap = await getDocs(q);

  if (snap.empty) {
    // Try lowerId match if memberId was lowercase
    q = query(colRef, where('memberIdLower', '==', lowerId), limit(1));
    snap = await getDocs(q);
  }

  if (snap.empty) {
    // In demo mode or if counter padded with 4 digits, also try e.g. K7-0001
    const parts = cleanId.split('-');
    if (parts.length === 2) {
      const prefix = parts[0];
      const num = parseInt(parts[1], 10);
      if (!isNaN(num)) {
        const altId4 = `${prefix}-${String(num).padStart(4, '0')}`;
        q = query(colRef, where('memberId', '==', altId4), limit(1));
        snap = await getDocs(q);
      }
    }
  }

  if (snap.empty) {
    return null;
  }

  const docSnap = snap.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
}

/** Complete first time setup by creating the password and setting preferred workout timings. */
export async function setupFirstTimePassword(traineeId, newPassword, extraData = {}) {
  if (!newPassword || newPassword.length < 6) {
    throw new AppError('Password must be at least 6 characters long.');
  }

  const passwordHash = await hashPassword(newPassword);
  const traineeRef = doc(db, 'trainees', traineeId);

  const preferredIn = extraData.preferredInTime || '06:00 AM';
  const preferredOut = extraData.preferredOutTime || '07:30 AM';

  await updateDoc(traineeRef, {
    firstLoginDone: true,
    hasPassword: true,
    passwordHash,
    preferredInTime: preferredIn,
    preferredOutTime: preferredOut,
    preferredSlot: `${preferredIn} – ${preferredOut}`,
    passwordSetAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const updatedSnap = await getDoc(traineeRef);
  const memberData = { id: traineeId, ...updatedSnap.data() };
  saveMemberSession(memberData);
  return memberData;
}

/** Log in a returning member with Member ID and Password. */
export async function loginMember(memberId, password) {
  const member = await findMemberById(memberId);
  if (!member) {
    throw new AppError(`No member found with ID "${memberId}". Please verify your Member ID.`);
  }

  if (member.status === 'inactive') {
    throw new AppError('This membership account is inactive. Please visit reception.');
  }

  // If first time login (no password set yet)
  if (!member.firstLoginDone || !member.hasPassword || !member.passwordHash) {
    return { firstTime: true, member };
  }

  if (!password) {
    throw new AppError('Please enter your password.');
  }

  const enteredHash = await hashPassword(password);
  if (enteredHash !== member.passwordHash) {
    throw new AppError('Incorrect password. If you forgot your password, contact gym reception to reset it.');
  }

  saveMemberSession(member);
  return { firstTime: false, member };
}

/** Change password for logged in member. */
export async function changeMemberPassword(traineeId, currentPassword, newPassword) {
  if (!newPassword || newPassword.length < 6) {
    throw new AppError('New password must be at least 6 characters long.');
  }

  const traineeRef = doc(db, 'trainees', traineeId);
  const snap = await getDoc(traineeRef);
  if (!snap.exists()) {
    throw new AppError('Member record not found.');
  }

  const current = snap.data();
  if (current.passwordHash) {
    const curHash = await hashPassword(currentPassword);
    if (curHash !== current.passwordHash) {
      throw new AppError('Current password does not match.');
    }
  }

  const passwordHash = await hashPassword(newPassword);
  await updateDoc(traineeRef, {
    firstLoginDone: true,
    hasPassword: true,
    passwordHash,
    passwordSetAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const updatedSnap = await getDoc(traineeRef);
  const memberData = { id: traineeId, ...updatedSnap.data() };
  saveMemberSession(memberData);
  return memberData;
}

/** Gym staff can reset a member's login so they can log in without password and set a new one. */
export async function resetMemberLogin(traineeId) {
  const traineeRef = doc(db, 'trainees', traineeId);
  await updateDoc(traineeRef, {
    firstLoginDone: false,
    hasPassword: false,
    passwordHash: null,
    updatedAt: serverTimestamp(),
  });
}

export function saveMemberSession(member) {
  try {
    const safeData = {
      id: member.id,
      memberId: member.memberId,
      fullName: member.fullName,
      phone: member.phone,
      email: member.email || '',
      gender: member.gender || 'male',
      age: member.age || null,
      height: member.height || null,
      weight: member.weight || null,
      bmi: member.bmi || null,
      bodyType: member.bodyType || 'mesomorph',
      goal: member.goal || 'general_fitness',
      status: member.status,
      currentPlanName: member.currentPlanName || '',
      membershipStart: member.membershipStart?.toMillis?.() || member.membershipStart || null,
      membershipExpiry: member.membershipExpiry?.toMillis?.() || member.membershipExpiry || null,
      totalFee: member.totalFee || 0,
      totalPaid: member.totalPaid || 0,
      pendingAmount: member.pendingAmount || 0,
      photoUrl: member.photoUrl || '',
      loggedInAt: Date.now(),
    };
    localStorage.setItem(MEMBER_SESSION_KEY, JSON.stringify(safeData));
  } catch (err) {
    console.error('Failed to save member session', err);
  }
}

export function updateStoredMemberSession(fields) {
  try {
    const cur = getStoredMemberSession() || {};
    const updated = { ...cur, ...fields };
    localStorage.setItem(MEMBER_SESSION_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return null;
  }
}

export function getStoredMemberSession() {
  try {
    const raw = localStorage.getItem(MEMBER_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearMemberSession() {
  try {
    localStorage.removeItem(MEMBER_SESSION_KEY);
  } catch {
    /* ignore */
  }
}
