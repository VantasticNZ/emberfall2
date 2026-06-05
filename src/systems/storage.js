// =============================================================================
// storage.js — the project's PERSISTENCE PRIMITIVE (write-once).
// One tiny pluggable adapter so every save-backed system (karma/deeds now;
// chests/doors/quest-flags later) persists through the SAME path:
//   - in a browser  -> localStorage
//   - in Node / headless / privacy-mode -> in-memory (so tests + SSR work)
// Inject a custom adapter (e.g. memoryStorage()) to make state testable.
// =============================================================================

// In-memory adapter: survives within a process; perfect for tests + Node.
export function memoryStorage() {
  const m = new Map();
  return {
    read: (k) => (m.has(k) ? m.get(k) : null),
    write: (k, v) => { m.set(k, String(v)); },
    remove: (k) => { m.delete(k); },
  };
}

// The auto-detected default: localStorage when available, else in-memory.
export function defaultStorage() {
  try {
    if (typeof localStorage !== 'undefined' && localStorage) {
      return {
        read: (k) => localStorage.getItem(k),
        write: (k, v) => localStorage.setItem(k, String(v)),
        remove: (k) => localStorage.removeItem(k),
      };
    }
  } catch (_) {
    // localStorage can throw (privacy mode / sandboxed) — fall back to memory.
  }
  return memoryStorage();
}
