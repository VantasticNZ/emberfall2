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

/** Is a world point inside Greenhollow's (safe) bounds? */
export function inGreenhollow(x, y) {
  const b = GREENHOLLOW.bounds;
  return x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h;
}

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

export function chunkContent(cx, cy) {
  const rnd = rngFor(cx, cy);
  const ox = cx * CHUNK_PX, oy = cy * CHUNK_PX;
  // GREEN-BELT treeline that BLEEDS from the village: densest in the ring hugging
  // Greenhollow, thinning with distance (a continuous treeline, not a wall).
  const d = distToGreenhollowChunks(cx, cy);
  const ramp = d <= 0 ? 0 : Math.max(0.35, 1 - (d - 1) * 0.22);   // d1 dense → far sparse
  const props = [];
  const count = Math.round((10 + rnd() * 10) * ramp);
  for (let i = 0; i < count; i++) {
    props.push({ key: PROP_KINDS[(rnd() * PROP_KINDS.length) | 0], x: ox + rnd() * CHUNK_PX, y: oy + rnd() * CHUNK_PX });
  }
  // lived-in BELT flowers/tufts (FLOOR-pinned ground dressing — a gentle scatter)
  const decals = [];
  const dn = 4 + Math.floor(rnd() * 6);
  for (let i = 0; i < dn; i++) decals.push({ key: DECAL_KINDS[(rnd() * DECAL_KINDS.length) | 0], x: ox + rnd() * CHUNK_PX, y: oy + rnd() * CHUNK_PX });
  return { props, decals };
}
