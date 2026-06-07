// =============================================================================
// SYSTEM: NpcLife  (Part 2.6 Pillar 2 — LIFE & MOVEMENT, written once). NPCs with
// a DATA `schedule` follow daily routines on the TimeOfDay phases: at each phase
// they walk to a location and perform a looped ACTIVITY (chore). Reusable by every
// region — author `schedule` on the NPC data; NPCs without one stay static.
//
// DE-SYNC (the crowd must read as INDIVIDUALS, not clockwork): every shared action
// is jittered PER NPC — a staggered departure delay, a persistent speed multiplier,
// a slightly offset target (paths differ), eased facing (no synced pivots), and
// out-of-phase chore loops. All seeded per NPC, so it's deterministic in a session.
// A `tempo` trait (brisk/normal/ambler/dawdler) scales speed+pause+delay together so
// the variation reads as PERSONALITY. Tuning lives in standards.js NPC_LIFE.
//
//   schedule: [ { phase:'dawn'|'day'|'dusk'|'night', tx, ty, do:'<activity>' }, ... ]
//   activity: 'idle' | 'sweep' | 'tend' | 'chat' | 'hammer' | 'sleep'  (looped)
//   tempo (optional): 'brisk' | 'normal' | 'ambler' | 'dawdler'        (default normal)
// =============================================================================

import { Movement } from './Movement.js';
import { TILE } from '../data/assets.js';
import { NPC_LIFE } from '../constants/standards.js';

// per-NPC personality: scales speed · chore-pause · reaction delay together.
const TEMPOS = {
  brisk:   { speed: 1.16, pause: 0.72, delay: 0.6 },
  normal:  { speed: 1.0,  pause: 1.0,  delay: 1.0 },
  ambler:  { speed: 0.9,  pause: 1.25, delay: 1.25 },
  dawdler: { speed: 0.8,  pause: 1.6,  delay: 1.8 },
};
// a tiny seeded PRNG (deterministic per NPC; no Math.random, stable in a session).
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class NpcLife {
  constructor(scene) { this.scene = scene; this.movers = []; this._phase = null; }

  /** Register a scheduled NPC. `tempo` is an optional personality trait (data). */
  add(npc, schedule, tempo = 'normal') {
    const seed = ((this.movers.length + 1) * 0x9E3779B1) >>> 0;
    const rng = mulberry32(seed);
    const tt = TEMPOS[tempo] || TEMPOS.normal;
    // persistent per-NPC speed: base × (1 ± SPEED_VAR) × tempo. Movement.drive reads moveSpeed.
    npc.moveSpeed = (npc.moveSpeed || npc.speed || 70) * (1 + (rng() * 2 - 1) * NPC_LIFE.SPEED_VAR) * tt.speed;
    this.movers.push({
      npc, schedule, rng, tt, target: null, act: 'idle', stuck: 0,
      delay: 0, turnLock: 0,
      t: (rng() * 240) | 0,                                   // chore-loop start offset
      ham: Math.round(150 * (1 + (rng() * 2 - 1) * NPC_LIFE.CHORE_VAR)),   // per-NPC chore periods
      gla: Math.round(110 * (1 + (rng() * 2 - 1) * NPC_LIFE.CHORE_VAR)),
      idl: Math.round(180 * (1 + (rng() * 2 - 1) * NPC_LIFE.CHORE_VAR)),
    });
  }
  has() { return this.movers.length > 0; }

  /** On a phase change, retarget each NPC — to a JITTERED spot, after a STAGGERED delay. */
  setPhase(phase) {
    this._phase = phase;
    for (const m of this.movers) {
      const e = m.schedule.find((s) => s.phase === phase);
      if (!e) continue;                                        // partial schedule: keep previous
      const j = NPC_LIFE.TARGET_JITTER_PX;
      m.target = { x: e.tx * TILE + TILE / 2 + (m.rng() * 2 - 1) * j, y: e.ty * TILE + TILE / 2 + (m.rng() * 2 - 1) * j };
      m.act = e.do || 'idle';
      // STAGGER: fan out departures so nobody marches in unison.
      m.delay = (NPC_LIFE.STAGGER_MIN_S + m.rng() * (NPC_LIFE.STAGGER_MAX_S - NPC_LIFE.STAGGER_MIN_S)) * m.tt.delay;
    }
  }

  update(dt, paused) {
    for (const m of this.movers) {
      const npc = m.npc;
      if (paused) { Movement.stop(npc); continue; }            // dialogue — freeze
      if (m.delay > 0) { m.delay -= dt; this._activity(m); continue; }   // not departed yet — keep puttering
      if (!m.target) { this._activity(m); continue; }
      const dx = m.target.x - npc.x, dy = m.target.y - npc.y, dist = Math.hypot(dx, dy);
      if (dist <= 12) { this._activity(m); m.stuck = 0; continue; }       // arrived -> chore

      // SEEK with per-NPC speed + EASED facing (turn only after a cooldown, so pivots desync).
      const len = dist || 1, ux = dx / len, uy = dy / len, spd = npc.moveSpeed;
      npc.body.setVelocity(ux * spd, uy * spd);
      m.turnLock -= dt;
      const want = Math.abs(ux) > Math.abs(uy) ? (ux > 0 ? 'right' : 'left') : (uy > 0 ? 'down' : 'up');
      if (want !== npc.facing && m.turnLock <= 0) { npc.facing = want; m.turnLock = NPC_LIFE.TURN_COOLDOWN_S * (0.6 + m.rng() * 0.8); }
      npc.setState('walk', spd);
      // unstick: blocked but not arrived -> skirt the obstacle for a beat
      if (Math.hypot(npc.body.velocity.x, npc.body.velocity.y) < 6) { if (++m.stuck > 35) { npc.body.setVelocity(uy * spd, -ux * spd); m.stuck = 16; } }
      else m.stuck = 0;
    }
  }

  // a looped ACTIVITY, with per-NPC periods so identical chores are never in phase.
  _activity(m) {
    const npc = m.npc; Movement.stop(npc); m.t++;
    switch (m.act) {
      case 'hammer':
        if (m.t % m.ham === 0 && npc.action) npc.action('attack'); break;
      case 'sweep': case 'tend': case 'chat':
        if (m.t % m.gla === 0) { const f = ['left', 'right', 'down', 'up']; npc.facing = f[(m.rng() * 4) | 0]; npc.setState('idle'); } break;
      case 'sleep':
        npc.facing = 'down'; npc.setState('idle'); break;
      default:                                                  // even idlers glance about now and then
        if (m.t % m.idl === 0) { const f = ['left', 'right', 'down']; npc.facing = f[(m.rng() * 3) | 0]; npc.setState('idle'); }
    }
  }
}
