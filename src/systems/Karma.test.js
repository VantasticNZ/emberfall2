// =============================================================================
// Self-test for the Karma + Deed-Memory engine (Bible Part 0 #4: self-testing).
// No test framework needed — plain Node + node:assert. Run: `npm test`.
// Exercises: adjust -> persist -> reload -> query -> ending-gating.
// =============================================================================

import assert from 'node:assert/strict';
import { KarmaEngine, ENDING_DEEDS } from './Karma.js';
import { memoryStorage } from './storage.js';

let n = 0;
const pass = (m) => { n++; console.log('  ✓ ' + m); };

console.log('Karma + Deed-Memory engine — self test\n');

// shared in-memory store (lets us prove save -> reload across instances) + fixed clock
const store = memoryStorage();
const FIXED_T = 1_700_000_000_000;
const A = new KarmaEngine({ storage: store, now: () => FIXED_T });

// 1) defaults --------------------------------------------------------------
assert.equal(A.get('morality'), 0);
assert.equal(A.get('purity'), 0);
assert.equal(A.tier('morality'), 'Neutral');
assert.equal(A.tier('purity'), 'Untested');
assert.deepEqual(A.reachableEndingIds(), ['W']); // only the default at the start
pass('fresh state: 0/0, tiers Neutral/Untested, only Warden reachable');

// 2) adjust + tiers + clamp ------------------------------------------------
A.adjust('purity', 50);
assert.equal(A.get('purity'), 50);
assert.equal(A.tier('purity'), 'Pure');
A.adjust('purity', 999);                 // clamp at +100
assert.equal(A.get('purity'), 100);
assert.equal(A.tier('purity'), 'Radiant');
A.set('purity', 30);                     // back to a Pure value for the Liberator path
A.commit({ morality: 10, deed: 'coin_returned', meta: { region: 'Greenhollow' } });
assert.equal(A.get('morality'), 10);
assert.equal(A.tier('morality'), 'Neutral');
pass('adjust/set/commit + clamp + tier labels work');

// 3) deed-memory + reactivity ----------------------------------------------
let fired = null;
const off = A.onDeed((id) => { fired = id; });
A.recordDeed(ENDING_DEEDS.mercy_shown);
A.recordDeed(ENDING_DEEDS.hagga_believed, { who: 'Hagga' });
A.recordDeed(ENDING_DEEDS.sela_opposed);
assert.equal(fired, ENDING_DEEDS.sela_opposed);
off();
assert.ok(A.hasDeed('coin_returned'));
assert.equal(A.getDeed('coin_returned').t, FIXED_T);     // injected timestamp
assert.equal(A.getDeed(ENDING_DEEDS.hagga_believed).meta.who, 'Hagga');
A.recordDeed('coin_returned');                            // repeat bumps count
assert.equal(A.getDeed('coin_returned').n, 2);
assert.equal(A.getDeed('nope'), null);
pass('recordDeed/hasDeed/getDeed + onDeed listener + timestamp + repeat-count');

// 4) ending gating on the live state (Liberator path built above) ----------
let r = A.reachableEndings();
assert.equal(r.W.reachable, true);
assert.equal(r.L.reachable, true);   // Pure + mercy + believed Hagga + opposed Sela
assert.equal(r.T.reachable, false);  // not cruel/corrupt
assert.equal(r.S.reachable, false);  // not Kind enough
assert.equal(r.A.reachable, false);  // missing cave_lore + stone_refused
assert.equal(r.A.secret, true);
pass('ending-gating: Warden + Liberator reachable; Tyrant/Saint/Ashbearer not');

// 5) PERSIST -> RELOAD into a fresh instance -------------------------------
A.save();
const B = new KarmaEngine({ storage: store });           // same store, new instance
assert.equal(B.load(), true);
assert.equal(B.get('morality'), A.get('morality'));
assert.equal(B.get('purity'), A.get('purity'));
assert.deepEqual(B.deedIds().sort(), A.deedIds().sort());
assert.deepEqual(B.reachableEndingIds(), A.reachableEndingIds()); // gating survives reload
pass('save -> reload (new instance): karma + deeds + gating all restored');

// 6) secret Ashbearer — LOCKED gate (Van 2026-06-17): cave_lore + stone_refused (BOTH required) -------------
assert.equal(B.reachableEndings().A.reachable, false);   // neither deed yet
B.recordDeed(ENDING_DEEDS.cave_lore);
assert.equal(B.reachableEndings().A.reachable, false);   // cave_lore ALONE → NOT enough (earned, not stumbled into)
B.recordDeed(ENDING_DEEDS.stone_refused);
assert.equal(B.reachableEndings().A.reachable, true);    // cave_lore + stone_refused → the secret path opens
{ const only = new KarmaEngine({ storage: memoryStorage() }); only.recordDeed(ENDING_DEEDS.stone_refused);
  assert.equal(only.reachableEndings().A.reachable, false); }   // stone_refused ALONE → NOT enough either
pass('secret Ashbearer gate LOCKED: cave_lore + stone_refused (both required; either alone is not enough)');

// 7) Tyrant + Saint paths --------------------------------------------------
const T = new KarmaEngine({ storage: memoryStorage() });
T.set('morality', -50); T.set('purity', -50);
assert.equal(T.tier('morality'), 'Unkind');
assert.equal(T.reachableEndings().T.reachable, true);
assert.equal(T.reachableEndings().L.reachable, false);
const S = new KarmaEngine({ storage: memoryStorage() });
S.set('morality', 60); S.recordDeed(ENDING_DEEDS.mercy_shown);
assert.equal(T.tier('morality'), 'Unkind'); assert.equal(S.tier('morality'), 'Saintly');
assert.equal(S.reachableEndings().S.reachable, true);
pass('Tyrant gate (cruel+corrupt) + Saint gate (kind+mercy) resolve correctly');

// 8) clearSave -------------------------------------------------------------
B.clearSave();
assert.equal(B.get('morality'), 0);
assert.equal(new KarmaEngine({ storage: store }).load(), false);
pass('clearSave wipes state + removes the save');

console.log(`\nReloaded state -> ${JSON.stringify(A.getStatus())}`);
console.log(`Reachable endings (Liberator path) -> ${A.reachableEndingIds().join(', ')}`);
console.log(`\nALL ${n} CHECKS PASSED ✅`);
