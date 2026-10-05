import { initializeApp } from 'firebase/app';
import { browserLocalPersistence, connectAuthEmulator, getAuth, setPersistence } from 'firebase/auth';
import {
  connectFirestoreEmulator,
  initializeFirestore,
  memoryLocalCache,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import { connectStorageEmulator, getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * Demo build (`vite build --mode demo`): firebase/* is aliased to the on-device
 * stand-ins in src/demo, so no Firebase project or credentials are needed.
 */
export const isDemo = import.meta.env.MODE === 'demo';

// Emulators: always allowed in `vite dev`; the `apk` build mode may also use them so a
// demo APK can talk to emulators running on a laptop over Wi-Fi (VITE_EMULATOR_HOST).
const useEmulators = !isDemo && (import.meta.env.DEV || import.meta.env.MODE === 'apk') && import.meta.env.VITE_USE_EMULATORS === 'true';
const emulatorHost = import.meta.env.VITE_EMULATOR_HOST || '127.0.0.1';

export const isFirebaseConfigured = isDemo || Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;

export const auth = app ? getAuth(app) : null;

// Offline cache keeps the admin snappy on mobile networks and avoids re-reads.
export const db = app
  ? initializeFirestore(app, {
      localCache: useEmulators ? memoryLocalCache() : persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
      ignoreUndefinedProperties: true,
    })
  : null;

export const storage = app ? getStorage(app) : null;

if (app && useEmulators) {
  connectAuthEmulator(auth, `http://${emulatorHost}:9099`, { disableWarnings: true });
  connectFirestoreEmulator(db, emulatorHost, 8080);
  connectStorageEmulator(storage, emulatorHost, 9199);
}

if (auth) setPersistence(auth, browserLocalPersistence).catch(() => {});
