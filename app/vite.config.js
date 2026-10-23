import { copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const demoFile = (name) => fileURLToPath(new URL(`./src/demo/${name}.js`, import.meta.url));

/**
 * `--mode demo` builds a self-contained demo (used for the Android debug APK):
 * Firebase is swapped for the on-device stand-ins in src/demo, and the
 * website's WebP images are bundled so CMS previews work offline.
 */
function demoMode() {
  const imagesDir = fileURLToPath(new URL('../website/public/images/', import.meta.url));
  let outDir = 'dist';
  return {
    name: 'k7-demo',
    configResolved(config) {
      outDir = config.build.outDir;
    },
    closeBundle() {
      try {
        const target = fileURLToPath(new URL(`./${outDir}/images/`, import.meta.url));
        mkdirSync(target, { recursive: true });
        for (const f of readdirSync(imagesDir)) if (f.endsWith('.webp')) copyFileSync(imagesDir + f, target + f);
      } catch {
        /* ignore if directory does not exist */
      }
    },
  };
}

// VITE_BASE_PATH lets the admin be served from a sub-path, e.g. "/admin/" when
// the website and admin share one domain. Defaults to the domain root.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const apiKey = env.VITE_FIREBASE_API_KEY;
  const isRealFirebase = Boolean(
    apiKey &&
    apiKey !== 'demo-api-key' &&
    !apiKey.startsWith('demo') &&
    env.VITE_DEMO_MODE !== 'true'
  );
  const demo = mode === 'demo' || !isRealFirebase;

  return {
    base: demo ? '/' : env.VITE_BASE_PATH || '/',
    plugins: [react(), tailwindcss(), demo && demoMode()].filter(Boolean),
    resolve: demo
      ? {
          alias: [
            { find: /^firebase\/app$/, replacement: demoFile('app') },
            { find: /^firebase\/auth$/, replacement: demoFile('auth') },
            { find: /^firebase\/firestore$/, replacement: demoFile('firestore') },
            { find: /^firebase\/storage$/, replacement: demoFile('storage') },
          ],
        }
      : undefined,
    // In demo mode, mark as demo and bundle images
    define: {
      'import.meta.env.VITE_IS_DEMO': JSON.stringify(demo ? 'true' : 'false'),
      ...(demo ? { 'import.meta.env.VITE_WEBSITE_URL': JSON.stringify('') } : {}),
    },
    server: { port: 5174 },
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('@firebase/firestore') || id.includes('firebase/firestore')) return 'firebase-firestore';
            if (id.includes('@firebase/auth') || id.includes('firebase/auth')) return 'firebase-auth';
            if (id.includes('@firebase/storage') || id.includes('firebase/storage')) return 'firebase-storage';
            if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) return 'firebase-core';
            if (id.includes('node_modules/react')) return 'react';
          },
        },
      },
    },
  };
});
