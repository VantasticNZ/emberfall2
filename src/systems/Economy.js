// =============================================================================
// SYSTEM: Economy  (the transaction RULES engine, written once). Stateless: it
// operates on an Inventory (holdings) + reads Karma (for karma/deed gating), over
// the DATA in src/data/economy.js + src/data/items/. Handles regional buy/sell,
// gated stock, jobs, life-sim (books/property-rent/food/body-state) and death.
//
// BALANCE MODEL (full rationale in docs/ECONOMY-BALANCE.md):
//   START 20g. INCOME — enemy drops small (~2-8), quests medium (~30-80), jobs
//   repeatable small-medium (6-40), selling loot (region sell-fraction of value).
//   SINKS — gear (15 -> 250+), consumables (5-35), lantern OIL as the early sink
//   (5/refill), repair/services, and PROPERTY (1500-3500, level-gated) as the
//   gold sink + a passive-income payoff. SELL < BUY always (regional fractions),
//   so you cannot trivially out-earn costs; you CAN grind a bit. DEATH costs a
//   capped % of gold (15%, max 200) — a real sting, never a wipe.
// =============================================================================

import { item } from '../data/items/index.js';
import { REGION_PRICES, SHOPS, JOBS, BALANCE, BODY_STATES } from '../data/economy.js';
import { chaBuyMult, chaSellMult } from './Social.js';

// --- regional pricing (CHARISMA-adjusted; cha 5 = neutral 1.0, so no rewrite) -
export function buyPrice(itemId, region, cha = 5) {
  const m = REGION_PRICES[region]?.buy ?? 1;
  return Math.max(0, Math.round(item(itemId).value * m * chaBuyMult(cha)));
}
export function sellPrice(itemId, region, cha = 5) {
  const m = REGION_PRICES[region]?.sell ?? 0.5;
  return Math.max(0, Math.round(item(itemId).value * m * chaSellMult(cha)));
}

// --- gating (mirrors the QuestEngine requires-pattern: level/deeds/karma) -----
export function meetsRequires(req = {}, { karma = null, level = 1 } = {}) {
  if (!req) return true;
  if (req.level != null && level < req.level) return false;
  if (req.deeds || req.notDeeds || req.karma) {
    if (!karma) return false; // gated on memory we weren't given -> closed
    if ((req.deeds || []).some((d) => !karma.hasDeed(d))) return false;
    if ((req.notDeeds || []).some((d) => karma.hasDeed(d))) return false;
    if (req.karma) {
      for (const axis of ['morality', 'purity']) {
        const r = req.karma[axis]; if (!r) continue;
        const v = karma.get(axis);
        if (r.min != null && v < r.min) return false;
        if (r.max != null && v > r.max) return false;
      }
    }
  }
  return true;
}

// --- shops -------------------------------------------------------------------
export function shop(id) { return SHOPS.find((s) => s.id === id); }
/** Is a shop open at the current time? (day/night `hours` gate; open if no hours.) */
export function isOpen(shopId, time) {
  const s = shop(shopId); if (!s) return false;
  if (!s.hours) return true;
  return !!(time && time.meetsTime(s.hours));
}
/** The item ids currently offered by a shop, after gating. */
export function availableStock(shopId, { inv, karma } = {}) {
  const s = shop(shopId); if (!s) return [];
  return s.stock.filter((e) => meetsRequires(e.requires, { karma, level: inv?.level ?? 1 }))
    .map((e) => e.item);
}
export function buy(inv, karma, shopId, itemId) {
  const s = shop(shopId); const entry = s?.stock.find((e) => e.item === itemId);
  if (!entry) return { ok: false, reason: 'not stocked' };
  if (!meetsRequires(entry.requires, { karma, level: inv.level })) return { ok: false, reason: 'locked' };
  if (item(itemId).type === 'property') return buyProperty(inv, karma, shopId, itemId);
  const price = buyPrice(itemId, s.region, inv.attr ? inv.attr('cha') : 5);   // CHA discount
  if (inv.gold < price) return { ok: false, reason: 'too poor', price };
  if (!inv.add(itemId)) return { ok: false, reason: 'carry full', price };
  inv.addGold(-price);
  return { ok: true, price };
}
export function sell(inv, shopIdOrRegion, itemId) {
  const region = shop(shopIdOrRegion)?.region || shopIdOrRegion;
  if (!inv.has(itemId)) return { ok: false, reason: 'none' };
  const price = sellPrice(itemId, region, inv.attr ? inv.attr('cha') : 5);     // CHA markup
  inv.remove(itemId); inv.addGold(price);
  return { ok: true, price };
}

// --- life-sim: books teach skills/abilities ----------------------------------
export function learnBook(inv, itemId) {
  const it = item(itemId);
  if (it.type !== 'book') return { ok: false, reason: 'not a book' };
  if (!inv.has(itemId)) return { ok: false, reason: 'no book' };
  const eff = (it.effects || []).find((e) => e.teaches || e.skillPoint) || {};
  if (eff.teaches) inv.learnSkill(eff.teaches);
  if (eff.skillPoint) inv.addSkillPoints(eff.skillPoint);
  inv.remove(itemId); // a book is consumed when read
  return { ok: true, taught: eff.teaches || `+${eff.skillPoint} skill point` };
}

// --- life-sim: property (buy a high-tier sink, then collect passive rent) -----
export function buyProperty(inv, karma, shopId, itemId) {
  const s = shop(shopId); const entry = s?.stock.find((e) => e.item === itemId);
  const it = item(itemId);
  if (!entry || it.type !== 'property') return { ok: false, reason: 'not for sale' };
  if (!meetsRequires(entry.requires, { karma, level: inv.level })) return { ok: false, reason: 'locked' };
  if (inv.property[itemId]) return { ok: false, reason: 'already owned' };
  const price = buyPrice(itemId, s.region);
  if (inv.gold < price) return { ok: false, reason: 'too poor', price };
  inv.addGold(-price);
  inv.property[itemId] = { rent: (it.effects || []).find((e) => e.rent)?.rent || 0 };
  return { ok: true, price, rent: inv.property[itemId].rent };
}
/** Collect rent from all owned property for `periods` (e.g. days passed). */
export function collectRent(inv, periods = 1) {
  let total = 0;
  for (const id in inv.property) total += (inv.property[id].rent || 0) * periods;
  inv.addGold(total);
  return total;
}

// --- jobs (repeatable grind -> gold + sometimes materials/skill) -------------
export function doJob(inv, jobId, karma = null) {
  const j = JOBS.find((x) => x.id === jobId);
  if (!j) return { ok: false, reason: 'no such job' };
  if (!meetsRequires(j.requires, { karma, level: inv.level })) return { ok: false, reason: 'locked' };
  if (j.gold) inv.addGold(j.gold);
  Object.entries(j.items || {}).forEach(([id, n]) => inv.add(id, n));
  if (j.skill) inv.learnSkill(j.skill);
  return { ok: true, gold: j.gold || 0, items: j.items || {}, skill: j.skill };
}

// --- life-sim: food -> health + body-state -----------------------------------
export function eat(inv, foodId) {
  const it = item(foodId);
  if (it.type !== 'food') return { ok: false, reason: 'not food' };
  if (!inv.has(foodId)) return { ok: false, reason: 'none' };
  const eff = (it.effects || []).reduce((a, e) => ({ heal: a.heal + (e.heal || 0), food: a.food + (e.food || 0) }), { heal: 0, food: 0 });
  inv.heal(eff.heal);
  inv.foodMeter = Math.max(0, Math.min(BALANCE.foodMax, inv.foodMeter + eff.food));
  inv.remove(foodId);
  _refreshBody(inv);
  return { ok: true, healed: eff.heal, foodMeter: inv.foodMeter, bodyState: inv.bodyState };
}
/** Time passing decays the food meter (eat to maintain, or go skinny). */
export function tickFood(inv, days = 1) {
  inv.foodMeter = Math.max(0, inv.foodMeter - BALANCE.foodDecayPerDay * days);
  _refreshBody(inv);
  return inv.bodyState;
}
function _refreshBody(inv) {
  inv.bodyState = inv.foodMeter >= BALANCE.foodFat ? 'fat'
    : (inv.foodMeter <= BALANCE.foodSkinny ? 'skinny' : 'normal');
  inv.hp = Math.min(inv.hp, inv.stats().maxHp); // clamp to the new (body-adjusted) cap
}

// --- death penalty (a decent but capped % of gold) ---------------------------
export function applyDeathPenalty(inv) {
  const loss = Math.min(Math.round(inv.gold * BALANCE.deathPct), BALANCE.deathCap);
  inv.addGold(-loss);
  inv.hp = inv.stats().maxHp; // respawn at full
  return loss;
}
