// =============================================================================
// Self-test for the COMPLETE Ashen Marsh narrative (M8-M10 + SA1-SA5) as DATA on
// the engines. Proves the region chain, the PERMANENT M10 three-way divergence
// (believe/report/silent set distinct deeds + karma + open/lock the Liberator
// path), SA2's not-reported gate, the Frog puzzle (escape-only, no karma), the
// Pem clue + drowned-letter links, and save -> reload. Plain Node + node:assert.
// =============================================================================

import assert from 'node:assert/strict';
import { KarmaEngine } from '../../systems/Karma.js';
import { QuestEngine } from '../../systems/QuestEngine.js';
import { Dialogue } from '../../systems/Dialogue.js';
import { memoryStorage } from '../../systems/storage.js';
import { QUESTS } from './index.js';

let n = 0;
const pass = (m) => { n++; console.log('  ✓ ' + m); };
console.log('Ashen Marsh — complete (M8-M10 + SA1-SA5) — self test\n');

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

// A fresh game fast-forwarded through M1-M9 to M10 (KIND to the bog-folk so the
// SA1/SA2 hooks open; the lantern + shard #1 earned).
function newMarsh() {
  const karma = new KarmaEngine({ storage: memoryStorage() });
  const engine = new QuestEngine({ karma, storage: memoryStorage(), quests: QUESTS });
  const ff = { M2: 'catch', M8: 'kind', M9: 'clear' };
  for (const qid of ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9']) {
    const cid = ff[qid] || engine.defs[qid].choices[0]?.id;
    play(engine, karma, qid, cid);
  }
  return { karma, engine };
}

// 0) content + Gate-D-shape sanity ------------------------------------------
const probe = new QuestEngine({ karma: new KarmaEngine({ storage: memoryStorage() }), storage: memoryStorage(), quests: QUESTS });
assert.match(probe.defs.M10.dialogue.nodes.truth.text, /a god, old as the first hearth/);
assert.match(probe.defs.SA4.dialogue.nodes.chase.text, /FROG/);
assert.equal(probe.defs.SA3.status, undefined); // (sanity: defs carry no runtime state)
pass('real dialogue present (Hagga\'s reveal, the Frog)');

// 1) reach M10 --------------------------------------------------------------
{
  const { engine } = newMarsh();
  assert.equal(engine.status('M9'), 'complete');
  assert.equal(engine.status('M10'), 'available');  // M9 -> M10
  pass('M9 -> M10 unlocks (Hagga\'s Truth available)');
}

// 2) M10 PERMANENT — three branches genuinely diverge -----------------------
const believe = newMarsh();
play(believe.engine, believe.karma, 'M10', 'believe');
assert.equal(believe.karma.hasDeed('hagga_believed'), true);
assert.equal(believe.karma.get('purity') >= 10, true);
assert.ok(believe.engine.unlocked.has('L-path') && !believe.engine.pruned.has('L-path'));
assert.equal(believe.engine.status('M11'), 'available');

const report = newMarsh();
const pReport0 = report.karma.get('purity');
play(report.engine, report.karma, 'M10', 'report');
assert.equal(report.karma.hasDeed('hagga_reported'), true);
assert.equal(report.karma.hasDeed('hagga_believed'), false);    // never opened
assert.equal(report.karma.get('purity'), pReport0 - 10);
assert.ok(report.engine.pruned.has('L-path'));                   // Liberator path LOCKED

const silent = newMarsh();
play(silent.engine, silent.karma, 'M10', 'silent');
assert.equal(silent.karma.hasDeed('hagga_silent'), true);
assert.equal(silent.karma.hasDeed('hagga_believed'), false);
assert.equal(silent.karma.hasDeed('hagga_reported'), false);
pass('M10 permanent split: believe -> hagga_believed +P, opens L-path; report -> hagga_reported -P, LOCKS L-path; silent -> hagga_silent');

// 3) SA2 gated by NOT hagga_reported ----------------------------------------
assert.equal(believe.engine.status('SA2'), 'available');  // didn't report -> Hagga still here
assert.equal(report.engine.status('SA2'), 'locked');      // reported -> she's gone
pass("SA2 'Hagga's Errands' gated: available unless you reported Hagga");

// 4) SA4 Frog — escape-only PUZZLE, no kill path, no karma -------------------
assert.equal(believe.engine.defs.SA4.choices.length, 1);           // only 'escape'
assert.equal(believe.engine.defs.SA4.choices[0].id, 'escape');     // no kill/defeat choice
const m0 = believe.karma.get('morality'), p0 = believe.karma.get('purity');
play(believe.engine, believe.karma, 'SA4', 'escape');
assert.equal(believe.karma.hasDeed('frog_trophy'), true);
assert.equal(believe.karma.get('morality'), m0);                   // NO karma
assert.equal(believe.karma.get('purity'), p0);
pass('SA4 Frog: escape-only (no kill path), records frog_trophy, shifts no karma');

// 5) SA1 drops the Pem clue + SA5 records the link deed ----------------------
play(believe.engine, believe.karma, 'SA1', 'help');
assert.equal(believe.karma.hasDeed('pem_clue_marsh'), true);   // toward the cross-region Pem hunt
assert.equal(believe.karma.hasDeed('bog_troubles'), true);
play(believe.engine, believe.karma, 'SA5', 'carry');
assert.equal(believe.karma.hasDeed('drowned_letter'), true);
assert.equal(believe.karma.getDeed('drowned_letter').meta.npc, 'Mara'); // long-range link to a Greenhollow NPC
pass('SA1 drops pem_clue_marsh (+bog_troubles); SA5 records drowned_letter -> Mara');

// 6) SA3 lantern-gated ------------------------------------------------------
const blank = new QuestEngine({ karma: new KarmaEngine({ storage: memoryStorage() }), storage: memoryStorage(), quests: QUESTS });
assert.equal(blank.status('SA3'), 'locked');             // no lantern at the start
assert.equal(believe.engine.status('SA3'), 'available'); // lantern earned -> open
pass('SA3 The Sunken Dead is lantern-gated (locked without tool_lantern, open with it)');

// 7) save -> reload keeps the whole region + its memory ---------------------
believe.karma.save(); believe.engine.save();
const karma2 = new KarmaEngine({ storage: believe.karma.storage });
assert.equal(karma2.load(), true);
const engine2 = new QuestEngine({ karma: karma2, storage: believe.engine.storage, quests: QUESTS });
assert.equal(engine2.loadSave(), true);
['hagga_believed', 'tool_lantern', 'shard_1', 'pem_clue_marsh', 'frog_trophy', 'drowned_letter']
  .forEach((d) => assert.equal(karma2.hasDeed(d), true, `deed ${d} persisted`));
assert.equal(engine2.status('M10'), 'complete');
assert.equal(engine2.status('M11'), 'available');
assert.ok(engine2.unlocked.has('L-path'));
pass('save -> reload: M10 branch + tool/shard + Pem clue + letter + frog trophy all restored');

console.log(`\nBelieve-path deeds -> ${believe.karma.deedIds().filter((d) => /hagga|pem|drowned|frog|bog|tool_|shard_/.test(d)).join(', ')}`);
console.log(`Liberator path -> ${believe.engine.unlocked.has('L-path') ? 'OPEN' : 'closed'} (believe) / ${report.engine.pruned.has('L-path') ? 'LOCKED' : 'open'} (report)`);
console.log(`\nALL ${n} CHECKS PASSED ✅`);
