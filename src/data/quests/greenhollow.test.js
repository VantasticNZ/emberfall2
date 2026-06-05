// =============================================================================
// Self-test for the Greenhollow childhood quests (M1-M4) as DATA on the engines.
// Plays a real childhood through the Dialogue system and proves the chain,
// the seeded deed-memory (for later callbacks), the chicken-kick ally lock,
// the cave_lore secret seed, and save -> reload. Plain Node + node:assert.
// =============================================================================

import assert from 'node:assert/strict';
import { KarmaEngine } from '../../systems/Karma.js';
import { QuestEngine } from '../../systems/QuestEngine.js';
import { Dialogue } from '../../systems/Dialogue.js';
import { memoryStorage } from '../../systems/storage.js';
import { GREENHOLLOW_CHILDHOOD } from './greenhollow.js';

let n = 0;
const pass = (m) => { n++; console.log('  ✓ ' + m); };
console.log('Greenhollow childhood (M1-M4) — self test\n');

const kStore = memoryStorage(), qStore = memoryStorage();
const karma = new KarmaEngine({ storage: kStore });
const engine = new QuestEngine({ karma, storage: qStore, quests: GREENHOLLOW_CHILDHOOD });

// Walk a quest's real dialogue to the option that makes `choiceId`, then complete it.
function play(qid, choiceId) {
  assert.equal(engine.start(qid), true, `start ${qid}`);
  const dlg = new Dialogue(engine.defs[qid].dialogue, { karma, engine });
  let guard = 0;
  while (!dlg.done && guard++ < 20) {
    const opts = dlg.options();
    let i = opts.findIndex((o) => o.choice && o.choice.id === choiceId);
    if (i < 0) i = 0;                 // advance through narration nodes
    dlg.select(i);
  }
  assert.equal(engine.chosenOn(qid), choiceId, `chose ${choiceId} on ${qid}`);
  assert.equal(engine.complete(qid), true, `complete ${qid}`);
}

// 0) content sanity (real dialogue, not stubs) -----------------------------
assert.match(engine.defs.M1.dialogue.nodes.forge.text, /little terror/);
assert.match(engine.defs.M2.dialogue.nodes.chase.text, /boot it/);
pass('real dialogue content present (Bram/Tam voice)');

// 1) initial gating — only M1 open -----------------------------------------
assert.equal(engine.status('M1'), 'available');
['M2', 'M3', 'M4', 'M5'].forEach((id) => assert.equal(engine.status(id), 'locked'));
pass('initial gating: M1 available, M2-M5 locked');

// 2) M1 greet -> M2 unlocks -------------------------------------------------
play('M1', 'greet');
assert.equal(karma.hasDeed('greeted_warmly'), true);
assert.equal(karma.get('morality'), 10);
assert.equal(engine.status('M1'), 'complete');
assert.equal(engine.status('M2'), 'available');
pass('M1 greet: +Morality + deed; completing M1 unlocks M2');

// 3) M2 KICK THE CHICKEN -> deed + Morality drop + ally locked --------------
play('M2', 'kick');
assert.equal(karma.hasDeed('chicken_kicked'), true);     // signature seeded deed
assert.equal(karma.get('morality'), -5);                 // 10 - 15
assert.ok(engine.pruned.has('SG7ally'));                 // orchard-kid ally locked out
assert.equal(engine.status('M3'), 'available');
pass('M2 kick: records chicken_kicked, drops Morality, locks the orchard-kid ally');

// 4) M3 return the coin -> deed + karma -------------------------------------
play('M3', 'return');
assert.equal(karma.hasDeed('coin_returned'), true);
assert.equal(karma.get('morality'), 5);                  // -5 + 10
assert.equal(karma.get('purity'), 10);                   // 0 + 10
assert.equal(engine.status('M4'), 'available');
pass('M3 return: records coin_returned, +Morality/+Purity; unlocks M4');

// 5) M4 EXPLORE ALONE -> cave_lore (secret-ending seed) ---------------------
play('M4', 'explore');
assert.equal(karma.hasDeed('cave_lore'), true);          // the weeping-flame carving
assert.equal(engine.status('M4'), 'complete');
assert.equal(engine.status('M5'), 'available');
pass('M4 explore: records cave_lore (secret seed); unlocks M5');

// 6) the seeded deeds are all queryable (persist for later callbacks) -------
['greeted_warmly', 'chicken_kicked', 'coin_returned', 'cave_lore']
  .forEach((d) => assert.equal(karma.hasDeed(d), true, `deed ${d} queryable`));
assert.equal(karma.getDeed('chicken_kicked').meta.quest, 'M2'); // tagged with its quest
pass('all seeded childhood deeds queryable afterward (chicken/coin/cave/greeting)');

// 7) save -> reload keeps progress + memory --------------------------------
karma.save(); engine.save();
const karma2 = new KarmaEngine({ storage: kStore });
assert.equal(karma2.load(), true);
const engine2 = new QuestEngine({ karma: karma2, storage: qStore, quests: GREENHOLLOW_CHILDHOOD });
assert.equal(engine2.loadSave(), true);
['M1', 'M2', 'M3', 'M4'].forEach((id) => assert.equal(engine2.status(id), 'complete'));
assert.equal(engine2.status('M5'), 'available');
assert.equal(engine2.chosenOn('M2'), 'kick');
assert.ok(engine2.pruned.has('SG7ally'));                // the ally lock persisted
assert.equal(karma2.hasDeed('cave_lore'), true);         // memory persisted
assert.deepEqual(karma2.getStatus(), { morality: 5, moralityTier: 'Neutral', purity: 10, purityTier: 'Untested' });
pass('save -> reload: M1-M4 complete, M5 available, choices + deeds + ally-lock restored');

console.log(`\nChildhood result -> karma ${JSON.stringify(karma2.getStatus())}`);
console.log(`Seeded deeds -> ${karma2.deedIds().join(', ')}`);
console.log(`Quests -> M1-M4 complete, M5 ${engine2.status('M5')}`);
console.log(`\nALL ${n} CHECKS PASSED ✅`);
