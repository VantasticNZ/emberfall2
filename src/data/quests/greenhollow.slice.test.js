// =============================================================================
// Self-test for the GREENHOLLOW SLICE MAIN ARC — GH1–GH4 (THE-SLICE step 4).
// These four are the PLAYABLE vertical-slice quests; nothing tested them
// end-to-end before. Proves, on the real QuestEngine + Dialogue engine:
//   · GATING — GH1 opens only after the time_skip; GH4 only after GH1–GH3;
//   · the CHAIN — GH1→GH2→GH3→GH4 unlock in order, GH4 gated on all three;
//   · every CHOICE fork applies its karma + deed (exactly once — no farm);
//   · each quest carries its REWARD data;
//   · the REACTIVE routers resolve on the live ctx (the hearth callback, the
//     letter-aware acolyte, fire-responds-to-purity).
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
console.log('Greenhollow slice arc (GH1–GH4) — self test\n');

function fresh() {
  const karma = new KarmaEngine();
  const engine = new QuestEngine({ karma, storage: memoryStorage(), quests: QUESTS });
  return { karma, engine };
}
// Walk a dialogue graph to its end, taking the option that fires any wanted choice
// (else option 0). Returns the list of real nodes visited (route nodes auto-resolve).
function walk(graph, ctx, wantChoices = []) {
  const dlg = new Dialogue(graph, ctx);
  const visited = []; let guard = 0;
  while (!dlg.done && guard++ < 80) {
    if (dlg.nodeId) visited.push(dlg.nodeId);
    const opts = dlg.options();
    let i = opts.findIndex((o) => o.choice && wantChoices.includes(o.choice.id));
    if (i < 0) i = 0;
    dlg.select(i);
  }
  return visited;
}
// Full quest beat: start → play the dialogue (firing the chosen fork via the engine) →
// advance the objective steps → complete (which fires the unlocks). Returns visited nodes.
function play(engine, ctx, qid, wantChoices = []) {
  assert.equal(engine.start(qid), true, `start ${qid}`);
  const visited = walk(engine.defs[qid].dialogue, ctx, wantChoices);
  const steps = (engine.defs[qid].steps || []).length;
  for (let k = 0; k < steps; k++) engine.advance(qid);
  assert.equal(engine.complete(qid), true, `complete ${qid}`);
  return visited;
}

// ---- (1) GATING — GH1 is adult-gated (time_skip); the rest start locked --------------------------
{
  const { karma, engine } = fresh();
  engine.refresh();
  assert.equal(engine.isAvailable('GH1'), false, 'GH1 locked before the time-skip');
  assert.equal(engine.status('GH2'), 'locked', 'GH2 locked at start');
  assert.equal(engine.status('GH3'), 'locked', 'GH3 locked at start');
  assert.equal(engine.status('GH4'), 'locked', 'GH4 locked at start');
  karma.recordDeed('time_skip'); engine.refresh();
  assert.equal(engine.isAvailable('GH1'), true, 'GH1 opens after the childhood time-skip');
  assert.equal(engine.isAvailable('GH4'), false, 'GH4 still gated (needs GH1–GH3) right after the skip');
  pass('GATING: GH1 opens only after time_skip; GH2–GH4 start locked; GH4 gated on the chain');
}

// ---- (2) THE CHAIN — GH1→GH2→GH3→GH4 unlock in order, each playable to completion ----------------
{
  const { karma, engine } = fresh();
  const ctx = { karma, engine };
  karma.recordDeed('time_skip'); engine.refresh();

  play(engine, ctx, 'GH1', ['share']);
  assert.equal(engine.status('GH1'), 'complete', 'GH1 completes');
  assert.equal(engine.isAvailable('GH2'), true, 'completing GH1 unlocks GH2');
  assert.equal(engine.isAvailable('GH3'), false, 'GH3 still locked after only GH1');

  play(engine, ctx, 'GH2', ['gentle', 'comfort', 'healed']);
  assert.equal(engine.status('GH2'), 'complete', 'GH2 completes');
  assert.equal(engine.isAvailable('GH3'), true, 'completing GH2 unlocks GH3');
  assert.equal(engine.isAvailable('GH4'), false, 'GH4 still gated after only GH1+GH2');

  play(engine, ctx, 'GH3', ['mercy', 'letter_keep']);
  // GH3's fight is now LIVE (the dialogue ends at the den-entry; the mercy/cull fork re-opens AFTER the fight —
  // see verify:runtime T16). Fire the post-fight fork at the engine level so the data test still exercises its deeds.
  engine.choose('GH3', 'mercy'); engine.choose('GH3', 'letter_keep');
  assert.equal(engine.status('GH3'), 'complete', 'GH3 completes');
  assert.equal(engine.isAvailable('GH4'), true, 'GH4 opens once GH1–GH3 are all complete');

  play(engine, ctx, 'GH4', ['tell']);
  assert.equal(engine.status('GH4'), 'complete', 'GH4 completes — the slice arc plays end-to-end');
  pass('CHAIN: GH1→GH2→GH3→GH4 unlock in order and each plays start→fork→completion');

  // deeds recorded by the chosen forks
  for (const d of ['hearth_shared', 'comforted_child', 'maren_healed', 'mercy_shown', 'orchard_letter', 'cave_lore', 'shrine_told']) {
    assert.equal(karma.hasDeed(d), true, `deed ${d} recorded by its fork`);
  }
  pass('DEEDS: every chosen fork recorded its canonical deed (hearth_shared · comforted_child · maren_healed · mercy_shown · orchard_letter · cave_lore · shrine_told)');
}

// ---- (3) CHOICE karma is applied EXACTLY ONCE (no farm) -------------------------------------------
{
  const { karma, engine } = fresh();
  karma.recordDeed('time_skip'); engine.refresh();
  engine.start('GH1');
  engine.choose('GH1', 'share');
  const m1 = karma.get('morality'), p1 = karma.get('purity');
  assert.equal(m1, 10, 'GH1 share applies +10 morality'); assert.equal(p1, 10, 'GH1 share applies +10 purity');
  engine.choose('GH1', 'share');   // re-choose (e.g. re-opening the finished quest) must not re-award
  assert.equal(karma.get('morality'), m1, 'GH1 share karma not re-applied on re-choose (no farm)');
  assert.equal(karma.get('purity'), p1, 'GH1 share purity not re-applied on re-choose');
  pass('NO-FARM: a quest fork applies its karma+deed exactly once (re-choosing does nothing)');
}

// ---- (4) REWARD data present on every slice quest -------------------------------------------------
{
  const { engine } = fresh();
  assert.equal(engine.defs.GH1.reward.gold, 8, 'GH1 reward 8g');
  assert.equal(engine.defs.GH2.reward.gold, 6, 'GH2 reward 6g'); assert.equal(engine.defs.GH2.reward.item, 'minor_potion', 'GH2 reward potion');
  assert.equal(engine.defs.GH3.reward.gold, 12, 'GH3 reward 12g');
  assert.equal(engine.defs.GH4.reward.item, 'wooden_toy', 'GH4 reward keepsake');
  pass('REWARDS: GH1 8g · GH2 6g+minor_potion · GH3 12g · GH4 keepsake — all present as data');
}

// ---- (5) REACTIVE routers resolve on the live ctx ------------------------------------------------
{
  const GH2 = QUESTS.find((q) => q.id === 'GH2').dialogue;
  const GH4 = QUESTS.find((q) => q.id === 'GH4').dialogue;
  const mk = (deeds = [], purity = 0) => { const k = new KarmaEngine(); deeds.forEach((d) => k.recordDeed(d)); if (purity) k.adjust('purity', purity); return { karma: k, engine: { choose() {} } }; };

  // GH2 hearth callback: shared → warm, hoarded → cool, neither → straight to the door
  assert.ok(walk(GH2, mk(['hearth_shared'])).includes('greet_warm'), 'GH2 greets WARM if you shared the hearth');
  assert.ok(walk(GH2, mk(['hearth_hoarded'])).includes('greet_cool'), 'GH2 greets COOL if you hoarded it');
  const neutralGH2 = walk(GH2, mk([]));
  assert.ok(!neutralGH2.includes('greet_warm') && !neutralGH2.includes('greet_cool'), 'GH2 with no hearth deed skips the reactive greeting');
  pass('REACTIVE GH2: the kids remember the GH1 hearth choice (warm / cool / neutral)');

  // GH4 acolyte names the letter only if you took it (GH3 orchard_letter)
  assert.ok(walk(GH4, mk(['orchard_letter'])).includes('earn_letter'), 'GH4 acolyte names the LETTER if you kept it');
  assert.ok(walk(GH4, mk([])).includes('earn_plain'), 'GH4 acolyte uses the plain earned-it line otherwise');
  // GH4 fire-responds-to-purity: pure → glows, corrupt → recoils, middling → cold
  assert.ok(walk(GH4, mk([], 25)).includes('shrine_pure'), 'GH4 shrine GLOWS for a pure heart');
  assert.ok(walk(GH4, mk([], -25)).includes('shrine_corrupt'), 'GH4 shrine RECOILS from a corrupt heart');
  assert.ok(walk(GH4, mk([], 0)).includes('shrine_cold'), 'GH4 shrine reads COLD for a middling heart');
  pass('REACTIVE GH4: letter-aware acolyte + fire-responds-to-purity (pure/corrupt/cold)');
}

console.log(`\n${n} checks passed — GH1–GH4 slice arc verified.`);
