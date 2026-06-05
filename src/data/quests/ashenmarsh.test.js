// =============================================================================
// Self-test for the Ashen Marsh region loop (M8 arrival + M9 Sunken Shrine) as
// DATA on the engines. Proves the chain into + through the region, the bog-folk
// karma choice, and that clearing the dungeon grants the LANTERN tool + SHARD #1
// as persistent flags later regions read. Plain Node + node:assert.
// =============================================================================

import assert from 'node:assert/strict';
import { KarmaEngine } from '../../systems/Karma.js';
import { QuestEngine } from '../../systems/QuestEngine.js';
import { Dialogue } from '../../systems/Dialogue.js';
import { memoryStorage } from '../../systems/storage.js';
import { QUESTS } from './index.js';

let n = 0;
const pass = (m) => { n++; console.log('  ✓ ' + m); };
console.log('Ashen Marsh (M8 arrival + M9 Sunken Shrine) — self test\n');

const kStore = memoryStorage(), qStore = memoryStorage();
const karma = new KarmaEngine({ storage: kStore });
const engine = new QuestEngine({ karma, storage: qStore, quests: QUESTS });

// Walk a quest's dialogue to the option that makes `choiceId`, then complete it.
function play(qid, choiceId) {
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

// Fast-forward the main chain M1-M7 (first choice each) to reach M8 available.
function reachM8() {
  for (const qid of ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7']) {
    assert.equal(engine.start(qid), true, `ff start ${qid}`);
    const first = engine.defs[qid].choices[0];
    if (first) engine.choose(qid, first.id);
    assert.equal(engine.complete(qid), true, `ff complete ${qid}`);
  }
}

// 0) content sanity ---------------------------------------------------------
assert.match(engine.defs.M8.dialogue.nodes.hagga.text, /Hearthflame really is/);
assert.match(engine.defs.M9.dialogue.nodes.lantern.text, /LANTERN/);
pass('real region dialogue present (Hagga / the Lantern)');

// 1) reach the region — M7 -> M8 unlocks ------------------------------------
reachM8();
assert.equal(engine.status('M7'), 'complete');
assert.equal(engine.status('M8'), 'available');
assert.equal(engine.status('M9'), 'locked');
pass('M7 -> M8 unlocks (the west road into the Ashen Marsh)');

// 2) M8 — the bog-folk choice records its deed + shifts Morality ------------
const before = karma.get('morality');
play('M8', 'kind');
assert.equal(karma.hasDeed('bogfolk_kind'), true);
assert.equal(karma.get('morality'), before + 10);
assert.equal(engine.status('M8'), 'complete');
assert.equal(engine.status('M9'), 'available');     // M8 -> M9
pass('M8: bog-folk choice records bogfolk_kind + shifts Morality; M8 -> M9 unlocks');

// bog-folk choices are distinct (cruel = -M, T-lean; kind opens SA1/SA2)
const m8 = QUESTS.find((q) => q.id === 'M8');
assert.equal(m8.choices.find((c) => c.id === 'cruel').deed, 'bogfolk_cruel');
assert.equal(m8.choices.find((c) => c.id === 'cruel').ending, 'T-lean');
assert.deepEqual(m8.choices.find((c) => c.id === 'kind').unlocks, ['SA1', 'SA2']);
pass('bog-folk paths distinct: cruel -> bogfolk_cruel (T-lean); kind opens SA1/SA2');

// 3) M9 — clear the Sunken Shrine: LANTERN + SHARD #1 -----------------------
assert.equal(karma.hasDeed('tool_lantern'), false); // not yet
play('M9', 'clear');
assert.equal(karma.hasDeed('tool_lantern'), true);  // region tool earned
assert.equal(karma.hasDeed('shard_1'), true);       // first shard claimed
assert.equal(engine.defs.M9.reward.tool, 'lantern'); // reward is also data on the quest
assert.equal(engine.defs.M9.reward.shard, 1);
assert.equal(engine.status('M9'), 'complete');
assert.equal(engine.status('M10'), 'available');    // M9 -> M10
pass('M9: clearing the shrine grants tool_lantern + shard_1; M9 -> M10 unlocks');

// 4) the lantern + shard FLAGS persist through save -> reload ---------------
karma.save(); engine.save();
const karma2 = new KarmaEngine({ storage: kStore });
assert.equal(karma2.load(), true);
const engine2 = new QuestEngine({ karma: karma2, storage: qStore, quests: QUESTS });
assert.equal(engine2.loadSave(), true);
assert.equal(karma2.hasDeed('tool_lantern'), true); // later regions can gate backtracking on this
assert.equal(karma2.hasDeed('shard_1'), true);      // the shard count reads this
assert.equal(engine2.status('M8'), 'complete');
assert.equal(engine2.status('M9'), 'complete');
assert.equal(engine2.status('M10'), 'available');
pass('save -> reload: tool_lantern + shard_1 + M8/M9 progress all restored');

const shards = karma2.deedIds().filter((d) => /^shard_\d+$/.test(d));
console.log(`\nTools -> ${karma2.deedIds().filter((d) => d.startsWith('tool_')).join(', ')}`);
console.log(`Shards -> ${shards.join(', ')} (count ${shards.length}/5)`);
console.log(`Quests -> M8/M9 complete, M10 ${engine2.status('M10')}`);
console.log(`\nALL ${n} CHECKS PASSED ✅`);
