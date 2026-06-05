// =============================================================================
// Self-test for Greenhollow M1-M7 (Act 1 + the karma-reactive adult return) as
// DATA on the engines. Plays a real childhood + catastrophe + return through the
// Dialogue system and proves the chain, the seeded deed-memory, the chicken-kick
// ally lock, the cave_lore secret seed, the grief vow + time-skip, the REACTIVE
// welcome (branches on Act-1 deeds/karma), the first-weapon reward, and
// save -> reload. Plain Node + node:assert.
// =============================================================================

import assert from 'node:assert/strict';
import { KarmaEngine } from '../../systems/Karma.js';
import { QuestEngine } from '../../systems/QuestEngine.js';
import { Dialogue } from '../../systems/Dialogue.js';
import { memoryStorage } from '../../systems/storage.js';
import { QUESTS } from './index.js';

let n = 0;
const pass = (m) => { n++; console.log('  ✓ ' + m); };
console.log('Greenhollow M1-M7 (Act 1 + reactive return) — self test\n');

const kStore = memoryStorage(), qStore = memoryStorage();
const karma = new KarmaEngine({ storage: kStore });
const engine = new QuestEngine({ karma, storage: qStore, quests: QUESTS });

// Walk a quest's real dialogue to the option that makes `choiceId`, then complete it.
function play(qid, choiceId) {
  assert.equal(engine.start(qid), true, `start ${qid}`);
  const dlg = new Dialogue(engine.defs[qid].dialogue, { karma, engine });
  let guard = 0;
  while (!dlg.done && guard++ < 40) {
    const opts = dlg.options();
    let i = opts.findIndex((o) => o.choice && o.choice.id === choiceId);
    if (i < 0) i = 0;                 // advance through narration/router nodes
    dlg.select(i);
  }
  assert.equal(engine.chosenOn(qid), choiceId, `chose ${choiceId} on ${qid}`);
  assert.equal(engine.complete(qid), true, `complete ${qid}`);
}

// 0) content sanity ---------------------------------------------------------
assert.match(engine.defs.M1.dialogue.nodes.forge.text, /little terror/);
assert.match(engine.defs.M6.dialogue.nodes.flee.text, /Take the toy/);
pass('real dialogue content present (warm Bram -> the loss)');

// 1-4) play the whole arc M1-M6 (greet / KICK / return / explore / comfort / protect)
play('M1', 'greet'); play('M2', 'kick'); play('M3', 'return');
play('M4', 'explore'); play('M5', 'comfort');
assert.equal(engine.status('M6'), 'available');
play('M6', 'protect');
assert.equal(karma.hasDeed('chicken_kicked'), true);
assert.ok(engine.pruned.has('SG7ally'));
assert.equal(karma.hasDeed('cave_lore'), true);
assert.equal(karma.hasDeed('grief_vow'), true);
assert.equal(karma.hasDeed('time_skip'), true);
assert.equal(karma.getStatus().morality, 25);   // kind overall, but kicked the chicken
assert.equal(engine.status('M7'), 'available');  // M6 -> M7
pass('Act 1 (M1-M6) plays through; deeds seeded; M6 -> M7 unlocks');

// 5) M7 — the karma-reactive return; press Sela; earn the first blade --------
play('M7', 'press');
assert.equal(karma.hasDeed('weapon_wooden_sword'), true);   // first weapon (flag/data reward)
assert.equal(engine.defs.M7.reward.weapon, 'wooden_sword'); // reward is data on the quest
assert.equal(karma.hasDeed('sela_doubt'), true);            // pressing Sela seeds doubt
assert.equal(engine.chosenOn('M7'), 'press');
assert.equal(engine.status('M7'), 'complete');
assert.equal(engine.status('M8'), 'available');             // M7 -> M8 (Ashen Marsh)
pass('M7: reactive return; first-weapon flag + data reward; press records sela_doubt; M7 -> M8');

// 6) THE WORLD REMEMBERS — the welcome branches by Act-1 profile -------------
// Drive M7's dialogue under contrasting karma profiles; capture which reactive
// nodes are visited.
function welcomePath(setup) {
  const k = new KarmaEngine({ storage: memoryStorage() });
  k.set('morality', setup.m);
  (setup.deeds || []).forEach((d) => k.recordDeed(d));
  const e = new QuestEngine({ karma: k, storage: memoryStorage(), quests: QUESTS });
  const dlg = new Dialogue(e.defs.M7.dialogue, { karma: k, engine: e });
  const visited = [dlg.nodeId];
  let guard = 0;
  while (!dlg.done && guard++ < 60) {
    const ci = dlg.options().findIndex((o) => o.choice);
    if (ci >= 0) { dlg.select(ci); break; }   // stop at Sela's choice
    dlg.select(0);
    if (dlg.nodeId) visited.push(dlg.nodeId);
  }
  return visited;
}
const warm = welcomePath({ m: 30, deeds: ['coin_returned', 'chicken_helped'] });
const wary = welcomePath({ m: -30, deeds: ['chicken_kicked', 'coin_kept'] });
assert.ok(warm.includes('welcome_warm') && warm.includes('coin_friendly'));
assert.ok(!warm.includes('chicken_cold') && !warm.includes('welcome_wary'));
assert.ok(wary.includes('welcome_wary') && wary.includes('chicken_cold'));
assert.ok(!wary.includes('coin_friendly') && !wary.includes('welcome_warm'));
assert.notDeepEqual(warm, wary);
pass('reactive welcome differs by profile: kind+coin_returned -> warm/McCracken; cruel+chicken_kicked -> wary/cold');

// grief-tone reactivity (vengeance vs protection read differently at the forge)
const veng = welcomePath({ m: 0, deeds: ['grief_vengeance'] });
const vow = welcomePath({ m: 0, deeds: ['grief_vow'] });
assert.ok(veng.includes('forge_hard') && !vow.includes('forge_hard'));
pass('grief tone remembered: grief_vengeance -> Hodge notes your edge (forge_hard)');

// 7) Sela choice paths distinct --------------------------------------------
const m7 = QUESTS.find((q) => q.id === 'M7');
assert.equal(m7.choices.find((c) => c.id === 'press').deed, 'sela_doubt');
assert.equal(m7.choices.find((c) => c.id === 'press').ending, 'L-hint');
assert.deepEqual(m7.choices.find((c) => c.id === 'accept').unlocks, ['SG1', 'SG2', 'SG3']);
pass('accept opens the Greenhollow side-quest hooks (SG1-3); press leans L-hint');

// 8) all seeded deeds queryable (persist for later callbacks) ---------------
['greeted_warmly', 'chicken_kicked', 'coin_returned', 'cave_lore', 'comforted_child',
 'grief_vow', 'time_skip', 'weapon_wooden_sword', 'sela_doubt']
  .forEach((d) => assert.equal(karma.hasDeed(d), true, `deed ${d} queryable`));
pass('all 9 seeded deeds (childhood + return) queryable afterward');

// 9) save -> reload keeps the whole arc + memory ----------------------------
karma.save(); engine.save();
const karma2 = new KarmaEngine({ storage: kStore });
assert.equal(karma2.load(), true);
const engine2 = new QuestEngine({ karma: karma2, storage: qStore, quests: QUESTS });
assert.equal(engine2.loadSave(), true);
['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7'].forEach((id) => assert.equal(engine2.status(id), 'complete'));
assert.equal(engine2.status('M8'), 'available');
assert.equal(engine2.chosenOn('M7'), 'press');
assert.equal(karma2.hasDeed('weapon_wooden_sword'), true);
assert.ok(engine2.pruned.has('SG7ally'));
assert.deepEqual(karma2.getStatus(), { morality: 25, moralityTier: 'Kind', purity: 10, purityTier: 'Untested' });
pass('save -> reload: M1-M7 complete, M8 available, weapon + choices + deeds restored');

console.log(`\nResult -> karma ${JSON.stringify(karma2.getStatus())}`);
console.log(`Seeded deeds -> ${karma2.deedIds().join(', ')}`);
console.log(`Quests -> M1-M7 complete, M8 ${engine2.status('M8')}`);
console.log(`\nALL ${n} CHECKS PASSED ✅`);
