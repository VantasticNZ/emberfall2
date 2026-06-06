// =============================================================================
// SYSTEM: Inventory  (the player's HOLDINGS, written once). One persistent blob
// for everything the player owns/embodies: gold, items (stacked, carry-limited),
// equipment (by slot), learned skills + skill points, the food/body-state, and
// owned property. Gold lives HERE (not in Karma): Karma is the morality/deed
// engine and must stay single-purpose; holdings are a separate save concern.
// Transactions (shops/jobs/eat/rent/death) are the Economy engine's job — this
// is just the state + safe mutators. Persists via the storage primitive, exactly
// like Karma/QuestEngine.
// =============================================================================

import { defaultStorage } from './storage.js';
import { item } from '../data/items/index.js';
import { BALANCE, BODY_STATES } from '../data/economy.js';

export class Inventory {
  constructor(opts = {}) {
    this.storage = opts.storage || defaultStorage();
    this.slot = opts.slot || 'default';
    this.reset(opts);
  }
  key() { return `emberfall:inv:${this.slot}`; }

  reset(opts = {}) {
    this.gold = opts.gold ?? BALANCE.startGold;
    this.level = opts.level || 1;
    this.hp = BALANCE.baseMaxHp;
    this.items = {};        // id -> count
    this.equipment = {};    // slot -> item id
    this.skills = {};       // skill name -> level
    this.skillPoints = 0;
    this.foodMeter = 50;    // 0..foodMax; ~middle = 'normal'
    this.bodyState = 'normal';
    this.property = {};     // id -> { rent }
    return this;
  }

  // ---- gold -----------------------------------------------------------------
  addGold(n) { this.gold = Math.max(0, this.gold + Math.round(n)); return this.gold; }

  // ---- items (stacked by id; total count capped at carryLimit) --------------
  count() { return Object.values(this.items).reduce((a, b) => a + b, 0); }
  has(id, n = 1) { return (this.items[id] || 0) >= n; }
  /** Add n of an item; false if it would bust the carry limit. */
  add(id, n = 1) {
    item(id); // validate (throws on unknown)
    if (this.count() + n > BALANCE.carryLimit) return false;
    this.items[id] = (this.items[id] || 0) + n;
    return true;
  }
  remove(id, n = 1) {
    if (!this.has(id, n)) return false;
    this.items[id] -= n;
    if (this.items[id] <= 0) delete this.items[id];
    return true;
  }

  // ---- equipment ------------------------------------------------------------
  equip(id) {
    const it = item(id);
    if (!it.equipSlot || !this.has(id)) return false;
    this.equipment[it.equipSlot] = id;
    return true;
  }
  unequip(slot) { const id = this.equipment[slot]; delete this.equipment[slot]; return id || null; }
  equipped(slot) { return this.equipment[slot] || null; }

  // ---- effective stats (equipment + body-state) -----------------------------
  stats() {
    let atk = 0, def = 0;
    for (const id of Object.values(this.equipment)) {
      (item(id).effects || []).forEach((e) => { if (e.atk) atk += e.atk; if (e.def) def += e.def; });
    }
    const body = BODY_STATES[this.bodyState] || BODY_STATES.normal;
    return { atk, def, maxHp: Math.round(BALANCE.baseMaxHp * body.maxHpMult), speed: body.speed };
  }
  heal(n) { this.hp = Math.min(this.stats().maxHp, this.hp + Math.round(n)); return this.hp; }

  // ---- skills ---------------------------------------------------------------
  learnSkill(name, levels = 1) { this.skills[name] = (this.skills[name] || 0) + levels; return this.skills[name]; }
  hasSkill(name) { return !!this.skills[name]; }
  addSkillPoints(n = 1) { this.skillPoints += n; return this.skillPoints; }

  // ---- persistence (same path as Karma/QuestEngine) -------------------------
  serialize() {
    return {
      v: 1, gold: this.gold, level: this.level, hp: this.hp, items: this.items,
      equipment: this.equipment, skills: this.skills, skillPoints: this.skillPoints,
      foodMeter: this.foodMeter, bodyState: this.bodyState, property: this.property,
    };
  }
  hydrate(d) {
    if (!d) return false;
    this.gold = d.gold ?? BALANCE.startGold;
    this.level = d.level ?? 1;
    this.hp = d.hp ?? BALANCE.baseMaxHp;
    this.items = d.items || {};
    this.equipment = d.equipment || {};
    this.skills = d.skills || {};
    this.skillPoints = d.skillPoints || 0;
    this.foodMeter = d.foodMeter ?? 50;
    this.bodyState = d.bodyState || 'normal';
    this.property = d.property || {};
    return true;
  }
  save() { this.storage.write(this.key(), JSON.stringify(this.serialize())); return this; }
  load() {
    const raw = this.storage.read(this.key());
    if (!raw) return false;
    try { return this.hydrate(JSON.parse(raw)); } catch (_) { return false; }
  }
  clearSave() { this.storage.remove(this.key()); this.reset(); return this; }
}
