// =============================================================================
// Self-test for the COMPLETE Tidewreck Coast (M13-M14 + ST1-ST5/ST8) as DATA on
// the engines. Proves the region chain, the hookshot tool + Shard #3 (3/5), the
// betrayal truth (reactive to the M10 decision), the hookshot gate, the faction
// fork, the lighthouse vignette branches, the SEEDED betrayal (vengeance/mercy
// distinct + reactive to your faction), the coast Pem clue, and save -> reload.
// Plain Node + node:assert.
// =============================================================================

import assert from 'node:assert/strict';
import { KarmaEngine } from '../../systems/Karma.js';
import { QuestEngine } from '../../systems/QuestEngine.js';
import { Dialogue } from '../../systems/Dialogue.js';
import { memoryStorage } from '../../systems/storage.js';
import { QUESTS } from './index.js';

let n = 0;
const pass = (m) => { n++; console.log('  ✓ ' + m); };
console.log('Tidewreck Coast — complete (M13-M14 + ST1-ST5/ST8) — self test\n');

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

// which nodes a quest's dialogue visits under a given karma (for reactive checks)
function visit(engine, karma, qid) {
  const dlg = new Dialogue(engine.defs[qid].dialogue, { karma, engine });
  const seen = [dlg.nodeId];
  let guard = 0;
  while (!dlg.done && guard++ < 40) {
    if (dlg.options().some((o) => o.choice)) break;
    dlg.select(0);
    if (dlg.nodeId) seen.push(dlg.nodeId);
  }
  return seen;
}

// Fresh game fast-forwarded to the coast: M1-M12 then M13 (lean configurable).
function newCoast({ lean = 'lean_authority', hagga = 'believe' } = {}) {
  const karma = new KarmaEngine({ storage: memoryStorage() });
  const engine = new QuestEngine({ karma, storage: memoryStorage(), quests: QUESTS });
  const ff = { M2: 'catch', M8: 'kind', M9: 'clear', M10: hagga, M11: 'lean_workers', M12: 'clear', M13: lean };
  for (const qid of ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12', 'M13']) {
    play(engine, karma, qid, ff[qid] || engine.defs[qid].choices[0]?.id);
  }
  return { karma, engine };
}

const shardCount = (k) => k.deedIds().filter((d) => /^shard_\d+$/.test(d)).length;

// 0) content sanity ---------------------------------------------------------
const probe = new QuestEngine({ karma: new KarmaEngine({ storage: memoryStorage() }), storage: memoryStorage(), quests: QUESTS });
assert.match(probe.defs.M14.dialogue.nodes.hookshot.text, /HOOKSHOT/);
assert.match(probe.defs.ST3.dialogue.nodes.climb.text, /kept it for my boy|keep the light/i);
assert.match(probe.defs.ST5.dialogue.nodes.face.text, /just COIN/);
pass('real region dialogue present (hookshot; the sad keeper; the betrayer)');

// 1) M12 -> M13 -> M14 chain ------------------------------------------------
{
  const { engine } = newCoast();
  assert.equal(engine.status('M13'), 'complete');
  assert.equal(engine.status('M14'), 'available'); // M13 -> M14
  pass('M12 -> M13 -> M14 chain (the east road to Saltbreak)');
}

// 2) M14 grants hookshot + Shard #3 (3/5) + betrayal truth, unlocks M15 -----
const main = newCoast();
assert.equal(shardCount(main.karma), 2); // marsh + peaks so far
play(main.engine, main.karma, 'M14', 'clear');
assert.equal(main.karma.hasDeed('tool_hookshot'), true);
assert.equal(main.karma.hasDeed('shard_3'), true);
assert.equal(shardCount(main.karma), 3);                  // 3/5
assert.equal(main.karma.hasDeed('vault_betrayal'), true); // the betrayal-in-the-past truth
assert.equal(main.engine.status('M15'), 'available');     // M14 -> M15
pass('M14 Drowned Vault: grants tool_hookshot + shard_3 (3/5) + vault_betrayal; unlocks M15');

// 3) M14 truth reacts to the M10 decision (foreshadows M17) -----------------
function truthFor(hagga) {
  const { karma, engine } = newCoast({ hagga });
  const dlg = new Dialogue(engine.defs.M14.dialogue, { karma, engine });
  let guard = 0, seen = [];
  while (!dlg.done && guard++ < 40) {
    if (dlg.nodeId) seen.push(dlg.nodeId);
    if (/^truth_/.test(dlg.nodeId)) break;
    const ci = dlg.options().findIndex((o) => o.choice);
    dlg.select(ci >= 0 ? ci : 0);
  }
  return seen.find((s) => /^truth_/.test(s));
}
assert.equal(truthFor('report'), 'truth_reported'); // "same logic that let you hand Hagga to Sela"
assert.equal(truthFor('believe'), 'truth_plain');   // foreshadows Sela
pass('M14 betrayal truth is reactive to the M10 decision (mirrors your own betrayal of Hagga)');

// 4) ST2 hookshot-gated; ST1 faction fork; ST8 Pem clue ---------------------
{
  const { karma, engine } = main; // cleared M14 -> has tool_hookshot
  assert.equal(engine.status('ST2'), 'available');  // hookshot earned
  play(engine, karma, 'ST1', 'run');
  assert.equal(karma.hasDeed('faction_smuggler'), true);   // faction echo
  assert.ok(engine.unlocked.has('ET5'));
  play(engine, karma, 'ST8', 'read');
  assert.equal(karma.hasDeed('pem_clue_coast'), true);     // toward the cross-region Pem hunt
  pass('ST2 hookshot-gated (open); ST1 records faction_smuggler (ET5); ST8 drops pem_clue_coast');
}
{
  const blank = new QuestEngine({ karma: new KarmaEngine({ storage: memoryStorage() }), storage: memoryStorage(), quests: QUESTS });
  assert.equal(blank.status('ST2'), 'locked'); // no hookshot at the start
  pass('ST2 Tide-Cave Treasures is hookshot-gated (locked without tool_hookshot)');
}

// 5) ST3 lighthouse vignette branches (stay vs brush off) -------------------
{
  const a = newCoast();
  play(a.engine, a.karma, 'ST3', 'stay');
  assert.equal(a.karma.hasDeed('keeper_stayed'), true);
  assert.ok(a.engine.unlocked.has('ET2')); // Bram grief echo
  const b = newCoast();
  play(b.engine, b.karma, 'ST3', 'brush');
  assert.equal(b.karma.hasDeed('keeper_brushed'), true);
  assert.equal(b.karma.hasDeed('keeper_stayed'), false);
  pass('ST3 Lighthouse Keeper vignette branches: stay (+M, ET2) vs brush off (distinct)');
}

// 6) ST5 SEEDED BETRAYAL — fires, reactive to faction, vengeance/mercy distinct
{
  // reactive intro: a smuggler run vs an authority tip name a different betrayer
  const sm = newCoast({ lean: 'lean_smugglers' });
  play(sm.engine, sm.karma, 'ST1', 'run'); // faction_smuggler
  assert.ok(visit(sm.engine, sm.karma, 'ST5').includes('set_smuggler'));
  const au = newCoast();
  play(au.engine, au.karma, 'ST1', 'turn_in'); // faction_authority
  assert.ok(visit(au.engine, au.karma, 'ST5').includes('set_authority'));
  // vengeance vs mercy distinct
  play(sm.engine, sm.karma, 'ST5', 'vengeance');
  assert.equal(sm.karma.hasDeed('betrayal_vengeance'), true);
  assert.ok(sm.engine.unlocked.has('ET7'));
  play(au.engine, au.karma, 'ST5', 'mercy');
  assert.equal(au.karma.hasDeed('betrayal_mercy'), true);
  assert.equal(au.karma.hasDeed('betrayal_vengeance'), false);
  pass('ST5 Saltbreak Betrayal: reactive to your faction; vengeance (-M, ET7) vs mercy (+M+P, ET7) distinct');
}

// 6b) ST4 bounty — the Wreck Wraith (M13-gated epic-loot hunt) plays to completion --
{
  assert.equal(main.engine.status('ST4'), 'available');   // M13 done -> the coast bounty opens
  play(main.engine, main.karma, 'ST4', 'slay');
  assert.equal(main.karma.hasDeed('wreck_wraith_slain'), true);
  assert.equal(main.engine.defs.ST4.reward.items[0], 'tideglass_blade');   // the epic reward is wired
  pass('ST4 Wreck Wraith bounty: M13-gated (available), plays to slay -> wreck_wraith_slain + Tideglass Blade reward');
}

// 7) persists through save -> reload ----------------------------------------
main.karma.save(); main.engine.save();
const karma2 = new KarmaEngine({ storage: main.karma.storage });
assert.equal(karma2.load(), true);
const engine2 = new QuestEngine({ karma: karma2, storage: main.engine.storage, quests: QUESTS });
assert.equal(engine2.loadSave(), true);
['tool_hookshot', 'shard_3', 'vault_betrayal', 'faction_smuggler', 'pem_clue_coast']
  .forEach((d) => assert.equal(karma2.hasDeed(d), true, `deed ${d} persisted`));
assert.equal(engine2.status('M14'), 'complete');
assert.equal(engine2.status('M15'), 'available');
assert.equal(shardCount(karma2), 3);
pass('save -> reload: hookshot + shard_3 (3/5) + betrayal truth + faction + Pem clue restored');

console.log(`\nShards -> ${karma2.deedIds().filter((d) => /^shard_\d+$/.test(d)).join(', ')} (count ${shardCount(karma2)}/5)`);
console.log(`Tools -> ${karma2.deedIds().filter((d) => d.startsWith('tool_')).join(', ')}`);
console.log(`\nALL ${n} CHECKS PASSED ✅`);
