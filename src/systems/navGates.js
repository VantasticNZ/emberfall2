// =============================================================================
// RUNTIME NAV GATES (GAME-BUILD-PLAYBOOK v2 §3.1 — "validate the runtime, not the model").
// The 13 design gates check data consistency; these check what a REAL 16×8 player BODY
// experiences against the REAL colliders. The B2 path bug passed every design gate yet a body
// couldn't walk it — because BFS-of-nav-data ≠ a sized body threading solid-prop fragments.
// These two gates are body-aware + collider-true, so that bug class is caught at build time.
// Reusable on any region (the fit-check fixture today; real Tiled regions tomorrow).
// =============================================================================

import { TILE } from '../data/worldmap.js';
import { PROPS, solidBox } from '../data/assets.js';

const BODY_HW = 8, BODY_HH = 4;   // the player feet-box is 16×8 (OverworldScene body)

/** Center-based collider rects for the SOLID props of a region (same rule as _buildRegion). */
export function solidPropColliders(region) {
  const out = [];
  for (const p of (region.props || [])) {
    if (!p.solid) continue;
    const d = PROPS[p.key]; if (!d) continue;
    const sc = p.scale != null ? p.scale : 1, b = solidBox(p.key, d);
    const offX = p.flip ? -b.offX : b.offX;
    out.push({ x: p.x + offX * sc, y: p.y + b.offY * sc, w: Math.max(8, b.w * sc), h: Math.max(8, b.h * sc) });
  }
  return out;
}

const overlaps = (cx, cy, r) =>
  cx - BODY_HW < r.x + r.w / 2 && cx + BODY_HW > r.x - r.w / 2 &&
  cy - BODY_HH < r.y + r.h / 2 && cy + BODY_HH > r.y - r.h / 2;

/** Flood the FREE configuration space of a 16×8 body (8px sub-tile resolution) from the start
 *  tile, against ALL given colliders. Returns a Set of "tx,ty" tiles whose centre is reachable. */
function freeReach(region, colliders, startTile) {
  const { origin, widthTiles: W, heightTiles: H } = region, STEP = 8;
  const nx = Math.floor((W * TILE) / STEP), ny = Math.floor((H * TILE) / STEP);
  const free = (i, j) => {
    const cx = origin.x + i * STEP + STEP / 2, cy = origin.y + j * STEP + STEP / 2;
    for (const r of colliders) if (overlaps(cx, cy, r)) return false;
    return true;
  };
  const si = Math.floor((startTile[0] * TILE + TILE / 2) / STEP), sj = Math.floor((startTile[1] * TILE + TILE / 2) / STEP);
  const seen = new Set(), q = [[si, sj]]; seen.add(si + ',' + sj);
  while (q.length) {
    const [i, j] = q.pop();
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= nx || b >= ny) continue;
      const k = a + ',' + b; if (seen.has(k) || !free(a, b)) continue; seen.add(k); q.push([a, b]);
    }
  }
  // a TILE is reached iff its centre sample is in the flood
  const tileReached = (tx, ty) => seen.has(Math.floor((tx * TILE + TILE / 2) / STEP) + ',' + Math.floor((ty * TILE + TILE / 2) / STEP));
  return { tileReached };
}

/** GATE 1 — BODY-WALK REACHABILITY: a real-sized body, against the real colliders (nav + solid
 *  props + gate), reaches every intended destination and NEVER a blocked zone. Gated branches open
 *  only with the tool. Returns {ok, failures[]}. */
export function bodyWalkReachability(region, expect) {
  const navC = [...(region.colliders || [])], gateC = [...(region.gatedColliders || [])], propC = solidPropColliders(region);
  const closed = [...navC, ...gateC, ...propC];        // no tool: gates block
  const open = [...navC, ...propC];                    // tool held: gates removed
  const rc = freeReach(region, closed, expect.startTile);
  const ro = freeReach(region, open, expect.startTile);
  const fail = [];
  for (const [tx, ty] of (expect.reachOpen || [])) if (!rc.tileReached(tx, ty)) fail.push(`open destination [${tx},${ty}] NOT reachable by a body`);
  for (const [tx, ty] of (expect.blockedMustHold || [])) if (rc.tileReached(tx, ty)) fail.push(`blocked zone [${tx},${ty}] IS reachable (must hold)`);
  for (const [tx, ty] of (expect.reachGatedOnlyWithTool || [])) {
    if (rc.tileReached(tx, ty)) fail.push(`gated destination [${tx},${ty}] reachable WITHOUT the tool`);
    if (!ro.tileReached(tx, ty)) fail.push(`gated destination [${tx},${ty}] NOT reachable even WITH the tool`);
  }
  return { ok: fail.length === 0, failures: fail };
}

/** GATE 2 — NO SOLID PROP ON A WALKABLE TILE: the §0 rule. A solid prop collider may never overlap
 *  a tile the nav layer marks walkable. Returns {ok, offenders[]}. */
export function noSolidPropOnWalkable(region) {
  const { origin, nav } = region; const offenders = [];
  if (!nav || !nav.walkable) return { ok: true, offenders };
  for (const c of solidPropColliders(region)) {
    const tx0 = Math.floor((c.x - c.w / 2 - origin.x) / TILE), tx1 = Math.floor((c.x + c.w / 2 - origin.x) / TILE);
    const ty0 = Math.floor((c.y - c.h / 2 - origin.y) / TILE), ty1 = Math.floor((c.y + c.h / 2 - origin.y) / TILE);
    for (let ty = Math.max(0, ty0); ty <= Math.min(nav.H - 1, ty1); ty++)
      for (let tx = Math.max(0, tx0); tx <= Math.min(nav.W - 1, tx1); tx++)
        if (nav.walkable[ty][tx]) { offenders.push(`solid prop collider overlaps WALKABLE nav tile [${tx},${ty}]`); }
  }
  return { ok: offenders.length === 0, offenders };
}
