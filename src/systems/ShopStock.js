// =============================================================================
// SYSTEM: ShopStock — LIMITED, REPLENISHING shop quantities (shops-v2). Economy.js
// is deliberately STATELESS (pricing/gating rules); a shop's *stock-on-hand* is the
// one piece of mutable, persisted state, so it lives here and is composed into the
// world save via SaveManager.link('shopstock', ...) — the same pattern as inv/karma.
//
// MODEL (Van's WS1 brief): each stocked item has a LIMITED quantity that DEPLETES as
// the player buys, shows "(out)" at zero, and REPLENISHES on a day cadence. The
// per-item max is derived from the item TYPE (STOCK.MAX_BY_TYPE; a per-entry `qty`
// on the shop data overrides it) so no hand-assignment is needed. Restock fires when
// a new game-DAY has begun (tod.dayCount) — and, because the day clock is currently
// FROZEN (see docs/DEFERRED.md), ALSO after a real-time day-equivalent (STOCK.RESTOCK_MS,
// = one day at the default RATE) so the shelves never stay permanently empty in the
// build Van actually plays. Same frozen-clock fallback precedent as REPAIR.WORK_MS.
//
// availableStock()/buy() in Economy.js are UNCHANGED — gating still returns the full
// list; this is an overlay the scene reads for qty + "(out)". The shop-stock-non-empty
// gate stays green (a fresh save lazily inits every shelf to its max).
// =============================================================================

import { SHOPS, STOCK } from '../data/economy.js';
import { item } from '../data/items/index.js';

/** The maximum on-hand for a shop entry: an explicit `qty` override, else by item type. */
export function maxStock(entry) {
  if (entry && entry.qty != null) return entry.qty;
  const t = item(entry.item)?.type;
  return STOCK.MAX_BY_TYPE[t] ?? STOCK.MAX_DEFAULT;
}

export class ShopStock {
  constructor() {
    this.qty = {};   // qty[shopId][itemId] = units on hand
    this.mark = {};  // mark[shopId] = { day, ms } of the last restock (the cadence anchor)
  }

  _shopData(id) { return SHOPS.find((s) => s.id === id); }
  _q(id) { return (this.qty[id] ||= {}); }

  /** Lazily fill a shop's shelves to their max the first time it is seen (so fresh saves are full). */
  ensure(shopId) {
    const s = this._shopData(shopId); if (!s) return;
    const q = this._q(shopId);
    for (const e of s.stock) if (q[e.item] == null) q[e.item] = maxStock(e);
  }

  qtyOf(shopId, itemId) { this.ensure(shopId); return this._q(shopId)[itemId] ?? 0; }
  inStock(shopId, itemId) { return this.qtyOf(shopId, itemId) > 0; }

  /** Consume one unit on a purchase. Returns false (no sale) if out of stock. */
  take(shopId, itemId) {
    this.ensure(shopId);
    const q = this._q(shopId);
    if ((q[itemId] ?? 0) <= 0) return false;
    q[itemId] -= 1;
    return true;
  }

  /**
   * Refill toward max if the restock cadence has elapsed since the last refill — either a new
   * game-day (day - lastDay >= RESTOCK_DAYS) OR the real-time day-equivalent (frozen-clock safe).
   * Returns true if a restock happened. Anchors off the FIRST sighting so a just-opened shop
   * doesn't instantly refill.
   */
  maybeRestock(shopId, day = 0, nowMs = 0) {
    this.ensure(shopId);
    const m = (this.mark[shopId] ||= { day, ms: nowMs });
    const dayPassed = (day - m.day) >= STOCK.RESTOCK_DAYS;
    const msPassed = (nowMs - m.ms) >= STOCK.RESTOCK_MS;
    if (!dayPassed && !msPassed) return false;
    const s = this._shopData(shopId); if (!s) return false;
    const q = this._q(shopId);
    for (const e of s.stock) q[e.item] = Math.min(maxStock(e), (q[e.item] ?? 0) + STOCK.RESTOCK_PER_CYCLE);
    this.mark[shopId] = { day, ms: nowMs };
    return true;
  }

  // ---- persistence (composed into the world save) ----
  serialize() { return { qty: this.qty, mark: this.mark }; }
  hydrate(b) { if (b && typeof b === 'object') { this.qty = b.qty || {}; this.mark = b.mark || {}; } }
}
