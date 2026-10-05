import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
});
