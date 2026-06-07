// =============================================================================
// Self-test for the Social layer (CHARISMA / TRUST / DECEPTION). Plain Node +
// assert. Verifies: a CHA check passes/fails by stat; an Insight reveal is hidden
// without the skill; prices shift with CHA (through Economy); a trust-gated option
// appears only when deeds earned it.
// =============================================================================

import assert from 'node:assert/strict';
import { chaBuyMult, chaSellMult, trust, resolve, state, tag } from './Social.js';
import { buyPrice, sellPrice } from './Economy.js';

const inv = (cha, skills = []) => ({ attr: (n) => (n === 'cha' ? cha : 5), hasSkill: (s) => skills.includes(s) });
const karma = (morality = 0, deeds = []) => ({ get: (a) => (a === 'morality' ? morality : 0), hasDeed: (d) => deeds.includes(d) });

let n = 0; const pass = (m) => { n++; console.log('  ✓ ' + m); };
console.log('Social (CHA / TRUST / DECEPTION) — self test\n');

// 1) CHARISMA check passes/fails by stat ------------------------------------
{
  const chk = { type: 'cha', dc: 7 };
  assert.equal(resolve(chk, { inv: inv(8) }), true);    // CHA 8 >= 7
  assert.equal(resolve(chk, { inv: inv(5) }), false);   // CHA 5 < 7
  assert.equal(state({ check: chk }, { inv: inv(8) }), 'pass');    // shown + selectable
  assert.equal(state({ check: chk }, { inv: inv(5) }), 'locked');  // shown greyed (Fallout)
  assert.equal(tag({ check: chk }), '[Charisma 7] ');
  pass('CHARISMA check: pass at/above DC, LOCKED below (Fallout-style greyed); tag renders');
}

// 2) INSIGHT reveal is HIDDEN without the skill ------------------------------
{
  const chk = { type: 'insight' };
  assert.equal(state({ check: chk }, { inv: inv(5, []) }), 'hidden');        // no skill -> you don't see the lie-catch
  assert.equal(state({ check: chk }, { inv: inv(5, ['insight']) }), 'pass'); // with the skill -> revealed
  assert.equal(resolve(chk, { inv: inv(5, ['insight']) }), true);
  assert.equal(resolve(chk, { inv: inv(5, []) }), false);
  pass('INSIGHT reveal: hidden without the skill; appears + resolves true WITH it');
}

// 3) SHOP PRICES shift with CHA (through Economy) ----------------------------
{
  assert.equal(chaBuyMult(5), 1);                       // neutral CHA = no change (existing prices intact)
  assert.ok(chaBuyMult(9) < 1 && chaSellMult(9) > 1);   // high CHA: cheaper buys, richer sells
  const base = buyPrice('steel_sword', 'Greenhollow', 5);
  const hi = buyPrice('steel_sword', 'Greenhollow', 9);
  const lo = buyPrice('steel_sword', 'Greenhollow', 1);
  assert.ok(hi < base && lo > base);                    // CHA9 cheaper, CHA1 dearer than neutral
  assert.ok(sellPrice('steel_sword', 'Greenhollow', 9) > sellPrice('steel_sword', 'Greenhollow', 5));
  pass(`SHOP PRICES scale with CHA: steel sword ${lo}g (CHA1) / ${base}g (CHA5) / ${hi}g (CHA9)`);
}

// 4) TRUST-gated option appears only with the deeds -------------------------
{
  const chk = { type: 'trust', dc: 2, deeds: ['lean_workers'] };
  assert.equal(trust(karma(0, [])), 0);                                   // no good dealings
  assert.equal(trust(karma(50, ['lean_workers'])), 3);                    // +2 morality, +1 positive deed
  assert.equal(trust(karma(50, ['lean_workers']), chk), 4);               // +1 more for the per-target deed
  assert.equal(state({ check: chk }, { karma: karma(50, ['lean_workers']) }), 'pass');   // trusted -> shown
  assert.equal(state({ check: chk }, { karma: karma(0, []) }), 'hidden');                // not trusted -> hidden
  assert.equal(trust(karma(0, ['lean_owner'])), 0);                       // betrayal can't go negative-below-0
  pass('TRUST-gated option: appears only once deeds/karma earned trust; betrayal closes it');
}

console.log(`\nALL ${n} CHECKS PASSED ✅`);
