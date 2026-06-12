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
  // chores that keep an NPC AT its post (they don't wander + don't count toward the idle cap).
  static POSTED = new Set(['sweep', 'tend', 'chat', 'hammer', 'chop', 'till', 'sleep']);
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
      post: { x: npc.x, y: npc.y },                           // the anchor a free NPC wanders AROUND (updated on phase retarget)
      wandering: false, wanderUntil: rng() * NPC_LIFE.WANDER_PAUSE_MAX_S,   // staggered first hop
      t: (rng() * 240) | 0,                                   // chore-loop start offset
      ham: Math.round(150 * (1 + (rng() * 2 - 1) * NPC_LIFE.CHORE_VAR)),   // per-NPC chore periods
      gla: Math.round(110 * (1 + (rng() * 2 - 1) * NPC_LIFE.CHORE_VAR)),
      idl: Math.round(NPC_LIFE.IDLE_GLANCE_FRAMES * (1 + (rng() * 2 - 1) * NPC_LIFE.CHORE_VAR)),
    });
  }
  has() { return this.movers.length > 0; }

  /**
   * SUMMON an NPC to INVESTIGATE a point (event reaction — e.g. a guard hearing a forced door). The NPC
   * drops its chore and walks to (x,y); on arrival `onArrive(npc)` fires once, then it resumes its schedule.
   * Minimal additive engine hook (HARD RULE 2): NPCs gain event-reaction without forking the schedule system.
   */
  summon(npc, x, y, onArrive = null) {
    const m = this.movers.find((mv) => mv.npc === npc); if (!m) return false;
    m.investigate = { x, y, cb: onArrive, fired: false }; m.delay = 0;
    return true;
  }

  /** On a phase change, retarget each NPC — to a JITTERED spot, after a STAGGERED delay. */
  setPhase(phase) {
    this._phase = phase;
    for (const m of this.movers) {
      if (!m.schedule) continue;                               // scheduleless NPC = static (stays at spawn, idles)
      const e = m.schedule.find((s) => s.phase === phase);
      if (!e) continue;                                        // partial schedule: keep previous
      const j = NPC_LIFE.TARGET_JITTER_PX;
      m.target = { x: e.tx * TILE + TILE / 2 + (m.rng() * 2 - 1) * j, y: e.ty * TILE + TILE / 2 + (m.rng() * 2 - 1) * j };
      m.post = { x: m.target.x, y: m.target.y };               // wander around the new phase post, not the spawn
      m.wandering = false;
      m.act = e.do || 'idle';
      // STAGGER: fan out departures so nobody marches in unison.
      m.delay = (NPC_LIFE.STAGGER_MIN_S + m.rng() * (NPC_LIFE.STAGGER_MAX_S - NPC_LIFE.STAGGER_MIN_S)) * m.tt.delay;
    }
  }

  update(dt, paused) {
    if (paused) { for (const m of this.movers) Movement.stop(m.npc); return; }   // dialogue — freeze the crowd
    this._clock = (this._clock || 0) + dt;
    const now = this._clock;
    for (const m of this.movers) {
      const npc = m.npc;
      // EVENT REACTION (summon): an investigate target overrides the chore/schedule until reached.
      if (m.investigate) {
        const iv = m.investigate, idx = iv.x - npc.x, idy = iv.y - npc.y;
        if (Math.hypot(idx, idy) <= 14) { if (!iv.fired) { iv.fired = true; if (iv.cb) iv.cb(npc); } m.investigate = null; this._activity(m); continue; }
        this._seek(m, iv.x, iv.y, dt); continue;
      }
      if (m.delay > 0) { m.delay -= dt; this._activity(m); continue; }   // not departed yet — keep puttering
      // WALKING to a target (a schedule post OR a wander hop)?
      if (m.target) {
        if (Math.hypot(m.target.x - npc.x, m.target.y - npc.y) > 12) { this._seek(m, m.target.x, m.target.y, dt); continue; }
        m.target = null; m.stuck = 0;                          // arrived
        if (m.wandering) { m.wandering = false; m.wanderUntil = now + this._wanderPause(m); }   // finished a hop → pause here
      }
      // No target: FREE (idle) NPCs take short wander hops around their post; posted/chore NPCs do their chore.
      if (this._isFree(m) && now >= (m.wanderUntil || 0)) { this._startWander(m); this._seek(m, m.target.x, m.target.y, dt); continue; }
      this._activity(m);
    }
    this._enforceIdleCap(now);
  }

  // MOTION BUDGET — a "free" NPC is an idle stroller (not a guard, not mid-chore); these wander + count to the cap.
  _isFree(m) {
    if (m.npc.getData && m.npc.getData('role') === 'guard') return false;   // guards hold / patrol their post
    if (m.npc.getData && m.npc.getData('posted')) return false;             // shopkeepers / quest-givers stay at their spot (so the player can find them)
    return !NpcLife.POSTED.has(m.act);                          // idle/default = free; sweep/hammer/etc. stay put
  }
  _wanderPause(m) {
    const M = NPC_LIFE; return (M.WANDER_PAUSE_MIN_S + m.rng() * (M.WANDER_PAUSE_MAX_S - M.WANDER_PAUSE_MIN_S)) * m.tt.pause;
  }
  _startWander(m) {
    const r = NPC_LIFE.WANDER_RADIUS_PX, a = m.rng() * Math.PI * 2, rad = (0.4 + 0.6 * m.rng()) * r;
    m.target = { x: m.post.x + Math.cos(a) * rad, y: m.post.y + Math.sin(a) * rad };
    m.wandering = true;
  }
  // CAP: at most MAX_IDLE_FRACTION of free NPCs may stand idle at once — nudge the longest-idle ones to stroll.
  _enforceIdleCap(now) {
    const free = this.movers.filter((m) => m.npc.active && this._isFree(m));
    if (free.length < 3) return;                               // tiny crowds need no cap
    const idle = free.filter((m) => !m.target);
    const maxIdle = Math.floor(free.length * NPC_LIFE.MAX_IDLE_FRACTION);
    if (idle.length <= maxIdle) return;
    idle.sort((a, b) => (a.wanderUntil || 0) - (b.wanderUntil || 0));   // the ones paused longest go first
    for (let i = 0, need = idle.length - maxIdle; i < need; i++) idle[i].wanderUntil = now;   // eligible to hop next frame
  }

  // SEEK toward (tx,ty) with per-NPC speed + EASED facing (turn only after a cooldown, so pivots desync).
  // Shared by the schedule target and the event-summon investigate target.
  _seek(m, tx, ty, dt) {
    const npc = m.npc, dx = tx - npc.x, dy = ty - npc.y, len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len, spd = npc.moveSpeed;
    npc.body.setVelocity(ux * spd, uy * spd);
    m.turnLock -= dt;
    const want = Math.abs(ux) > Math.abs(uy) ? (ux > 0 ? 'right' : 'left') : (uy > 0 ? 'down' : 'up');
    if (want !== npc.facing && m.turnLock <= 0) { npc.facing = want; m.turnLock = NPC_LIFE.TURN_COOLDOWN_S * (0.6 + m.rng() * 0.8); }
    npc.setState('walk', spd);
    // unstick: blocked but not arrived -> skirt the obstacle for a beat
    if (Math.hypot(npc.body.velocity.x, npc.body.velocity.y) < 6) { if (++m.stuck > 35) { npc.body.setVelocity(uy * spd, -ux * spd); m.stuck = 16; } }
    else m.stuck = 0;
  }

  // a looped ACTIVITY, with per-NPC periods so identical chores are never in phase.
  _activity(m) {
    const npc = m.npc; Movement.stop(npc); m.t++;
    switch (m.act) {
      case 'hammer': case 'chop': case 'till':                  // work chores → the slash/swing anim reads as
        if (m.t % m.ham === 0 && npc.action) npc.action('attack'); break;   // hammering/chopping/tilling (no dedicated chore anim in the ElizaWy base; this is the HAVE-asset solution)
      case 'sweep': case 'tend': case 'chat':
        if (m.t % m.gla === 0) { const f = ['left', 'right', 'down', 'up']; npc.facing = f[(m.rng() * 4) | 0]; npc.setState('idle'); } break;
      case 'sleep':
        npc.facing = 'down'; npc.setState('idle'); break;
      default:                                                  // even idlers glance about now and then
        if (m.t % m.idl === 0) { const f = ['left', 'right', 'down']; npc.facing = f[(m.rng() * 3) | 0]; npc.setState('idle'); }
    }
  }
}
