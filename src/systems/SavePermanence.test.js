// =============================================================================
// SAVE / PERMANENCE STRESS TEST — a full cross-region playthrough round-trips
// EXACTLY through SaveManager: chunk DELTAS (chests opened, enemies killed, items
// picked, lever flags) across many chunks + the LINKED sub-systems (Karma deeds +
// morality, Inventory gold/items/equipment, QuestEngine state, TimeOfDay). Proves
// nothing respawns/re-grants and every axis persists, idempotently. Plain Node.
// =============================================================================

import assert from 'node:assert/strict';
import { SaveManager } from './SaveManager.js';
import { KarmaEngine } from './Karma.js';
import { Inventory } from './Inventory.js';
import { QuestEngine } from './QuestEngine.js';
import { TimeOfDay } from './TimeOfDay.js';
import { memoryStorage } from './storage.js';
import { GREENHOLLOW_CHILDHOOD } from '../data/quests/greenhollow.js';

let n = 0;
const pass = (m) => { n++; console.log('  ✓ ' + m); };

// build a fully-linked "world" (the same composition the scene uses)
function makeWorld(store) {
  const karma = new KarmaEngine({ storage: store });
  const quests = new QuestEngine({ karma, storage: store, quests: [...GREENHOLLOW_CHILDHOOD] });
  const tod = new TimeOfDay({ storage: store });
  const inv = new Inventory({ storage: store });
  const save = new SaveManager({ storage: store, slot: 'stress' });
  save.link('karma', karma).link('inv', inv).link('quests', quests).link('time', tod);
  return { karma, quests, tod, inv, save };
}

// a realistic cross-region session: deltas in 3 different chunks + every linked axis
function playthrough(w) {
  // GH chunk (~36,36): a chest + an interactable searched + a lever flag + a pickup
  w.save.recordOpened(36, 36, 'gh_secret_chest');
  w.save.recordOpened(36, 36, 'ix_gh_barrel');         // a searched container (same delta family)
  w.save.recordPicked(36, 37, 'orb_meadow');
  w.save.setChunkFlag(36, 36, 'plaza_lever', 1);
  // Marsh chunk (~30,38): the boss killed
  w.save.recordKilled(30, 38, 'marsh_drowned_guardian');
  // Peaks chunk (~40,28): two enemies killed + the quarry chest opened
  w.save.recordKilled(40, 28, 'peaks_charger');
  w.save.recordKilled(40, 28, 'peaks_brute');
  w.save.recordOpened(40, 28, 'peaks_quarry_cache');
  // linked systems
  w.karma.recordDeed('tool_lantern'); w.karma.recordDeed('shard_1'); w.karma.recordDeed('cave_lore');
  w.karma.morality = 37; w.karma.purity = -12;
  w.inv.addGold(123); w.inv.add('minor_potion', 3); w.inv.add('bread', 2); w.inv.add('steel_sword', 1); w.inv.equip('steel_sword');
  w.quests.state.M4 = 'complete'; w.quests.chosen.M4 = 'explore';
  w.tod.t = 5400;
  w.save.setPosition(9994, 8272).setArea('overworld').setTimeFrac(0.42).save();
}

// assert a freshly-loaded world matches the playthrough EXACTLY
function assertRestored(w, label) {
  assert.deepEqual(w.save.getPosition(), { x: 9994, y: 8272 }, `${label}: position`);
  assert.equal(w.save.getTimeFrac(), 0.42, `${label}: timeFrac`);
  // deltas — nothing respawns/re-grants
  assert.equal(w.save.isOpened(36, 36, 'gh_secret_chest'), true, `${label}: chest stays looted`);
  assert.equal(w.save.isOpened(36, 36, 'ix_gh_barrel'), true, `${label}: container stays searched`);
  assert.equal(w.save.isPicked(36, 37, 'orb_meadow'), true, `${label}: item stays picked`);
  assert.equal(w.save.getChunkFlag(36, 36, 'plaza_lever'), 1, `${label}: lever flag`);
  assert.equal(w.save.isKilled(30, 38, 'marsh_drowned_guardian'), true, `${label}: boss stays dead`);
  assert.equal(w.save.isKilled(40, 28, 'peaks_charger'), true, `${label}: peaks enemy A dead`);
  assert.equal(w.save.isKilled(40, 28, 'peaks_brute'), true, `${label}: peaks enemy B dead`);
  assert.equal(w.save.isOpened(40, 28, 'peaks_quarry_cache'), true, `${label}: peaks chest looted`);
  // NEGATIVE — an un-touched id is NOT permanent (no false respawn-block / false loot)
  assert.equal(w.save.isOpened(36, 36, 'never_opened'), false, `${label}: untouched chest not opened`);
  assert.equal(w.save.isKilled(40, 28, 'peaks_ranged'), false, `${label}: untouched enemy not dead`);
  // linked systems
  assert.equal(w.karma.hasDeed('tool_lantern') && w.karma.hasDeed('shard_1') && w.karma.hasDeed('cave_lore'), true, `${label}: deeds/tools`);
  assert.equal(w.karma.morality, 37, `${label}: morality`); assert.equal(w.karma.purity, -12, `${label}: purity`);
  assert.equal(w.inv.gold, 123 + (new Inventory({ storage: memoryStorage() })).gold, `${label}: gold (start+123)`);
  assert.equal(w.inv.has('minor_potion', 3) && w.inv.has('bread', 2), true, `${label}: items`);
  assert.equal(w.inv.equipment.weapon, 'steel_sword', `${label}: equipment`);
  assert.equal(w.quests.state.M4, 'complete', `${label}: quest M4 complete`);
  assert.equal(w.quests.chosen.M4, 'explore', `${label}: quest choice`);
}

// 1) FULL playthrough → save → fresh world → load → everything restored
{
  const store = memoryStorage();
  playthrough(makeWorld(store));
  const w2 = makeWorld(store);
  assert.equal(w2.save.load(), true, 'save loads');
  assertRestored(w2, 'reload');
  pass('cross-region playthrough round-trips: deltas (open/kill/pick/flag) + karma + inv + quests + time');
}

// 2) IDEMPOTENT — save → load → save → load again: no drift, no re-grant
{
  const store = memoryStorage();
  playthrough(makeWorld(store));
  const w2 = makeWorld(store); w2.save.load(); w2.save.save();   // re-save the loaded state
  const w3 = makeWorld(store); w3.save.load();
  assertRestored(w3, 're-save→reload');
  pass('double round-trip is idempotent (no drift, no respawn/re-grant)');
}

// 3) the LIVE re-loot guard: after load, the chest/search guard still sees it opened (can't re-claim)
{
  const store = memoryStorage();
  playthrough(makeWorld(store));
  const w2 = makeWorld(store); w2.save.load();
  // the scene's guard: `if (looted || save.isOpened(cx,cy,id)) return;`
  const canReloot = !w2.save.isOpened(36, 36, 'gh_secret_chest');
  assert.equal(canReloot, false, 'a looted chest cannot be re-claimed after reload');
  // a different region's enemy stays dead → not respawned on region re-entry
  assert.equal(w2.save.isKilled(40, 28, 'peaks_charger'), true, 'killed enemy not respawned');
  pass('post-load guards hold: no chest re-loot, no enemy respawn');
}

console.log(`SavePermanence.test: ${n} checks passed`);
