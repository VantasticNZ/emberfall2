// =============================================================================
// SYSTEM: Karma + Deed-Memory  (Bible Part 1 — KARMA + DEED-MEMORY/CALLBACK)
// THE write-once foundation of reactivity. Two karma axes + a log of notable
// deeds; quests, NPCs, twists and endings all READ this one engine (never their
// own bespoke state). Written once; everything else is DATA on top.
//
//   MORALITY : Cruel (-100) <-> Kind (+100)
//   PURITY   : Corrupt (-100) <-> Pure (+100)
//
// Self-testing (Bible Part 0 #4): see Karma.test.js — adjust -> persist ->
// reload -> query -> ending-gating, runnable in Node (`npm test`).
// =============================================================================

import { defaultStorage } from './storage.js';
import { ENDING_DEEDS } from '../constants/endings.js';

const AXES = ['morality', 'purity'];
const clamp = (v) => Math.max(-100, Math.min(100, Math.round(v)));

// --- TIER LABELS (data; NPCs react "by tier"). Ascending min thresholds. ----
export const TIERS = {
  morality: [
    { min: -100, label: 'Cruel' },
    { min: -60,  label: 'Unkind' },
    { min: -20,  label: 'Neutral' },
    { min: 20,   label: 'Kind' },
    { min: 60,   label: 'Saintly' },
  ],
  purity: [
    { min: -100, label: 'Corrupt' },
    { min: -60,  label: 'Tainted' },
    { min: -20,  label: 'Untested' },
    { min: 20,   label: 'Pure' },
    { min: 60,   label: 'Radiant' },
  ],
};

// Gate thresholds (tunable). "cruel/corrupt" = clearly negative; "kind/pure" = clearly positive.
const GATE = { cruel: -20, corrupt: -20, kind: 20, pure: 20 };

// Deed ids the ENDINGS depend on — now single-sourced from the constants SSOT
// (src/constants/endings.js). Re-exported so existing importers are unaffected.
export { ENDING_DEEDS };

// --- THE FIVE ENDINGS as DATA-DRIVEN GATES (matches QUEST-DATA.json _meta +
//     STORY-AND-QUESTS.md). gate(v) reads {morality, purity, has(deedId)}. ----
export const ENDINGS = {
  W: { name: 'Warden',    secret: false, desc: 're-bind the god (bittersweet default)',
       req: 'available to most', gate: () => true },
  S: { name: 'Saint',     secret: false, desc: 'heal + re-bind with compassion',
       req: 'Kind + showed mercy',
       gate: (v) => v.morality >= GATE.kind && v.has(ENDING_DEEDS.mercy_shown) },
  T: { name: 'Tyrant',    secret: false, desc: "seize the god's power",
       req: 'Cruel + Corrupt',
       gate: (v) => v.morality <= GATE.cruel && v.purity <= GATE.corrupt },
  L: { name: 'Liberator', secret: false, desc: 'free the god (hardest of the four)',
       req: 'Pure + mercy + believed Hagga + opposed Sela',
       gate: (v) => v.purity >= GATE.pure && v.has(ENDING_DEEDS.mercy_shown)
              && v.has(ENDING_DEEDS.hagga_believed) && v.has(ENDING_DEEDS.sela_opposed) },
  A: { name: 'Ashbearer', secret: true,  desc: 'take the burden yourself — break the cycle',
       req: 'SECRET: cave-lore + Pem + hidden mercy',
       gate: (v) => v.has(ENDING_DEEDS.cave_lore) && v.has(ENDING_DEEDS.pem_found)
              && v.has(ENDING_DEEDS.mercy_shown) },
};

const SAVE_VERSION = 1;

export class KarmaEngine {
  /**
   * @param {object} [opts]
   * @param {object} [opts.storage] persistence adapter (read/write/remove). Default: auto.
   * @param {() => number} [opts.now] clock for deed timestamps (injectable for tests).
   * @param {string} [opts.slot] save slot name.
   */
  constructor(opts = {}) {
    this.storage = opts.storage || defaultStorage();
    this.now = opts.now || (() => Date.now());
    this.slot = opts.slot || 'default';
    this._listeners = new Set();
    this.reset();
  }

  key() { return `emberfall:karma:${this.slot}`; }

  /** Wipe to a fresh new-game state. */
  reset() {
    this.morality = 0;
    this.purity = 0;
    this.deeds = {}; // id -> { id, t, n, meta }
    return this;
  }

  // ---- KARMA AXES -----------------------------------------------------------
  /** Shift an axis by delta (clamped to [-100,100]). */
  adjust(axis, delta) {
    if (!AXES.includes(axis)) throw new Error(`unknown karma axis: ${axis}`);
    this[axis] = clamp(this[axis] + delta);
    return this[axis];
  }
  set(axis, value) {
    if (!AXES.includes(axis)) throw new Error(`unknown karma axis: ${axis}`);
    this[axis] = clamp(value);
    return this[axis];
  }
  get(axis) {
    if (!AXES.includes(axis)) throw new Error(`unknown karma axis: ${axis}`);
    return this[axis];
  }
  /** Tier label for an axis (e.g. 'Kind', 'Corrupt'). */
  tier(axis) {
    const v = this.get(axis);
    const tiers = TIERS[axis];
    let label = tiers[0].label;
    for (const t of tiers) if (v >= t.min) label = t.label;
    return label;
  }
  /** Snapshot for a status display. */
  getStatus() {
    return {
      morality: this.morality, moralityTier: this.tier('morality'),
      purity: this.purity, purityTier: this.tier('purity'),
    };
  }

  // ---- DEED-MEMORY (the world remembers) ------------------------------------
  /** Record a deed by id (idempotent; repeats bump `n` + merge meta). */
  recordDeed(id, meta = {}) {
    if (!id) throw new Error('recordDeed needs an id');
    const prev = this.deeds[id];
    this.deeds[id] = prev
      ? { ...prev, n: prev.n + 1, meta: { ...prev.meta, ...meta } }
      : { id, t: this.now(), n: 1, meta: { ...meta } };
    for (const cb of this._listeners) { try { cb(id, this.deeds[id]); } catch (_) {} }
    return this.deeds[id];
  }
  hasDeed(id) { return !!this.deeds[id]; }
  getDeed(id) { return this.deeds[id] || null; }
  deedIds() { return Object.keys(this.deeds); }
  /** Subscribe to deed records (NPCs/quests react). Returns an unsubscribe fn. */
  onDeed(cb) { this._listeners.add(cb); return () => this._listeners.delete(cb); }

  /** Convenience for quests: apply karma deltas AND log a deed in one call. */
  commit({ deed, morality = 0, purity = 0, meta = {} } = {}) {
    if (morality) this.adjust('morality', morality);
    if (purity) this.adjust('purity', purity);
    if (deed) this.recordDeed(deed, meta);
    return this.getStatus();
  }

  // ---- ENDING GATING (reads karma + deeds) ----------------------------------
  /** Read-only view passed to ending gates. */
  _view() { return { morality: this.morality, purity: this.purity, has: (id) => this.hasDeed(id) }; }
  /** Which endings are currently reachable + why. */
  reachableEndings() {
    const v = this._view();
    const out = {};
    for (const [k, e] of Object.entries(ENDINGS)) {
      out[k] = { name: e.name, secret: e.secret, desc: e.desc, req: e.req, reachable: !!e.gate(v) };
    }
    return out;
  }
  /** Ids of currently-reachable endings (e.g. ['W','L']). */
  reachableEndingIds() {
    return Object.entries(this.reachableEndings()).filter(([, e]) => e.reachable).map(([k]) => k);
  }

  // ---- PERSISTENCE (one save path) ------------------------------------------
  serialize() {
    return { v: SAVE_VERSION, morality: this.morality, purity: this.purity, deeds: this.deeds };
  }
  hydrate(data) {
    if (!data) return false;
    this.morality = clamp(data.morality || 0);
    this.purity = clamp(data.purity || 0);
    this.deeds = data.deeds && typeof data.deeds === 'object' ? { ...data.deeds } : {};
    return true;
  }
  /** Persist to storage. */
  save() { this.storage.write(this.key(), JSON.stringify(this.serialize())); return this; }
  /** Load from storage; returns true if a save existed. */
  load() {
    const raw = this.storage.read(this.key());
    if (!raw) return false;
    try { return this.hydrate(JSON.parse(raw)); } catch (_) { return false; }
  }
  /** Delete the save + reset. */
  clearSave() { this.storage.remove(this.key()); this.reset(); return this; }
}

// The game's shared instance (one karma state per save).
export const Karma = new KarmaEngine();
