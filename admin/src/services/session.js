import { auth } from '../firebase/config';

let currentAdmin = null;

/** Called by AuthProvider once the admin profile is loaded. */
export function setSessionAdmin(admin) {
  currentAdmin = admin;
}

/** Who is performing the current write — stored on records and activity logs. */
export function getActor() {
  const user = auth?.currentUser;
  return {
    uid: user?.uid || '',
    name: currentAdmin?.name || user?.displayName || user?.email || 'Admin',
  };
}
