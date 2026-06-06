// =============================================================================
// SYSTEM: Monsters  (the behaviour engine, written once). Monsters are DATA
// (src/data/monsters/); this drives the behaviour STATE MACHINE and exposes the
// state combat (later) needs: is it telegraphing / invulnerable / guarding /
// interruptible / hidden / in its punish-window. Each archetype is a distinct
// QUESTION (Gate E); `counter` says what beats it. Bosses are phased archetypes
// + a trick + a twist at an HP gate. update(dt) advances the FSM; hit()/interrupt()
// /reveal() are how the player acts on it. Serializable (mid-fight save).
// =============================================================================

import { ARCHETYPES, BOSSES, archetype } from '../data/monsters/index.js';

export class Monster {
  constructor(def, params = {}) {
    this.id = def.id;
    this.boss = !!def.boss;
    this.counter = def.counter || (def.phases ? 'Learn the pattern; use the trick; survive the twist.' : '');
    this.element = def.element || null;
    this.trick = def.trick || null;       // boss trick (e.g. needs tool_lantern)
    this.twistDesc = def.twistDesc || null;
    this.phases = def.phases || null;     // boss only
    const stats = def.stats || {};
    this.maxHp = params.hp ?? stats.hp ?? 30;
    this.hp = this.maxHp;
    this.count = params.count ?? stats.count ?? 1; // swarm size
    this.revealWis = def.revealWis ?? 3;
    this.dead = false;
    this.twists = 0;
    this._revealed = false;
    this._activePhase = null;
    this._setBehaviour(this._behaviourForHp(def));
  }

  // pick the FSM: a plain archetype, or the boss phase whose HP gate we're in
  _behaviourForHp(def) {
    if (!this.phases) return def.states ? def : archetype(def.id);
    const f = this.hp / this.maxHp;
    let active = this.phases[0];
    for (const ph of this.phases) if (ph.belowHp == null || f <= ph.belowHp) active = ph;
    this._activePhase = active;
    this.twistDesc = active.twist ? this.twistDesc : this.twistDesc;
    return archetype(active.behaviour);
  }
  _setBehaviour(fsm) { this.fsm = fsm; this.state = fsm.start || Object.keys(fsm.states)[0]; this.elapsed = 0; }
  _cur() { return this.fsm.states[this.state]; }

  // ---- state the combat layer queries ---------------------------------------
  flag(name) { const f = this._cur().flags; return !!(f && f[name]); }
  isTelegraphing() { return this.flag('telegraphing'); }
  isInvulnerable() { return this.flag('invulnerable'); }
  inPunishWindow() { return this.flag('punishWindow'); }
  isGuarding() { return this.flag('guarding'); }
  canBeInterrupted() { return this.flag('interruptible'); }
  isHidden() { return this.flag('hidden') && !this._revealed; }
  touchDamage() { return this.flag('touchDamage'); }

  // ---- the clock ------------------------------------------------------------
  update(dt) {
    if (this.dead) return this;
    const s = this._cur();
    if (s.dur != null) {
      this.elapsed += dt;
      if (this.elapsed >= s.dur) { this.elapsed = 0; if (s.next) this.state = s.next; }
    }
    return this;
  }

  // ---- player acting on it --------------------------------------------------
  /** Strike it. opts: { angle:'flank'|'front', tool, aoe, aoeCount, contact }. */
  hit(dmg = 0, opts = {}) {
    if (this.dead) return { dealt: 0, blocked: true, reason: 'dead' };
    if (this.isInvulnerable()) {
      // charged/electric: striking it does nothing AND shocks you back
      return { dealt: 0, blocked: true, reason: 'invulnerable', recoil: this.touchDamage() ? (dmg || this._cur().flags?.touch || 0) : 0 };
    }
    if (this.isGuarding()) {
      const bypass = opts.angle === 'flank' || (this.trick && opts.tool === this.trick.tool);
      if (!bypass) return { dealt: 0, blocked: true, reason: 'guarding' };
    }
    if (this.count > 1) { // swarm: AoE clears many, single hit one
      const kills = opts.aoe ? Math.min(this.count, opts.aoeCount ?? this.count) : 1;
      this.count -= kills;
      if (this.count <= 0) this.dead = true;
      return { dealt: kills, swarmKilled: kills, remaining: Math.max(0, this.count) };
    }
    this.hp = Math.max(0, this.hp - dmg);
    if (this.hp <= 0) this.dead = true; else this._checkPhase();
    return { dealt: dmg, hp: this.hp };
  }
  // boss: crossing an HP gate swaps behaviour (the twist)
  _checkPhase() {
    if (!this.phases) return;
    const prev = this._activePhase;
    const fsm = this._behaviourForHp({ id: this.id });
    if (this._activePhase !== prev) { this._setBehaviour(fsm); this.twists++; }
  }
  /** Interrupt a channel (caster). Returns true if it landed. */
  interrupt() {
    if (!this.canBeInterrupted()) return false;
    this.state = this._cur().onInterrupt || this.fsm.start;
    this.elapsed = 0;
    return true;
  }
  /** Reveal a hidden ambusher with perception/WIS. */
  reveal(wis = 0) {
    if (!this.isHidden()) return false;
    if (wis < this.revealWis) return false;
    this._revealed = true;
    if (this.fsm.states.revealed) this.state = 'revealed';
    this.elapsed = 0;
    return true;
  }

  // ---- persistence (mid-fight save) -----------------------------------------
  serialize() { return { id: this.id, hp: this.hp, count: this.count, state: this.state, elapsed: this.elapsed, twists: this.twists, revealed: this._revealed }; }
}

/** Create a monster from an archetype id or a boss id. */
export function spawn(id, params = {}) {
  if (BOSSES[id]) return new Monster({ ...BOSSES[id], id, boss: true }, params);
  return new Monster({ ...archetype(id), id }, params);
}

/** Restore a monster (and its FSM/phase) from serialize(). */
export function fromJSON(j) {
  const m = spawn(j.id, { hp: j.hp, count: j.count });
  m.hp = j.hp; m.count = j.count;
  m._setBehaviour(m._behaviourForHp({ id: j.id }));
  m.state = j.state; m.elapsed = j.elapsed; m.twists = j.twists; m._revealed = j.revealed;
  m.dead = j.hp <= 0 || j.count <= 0;
  return m;
}

export { ARCHETYPES, BOSSES };
