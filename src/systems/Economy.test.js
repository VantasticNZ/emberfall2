// =============================================================================
// Self-test for the ECONOMY + ITEMS + LIFE-SIM systems (Inventory + Economy).
// Proves regional buy/sell, level- and karma-gated stock, books teaching skills,
// property buy + passive rent, jobs, food -> health + body-state trade-offs, the
// capped death penalty, carry limit / equip / stats, and save -> reload. Plain
// Node + node:assert.
// =============================================================================

import assert from 'node:assert/strict';
import { KarmaEngine } from './Karma.js';
import { Inventory } from './Inventory.js';
import { memoryStorage } from './storage.js';
import {
  buyPrice, sellPrice, buy, sell, availableStock, learnBook, buyProperty,
  collectRent, doJob, eat, tickFood, applyDeathPenalty,
} from './Economy.js';

let n = 0;
const pass = (m) => { n++; console.log('  ✓ ' + m); };
console.log('Economy + Items + Life-sim — self test\n');

const newInv = (o = {}) => new Inventory({ storage: memoryStorage(), ...o });
const newKarma = () => new KarmaEngine({ storage: memoryStorage() });

// 0) inventory basics: stack, carry limit, equip, stats ---------------------
{
  const inv = newInv();
  assert.equal(inv.gold, 20);
  assert.equal(inv.add('minor_potion', 3), true);
  assert.equal(inv.has('minor_potion', 3), true);
  assert.equal(inv.count(), 3);
  assert.equal(inv.add('timber', 50), false);        // would bust carry limit (40)
  inv.add('wooden_sword'); inv.equip('wooden_sword');
  assert.equal(inv.equipped('weapon'), 'wooden_sword');
  assert.equal(inv.stats().atk, 3);                  // weapon effect
  pass('inventory: stack + carry limit + equip + derived stats');
}

// 1) regional pricing: same item costs/sells differently --------------------
assert.ok(buyPrice('steel_sword', 'Tidewreck Coast') < buyPrice('steel_sword', 'Emberwood')); // 72 < 104
assert.ok(sellPrice('steel_sword', 'Emberwood') > sellPrice('steel_sword', 'Tidewreck Coast')); // 52 > 36
assert.ok(buyPrice('steel_sword', 'Greenhollow') > sellPrice('steel_sword', 'Greenhollow'));   // buy > sell, no pump
pass('regional pricing: same item costs/sells differently by region; buy > sell everywhere');

// 2) buy + sell move gold correctly -----------------------------------------
{
  const inv = newInv({ gold: 200 }); const karma = newKarma();
  const r = buy(inv, karma, 'hodge_forge', 'steel_sword');   // Greenhollow buy 1.0 -> 80
  assert.equal(r.ok, true); assert.equal(r.price, 80);
  assert.equal(inv.gold, 120); assert.equal(inv.has('steel_sword'), true);
  const s = sell(inv, 'hodge_forge', 'steel_sword');         // Greenhollow sell 0.5 -> 40
  assert.equal(s.price, 40); assert.equal(inv.gold, 160); assert.equal(inv.has('steel_sword'), false);
  pass('buy deducts the regional price + adds the item; sell adds the regional payout + removes it');
}

// 3) LEVEL-gated stock unlocks at the right level ---------------------------
{
  const lo = newInv({ level: 1, gold: 9999 }); const hi = newInv({ level: 5, gold: 9999 });
  const karma = newKarma();
  assert.ok(!availableStock('hodge_forge', { inv: lo, karma }).includes('greenhollow_house')); // lvl 5 gated
  assert.ok(availableStock('hodge_forge', { inv: hi, karma }).includes('greenhollow_house'));
  assert.equal(buy(lo, karma, 'hodge_forge', 'greenhollow_house').reason, 'locked');
  pass('level-gated stock: the Greenhollow house only appears + buys at level 5');
}

// 4) KARMA-gated stock: dark gear if Corrupt, blessed if Pure ----------------
{
  const inv = newInv({ gold: 9999 });
  const neutral = newKarma();
  const corrupt = newKarma(); corrupt.set('morality', -40); corrupt.set('purity', -40);
  const pure = newKarma(); pure.set('purity', 40);
  assert.ok(!availableStock('saltbreak_market', { inv, karma: neutral }).includes('corrupt_blade'));
  assert.ok(availableStock('saltbreak_market', { inv, karma: corrupt }).includes('corrupt_blade'));
  assert.ok(!availableStock('mirefen_trader', { inv, karma: neutral }).includes('blessed_charm'));
  assert.ok(availableStock('mirefen_trader', { inv, karma: pure }).includes('blessed_charm'));
  assert.equal(buy(inv, neutral, 'saltbreak_market', 'corrupt_blade').reason, 'locked'); // not corrupt -> denied
  assert.equal(buy(inv, corrupt, 'saltbreak_market', 'corrupt_blade').ok, true);
  pass('karma-gated stock: dark gear only when Corrupt; blessed gear only when Pure');
}

// 5) BOOK teaches its skill --------------------------------------------------
{
  const inv = newInv({ gold: 200 }); const karma = newKarma();
  buy(inv, karma, 'hodge_forge', 'book_repair');
  assert.equal(inv.hasSkill('repair'), false);
  const r = learnBook(inv, 'book_repair');
  assert.equal(r.ok, true);
  assert.equal(inv.hasSkill('repair'), true);   // learned
  assert.equal(inv.has('book_repair'), false);  // consumed
  pass('book: reading A Smith\'s Primer teaches the repair skill (and consumes the book)');
}

// 6) PROPERTY: buy (level+gold gated) then collect passive rent --------------
{
  const inv = newInv({ level: 5, gold: 2000 }); const karma = newKarma();
  const r = buyProperty(inv, karma, 'hodge_forge', 'greenhollow_house');
  assert.equal(r.ok, true); assert.equal(r.price, 1500); assert.equal(r.rent, 25);
  assert.equal(inv.gold, 500);
  const got = collectRent(inv, 3);              // 3 periods x 25
  assert.equal(got, 75); assert.equal(inv.gold, 575);
  pass('property: buy the Greenhollow house (gold+level gated) -> rent trickles 25/period');
}

// 7) FOOD -> health + body-state trade-offs ---------------------------------
{
  const inv = newInv(); inv.hp = 50; inv.add('meat_pie', 12);
  eat(inv, 'meat_pie');
  assert.equal(inv.hp, 75);                     // healed 25
  assert.equal(inv.bodyState, 'normal');        // foodMeter 50 -> 62
  for (let i = 0; i < 6; i++) eat(inv, 'meat_pie'); // gorge -> foodMeter caps high
  assert.equal(inv.bodyState, 'fat');
  assert.equal(inv.stats().maxHp, 120);         // fat: +20% HP
  assert.equal(inv.stats().speed, -1);          // fat: -speed
  tickFood(inv, 12);                            // starve a while -> skinny
  assert.equal(inv.bodyState, 'skinny');
  assert.equal(inv.stats().maxHp, 80);          // skinny: -20% HP
  assert.equal(inv.stats().speed, 1);           // skinny: +speed
  pass('food: eating heals; gorging -> fat (+HP/-speed); starving -> skinny (+speed/-HP)');
}

// 8) JOBS yield gold (+ materials/skill) ------------------------------------
{
  const inv = newInv({ gold: 0 });
  const r = doJob(inv, 'woodcutting');
  assert.equal(r.ok, true); assert.equal(inv.gold, 8); assert.equal(inv.has('timber', 2), true);
  assert.equal(doJob(inv, 'bounty').reason, 'locked'); // needs level 3
  inv.level = 3; assert.equal(doJob(inv, 'bounty').ok, true); assert.equal(inv.gold, 48);
  pass('jobs: woodcutting yields gold + timber; the bounty unlocks at level 3');
}

// 9) DEATH penalty: a capped % of gold --------------------------------------
{
  const a = newInv({ gold: 1000 });
  assert.equal(applyDeathPenalty(a), 150);   // 15%
  assert.equal(a.gold, 850);
  const b = newInv({ gold: 2000 });
  assert.equal(applyDeathPenalty(b), 200);   // capped at 200 (not 300)
  assert.equal(b.gold, 1800);
  pass('death penalty: lose 15% of gold, capped at 200 (a sting, never a wipe)');
}

// 10) persists through save -> reload ---------------------------------------
{
  const store = memoryStorage();
  const inv = new Inventory({ storage: store, level: 5, gold: 2000 }); const karma = newKarma();
  inv.add('major_potion', 2); inv.add('steel_sword'); inv.equip('steel_sword');
  learnBook(inv, (buy(inv, karma, 'hodge_forge', 'book_repair'), 'book_repair'));
  buyProperty(inv, karma, 'hodge_forge', 'greenhollow_house');
  eat(inv, (inv.add('bread'), 'bread'));
  inv.save();
  const inv2 = new Inventory({ storage: store });
  assert.equal(inv2.load(), true);
  assert.equal(inv2.gold, inv.gold);
  assert.equal(inv2.has('major_potion', 2), true);
  assert.equal(inv2.equipped('weapon'), 'steel_sword');
  assert.equal(inv2.hasSkill('repair'), true);
  assert.equal(!!inv2.property.greenhollow_house, true);
  assert.equal(inv2.stats().atk, 8);
  pass('save -> reload: gold + items + equipment + skills + property all restored');
}

console.log(`\nALL ${n} CHECKS PASSED ✅`);
