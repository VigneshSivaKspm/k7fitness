/**
 * DEMO BUILD ONLY — stand-in for `firebase/auth` (see firestore.js).
 * One built-in owner account; the session is remembered on the device.
 */
export const DEMO_EMAIL = 'demo@k7fitness.app';
export const DEMO_PASSWORD = 'demo1234';
export const DEMO_UID = 'demo-owner';

const SESSION_KEY = 'k7-demo-session';
const DEMO_USER = { uid: DEMO_UID, email: DEMO_EMAIL, displayName: 'Demo Owner', emailVerified: true };

function restore() {
  try {
    return localStorage.getItem(SESSION_KEY) === DEMO_UID ? DEMO_USER : null;
  } catch {
    return null;
  }
}

const auth = { currentUser: restore(), demo: true };
const listeners = new Set();

function setUser(user) {
  auth.currentUser = user;
  try {
    if (user) localStorage.setItem(SESSION_KEY, user.uid);
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
  listeners.forEach((cb) => cb(user));
}

function authError(code, message) {
  const err = new Error(message);
  err.code = code;
  return err;
}

export const getAuth = () => auth;
export const browserLocalPersistence = { type: 'LOCAL' };
export const setPersistence = async () => {};
export const connectAuthEmulator = () => {};

export function onAuthStateChanged(_auth, cb) {
  listeners.add(cb);
  setTimeout(() => listeners.has(cb) && cb(auth.currentUser), 0);
  return () => listeners.delete(cb);
}

export async function signInWithEmailAndPassword(_auth, email, password) {
  await new Promise((r) => setTimeout(r, 300));
  if (String(email).trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
    throw authError('auth/invalid-credential', 'Invalid credentials');
  }
  setUser(DEMO_USER);
  return { user: DEMO_USER };
}

export const createUserWithEmailAndPassword = signInWithEmailAndPassword;

export async function signOut() {
  setUser(null);
}

export async function sendPasswordResetEmail() {
  // Nothing to send in the offline demo; behave like success.
}

export async function updateProfile() {}
