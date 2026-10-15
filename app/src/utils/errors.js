const MESSAGES = {
  'auth/invalid-credential': 'Incorrect email address or password.',
  'auth/wrong-password': 'Incorrect email address or password.',
  'auth/user-not-found': 'Incorrect email address or password.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled. Contact the gym owner.',
  'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
  'auth/network-request-failed': 'Network error. Check your internet connection and try again.',
  'auth/missing-email': 'Please enter your email address.',
  'auth/requires-recent-login': 'For security, please sign out and sign in again before doing this.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'permission-denied': 'You do not have permission to do this. Make sure your admin account is active.',
  unavailable: 'You appear to be offline. Changes will sync when your connection returns.',
  'deadline-exceeded': 'The request took too long. Please try again.',
  'not-found': 'This record no longer exists. It may have been deleted.',
  'already-exists': 'This record already exists.',
  'resource-exhausted': 'Usage limit reached. Please try again later.',
  'storage/unauthorized': 'You do not have permission to upload files.',
  'storage/canceled': 'Upload cancelled.',
  'storage/quota-exceeded': 'Storage quota exceeded. Remove unused images and try again.',
  'storage/retry-limit-exceeded': 'Upload failed due to a poor connection. Please try again.',
  'storage/object-not-found': 'File not found.',
};

/** Errors thrown intentionally by our own services carry a user-facing message. */
export class AppError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AppError';
    this.userFacing = true;
  }
}

/** Converts any thrown error into something a gym owner can understand. */
export function friendlyError(err, fallback = 'Something went wrong. Please try again.') {
  if (!err) return fallback;
  if (err.userFacing) return err.message;
  const code = String(err.code || '').replace(/^firestore\//, '');
  if (MESSAGES[code]) return MESSAGES[code];
  if (code === 'failed-precondition' && /index/i.test(err.message || '')) {
    return 'A database index is still being created for this view. Please try again in a few minutes.';
  }
  if (import.meta.env.DEV) console.error(err);
  return fallback;
}
