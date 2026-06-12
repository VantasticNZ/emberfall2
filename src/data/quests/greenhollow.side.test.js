// =============================================================================
// Self-test for the GREENHOLLOW HUB side quests (SG1-SG7) + childhood callbacks.
// Proves the marker-onboarding unlock, the cross-region Pem hunt gating, the
// Mara letter reaction (closing the SA5 drowned_letter link), the Orchard Thief
// lock honoring chicken_kicked, and that the village's reactive callback lines
// fire for the right Act-1 deeds. Plain Node + node:assert.
// =============================================================================

import assert from 'node:assert/strict';
import { KarmaEngine } from '../../systems/Karma.js';
import { QuestEngine } from '../../systems/QuestEngine.js';
import { Dialogue } from '../../systems/Dialogue.js';
import { memoryStorage } from '../../systems/storage.js';
import { QUESTS } from './index.js';

let n = 0;
const pass = (m) => { n++; console.log('  ✓ ' + m); };
console.log('Greenhollow hub (SG1-SG7 + childhood callbacks) — self test\n');

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

// Capture which dialogue nodes a reactive quest visits under a given karma.
function visit(engine, karma, qid) {
  const dlg = new Dialogue(engine.defs[qid].dialogue, { karma, engine });
  const seen = [dlg.nodeId];
  let guard = 0;
  while (!dlg.done && guard++ < 40) {
    if (dlg.options().some((o) => o.choice)) { break; } // stop at a decision
    dlg.select(0);
    if (dlg.nodeId) seen.push(dlg.nodeId);
  }
  return seen;
}

// A fresh adult-return game: M1-M7 with `accept` (opens SG1-3), kicking the
// chicken or not, plus any extra deeds to simulate.
function newHub({ kick = false, grief = 'vengeance', extra = [] } = {}) {
  const karma = new KarmaEngine({ storage: memoryStorage() });
  const engine = new QuestEngine({ karma, storage: memoryStorage(), quests: QUESTS });
  const ff = { M2: kick ? 'kick' : 'catch', M6: grief, M7: 'accept' };
  for (const qid of ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7']) {
    play(engine, karma, qid, ff[qid] || engine.defs[qid].choices[0]?.id);
  }
  extra.forEach((d) => karma.recordDeed(d.id || d, d.meta));
  return { karma, engine };
}

// 0) content sanity ---------------------------------------------------------
const probe = new QuestEngine({ karma: new KarmaEngine({ storage: memoryStorage() }), storage: memoryStorage(), quests: QUESTS });
assert.match(probe.defs.SG1.dialogue.nodes.fatley.text, /can't be arsed/);
assert.match(probe.defs.SG5.dialogue.nodes.tavern.text, /Wayne Kerr|songs/);
pass('real hub dialogue present (Fatley, the Tankard songs)');

// 1) SG1 Fatley — the Gate-D exception unlocks see-markers; HOOK-PACED behind GH1 (item 7b) -----
{
  const { karma, engine } = newHub();
  assert.equal(engine.status('SG1'), 'locked');    // unlocked by M7 but GATED behind GH1 — Fatley's hook does NOT pile on at return
  play(engine, karma, 'GH1', 'job');               // finish the first slice quest
  assert.equal(engine.status('SG1'), 'available'); // NOW Fatley's hook opens (one task at a time)
  assert.equal(karma.hasDeed('skill_see_markers'), false);
  play(engine, karma, 'SG1', 'fetch');
  assert.equal(karma.hasDeed('skill_see_markers'), true);
  pass('SG1 Fatley: hook-paced behind GH1 (locked at return → available once GH1 done) → completing unlocks skill_see_markers');
}

// 2) SG2 Pem hunt — gated until clues from EVERY region, then pem_found ------
{
  const { karma, engine } = newHub({ extra: ['pem_clue_marsh'] });
  assert.equal(engine.status('SG2'), 'locked'); // only the marsh clue so far
  karma.recordDeed('pem_clue_peaks');
  karma.recordDeed('pem_clue_coast');
  assert.equal(engine.status('SG2'), 'locked'); // still missing emberwood
  karma.recordDeed('pem_clue_emberwood');
  assert.equal(engine.status('SG2'), 'available'); // all four clues in
  play(engine, karma, 'SG2', 'find_pem');
  assert.equal(karma.hasDeed('pem_found'), true); // closes the hunt (+ secret-ending seed)
  pass('SG2 Pem hunt: locked with only pem_clue_marsh; completes (pem_found) once all region clues are in');
}

// 3) SG4 Mara's Letters — reacts to drowned_letter; expose -> mara_exposed ---
{
  const withLetter = newHub({ extra: [{ id: 'drowned_letter', meta: { npc: 'Mara' } }] });
  const noLetter = newHub();
  assert.ok(visit(withLetter.engine, withLetter.karma, 'SG4').includes('warm'));   // delivered -> warm
  assert.ok(visit(noLetter.engine, noLetter.karma, 'SG4').includes('normal'));     // not -> normal
  // expose path
  play(noLetter.engine, noLetter.karma, 'SG4', 'expose');
  assert.equal(noLetter.karma.hasDeed('mara_exposed'), true);
  assert.ok(noLetter.engine.pruned.has('mara_epilogue')); // Mara absent from the epilogue
  pass('SG4 Mara: greeting reacts to drowned_letter (closes the SA5 link); expose records mara_exposed + locks her epilogue');
}

// 4) SG7 Orchard Thief — locked out if you kicked the chicken ---------------
{
  const kind = newHub({ kick: false });
  const kicker = newHub({ kick: true });
  assert.equal(kind.engine.status('SG7'), 'available');     // kid trusts you
  assert.equal(kicker.engine.status('SG7'), 'locked-out');  // chicken_kicked -> M2 lock prunes SG7
  play(kind.engine, kind.karma, 'SG7', 'cover');
  assert.equal(kind.karma.hasDeed('orchard_covered'), true);
  assert.ok(kind.engine.unlocked.has('ally:kid'));
  pass('SG7 Orchard Thief: locked-out if chicken_kicked; cover -> orchard_covered + ally:kid');
}

// 5) childhood callbacks fire for the right deeds (the seeds pay off) --------
{
  // kicked the chicken + grief_vow (M6 protect); coin_returned comes from the FF (M3 return); add cave_lore
  const seeded = newHub({ kick: true, grief: 'protect' });
  seeded.karma.recordDeed('cave_lore');
  const seededSeen = visit(seeded.engine, seeded.karma, 'GHUB');
  assert.ok(seededSeen.includes('l_chicken'));  // kicked -> henwife cold
  assert.ok(seededSeen.includes('l_coin'));     // returned -> McCracken warm
  assert.ok(seededSeen.includes('l_cave'));     // cave_lore -> the boarded cave pull
  assert.ok(seededSeen.includes('l_grief_p'));  // grief_vow -> honored
  const blankKarma = new KarmaEngine({ storage: memoryStorage() });
  const blank = new QuestEngine({ karma: blankKarma, storage: memoryStorage(), quests: QUESTS });
  const blankSeen = visit(blank, blankKarma, 'GHUB');
  assert.ok(!blankSeen.includes('l_chicken') && !blankSeen.includes('l_coin'));
  pass('childhood callbacks: l_chicken/l_coin/l_cave/l_grief fire only for the matching Act-1 deeds');
}

// 6) persists through save -> reload -----------------------------------------
{
  const { karma, engine } = newHub();
  play(engine, karma, 'GH1', 'job');               // GH1 now gates SG1 (hook pacing) — do it first
  play(engine, karma, 'SG1', 'fetch');
  play(engine, karma, 'SG7', 'cover');
  karma.save(); engine.save();
  const karma2 = new KarmaEngine({ storage: karma.storage });
  assert.equal(karma2.load(), true);
  const engine2 = new QuestEngine({ karma: karma2, storage: engine.storage, quests: QUESTS });
  assert.equal(engine2.loadSave(), true);
  assert.equal(karma2.hasDeed('skill_see_markers'), true);
  assert.equal(karma2.hasDeed('orchard_covered'), true);
  assert.equal(engine2.status('SG1'), 'complete');
  assert.equal(engine2.status('SG7'), 'complete');
  assert.ok(engine2.unlocked.has('ally:kid'));
  pass('save -> reload: hub progress + skill_see_markers + orchard ally all restored');
}

console.log(`\nALL ${n} CHECKS PASSED ✅`);
