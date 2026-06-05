// =============================================================================
// Self-test for the Greenhollow childhood quests (M1-M6 = all of Act 1) as DATA
// on the engines. Plays a real childhood + the catastrophe through the Dialogue
// system and proves the chain, the seeded deed-memory (for later callbacks), the
// chicken-kick ally lock, the cave_lore secret seed, the grief vow + time-skip,
// and save -> reload. Plain Node + node:assert.
// =============================================================================

import assert from 'node:assert/strict';
import { KarmaEngine } from '../../systems/Karma.js';
import { QuestEngine } from '../../systems/QuestEngine.js';
import { Dialogue } from '../../systems/Dialogue.js';
import { memoryStorage } from '../../systems/storage.js';
import { GREENHOLLOW_CHILDHOOD } from './greenhollow.js';

let n = 0;
const pass = (m) => { n++; console.log('  ✓ ' + m); };
console.log('Greenhollow Act 1 (M1-M6) — self test\n');

const kStore = memoryStorage(), qStore = memoryStorage();
const karma = new KarmaEngine({ storage: kStore });
const engine = new QuestEngine({ karma, storage: qStore, quests: GREENHOLLOW_CHILDHOOD });

// Walk a quest's real dialogue to the option that makes `choiceId`, then complete it.
function play(qid, choiceId) {
  assert.equal(engine.start(qid), true, `start ${qid}`);
  const dlg = new Dialogue(engine.defs[qid].dialogue, { karma, engine });
  let guard = 0;
  while (!dlg.done && guard++ < 30) {
    const opts = dlg.options();
    let i = opts.findIndex((o) => o.choice && o.choice.id === choiceId);
    if (i < 0) i = 0;                 // advance through narration nodes
    dlg.select(i);
  }
  assert.equal(engine.chosenOn(qid), choiceId, `chose ${choiceId} on ${qid}`);
  assert.equal(engine.complete(qid), true, `complete ${qid}`);
}

// 0) content sanity (real dialogue, tone shift) ----------------------------
assert.match(engine.defs.M1.dialogue.nodes.forge.text, /little terror/);
assert.match(engine.defs.M5.dialogue.nodes.flicker.text, /FLINCHED/);   // dread
assert.match(engine.defs.M6.dialogue.nodes.flee.text, /Take the toy/);  // Bram's loss
pass('real dialogue content present (warm Bram -> dread -> the loss)');

// 1) initial gating — only M1 open -----------------------------------------
assert.equal(engine.status('M1'), 'available');
['M2', 'M3', 'M4', 'M5', 'M6', 'M7'].forEach((id) => assert.equal(engine.status(id), 'locked'));
pass('initial gating: M1 available, M2-M7 locked');

// 2) childhood M1-M4 (greet / KICK / return / explore) ----------------------
play('M1', 'greet');
assert.equal(karma.hasDeed('greeted_warmly'), true);
assert.equal(engine.status('M2'), 'available');
play('M2', 'kick');
assert.equal(karma.hasDeed('chicken_kicked'), true);
assert.ok(engine.pruned.has('SG7ally'));                 // orchard-kid ally locked out
assert.equal(karma.get('morality'), -5);                 // +10 -15
play('M3', 'return');
assert.equal(karma.hasDeed('coin_returned'), true);
play('M4', 'explore');
assert.equal(karma.hasDeed('cave_lore'), true);          // secret-ending seed
assert.equal(engine.status('M5'), 'available');
pass('M1-M4 chain unlocks; chicken-kick locks the ally; cave_lore seeded');

// 3) M5 The Festival — comfort the scared child -----------------------------
assert.equal(engine.status('M5'), 'available');
play('M5', 'comfort');
assert.equal(karma.hasDeed('comforted_child'), true);
assert.equal(karma.get('morality'), 15);                 // +5 (after M3) +10
assert.equal(engine.status('M5'), 'complete');
assert.equal(engine.status('M6'), 'available');          // M5 -> M6
pass('M4 -> M5 unlocks; comfort-child records its deed + shifts Morality; M5 -> M6');

// 4) M6 The Night It Burned — vow protection + time-skip --------------------
play('M6', 'protect');
assert.equal(karma.hasDeed('grief_vow'), true);          // the protection vow
assert.equal(karma.get('morality'), 25);                 // +10
assert.equal(karma.hasDeed('time_skip'), true);          // "TEN WINTERS PASS" set
assert.equal(engine.status('M6'), 'complete');
assert.equal(engine.status('M7'), 'available');          // adult-return stub unlocked
pass('M5 -> M6; grief choice records grief_vow; time-skip flag set; M6 -> M7');

// 5) vengeance vs protection are distinct paths -----------------------------
const m6 = GREENHOLLOW_CHILDHOOD.find((q) => q.id === 'M6');
assert.equal(m6.choices.find((c) => c.id === 'protect').deed, 'grief_vow');
assert.equal(m6.choices.find((c) => c.id === 'vengeance').deed, 'grief_vengeance');
assert.equal(m6.choices.find((c) => c.id === 'vengeance').ending, 'T-lean');
const kv = new KarmaEngine({ storage: memoryStorage() });
const ev = new QuestEngine({ karma: kv, storage: memoryStorage(), quests: GREENHOLLOW_CHILDHOOD });
ev.choose('M6', 'vengeance');
assert.equal(kv.hasDeed('grief_vengeance'), true);
assert.equal(kv.hasDeed('grief_vow'), false);            // distinct from the protection path
pass('grief paths distinct: vengeance -> grief_vengeance (T-lean), protect -> grief_vow');

// 6) all seeded Act-1 deeds queryable (persist for later callbacks) ---------
['greeted_warmly', 'chicken_kicked', 'coin_returned', 'cave_lore', 'comforted_child', 'grief_vow', 'time_skip']
  .forEach((d) => assert.equal(karma.hasDeed(d), true, `deed ${d} queryable`));
pass('all 7 seeded Act-1 deeds queryable afterward');

// 7) save -> reload keeps the whole arc + memory ----------------------------
karma.save(); engine.save();
const karma2 = new KarmaEngine({ storage: kStore });
assert.equal(karma2.load(), true);
const engine2 = new QuestEngine({ karma: karma2, storage: qStore, quests: GREENHOLLOW_CHILDHOOD });
assert.equal(engine2.loadSave(), true);
['M1', 'M2', 'M3', 'M4', 'M5', 'M6'].forEach((id) => assert.equal(engine2.status(id), 'complete'));
assert.equal(engine2.status('M7'), 'available');
assert.equal(engine2.chosenOn('M2'), 'kick');
assert.equal(engine2.chosenOn('M6'), 'protect');
assert.ok(engine2.pruned.has('SG7ally'));
assert.equal(karma2.hasDeed('grief_vow'), true);
assert.equal(karma2.hasDeed('time_skip'), true);
assert.deepEqual(karma2.getStatus(), { morality: 25, moralityTier: 'Kind', purity: 10, purityTier: 'Untested' });
pass('save -> reload: M1-M6 complete, M7 available, choices + deeds + ally-lock restored');

console.log(`\nAct 1 result -> karma ${JSON.stringify(karma2.getStatus())}`);
console.log(`Seeded deeds -> ${karma2.deedIds().join(', ')}`);
console.log(`Quests -> M1-M6 complete, M7 ${engine2.status('M7')}`);
console.log(`\nALL ${n} CHECKS PASSED ✅`);
