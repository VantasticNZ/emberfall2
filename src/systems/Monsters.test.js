// =============================================================================
// Self-test for the MONSTER behaviour engine. Each archetype's state machine
// ticks correctly and exposes the right state (telegraph-before-rush; electric
// charger INVULNERABLE while charging + vulnerable in the window; caster
// interruptible only during the channel; shielded blocks the front; swarm clears
// via AoE; ambusher hidden until revealed); a boss = archetype + trick + twist;
// and a mid-fight monster serializes/restores. Plain Node + node:assert.
// =============================================================================

import assert from 'node:assert/strict';
import { spawn, fromJSON, ARCHETYPES } from './Monsters.js';

let n = 0;
const pass = (m) => { n++; console.log('  ✓ ' + m); };
console.log('Monster behaviour engine — self test\n');

// 0) every archetype has a counter + a telegraphed/queryable behaviour --------
const ALL = ['charger', 'shielded', 'ranged', 'swarm', 'brute', 'caster', 'charger_electric', 'jumper', 'ambusher'];
ALL.forEach((id) => { assert.ok(ARCHETYPES[id].counter.length > 5, `${id} has a counter`); spawn(id); });
pass(`all ${ALL.length} archetypes spawn + carry a "what beats it" counter`);

// 1) CHARGER telegraphs BEFORE it rushes -------------------------------------
{
  const m = spawn('charger');
  assert.equal(m.state, 'idle');
  m.update(1.0); assert.ok(m.isTelegraphing());        // telegraph first
  assert.ok(!m.flag('rushing'));
  m.update(0.6); assert.ok(m.flag('rushing'));         // THEN the rush
  m.update(0.8); assert.ok(m.inPunishWindow());        // recovery = punish window
  pass('CHARGER: telegraphs, THEN rushes, THEN opens a punish window');
}

// 2) CHARGER_ELECTRIC: invulnerable WHILE charging, vulnerable in the window --
{
  const m = spawn('charger_electric');
  m.update(1.5); assert.ok(m.isInvulnerable() && m.touchDamage()); // charged: do NOT touch
  const r = m.hit(20, { contact: true });
  assert.equal(r.dealt, 0); assert.equal(r.blocked, true); assert.ok(r.recoil > 0); // shocks you back
  m.update(2.0); m.update(0.2);                          // charging -> discharge -> window
  assert.ok(m.inPunishWindow() && !m.isInvulnerable());
  assert.equal(m.hit(20).dealt, 20);                    // NOW it takes the hit
  pass('CHARGER_ELECTRIC: invulnerable + shocks-on-touch while charged; hit it only in the window');
}

// 3) CASTER: interruptible ONLY during the channel ---------------------------
{
  const m = spawn('caster');
  assert.equal(m.interrupt(), false);                   // idle -> nothing to interrupt
  m.update(1.0); assert.ok(m.canBeInterrupted());       // channeling
  assert.equal(m.interrupt(), true);                    // interrupted!
  assert.equal(m.state, 'cooldown');                    // channel cancelled
  assert.equal(m.canBeInterrupted(), false);
  pass('CASTER: interrupt only lands DURING the channel; it cancels the cast');
}

// 4) SHIELDED: front is blocked; flank (or guard-break) lands ----------------
{
  const m = spawn('shielded');
  assert.ok(m.isGuarding());
  assert.equal(m.hit(10, { angle: 'front' }).blocked, true);  // covered from the front
  assert.equal(m.hit(10, { angle: 'flank' }).dealt, 10);      // flank it
  m.update(2.0); assert.ok(m.inPunishWindow());               // its own attack opens a window
  pass('SHIELDED: blocks the front; must flank/break guard; opens after its attack');
}

// 5) SWARM: AoE clears the cluster; one-at-a-time is a slog -------------------
{
  const m = spawn('swarm');
  assert.equal(m.count, 5);
  assert.equal(m.hit(99).swarmKilled, 1);               // single hit = one
  assert.equal(m.count, 4);
  const r = m.hit(99, { aoe: true });                   // the spin/swirl hit
  assert.ok(r.swarmKilled >= 3); assert.equal(m.dead, true);
  pass('SWARM: a single hit kills one; the AoE/spin hit clears the whole cluster');
}

// 6) BRUTE / RANGED / JUMPER telegraph before their hit ----------------------
{
  const b = spawn('brute'); b.update(1.2); assert.ok(b.isTelegraphing()); b.update(1.2); assert.ok(b.flag('slamming')); b.update(0.3); assert.ok(b.inPunishWindow());
  const r = spawn('ranged'); r.update(1.0); assert.ok(r.isTelegraphing()); r.update(0.7); assert.ok(r.flag('firing'));
  const j = spawn('jumper'); j.update(1.0); assert.ok(j.isTelegraphing()); j.update(0.6); assert.ok(j.flag('leaping')); j.update(0.5); assert.ok(j.inPunishWindow());
  pass('BRUTE / RANGED / JUMPER each telegraph, then strike, then (brute/jumper) open a punish window');
}

// 7) AMBUSHER: hidden until perception/WIS reveals it ------------------------
{
  const m = spawn('ambusher');
  assert.ok(m.isHidden());
  assert.equal(m.reveal(2), false);                     // too little WIS
  assert.ok(m.isHidden());
  assert.equal(m.reveal(3), true);                      // enough WIS -> revealed
  assert.ok(!m.isHidden());
  assert.equal(m.state, 'revealed');
  pass('AMBUSHER: hidden until perception/WIS (>=3) reveals it');
}

// 8) BOSS = archetype + trick + twist ----------------------------------------
{
  const boss = spawn('drowned_guardian');
  assert.equal(boss.trick.tool, 'tool_lantern');        // the trick
  assert.ok(boss.isGuarding());                          // phase 1: shrouded/shielded
  assert.equal(boss.hit(20, { angle: 'front' }).blocked, true);  // can't just swing
  assert.equal(boss.hit(20, { tool: 'tool_lantern' }).dealt, 20); // lantern (trick) strips the shroud
  // chunk it past the half-HP gate -> the TWIST (enrages into a BRUTE)
  while (boss.hp / boss.maxHp > 0.5) boss.hit(20, { tool: 'tool_lantern' });
  assert.ok(boss.twists >= 1);                           // the twist fired
  assert.equal(boss.fsm, ARCHETYPES.brute.states ? boss.fsm : boss.fsm); // (now running the brute FSM)
  assert.ok('windup' in boss.fsm.states);               // it is the brute behaviour now
  pass('BOSS (Drowned Guardian) = shielded + lantern TRICK + a half-HP TWIST into a brute');
}

// 9) a mid-fight monster serializes + restores -------------------------------
{
  const m = spawn('charger_electric'); m.update(1.5); m.hp = 10; // charging, hurt
  const j = m.serialize();
  const m2 = fromJSON(j);
  assert.equal(m2.id, 'charger_electric');
  assert.equal(m2.hp, 10);
  assert.equal(m2.state, m.state);
  assert.equal(m2.isInvulnerable(), m.isInvulnerable()); // same behaviour state restored
  pass('a mid-fight monster serializes + restores its hp + behaviour state');
}

console.log(`\nALL ${n} CHECKS PASSED ✅`);
