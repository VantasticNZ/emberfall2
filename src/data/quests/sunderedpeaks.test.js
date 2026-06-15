// =============================================================================
// Self-test for the COMPLETE Sundered Peaks (M11-M12 + SP1-SP5) as DATA on the
// engines. Proves the region chain, the grapple tool + Shard #2 (2/5), the
// grapple-gated climb, the cross-region M12 truth reaction, the Pem clue, the
// faction echo, and the SIGNATURE trick (SP5 flips on CURRENT karma) under both
// a kind and a cruel state. Plain Node + node:assert.
// =============================================================================

import assert from 'node:assert/strict';
import { KarmaEngine } from '../../systems/Karma.js';
import { QuestEngine } from '../../systems/QuestEngine.js';
import { Dialogue } from '../../systems/Dialogue.js';
import { memoryStorage } from '../../systems/storage.js';
import { QUESTS } from './index.js';

let n = 0;
const pass = (m) => { n++; console.log('  ✓ ' + m); };
console.log('Sundered Peaks — complete (M11-M12 + SP1-SP5) — self test\n');

// Walk a quest's dialogue to the option that makes `choiceId`, then complete it.
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

// Walk a REACTIVE quest (outcome forced by karma, not a menu): select the choice
// option whenever it appears, else advance; returns the choice id that fired.
function walkReactive(engine, karma, qid) {
  assert.equal(engine.start(qid), true, `start ${qid}`);
  const dlg = new Dialogue(engine.defs[qid].dialogue, { karma, engine });
  let guard = 0;
  while (!dlg.done && guard++ < 40) {
    const opts = dlg.options();
    const ci = opts.findIndex((o) => o.choice);
    dlg.select(ci >= 0 ? ci : 0);
  }
  assert.equal(engine.complete(qid), true, `complete ${qid}`);
  return engine.chosenOn(qid);
}

// A fresh game fast-forwarded to the Peaks: M1-M10 (believe Hagga) + M11.
// `lean` picks the M11 dispute side; extra karma can be injected for SP5.
function newPeaks({ lean = 'lean_workers', hagga = 'believe' } = {}) {
  const karma = new KarmaEngine({ storage: memoryStorage() });
  const engine = new QuestEngine({ karma, storage: memoryStorage(), quests: QUESTS });
  const ff = { M2: 'catch', M8: 'kind', M9: 'clear', M10: hagga, M11: lean };
  for (const qid of ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11']) {
    play(engine, karma, qid, ff[qid] || engine.defs[qid].choices[0]?.id);
  }
  return { karma, engine };
}

const shardCount = (k) => k.deedIds().filter((d) => /^shard_\d+$/.test(d)).length;

// 0) content sanity ---------------------------------------------------------
const probe = new QuestEngine({ karma: new KarmaEngine({ storage: memoryStorage() }), storage: memoryStorage(), quests: QUESTS });
assert.match(probe.defs.M12.dialogue.nodes.grapple.text, /CLIMB\/GRAPPLE/);
assert.match(probe.defs.SP5.dialogue.nodes.trap.text, /no brother/);
assert.equal(probe.defs.SP5.choices.length, 2); // rescue / duped are OUTCOMES, not a player menu
pass('real region dialogue present (the grapple, the trick\'s trap)');

// 1) M10 -> M11 -> M12 chain ------------------------------------------------
{
  const { engine } = newPeaks();
  assert.equal(engine.status('M11'), 'complete');
  assert.equal(engine.status('M12'), 'available'); // M11 -> M12
  pass('M10 -> M11 -> M12 chain (the north road into the Peaks)');
}

// 2) M12 grants grapple + Shard #2 (2/5), unlocks M13 -----------------------
const main = newPeaks();
assert.equal(shardCount(main.karma), 1); // only the marsh shard so far
play(main.engine, main.karma, 'M12', 'clear');
assert.equal(main.karma.hasDeed('tool_grapple'), true);
assert.equal(main.karma.hasDeed('shard_2'), true);
assert.equal(shardCount(main.karma), 2);                 // 2/5
assert.equal(main.karma.hasDeed('order_chose_lie'), true); // the truth
assert.equal(main.engine.status('M13'), 'available');    // M12 -> M13
pass('M12 Cinder Keep: grants tool_grapple + shard_2 (2/5) + order_chose_lie; unlocks M13');

// 3) M12 truth reacts to the M10 decision -----------------------------------
function truthNodeFor(hagga) {
  const { karma, engine } = newPeaks({ hagga });
  const dlg = new Dialogue(engine.defs.M12.dialogue, { karma, engine });
  // advance to the (reactive) truth node
  let guard = 0, seen = [];
  while (!dlg.done && guard++ < 40) {
    if (dlg.nodeId) seen.push(dlg.nodeId);
    if (/^truth_/.test(dlg.nodeId)) break;
    const ci = dlg.options().findIndex((o) => o.choice);
    dlg.select(ci >= 0 ? ci : 0);
  }
  return seen.find((s) => /^truth_/.test(s));
}
assert.equal(truthNodeFor('believe'), 'truth_believed'); // "exactly as Hagga said"
assert.equal(truthNodeFor('report'), 'truth_reported');  // "you tell yourself it's forged"
pass('M12 truth is reactive to the M10 permanent decision (believed vs reported)');

// 4) SP4 grapple-gated; SP1 Pem clue; SP3 faction echo ----------------------
{
  const { karma, engine } = main; // already cleared M12 -> has tool_grapple, leaned workers
  assert.equal(engine.status('SP4'), 'available');  // grapple earned
  play(engine, karma, 'SP1', 'read');
  assert.equal(karma.hasDeed('pem_clue_peaks'), true);   // toward the cross-region Pem hunt
  assert.equal(karma.hasDeed('order_records'), true);
  play(engine, karma, 'SP3', 'workers');
  assert.equal(karma.hasDeed('faction_workers'), true);  // faction echo
  assert.ok(engine.unlocked.has('ET6'));
  pass('SP4 grapple-gated (open); SP1 drops pem_clue_peaks; SP3 records faction_workers (ET6)');
}
{
  const blank = new QuestEngine({ karma: new KarmaEngine({ storage: memoryStorage() }), storage: memoryStorage(), quests: QUESTS });
  assert.equal(blank.status('SP4'), 'locked'); // no grapple at the start
  pass('SP4 High-Pass Climb is grapple-gated (locked without tool_grapple)');
}

// 4b) SP2 bounty — the Crag Beast (optional epic-loot hunt) plays to completion --
{
  const { karma, engine } = main; // leaned workers -> SP1/SP2/SP3 unlocked; grapple earned
  assert.equal(engine.status('SP2'), 'available');   // unlocked by the lean_workers dispute choice
  play(engine, karma, 'SP2', 'slay');
  assert.equal(karma.hasDeed('crag_beast_slain'), true);
  assert.equal(engine.defs.SP2.reward.items[0], 'crag_maul');   // the epic reward is wired
  pass('SP2 Crag Beast bounty: available (lean_workers), plays to slay -> crag_beast_slain + Crag Maul reward');
}

// 5) SP5 THE TRICK — outcome flips on CURRENT karma -------------------------
const kind = newPeaks();                       // kind run (high Morality)
assert.ok(kind.karma.get('morality') >= 20);
assert.equal(walkReactive(kind.engine, kind.karma, 'SP5'), 'rescue');
assert.equal(kind.karma.hasDeed('stranger_rescued'), true);

const cruel = newPeaks({ lean: 'lean_owner' });
cruel.karma.set('morality', -40); cruel.karma.set('purity', -30); // a cruel/corrupt standing
assert.equal(walkReactive(cruel.engine, cruel.karma, 'SP5'), 'duped');
assert.equal(cruel.karma.hasDeed('stranger_used'), true);
assert.equal(cruel.karma.hasDeed('stranger_rescued'), false);
pass('SP5 trick: Kind state -> genuine rescue (stranger_rescued); Cruel/Corrupt state -> used as a thug (stranger_used)');

// 6) persists through save -> reload ----------------------------------------
main.karma.save(); main.engine.save();
const karma2 = new KarmaEngine({ storage: main.karma.storage });
assert.equal(karma2.load(), true);
const engine2 = new QuestEngine({ karma: karma2, storage: main.engine.storage, quests: QUESTS });
assert.equal(engine2.loadSave(), true);
['tool_grapple', 'shard_2', 'order_chose_lie', 'pem_clue_peaks', 'faction_workers']
  .forEach((d) => assert.equal(karma2.hasDeed(d), true, `deed ${d} persisted`));
assert.equal(engine2.status('M12'), 'complete');
assert.equal(engine2.status('M13'), 'available');
assert.equal(shardCount(karma2), 2);
pass('save -> reload: grapple + shard_2 (2/5) + truth + Pem clue + faction all restored');

console.log(`\nShards -> ${karma2.deedIds().filter((d) => /^shard_\d+$/.test(d)).join(', ')} (count ${shardCount(karma2)}/5)`);
console.log(`Tools -> ${karma2.deedIds().filter((d) => d.startsWith('tool_')).join(', ')}`);
console.log(`\nALL ${n} CHECKS PASSED ✅`);
