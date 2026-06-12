// NpcLife — POSTED NPCs stay put (regression lock for the shop-keeper-wandered bug).
// The motion-budget wander (item 5) made any scheduleless idle NPC "free" and let it wander.
// That drifted SHOPKEEPERS off their counters → the player reached the counter, no keeper, no
// shop → "shops have no items". Interaction-anchor NPCs (shop/quest/topics/social) are now
// marked `posted` and must NEVER free-wander. This test fails if that protection regresses.

import assert from 'node:assert';
import { NpcLife } from './NpcLife.js';

function fakeNpc(x, y, data = {}) {
  const _data = { ...data };
  return {
    x, y, facing: 'down', moveSpeed: 60,
    body: { velocity: { x: 0, y: 0 }, setVelocity(vx, vy) { this.velocity.x = vx; this.velocity.y = vy; } },
    setState() {}, isBusy() { return false; },
    getData(k) { return _data[k]; }, setData(k, v) { _data[k] = v; },
  };
}

const nl = new NpcLife({});
const keeper = fakeNpc(100, 100, { posted: true, role: '' });   // a shopkeeper (interaction anchor)
const guard  = fakeNpc(200, 200, { posted: false, role: 'guard' });
const idler  = fakeNpc(300, 300, { posted: false, role: '' });  // a plain background villager
nl.add(keeper, null, 'normal');   // all scheduleless
nl.add(guard, null, 'normal');
nl.add(idler, null, 'normal');

// run ~12s of frames — long past the first wander pause.
for (let i = 0; i < 240; i++) nl.update(0.05, false);

const km = nl.movers.find((m) => m.npc === keeper);
const gm = nl.movers.find((m) => m.npc === guard);
const im = nl.movers.find((m) => m.npc === idler);

// POSTED (shopkeeper) — never free, never wanders, never leaves its post.
assert.strictEqual(nl._isFree(km), false, 'a posted NPC (shopkeeper) must not be free');
assert.strictEqual(km.target, null, 'a posted NPC must never acquire a wander target');
assert.strictEqual(!!km.wandering, false, 'a posted NPC must never be wandering');

// GUARDS also hold their post (separate exclusion).
assert.strictEqual(nl._isFree(gm), false, 'a guard must not be free');
assert.strictEqual(gm.target, null, 'a guard must never wander');

// A PLAIN idle villager DOES wander (item-5 behaviour preserved).
assert.strictEqual(nl._isFree(im), true, 'a plain idle villager is free');
assert.ok(im.target || im.wandering, 'a free idle villager must take wander hops');

console.log('NpcLife: posted shopkeepers + guards stay put; plain idlers wander ✓');
