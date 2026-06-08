import { defineConfig } from 'vite';
import { execSync } from 'node:child_process';

// BUILD VERSION STAMP — read the live git short-hash + commit time, FRESH on every
// request. `transformIndexHtml` runs per HTML request in dev (and once at build), so
// a hard-refresh always re-runs git → the on-screen stamp ALWAYS reflects the actual
// code the server is serving. This lets Van confirm "am I on the latest build?".
function buildStamp() {
  const read = () => {
    let hash = 'nogit', time = '';
    try {
      hash = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
      time = execSync('git show -s --format=%cd --date=format:%Y-%m-%d_%H:%M HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    } catch { /* not a git checkout — leave defaults */ }
    return { hash, time };
  };
  return {
    name: 'emberfall-build-stamp',
    transformIndexHtml() {
      const { hash, time } = read();
      const label = `build ${hash}${time ? ' · ' + time.replace('_', ' ') : ''}`;
      return [
        { tag: 'script', children: `window.__BUILD__=${JSON.stringify({ hash, time })};`, injectTo: 'head' },
        {
          tag: 'div',
          attrs: {
            id: 'build-stamp',
            style: 'position:fixed;left:5px;bottom:4px;z-index:99999;font:10px/1.4 monospace;'
              + 'color:#8fe39a;background:rgba(0,0,0,.55);padding:1px 6px;border-radius:3px;'
              + 'pointer-events:none;letter-spacing:.3px;user-select:none;',
          },
          children: label,
          injectTo: 'body',
        },
      ];
    },
  };
}

// Dev port pinned to 5273 — Emberfall2's OWN dedicated port (Tūhono owns 5173).
// strictPort: fail loudly rather than silently hop ports if 5273 is taken.
export default defineConfig({
  plugins: [buildStamp()],
  server: {
    port: 5273,
    strictPort: true,
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
  },
});
