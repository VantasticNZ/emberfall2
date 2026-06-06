// =============================================================================
// Self-test for the PHILOSOPHY / THOUGHT-EXPERIMENT side quests (PH1-PH6), which
// live in their regions' side files. Proves each loads with real dialogue,
// records its distinct deed(s) + shifts karma where specified, that PH1 is
// genuinely no-win (no zero-death path), the lighter PH2/PH6 shift no karma, the
// regional availability gates, and save -> reload. Plain Node + node:assert.
// =============================================================================

import assert from 'node:assert/strict';
import { KarmaEngine } from '../../systems/Karma.js';
import { QuestEngine } from '../../systems/QuestEngine.js';
import { Dialogue } from '../../systems/Dialogue.js';
import { memoryStorage } from '../../systems/storage.js';
import { QUESTS } from './index.js';

let n = 0;
const pass = (m) => { n++; console.log('  ✓ ' + m); };
console.log('Philosophy / thought-experiment side quests (PH1-PH6) — self test\n');

function play(engine, karma, qid, choiceId) {
  assert.equal(engine.start(qid), true, `start ${qid}`);
  const dlg = new Dialogue(engine.defs[qid].dialogue, { karma, engine });
  let g = 0;
  while (!dlg.done && g++ < 40) {
    const opts = dlg.options();
    let i = opts.findIndex((o) => o.choice && o.choice.id === choiceId);
    if (i < 0) i = 0;
    dlg.select(i);
  }
  assert.equal(engine.chosenOn(qid), choiceId, `chose ${choiceId} on ${qid}`);
  assert.equal(engine.complete(qid), true, `complete ${qid}`);
}
function visit(engine, karma, qid) {
  const dlg = new Dialogue(engine.defs[qid].dialogue, { karma, engine });
  const seen = [dlg.nodeId];
  let g = 0;
  while (!dlg.done && g++ < 40) { if (dlg.options().some((o) => o.choice)) break; dlg.select(0); if (dlg.nodeId) seen.push(dlg.nodeId); }
  return seen;
}
// Fast-forward M1-M15 so every PH region (M7/M8/M11/M13/M15) is reached.
function newPhil() {
  const karma = new KarmaEngine({ storage: memoryStorage() });
  const engine = new QuestEngine({ karma, storage: memoryStorage(), quests: QUESTS });
  const ff = { M2: 'catch', M4: 'explore', M7: 'accept', M8: 'kind', M9: 'clear', M10: 'believe',
    M11: 'lean_workers', M12: 'clear', M13: 'lean_authority', M14: 'clear', M15: 'enter' };
  for (const qid of ['M1','M2','M3','M4','M5','M6','M7','M8','M9','M10','M11','M12','M13','M14','M15']) {
    play(engine, karma, qid, ff[qid] || engine.defs[qid].choices[0]?.id);
  }
  return { karma, engine };
}
const def = (id) => QUESTS.find((q) => q.id === id);

// 0) all six load with real dialogue, in their regions ----------------------
assert.match(def('PH1').dialogue.nodes.scene.text, /runaway|CART|pinned/i);
assert.match(def('PH2').dialogue.nodes.riddle.text, /who shaves the BARBER/);
assert.match(def('PH3').dialogue.nodes.arbitrate.text, /grandfather's axe/);
assert.match(def('PH4').dialogue.nodes.frame_plain.text, /draw lots for which half/);
assert.match(def('PH5').dialogue.nodes.offer.text, /need never hurt again/);
assert.match(def('PH6').dialogue.nodes.mule.text, /DEAD BETWIXT/);
assert.deepEqual([def('PH1').region, def('PH2').region, def('PH3').region, def('PH4').region, def('PH5').region, def('PH6').region],
  ['Sundered Peaks', 'Tidewreck Coast', 'Greenhollow', 'Emberwood', 'Ashen Marsh', 'Greenhollow']);
pass('PH1-PH6 all load with real dialogue, placed in their fitting regions');

// 1) regional availability gates --------------------------------------------
const { karma, engine } = newPhil();
['PH1', 'PH2', 'PH3', 'PH4', 'PH5', 'PH6'].forEach((id) => assert.equal(engine.status(id), 'available', `${id} available`));
const blank = new QuestEngine({ karma: new KarmaEngine({ storage: memoryStorage() }), storage: memoryStorage(), quests: QUESTS });
assert.equal(blank.status('PH1'), 'locked'); // gated on M11 (the region)
assert.equal(blank.status('PH4'), 'locked'); // gated on M15
pass('each PH slots into its region (available after reaching it; locked before)');

// 2) PH1 The Runaway Cart — genuinely NO-WIN (no zero-death path) ------------
assert.equal(def('PH1').choices.length, 3);
def('PH1').choices.forEach((c) => assert.ok(c.meta.died >= 1)); // no choice saves everyone
const m0 = karma.get('morality');
play(engine, karma, 'PH1', 'try');                  // the "save all" attempt
assert.equal(karma.hasDeed('cart_tried_all'), true);
assert.equal(karma.get('morality'), m0 + 5);        // honoured for trying — but...
assert.equal(def('PH1').choices.find((c) => c.id === 'try').meta.died, 1); // ...the one still dies
assert.deepEqual(def('PH1').choices.map((c) => c.deed).sort(), ['cart_diverted', 'cart_held', 'cart_tried_all']);
pass('PH1 trolley: no-win (every branch kills >=1, no save-all); distinct deeds; weighs Morality');

// 3) PH4 The Veil — weighs Purity; reactive to the SE2 settlement choice -----
{
  const p0 = karma.get('purity');
  play(engine, karma, 'PH4', 'need');
  assert.equal(karma.hasDeed('veil_need'), true);
  assert.equal(karma.get('purity'), p0 + 10);
  // SE2 tie: if you already chose a settlement half, the elder names it
  const k2 = new KarmaEngine({ storage: memoryStorage() }); k2.recordDeed('saved_burning');
  const e2 = new QuestEngine({ karma: k2, storage: memoryStorage(), quests: QUESTS });
  assert.ok(visit(e2, k2, 'PH4').includes('frame_se2'));
  assert.ok(!visit(engine, karma, 'PH4').includes('frame_se2')); // main run didn't do SE2 -> plain frame
  pass("PH4 veil of ignorance: weighs Purity (need +P); reactively ties to the SE2 settlement choice");
}

// 4) PH5 The Experience Stone — take(-P) / refuse(+P) distinct ---------------
{
  const a = newPhil(); const pa = a.karma.get('purity');
  play(a.engine, a.karma, 'PH5', 'refuse');
  assert.equal(a.karma.hasDeed('stone_refused'), true);
  assert.equal(a.karma.get('purity'), pa + 10);
  const b = newPhil(); const pb = b.karma.get('purity');
  play(b.engine, b.karma, 'PH5', 'take');
  assert.equal(b.karma.hasDeed('stone_taken'), true);
  assert.equal(b.karma.hasDeed('stone_refused'), false);
  assert.equal(b.karma.get('purity'), pb - 10);
  pass('PH5 experience machine: refuse the illusion (+P) vs take it (-P) — distinct, haunting');
}

// 5) PH3 Grandfather's Axe — identity views, relationship deed ---------------
play(engine, karma, 'PH3', 'his');
assert.equal(karma.hasDeed('axe_meaning'), true);
assert.deepEqual(def('PH3').choices.map((c) => c.deed).sort(), ['axe_continuity', 'axe_material', 'axe_meaning']);
pass('PH3 ship of Theseus: three identity rulings, distinct relationship deeds');

// 6) PH2 + PH6 — the LIGHT ones shift no karma ------------------------------
{
  const before = [engine.karma.get('morality'), engine.karma.get('purity')];
  play(engine, karma, 'PH2', 'spot');
  assert.equal(karma.hasDeed('barber_paradox_seen'), true);
  play(engine, karma, 'PH6', 'break');
  assert.equal(karma.hasDeed('mule_freed'), true);
  assert.deepEqual([karma.get('morality'), karma.get('purity')], before); // neither shifted karma
  pass('PH2 barber paradox + PH6 Buridan\'s mule: puzzle/comic — record a deed, shift no karma');
}

// 7) persists through save -> reload -----------------------------------------
karma.save(); engine.save();
const karma2 = new KarmaEngine({ storage: karma.storage });
assert.equal(karma2.load(), true);
const engine2 = new QuestEngine({ karma: karma2, storage: engine.storage, quests: QUESTS });
assert.equal(engine2.loadSave(), true);
['cart_tried_all', 'veil_need', 'axe_meaning', 'barber_paradox_seen', 'mule_freed']
  .forEach((d) => assert.equal(karma2.hasDeed(d), true, `deed ${d} persisted`));
assert.equal(engine2.status('PH1'), 'complete');
pass('save -> reload: all philosophy-quest deeds + completion restored');

console.log(`\nPhilosophy deeds -> ${karma2.deedIds().filter((d) => /cart_|veil_|axe_|barber_|mule_|stone_/.test(d)).join(', ')}`);
console.log(`\nALL ${n} CHECKS PASSED ✅`);
