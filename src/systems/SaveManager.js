// =============================================================================
// SYSTEM: SaveManager (write-once) — the UNIFIED world save for the seamless
// overworld (WORLD-STRUCTURE-DESIGN Pillar 1 / GAPS §5). Persists, in ONE versioned
// blob via the `storage` adapter:
//   - the player's WORLD POSITION (x, y) + current area / interior id
//   - the day/time fraction
//   - sparse PER-CHUNK DELTAS — what the player changed in each chunk (opened
//     containers, killed enemies, picked items, set flags) — so a reload restores
//     the world's *changes* without storing the whole (procedurally-rebuilt) world.
//
// SAVE-VERSIONING (a playthrough is sacred, QUALITY-BIBLE): every blob carries `v`;
// `hydrate()` migrates older shapes FORWARD (never throws, never loses progress).
//
// Phase 1 scope = the WORLD block + chunk deltas, hard-tested by round-trip. The
// existing per-system saves (Karma/Inventory/TimeOfDay/Quest) are composed IN during
// region migration (Phase 2+) via link(); their own serialize()/hydrate() are reused.
// =============================================================================

import { defaultStorage } from './storage.js';

export const SAVE_VERSION = 3;   // v1 = legacy per-system saves; v2 = unified world save; v3 = world RE-CENTRED (Blueprint decision B)

// WORLD-BLUEPRINT decision B re-centred Greenhollow from chunk (5,5) → (9,9): a uniform
// +4-chunk shift on both axes. A v2 (pre-recentre) save's world position + chunk-delta keys
// are in the OLD coords, so v2→v3 migration shifts them by exactly this — the playthrough is
// preserved (a save is sacred), just relocated to the new world-coords. Must match worldmap's
// GH_ORIGIN move; if the re-centre ever changes, this constant changes with it.
export const RECENTRE_V3_SHIFT_CHUNKS = 4;            // (9 − 5) chunks
const _CHUNK_PX = 1024;                               // = CHUNK(32) × TILE(32); SaveManager stays decoupled from worldmap
export const RECENTRE_V3_SHIFT_PX = RECENTRE_V3_SHIFT_CHUNKS * _CHUNK_PX;   // 4096 px

export class SaveManager {
  constructor({ slot = 'slot1', storage = defaultStorage() } = {}) {
    this.slot = slot;
    this.storage = storage;
    this.state = this._empty();
    this._linked = [];           // optional sub-systems composed into this save (Phase 2+)
  }

  _key() { return `emberfall:world:${this.slot}`; }
  _empty() { return { v: SAVE_VERSION, pos: { x: 0, y: 0 }, area: null, interior: null, timeFrac: 0, chunks: {}, systems: {} }; }

  // ---- world position + meta -------------------------------------------------
  setPosition(x, y) { this.state.pos = { x: Math.round(x), y: Math.round(y) }; return this; }
  getPosition() { return { ...this.state.pos }; }
  setArea(area, interior = null) { this.state.area = area; this.state.interior = interior; return this; }
  getArea() { return { area: this.state.area, interior: this.state.interior }; }
  setTimeFrac(f) { this.state.timeFrac = +f || 0; return this; }
  getTimeFrac() { return this.state.timeFrac; }

  // ---- per-chunk DELTAS (sparse: a chunk with no changes stores nothing) ------
  _chunk(cx, cy) {
    const k = `${cx},${cy}`;
    return (this.state.chunks[k] ||= { opened: {}, killed: {}, picked: {}, flags: {} });
  }
  chunkDelta(cx, cy) { return this.state.chunks[`${cx},${cy}`] || null; }
  recordOpened(cx, cy, id) { this._chunk(cx, cy).opened[id] = 1; return this; }
  recordKilled(cx, cy, id) { this._chunk(cx, cy).killed[id] = 1; return this; }
  recordPicked(cx, cy, id) { this._chunk(cx, cy).picked[id] = 1; return this; }
  setChunkFlag(cx, cy, key, val = 1) { this._chunk(cx, cy).flags[key] = val; return this; }
  isOpened(cx, cy, id) { const d = this.chunkDelta(cx, cy); return !!(d && d.opened[id]); }
  isKilled(cx, cy, id) { const d = this.chunkDelta(cx, cy); return !!(d && d.killed[id]); }
  isPicked(cx, cy, id) { const d = this.chunkDelta(cx, cy); return !!(d && d.picked[id]); }
  getChunkFlag(cx, cy, key) { const d = this.chunkDelta(cx, cy); return d ? d.flags[key] : undefined; }

  // ---- composition (Phase 2+): link a sub-system with id + serialize/hydrate ---
  link(id, system) { this._linked.push({ id, system }); return this; }

  // ---- persistence -----------------------------------------------------------
  serialize() {
    for (const { id, system } of this._linked) {
      if (typeof system.serialize === 'function') this.state.systems[id] = system.serialize();
    }
    return JSON.stringify(this.state);
  }
  save() { this.storage.write(this._key(), this.serialize()); return this; }
  hasSave() { return this.storage.read(this._key()) != null; }

  load() {
    const raw = this.storage.read(this._key());
    if (raw == null) return false;
    let parsed;
    try { parsed = JSON.parse(raw); } catch { return false; }   // corrupt save → don't throw, keep empty
    this.state = this.hydrate(parsed);
    for (const { id, system } of this._linked) {
      const blob = this.state.systems[id];
      if (blob !== undefined && typeof system.hydrate === 'function') system.hydrate(blob);
    }
    return true;
  }
  clear() { this.storage.remove(this._key()); this.state = this._empty(); return this; }

  // ---- migration (forward-only; never throws, never loses data) --------------
  hydrate(raw) {
    let s = (raw && typeof raw === 'object') ? raw : {};
    if (!s.v || s.v < 2) s = this._migrateToV2(s);            // legacy → v2 (no overworld coords to shift)
    else if (s.v === 2) s = this._migrateV2ToV3(s);          // pre-recentre overworld save → shift coords
    const base = this._empty();
    return {
      v: SAVE_VERSION,
      pos: { ...base.pos, ...(s.pos || {}) },
      area: s.area ?? null,
      interior: s.interior ?? null,
      timeFrac: +s.timeFrac || 0,
      chunks: s.chunks && typeof s.chunks === 'object' ? s.chunks : {},
      systems: s.systems && typeof s.systems === 'object' ? s.systems : {},
    };
  }
  _migrateToV2(s) {
    // a pre-v2 blob had no world block — preserve a position if one existed under
    // any old key, default the rest. Old per-system saves keep their own keys.
    return { ...this._empty(), pos: s.pos || s.position || this._empty().pos, timeFrac: s.timeFrac || 0 };
  }
  // v2 → v3: the world re-centred (+4 chunks). Shift the saved world position + remap every
  // per-chunk DELTA key (cx,cy → cx+4,cy+4) so opened/killed/picked stay with their content.
  // Coordinate-independent state (systems: karma/quests/inv/time) is untouched. No data lost.
  _migrateV2ToV3(s) {
    const pos = s.pos
      ? { x: (+s.pos.x || 0) + RECENTRE_V3_SHIFT_PX, y: (+s.pos.y || 0) + RECENTRE_V3_SHIFT_PX }
      : this._empty().pos;
    const chunks = {};
    for (const [k, v] of Object.entries(s.chunks || {})) {
      const [cx, cy] = k.split(',').map(Number);
      chunks[`${cx + RECENTRE_V3_SHIFT_CHUNKS},${cy + RECENTRE_V3_SHIFT_CHUNKS}`] = v;
    }
    return { ...s, v: 3, pos, chunks };
  }
}
