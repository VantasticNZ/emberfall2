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

export const SAVE_VERSION = 2;   // v1 = legacy per-system saves (no world block); v2 = unified world save

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
    if (!s.v || s.v < 2) s = this._migrateToV2(s);            // legacy → v2
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
}
