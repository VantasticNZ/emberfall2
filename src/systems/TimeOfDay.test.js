// =============================================================================
// Self-test for the DAY/NIGHT cycle (TimeOfDay) + its hooks: phase-change
// callback, the requires-pattern time gate (a night-only quest locked by day /
// open at night, via the QuestEngine time hook), a day-only shopkeeper, and
// save -> reload. Plain Node + node:assert.
// =============================================================================

import assert from 'node:assert/strict';
import { TimeOfDay } from './TimeOfDay.js';
import { QuestEngine } from './QuestEngine.js';
import { KarmaEngine } from './Karma.js';
import { Dialogue } from './Dialogue.js';
import { memoryStorage } from './storage.js';
import { isOpen } from './Economy.js';
import { QUESTS } from '../data/quests/index.js';

let n = 0;
const pass = (m) => { n++; console.log('  ✓ ' + m); };
console.log('Day/Night cycle (TimeOfDay) — self test\n');

function play(engine, karma, qid, choiceId) {
  assert.equal(engine.start(qid), true, `start ${qid}`);
  const dlg = new Dialogue(engine.defs[qid].dialogue, { karma, engine });
  let g = 0; while (!dlg.done && g++ < 40) { const o = dlg.options(); let i = o.findIndex((x) => x.choice && x.choice.id === choiceId); if (i < 0) i = 0; dlg.select(i); }
  engine.complete(qid);
}

// 0) advances + reads the clock + persists -----------------------------------
{
  const store = memoryStorage();
  const t = new TimeOfDay({ storage: store });
  assert.equal(t.phase(), 'day');               // starts mid-morning
  t.setFrac(0.85);                              // -> night
  assert.equal(t.phase(), 'night');
  t.advance(60 * 6);                            // +6h
  t.save();
  const t2 = new TimeOfDay({ storage: store });
  assert.equal(t2.load(), true);
  assert.equal(t2.t, t.t);                      // persisted
  pass('time advances + reads phase (day->night) + persists through save/reload');
}

// 1) phase-change + day-change callbacks fire --------------------------------
{
  const t = new TimeOfDay({ storage: memoryStorage() });
  let fired = null, days = 0;
  t.onPhaseChange((p, prev) => { fired = [prev, p]; });
  t.onDayChange(() => { days++; });
  t.setFrac(0.5);                               // day (no change from start 'day')
  t.setFrac(0.85);                              // -> night
  assert.deepEqual(fired, ['day', 'night']);
  t.advance(1440);                              // +1 full day
  assert.equal(days, 1);
  pass('phase-change callback fires (day->night); day-change callback fires on a new day');
}

// 2) meetsTime — the requires-pattern for time --------------------------------
{
  const t = new TimeOfDay({ storage: memoryStorage() });
  t.setFrac(0.85); // night
  assert.equal(t.meetsTime({ phase: 'night' }), true);
  assert.equal(t.meetsTime({ phase: 'day' }), false);
  assert.equal(t.meetsTime({ phases: ['dusk', 'night'] }), true);
  assert.equal(t.meetsTime({}), true);          // no time requirement -> always ok
  pass('meetsTime gates on { phase } / { phases } (the time requires-pattern)');
}

// 3) a NIGHT-ONLY quest: locked by day, open at night ------------------------
{
  const karma = new KarmaEngine({ storage: memoryStorage() });
  const time = new TimeOfDay({ storage: memoryStorage() });
  time.setFrac(0.5); // day
  const engine = new QuestEngine({ karma, storage: memoryStorage(), quests: QUESTS, time });
  // fast-forward to M8 complete (NIGHT1 also requires the region)
  const ff = { M2: 'catch', M4: 'explore', M7: 'accept', M8: 'kind' };
  for (const qid of ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8']) {
    play(engine, karma, qid, ff[qid] || engine.defs[qid].choices[0]?.id);
  }
  assert.equal(engine.status('NIGHT1'), 'locked');   // daytime -> closed
  time.setFrac(0.85);                                // night falls -> fires phase change -> engine.refresh()
  assert.equal(engine.status('NIGHT1'), 'available'); // night -> open
  time.setFrac(0.5);                                  // dawn breaks -> closed again
  assert.equal(engine.status('NIGHT1'), 'locked');
  pass('night-only encounter (NIGHT1) is locked by day, open at night, reactively');
}

// 4) a day-only shopkeeper (Hodge's forge has hours) -------------------------
{
  const time = new TimeOfDay({ storage: memoryStorage() });
  time.setFrac(0.5); // day
  assert.equal(isOpen('hodge_forge', time), true);
  time.setFrac(0.85); // night
  assert.equal(isOpen('hodge_forge', time), false);
  assert.equal(isOpen('mirefen_trader', time), true); // no hours -> always open
  pass('day-only shopkeeper: Hodge\'s forge is open by day, shut at night (shops without hours stay open)');
}

console.log(`\nALL ${n} CHECKS PASSED ✅`);
