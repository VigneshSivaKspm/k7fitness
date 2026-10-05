import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Social platforms need absolute image URLs. When VITE_SITE_URL is set
 * (e.g. https://k7fitness.in), make og:image / twitter:image absolute.
 */
function absoluteSocialImages(siteUrl) {
  return {
    name: 'k7-absolute-social-images',
    transformIndexHtml(html) {
      if (!siteUrl) return html;
      const base = siteUrl.replace(/\/$/, '');
      return html
        .replace(/(<meta (?:property="og:image"|name="twitter:image") content=")\//g, `$1${base}/`)
        .replace('</head>', `    <meta property="og:url" content="${base}/" />\n    <link rel="canonical" href="${base}/" />\n  </head>`);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  return {
    plugins: [react(), tailwindcss(), absoluteSocialImages(env.VITE_SITE_URL)],
    server: { port: 5173 },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) return 'firebase';
            if (id.includes('node_modules/react')) return 'react';
          },
        },
      },
    },
  };
});
