// =============================================================================
// SYSTEM: QuestEngine  (Bible Part 1 — QUEST ENGINE, written ONCE)
// One engine; quests are DATA (src/data/quests/). It tracks each quest's state,
// gates availability by prerequisites + karma + deeds + the unlock/lock graph,
// runs start/advance/complete, and on a choice applies karma + records a deed
// through the ONE Karma/deed engine (src/systems/Karma.js) — so quests, NPCs and
// endings all react off the same memory. Re-evaluates availability whenever
// deeds/karma change (long-range reactivity: a quest can require a past deed).
//
// States: 'locked' | 'available' | 'active' | 'complete' | 'locked-out'(pruned).
// Self-tested in QuestEngine.test.js (npm test) with throwaway fake quests.
// =============================================================================

import { Karma } from './Karma.js';
import { defaultStorage } from './storage.js';

export class QuestEngine {
  /**
   * @param {object} [opts]
   * @param {object} [opts.karma] the shared Karma engine (default: the singleton).
   * @param {Array}  [opts.quests] quest definitions (data) to register.
   * @param {object} [opts.storage] persistence adapter (default: auto).
   * @param {string} [opts.slot] save slot.
   */
  constructor(opts = {}) {
    this.karma = opts.karma || Karma;
    this.storage = opts.storage || defaultStorage();
    this.slot = opts.slot || 'default';
    this.defs = {};                 // id -> definition
    this.state = {};                // id -> state string
    this.step = {};                 // id -> current step index
    this.chosen = {};               // id -> chosen choice id
    this.unlocked = new Set();      // ids that have been unlocked (roots auto-added)
    this.pruned = new Set();        // ids locked-out by a fired `locks`
    this._committed = new Set();    // `${quest}:${choice}` already applied — exactly-once guard
    this._listeners = new Set();
    // optional day/night hook: quests may gate on a phase (requires.phase). FLAGGED
    // minimal extension — the requires-pattern gains a time axis when a TimeOfDay
    // is supplied; re-check availability when the phase changes.
    this.time = opts.time || null;
    // long-range reactivity: re-check availability when any deed is recorded
    this._off = this.karma.onDeed(() => this.refresh());
    if (this.time && this.time.onPhaseChange) this._offTime = this.time.onPhaseChange(() => this.refresh());
    if (opts.quests) this.load(opts.quests);
  }

  key() { return `emberfall:quests:${this.slot}`; }

  // ---- LOADING --------------------------------------------------------------
  /** Register quest definitions + initialise state (roots become eligible). */
  load(quests = []) {
    quests.forEach((q) => {
      this.defs[q.id] = q;
      if (!(q.id in this.state)) { this.state[q.id] = 'locked'; this.step[q.id] = 0; }
    });
    // a quest is "unlock-gated" if any other quest/choice lists it in `unlocks`;
    // quests that nobody unlocks are ROOTS -> eligible from the start.
    const targets = new Set();
    Object.values(this.defs).forEach((q) => {
      (q.unlocks || []).forEach((u) => targets.add(this._resolve(u)));
      (q.choices || []).forEach((c) => (c.unlocks || []).forEach((u) => targets.add(this._resolve(u))));
    });
    Object.keys(this.defs).forEach((id) => { if (!targets.has(id)) this.unlocked.add(id); });
    this.refresh();
    return this;
  }

  // a lock/unlock target may carry a branch suffix (e.g. 'SG7ally'); map to a def id.
  _resolve(target) {
    if (this.defs[target]) return target;
    let best = null;
    for (const id in this.defs) if (target.startsWith(id) && (!best || id.length > best.length)) best = id;
    return best || target;
  }

  // ---- AVAILABILITY ---------------------------------------------------------
  /** Are all of a quest's `requires` satisfied right now? */
  _requiresMet(req = {}) {
    if ((req.quests || []).some((id) => this.state[id] !== 'complete')) return false;
    if ((req.deeds || []).some((d) => !this.karma.hasDeed(d))) return false;
    if ((req.notDeeds || []).some((d) => this.karma.hasDeed(d))) return false;
    const k = req.karma;
    if (k) {
      for (const axis of ['morality', 'purity']) {
        const r = k[axis]; if (!r) continue;
        const v = this.karma.get(axis);
        if (r.min != null && v < r.min) return false;
        if (r.max != null && v > r.max) return false;
      }
    }
    // day/night gate (only when a TimeOfDay is wired in)
    if ((req.phase || req.phases) && !(this.time && this.time.meetsTime(req))) return false;
    return true;
  }
  /** Could this quest be started now (ignoring whether it already is)? */
  isAvailable(id) {
    if (this.pruned.has(id) || !this.unlocked.has(id)) return false;
    return this._requiresMet((this.defs[id] || {}).requires);
  }
  /** Current status string. */
  status(id) { return this.state[id]; }
  byState(s) { return Object.keys(this.state).filter((id) => this.state[id] === s); }
  available() { return this.byState('available'); }

  /** Recompute locked/available/locked-out for every not-yet-active/complete quest. */
  refresh() {
    for (const id in this.defs) {
      const s = this.state[id];
      if (s === 'active' || s === 'complete') continue;
      this.state[id] = this.pruned.has(id) ? 'locked-out' : (this.isAvailable(id) ? 'available' : 'locked');
    }
    for (const cb of this._listeners) { try { cb(this); } catch (_) {} }
    return this;
  }
  /** Subscribe to state changes (UI/quest log). Returns an unsubscribe fn. */
  onChange(cb) { this._listeners.add(cb); return () => this._listeners.delete(cb); }

  // ---- LIFECYCLE ------------------------------------------------------------
  start(id) {
    if (this.state[id] !== 'available') return false;
    this.state[id] = 'active'; this.step[id] = 0; this.refresh(); return true;
  }
  /** Advance to the next objective; returns the new step index. */
  advance(id) {
    if (this.state[id] !== 'active') return -1;
    const steps = (this.defs[id].steps || []).length;
    this.step[id] = Math.min(this.step[id] + 1, Math.max(0, steps));
    return this.step[id];
  }
  isLastStep(id) {
    const steps = (this.defs[id].steps || []).length;
    return steps === 0 || this.step[id] >= steps - 1;
  }
  /** Complete a quest: grant its reward (data), fire its unlocks/locks, refresh. */
  complete(id) {
    if (this.state[id] !== 'active') return false;
    this.state[id] = 'complete';
    this._fire(this.defs[id].unlocks, this.defs[id].locks);
    this.refresh();
    return true;
  }

  // ---- CHOICES (the decision points) ----------------------------------------
  /** Make a choice on a quest: apply its karma + deed via the Karma engine, then
   *  resolve the choice's unlocks/locks. Returns the choice. */
  choose(id, choiceId) {
    const def = this.defs[id];
    const c = (def?.choices || []).find((x) => x.id === choiceId);
    if (!c) throw new Error(`no choice '${choiceId}' on quest '${id}'`);
    // EXACTLY ONCE: a quest choice applies its karma/deed/unlocks a single time. Re-
    // choosing it (e.g. re-opening a completed quest's dialogue) must NOT re-award
    // karma or re-record deeds — a finished quest can never be farmed. Persisted.
    const ck = `${id}:${choiceId}`;
    if (this._committed.has(ck)) return c;
    this._committed.add(ck);
    this.karma.commit({
      deed: c.deed, meta: { quest: id, ...(c.meta || {}) },
      morality: c.karma?.morality || 0, purity: c.karma?.purity || 0,
    });
    this.chosen[id] = choiceId;
    this._fire(c.unlocks, c.locks);
    this.refresh(); // (karma.onDeed also refreshes when a deed was recorded)
    return c;
  }
  chosenOn(id) { return this.chosen[id] || null; }

  _fire(unlocks = [], locks = []) {
    (unlocks || []).forEach((u) => this.unlocked.add(this._resolve(u)));
    (locks || []).forEach((l) => this.pruned.add(this._resolve(l)));
  }

  // ---- PERSISTENCE (same path as Karma) -------------------------------------
  serialize() {
    return {
      v: 1, state: this.state, step: this.step, chosen: this.chosen,
      unlocked: [...this.unlocked], pruned: [...this.pruned], committed: [...this._committed],
    };
  }
  hydrate(data) {
    if (!data) return false;
    this.state = { ...this.state, ...(data.state || {}) };
    this.step = { ...this.step, ...(data.step || {}) };
    this.chosen = { ...(data.chosen || {}) };
    this.unlocked = new Set(data.unlocked || []);
    this.pruned = new Set(data.pruned || []);
    this._committed = new Set(data.committed || []);
    this.refresh();
    return true;
  }
  save() { this.storage.write(this.key(), JSON.stringify(this.serialize())); return this; }
  load_() { // (load() is taken by quest-def loading; this loads SAVED state)
    const raw = this.storage.read(this.key());
    if (!raw) return false;
    try { return this.hydrate(JSON.parse(raw)); } catch (_) { return false; }
  }
  /** Load saved progress (clearer name). */
  loadSave() { return this.load_(); }
  clearSave() { this.storage.remove(this.key()); return this; }
}
