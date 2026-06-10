// =============================================================================
// INTERIORS runtime gate (Phase 0) — the body-walk reachability + no-prop navGates run on each
// INTERIOR region (the Tankard floors + the test dungeon floors), exactly as for an overworld region.
// Proves a real 16×8 body can walk each interior spawn → its doors/stairs + chest, against the real
// wall colliders, and the walls hold. (Interiors validate the SAME way as regions — v2 §3.1.)
// =============================================================================

import assert from 'node:assert/strict';
import { TANKARD_F1, TANKARD_F2, TEST_CAVE_F1, TEST_CAVE_F2, GH_FORGE, GH_STORE, GH_CHAPEL, GH_HOME1, GH_HOME2, LOST_CEMETERY, MIREFEN_HUT, FENWICK_HOME, WORLD_LAYOUT, INTERIORS, TILE } from '../../src/data/worldmap.js';
import { bodyWalkReachability, noSolidPropOnWalkable } from '../../src/systems/navGates.js';

let n = 0; const pass = (m) => { n++; console.log('  ✓ ' + m); };

const CASES = [
  { R: TANKARD_F1, name: 'Copper Tankard — floor 1', expect: { startTile: [3, 8], reachOpen: [[2, 8] /*exit*/, [11, 2] /*upstairs*/, [7, 5] /*chest*/], reachGatedOnlyWithTool: [], blockedMustHold: [[0, 0], [13, 9]] } },
  { R: TANKARD_F2, name: 'Copper Tankard — floor 2', expect: { startTile: [11, 2], reachOpen: [[10, 2] /*downstairs*/, [6, 5] /*chest*/], reachGatedOnlyWithTool: [], blockedMustHold: [[0, 0], [13, 9]] } },
  { R: TEST_CAVE_F1, name: 'Test dungeon — floor 1', expect: { startTile: [3, 8], reachOpen: [[2, 8] /*exit*/, [11, 2] /*descend*/, [7, 5] /*chest*/], reachGatedOnlyWithTool: [], blockedMustHold: [[0, 0], [13, 9]] } },
  { R: TEST_CAVE_F2, name: 'Test dungeon — floor 2', expect: { startTile: [11, 2], reachOpen: [[10, 2] /*ascend*/, [6, 5] /*chest*/], reachGatedOnlyWithTool: [], blockedMustHold: [[0, 0], [13, 9]] } },
  // PHASE-2 GREENHOLLOW town interiors — the body walks spawn → the front door + chest around the furniture
  { R: GH_FORGE, name: 'Greenhollow — the forge', expect: { startTile: [6, 7], reachOpen: [[6, 7] /*door*/, [9, 5] /*chest*/, [10, 7]], reachGatedOnlyWithTool: [], blockedMustHold: [[0, 0], [2, 1] /*anvil*/] } },
  { R: GH_STORE, name: 'Greenhollow — the store', expect: { startTile: [6, 7], reachOpen: [[6, 7], [9, 5], [10, 7]], reachGatedOnlyWithTool: [], blockedMustHold: [[0, 0], [2, 1] /*barrel*/] } },
  { R: GH_CHAPEL, name: 'Greenhollow — the chapel', expect: { startTile: [5, 10], reachOpen: [[5, 10], [9, 9], [5, 2] /*the altar approach*/], reachGatedOnlyWithTool: [], blockedMustHold: [[0, 0], [5, 1] /*font*/] } },
  { R: GH_HOME1, name: 'Greenhollow — cottage 1', expect: { startTile: [5, 6], reachOpen: [[5, 6], [8, 5], [1, 6]], reachGatedOnlyWithTool: [], blockedMustHold: [[0, 0], [1, 1] /*barrel*/] } },
  { R: GH_HOME2, name: 'Greenhollow — cottage 2', expect: { startTile: [5, 6], reachOpen: [[5, 6], [8, 5], [1, 6]], reachGatedOnlyWithTool: [], blockedMustHold: [[0, 0], [8, 1] /*barrel*/] } },
  { R: LOST_CEMETERY, name: 'The Lost Cemetery', expect: { startTile: [11, 14], reachOpen: [[11, 14] /*gate*/, [19, 4] /*offering chest*/, [11, 12], [15, 12] /*the mourner aisle*/], reachGatedOnlyWithTool: [], blockedMustHold: [[0, 0], [10, 2] /*founder's grave*/] } },
  { R: MIREFEN_HUT, name: "Mirefen — Yssa's hut", expect: { startTile: [5, 7], reachOpen: [[5, 7] /*door*/, [9, 5] /*chest*/, [4, 5]], reachGatedOnlyWithTool: [], blockedMustHold: [[0, 0], [1, 1] /*bed*/] } },
  { R: FENWICK_HOME, name: 'Fenwick — the cottage', expect: { startTile: [5, 6], reachOpen: [[5, 6] /*door*/, [8, 5] /*chest*/, [4, 4]], reachGatedOnlyWithTool: [], blockedMustHold: [[0, 0], [1, 1] /*bed*/] } },
];

for (const { R, name, expect } of CASES) {
  const bw = bodyWalkReachability(R, expect);
  assert.ok(bw.ok, `${name}: body-walk FAILED — ${bw.failures.join(' | ')}`);
  const np = noSolidPropOnWalkable(R);
  assert.ok(np.ok, `${name}: solid prop on a walkable tile — ${np.offenders.join(' | ')}`);
  pass(`${name}: a body walks spawn → doors/stairs + chest; the walls hold; no prop on the floor`);
}

// WORLD-LAYOUT (the content-sized greybox city/towns/villages/dungeons) — the STREET GRID connects
// the spawn → every district chest + the exit; the building blocks hold; no prop on a street.
for (const R of WORLD_LAYOUT) {
  const ox = R.origin.x, oy = R.origin.y;
  const chestTiles = R.chests.map((c) => [Math.round((c.x - ox - TILE / 2) / TILE), Math.round((c.y - oy - TILE / 2) / TILE)]);
  const expect = { startTile: [1, 1], reachOpen: [[1, 1], ...chestTiles], reachGatedOnlyWithTool: [], blockedMustHold: [[3, 3] /*a building block*/] };
  const bw = bodyWalkReachability(R, expect);
  assert.ok(bw.ok, `${R.key}: body-walk FAILED — ${bw.failures.join(' | ')}`);
  assert.ok(noSolidPropOnWalkable(R).ok, `${R.key}: solid prop on a walkable street`);
  pass(`${R.label}: the street grid connects spawn → all ${R.chests.length} district chest(s); the blocks hold`);
}

// CONTAINMENT (bug-fix guard) — every interior/settlement must be FULLY ENCLOSED: no walkable tile on
// the perimeter ring (else the player walks off the floor into the void). Asserts the boundary holds.
{
  let checked = 0;
  for (const R of INTERIORS) {
    const nav = R.nav; if (!nav) continue;
    const { walkable, W, H } = nav; const escapes = [];
    for (let x = 0; x < W; x++) { if (walkable[0][x]) escapes.push([x, 0]); if (walkable[H - 1][x]) escapes.push([x, H - 1]); }
    for (let y = 0; y < H; y++) { if (walkable[y][0]) escapes.push([0, y]); if (walkable[y][W - 1]) escapes.push([W - 1, y]); }
    assert.equal(escapes.length, 0, `${R.key}: ${escapes.length} walkable PERIMETER tile(s) — the player can walk into the void (${escapes.slice(0, 3).map((t) => t.join(',')).join(' ')})`);
    // DASH-CONTAINMENT: the wall ring blocks WALK (above) + the swept-dodge checks the same colliders, and
    // the runtime hard-clamps the player to interior bounds — so a dash cannot breach into the void. Assert
    // the clamp's inputs exist: interior flag + valid bounds matching the nav grid.
    assert.ok(R.interior === true, `${R.key}: not flagged interior — the dash containment clamp won't apply`);
    assert.ok(R.bounds && R.bounds.w === W * TILE && R.bounds.h === H * TILE, `${R.key}: bounds don't match the nav grid — clamp would be wrong`);
    checked++;
  }
  pass(`containment: all ${checked} interiors/settlements fully enclosed — no walkable perimeter (walk) + sealed walls & bounds-clamp (dash) → no void-breach`);
}

console.log(`interiors.test: ${n} interiors + settlements reachability-proven`);
