#!/usr/bin/env node
/**
 * Creates (or promotes) a K7 admin account — the ONLY way admins are created.
 * There is deliberately no public sign-up in the app.
 *
 * Usage:
 *   node create-admin.mjs --email owner@k7fitness.in --name "Gym Owner" --role owner
 *   node create-admin.mjs --email staff@k7fitness.in --name "Front Desk" --role admin --password "S0me-Strong-Pass"
 *
 * If the Firebase Auth user does not exist it is created (a strong random
 * password is generated unless --password is given; use "Forgot password"
 * on the login page to set your own). Then `admins/{uid}` is written, which
 * is what the security rules check.
 */
import { randomBytes } from 'node:crypto';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { initAdmin, parseArgs } from './firebase-admin-init.mjs';

const ROLES = ['owner', 'admin', 'manager', 'trainer', 'receptionist'];
const args = parseArgs();

if (!args.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(args.email)) {
  console.error('Usage: node create-admin.mjs --email you@example.com --name "Your Name" [--role owner] [--password ...] [--project id]');
  process.exit(1);
}
const role = args.role || 'owner';
if (!ROLES.includes(role)) {
  console.error(`--role must be one of: ${ROLES.join(', ')}`);
  process.exit(1);
}
if (args.password && String(args.password).length < 8) {
  console.error('--password must be at least 8 characters.');
  process.exit(1);
}

initAdmin(args.project);
const auth = getAuth();
const db = getFirestore();

let user;
let generated = '';
try {
  user = await auth.getUserByEmail(args.email);
  console.log(`• Found existing Auth user ${user.uid}`);
} catch (err) {
  if (err.code !== 'auth/user-not-found') throw err;
  generated = args.password || `${randomBytes(9).toString('base64url')}#9a`;
  user = await auth.createUser({ email: args.email, password: generated, displayName: args.name || undefined, emailVerified: false });
  console.log(`• Created Auth user ${user.uid}`);
}

await db.doc(`admins/${user.uid}`).set(
  {
    email: args.email.toLowerCase(),
    name: args.name || user.displayName || args.email.split('@')[0],
    role,
    active: true,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  },
  { merge: true },
);

console.log(`✔ ${args.email} is now an active "${role}" admin.`);
if (generated && !args.password) {
  console.log(`  Temporary password: ${generated}`);
  console.log('  Sign in, or use “Forgot password?” on the login page to choose your own.');
}
process.exit(0);
