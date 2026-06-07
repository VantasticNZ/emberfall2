// =============================================================================
// SYSTEM: NpcLife  (Part 2.6 Pillar 2 — LIFE & MOVEMENT, written once). NPCs with
// a DATA `schedule` follow daily routines on the TimeOfDay phases: at each phase
// they walk to a location and perform a looped ACTIVITY (chore). Reusable by every
// region — a region just authors `schedule` on its NPC data; NPCs without one stay
// static (back-compat). Movement = a simple seek (Movement.drive) + collision via
// the actor's physics body (it collides with buildings/dividers); a light unstick
// nudge handles corners. FLAG: dedicated chore animations + real obstacle pathing
// (navmesh) are future work — this uses the existing idle/walk/attack frames and a
// seek that's fine for open village layouts.
//
//   schedule: [ { phase:'dawn'|'day'|'dusk'|'night', tx, ty, do:'<activity>' }, ... ]
//   activity: 'idle' | 'sweep' | 'tend' | 'chat' | 'hammer' | 'sleep'  (looped)
//   a phase not listed keeps the previous target (so a partial schedule is fine).
// =============================================================================

import { Movement } from './Movement.js';
import { TILE } from '../data/assets.js';

export class NpcLife {
  constructor(scene) { this.scene = scene; this.movers = []; this._phase = null; }

  /** Register a scheduled NPC (its body should be movable so it separates from solids). */
  add(npc, schedule) {
    this.movers.push({ npc, schedule, target: null, act: 'idle', stuck: 0, t: (npc.x * 13) & 127 });
  }
  has() { return this.movers.length > 0; }

  /** On a phase change, retarget every scheduled NPC to that phase's spot + activity. */
  setPhase(phase) {
    this._phase = phase;
    for (const m of this.movers) {
      const e = m.schedule.find((s) => s.phase === phase);
      if (!e) continue;                       // partial schedule: keep the previous target
      m.target = { x: e.tx * TILE + TILE / 2, y: e.ty * TILE + TILE / 2 };
      m.act = e.do || 'idle';
    }
  }

  update(_dt, paused) {
    for (const m of this.movers) {
      const npc = m.npc;
      if (paused) { Movement.stop(npc); continue; }     // world paused (dialogue) — freeze
      if (!m.target) { this._activity(m); continue; }
      const dx = m.target.x - npc.x, dy = m.target.y - npc.y, dist = Math.hypot(dx, dy);
      if (dist <= 10) { this._activity(m); m.stuck = 0; continue; }   // arrived -> chore
      Movement.drive(npc, dx, dy);                         // seek (sets velocity + facing + walk anim)
      const spd = Math.hypot(npc.body.velocity.x, npc.body.velocity.y);
      if (spd < 6) { if (++m.stuck > 35) { Movement.drive(npc, dy, -dx); m.stuck = 16; } }  // unstick: skirt the obstacle
      else m.stuck = 0;
    }
  }

  // a small looped ACTIVITY so an arrived NPC reads as DOING something, not frozen.
  _activity(m) {
    const npc = m.npc; Movement.stop(npc); m.t++;
    switch (m.act) {
      case 'hammer':                                        // the smith — an occasional swing peg
        if (m.t % 150 === 0 && npc.action) npc.action('attack');
        break;
      case 'sweep': case 'tend': case 'chat':               // puttering — turn now and then
        if (m.t % 110 === 0) { const f = ['left', 'right', 'down']; npc.facing = f[(m.t / 110 | 0) % 3]; npc.setState('idle'); }
        break;
      case 'sleep':                                         // at home for the night
        npc.facing = 'down'; npc.setState('idle'); break;
      default: break;                                       // plain idle
    }
  }
}
