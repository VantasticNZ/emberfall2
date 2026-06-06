// =============================================================================
// SYSTEM: TimeOfDay  (the day/night cycle, written once). Advances with play;
// other systems gate on the phase via the same requires-pattern (req.phase /
// req.phases) using meetsTime(); a phase-change (and day-change) callback lets
// systems react (NPCs/shops/spawns). Persists via the storage primitive like
// Karma/QuestEngine/Inventory.
// =============================================================================

import { defaultStorage } from './storage.js';
import { DAY_LENGTH, START_TIME, RATE, phaseAt } from '../data/time.js';

export class TimeOfDay {
  constructor(opts = {}) {
    this.storage = opts.storage || defaultStorage();
    this.slot = opts.slot || 'default';
    this.t = opts.t ?? START_TIME;          // total elapsed in-game minutes
    this._phaseCbs = new Set();
    this._dayCbs = new Set();
    this._phase = this.phase();
    this._day = this.dayCount();
  }
  key() { return `emberfall:time:${this.slot}`; }

  // ---- reading the clock ----------------------------------------------------
  frac() { return (((this.t % DAY_LENGTH) + DAY_LENGTH) % DAY_LENGTH) / DAY_LENGTH; }
  dayCount() { return Math.floor(this.t / DAY_LENGTH); }
  phase() { return phaseAt(this.frac()); }
  isPhase(p) { return this.phase() === p; }
  isNight() { return this.phase() === 'night'; }
  /** requires-pattern for time: { phase } or { phases:[...] }. */
  meetsTime(req = {}) {
    if (req.phase) return this.phase() === req.phase;
    if (req.phases) return req.phases.includes(this.phase());
    return true;
  }

  // ---- advancing ------------------------------------------------------------
  advance(minutes) { this.t += minutes; this._fire(); return this; }
  advanceRealSeconds(sec) { return this.advance(sec * RATE); }
  /** Jump to a fraction-of-day (handy for tests / scripted beats). */
  setFrac(frac, day = this.dayCount()) { this.t = day * DAY_LENGTH + frac * DAY_LENGTH; this._fire(); return this; }

  _fire() {
    const p = this.phase();
    if (p !== this._phase) { const prev = this._phase; this._phase = p; for (const cb of this._phaseCbs) { try { cb(p, prev); } catch (_) {} } }
    const d = this.dayCount();
    if (d !== this._day) { const prev = this._day; this._day = d; for (const cb of this._dayCbs) { try { cb(d, prev); } catch (_) {} } }
  }
  onPhaseChange(cb) { this._phaseCbs.add(cb); return () => this._phaseCbs.delete(cb); }
  onDayChange(cb) { this._dayCbs.add(cb); return () => this._dayCbs.delete(cb); }

  // ---- persistence ----------------------------------------------------------
  serialize() { return { v: 1, t: this.t }; }
  hydrate(d) { if (!d) return false; this.t = d.t ?? START_TIME; this._phase = this.phase(); this._day = this.dayCount(); return true; }
  save() { this.storage.write(this.key(), JSON.stringify(this.serialize())); return this; }
  load() { const raw = this.storage.read(this.key()); if (!raw) return false; try { return this.hydrate(JSON.parse(raw)); } catch (_) { return false; } }
}
