// =============================================================================
// Self-test for the COMPLETE Emberwood (M15-M16 + SE1-SE5) as DATA on the
// engines. Proves the region chain, the fire/frost tool + Shard #4 (4/5), the
// PERMANENT M16 split (mercy/seize/take -> distinct deeds; mercy opens Liberator
// + secret, seize LOCKS Liberator), the firefrost gate, the 4th Pem clue making
// SG2 completable, the heavy no-win settlement (ET4 + the lost half), the Weeping
// Tree compassion, and save -> reload. Plain Node + node:assert.
// =============================================================================

import assert from 'node:assert/strict';
import { KarmaEngine } from '../../systems/Karma.js';
import { QuestEngine } from '../../systems/QuestEngine.js';
import { Dialogue } from '../../systems/Dialogue.js';
import { memoryStorage } from '../../systems/storage.js';
import { QUESTS } from './index.js';

let n = 0;
const pass = (m) => { n++; console.log('  ✓ ' + m); };
console.log('Emberwood — complete (M15-M16 + SE1-SE5) — self test\n');

function play(engine, karma, qid, choiceId) {
  assert.equal(engine.start(qid), true, `start ${qid}`);
  const dlg = new Dialogue(engine.defs[qid].dialogue, { karma, engine });
  let guard = 0;
  while (!dlg.done && guard++ < 40) {
    const opts = dlg.options();
    let i = opts.findIndex((o) => o.choice && o.choice.id === choiceId);
    if (i < 0) i = 0;
    dlg.select(i);
  }
  assert.equal(engine.chosenOn(qid), choiceId, `chose ${choiceId} on ${qid}`);
  assert.equal(engine.complete(qid), true, `complete ${qid}`);
}

// Fresh game fast-forwarded to the Emberwood (M16 available). m4='explore' seeds
// cave_lore (for the secret), M7='accept' unlocks the Pem hunt SG2.
function newEmber({ m4 = 'explore', hagga = 'believe' } = {}) {
  const karma = new KarmaEngine({ storage: memoryStorage() });
  const engine = new QuestEngine({ karma, storage: memoryStorage(), quests: QUESTS });
  const ff = { M2: 'catch', M4: m4, M7: 'accept', M8: 'kind', M9: 'clear', M10: hagga,
    M11: 'lean_workers', M12: 'clear', M13: 'lean_authority', M14: 'clear', M15: 'enter' };
  for (const qid of ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12', 'M13', 'M14', 'M15']) {
    play(engine, karma, qid, ff[qid] || engine.defs[qid].choices[0]?.id);
  }
  return { karma, engine };
}
const shardCount = (k) => k.deedIds().filter((d) => /^shard_\d+$/.test(d)).length;

// 0) content sanity (the heavy beats must exist + read) ---------------------
const probe = new QuestEngine({ karma: new KarmaEngine({ storage: memoryStorage() }), storage: memoryStorage(), quests: QUESTS });
assert.match(probe.defs.M16.dialogue.nodes.agony.text, /five hundred years/);
assert.match(probe.defs.SE2.dialogue.nodes.both.text, /only ONE of you/);
assert.match(probe.defs.SE4.dialogue.nodes.witness.text, /warm, like a forehead/);
assert.equal(probe.defs.SE2.choices.length, 2); // no "save both" — the no-win is the point
pass('the heavy beats are present (M16 agony, the no-win settlement, the Weeping Tree)');

// 1) M14 -> M15 -> M16 chain + M16 grants fire/frost + Shard #4 (4/5) --------
const main = newEmber();
assert.equal(main.engine.status('M15'), 'complete');
assert.equal(main.engine.status('M16'), 'available');
assert.equal(shardCount(main.karma), 3); // marsh/peaks/coast so far
play(main.engine, main.karma, 'M16', 'mercy');
assert.equal(main.karma.hasDeed('tool_firefrost'), true);
assert.equal(main.karma.hasDeed('shard_4'), true);
assert.equal(shardCount(main.karma), 4);                  // 4/5
assert.equal(main.engine.status('M17'), 'available');     // M16 -> M17
pass('M14 -> M15 -> M16; M16 grants tool_firefrost + shard_4 (4/5); unlocks M17');

// 2) M16 PERMANENT — three branches diverge hard ----------------------------
const seize = newEmber();
play(seize.engine, seize.karma, 'M16', 'seize');
assert.equal(seize.karma.hasDeed('god_seized'), true);
assert.equal(seize.karma.hasDeed('mercy_shown'), false);
assert.ok(seize.engine.pruned.has('L-path'));             // SEIZE locks the Liberator path
assert.ok(seize.engine.unlocked.has('T-path'));

const take = newEmber();
play(take.engine, take.karma, 'M16', 'take');
assert.equal(take.karma.hasDeed('god_taken'), true);
assert.equal(take.karma.hasDeed('mercy_shown'), false);
assert.equal(take.karma.hasDeed('god_seized'), false);

assert.equal(main.karma.hasDeed('mercy_shown'), true);    // mercy path records the canonical ending-gate deed
assert.ok(!main.engine.pruned.has('L-path'));             // mercy keeps the Liberator path open
pass('M16 split: mercy (mercy_shown, L open) / seize (god_seized, L LOCKED, T open) / take (god_taken)');

// 3) mercy_shown opens Liberator; god_seized (no mercy) locks it (karma gates) ----
{
  // simulate the not-yet-authored M17 opposition + a pure standing
  main.karma.recordDeed('sela_opposed'); main.karma.set('purity', 40);
  assert.equal(main.karma.reachableEndings().L.reachable, true);   // pure + mercy + believed + opposed
  seize.karma.recordDeed('sela_opposed'); seize.karma.set('purity', 40);
  assert.equal(seize.karma.reachableEndings().L.reachable, false); // no mercy_shown -> never Liberator
  pass('mercy_shown opens the Liberator ending; god_seized (no mercy_shown) leaves it closed');
}

// 4) E1 drops the 4th Pem clue -> the SG2 hunt becomes completable -----------
{
  const e = newEmber();
  e.karma.recordDeed('pem_clue_marsh'); e.karma.recordDeed('pem_clue_peaks'); e.karma.recordDeed('pem_clue_coast');
  assert.equal(e.engine.status('SG2'), 'locked'); // still missing the emberwood clue
  play(e.engine, e.karma, 'SE1', 'study');
  assert.equal(e.karma.hasDeed('pem_clue_emberwood'), true); // the 4th
  assert.equal(e.engine.status('SG2'), 'available');         // all four clues now in
  play(e.engine, e.karma, 'SG2', 'find_pem');
  assert.equal(e.karma.hasDeed('pem_found'), true);          // hunt finished
  // secret Ashbearer now in reach (cave_lore + pem_found + mercy_shown)
  play(e.engine, e.karma, 'M16', 'mercy');
  assert.equal(e.karma.reachableEndings().A.reachable, true);
  pass('SE1 drops the 4th Pem clue -> SG2 completable (pem_found); secret Ashbearer reachable');
}

// 5) E3 firefrost-gated -----------------------------------------------------
assert.equal(main.engine.status('SE3'), 'available'); // main earned firefrost
{
  const blank = new QuestEngine({ karma: new KarmaEngine({ storage: memoryStorage() }), storage: memoryStorage(), quests: QUESTS });
  assert.equal(blank.status('SE3'), 'locked'); // no firefrost at the start
}
pass('SE3 Ashen Relics is fire/frost-gated (open with tool_firefrost, locked without)');

// 6) E2 the HEAVY settlement — records ET4 + the lost half -------------------
{
  const a = newEmber();
  play(a.engine, a.karma, 'SE2', 'save_burning');
  assert.equal(a.karma.hasDeed('saved_burning'), true);
  assert.equal(a.karma.getDeed('saved_burning').meta.lost, 'freezing'); // the unsaved half, for the epilogue
  assert.ok(a.engine.unlocked.has('ET4'));
  const b = newEmber();
  play(b.engine, b.karma, 'SE2', 'save_freezing');
  assert.equal(b.karma.getDeed('saved_freezing').meta.lost, 'burning');
  pass('SE2 settlement: save one half, the other is lost + remembered (ET4)');
}

// 7) E4 The Weeping Tree — quiet compassion (+P) -----------------------------
{
  const c = newEmber();
  const p0 = c.karma.get('purity');
  play(c.engine, c.karma, 'SE4', 'witness');
  assert.equal(c.karma.hasDeed('weeping_tree'), true);
  assert.equal(c.karma.get('purity'), p0 + 10);
  assert.ok(c.engine.unlocked.has('ET11'));
  pass('SE4 Weeping Tree: witnessing records weeping_tree (+P compassion, ET11)');
}

// 7b) SE5 bounty — the Cinder Stag (M15-gated epic-loot hunt) plays to completion --
{
  assert.equal(main.engine.status('SE5'), 'available');   // M15 done -> the Emberwood bounty opens
  play(main.engine, main.karma, 'SE5', 'slay');
  assert.equal(main.karma.hasDeed('cinder_stag_slain'), true);
  assert.equal(main.engine.defs.SE5.reward.items[0], 'cinderhide_cloak');   // the epic reward is wired
  pass('SE5 Cinder Stag bounty: M15-gated (available), plays to slay -> cinder_stag_slain + Cinderhide Cloak reward');
}

// 8) persists through save -> reload -----------------------------------------
main.karma.save(); main.engine.save();
const karma2 = new KarmaEngine({ storage: main.karma.storage });
assert.equal(karma2.load(), true);
const engine2 = new QuestEngine({ karma: karma2, storage: main.engine.storage, quests: QUESTS });
assert.equal(engine2.loadSave(), true);
['tool_firefrost', 'shard_4', 'mercy_shown']
  .forEach((d) => assert.equal(karma2.hasDeed(d), true, `deed ${d} persisted`));
assert.equal(engine2.status('M16'), 'complete');
assert.equal(engine2.status('M17'), 'available');
assert.equal(shardCount(karma2), 4);
pass('save -> reload: firefrost + shard_4 (4/5) + the permanent M16 choice all restored');

console.log(`\nShards -> ${karma2.deedIds().filter((d) => /^shard_\d+$/.test(d)).join(', ')} (count ${shardCount(karma2)}/5)`);
console.log(`Tools -> ${karma2.deedIds().filter((d) => d.startsWith('tool_')).join(', ')}`);
console.log(`\nALL ${n} CHECKS PASSED ✅`);
