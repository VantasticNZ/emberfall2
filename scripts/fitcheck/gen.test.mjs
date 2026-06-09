// =============================================================================
// GENERATOR tests (Phase 1) — the generate→validate loop is SAFE:
//  (1) N generated DUNGEONS all pass navGates (reachable entrance→objective, walls hold, no prop on
//      a walkable tile) — because the loop only RETURNS a validated region.
//  (2) N generated CAVES likewise.
//  (3) the VALIDATOR genuinely REJECTS a broken layout (an objective walled off from the spawn) —
//      which is exactly what the loop rejects + regenerates. A validator that can't fail is worthless.
//  (4) the FALLBACK region (used when all tries fail) is itself navGate-valid (never ships broken).
// =============================================================================

import assert from 'node:assert/strict';
import { TILE } from '../../src/data/worldmap.js';
import { generateDungeon, generateCave } from '../../src/data/gen/index.js';
import { bodyWalkReachability, noSolidPropOnWalkable } from '../../src/systems/navGates.js';

let n = 0; const pass = (m) => { n++; console.log('  ✓ ' + m); };

// 1) DUNGEONS — every returned region passes navGates
let dFallbacks = 0;
for (let i = 0; i < 10; i++) {
  const r = generateDungeon({ key: 'gd' + i, otx: 440, oty: 480, seed: i * 131 + 7, gw: 4, gh: 3 });
  const bw = bodyWalkReachability(r.region, r.region.expect), np = noSolidPropOnWalkable(r.region);
  assert.ok(bw.ok, `dungeon #${i} body-walk FAILED — ${bw.failures.join(' | ')}`);
  assert.ok(np.ok, `dungeon #${i} prop-on-walkable — ${np.offenders.join(' | ')}`);
  assert.ok(r.region.chests.length >= 1, `dungeon #${i} has an objective chest`);
  if (r.fallback) dFallbacks++;
}
pass(`10 generated DUNGEONS all pass navGates (reachable objective, walls hold, no prop-on-walkable) — ${dFallbacks} fallback`);

// 2) CAVES — every returned region passes navGates
let cFallbacks = 0;
for (let i = 0; i < 10; i++) {
  const r = generateCave({ key: 'gc' + i, otx: 440, oty: 540, seed: i * 97 + 3, w: 26, h: 18 });
  const bw = bodyWalkReachability(r.region, r.region.expect), np = noSolidPropOnWalkable(r.region);
  assert.ok(bw.ok, `cave #${i} body-walk FAILED — ${bw.failures.join(' | ')}`);
  assert.ok(np.ok, `cave #${i} prop-on-walkable — ${np.offenders.join(' | ')}`);
  if (r.fallback) cFallbacks++;
}
pass(`10 generated CAVES all pass navGates (flood-fill connectivity holds, no prop-on-walkable) — ${cFallbacks} fallback`);

// 3) the VALIDATOR rejects a BROKEN layout (the objective walled off) — what the loop rejects
{
  const W = 12, H = 8, walkable = Array.from({ length: H }, () => new Uint8Array(W).fill(1)), colliders = [];
  for (let y = 0; y < H; y++) walkable[y][6] = 0;                                   // a full wall column splits the room
  for (let y = 0; y < H; y++) { walkable[y][0] = 0; walkable[y][W - 1] = 0; }
  for (let x = 0; x < W; x++) { walkable[0][x] = 0; walkable[H - 1][x] = 0; }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!walkable[y][x]) colliders.push({ x: x * TILE + TILE / 2, y: y * TILE + TILE / 2, w: TILE, h: TILE });
  const broken = { origin: { x: 0, y: 0 }, widthTiles: W, heightTiles: H, colliders, gatedColliders: [], props: [], nav: { walkable, gated: walkable.map((r) => new Uint8Array(r.length)), W, H } };
  const expect = { startTile: [2, 4], reachOpen: [[9, 4]], reachGatedOnlyWithTool: [], blockedMustHold: [[6, 4]] };
  const bw = bodyWalkReachability(broken, expect);
  assert.equal(bw.ok, false, 'the validator should REJECT a layout where the objective is walled off from the spawn');
  assert.ok(bw.failures.some((f) => /NOT reachable/.test(f)), 'the failure names the unreachable objective');
  pass('reject-on-fail: navGates CATCHES a walled-off objective (exactly what the loop rejects + regenerates)');
}

// 4) the loop NEVER returns an invalid region (fallback included) — covered by (1)+(2); assert the
//    fallback itself is reachable by forcing a 0-try budget (so generate falls straight to fallback).
{
  const r = generateDungeon({ key: 'gfb', otx: 440, oty: 480, seed: 1, maxTries: 0 });
  assert.ok(r.fallback, 'maxTries:0 forces the guaranteed-valid fallback');
  assert.ok(bodyWalkReachability(r.region, r.region.expect).ok && noSolidPropOnWalkable(r.region).ok, 'the FALLBACK region is itself navGate-valid — nothing broken ever ships');
  pass('fallback: when all tries fail, the guaranteed-valid fallback room is returned (navGate-valid)');
}

console.log(`gen.test: ${n} checks passed`);
