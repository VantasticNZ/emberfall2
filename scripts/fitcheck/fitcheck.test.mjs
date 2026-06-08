// =============================================================================
// TILED FIT-CHECK — headless half (GAME-BUILD-PLAYBOOK v2 §8.1). Proves:
//  (1) tiledToRegion() imports a .tmj → the engine's finite-region shape, offset by origin.
//  (2) the terrain tile layer converts → autotiler patches.
//  (3) the runtime nav gates PASS on the well-formed map, and — critically — FAIL on the exact
//      B2 bug class (solid props fragmenting a walkable corridor). A gate that can't fail is worthless.
// The live/eyes-on half (a real body walking it) is in docs/TILED-FIT-CHECK-REPORT.md + screenshots.
// =============================================================================

import assert from 'node:assert/strict';
import { tiledToRegion } from '../../src/data/tiledImport.js';
import { FITTEST, FITTEST_ORIGIN, FITTEST_EXPECT } from '../../src/data/fitcheck/fittest-map.js';
import { bodyWalkReachability, noSolidPropOnWalkable } from '../../src/systems/navGates.js';

let n = 0; const pass = (m) => { n++; console.log('  ✓ ' + m); };

const region = tiledToRegion(FITTEST, { key: 'FitCheck', origin: FITTEST_ORIGIN });

// 1) IMPORT — the .tmj round-trips into the finite-region shape.
assert.equal(region.key, 'FitCheck');
assert.deepEqual(region.origin, FITTEST_ORIGIN);
assert.equal(region.bounds.w, 16 * 32); assert.equal(region.bounds.h, 12 * 32);
assert.ok(region.colliders.length >= 5, 'nav blocked walls imported as colliders');
assert.equal(region.gatedColliders.length, 1, 'the gate imported as a gated collider');
assert.equal(region.gatedColliders[0].gate, 'tool_lantern');
assert.ok(region.props.length >= 3, 'props imported'); assert.equal(region.chests.length, 1, 'chest imported');
assert.equal(region.entrances.length, 1, 'entrance imported'); assert.equal(region.entrances[0].to, 'Greenhollow');
assert.ok(region.props.some((p) => p.key === 'prop_sign' && p.text), 'sign imported as a readable prop');
pass('IMPORT: .tmj → finite-region shape (colliders/gate/props/chest/sign/entrance), offset by origin');

// 2) TERRAIN-RENDER PATH — the tile layer converts to autotiler patches (dirt + water sets present).
const sets = region.terrain.patches.map((p) => p.set).sort();
assert.deepEqual(sets, ['dirt', 'water'], 'terrain tile layer → autotiler patches by set');
assert.ok(region.terrain.patches.find((p) => p.set === 'dirt').rects.length > 10, 'dirt path patch has tiles');
pass('TERRAIN: Tiled tile layer CONVERTS to autotiler terrain-patches (reuses the existing render)');

// 3) RUNTIME GATE — body-walk reachability PASSES on the well-formed map (with props placed).
const bw = bodyWalkReachability(region, FITTEST_EXPECT);
assert.ok(bw.ok, 'body-walk reachability failed: ' + bw.failures.join(' | '));
pass('GATE body-walk: open exit reachable, gated exit only with tool, every blocked zone HOLDS');

// 4) RUNTIME GATE — no solid prop on a walkable tile PASSES (the boulder is in a blocked zone).
const np = noSolidPropOnWalkable(region);
assert.ok(np.ok, 'no-solid-prop-on-walkable failed: ' + np.offenders.join(' | '));
pass('GATE no-prop-on-walkable: PASSES (solid boulder sits in a blocked zone, off the path)');

// 5) NEGATIVE — reproduce the B2 bug class: solid props ON the walkable trunk. BOTH gates MUST fire.
const bad = tiledToRegion(FITTEST, { key: 'FitCheckBad', origin: FITTEST_ORIGIN });
const at = (tx, ty) => ({ key: 'prop_rock_boulder', x: FITTEST_ORIGIN.x + tx * 32 + 16, y: FITTEST_ORIGIN.y + ty * 32 + 16, solid: true });
bad.props.push(at(7, 8), at(8, 8), at(9, 8));   // a wall of solid boulders across the 3-wide corridor
const badNp = noSolidPropOnWalkable(bad);
assert.equal(badNp.ok, false, 'no-prop-on-walkable should CATCH solid props on the corridor');
const badBw = bodyWalkReachability(bad, FITTEST_EXPECT);
assert.equal(badBw.ok, false, 'body-walk should CATCH the fragmented corridor (open exit now unreachable)');
assert.ok(badBw.failures.some((f) => /NOT reachable/.test(f)), 'the failure is the unreachable open exit (the B2 class)');
pass('NEGATIVE (B2 reproduction): both gates FAIL when solid props fragment the walkable corridor');

console.log(`fitcheck.test: ${n} checks passed`);
