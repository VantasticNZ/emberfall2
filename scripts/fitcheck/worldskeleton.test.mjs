// =============================================================================
// WORLD-SKELETON runtime gates — the body-walk reachability + no-solid-prop-on-walkable
// navGates (v2 §3.1) run on the GREYBOX regions (Coast / Emberwood / Spire). Proves a real
// 16×8 body can WALK from each region's entry to every intended destination (town / dungeon /
// secret) against the real per-tile colliders, and that no solid prop sits on a walkable tile.
// (The cross-region gate-chain + entry gates are proven by verify's entrance-coherence gate.)
// =============================================================================

import assert from 'node:assert/strict';
import { TIDEWRECK_COAST, EMBERWOOD, HOLLOW_SPIRE } from '../../src/data/worldmap.js';
import { bodyWalkReachability, noSolidPropOnWalkable } from '../../src/systems/navGates.js';

let n = 0; const pass = (m) => { n++; console.log('  ✓ ' + m); };

// per region: start just INSIDE the entry, the intended destinations, + a filled tile that must hold
const CASES = [
  { R: TIDEWRECK_COAST, name: 'Tidewreck Coast', expect: {
    startTile: [5, 17], reachOpen: [[11, 7] /*harbour town*/, [23, 24] /*Drowned Vault*/, [3, 12] /*NW secret*/, [30, 16] /*E cliff path*/],
    reachGatedOnlyWithTool: [], blockedMustHold: [[1, 1], [33, 2]] } },
  { R: EMBERWOOD, name: 'Emberwood', expect: {
    startTile: [32, 8], reachOpen: [[9, 11] /*camp*/, [18, 23] /*Ember Hollow*/, [28, 15] /*fever-grove secret*/],
    reachGatedOnlyWithTool: [], blockedMustHold: [[1, 1], [34, 26]] } },
  { R: HOLLOW_SPIRE, name: 'Hollow Spire', expect: {
    startTile: [32, 35], reachOpen: [[18, 4] /*summit Binding Chamber*/, [12, 20] /*side-ledge secret*/],
    reachGatedOnlyWithTool: [], blockedMustHold: [[1, 1], [34, 38]] } },
];

for (const { R, name, expect } of CASES) {
  const bw = bodyWalkReachability(R, expect);
  assert.ok(bw.ok, `${name}: body-walk reachability FAILED — ${bw.failures.join(' | ')}`);
  const np = noSolidPropOnWalkable(R);
  assert.ok(np.ok, `${name}: solid prop on a walkable tile — ${np.offenders.join(' | ')}`);
  pass(`${name}: a real body walks entry → town + dungeon + secret; blocked zones hold; no prop on path`);
}

console.log(`worldskeleton.test: ${n} regions reachability-proven`);
