// =============================================================================
// SYSTEM: Interactables  (INTERACTABLES-DESIGN §1–§9 — the FREE-NOW set)
// One write-once, DATA-driven resolver for the world "playground" verbs that sit on
// existing seams (Inventory, Karma deed-memory / SaveManager chunk-deltas, Interaction):
//   • SEARCH containers (drawers/cupboards/barrels) — roll loot ONCE, record a searched
//     flag in the persistent chunk-delta so it's empty on return (the chest pattern).
//   • CUT / BREAK objects (bushes/crates) — roll loot; bushes respawn (no memory),
//     crates are permanent (record a flag).
//   • PUSH blocks — slide one tile if the next tile is clear (puzzle furniture).
// Regions supply only DATA. Pure functions here = headless-testable (Interactables.test.js);
// the scene wires them to sprites + Interaction.register / the push grid.
// =============================================================================

import { LOOT } from '../data/loot.js';

/** Roll a weighted loot table id (or inline table) → a list of grant descriptors
 *  ({gold} | {item,n}). `rng` is a () => [0,1) so tests are deterministic. */
export function rollLoot(table, rng = Math.random) {
  const t = typeof table === 'string' ? LOOT[table] : table;
  if (!t || !t.drops || !t.drops.length) return [];
  const rolls = t.rolls || 1, out = [];
  const total = t.drops.reduce((a, d) => a + (d.weight || 1), 0);
  for (let r = 0; r < rolls; r++) {
    let x = rng() * total, pick = t.drops[t.drops.length - 1];
    for (const d of t.drops) { const w = d.weight || 1; if (x < w) { pick = d; break; } x -= w; }
    if (pick.nothing) continue;
    if (pick.gold) out.push({ gold: pick.gold[0] + Math.floor(rng() * (pick.gold[1] - pick.gold[0] + 1)) });
    else { const n = pick.n ? pick.n[0] + Math.floor(rng() * (pick.n[1] - pick.n[0] + 1)) : 1; out.push({ item: pick.item, n }); }
  }
  return out;
}

/** Grant a rolled list to an Inventory. Returns the actually-granted list; an item
 *  that would bust the carry limit is flagged `{full:true}` and NOT given (no dupe). */
export function grantLoot(grants, inv) {
  const got = [];
  for (const g of grants) {
    if (g.gold != null) { inv.addGold(g.gold); got.push({ gold: g.gold }); }
    else { const ok = inv.add(g.item, g.n || 1); got.push(ok ? { item: g.item, n: g.n || 1 } : { item: g.item, n: g.n || 1, full: true }); }
  }
  return got;
}

/** SEARCH a container ONCE. ctx = { inv, rng, mem:{has,record}, key, hasDeed? }.
 *  mem is backed by the persistent chunk-delta (save.isOpened/recordOpened) so the
 *  searched state survives save + chunk/region cycling — identical lifecycle to a chest. */
export function searchContainer(def, ctx) {
  if (ctx.mem.has(ctx.key)) return { already: true, granted: [] };
  if (def.locked && !(ctx.hasDeed && ctx.hasDeed(def.locked))) return { locked: def.locked, granted: [] };
  const granted = grantLoot(rollLoot(def.loot, ctx.rng), ctx.inv);
  ctx.mem.record(ctx.key);
  if (def.onSearch && ctx.recordDeed) for (const d of def.onSearch) if (d.deed) ctx.recordDeed(d.deed);
  return { granted };
}

/** CUT/BREAK an object. Bushes respawn (no mem); `permanent` objects (crates) record
 *  a flag so they stay broken. Returns the loot granted + any `reveal` target. */
export function cutObject(def, ctx) {
  if (def.permanent && ctx.mem && ctx.key && ctx.mem.has(ctx.key)) return { already: true, granted: [] };
  const granted = def.loot ? grantLoot(rollLoot(def.loot, ctx.rng), ctx.inv) : [];
  if (def.permanent && ctx.mem && ctx.key) ctx.mem.record(ctx.key);
  return { granted, reveal: def.reveal || null };
}

/** PUSH a block one tile in `dir` ({dx,dy}) iff the next tile is clear.
 *  `isSolid(tx,ty)` reports a blocked tile (a wall/solid/another block). Returns the
 *  new tile {tx,ty} on success, or null when blocked. Caller moves the sprite. */
export function pushBlock(block, dir, isSolid) {
  const ntx = block.tx + dir.dx, nty = block.ty + dir.dy;
  if (!dir.dx && !dir.dy) return null;
  if (isSolid(ntx, nty)) return null;
  return { tx: ntx, ty: nty };
}
