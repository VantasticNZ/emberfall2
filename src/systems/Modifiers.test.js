// =============================================================================
// Self-test for the ModifierRegistry — toggles, effect lookups, and the WALLED-OFF
// adult mode (off by default, master-switchable, 18+-gated, and the HARD constraint
// that adult effects can NEVER touch a minor/child). Plain Node + assert.
// =============================================================================

import assert from 'node:assert/strict';
import { ModifierRegistry } from './Modifiers.js';

let n = 0;
const pass = (m) => { n++; console.log('  ✓ ' + m); };
console.log('ModifierRegistry — self test\n');

// 1) dev defaults: easy modifiers ON for testing; adult NEVER on -----------------
{
  const m = new ModifierRegistry(undefined, { dev: true });
  assert.equal(m.isOn('big_head'), true);          // devDefault on
  assert.equal(m.isOn('loot_rich'), true);
  assert.equal(m.isOn('blood_gore'), true);
  assert.equal(m.isOn('adult_mode'), false);       // age-gated -> off even in dev
  assert.equal(m.lootMult(), 2);
  assert.equal(m.headScale(), 1.8);
  assert.equal(m.gore(), true);
  pass('dev mode turns the easy modifiers ON (loot/big-head/gore); adult mode stays OFF');
}

// 2) toggle + effect lookups react ----------------------------------------------
{
  const m = new ModifierRegistry();
  assert.equal(m.isOn('big_head'), false);
  assert.equal(m.headScale(), 1);
  m.toggle('big_head');
  assert.equal(m.isOn('big_head'), true);
  assert.equal(m.headScale(), 1.8);
  m.set('loot_rich', true);
  assert.equal(m.lootMult(), 2);
  pass('toggling a modifier flips its effect (big-head head-scale, loot multiplier)');
}

// 3) ADULT mode is gated: off by default, needs 18+ confirm + master switch ------
{
  const m = new ModifierRegistry();
  assert.equal(m.isOn('adult_mode'), false);                 // off by default
  assert.equal(m.set('adult_mode', true), false);            // refused: not confirmed
  assert.equal(m.isOn('adult_mode'), false);
  m.confirmAdult(true);
  assert.equal(m.set('adult_mode', true), true);             // now allowed
  assert.equal(m.isOn('adult_mode'), true);
  // master switch OFF removes the whole feature (clean ship)
  m.setAdultMaster(false);
  assert.equal(m.isOn('adult_mode'), false);
  assert.equal(m.set('adult_mode', true), false);            // can't turn it on while master is off
  pass('ADULT mode: off by default; requires 18+ confirm; master switch disables the whole feature');
}

// 4) THE HARD CONSTRAINT — adult effects NEVER touch a minor/child ---------------
{
  const m = new ModifierRegistry();
  m.confirmAdult(true); m.set('adult_mode', true);
  assert.equal(m.isOn('adult_mode'), true);
  const child = { isAdult: false, isMinor: true };           // the childhood protagonist
  const adult = { isAdult: true, isMinor: false };
  assert.equal(m.adultAllowedFor(child), false);             // NEVER for a minor
  assert.equal(m.adultAllowedFor({ isMinor: true }), false);
  assert.equal(m.adultAllowedFor(null), false);
  assert.equal(m.adultAllowedFor(adult), true);              // only a confirmed adult
  // and never when master is off, regardless of entity
  m.setAdultMaster(false);
  assert.equal(m.adultAllowedFor(adult), false);
  pass('HARD CONSTRAINT: adult effects apply ONLY to a confirmed adult entity, NEVER to a minor/child');
}

console.log(`\nALL ${n} CHECKS PASSED ✅`);
