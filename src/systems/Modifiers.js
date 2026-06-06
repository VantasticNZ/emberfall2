// =============================================================================
// SYSTEM: ModifierRegistry  (data-driven game modifiers, written once).
// Toggles cosmetic/gameplay/graphics modifiers from data; the options menu drives
// it. ADULT MODE is walled off: a master switch can disable the whole feature, it
// is OFF by default and requires an explicit 18+ confirmation, and a HARD CODE
// CONSTRAINT guarantees adult effects can NEVER apply to the child protagonist or
// any minor (adultAllowedFor). No adult ART exists — this is flag/architecture.
// Self-tested in Modifiers.test.js.
// =============================================================================

import { MODIFIERS } from '../data/modifiers.js';

export class ModifierRegistry {
  constructor(defs = MODIFIERS, { dev = false } = {}) {
    this.defs = {};
    this.state = {};
    // MASTER SWITCH for the whole adult-mode feature (false => removed for a clean ship).
    this.adultMasterEnabled = true;
    this.adultConfirmed = false;   // the explicit 18+ confirmation
    defs.forEach((d) => {
      this.defs[d.id] = d;
      // dev-default turns the easy modifiers ON for testing — but NEVER an age-gated one.
      this.state[d.id] = dev && !d.ageGated ? !!d.devDefault : !!d.default;
    });
  }

  /** Effective on/off — age-gated modifiers also require master + 18+ confirm. */
  isOn(id) {
    const d = this.defs[id]; if (!d) return false;
    if (d.ageGated) return this.adultMasterEnabled && this.adultConfirmed && !!this.state[id];
    return !!this.state[id];
  }
  /** Set a modifier; an age-gated one cannot be enabled without master + confirm. */
  set(id, on) {
    const d = this.defs[id]; if (!d) return false;
    if (d.ageGated) {
      if (!this.adultMasterEnabled) { this.state[id] = false; return false; }
      if (on && !this.adultConfirmed) return false;   // refuse: no confirmation
    }
    this.state[id] = !!on;
    return true;
  }
  toggle(id) { return this.set(id, !this.state[id]); }

  // ---- adult-mode gating ----------------------------------------------------
  confirmAdult(yes) { this.adultConfirmed = !!yes; if (!yes) this.state.adult_mode = false; }
  /** Master switch: OFF removes the whole adult feature (clean ship). */
  setAdultMaster(on) { this.adultMasterEnabled = !!on; if (!on) { this.adultConfirmed = false; this.state.adult_mode = false; } }
  /**
   * THE HARD CONSTRAINT — adult effects may apply ONLY to a confirmed ADULT entity,
   * and NEVER to a minor/child (e.g. the childhood protagonist). Always call this
   * before applying any adult-mode effect to an entity.
   */
  adultAllowedFor(entity) {
    return this.isOn('adult_mode') && !!entity && entity.isAdult === true && entity.isMinor !== true;
  }

  // ---- effect lookups (the game reads these) --------------------------------
  lootMult() { return this.isOn('loot_rich') ? this.defs.loot_rich.effect.lootMult : 1; }
  gemMult() { return this.isOn('more_gems') ? this.defs.more_gems.effect.gemMult : 1; }
  headScale() { return this.isOn('big_head') ? this.defs.big_head.effect.headScale : 1; }
  gore() { return this.isOn('blood_gore'); }

  list(category) { return Object.values(this.defs).filter((d) => !category || d.category === category); }
}
