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

// ============================================================================
// WEST BELT — the Greenhollow→Marsh terrain-CHANNELLED ROUTE (§2.1b; replaces the
// open-field chunkContent scatter that VIOLATED the no-open-expanse gate). A winding
// LANE walled by treelines + bush undergrowth + water carves the 10×34-tile corridor
// into a route the player FLOWS along (never an open meadow). It FORKS at a junction:
// a NORTH scenic branch (skirts a pond, past a see-but-can't-reach island cache =
// §2.5 tease→payoff, gated on a future water-crossing tool [ENGINE]) and a SOUTH
// direct branch (toward the Mirefen hub); a short SPUR hides a reachable cache
// (reward-for-looking). Safe travel corridor — combat stays in Marsh (no enemies, the
// odd path-side traveller allowed). Everything off the lane is SOLID = real channels.
// FLAG: no rock/cliff prop exists → channelling uses treelines + bush walls + water;
// true verticality (ledges/cliffs) is [ENGINE], deferred. A proper autotiled trail
// surface traces the lane (dirt feathered into grass = Gate D).
// ============================================================================
const BELT_ORIGIN = { x: ASHEN_MARSH.bounds.x + ASHEN_MARSH.bounds.w, y: ASHEN_MARSH.bounds.y }; // (4800, 5280) — Marsh east edge → GH west edge
const BW = 10, BH = 34;
const blx = (tx) => BELT_ORIGIN.x + tx * TILE, bly = (ty) => BELT_ORIGIN.y + ty * TILE;
const BELT_OT = { x: BELT_ORIGIN.x / TILE, y: BELT_ORIGIN.y / TILE };

// lane centrelines in belt-local tiles (x: 0=west/Marsh … 9=east/Greenhollow)
const _TRUNK = [[9, 13], [8, 13.3], [7, 14], [6.4, 15]];                                           // entry from the GH W-trailhead → the junction
const _NORTH = [[6.4, 15], [6, 13], [5.6, 11.6], [5, 11], [4.2, 11], [3.3, 11.2], [2.4, 11.3], [1.4, 11.3], [0, 11.3]]; // scenic: skirts BELOW the pond (a solid-bush row seals the water+island tease), exits to upper Marsh
const _SOUTH = [[6.4, 15], [6, 17], [5.6, 19], [5, 20], [4, 20.2], [3, 19.6], [2, 18.8], [1, 18.4], [0, 18.2]];     // direct: drops toward the Mirefen hub
const _SPUR = [[4, 20.2], [4.1, 22], [4.2, 23.4]];                                                 // short dead-end spur → the hidden cache
const _LANES = [_TRUNK, _NORTH, _SOUTH, _SPUR];
const _POND = { tx: 1, ty: 4, w: 4, h: 4 };          // scenic pond (north) — holds the tease island cache
const _REED = { tx: 0, ty: 21, w: 3, h: 3 };          // reedy pool toward the bog (SW)
const _BELT_POOLS = [_POND, _REED];
const LANE_R = 1.18;                                   // lane half-width in tiles (~2.3-tile walkable channel)

function _distToSeg(px, py, a, b) {
  const vx = b[0] - a[0], vy = b[1] - a[1], wx = px - a[0], wy = py - a[1], L = vx * vx + vy * vy;
  let t = L ? (wx * vx + wy * vy) / L : 0; t = Math.max(0, Math.min(1, t));
  return Math.hypot(a[0] + t * vx - px, a[1] + t * vy - py);
}
const _laneDist = (x, y) => { let m = 99; for (const p of _LANES) for (let i = 0; i < p.length - 1; i++) m = Math.min(m, _distToSeg(x, y, p[i], p[i + 1])); return m; };
const _inPool = (x, y) => _BELT_POOLS.some((p) => x >= p.tx - 0.5 && x < p.tx + p.w + 0.5 && y >= p.ty - 0.5 && y < p.ty + p.h + 0.5);

// COLLISION is decoupled from the prop footprints. A prop's solid body is only ~12px
// tall inside a 32px tile, so a row of bushes leaves ~20px vertical SEAMS the hero slips
// through when walking horizontally at a seam y (the bug we hit — the player strolled
// straight through the "wall"). Instead the walls are built as CONTIGUOUS invisible
// 32×32 tile COLLIDERS (R.colliders → _buildRegion) over every non-lane tile, so the
// lane is sealed in ALL directions with no seams; the bushes/trees are pure VISUALS
// (non-solid) layered on top (oaks green/east → pines bog/west, matching the seam).
const _beltGrid = (() => {
  const walk = [], water = [];
  for (let y = 0; y < BH; y++) { walk[y] = []; water[y] = []; for (let x = 0; x < BW; x++) { walk[y][x] = _laneDist(x, y) <= LANE_R; water[y][x] = _inPool(x, y); } }
  return { walk, water };
})();
function _buildBeltProps() {
  const props = [];
  const { walk, water } = _beltGrid;
  let seed = 0x5eedface >>> 0; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let y = 0; y < BH; y++) for (let x = 0; x < BW; x++) {
    if (walk[y][x] || water[y][x]) continue;
    const bog = x <= 4;                                  // west half = bog (pines/reed tint), east = green (oak)
    props.push({ key: 'prop_bush', x: blx(x), y: bly(y), solid: false, tint: bog ? 0x97a76b : undefined });   // visual undergrowth (collision is the tile-collider)
    if (rnd() < 0.46) props.push({ key: bog ? 'prop_tree_pine' : 'prop_tree_oak', x: blx(x) + (rnd() * 12 - 6), y: bly(y) + (rnd() * 8 - 10), solid: false, tint: bog ? 0x8d9a6e : undefined }); // canopy
  }
  // landmark: a weathered trail WAYSTONE at the junction (diegetic wayfinding)
  props.push({ key: 'prop_sign', x: blx(6.5) + 6, y: bly(15.6), solid: false });
  // TEASE → PAYOFF (§2.5): a chest you can SEE on the pond island but can't reach yet
  // (no swim/raft = [ENGINE] water-crossing gate). Visual only — NOT an interactable.
  props.push({ key: 'prop_chest', x: blx(2.4), y: bly(5.6), solid: false });
  return props;
}

// The CHANNEL collision: one contiguous invisible TILE collider per non-lane tile (off-
// lane wood + pond water), so the lane is sealed with no seams. Returns world-centre rects.
function _buildBeltColliders() {
  const { walk, water } = _beltGrid, rects = [];
  for (let y = 0; y < BH; y++) for (let x = 0; x < BW; x++) {
    if (walk[y][x]) continue;                              // the lane stays open (incl. its Marsh/GH openings)
    rects.push({ x: blx(x) + TILE / 2, y: bly(y) + TILE / 2, w: TILE, h: TILE });   // off-lane wood OR water → solid
  }
  return rects;
}

export const WEST_BELT = {
  key: 'Belt',
  origin: BELT_ORIGIN,
  bounds: { x: BELT_ORIGIN.x, y: BELT_ORIGIN.y, w: BW * TILE, h: BH * TILE },
  safeZone: true,                                        // travel corridor — combat stays in Marsh
  widthTiles: BW, heightTiles: BH,
  originTile: BELT_OT,
  // worn-dirt TRAIL traced along the lane (autotiler feathers it into grass = Gate D)
  terrain: { patches: [{ set: 'dirt', rects: [
    [7, 13, 2, 2], [6, 14, 1, 2],                                       // trunk + junction
    [5, 11, 2, 2], [4, 9, 2, 1], [3, 9, 1, 1], [2, 10, 2, 1],          // north branch
    [5, 16, 2, 3], [3, 18, 3, 1], [1, 18, 2, 1],                        // south branch
    [4, 20, 1, 4],                                                       // the hidden-cache spur
  ] }] },
  props: _buildBeltProps(),
  colliders: _buildBeltColliders(),                       // invisible tile-colliders = the channel walls
  pools: _BELT_POOLS,
  waterTint: 0x6f86a0, decalTint: null,
  decalLayers: [
    { seed: 0x10ad, count: 46, pool: ['decal_tuft', 'decal_grass_lush', 'decal_clover', 'decal_fern', 'decal_flower_white'] }, // lush foliage dressing
    { seed: 0x20ad, count: 18, pool: ['decal_fern', 'decal_grass_tall', 'decal_dirt_patch'] },                                  // reedy/muddy toward the bog
  ],
  // REACHABLE secret (reward-for-looking): a cache hidden at the end of the south spur
  chests: [{ id: 'belt_cache', x: blx(4.2), y: bly(23.2), gold: 30, line: 'Tucked off the trail in a hollow of bramble — a traveller\'s forgotten cache. Thirty gold.' }],
  // the odd path-side TRAVELLER (safe spot near the GH trailhead — never in monster territory)
  npcs: [{
    name: 'Joss', x: blx(8), y: bly(12.2), facing: 'left', speed: 0, expression: 'neutral',
    parts: ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_parted_gray', 'shirt_leather', 'pants_brown', 'shoes_brown'],
    greeting: [
      'Off to the marsh? Mind the low road — it forks past the old pond.',
      'Take the south branch for the village folk; the north way\'s prettier but it runs wild.',
      'There\'s a chest out on the pond I\'ve never reached. Some day, with the right trick…',
    ],
  }],
};

export const REGIONS = [GREENHOLLOW, ASHEN_MARSH, WEST_BELT];
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
