import { defineConfig } from 'vite';

// Dev port pinned per HANDOFF (strictPort: fail rather than silently hop ports).
export default defineConfig({
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
  },
});
