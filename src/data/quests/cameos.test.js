// =============================================================================
// Self-test for the CAMEO / EASTER-EGG / EDGE-TONE encounters (CAM1-7, EDG1-2,
// GAG1). Proves each loads with real dialogue in its region; CAM6 is a clearly-
// FICTIONAL prophet pastiche (no real-figure claim) + grants its buff; CAM7
// gives the pie heal item; EDG1 branches distinct; EDG2 is the wholesome +M
// counterpoint; the CAM5 rare-spawn flag works; comic ones shift no karma; and
// it all persists save -> reload. Plain Node + node:assert.
// =============================================================================

import assert from 'node:assert/strict';
import { KarmaEngine } from '../../systems/Karma.js';
import { QuestEngine } from '../../systems/QuestEngine.js';
import { Dialogue } from '../../systems/Dialogue.js';
import { memoryStorage } from '../../systems/storage.js';
import { QUESTS } from './index.js';

let n = 0;
const pass = (m) => { n++; console.log('  ✓ ' + m); };
console.log('Cameo / easter-egg / edge-tone encounters — self test\n');

function play(engine, karma, qid, choiceId) {
  assert.equal(engine.start(qid), true, `start ${qid}`);
  const dlg = new Dialogue(engine.defs[qid].dialogue, { karma, engine });
  let g = 0;
  while (!dlg.done && g++ < 40) {
    const opts = dlg.options();
    let i = opts.findIndex((o) => o.choice && o.choice.id === choiceId);
    if (i < 0) i = 0;
    dlg.select(i);
  }
  assert.equal(engine.chosenOn(qid), choiceId, `chose ${choiceId} on ${qid}`);
  assert.equal(engine.complete(qid), true, `complete ${qid}`);
}
function newCameo() {
  const karma = new KarmaEngine({ storage: memoryStorage() });
  const engine = new QuestEngine({ karma, storage: memoryStorage(), quests: QUESTS });
  const ff = { M2: 'catch', M4: 'explore', M7: 'accept', M8: 'kind', M9: 'clear', M10: 'believe',
    M11: 'lean_workers', M12: 'clear', M13: 'lean_authority', M14: 'clear', M15: 'enter' };
  for (const qid of ['M1','M2','M3','M4','M5','M6','M7','M8','M9','M10','M11','M12','M13','M14','M15']) {
    play(engine, karma, qid, ff[qid] || engine.defs[qid].choices[0]?.id);
  }
  return { karma, engine };
}
const def = (id) => QUESTS.find((q) => q.id === id);
const k0 = (k) => [k.get('morality'), k.get('purity')];

// 0) all load with real dialogue --------------------------------------------
assert.match(def('CAM1').dialogue.nodes.spit.text, /worthless place to spit/);
assert.match(def('CAM2').dialogue.nodes.why.text, /the push/);
assert.match(def('CAM3').dialogue.nodes.rant.text, /HISTORICALLY MISREPRESENTED/);
assert.match(def('CAM4').dialogue.nodes.wonder.text, /made OF them/);
assert.match(def('GAG1').dialogue.nodes.sign.text, /mind the FROG/);
pass('CAM1-7 + EDG1-2 + GAG1 all load with real dialogue');

// 1) regional availability (CAM5 is a rare spawn) ---------------------------
const { karma, engine } = newCameo();
['CAM1','CAM2','CAM3','CAM4','CAM6','CAM7','EDG1','EDG2','GAG1'].forEach((id) => assert.equal(engine.status(id), 'available', `${id} available`));
assert.equal(engine.status('CAM5'), 'locked'); // rare spawn — not yet flagged
pass('cameos slot into their regions; CAM5 stays locked until its rare spawn flag');

// 2) CAM5 rare-spawn flag works ---------------------------------------------
karma.recordDeed('spawn_wanderer');              // the world rolls the rare spawn
assert.equal(engine.status('CAM5'), 'available'); // now it shows up
play(engine, karma, 'CAM5', 'help');
assert.equal(karma.hasDeed('wanderer_met'), true);
assert.deepEqual(def('CAM5').reward.items, ['humming_trinket']);
pass('CAM5 wanderer: gated on a rare spawn flag; once spawned, met + a quirky reward');

// 3) CAM6 is a clearly-FICTIONAL prophet pastiche + grants its buff ----------
{
  const txt = def('CAM6').dialogue.nodes.feast.text + def('CAM6').dialogue.nodes.invite.text;
  assert.match(txt, /Vinizar|Ahhh-men/);                                  // the fictional party-prophet
  [/jesus/i, /christ/i, /muhammad/i, /buddha/i, /moses/i].forEach((re) => assert.ok(!re.test(txt))); // no real founder claimed
  const before = k0(karma);
  play(engine, karma, 'CAM6', 'join');
  assert.equal(karma.hasDeed('prophet_blessed'), true);
  assert.equal(def('CAM6').reward.buff, 'gladness');                       // the blessing buff
  assert.equal(karma.get('morality'), before[0] + 5);
  pass('CAM6 Chill Prophet: clearly-fictional pastiche (no real figure); join -> prophet_blessed + gladness buff');
}

// 4) CAM7 gives the pie heal item -------------------------------------------
play(engine, karma, 'CAM7', 'lesson');
assert.equal(karma.hasDeed('pie_lesson'), true);
assert.equal(def('CAM7').reward.item, 'meat_pie');
assert.equal(def('CAM7').reward.heals, true);
pass('CAM7 Blow on the Pie (NZ easter-egg): records pie_lesson; reward is a meat_pie heal item');

// 5) EDG1 branches distinct (along / nope / chaos) --------------------------
assert.deepEqual(def('EDG1').choices.map((c) => c.deed).sort(), ['raid_chaos', 'raid_declined', 'raid_joined']);
{
  const before = k0(karma);
  play(engine, karma, 'EDG1', 'along');
  assert.equal(karma.hasDeed('raid_joined'), true);
  assert.equal(karma.get('purity'), before[1] - 5);   // a little mischief
  pass('EDG1 The Midnight Raid: along/nope/chaos are distinct deeds (cheeky, never explicit)');
}

// 6) EDG2 the wholesome +M counterpoint, same region as EDG1 ----------------
assert.equal(def('EDG2').region, def('EDG1').region); // tonal opposite, right next door
{
  const before = k0(karma);
  play(engine, karma, 'EDG2', 'gather');
  assert.equal(karma.hasDeed('flowers_gathered'), true);
  assert.equal(karma.get('morality'), before[0] + 10);
  pass('EDG2 Flowers for Someone: the wholesome +M counterpoint to EDG1, same region');
}

// 7) CAM4 a genuine wonder beat (+P); comic ones shift no karma --------------
{
  const a = newCameo();
  const pa = a.karma.get('purity');
  play(a.engine, a.karma, 'CAM4', 'listen');
  assert.equal(a.karma.get('purity'), pa + 5);     // a small wonder/Purity nudge
  // comic: CAM3 + GAG1 shift nothing
  const before = k0(a.karma);
  play(a.engine, a.karma, 'CAM3', 'mock');
  play(a.engine, a.karma, 'GAG1', 'wit');
  assert.deepEqual(k0(a.karma), before);
  pass('CAM4 Stardust nudges Purity (wonder); CAM3/GAG1 (comic) shift no karma');
}

// 8) persists through save -> reload -----------------------------------------
karma.save(); engine.save();
const karma2 = new KarmaEngine({ storage: karma.storage });
assert.equal(karma2.load(), true);
const engine2 = new QuestEngine({ karma: karma2, storage: engine.storage, quests: QUESTS });
assert.equal(engine2.loadSave(), true);
['wanderer_met', 'prophet_blessed', 'pie_lesson', 'raid_joined', 'flowers_gathered']
  .forEach((d) => assert.equal(karma2.hasDeed(d), true, `deed ${d} persisted`));
assert.equal(engine2.status('CAM6'), 'complete');
pass('save -> reload: cameo/easter-egg/edge deeds + completion restored');

console.log(`\nCameo deeds -> ${karma2.deedIds().filter((d) => /cynic|stone_p|general|stardust|wanderer|prophet|pie_|raid_|flowers|roadside/.test(d)).join(', ')}`);
console.log(`\nALL ${n} CHECKS PASSED ✅`);
