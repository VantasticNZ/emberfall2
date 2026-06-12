// ShopStock — locks the limited/replenishing shop-stock model (shops-v2): lazy-full on a fresh save,
// DEPLETION on buy, "(out)" at zero, REPLENISH on the day cadence (and the real-time frozen-clock
// fallback), and persistence through serialize/hydrate. Plain Node + node:assert.

import assert from 'node:assert/strict';
import { ShopStock, maxStock } from './ShopStock.js';
import { SHOPS, STOCK } from '../data/economy.js';
import { item } from '../data/items/index.js';

let n = 0; const pass = (m) => { n++; console.log('  ✓ ' + m); };
console.log('ShopStock — self test\n');

// a real shop with both a sundry (stacked) and gear (scarce) line
const SHOP = 'hodge_forge';
const FOOD = 'lantern_oil';   // consumable -> MAX_BY_TYPE.consumable = 8
const GEAR = 'steel_sword';   // weapon -> MAX_BY_TYPE.weapon = 2

// 0) max-by-type derivation -----------------------------------------------------
assert.equal(maxStock({ item: FOOD }), STOCK.MAX_BY_TYPE[item(FOOD).type]);
assert.equal(maxStock({ item: GEAR }), STOCK.MAX_BY_TYPE.weapon);
assert.equal(maxStock({ item: GEAR, qty: 1 }), 1, 'a per-entry qty overrides the type max');
pass('max stock derives from item TYPE; a per-entry qty overrides it');

// 1) fresh save → every shelf lazily full (the shop-stock gate stays green) -----
{
  const ss = new ShopStock();
  assert.equal(ss.qtyOf(SHOP, FOOD), STOCK.MAX_BY_TYPE.consumable);
  assert.equal(ss.qtyOf(SHOP, GEAR), STOCK.MAX_BY_TYPE.weapon);
  // every gated line of every shop inits > 0
  for (const s of SHOPS) for (const e of s.stock) assert.ok(ss.qtyOf(s.id, e.item) > 0, `${s.id}/${e.item} fresh-full`);
  pass('fresh save: every shop shelf lazily inits to its full max (no empty buy menu)');
}

// 2) DEPLETION on buy → "(out)" at zero → no further sale ------------------------
{
  const ss = new ShopStock();
  const max = ss.qtyOf(SHOP, GEAR);                 // 2
  assert.equal(ss.take(SHOP, GEAR), true); assert.equal(ss.qtyOf(SHOP, GEAR), max - 1);
  assert.equal(ss.take(SHOP, GEAR), true); assert.equal(ss.qtyOf(SHOP, GEAR), 0);
  assert.equal(ss.inStock(SHOP, GEAR), false, 'at zero → out of stock');
  assert.equal(ss.take(SHOP, GEAR), false, 'no sale once out');
  assert.equal(ss.qtyOf(SHOP, GEAR), 0, 'a denied take never goes negative');
  pass('buying depletes the shelf; at zero it reads "(out)" and refuses the sale');
}

// 3) RESTOCK on a new game-DAY (the canonical cadence) --------------------------
{
  const ss = new ShopStock();
  ss.take(SHOP, GEAR); ss.take(SHOP, GEAR);         // -> 0
  ss.maybeRestock(SHOP, 0, 0);                      // anchor day 0
  assert.equal(ss.qtyOf(SHOP, GEAR), 0, 'same day → no restock');
  const did = ss.maybeRestock(SHOP, STOCK.RESTOCK_DAYS, 0); // a new day
  assert.equal(did, true);
  assert.equal(ss.qtyOf(SHOP, GEAR), Math.min(maxStock({ item: GEAR }), STOCK.RESTOCK_PER_CYCLE), 'a new day refills toward max');
  pass('restock fires on a new game-day, refilling toward the max (capped)');
}

// 4) RESTOCK real-time fallback (frozen-clock safe: day never advances) ----------
{
  const ss = new ShopStock();
  ss.take(SHOP, FOOD);                              // 8 -> 7
  ss.maybeRestock(SHOP, 0, 1000);                   // anchor at t=1s, day frozen at 0
  assert.equal(ss.qtyOf(SHOP, FOOD), 7, 'before the ms fallback elapses → no restock');
  const did = ss.maybeRestock(SHOP, 0, 1000 + STOCK.RESTOCK_MS); // day STILL 0, but real time passed
  assert.equal(did, true, 'the real-time day-equivalent triggers a restock even with a frozen clock');
  assert.equal(ss.qtyOf(SHOP, FOOD), Math.min(8, 7 + STOCK.RESTOCK_PER_CYCLE));
  pass('restock also fires on the real-time day-equivalent (works while the day clock is frozen)');
}

// 5) restock never exceeds max --------------------------------------------------
{
  const ss = new ShopStock();
  ss.take(SHOP, FOOD);                              // 8 -> 7
  ss.maybeRestock(SHOP, 0, 0);
  ss.maybeRestock(SHOP, 100, 0);                    // huge day jump
  assert.equal(ss.qtyOf(SHOP, FOOD), 8, 'capped at the shelf max, never overfilled');
  pass('restock is capped at the item max (no overfill)');
}

// 6) persists through serialize → hydrate ---------------------------------------
{
  const ss = new ShopStock();
  ss.take(SHOP, GEAR); ss.maybeRestock(SHOP, 3, 5000);
  const blob = JSON.parse(JSON.stringify(ss.serialize()));
  const ss2 = new ShopStock(); ss2.hydrate(blob);
  assert.equal(ss2.qtyOf(SHOP, GEAR), ss.qtyOf(SHOP, GEAR), 'on-hand qty restored');
  // the restock anchor restored → no immediate double-restock
  assert.equal(ss2.maybeRestock(SHOP, 3, 5000), false, 'restock anchor restored (no phantom restock on reload)');
  pass('serialize → hydrate restores on-hand quantities AND the restock anchor');
}

console.log(`\nALL ${n} CHECKS PASSED ✅`);
