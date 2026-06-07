// =============================================================================
// WORLD MAP — the single world-coordinate data the OverworldScene streams
// (WORLD-STRUCTURE-DESIGN Pillar 1). PRODUCTION-SHAPED but, in Phase 1, an
// EMPTY-but-WORKING test surface: a real RESIDENT-art grass ground + a deterministic
// scatter of real resident props + test pickup orbs, so the seamless shell + the
// SaveManager round-trip are provable. REAL region content slots in here per-region
// in Phase 2+ (each area authored as world-coord chunk descriptors); this stub is
// the contract those will satisfy. Nothing here imports a real region.
// =============================================================================

import { WORLD } from './world.js';
import { MARSH } from './marsh.js';

export const TILE = 32;
export const CHUNK = 32;                       // tiles per chunk side
export const CHUNK_PX = CHUNK * TILE;          // 1024 px
export const WORLD_CHUNKS = 16;                // 16×16 chunks…
export const WORLD_PX = WORLD_CHUNKS * CHUNK_PX; // …= 16384 px world

// =============================================================================
// REGIONS — settlements/areas placed at WORLD-COORD offsets (Phase 2 migration).
// A region is a cohesive unit (buildings + cast + chests) loaded as one when the
// player enters its bounds; the terrain/green-belt still streams per-chunk. The
// data is the EXISTING discrete-region data, re-expressed in world-coords (offset
// by the region origin) — same canonical ids, same cast, same quests. Greenhollow
// sits near the CENTRE of the world (per the geography spec), ringed by green belt.
// =============================================================================
const GH_ORIGIN = { x: 5 * CHUNK_PX, y: 5 * CHUNK_PX };   // world px of Greenhollow tile (0,0) — central
const gx = (tx) => GH_ORIGIN.x + tx * TILE;
const gy = (ty) => GH_ORIGIN.y + ty * TILE;

export const GREENHOLLOW = {
  key: 'Greenhollow',
  origin: GH_ORIGIN,
  // world-rect bounds (+ a load margin handled by the scene)
  bounds: { x: GH_ORIGIN.x, y: GH_ORIGIN.y, w: WORLD.widthTiles * TILE, h: WORLD.heightTiles * TILE },
  safeZone: true,
  player: { x: gx(WORLD.player.tx), y: gy(WORLD.player.ty) },        // world spawn inside the village
  // buildings/props/depth-band → world-coords (keep key/solid/tint/scale; convert tx,ty→x,y)
  props: WORLD.props.map((p) => ({ ...p, x: gx(p.tx), y: gy(p.ty) })),
  // cast → world-coords. Schedule tiles become ABSOLUTE WORLD TILES (origin-tile +
  // local) so NpcLife (which does `tx*TILE`) targets the right world spot UNMODIFIED.
  npcs: WORLD.npcs.map((n) => ({
    ...n, x: gx(n.tx), y: gy(n.ty),
    schedule: (n.schedule || []).map((s) => ({ ...s, tx: s.tx + GH_ORIGIN.x / TILE, ty: s.ty + GH_ORIGIN.y / TILE })),
  })),
  chests: (WORLD.chests || []).map((c) => ({ ...c, x: gx(c.tx), y: gy(c.ty) })),
  // Phase-3 ART (restore discrete-v3 gold standard on the overworld; RESIDENT atlas):
  widthTiles: WORLD.widthTiles, heightTiles: WORLD.heightTiles,
  originTile: { x: GH_ORIGIN.x / TILE, y: GH_ORIGIN.y / TILE },
  terrain: WORLD.terrain,                       // autotile patches (gravel plaza/road/dirt lanes/soil) — local tiles
  decalLayers: [WORLD.dirt, WORLD.decals, WORLD.ferns],   // lived-in scatter (dirt patches, tufts/flowers, ferns)
  pond: WORLD.pond,                             // the SW brook (banked pool) — local tiles
};

// ---- ASHEN MARSH — the low wet basin, placed WEST of Greenhollow (geography §2.1a).
// Its EAST edge sits ~10 tiles west of Greenhollow's WEST edge = the green→bog belt.
// Combat is LIVE here (NOT a safe zone); Mirefen around Elder Yssa is a no-aggro hub.
const M_W = MARSH.widthTiles, M_H = MARSH.heightTiles;
const MARSH_ORIGIN = { x: (GH_ORIGIN.x / TILE - 10 - M_W) * TILE, y: GH_ORIGIN.y + 5 * TILE };  // east edge 10 tiles W of Greenhollow
const mx = (tx) => MARSH_ORIGIN.x + tx * TILE;
const my = (ty) => MARSH_ORIGIN.y + ty * TILE;
const MARSH_OT = { x: MARSH_ORIGIN.x / TILE, y: MARSH_ORIGIN.y / TILE };
export const BOG_TINT = MARSH.tint.ground;   // 0x8d9a6e — the murky bog ground colour

export const ASHEN_MARSH = {
  key: 'Marsh',
  origin: MARSH_ORIGIN,
  bounds: { x: MARSH_ORIGIN.x, y: MARSH_ORIGIN.y, w: M_W * TILE, h: M_H * TILE },
  safeZone: false,                              // COMBAT LIVE
  bog: true,
  player: { x: mx(MARSH.player.tx), y: my(MARSH.player.ty) },
  props: MARSH.props.map((p) => ({ ...p, x: mx(p.tx), y: my(p.ty), tint: MARSH.tint.tree && /tree/.test(p.key) ? MARSH.tint.tree : p.tint })),
  npcs: MARSH.npcs.map((n) => ({
    ...n, x: mx(n.tx), y: my(n.ty),
    schedule: (n.schedule || []).map((s) => ({ ...s, tx: s.tx + MARSH_OT.x, ty: s.ty + MARSH_OT.y })),
  })),
  chests: [],
  // COMBAT — enemy placements at ABSOLUTE WORLD TILES so EnemyController.spawn (tx*TILE)
  // lands them in world-coords; stable placeId per placement for kill-deltas.
  combat: {
    enabled: true,
    enemies: MARSH.enemies.map((e) => ({ id: e.id, tx: e.tx + MARSH_OT.x, ty: e.ty + MARSH_OT.y, placeId: `marsh_${e.id}_${e.tx}_${e.ty}` })),
    safe: { x: mx(MARSH.combatSpawn ? 20 : 20), y: my(17), r: 6 * TILE },   // Mirefen hub (around Yssa)
    bossSpawn: { tx: MARSH.bossSpawn.tx + MARSH_OT.x, ty: MARSH.bossSpawn.ty + MARSH_OT.y },
    spawn: { x: mx(MARSH.combatSpawn.tx), y: my(MARSH.combatSpawn.ty) },
  },
  shrine: MARSH.shrine ? { x: mx(MARSH.shrine.tx), y: my(MARSH.shrine.ty), name: MARSH.shrine.name } : null,
  pools: (MARSH.pools || []).map((p) => ({ ...p })),     // local tiles (offset at render)
  decalLayers: [MARSH.mud, MARSH.decals],
  waterTint: MARSH.tint.water, decalTint: MARSH.tint.decal,
  bogTint: BOG_TINT,
};

export const REGIONS = [GREENHOLLOW, ASHEN_MARSH];
const inBounds = (b, x, y) => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h;
/** The region whose bounds contain (x,y), or null (the green/bog belt between). */
export function regionAt(x, y) { for (const R of REGIONS) if (inBounds(R.bounds, x, y)) return R; return null; }
/** Is a world point inside Greenhollow's (safe) bounds? */
export function inGreenhollow(x, y) { return inBounds(GREENHOLLOW.bounds, x, y); }
export function inMarsh(x, y) { return inBounds(ASHEN_MARSH.bounds, x, y); }

// ---- THE GREEN→BOG SEAM: a CONTINUOUS ground-tint gradient (no per-chunk step).
// 0 (Greenhollow grass) east of the belt → 1 (bog) at/within Marsh. Lerps the grass
// toward BOG_TINT across the ~10-tile belt, gated to the regions' shared latitude band.
function bogness(x, y) {
  if (inMarsh(x, y)) return 1;
  const mEast = ASHEN_MARSH.bounds.x + ASHEN_MARSH.bounds.w, gWest = GREENHOLLOW.bounds.x;
  // only in the E–W corridor at the regions' latitude (else stays green)
  const yb = ASHEN_MARSH.bounds, band = (y >= yb.y - CHUNK_PX && y < yb.y + yb.h + CHUNK_PX);
  if (!band || x >= gWest) return 0;
  if (x <= mEast) return 1;
  return Math.max(0, Math.min(1, (gWest - x) / (gWest - mEast)));
}
const lerpCh = (a, b, t) => Math.round(a + (b - a) * t);
/** Ground tint for a chunk centre — grass (0xffffff) → BOG_TINT across the seam. */
export function groundTintAt(x, y) {
  const t = bogness(x, y); if (t <= 0) return 0xffffff;
  const br = (BOG_TINT >> 16) & 255, bg = (BOG_TINT >> 8) & 255, bb = BOG_TINT & 255;
  return (lerpCh(255, br, t) << 16) | (lerpCh(255, bg, t) << 8) | lerpCh(255, bb, t);
}
export { bogness };

// a tiny seeded PRNG so each chunk's content is DETERMINISTIC (stable across reloads
// + identical for the same chunk every time it streams in — required for delta ids).
function rngFor(cx, cy) {
  let a = ((cx * 73856093) ^ (cy * 19349663)) >>> 0;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const PROP_KINDS = ['prop_tree_oak', 'prop_tree_pine', 'prop_bush'];

/**
 * The content of one chunk, fully derived from its (cx,cy) — RESIDENT real art only.
 * Returns world-coord positions. `id`s are STABLE per chunk so SaveManager deltas
 * (picked orbs) match on reload.
 */
const DECAL_KINDS = ['decal_clover', 'decal_flower_pink', 'decal_flower_white', 'decal_flower_blue', 'decal_tuft', 'decal_grass_lush'];
// chunk-distance from Greenhollow's bounds (0 = adjacent/over the village) — drives
// the green-belt treeline density RAMP so the depth-band BLEEDS outward (dense at the
// village edge → thinning into open belt), not a hard wall.
function distToGreenhollowChunks(cx, cy) {
  const b = GREENHOLLOW.bounds;
  const c0x = Math.floor(b.x / CHUNK_PX), c1x = Math.floor((b.x + b.w) / CHUNK_PX);
  const c0y = Math.floor(b.y / CHUNK_PX), c1y = Math.floor((b.y + b.h) / CHUNK_PX);
  const dx = cx < c0x ? c0x - cx : cx > c1x ? cx - c1x : 0;
  const dy = cy < c0y ? c0y - cy : cy > c1y ? cy - c1y : 0;
  return Math.max(dx, dy);
}

const BOG_DECALS = ['decal_fern', 'decal_fern', 'decal_dirt_patch', 'decal_tuft', 'decal_grass_tall'];   // reedy/muddy bog dressing

export function chunkContent(cx, cy) {
  const rnd = rngFor(cx, cy);
  const ox = cx * CHUNK_PX, oy = cy * CHUNK_PX, cxp = ox + CHUNK_PX / 2, cyp = oy + CHUNK_PX / 2;
  const bog = bogness(cxp, cyp);                                  // 0 green belt → 1 bog (the seam)
  // GREEN-BELT treeline that BLEEDS from the village (thins outward); the wet bog belt
  // thins trees further (a soggy reedy fringe, not woodland).
  const d = distToGreenhollowChunks(cx, cy);
  const ramp = (d <= 0 ? 0 : Math.max(0.35, 1 - (d - 1) * 0.22)) * (1 - 0.6 * bog);
  const props = [];
  const count = Math.round((10 + rnd() * 10) * ramp);
  for (let i = 0; i < count; i++) {
    const key = bog > 0.5 ? 'prop_tree_pine' : PROP_KINDS[(rnd() * PROP_KINDS.length) | 0];   // pines toward the bog
    props.push({ key, x: ox + rnd() * CHUNK_PX, y: oy + rnd() * CHUNK_PX });
  }
  // GROUND DRESSING — flowers/tufts in green; reeds/mud toward the bog (seam bleed)
  const decals = [];
  const dn = 4 + Math.floor(rnd() * 6);
  for (let i = 0; i < dn; i++) {
    const pool = rnd() < bog ? BOG_DECALS : DECAL_KINDS;
    decals.push({ key: pool[(rnd() * pool.length) | 0], x: ox + rnd() * CHUNK_PX, y: oy + rnd() * CHUNK_PX });
  }
  return { props, decals };
}
