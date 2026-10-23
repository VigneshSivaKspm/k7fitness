/** DEMO BUILD ONLY — stand-in for `firebase/app` (see firestore.js). */
export const initializeApp = (options = {}) => ({ name: '[DEFAULT]', options, demo: true });
export const getApp = () => ({ name: '[DEFAULT]', options: {}, demo: true });
