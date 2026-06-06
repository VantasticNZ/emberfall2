// =============================================================================
// Self-test for the QuestEngine (Bible Part 0 #4). Plain Node + node:assert.
// Uses THROWAWAY fake quests (not real content) to prove the engine:
//   prereq gating · choice -> deed+karma · unlock B + lock C on complete ·
//   long-range deed gate (reactivity) · dialogue plumbing · save -> reload ·
//   and that docs/QUEST-DATA.json is representable (normalizer).
// =============================================================================

import assert from 'node:assert/strict';
import { KarmaEngine } from './Karma.js';
import { QuestEngine } from './QuestEngine.js';
import { Dialogue } from './Dialogue.js';
import { memoryStorage } from './storage.js';
import { fromDesign, parseDesignKarma, KARMA_UNIT } from '../data/quests/index.js';

let n = 0;
const pass = (m) => { n++; console.log('  ✓ ' + m); };
console.log('QuestEngine — self test\n');

// throwaway fake quests (NOT content)
const QUESTS = () => [
  { id: 'QA', title: 'Decision', region: 'Test', act: 1, type: 'main',
    unlocks: ['QB'], locks: ['QC'],
    choices: [
      { id: 'kind',  label: 'Be kind',  impact: 'good', karma: { morality: 20 }, deed: 'qa_kind' },
      { id: 'cruel', label: 'Be cruel', impact: 'dark', karma: { morality: -20 }, deed: 'qa_cruel' },
    ] },
  { id: 'QB', title: 'Unlocked by A', region: 'Test', act: 1, type: 'side' },
  { id: 'QC', title: 'Locked by A',   region: 'Test', act: 1, type: 'side' },
  { id: 'QD', title: 'Needs deed qa_kind', region: 'Test', act: 1, type: 'side',
    requires: { deeds: ['qa_kind'] } },
  { id: 'QE', title: 'Needs morality>=10', region: 'Test', act: 1, type: 'side',
    requires: { karma: { morality: { min: 10 } } } },
];

const kStore = memoryStorage(), qStore = memoryStorage();
const karma = new KarmaEngine({ storage: kStore });
const eng = new QuestEngine({ karma, storage: qStore, quests: QUESTS() });

// 1) initial gating --------------------------------------------------------
assert.equal(eng.status('QA'), 'available');   // root
assert.equal(eng.status('QB'), 'locked');      // gated on QA's unlock
assert.equal(eng.status('QC'), 'available');   // root (gets locked-out later)
assert.equal(eng.status('QD'), 'locked');      // gated on a past deed
assert.equal(eng.status('QE'), 'locked');      // gated on karma range
pass('prereq gating: QB(unlock) / QD(deed) / QE(karma) locked; roots available');

// 2) choice -> deed + karma, with reactive availability --------------------
assert.equal(eng.start('QA'), true);
assert.equal(eng.status('QA'), 'active');
const c = eng.choose('QA', 'kind');
assert.equal(c.label, 'Be kind');
assert.equal(karma.get('morality'), 20);       // karma shifted via Karma.commit
assert.equal(karma.hasDeed('qa_kind'), true);  // deed recorded
assert.equal(eng.status('QD'), 'available');   // deed gate now met (reactivity)
assert.equal(eng.status('QE'), 'available');   // karma gate now met (reactivity)
pass('choice applies karma + deed; QD/QE auto-become available (long-range reactivity)');

// 2b) EXACTLY-ONCE: re-choosing the same choice awards NOTHING (no farming) -----
const mBefore = karma.get('morality');                 // 20
const deedNBefore = karma.getDeed('qa_kind').n;        // 1
const c2 = eng.choose('QA', 'kind');                   // re-trigger the SAME choice
assert.equal(c2.label, 'Be kind');                     // still returns the choice...
assert.equal(karma.get('morality'), mBefore);          // ...but NO extra karma
assert.equal(karma.getDeed('qa_kind').n, deedNBefore); // and the deed is NOT re-recorded
eng.choose('QA', 'kind'); eng.choose('QA', 'kind');    // hammer it
assert.equal(karma.get('morality'), mBefore);          // still unchanged
pass('exactly-once guard: re-choosing a quest choice never re-awards karma or re-records the deed');

// 3) complete A -> unlock B, lock C ----------------------------------------
assert.equal(eng.complete('QA'), true);
assert.equal(eng.status('QA'), 'complete');
assert.equal(eng.status('QB'), 'available');   // unlocked
assert.equal(eng.status('QC'), 'locked-out');  // pruned
pass('completing QA unlocks QB and locks-out QC');

// 4) persist -> reload into fresh instances --------------------------------
karma.save(); eng.save();
const karma2 = new KarmaEngine({ storage: kStore });
assert.equal(karma2.load(), true);             // load karma FIRST (engine reads it)
const eng2 = new QuestEngine({ karma: karma2, storage: qStore, quests: QUESTS() });
assert.equal(eng2.loadSave(), true);
assert.equal(eng2.status('QA'), 'complete');
assert.equal(eng2.status('QB'), 'available');
assert.equal(eng2.status('QC'), 'locked-out');
assert.equal(eng2.status('QD'), 'available');  // deed-gated, deed survived the reload
assert.equal(eng2.chosenOn('QA'), 'kind');
assert.equal(karma2.get('morality'), 20);
eng2.choose('QA', 'kind');                      // re-farm attempt AFTER reload
assert.equal(karma2.get('morality'), 20);       // the exactly-once guard persisted -> no extra karma
pass('save -> reload (new instances): quest states + chosen + karma/deeds restored; the exactly-once guard survives reload');

// 5) dialogue plumbing (data-driven; threads karma + a quest choice) -------
const k3 = new KarmaEngine({ storage: memoryStorage() });
const e3 = new QuestEngine({ karma: k3, storage: memoryStorage(), quests: QUESTS() });
const graph = { start: 'n1', nodes: {
  n1: { speaker: 'Mara', text: 'Well?', options: [
    { label: '(snoop her drawer)', deed: 'snooped', to: 'n2' },
    { label: '(leave)', end: true } ] },
  n2: { speaker: 'Mara', text: 'You went through my things!', options: [
    { label: 'Be kind about it', choice: { quest: 'QA', id: 'kind' }, end: true } ] },
} };
const dlg = new Dialogue(graph, { karma: k3, engine: e3 });
assert.equal(dlg.node().speaker, 'Mara');
dlg.select(0);                                  // records 'snooped' deed, branch to n2
assert.equal(k3.hasDeed('snooped'), true);
assert.equal(dlg.node().text, 'You went through my things!');
dlg.select(0);                                  // applies QA 'kind' choice + ends
assert.equal(k3.hasDeed('qa_kind'), true);
assert.equal(k3.get('morality'), 20);
assert.equal(dlg.done, true);
pass('dialogue: option records a deed, branches, applies a quest choice, ends');

// 6) docs/QUEST-DATA.json is representable (normalizer) ---------------------
const design = { id: 'M2', title: 'Chores + Mischief', region: 'Greenhollow', act: 1, type: 'main',
  choices: [ { label: 'Kick the chicken', impact: 'dark', karma: '-M deed:chicken_kicked',
    unlocks: ['M3'], locks: ['SG7ally'], ending: 'T-lean', story: 'The owner never forgets.' } ] };
const norm = fromDesign(design);
assert.equal(norm.choices[0].karma.morality, -KARMA_UNIT);
assert.equal(norm.choices[0].deed, 'chicken_kicked');
assert.deepEqual(norm.choices[0].unlocks, ['M3']);
assert.deepEqual(norm.choices[0].locks, ['SG7ally']);
assert.equal(norm.choices[0].ending, 'T-lean');
assert.deepEqual(parseDesignKarma('+M+P').karma, { morality: KARMA_UNIT, purity: KARMA_UNIT });
pass('normalizer: a docs/QUEST-DATA.json quest maps cleanly into the engine schema');

console.log(`\nQA -> ${eng2.status('QA')}, QB -> ${eng2.status('QB')}, QC -> ${eng2.status('QC')}, QD -> ${eng2.status('QD')}`);
console.log(`Karma after reload -> ${JSON.stringify(karma2.getStatus())}`);
console.log(`\nALL ${n} CHECKS PASSED ✅`);
