import { defineConfig } from 'vite';

// Dev port pinned to 5273 — Emberfall2's OWN dedicated port (Tūhono owns 5173).
// strictPort: fail loudly rather than silently hop ports if 5273 is taken.
export default defineConfig({
  server: {
    port: 5273,
    strictPort: true,
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
  },
});
