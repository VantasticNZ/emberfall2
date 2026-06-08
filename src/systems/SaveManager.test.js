// =============================================================================
// Self-test for the SaveManager (the unified world save). Proves: world-position +
// time + per-chunk DELTA round-trip (save → reload restores EXACTLY), sparse delta
// recording (opened/killed/picked/flags), forward MIGRATION of a legacy blob (the
// save-versioning rule — no throw, no lost progress), composed sub-system save via
// link(), and corrupt-save robustness. Plain Node + node:assert.
// =============================================================================

import assert from 'node:assert/strict';
import { SaveManager, SAVE_VERSION, RECENTRE_V3_SHIFT_PX, RECENTRE_V3_SHIFT_CHUNKS } from './SaveManager.js';
import { memoryStorage } from './storage.js';

let n = 0;
const pass = (m) => { n++; console.log('  ✓ ' + m); };

// 1) WORLD POSITION + TIME round-trip ----------------------------------------
{
  const store = memoryStorage();
  const sm = new SaveManager({ storage: store });
  sm.setPosition(8192.6, 4096.2).setTimeFrac(0.42).setArea('overworld').save();

  const sm2 = new SaveManager({ storage: store });
  assert.equal(sm2.hasSave(), true);
  assert.equal(sm2.load(), true);
  assert.deepEqual(sm2.getPosition(), { x: 8193, y: 4096 });   // rounded, restored
  assert.equal(sm2.getTimeFrac(), 0.42);
  assert.equal(sm2.getArea().area, 'overworld');
  pass('world position + time + area survive save → reload exactly');
}

// 2) PER-CHUNK DELTA round-trip (opened / killed / picked / flag) -------------
{
  const store = memoryStorage();
  const sm = new SaveManager({ storage: store });
  sm.recordOpened(3, 5, 'cupboard_a');
  sm.recordKilled(3, 5, 'charger_1');
  sm.recordPicked(7, 2, 'orb_9');
  sm.setChunkFlag(3, 5, 'lever_pulled', 1);
  sm.save();

  const sm2 = new SaveManager({ storage: store });
  sm2.load();
  assert.equal(sm2.isOpened(3, 5, 'cupboard_a'), true);
  assert.equal(sm2.isKilled(3, 5, 'charger_1'), true);
  assert.equal(sm2.isPicked(7, 2, 'orb_9'), true);
  assert.equal(sm2.getChunkFlag(3, 5, 'lever_pulled'), 1);
  // negatives: untouched chunk + unknown id report clean
  assert.equal(sm2.isOpened(3, 5, 'cupboard_b'), false);
  assert.equal(sm2.isPicked(9, 9, 'orb_1'), false);
  assert.equal(sm2.chunkDelta(9, 9), null);                    // sparse: untouched chunk stores nothing
  pass('per-chunk deltas (opened/killed/picked/flags) round-trip; untouched chunks stay sparse');
}

// 3) SAVE-VERSIONING: a legacy (pre-v2) blob migrates FORWARD, no throw/no loss --
{
  const store = memoryStorage();
  const legacy = JSON.stringify({ position: { x: 100, y: 200 } });   // v1-ish shape, no `v`, old key
  store.write('emberfall:world:slot1', legacy);
  const sm = new SaveManager({ storage: store });
  assert.doesNotThrow(() => sm.load());
  assert.equal(sm.state.v, SAVE_VERSION);                      // bumped to current
  assert.deepEqual(sm.getPosition(), { x: 100, y: 200 });      // old position preserved
  assert.deepEqual(sm.state.chunks, {});                       // new fields defaulted, not undefined
  pass('legacy save migrates forward to current version (position preserved, new fields defaulted)');
}

// 4) link()ed sub-system composes into the one save -------------------------
{
  const store = memoryStorage();
  // a tiny fake system with serialize/hydrate (stands in for Karma/Inventory/…)
  const make = () => { let s = { gold: 0 }; return { s, serialize: () => ({ gold: s.gold }), hydrate: (b) => { s.gold = b.gold; } }; };
  const a = make(); a.s.gold = 77;
  const sm = new SaveManager({ storage: store }).link('econ', a);
  sm.setPosition(1, 1).save();

  const b = make();
  const sm2 = new SaveManager({ storage: store }).link('econ', b);
  sm2.load();
  assert.equal(b.s.gold, 77);                                  // sub-system state restored via the unified save
  pass('linked sub-system serialize/hydrate composes into the unified world save');
}

// 5) ROBUSTNESS: corrupt save doesn't throw; clear() wipes -------------------
{
  const store = memoryStorage();
  store.write('emberfall:world:slot1', '{not valid json');
  const sm = new SaveManager({ storage: store });
  assert.doesNotThrow(() => sm.load());
  assert.equal(sm.load(), false);                              // corrupt → reports failure, stays empty (no crash)
  assert.deepEqual(sm.getPosition(), { x: 0, y: 0 });

  sm.setPosition(5, 5).save();
  assert.equal(sm.hasSave(), true);
  sm.clear();
  assert.equal(sm.hasSave(), false);
  assert.deepEqual(sm.getPosition(), { x: 0, y: 0 });
  pass('corrupt save is survived (no throw); clear() wipes the slot');
}

// 6) RE-CENTRE MIGRATION (v2 → v3): pre-recentre world coords shift by +4 chunks ----
{
  const store = memoryStorage();
  // a real v2 (pre-recentre) overworld save: position + a chunk delta in OLD coords
  const v2 = JSON.stringify({
    v: 2, pos: { x: 5824, y: 5728 }, area: 'overworld', timeFrac: 0.1,
    chunks: { '5,5': { opened: { chest_wood: 1 }, killed: {}, picked: {}, flags: {} } },
    systems: { econ: { gold: 40 } },
  });
  store.write('emberfall:world:slot1', v2);
  const sm = new SaveManager({ storage: store });
  assert.doesNotThrow(() => sm.load());
  assert.equal(sm.state.v, SAVE_VERSION);                                   // bumped to v3
  // position shifted by the re-centre amount (+4096 px both axes) → relocated, not lost
  assert.deepEqual(sm.getPosition(), { x: 5824 + RECENTRE_V3_SHIFT_PX, y: 5728 + RECENTRE_V3_SHIFT_PX });
  // chunk delta key remapped (5,5 → 9,9) so the opened chest stays with its (now-moved) content
  assert.equal(sm.isOpened(5 + RECENTRE_V3_SHIFT_CHUNKS, 5 + RECENTRE_V3_SHIFT_CHUNKS, 'chest_wood'), true);
  assert.equal(sm.isOpened(5, 5, 'chest_wood'), false);                     // not left at the OLD chunk
  assert.deepEqual(sm.state.systems.econ, { gold: 40 });                    // coord-independent state untouched
  pass('v2→v3 re-centre migration shifts world position + chunk deltas by +4 chunks (playthrough preserved)');
}

console.log(`\nALL ${n} CHECKS PASSED ✅`);
