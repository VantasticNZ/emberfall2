// =============================================================================
// INTERIORS runtime gate (Phase 0) — the body-walk reachability + no-prop navGates run on each
// INTERIOR region (the Tankard floors + the test dungeon floors), exactly as for an overworld region.
// Proves a real 16×8 body can walk each interior spawn → its doors/stairs + chest, against the real
// wall colliders, and the walls hold. (Interiors validate the SAME way as regions — v2 §3.1.)
// =============================================================================

import assert from 'node:assert/strict';
import { TANKARD_F1, TANKARD_F2, TEST_CAVE_F1, TEST_CAVE_F2, GH_FORGE, GH_STORE, GH_CHAPEL, GH_HOME1, GH_HOME2 } from '../../src/data/worldmap.js';
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
];

for (const { R, name, expect } of CASES) {
  const bw = bodyWalkReachability(R, expect);
  assert.ok(bw.ok, `${name}: body-walk FAILED — ${bw.failures.join(' | ')}`);
  const np = noSolidPropOnWalkable(R);
  assert.ok(np.ok, `${name}: solid prop on a walkable tile — ${np.offenders.join(' | ')}`);
  pass(`${name}: a body walks spawn → doors/stairs + chest; the walls hold; no prop on the floor`);
}

console.log(`interiors.test: ${n} interiors reachability-proven`);
