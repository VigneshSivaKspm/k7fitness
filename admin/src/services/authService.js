import { sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { setSessionAdmin } from './session';

export async function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function signOutUser() {
  setSessionAdmin(null);
  if (auth) await signOut(auth);
}

export async function sendPasswordReset(email) {
  return sendPasswordResetEmail(auth, email.trim());
}

/** Admin access is granted only by an `admins/{uid}` document — never by sign-up. */
export async function fetchAdminProfile(uid) {
  const snap = await getDoc(doc(db, 'admins', uid));
  if (!snap.exists()) return null;
  const admin = { uid, ...snap.data() };
  setSessionAdmin(admin);
  return admin;
}

/**
 * DEVELOPMENT ONLY — temporary login bypass.
 * Enabled with VITE_DEV_AUTH_BYPASS=true and only in `vite dev` (import.meta.env.DEV),
 * so it is removed from production builds. Signs in a dev admin account
 * automatically; on the Auth emulator the account is created if missing.
 * The admins/{uid} document must exist (scripts/create-admin.mjs).
 */
export const DEV_AUTH_BYPASS = import.meta.env.DEV && import.meta.env.VITE_DEV_AUTH_BYPASS === 'true';

export async function devBypassSignIn() {
  if (!DEV_AUTH_BYPASS) return;
  const email = import.meta.env.VITE_DEV_ADMIN_EMAIL || 'dev@k7.local';
  const password = import.meta.env.VITE_DEV_ADMIN_PASSWORD || 'dev-password-123';
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    if (import.meta.env.VITE_USE_EMULATORS === 'true' && ['auth/user-not-found', 'auth/invalid-credential'].includes(err?.code)) {
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      await createUserWithEmailAndPassword(auth, email, password);
    } else throw err;
  }
}
