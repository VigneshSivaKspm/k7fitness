import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cert, initializeApp } from 'firebase-admin/app';

/**
 * Initialises the Admin SDK.
 *  • Production: set GOOGLE_APPLICATION_CREDENTIALS to a service-account JSON
 *    file (Firebase Console → Project settings → Service accounts → Generate key),
 *    or place it at scripts/service-account.json (git-ignored).
 *  • Emulators: set FIRESTORE_EMULATOR_HOST / FIREBASE_AUTH_EMULATOR_HOST and
 *    pass --project <id>.
 */
export function initAdmin(projectIdArg) {
  const usingEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
  if (usingEmulator) {
    const projectId = projectIdArg || process.env.GCLOUD_PROJECT || 'demo-k7';
    return initializeApp({ projectId });
  }
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || resolve(import.meta.dirname, 'service-account.json');
  if (!existsSync(keyPath)) {
    console.error(
      '\n✖ No service account key found.\n  Download one from Firebase Console → Project settings → Service accounts,\n' +
        '  save it as scripts/service-account.json (never commit it), or set GOOGLE_APPLICATION_CREDENTIALS.\n',
    );
    process.exit(1);
  }
  const key = JSON.parse(readFileSync(keyPath, 'utf8'));
  return initializeApp({ credential: cert(key), projectId: projectIdArg || key.project_id });
}

/** Tiny --flag value parser. */
export function parseArgs(argv = process.argv.slice(2)) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        out[key] = next;
        i++;
      } else out[key] = true;
    }
  }
  return out;
}
