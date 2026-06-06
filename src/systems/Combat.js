// =============================================================================
// SYSTEM: PlayerCombat  (the player's defensive abilities, written once).
// PURE LOGIC — no Phaser. The caller passes the clock (`now` in ms) so it is
// fully unit-testable with a fake clock. The scene wires inputs/visuals to it.
//
//   DODGE/DASH  : a burst with INVULNERABILITY FRAMES (beats the CHARGER) + a
//                 cooldown. While invulnerable, incoming damage is negated.
//   BLOCK       : hold to reduce FRONTAL damage (beats RANGED / blockable melee).
//   PARRY       : a hit inside the tight window at the START of a block is fully
//                 negated AND flags a parry (the scene staggers the attacker = a
//                 punish opening).
//
// All tuning is DATA (COMBAT in src/constants/standards.js) — feel-tune pending.
// Self-tested in Combat.test.js (npm test).
// =============================================================================

import { COMBAT } from '../constants/standards.js';

export class PlayerCombat {
  constructor(cfg = COMBAT) {
    this.cfg = cfg;
    this.dodgeIframeUntil = 0;   // i-frame window end (ms)
    this.dodgeMoveUntil = 0;     // burst-movement window end (ms)
    this.dodgeReadyAt = 0;       // cooldown end (ms)
    this.dodgeDir = { x: 0, y: 0 };
    this.dashMoveUntil = 0;      // DASH (traversal) burst end
    this.dashReadyAt = 0;
    this.dashDir = { x: 0, y: 0 };
    this.blocking = false;
    this.blockStart = -Infinity; // when the current block began (for the parry window)
    this.blockNegate = cfg.NO_SHIELD_BLOCK ?? 0.35; // fraction of frontal damage negated (shield-scaled)
    this._parry = false;         // a parry happened, awaiting the scene to consume it
  }

  // ---- DODGE-ROLL (defensive, i-frames) -------------------------------------
  /** Begin a dodge-roll in unit dir (dx,dy) if off cooldown. Returns true if started. */
  dodgeRoll(now, dx = 0, dy = 0) {
    if (now < this.dodgeReadyAt) return false;
    const len = Math.hypot(dx, dy) || 1;
    this.dodgeDir = { x: dx / len, y: dy / len };
    this.dodgeMoveUntil = now + this.cfg.DODGE_DURATION_MS;
    this.dodgeIframeUntil = now + this.cfg.DODGE_IFRAME_MS;
    this.dodgeReadyAt = now + this.cfg.DODGE_COOLDOWN_MS;
    return true;
  }
  dodge(now, dx, dy) { return this.dodgeRoll(now, dx, dy); }   // alias (was the old name)
  isInvulnerable(now) { return now < this.dodgeIframeUntil; }
  isDodgeMoving(now) { return now < this.dodgeMoveUntil; }
  dodgeReady(now) { return now >= this.dodgeReadyAt; }
  dodgeVelocity() {
    const v = (this.cfg.DODGE_DISTANCE / this.cfg.DODGE_DURATION_MS) * 1000; // px/s
    return { x: this.dodgeDir.x * v, y: this.dodgeDir.y * v };
  }

  // ---- DASH (traversal; SEPARATE ability — a later skill, NO i-frames) ------
  /** STUB ability (defined so it exists in the system; not wired into the slice yet). */
  dash(now, dx = 0, dy = 0) {
    if (now < this.dashReadyAt) return false;
    const len = Math.hypot(dx, dy) || 1;
    this.dashDir = { x: dx / len, y: dy / len };
    this.dashMoveUntil = now + this.cfg.DASH_DURATION_MS;
    this.dashReadyAt = now + this.cfg.DASH_COOLDOWN_MS;
    return true;
  }
  isDashing(now) { return now < this.dashMoveUntil; }
  dashVelocity() {
    const v = (this.cfg.DASH_DISTANCE / this.cfg.DASH_DURATION_MS) * 1000;
    return { x: this.dashDir.x * v, y: this.dashDir.y * v };
  }
  /** Shield-scaled block: set the fraction of frontal damage NEGATED (0..1). */
  setShieldBlock(negate) { this.blockNegate = Math.max(0, Math.min(1, negate)); }

  // ---- BLOCK / PARRY --------------------------------------------------------
  /** Hold (on=true) / release (on=false) the block. A fresh block opens the parry window. */
  setBlocking(now, on) {
    if (on && !this.blocking) this.blockStart = now;
    this.blocking = !!on;
  }
  isBlocking() { return this.blocking; }
  inParryWindow(now) { return this.blocking && now <= this.blockStart + this.cfg.PARRY_WINDOW_MS; }

  // ---- DAMAGE RESOLUTION (the one place defence is applied) ------------------
  /**
   * Resolve incoming damage through i-frames / block / parry.
   * @param now ms · @param amount raw damage · @param opts.fromFront (default true)
   * @returns { taken, outcome:'dodged'|'parried'|'blocked'|'hit' }
   */
  takeDamage(now, amount, opts = {}) {
    if (this.isInvulnerable(now)) return { taken: 0, outcome: 'dodged' };
    const fromFront = opts.fromFront !== false;
    if (this.blocking && fromFront) {
      if (this.inParryWindow(now)) { this._parry = true; return { taken: 0, outcome: 'parried' }; }
      return { taken: Math.round(amount * (1 - this.blockNegate)), outcome: 'blocked' }; // shield-scaled
    }
    return { taken: amount, outcome: 'hit' };
  }
  /** The scene calls this to act on a parry (stagger the attacker) exactly once. */
  consumeParry() { const p = this._parry; this._parry = false; return p; }
}
