// =============================================================================
// Self-test for THE SPIRE ENDGAME (M17-M20 + the five endings) as DATA on the
// engines. The finale — where the whole game pays off. Proves the chain, M17
// reading the prior decisions (Sela's betrayal; OPPOSE gated on Hagga), the
// 4-tool ascent gate + the kicked-chicken cameo, the Shard #5 boss, M20 offering
// exactly Karma.reachableEndings() for Warden/Tyrant/Liberator/secret-Ashbearer
// states, and the ET1-ET12 epilogue twists. Plain Node + node:assert.
// =============================================================================

import assert from 'node:assert/strict';
import { KarmaEngine } from '../../systems/Karma.js';
import { QuestEngine } from '../../systems/QuestEngine.js';
import { Dialogue } from '../../systems/Dialogue.js';
import { memoryStorage } from '../../systems/storage.js';
import { QUESTS, offeredEndings, epilogueCards } from './index.js';

let n = 0;
const pass = (m) => { n++; console.log('  ✓ ' + m); };
console.log('The Spire endgame (M17-M20 + the five endings) — self test\n');

function play(engine, karma, qid, choiceId) {
  assert.equal(engine.start(qid), true, `start ${qid}`);
  const dlg = new Dialogue(engine.defs[qid].dialogue, { karma, engine });
  let g = 0;
  while (!dlg.done && g++ < 50) {
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
  while (!dlg.done && g++ < 50) {
    if (dlg.options().some((o) => o.choice)) break;
    dlg.select(0); if (dlg.nodeId) seen.push(dlg.nodeId);
  }
  return { seen, options: dlg.options().map((o) => o.choice?.id).filter(Boolean) };
}
// Fast-forward M1-M16 (all four tools earned) then play M17.
function newSpire({ m2 = 'catch', m10 = 'believe', m16 = 'mercy', m17 = 'trust' } = {}) {
  const karma = new KarmaEngine({ storage: memoryStorage() });
  const engine = new QuestEngine({ karma, storage: memoryStorage(), quests: QUESTS });
  const ff = { M2: m2, M4: 'explore', M7: 'accept', M8: 'kind', M9: 'clear', M10: m10,
    M11: 'lean_workers', M12: 'clear', M13: 'lean_authority', M14: 'clear', M15: 'enter', M16: m16, M17: m17 };
  for (const qid of ['M1','M2','M3','M4','M5','M6','M7','M8','M9','M10','M11','M12','M13','M14','M15','M16','M17']) {
    play(engine, karma, qid, ff[qid] || engine.defs[qid].choices[0]?.id);
  }
  return { karma, engine };
}
const shardCount = (k) => k.deedIds().filter((d) => /^shard_\d+$/.test(d)).length;
const M20 = QUESTS.find((q) => q.id === 'M20');
const keysOf = (ids) => ids.map((id) => M20.choices.find((c) => c.id === id).endingKey);

// 0) content sanity ---------------------------------------------------------
const probe = new QuestEngine({ karma: new KarmaEngine({ storage: memoryStorage() }), storage: memoryStorage(), quests: QUESTS });
assert.match(probe.defs.M17.dialogue.nodes.betray.text, /useful little tool/);
assert.match(probe.defs.M18.dialogue.nodes.chicken_cameo.text, /BOOTED this chicken's mother/);
assert.match(probe.defs.M19.dialogue.nodes.boss.text, /WARDEN OF THE BINDING/);
pass('finale dialogue present (Sela\'s mask, the chicken at the Spire, the boss)');

// 1) M16 -> M17 -> M18 -> M19 -> M20 chain + Shard #5 -----------------------
const main = newSpire();                 // believe + mercy + trust
assert.equal(main.engine.status('M17'), 'complete');
assert.equal(main.engine.status('M18'), 'available'); // 4 tools earned
play(main.engine, main.karma, 'M18', 'ascent_mercy');
play(main.engine, main.karma, 'M19', 'defeat');
assert.equal(main.karma.hasDeed('shard_5'), true);
assert.equal(shardCount(main.karma), 5);              // 5/5
assert.equal(main.engine.status('M20'), 'available'); // M19 -> M20
pass('M16 -> M17 -> M18 -> M19 -> M20; M19 grants shard_5 (5/5)');

// 2) M17 reads the prior decisions ------------------------------------------
const reported = newSpire({ m10: 'report', m17: 'trust' });
// rebuild a pre-M17 read by inspecting M17 dialogue under that karma
{
  const r = visit(reported.engine, reported.karma, 'M17'); // (M17 already complete; re-walk for the read)
  assert.ok(r.seen.includes('betray'));            // reported Hagga -> Sela betrays hardest
  assert.ok(r.seen.includes('choose_limited'));    // no Hagga -> OPPOSE not offered
  assert.ok(!r.options.includes('oppose'));
}
{
  const believed = newSpire({ m10: 'believe' });
  const r = visit(believed.engine, believed.karma, 'M17');
  assert.ok(r.seen.includes('aligned'));           // believed + pure -> Sela is honest
  assert.ok(r.seen.includes('hagga_warns') && r.options.includes('oppose')); // Hagga allied -> OPPOSE offered
  pass('M17 reads the game: report -> betrayal + no OPPOSE; believe -> aligned + Hagga + OPPOSE');
}

// 3) M18 gated on all FOUR tools --------------------------------------------
assert.deepEqual(main.engine.defs.M18.requires.deeds, ['tool_lantern', 'tool_grapple', 'tool_hookshot', 'tool_firefrost']);
{
  const three = new KarmaEngine({ storage: memoryStorage() });
  ['tool_lantern', 'tool_grapple', 'tool_hookshot'].forEach((d) => three.recordDeed(d)); // missing firefrost
  const e = new QuestEngine({ karma: three, storage: memoryStorage(), quests: QUESTS });
  assert.equal(e._requiresMet(e.defs.M18.requires), false); // not all four -> gate closed
  three.recordDeed('tool_firefrost');
  assert.equal(e._requiresMet(e.defs.M18.requires), true);  // four -> gate open
  pass('M18 ascent is gated on all four tools (lantern/grapple/hookshot/firefrost)');
}

// 4) the kicked chicken returns at the Spire (and only if kicked) ------------
assert.ok(visit(newSpire({ m2: 'kick' }).engine, newSpire({ m2: 'kick' }).karma, 'M18').seen.includes('chicken_cameo'));
{
  const kicked = newSpire({ m2: 'kick' });
  const clean = newSpire({ m2: 'catch' });
  assert.ok(visit(kicked.engine, kicked.karma, 'M18').seen.includes('chicken_cameo'));   // fires
  assert.ok(!visit(clean.engine, clean.karma, 'M18').seen.includes('chicken_cameo'));    // does not
  pass('the kicked chicken cameo fires at the Spire iff chicken_kicked (the 30-hours-later callback)');
}

// 5) M20 offers EXACTLY reachableEndings() for each state -------------------
function endingState(setup) { const k = new KarmaEngine({ storage: memoryStorage() }); setup(k); return k; }
const warden = endingState(() => {});                                   // default
const tyrant = endingState((k) => { k.set('morality', -40); k.set('purity', -40); });
const liberator = endingState((k) => { k.set('purity', 40);
  ['mercy_shown', 'hagga_believed', 'sela_opposed'].forEach((d) => k.recordDeed(d)); });
const ashbearer = endingState((k) => { ['cave_lore', 'pem_found', 'mercy_shown'].forEach((d) => k.recordDeed(d)); });

for (const [name, k, expect] of [
  ['Warden(default)', warden, ['W']],
  ['Tyrant', tyrant, ['W', 'T']],
  ['Liberator', liberator, ['W', 'L']],
  ['Ashbearer(secret)', ashbearer, ['W', 'A']],
]) {
  const offered = offeredEndings(k);
  assert.deepEqual(keysOf(offered).sort(), expect.sort(), `offered for ${name}`);
  assert.deepEqual(keysOf(offered).sort(), k.reachableEndingIds().sort(), `offered == reachable for ${name}`);
}
assert.equal(M20.choices.find((c) => c.endingKey === 'A').note.length > 0, true); // Ashbearer is a real (secret) option
pass('M20 offers exactly reachableEndings(): Warden / Tyrant / Liberator / secret Ashbearer');

// 6) the epilogue twists fire for their deeds -------------------------------
{
  const k = new KarmaEngine({ storage: memoryStorage() });
  ['chicken_kicked', 'mara_exposed', 'saved_burning', 'grief_vow'].forEach((d) => k.recordDeed(d));
  const ids = epilogueCards(k, 'W').map((c) => c.id);
  ['ET1', 'ET3', 'ET4', 'ET2'].forEach((et) => assert.ok(ids.includes(et), `${et} fired`));
  assert.ok(!ids.includes('ET12')); // darkest card needs Tyrant + very cruel
  // ending-conditioned twists
  const lib = new KarmaEngine({ storage: memoryStorage() }); lib.recordDeed('weeping_tree');
  assert.ok(epilogueCards(lib, 'L').some((c) => c.id === 'ET11'));   // transcendent only on Liberator
  assert.ok(!epilogueCards(lib, 'W').some((c) => c.id === 'ET11'));
  pass('epilogue twists fire by deed: chicken/mara/settlement/grief + the L-only transcendent card');
}

// 7) M20 records the chosen ending; persists save -> reload -----------------
play(main.engine, main.karma, 'M20', 'warden');
assert.equal(main.karma.hasDeed('ending_warden'), true);
assert.equal(main.engine.status('M20'), 'complete');
main.karma.save(); main.engine.save();
const karma2 = new KarmaEngine({ storage: main.karma.storage });
assert.equal(karma2.load(), true);
const engine2 = new QuestEngine({ karma: karma2, storage: main.engine.storage, quests: QUESTS });
assert.equal(engine2.loadSave(), true);
assert.equal(engine2.status('M20'), 'complete');
assert.equal(karma2.hasDeed('shard_5'), true);
assert.equal(karma2.hasDeed('ending_warden'), true);
assert.equal(shardCount(karma2), 5);
pass('M20 records the chosen ending; full M1-M20 run persists through save -> reload');

console.log(`\nShards -> ${shardCount(karma2)}/5; ending -> ${karma2.deedIds().find((d) => d.startsWith('ending_'))}`);
console.log(`Reachable on the main run -> ${main.karma.reachableEndingIds().join(', ')}`);
console.log(`\nALL ${n} CHECKS PASSED ✅`);
