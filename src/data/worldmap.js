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
export function chunkContent(cx, cy) {
  const rnd = rngFor(cx, cy);
  const ox = cx * CHUNK_PX, oy = cy * CHUNK_PX;
  // a gentle biome tint by position (continuity read; real per-tile terrain comes with regions)
  const tint = (() => {
    const u = cx / WORLD_CHUNKS, v = cy / WORLD_CHUNKS;
    const r = 150 + 60 * u, g = 170 + 50 * v, b = 140 + 40 * (1 - u);
    return (Math.min(255, r) << 16) | (Math.min(255, g) << 8) | Math.min(255, b);
  })();
  const props = [];
  const count = 6 + Math.floor(rnd() * 8);     // 6–13 real props per chunk
  for (let i = 0; i < count; i++) {
    props.push({ key: PROP_KINDS[(rnd() * PROP_KINDS.length) | 0], x: ox + rnd() * CHUNK_PX, y: oy + rnd() * CHUNK_PX });
  }
  // test PICKUP orbs (the delta-round-trip proof) — 0–2 per chunk, stable ids
  const pickups = [];
  const pn = (rnd() < 0.5) ? 1 : (rnd() < 0.5 ? 2 : 0);
  for (let i = 0; i < pn; i++) {
    pickups.push({ id: `orb_${cx}_${cy}_${i}`, x: ox + 200 + rnd() * (CHUNK_PX - 400), y: oy + 200 + rnd() * (CHUNK_PX - 400) });
  }
  return { tint, props, pickups };
}
