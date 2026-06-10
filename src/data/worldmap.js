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
import { PEAKS } from './peaks.js';

export const TILE = 32;
export const CHUNK = 32;                       // tiles per chunk side
export const CHUNK_PX = CHUNK * TILE;          // 1024 px
export const WORLD_CHUNKS = 20;                // 20×20 chunks (WORLD-BLUEPRINT decision B: enlarged 16→20…
export const WORLD_PX = WORLD_CHUNKS * CHUNK_PX; // …= 20480 px / 640 tiles, so regions radiate SYMMETRICALLY from a centred hub)

// =============================================================================
// REGIONS — settlements/areas placed at WORLD-COORD offsets (Phase 2 migration).
// A region is a cohesive unit (buildings + cast + chests) loaded as one when the
// player enters its bounds; the terrain/green-belt still streams per-chunk. The
// data is the EXISTING discrete-region data, re-expressed in world-coords (offset
// by the region origin) — same canonical ids, same cast, same quests. Greenhollow
// sits at the CENTRE of the world (WORLD-BLUEPRINT decision B), ringed by green belt,
// so the other regions radiate out symmetrically (no NW bias).
// =============================================================================
// WORLD-BLUEPRINT decision B (re-centre): Greenhollow at chunk (9,9) = tile (288,288) of
// the 20×20 world → its centre ~(314,308) ≈ world centre (320,320), so Marsh(W)/Peaks(N)/
// Coast(E)/Emberwood(S)/Spire(far-N) radiate with even room. Was chunk (5,5) (NW-biased).
// Everything below (Marsh, Belt) is RELATIVE to this origin, so they shift as one coherent
// move. The +4-chunk (+4096px) shift is migrated for old saves (SaveManager v2→v3).
const GH_ORIGIN = { x: 9 * CHUNK_PX, y: 9 * CHUNK_PX };   // world px of Greenhollow tile (0,0) — CENTRED
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
  // M4 — THE BOARDED CAVE (gating.js tease `boarded_cave_m4` → tool_lantern). Sealed/black until
  // you carry the lantern earned in the Marsh; entering grants `cave_lore` (the ending-A seed —
  // the weeping-flame carving). ⚑ ART: prop_cliff_face is a cave-mouth STAND-IN (dark-tinted) —
  // a proper boarded-cave sprite is an art need (flag for Van's eye). Placement = SE meadow edge.
  interactables: [
    { via: 'gate', key: 'prop_cliff_face', x: gx(44) + TILE / 2, y: gy(31) + TILE / 2, id: 'm4_boarded_cave',
      solid: true, tint: 0x4b4a55, prompt: 'The boarded cave', locked: 'tool_lantern', grantsDeeds: ['cave_lore'],
      lockedLine: "The cave mouth is boarded and black inside. A plank hangs loose — but it's far too dark to go further without a light.",
      lines: ["You squeeze the lantern through the loose plank. Inside it's cold and far too quiet — and there, scratched deep into the stone: a flame, weeping, tears running down the rock. The first seed of the god's truth. You understood nothing as a child. You understand more now."] },
    // PHASE-0 interior doors (the area-transition test): enter buildings/caves → separate interiors.
    { via: 'door', key: 'prop_door', solid: false, x: gx(33) + TILE / 2, y: gy(15) + TILE / 2, to: 'tankard_f1', prompt: 'Enter the Copper Tankard' },
    { via: 'door', key: 'prop_door', solid: false, x: gx(38) + TILE / 2, y: gy(20) + TILE / 2, to: 'cave_f1', prompt: 'Enter the cave' },
    // PHASE-1 generator doors (re-roll a fresh, navGate-validated dungeon/cave on each entry)
    { via: 'door', key: 'prop_door', solid: false, x: gx(33) + TILE / 2, y: gy(20) + TILE / 2, to: '__gendungeon', prompt: 'Enter a GENERATED dungeon' },
    { via: 'door', key: 'prop_door', solid: false, x: gx(28) + TILE / 2, y: gy(20) + TILE / 2, to: '__gencave', prompt: 'Enter a GENERATED cave' },
    // PHASE-2 building doors — the town's enterable interiors (front-of-building, walkable tile)
    { via: 'door', key: 'prop_door', solid: false, x: gx(10) + TILE / 2, y: gy(26) + TILE / 2, to: 'gh_forge', prompt: "Enter Hodge's forge" },
    { via: 'door', key: 'prop_door', solid: false, x: gx(13) + TILE / 2, y: gy(17) + TILE / 2, to: 'gh_store', prompt: "Enter Pem's store" },
    { via: 'door', key: 'prop_door', solid: false, x: gx(19) + TILE / 2, y: gy(15) + TILE / 2, to: 'gh_chapel', prompt: 'Enter the chapel' },   // FIX: was gy(11) — buried under the 5×5 chapel; now the walkable front step
    { via: 'door', key: 'prop_door', solid: false, x: gx(34) + TILE / 2, y: gy(28) + TILE / 2, to: 'gh_home1', prompt: 'Enter the cottage' },
    { via: 'door', key: 'prop_door', solid: false, x: gx(41) + TILE / 2, y: gy(31) + TILE / 2, to: 'gh_home2', prompt: 'Enter the cottage' },
    // WORLD-LAYOUT board (the halved-scope world — content-sized greybox places, walk each to approve)
    { via: 'door', key: 'prop_door', solid: false, x: gx(7) + TILE / 2, y: gy(37) + TILE / 2, to: 'city_saltbreak', prompt: '→ SALTBREAK (the city)' },
    { via: 'door', key: 'prop_door', solid: false, x: gx(11) + TILE / 2, y: gy(37) + TILE / 2, to: 'town_stonereach', prompt: '→ Stonereach (town)' },
    { via: 'door', key: 'prop_door', solid: false, x: gx(15) + TILE / 2, y: gy(37) + TILE / 2, to: 'town_mirefen', prompt: '→ Mirefen (town)' },
    { via: 'door', key: 'prop_door', solid: false, x: gx(19) + TILE / 2, y: gy(37) + TILE / 2, to: 'vil_fenwick', prompt: '→ Fenwick (village)' },
    { via: 'door', key: 'prop_door', solid: false, x: gx(17) + TILE / 2, y: gy(37) + TILE / 2, to: 'lost_cemetery', prompt: '→ The Lost Cemetery' },
    { via: 'door', key: 'prop_door', solid: false, x: gx(23) + TILE / 2, y: gy(37) + TILE / 2, to: 'vil_cribbins', prompt: '→ Cribbins Cove (village)' },
    { via: 'door', key: 'prop_door', solid: false, x: gx(27) + TILE / 2, y: gy(37) + TILE / 2, to: 'vil_cragfoot', prompt: '→ Cragfoot (village)' },
    { via: 'door', key: 'prop_door', solid: false, x: gx(31) + TILE / 2, y: gy(37) + TILE / 2, to: 'vil_oasis', prompt: '→ Mirage Oasis (village)' },
    { via: 'door', key: 'prop_door', solid: false, x: gx(35) + TILE / 2, y: gy(37) + TILE / 2, to: 'vil_thornwell', prompt: '→ Thornwell (village)' },
    { via: 'door', key: 'prop_door', solid: false, x: gx(39) + TILE / 2, y: gy(37) + TILE / 2, to: 'dgn_shrine', prompt: '→ Sunken Shrine (dungeon)' },
    { via: 'door', key: 'prop_door', solid: false, x: gx(43) + TILE / 2, y: gy(37) + TILE / 2, to: 'dgn_keep', prompt: '→ Cinder Keep (dungeon)' },
  ],
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
export const BOG_TINT = MARSH.tint.ground;   // 0x5a6357 — the eerie murky grey-teal bog ground colour

export const ASHEN_MARSH = {
  key: 'Marsh',
  origin: MARSH_ORIGIN,
  bounds: { x: MARSH_ORIGIN.x, y: MARSH_ORIGIN.y, w: M_W * TILE, h: M_H * TILE },
  safeZone: false,                              // COMBAT LIVE
  bog: true,
  player: { x: mx(MARSH.player.tx), y: my(MARSH.player.ty) },
  props: [
    ...MARSH.props.map((p) => ({ ...p, x: mx(p.tx), y: my(p.ty), tint: MARSH.tint.tree && /tree/.test(p.key) ? MARSH.tint.tree : p.tint })),
    // OVERWORLD TOWN-SITE signposts — name each settlement at its world position (the full town is the
    // enterable area at this spot). FLAG: a town SILHOUETTE (buildings/walls on the overworld) is deferred
    // dressing. Non-solid readable signs (no collision issue; the door tile stays walkable).
    { key: 'prop_sign', x: mx(6) + TILE / 2, y: my(13) + TILE / 2, solid: true, tint: 0x9a8f6a, text: 'MIREFEN — the bog-town. Elder Yssa keeps the moot-hall.' },
    { key: 'prop_sign', x: mx(10) + TILE / 2, y: my(4) + TILE / 2, solid: true, tint: 0x9a8f6a, text: 'THE LOST CEMETERY — they buried the drowned here.' },
    { key: 'prop_sign', x: mx(34) + TILE / 2, y: my(20) + TILE / 2, solid: true, tint: 0x9a8f6a, text: 'FENWICK — a marsh-edge village.' },
  ],
  npcs: MARSH.npcs.map((n) => ({
    ...n, x: mx(n.tx), y: my(n.ty),
    schedule: (n.schedule || []).map((s) => ({ ...s, tx: s.tx + MARSH_OT.x, ty: s.ty + MARSH_OT.y })),
  })),
  chests: [],
  // CONNECTED-OVERWORLD ENTRANCES (Van's map) — you WALK WEST from Greenhollow into the Marsh and reach
  // each settlement AT ITS map position (W→E: Mirefen far-W · Shrine W · Cemetery NW · Fenwick E). The
  // built town content is reused (enter here). The GH notice-board is kept only as optional fast-travel.
  interactables: [
    { via: 'door', key: 'prop_door', solid: false, x: mx(5) + TILE / 2, y: my(13) + TILE / 2, to: 'town_mirefen', prompt: 'Enter Mirefen' },
    { via: 'door', key: 'prop_door', solid: false, x: mx(4) + TILE / 2, y: my(8) + TILE / 2, to: 'dgn_shrine', prompt: 'The Sunken Shrine' },
    { via: 'door', key: 'prop_door', solid: false, x: mx(9) + TILE / 2, y: my(4) + TILE / 2, to: 'lost_cemetery', prompt: 'The Lost Cemetery' },
    { via: 'door', key: 'prop_door', solid: false, x: mx(35) + TILE / 2, y: my(20) + TILE / 2, to: 'vil_fenwick', prompt: 'Enter Fenwick' },
  ],
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
  props.push({ key: 'prop_sign', x: blx(6.5) + 6, y: bly(15.6), solid: false, text: 'WEST BELT — the lowland trail between Greenhollow and the Ashen Marsh. Keep to the dry ridge; the bog drinks the careless.' });
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
  route: true,                                           // a CHANNELLED route (not a settlement) — verify.mjs channelled-not-open gate applies
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

// ============================================================================
// SUNDERED PEAKS — the N region (WORLD-BLUEPRINT §1: reserved x278–353 y206–278).
// Built into x288–348 / y218–278 (60×60): W edge aligned to Greenhollow's, S edge at
// y278 = the foothill-route mouth (the FOOTHILL_ROUTE bridges y278→GH.N y288). A
// mountain BOWL — perimeter + internal CLIFF WALLS (real eliza-terrain cliff_face/rock
// crops, OGA-BY) frame a terraced stone TOWN (a no-aggro hub), the looming CINDER KEEP
// (N — the grapple + shard_2 GRANT, per gating.js), the riven CLEFT ("Sundered") with a
// keep-road pass, a high-pass tarn, scree slopes with LIVE adult combat, and a
// grapple-ledge cache. Mood = a cold stone GROUND TINT (green→stone bleeds across the
// foothill seam) + alpine pines. FLAG (omitted, NOT faked per HARD RULE 9): a proper
// SNOW-cap autotile, a true terraced-stone-town building set, and the gated Spire
// ascent (N) — each wants a targeted art pass before it ships.
// ============================================================================
const PK_W = 60, PK_H = 60;
const PEAKS_ORIGIN = { x: GH_ORIGIN.x, y: (GH_ORIGIN.y / TILE - 10 - PK_H) * TILE }; // S edge (tile 278) = 10 tiles N of GH (the foothill band)
const pkx = (tx) => PEAKS_ORIGIN.x + tx * TILE, pky = (ty) => PEAKS_ORIGIN.y + ty * TILE;
const PEAKS_OT = { x: PEAKS_ORIGIN.x / TILE, y: PEAKS_ORIGIN.y / TILE };
export const STONE_TINT = 0x9ea4b4;   // the cold mountain ground colour (PEAKS.tint.ground)

// cliff WALLS (local tiles [x,y,w,h]) — perimeter ring (S split for the foothill mouth
// at x15..45) + the riven-cleft shoulders (a keep-road pass at x27..33) + work ridges.
// Off-wall is an OPEN walkable bowl — Peaks is a settlement (not a route:true corridor),
// so the open-block gate doesn't apply; the plaza reads as a town, framed by cliffs.
const PK_WALLS = [
  [0, 0, PK_W, 2], [0, 0, 2, PK_H], [PK_W - 2, 0, 2, PK_H],     // N / W / E ring
  [0, PK_H - 2, 15, 2], [45, PK_H - 2, 15, 2],                  // S ring (gap x15..45 = foothill mouth)
  // the riven CLEFT is a FULL cross-wall (W-perimeter→pass and pass→E-perimeter), so the ONLY
  // way from the town (S) up to Cinder Keep (N) is the keep-road through the pass (x27..33). No
  // dashing up the open sides to bypass the path. (was two short shoulders that left the W/E
  // flanks of the upper bowl open — the walk-up-the-sides bug.)
  [2, 14, 25, 9], [33, 14, 25, 9],                            // cleft cross-wall — pass gap x27..33
  [44, 30, 8, 3], [8, 31, 6, 3],                              // quarry / work ridges flanking the town
];
const _pkInWall = (tx, ty) => PK_WALLS.some((w) => tx >= w[0] && tx < w[0] + w[2] && ty >= w[1] && ty < w[1] + w[3]);
const PK_TOWN = { cx: 30, cy: 38 };     // plaza centre (the no-aggro hub)
const PK_KEEP = { tx: 30, ty: 7 };      // Cinder Keep (grapple + shard_2 grant point)
const PK_RECORDS = { tx: 24, ty: 35 };  // the Order's records (SP-lore set-piece)
const PK_TARN = { tx: 6, ty: 7, w: 4, h: 3 };   // high-pass tarn (NW)

function _buildPeaksColliders() {
  const rects = [];
  for (let y = 0; y < PK_H; y++) for (let x = 0; x < PK_W; x++) {
    if (_pkInWall(x, y)) rects.push({ x: pkx(x) + TILE / 2, y: pky(y) + TILE / 2, w: TILE, h: TILE });
  }
  return rects;
}
function _buildPeaksProps() {
  const props = [];
  let seed = 0x9eed01 >>> 0; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  // (Cliffs are no longer scattered single props — they render as a CONTINUOUS face via
  //  R.cliffWalls + the scene cliff RenderTexture, QUALITY-SPEC C1.)
  // SCREE / BOULDERS + alpine PINES strewn across the rock bowl (density to the wild band +
  // cover for combat), avoiding the walls, the plaza, the keep-road pass and the foothill
  // mouth. On a step-2 grid (denser than before) so screens hit the wild density band.
  for (let y = 4; y < PK_H - 3; y += 2) for (let x = 4; x < PK_W - 3; x += 2) {
    if (_pkInWall(x, y)) continue;
    if (Math.hypot(x - PK_TOWN.cx, y - PK_TOWN.cy) < 8) continue;     // keep the plaza clear (now SOLID scatter, so clear it wider)
    if (x > 26 && x < 34) continue;                                  // keep the WHOLE keep-road corridor clear (N↔keep) — solid obstacles must not block the path
    if (x > 14 && x < 46 && y > PK_H - 11) continue;                  // keep the foothill mouth + town approach clear
    const r = rnd();
    // SOLID obstacles on the slopes (the bowl ground stays walkable, but you can't walk THROUGH
    // boulders/pines/crags) — kills the "walk through objects" hole.
    if (r < 0.4) props.push({ key: r < 0.22 ? 'prop_rock_boulder' : 'prop_rock_small', x: pkx(x) + (rnd() * 12 - 6), y: pky(y) + (rnd() * 8 - 4), solid: true, tint: 0xc2c6cf });
    else if (r < 0.62) props.push({ key: 'prop_tree_pine', x: pkx(x) + (rnd() * 12 - 6), y: pky(y) + (rnd() * 8 - 4), solid: true, tint: 0x8a96a0 });
    else if (r < 0.70) props.push({ key: 'prop_rock_crag', x: pkx(x) + (rnd() * 10 - 5), y: pky(y) + (rnd() * 6 - 3), solid: true, tint: 0xb6bac4 }); // the odd standing crag
  }
  // TERRACED STONE TOWN (stone-tinted LPC structures — FLAG: a true terraced stone-town
  // set is wanted) + the town well.
  // Buildings FLANK the central keep-road corridor (x29–31) — never ON it — so the dirt road from
  // the town up through the cleft pass to Cinder Keep is a clear, walkable, obvious path.
  props.push({ key: 'prop_forge', x: pkx(23) + TILE / 2, y: pky(33) + TILE / 2, solid: true, tint: 0x8f97a8 });        // town hall (W flank)
  props.push({ key: 'prop_house_b', x: pkx(20) + TILE / 2, y: pky(40) + TILE / 2, solid: true, tint: 0x9aa0b4 });
  props.push({ key: 'prop_house_paneled', x: pkx(40) + TILE / 2, y: pky(40) + TILE / 2, solid: true, tint: 0x9aa0b4 });
  props.push({ key: 'prop_forge', x: pkx(15) + TILE / 2, y: pky(42) + TILE / 2, solid: true, tint: 0x8f97a8 });        // stoneworks
  props.push({ key: 'prop_fountain', x: pkx(37) + TILE / 2, y: pky(41) + TILE / 2, solid: true });                     // the town well (E flank)
  props.push({ key: 'prop_barrel', x: pkx(27) + TILE / 2, y: pky(44) + TILE / 2, solid: true });
  props.push({ key: 'prop_barrel', x: pkx(33) + TILE / 2, y: pky(44) + TILE / 2, solid: true });
  props.push({ key: 'prop_fence', x: pkx(25) + TILE / 2, y: pky(46) + TILE / 2, solid: true });
  props.push({ key: 'prop_fence', x: pkx(35) + TILE / 2, y: pky(46) + TILE / 2, solid: true });
  // CINDER KEEP — looming, dark, behind the cleft (N). The grapple / shard_2 grant point.
  props.push({ key: 'prop_forge', x: pkx(PK_KEEP.tx) + TILE / 2, y: pky(PK_KEEP.ty) + TILE / 2, solid: true, tint: 0x5f6675, scale: 1.7 });
  // diegetic signs: the town entrance + the riven cleft
  props.push({ key: 'prop_sign', x: pkx(30) + TILE / 2, y: pky(48) + TILE / 2, solid: false, text: 'THE TOWN RING — no blades drawn within. Rest, trade, and warm yourself. The fighting stays on the slopes.' });
  props.push({ key: 'prop_sign', x: pkx(30) + TILE / 2, y: pky(25) + TILE / 2, solid: false, text: 'CINDER KEEP — the Sentinel guards the way to Shard II. Steel and steady footing past this point.' });
  return props;
}

// re-place the canonical discrete cast (peaks.js) into the town — keep ALL quest/social/
// greeting DATA (the SSOT), only override positions for the larger world layout.
const PK_CAST_POS = { Miner: [29, 37], 'Mike Hunt': [34, 36], 'Desperate Stranger': [20, 41], 'Bounty-Master': [36, 38], Stonewright: [25, 34] };

export const SUNDERED_PEAKS = {
  key: 'Peaks',
  origin: PEAKS_ORIGIN,
  bounds: { x: PEAKS_ORIGIN.x, y: PEAKS_ORIGIN.y, w: PK_W * TILE, h: PK_H * TILE },
  safeZone: false,                       // COMBAT LIVE on the slopes (the town ring is no-aggro)
  mountain: true,
  widthTiles: PK_W, heightTiles: PK_H,
  originTile: PEAKS_OT,
  mapColor: 0x6d7280,                    // stone-grey on the minimap
  player: { x: pkx(30) + TILE / 2, y: pky(47) + TILE / 2 },
  // GROUND = real ROCK terrain (Rock_Gray autotile), NOT stone-tinted grass (QUALITY-SPEC C2).
  // rock fills the whole bowl; snow dusts the high N slope; stone = the terraced town floor;
  // dirt = the roads + the foothill mouth. All from the shipped terrain-v7 atlas (wire, not source).
  terrain: { patches: [
    { set: 'rock',  rects: [[0, 0, PK_W, PK_H]] },              // the mountain bowl ground
    { set: 'snow',  rects: [[3, 2, PK_W - 6, 9]] },             // snow-dusted high N slope (below the N cliffs)
    { set: 'stone', rects: [[22, 32, 16, 13]] },               // the terraced town floor
    { set: 'dirt',  rects: [
      [29, 24, 3, 10],                   // keep-road: town → cleft pass
      [29, 9, 3, 7],                     // the keep approach
      [27, 45, 7, 13],                   // the foothill mouth rising into town
      [45, 31, 6, 4],                    // the quarry-road spur (E)
    ] },
  ] },
  cliffWalls: PK_WALLS,                  // → continuous cliff RenderTexture (C1)
  props: _buildPeaksProps(),
  colliders: _buildPeaksColliders(),
  pools: [PK_TARN],
  waterTint: 0xbfe0ec,                   // a pale ICY tarn (the high-pass frozen pool)
  decalLayers: [
    { seed: 0x70123, count: 60, pool: ['decal_dirt_patch', 'decal_tuft', 'decal_dirt_patch'] },  // scree/rubble dressing
    { seed: 0x5151, count: 36, pool: ['decal_dirt_patch'] },
  ],
  decalTint: 0xb6bac4,
  chests: [
    { id: 'peaks_quarry_cache', x: pkx(49) + TILE / 2, y: pky(34) + TILE / 2, gold: 45, line: 'A quarryman\'s lockbox wedged in the scree — forty-five gold.' },
  ],
  // INTERACTABLES (cut / push / search) — the playground layer (INTERACTABLES-DESIGN).
  // Placed in the open town plaza (clear of the keep-road corridor + buildings).
  interactables: [
    { via: 'search', key: 'prop_barrel', x: pkx(24) + TILE / 2, y: pky(40) + TILE / 2, id: 'peaks_barrel_w', loot: 'loot_barrel', solid: true, prompt: 'Search the barrel' },
    { via: 'search', key: 'prop_barrel', x: pkx(36) + TILE / 2, y: pky(40) + TILE / 2, id: 'peaks_barrel_e', loot: 'loot_barrel', solid: true, prompt: 'Search the barrel' },
    { via: 'push', key: 'prop_rock_small', x: pkx(24) + TILE / 2, y: pky(36) + TILE / 2, id: 'peaks_block', solid: true, prompt: 'Push the stone' },
    // cuttable bushes are now CLASS-driven (the sword swing cuts ANY bush in EVERY region — the
    // Peaks scatter + GH hedges are all cuttable); no per-placement via:'cut' needed.
  ],
  combat: {
    enabled: true,
    enemies: [
      { id: 'charger', tx: PEAKS_OT.x + 16, ty: PEAKS_OT.y + 25, placeId: 'peaks_charger' },          // Crag Ram
      { id: 'shielded', tx: PEAKS_OT.x + 44, ty: PEAKS_OT.y + 25, placeId: 'peaks_shielded' },        // Order Revenant
      { id: 'ranged', tx: PEAKS_OT.x + 12, ty: PEAKS_OT.y + 17, placeId: 'peaks_ranged' },            // Crag Archer
      { id: 'brute', tx: PEAKS_OT.x + 46, ty: PEAKS_OT.y + 17, placeId: 'peaks_brute' },              // Stone Ogre
      { id: 'charger_electric', tx: PEAKS_OT.x + 30, ty: PEAKS_OT.y + 19, placeId: 'peaks_storm' },   // Storm Crawler (cleft)
      { id: 'swarm', tx: PEAKS_OT.x + 22, ty: PEAKS_OT.y + 29, placeId: 'peaks_swarm' },              // crag bats
    ],
    safe: { x: pkx(30) + TILE / 2, y: pky(40) + TILE / 2, r: 8 * TILE },   // the town no-aggro hub
    spawn: { x: pkx(30) + TILE / 2, y: pky(47) + TILE / 2 },               // respawn at the town gate
  },
  keep: { x: pkx(PK_KEEP.tx) + TILE / 2, y: pky(PK_KEEP.ty) + TILE / 2, name: 'Cinder Keep' },
  records: { x: pkx(PK_RECORDS.tx) + TILE / 2, y: pky(PK_RECORDS.ty) + TILE / 2, name: "the Order's records" },
  npcs: PEAKS.npcs.map((n) => {
    const [lx, ly] = PK_CAST_POS[n.name] || [n.tx, n.ty];
    return { ...n, x: pkx(lx) + TILE / 2, y: pky(ly) + TILE / 2,
      schedule: (n.schedule || []).map((s) => ({ ...s, tx: s.tx + PEAKS_OT.x, ty: s.ty + PEAKS_OT.y })) };
  }),
};

// ============================================================================
// FOOTHILL ROUTE — the GH↔Peaks channelled, LEGIBLE, FORKING lane (WORLD-BLUEPRINT
// §2: a framed lane that READS as the way up — NOT an open field; the Phase-5b lesson).
// Bridges GH's NORTH edge (y288) to the Peaks SOUTH mouth (y278) — the 10-tile foothill
// band. A trunk from the GH N-trailhead (~x313) rises, then FORKS: a gentle QUARRY-ROAD
// (NW, to the mine/town) vs a steeper KEEP-ROAD (NE, toward Cinder Keep); a short SPUR
// hides a cache. Walled by cliff faces + scrub (off-lane = solid tile-colliders, no
// seams). ENTRY GATE: a fresh ROCKFALL seals the Peaks mouth until you bear shard_1
// (the Marsh truth) — gating.js: Peaks requires shard_1. No soft-lock (shard_1 is earned
// in the open Marsh). Safe travel corridor (combat stays in the Peaks).
// ============================================================================
const FH_W = 30, FH_H = 10;
const FOOTHILL_ORIGIN = { x: (GH_ORIGIN.x / TILE + 15) * TILE, y: (GH_ORIGIN.y / TILE - FH_H) * TILE }; // x303..333 (= Peaks mouth), y278..288 (GH.N)
const fhx = (tx) => FOOTHILL_ORIGIN.x + tx * TILE, fhy = (ty) => FOOTHILL_ORIGIN.y + ty * TILE;
const FH_OT = { x: FOOTHILL_ORIGIN.x / TILE, y: FOOTHILL_ORIGIN.y / TILE };
// lane centrelines in foothill-local tiles (y: 0=N/Peaks … 9=S/Greenhollow; x: 0..29)
const _FH_TRUNK  = [[10, 9], [10, 7.5], [11, 6.5], [12, 6]];                 // from the GH N-trailhead up to the fork
const _FH_QUARRY = [[12, 6], [10, 5], [8, 3.6], [7, 2], [6, 0.3]];           // gentle: exits NW (mine/town side)
const _FH_KEEP   = [[12, 6], [15, 5], [17, 3.6], [18, 2], [18, 0.3]];        // steeper: exits NE (toward the keep)
const _FH_SPUR   = [[8, 3.6], [6, 3.2], [5, 2.9]];                           // short dead-end spur → the hidden cache
const _FH_LANES = [_FH_TRUNK, _FH_QUARRY, _FH_KEEP, _FH_SPUR];
const _fhLaneDist = (x, y) => { let m = 99; for (const p of _FH_LANES) for (let i = 0; i < p.length - 1; i++) m = Math.min(m, _distToSeg(x, y, p[i], p[i + 1])); return m; };
const FH_LANE_R = 1.2;
const _fhWalk = (() => { const w = []; for (let y = 0; y < FH_H; y++) { w[y] = []; for (let x = 0; x < FH_W; x++) w[y][x] = _fhLaneDist(x, y) <= FH_LANE_R; } return w; })();
function _buildFoothillColliders() {
  const rects = [];
  for (let y = 0; y < FH_H; y++) for (let x = 0; x < FH_W; x++) if (!_fhWalk[y][x]) rects.push({ x: fhx(x) + TILE / 2, y: fhy(y) + TILE / 2, w: TILE, h: TILE });
  return rects;
}
function _buildFoothillProps() {
  const props = [];
  let seed = 0xf007a1 >>> 0; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  // A VARIED, COMPOSED treeline frames the lane (not a hedge of identical pines): per off-lane
  // tile, roll a growth TYPE — big/medium canopy · sapling+undergrowth · low undergrowth-only
  // (a silhouette GAP = breathing room) · the odd crag up high — with size jitter (scale),
  // species mix (oak/pine), and OFF-GRID position jitter (kills the row look). Every off-lane
  // tile is still visually covered; collision stays the invisible tile-collider (channel intact).
  for (let y = 0; y < FH_H; y++) for (let x = 0; x < FH_W; x++) {
    if (_fhWalk[y][x]) continue;
    const stony = y <= 3;                                  // toward the Peaks the growth thins to stony scrub
    const px = fhx(x) + TILE / 2 + (rnd() * 16 - 8), py = fhy(y) + TILE / 2 + (rnd() * 12 - 6);
    const coolPine = stony ? 0x9aa6ae : undefined, coolBush = stony ? 0x9aa0a8 : undefined;
    const r = rnd();
    if (stony && r < 0.22) {
      props.push({ key: 'prop_rock_crag', x: px, y: py + TILE / 2, solid: false, tint: STONE_TINT, scale: 0.65 + rnd() * 0.4 });
    } else if (r < 0.48) {                                 // BIG / MEDIUM canopy
      const big = rnd() < 0.45, pine = stony || rnd() < 0.5;
      props.push({ key: pine ? 'prop_tree_pine' : 'prop_tree_oak', x: px, y: py + TILE / 2, solid: false, flip: rnd() < 0.5, scale: big ? 1.08 + rnd() * 0.32 : 0.82 + rnd() * 0.22, tint: pine ? coolPine : undefined });
      if (rnd() < 0.5) props.push({ key: 'prop_bush', x: px + (rnd() * 14 - 7), y: py + TILE / 2 - 2, solid: false, scale: 0.75 + rnd() * 0.3, tint: coolBush });
    } else if (r < 0.76) {                                 // SAPLING + undergrowth (lower silhouette)
      props.push({ key: rnd() < 0.5 ? 'prop_tree_oak' : 'prop_tree_pine', x: px, y: py + TILE / 2, solid: false, flip: rnd() < 0.5, scale: 0.5 + rnd() * 0.22, tint: stony ? coolPine : undefined });
      props.push({ key: 'prop_bush', x: px + (rnd() * 12 - 6), y: py + 6, solid: false, scale: 0.72 + rnd() * 0.3, tint: coolBush });
    } else {                                               // UNDERGROWTH-only — a low gap (breathing room)
      props.push({ key: 'prop_bush', x: px, y: py, solid: false, scale: 0.7 + rnd() * 0.4, tint: coolBush });
      if (rnd() < 0.5) props.push({ key: 'prop_bush', x: px + (rnd() * 14 - 7), y: py + (rnd() * 10 - 5), solid: false, scale: 0.55 + rnd() * 0.3, tint: coolBush });
    }
  }
  props.push({ key: 'prop_sign', x: fhx(12) + TILE / 2 + 6, y: fhy(6) + TILE / 2, solid: false, text: 'THE FORK — left (NW) to the quarry road; right (NE) the steep climb to Cinder Keep. Both reach the Peaks town.' });   // the fork waystone
  return props;
}
// gate rockfall: seal the two lane mouths (top row) into the Peaks until shard_1 is borne
function _buildFoothillGateColliders() {
  const rects = [];
  for (let y = 0; y <= 1; y++) for (let x = 0; x < FH_W; x++) if (_fhWalk[y][x]) rects.push({ x: fhx(x) + TILE / 2, y: fhy(y) + TILE / 2, w: TILE, h: TILE });
  return rects;
}

export const FOOTHILL_ROUTE = {
  key: 'Foothill',
  origin: FOOTHILL_ORIGIN,
  bounds: { x: FOOTHILL_ORIGIN.x, y: FOOTHILL_ORIGIN.y, w: FH_W * TILE, h: FH_H * TILE },
  safeZone: true,
  route: true,                           // CHANNELLED route — verify.mjs open-block gate applies
  widthTiles: FH_W, heightTiles: FH_H,
  originTile: FH_OT,
  mapColor: 0x7d8466,                    // foothill green-grey on the minimap
  terrain: { patches: [{ set: 'dirt', rects: [
    [9, 6, 3, 4],                        // trunk + GH trailhead
    [6, 3, 3, 3], [5, 1, 3, 2],          // quarry branch
    [14, 4, 4, 2], [17, 1, 2, 3],        // keep branch
    [5, 3, 2, 1],                        // the spur
  ] }] },
  props: _buildFoothillProps(),
  colliders: _buildFoothillColliders(),
  decalLayers: [
    { seed: 0x10cc, count: 30, pool: ['decal_tuft', 'decal_grass_lush', 'decal_clover', 'decal_dirt_patch'] },
    { seed: 0x20cc, count: 14, pool: ['decal_dirt_patch', 'decal_grass_tall'] },
  ],
  chests: [{ id: 'foothill_cache', x: fhx(5) + TILE / 2, y: fhy(2.9) + TILE / 2, gold: 35, line: 'Off the spur, behind a crag — a climber\'s cache. Thirty-five gold.' }],
  // ENTRY GATE (gating.js: Peaks requires shard_1). Rockfall blocks the Peaks mouth until borne.
  gate: {
    deed: 'shard_1',
    colliders: _buildFoothillGateColliders(),
    sign: { x: fhx(12) + TILE / 2, y: fhy(1.4) + TILE / 2 },
    lockedMsg: 'A fresh ROCKFALL chokes the pass into the Peaks — the Order\'s work. They say the Marsh\'s truth (Shard I) is what shifts it.',
  },
  npcs: [{
    name: 'Pell', x: fhx(10) + TILE / 2, y: fhy(8) + TILE / 2, facing: 'up', speed: 0, expression: 'neutral',
    parts: ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_parted_gray', 'shirt_leather', 'pants_brown', 'shoes_brown'],
    greeting: [
      'Headed up? The trail forks past the cairn — quarry-road\'s the gentle way, keep-road\'s the climb.',
      'Mind the top, though. The Order brought half the cliff down across the pass. No one\'s through since.',
    ],
  }],
};

// =============================================================================
// GREYBOX REGION BUILDER — the v2 nav-FIRST skeleton (WORLD-SKELETON milestone, §8.3).
// A spec of walkable corridor rects (local tiles) → a `route` region: corridors cut into a
// SOLID FILL (a per-tile collider for every non-walkable tile = the channel walls, the Foothill
// pattern the gates expect), an entry GATE (keyed to a tool, per gating.js), a dungeon GRANT
// point (records the tools/shards so the gate-chain stays walkable), and a `nav` grid for the
// runtime navGates. NO art/props — structure + walkability only (Van walks + checks the layout
// BEFORE the art pass). Greybox terrain = a plain `dirt` patch on the corridors so the path reads.
// =============================================================================
function greyboxRegion(spec) {
  const { key, otx, oty, W, H, walk, gate, grant, mapColor } = spec;
  const ox = otx * TILE, oy = oty * TILE;
  const inWalk = (tx, ty) => walk.some(([x, y, w, h]) => tx >= x && tx < x + w && ty >= y && ty < y + h);
  const inGate = (tx, ty) => gate && tx >= gate.tx && tx < gate.tx + gate.w && ty >= gate.ty && ty < gate.ty + gate.h;
  const walkable = [], gated = [];
  for (let ty = 0; ty < H; ty++) {
    walkable[ty] = new Uint8Array(W); gated[ty] = new Uint8Array(W);
    for (let tx = 0; tx < W; tx++) { const w = inWalk(tx, ty) ? 1 : 0; walkable[ty][tx] = w; if (w && inGate(tx, ty)) gated[ty][tx] = 1; }
  }
  const colliders = [];   // SOLID FILL: one collider per non-walkable tile (the channel walls)
  for (let ty = 0; ty < H; ty++) for (let tx = 0; tx < W; tx++)
    if (!inWalk(tx, ty)) colliders.push({ x: ox + tx * TILE + TILE / 2, y: oy + ty * TILE + TILE / 2, w: TILE, h: TILE });
  let gateObj = null, gatedColliders = [];
  if (gate) {
    const gc = [];
    for (let j = 0; j < gate.h; j++) for (let i = 0; i < gate.w; i++) { const tx = gate.tx + i, ty = gate.ty + j; gc.push({ x: ox + tx * TILE + TILE / 2, y: oy + ty * TILE + TILE / 2, w: TILE, h: TILE }); }
    gateObj = { deed: gate.deed, colliders: gc, sign: { x: ox + (gate.tx + gate.w / 2) * TILE, y: oy + (gate.ty + gate.h / 2) * TILE }, lockedMsg: gate.msg };
    gatedColliders = gc.map((c) => ({ ...c, gate: gate.deed }));
  }
  const grantObj = grant ? { x: ox + grant.tx * TILE + TILE / 2, y: oy + grant.ty * TILE + TILE / 2, deeds: grant.deeds, label: grant.label } : null;
  return {
    key, origin: { x: ox, y: oy }, widthTiles: W, heightTiles: H,
    bounds: { x: ox, y: oy, w: W * TILE, h: H * TILE }, route: true, greybox: true, mapColor,
    terrain: { patches: [{ set: 'dirt', rects: walk.map((r) => [...r]) }] },
    colliders, gate: gateObj, gatedColliders, grant: grantObj, props: [], npcs: [], chests: [],
    nav: { walkable, gated, W, H },
  };
}

// --- TIDEWRECK COAST (E of Greenhollow; seam GH.E tile 340; grapple-gated river-road) --------
export const TIDEWRECK_COAST = greyboxRegion({
  key: 'Coast', otx: 340, oty: 288, W: 36, H: 28, mapColor: 0x3b6e7a,
  gate: { tx: 0, ty: 15, w: 2, h: 5, deed: 'tool_grapple', msg: 'A river-gorge cuts the road — too wide to cross. The grapple-line earned in the Peaks would carry you over.' },
  walk: [
    [0, 16, 9, 4],     // entry river-road (W) → main spine
    [4, 16, 28, 4],    // main E-W spine
    [10, 4, 6, 13],    // N fork → the harbour
    [8, 4, 8, 6],      // Saltbreak harbour TOWN junction (8×6)
    [2, 8, 4, 9],      // a NW secret spur (cache)
    [22, 19, 5, 8],    // S fork → the Drowned Vault
    [19, 21, 9, 6],    // Drowned Vault dungeon node (hookshot + shard_3)
    [26, 13, 8, 6],    // E coastal cliff path (a tease)
  ],
  grant: { tx: 23, ty: 24, deeds: ['tool_hookshot', 'shard_3'], label: 'The Drowned Vault yields the HOOKSHOT + Shard III.' },
});

// --- EMBERWOOD (S of Greenhollow; seam GH.S tile 328; hookshot-gated ashen chasm) ------------
export const EMBERWOOD = greyboxRegion({
  key: 'Emberwood', otx: 288, oty: 328, W: 36, H: 28, mapColor: 0x6e3b2e,
  gate: { tx: 31, ty: 0, w: 3, h: 2, deed: 'tool_hookshot', msg: 'A scorched chasm splits the wood. The hookshot from the Coast would span it.' },
  walk: [
    [31, 0, 3, 10],    // entry chasm-road (N) → spine
    [6, 8, 28, 4],     // main E-W spine
    [6, 8, 8, 7],      // Emberwood CAMP town junction
    [18, 11, 4, 14],   // S fork → Ember Hollow
    [14, 20, 9, 7],    // Ember Hollow dungeon node (firefrost + shard_4)
    [26, 11, 7, 9],    // E fever-grove spur (secret)
  ],
  grant: { tx: 18, ty: 23, deeds: ['tool_firefrost', 'shard_4'], label: 'Ember Hollow yields the FIREFROST tool + Shard IV.' },
});

// --- HOLLOW SPIRE (N of the Peaks; seam Peaks.N tile 218; firefrost+4-shard ascent) ----------
export const HOLLOW_SPIRE = greyboxRegion({
  key: 'Spire', otx: 288, oty: 178, W: 36, H: 40, mapColor: 0xb8c2d0,
  gate: { tx: 31, ty: 38, w: 3, h: 2, deed: 'tool_firefrost', msg: 'The frozen ascent bars the way — only firefrost, and the four shards together, open the Spire.' },
  walk: [
    [31, 31, 3, 9],    // entry (S, from the Peaks)
    [14, 30, 20, 4],   // switchback 1
    [14, 14, 4, 20],   // up the W flank
    [14, 14, 18, 4],   // switchback 2
    [28, 4, 4, 14],    // up the E flank
    [10, 2, 20, 6],    // the SUMMIT — Binding Chamber (shard_5) — meets the E flank at x28-29
    [8, 18, 7, 7],     // a hidden side-ledge (secret) — meets the W flank at x14 (kept ≤8 to stay channelled)
  ],
  grant: { tx: 18, ty: 4, deeds: ['shard_5'], label: 'The Binding Chamber — Shard V, and the whole truth.' },
});

// =============================================================================
// INTERIOR / AREA-TRANSITION system (Phase 0). An interior is just a REGION placed in a reserved,
// far corner of the world (tiles 520+, away from every overworld region) — so the proven streaming,
// _buildRegion, pixel-truth collision, depth-sort, interaction-classes, navGates and SAVE deltas all
// apply UNCHANGED. A `via:'door'` interactable teleports the player in/out (OverworldScene._enterArea);
// floors are just more interior regions reached by stairs. `interior:true` enclosed rooms (walls all
// round, walkable inside), greybox (a floor patch — Phase 2/3 art them). spawn = where you appear inside.
// =============================================================================
// DOOR SPRITE OFFSET — push a door's VISUAL one tile toward its room's nearest wall so it reads as a
// doorway IN the wall (not free-standing mid-floor). The walk-trigger tile (door.x/y) is unchanged.
function doorWallOffset(tx, ty, W, H) {
  const toL = tx, toR = (W - 1) - tx, toT = ty, toB = (H - 1) - ty, m = Math.min(toL, toR, toT, toB);
  if (m === toB) return { spriteDy: TILE }; if (m === toT) return { spriteDy: -TILE };
  if (m === toR) return { spriteDx: TILE }; return { spriteDx: -TILE };
}
function interiorRegion(spec) {
  const { key, otx, oty, W, H, doors = [], chests = [], furniture = [], npcs = [], spawn, floor = 'dirt', mapColor = 0x2a2620, groundTint = null } = spec;
  const ox = otx * TILE, oy = oty * TILE;
  const walkable = [], gated = [], colliders = [], props = [];
  for (let ty = 0; ty < H; ty++) {
    walkable[ty] = new Uint8Array(W); gated[ty] = new Uint8Array(W);
    for (let tx = 0; tx < W; tx++) {
      const wall = tx === 0 || ty === 0 || tx === W - 1 || ty === H - 1;
      walkable[ty][tx] = wall ? 0 : 1;
      if (wall) colliders.push({ x: ox + tx * TILE + TILE / 2, y: oy + ty * TILE + TILE / 2, w: TILE, h: TILE });
    }
  }
  // FURNITURE — a solid piece carves its tile out of the nav (collider + non-walkable) so navGates
  // still validate the body routes around it; the prop itself is drawn solid:false (the collider blocks).
  for (const f of furniture) {
    const wx = ox + f.tx * TILE + TILE / 2, wy = oy + f.ty * TILE + TILE / 2;
    props.push({ key: f.key, x: wx, y: wy + (f.dy || 0), solid: false, scale: f.scale || 1, tint: f.tint });
    if (f.solid) { walkable[f.ty][f.tx] = 0; colliders.push({ x: wx, y: wy, w: TILE, h: TILE }); }
  }
  const interactables = doors.map((d) => ({ via: 'door', key: 'prop_door', solid: false, x: ox + d.tx * TILE + TILE / 2, y: oy + d.ty * TILE + TILE / 2, to: d.to, prompt: d.label || 'Go', ...doorWallOffset(d.tx, d.ty, W, H) }));
  const chestData = chests.map((c) => ({ id: c.id, x: ox + c.tx * TILE + TILE / 2, y: oy + c.ty * TILE + TILE / 2, gold: c.gold || 15 }));
  return {
    key, origin: { x: ox, y: oy }, widthTiles: W, heightTiles: H, bounds: { x: ox, y: oy, w: W * TILE, h: H * TILE },
    route: true, interior: true, mapColor, groundTint,
    terrain: { patches: [{ set: floor, rects: [[1, 1, W - 2, H - 2]] }] },
    colliders, props,
    npcs: npcs.map((n) => ({ ...n, x: ox + n.tx * TILE + TILE / 2, y: oy + n.ty * TILE + TILE / 2 })),
    chests: chestData, interactables,
    spawn: { x: ox + spawn.tx * TILE + TILE / 2, y: oy + spawn.ty * TILE + TILE / 2 },
    nav: { walkable, gated, W, H },
  };
}

// The Copper Tankard — floor 1 (front room) + floor 2 (rooms upstairs). And a 2-floor test dungeon.
export const TANKARD_F1 = interiorRegion({
  key: 'tankard_f1', otx: 520, oty: 520, W: 14, H: 10, floor: 'dirt', mapColor: 0x6b4a2e, spawn: { tx: 3, ty: 8 },
  doors: [{ tx: 2, ty: 8, to: 'back', label: 'Leave (back outside)' }, { tx: 11, ty: 2, to: 'tankard_f2', label: 'Upstairs →' }],
  furniture: [
    { tx: 1, ty: 1, key: 'prop_fireplace', solid: true, dy: -6 },   // the hearth
    { tx: 4, ty: 3, key: 'prop_table', solid: true, scale: 0.8 }, { tx: 8, ty: 6, key: 'prop_table', solid: true, scale: 0.8 },   // tavern tables
    { tx: 12, ty: 1, key: 'prop_barrel', solid: true }, { tx: 12, ty: 2, key: 'prop_barrel', solid: true, scale: 0.9 },   // the bar's casks
  ],
  chests: [{ tx: 7, ty: 5, id: 'tankard_f1_chest', gold: 20 }],
});
export const TANKARD_F2 = interiorRegion({
  key: 'tankard_f2', otx: 590, oty: 520, W: 14, H: 10, floor: 'dirt', mapColor: 0x7a5638, spawn: { tx: 11, ty: 2 },
  doors: [{ tx: 10, ty: 2, to: 'back', label: 'Downstairs ↓' }],
  furniture: [
    { tx: 1, ty: 1, key: 'prop_bed', solid: true, dy: -2 }, { tx: 1, ty: 5, key: 'prop_bed', solid: true, dy: -2 },   // the rooms upstairs
    { tx: 4, ty: 7, key: 'prop_table', solid: true, scale: 0.75 }, { tx: 12, ty: 6, key: 'prop_dresser', solid: true, dy: -6 },
  ],
  chests: [{ tx: 6, ty: 5, id: 'tankard_f2_chest', gold: 30 }],
});
export const TEST_CAVE_F1 = interiorRegion({
  key: 'cave_f1', otx: 520, oty: 590, W: 14, H: 10, floor: 'rock', mapColor: 0x4a4540, spawn: { tx: 3, ty: 8 },
  doors: [{ tx: 2, ty: 8, to: 'back', label: 'Leave (back outside)' }, { tx: 11, ty: 2, to: 'cave_f2', label: 'Descend ↓' }],
  chests: [{ tx: 7, ty: 5, id: 'cave_f1_chest', gold: 15 }],
});
export const TEST_CAVE_F2 = interiorRegion({
  key: 'cave_f2', otx: 590, oty: 590, W: 14, H: 10, floor: 'rock', mapColor: 0x3f3a36, spawn: { tx: 11, ty: 2 },
  doors: [{ tx: 10, ty: 2, to: 'back', label: 'Ascend ↑' }],
  chests: [{ tx: 6, ty: 5, id: 'cave_f2_chest', gold: 40 }],
});
// =============================================================================
// CONTENT-SIZED WORLD LAYOUT (greybox, walkable) — the WORLD-MAP-PLAN built as separate enterable
// scenes (the approved structure: overworld + separate scenes). griddedSettlement() auto-BLOCKS OUT a
// place at its content-sized footprint: a STREET GRID (walkable lanes every `pitch` tiles, `street`
// wide) with BUILDING-FOOTPRINT blocks (solid) between → a city reads as streets + districts, a village
// as a few blocks + a lane. Walls all round; the entry door at the spawn; district CHESTS (markers).
// navGate-validated (the street grid connects spawn → exit + every chest). Greybox only — NO art.
// =============================================================================
function griddedSettlement(spec) {
  const { key, otx, oty, W, H, pitch = 7, street = 2, floor = 'dirt', mapColor = 0x3a3a3a, label, doors = [], chests = [],
    groundTint = null, buildings = [], npcs = [], dressing = [], spawnTile = null } = spec;
  const ox = otx * TILE, oy = oty * TILE;
  const walkable = [], gated = [], colliders = [], props = [], floorRects = [];
  const dressed = buildings.length > 0;   // a finished town (real buildings) suppresses the greybox footprint-markers
  for (let ty = 0; ty < H; ty++) {
    walkable[ty] = new Uint8Array(W); gated[ty] = new Uint8Array(W);
    for (let tx = 0; tx < W; tx++) {
      const wall = tx === 0 || ty === 0 || tx === W - 1 || ty === H - 1;
      const onStreet = (tx % pitch) < street || (ty % pitch) < street;   // the street lattice
      const w = !wall && onStreet;
      walkable[ty][tx] = w ? 1 : 0;
      const wx = ox + tx * TILE + TILE / 2, wy = oy + ty * TILE + TILE / 2;
      if (!wall) floorRects.push([tx, ty, 1, 1]);   // FLOOR the WHOLE interior (continuous ground — the building blocks are floored under the buildings, NOT black void)
      if (!w) { colliders.push({ x: wx, y: wy, w: TILE, h: TILE });   // every non-walkable tile (walls + blocks) is a solid collider
        if (!dressed && !wall && (tx % pitch) === street && (ty % pitch) === street) props.push({ key: 'prop_sign', x: wx, y: wy, solid: false, scale: 0.5, tint: 0x8a96a8 }); } // greybox footprint marker (only when not dressed)
    }
  }
  // REAL buildings dressed onto the block footprints (visual — the block tiles already collide) + decor.
  for (const b of buildings) props.push({ key: b.key, x: ox + b.tx * TILE + TILE / 2, y: oy + b.ty * TILE + TILE / 2 + (b.dy || 0), solid: false, scale: b.scale || 1, tint: b.tint });
  for (const d of dressing) props.push({ key: d.key, x: ox + d.tx * TILE + TILE / 2, y: oy + d.ty * TILE + TILE / 2 + (d.dy || 0), solid: false, scale: d.scale || 1, tint: d.tint });
  const interactables = doors.map((d) => ({ via: 'door', key: 'prop_door', solid: false, x: ox + d.tx * TILE + TILE / 2, y: oy + d.ty * TILE + TILE / 2, to: d.to, prompt: d.label || 'Go', ...doorWallOffset(d.tx, d.ty, W, H) }));
  const chestData = chests.map((c) => ({ id: c.id, x: ox + c.tx * TILE + TILE / 2, y: oy + c.ty * TILE + TILE / 2, gold: c.gold || 20 }));
  const sp = spawnTile || { tx: 1, ty: 1 };
  return {
    key, label, origin: { x: ox, y: oy }, widthTiles: W, heightTiles: H, bounds: { x: ox, y: oy, w: W * TILE, h: H * TILE },
    route: true, interior: true, settlement: true, mapColor, groundTint,
    terrain: { patches: [{ set: floor, rects: floorRects }] },
    colliders, props,
    npcs: npcs.map((n) => ({ ...n, x: ox + n.tx * TILE + TILE / 2, y: oy + n.ty * TILE + TILE / 2 })),
    chests: chestData, interactables,
    spawn: { x: ox + sp.tx * TILE + TILE / 2, y: oy + sp.ty * TILE + TILE / 2 },
    nav: { walkable, gated, W, H },
  };
}

// THE HALVED-SCOPE WORLD: 1 city + 2 towns + 5 villages + 2 dungeons (greybox, walkable). Far band
// (tiles 400+), entered by doors from Greenhollow's WORLD-LAYOUT board (reachable + walkable).
export const CITY_SALTBREAK = griddedSettlement({ key: 'city_saltbreak', label: 'SALTBREAK (city)', otx: 400, oty: 400, W: 56, H: 40, pitch: 7, street: 2, mapColor: 0x4a6e8a,
  doors: [{ tx: 1, ty: 1, to: 'back', label: 'Leave Saltbreak' }],
  chests: [{ tx: 7, ty: 7, id: 'saltbreak_docks', gold: 40 }, { tx: 28, ty: 14, id: 'saltbreak_market', gold: 35 }, { tx: 49, ty: 28, id: 'saltbreak_mansion', gold: 50 }, { tx: 14, ty: 28, id: 'saltbreak_under', gold: 30 }] });
export const TOWN_STONEREACH = griddedSettlement({ key: 'town_stonereach', label: 'Stonereach (town)', otx: 400, oty: 446, W: 36, H: 28, pitch: 8, street: 2, mapColor: 0x8a93a8,
  doors: [{ tx: 1, ty: 1, to: 'back', label: 'Leave Stonereach' }], chests: [{ tx: 8, ty: 8, id: 'stonereach_hall', gold: 30 }, { tx: 24, ty: 16, id: 'stonereach_mine', gold: 25 }] });
const MARSH_FOLK = [
  ['body_fem', 'head_fem', 'brows_chestnut', 'hair_bob_blonde', 'shirt_leather', 'pants_brown', 'shoes_brown_fem'],   // Hagga-ish
  ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_chestnut', 'shirt_forest', 'pants_brown', 'shoes_brown'],       // a fisher
  ['body_fem', 'head_fem', 'brows_chestnut', 'hair_parted_gray', 'shirt_forest', 'pants_brown', 'shoes_brown_fem'],     // a bog-woman
  ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_chestnut', 'shirt_blue', 'pants_black', 'shoes_brown'],          // a marsh lad
];
export const TOWN_MIREFEN = griddedSettlement({ key: 'town_mirefen', label: 'Mirefen (town)', otx: 442, oty: 446, W: 34, H: 26, pitch: 8, street: 2, mapColor: 0x56988c,
  floor: 'dirt', groundTint: 0x7a8470, spawnTile: { tx: 4, ty: 1 },
  doors: [{ tx: 1, ty: 1, to: 'back', label: 'Leave Mirefen' }, { tx: 9, ty: 9, to: 'mirefen_hut', label: "Enter Yssa's hut" }],
  // weathered marsh-houses dressed onto the block footprints, bog-grey-green tinted
  buildings: [
    { tx: 5, ty: 5, key: 'prop_house_b', tint: 0x7c8470, dy: -6 },
    { tx: 13, ty: 5, key: 'prop_house_paneled', tint: 0x6e7860, dy: -6 },   // the moot-hall
    { tx: 21, ty: 5, key: 'prop_house_a', tint: 0x747c68, dy: -8 },
    { tx: 29, ty: 6, key: 'prop_house_b', tint: 0x6c7458, dy: -6 },
    { tx: 13, ty: 13, key: 'prop_house_b', tint: 0x788066, dy: -6 },
    { tx: 21, ty: 13, key: 'prop_house_paneled', tint: 0x707860, dy: -6 },
    { tx: 29, ty: 13, key: 'prop_house_b', tint: 0x6e7658, dy: -6 },
    { tx: 13, ty: 21, key: 'prop_house_a', tint: 0x727a66, dy: -8 },
    { tx: 22, ty: 21, key: 'prop_house_b', tint: 0x6c7458, dy: -6 },
    { tx: 5, ty: 13, key: 'prop_house_paneled', tint: 0x747e66, dy: -6 },   // fill the bare blocks
    { tx: 5, ty: 21, key: 'prop_house_b', tint: 0x788066, dy: -6 },
    { tx: 29, ty: 21, key: 'prop_house_a', tint: 0x6e7660, dy: -8 },
  ],
  dressing: [
    { tx: 28, ty: 17, key: 'prop_tree_pine', tint: 0x5b6358 },
    { tx: 8, ty: 16, key: 'prop_barrel', tint: 0x8a7a6a }, { tx: 17, ty: 9, key: 'prop_barrel', tint: 0x8a7a6a },
    { tx: 16, ty: 17, key: 'prop_bush', scale: 0.7, tint: 0x6b7560 }, { tx: 25, ty: 16, key: 'prop_bush', scale: 0.7, tint: 0x6b7560 },
    { tx: 6, ty: 8, key: 'prop_sign', scale: 0.8, tint: 0x9a8f6a },
  ],
  npcs: [
    { tx: 8, ty: 4, facing: 'down', name: 'Marsh-wife Bett', speed: 40, expression: 'neutral', parts: MARSH_FOLK[2] },
    { tx: 16, ty: 8, facing: 'down', name: 'Fisher Coll', speed: 40, expression: 'neutral', parts: MARSH_FOLK[1] },
    { tx: 9, ty: 16, facing: 'right', name: 'Old Mire', speed: 0, expression: 'sad', parts: MARSH_FOLK[0] },
    { tx: 24, ty: 9, facing: 'down', name: 'Reed-boy Tam', speed: 55, expression: 'happy', parts: MARSH_FOLK[3] },
  ],
  chests: [{ tx: 8, ty: 8, id: 'mirefen_elder', gold: 22 }] });
// A FURNISHED Mirefen home (Elder Yssa's hut) — the proven interiorRegion+furniture pipeline, marsh-themed
// (weathered, dim). Walk in from the Mirefen street; walk out returns to the town (return-stack).
const YSSA_HUT = ['body_fem', 'head_fem', 'brows_chestnut', 'hair_parted_gray', 'shirt_forest', 'pants_brown', 'shoes_brown_fem'];
export const MIREFEN_HUT = interiorRegion({
  key: 'mirefen_hut', otx: 490, oty: 560, W: 11, H: 9, floor: 'dirt', mapColor: 0x3a4640, groundTint: 0x8a9088, spawn: { tx: 5, ty: 7 },
  doors: [{ tx: 5, ty: 7, to: 'back', label: 'Step outside' }],
  furniture: [
    { tx: 1, ty: 1, key: 'prop_bed', solid: true, dy: -2 }, { tx: 9, ty: 1, key: 'prop_fireplace', solid: true, dy: -6 },
    { tx: 4, ty: 4, key: 'prop_table', solid: true, scale: 0.8 }, { tx: 7, ty: 1, key: 'prop_dresser', solid: true, dy: -6 },
    { tx: 2, ty: 6, key: 'prop_bush', solid: false, scale: 0.6, tint: 0x6b7560 },   // a hanging herb bundle (dressing)
  ],
  npcs: [
    { tx: 6, ty: 5, facing: 'down', name: 'Elder Yssa', speed: 0, expression: 'sad', parts: YSSA_HUT,
      greeting: ['Sit, if you must. The fire is more honest than most folk. Hagga waits across the black water — mind it.'] },
  ],
  chests: [{ tx: 9, ty: 5, id: 'mirefen_hut_chest', gold: 18 }],
});
const village = (key, label, otx, oty, color) => griddedSettlement({ key, label, otx, oty, W: 20, H: 16, pitch: 9, street: 2, mapColor: color, doors: [{ tx: 1, ty: 1, to: 'back', label: 'Leave ' + label }], chests: [{ tx: 9, ty: 9, id: key + '_chest', gold: 16 }] });
// FENWICK — a real small marsh-edge village (dressed). NOTE: its intended entry is the ⚡electric spur
// (Mirefen↔Fenwick) — DEFERRED to the abilities session; for now it stays reachable via the walk approach
// from the GH board (the door above) so the place is NOT orphaned. Flag: gate the board-door on electric
// once that ability exists.
export const VILLAGE_1 = griddedSettlement({ key: 'vil_fenwick', label: 'Fenwick', otx: 480, oty: 446, W: 20, H: 16, pitch: 9, street: 2, mapColor: 0x6e8a7a,
  floor: 'dirt', groundTint: 0x7e8872, spawnTile: { tx: 4, ty: 1 },
  doors: [{ tx: 1, ty: 1, to: 'back', label: 'Leave Fenwick' }, { tx: 5, ty: 10, to: 'fenwick_home', label: 'Enter the cottage' }],
  buildings: [
    { tx: 5, ty: 5, key: 'prop_house_b', tint: 0x7e8672, dy: -6 },
    { tx: 14, ty: 5, key: 'prop_house_paneled', tint: 0x728060, dy: -6 },
    { tx: 14, ty: 12, key: 'prop_house_b', tint: 0x76806a, dy: -6 },
    { tx: 5, ty: 12, key: 'prop_house_a', tint: 0x748068, dy: -8 },   // fill the SW block
  ],
  dressing: [
    { tx: 17, ty: 9, key: 'prop_barrel', tint: 0x8a7a6a },
    { tx: 8, ty: 11, key: 'prop_bush', scale: 0.7, tint: 0x6b7560 }, { tx: 11, ty: 3, key: 'prop_sign', scale: 0.8, tint: 0x9a8f6a },
  ],
  npcs: [
    { tx: 8, ty: 1, facing: 'down', name: 'Fen-warden Pell', speed: 40, expression: 'neutral', parts: MARSH_FOLK[1] },
    { tx: 10, ty: 9, facing: 'down', name: 'Widow Sedge', speed: 0, expression: 'sad', parts: MARSH_FOLK[2] },
  ],
  chests: [{ tx: 9, ty: 9, id: 'vil_fenwick_chest', gold: 16 }] });
// Fenwick's furnished cottage (proven pipeline)
export const FENWICK_HOME = interiorRegion({
  key: 'fenwick_home', otx: 512, oty: 560, W: 10, H: 8, floor: 'dirt', mapColor: 0x3a4640, groundTint: 0x8a9088, spawn: { tx: 5, ty: 6 },
  doors: [{ tx: 5, ty: 6, to: 'back', label: 'Step outside' }],
  furniture: [
    { tx: 1, ty: 1, key: 'prop_bed', solid: true, dy: -2 }, { tx: 8, ty: 1, key: 'prop_fireplace', solid: true, dy: -6 },
    { tx: 3, ty: 4, key: 'prop_table', solid: true, scale: 0.8 }, { tx: 6, ty: 1, key: 'prop_dresser', solid: true, dy: -6 },
  ],
  npcs: [{ tx: 5, ty: 4, facing: 'down', name: 'Fenwick child', speed: 0, expression: 'happy', parts: MARSH_FOLK[3] }],
  chests: [{ tx: 8, ty: 5, id: 'fenwick_home_chest', gold: 14 }],
});
export const VILLAGE_2 = village('vil_cribbins', 'Cribbins Cove', 504, 446, 0x4a90cf);
export const VILLAGE_3 = village('vil_cragfoot', 'Cragfoot', 528, 446, 0x93a0b8);
export const VILLAGE_4 = village('vil_oasis', 'Mirage Oasis', 400, 466, 0xd4ad6a);
export const VILLAGE_5 = village('vil_thornwell', 'Thornwell', 424, 466, 0x4a8a40);
export const DUNGEON_SHRINE = griddedSettlement({ key: 'dgn_shrine', label: 'Sunken Shrine (dungeon)', otx: 450, oty: 466, W: 24, H: 18, pitch: 6, street: 2, mapColor: 0x3a4a4a,
  doors: [{ tx: 1, ty: 1, to: 'back', label: 'Leave the shrine' }], chests: [{ tx: 12, ty: 12, id: 'shrine_shard', gold: 45 }] });
export const DUNGEON_KEEP = griddedSettlement({ key: 'dgn_keep', label: 'Cinder Keep (dungeon)', otx: 476, oty: 466, W: 24, H: 18, pitch: 6, street: 2, mapColor: 0x4a4040,
  doors: [{ tx: 1, ty: 1, to: 'back', label: 'Leave the keep' }], chests: [{ tx: 12, ty: 12, id: 'keep_shard', gold: 48 }] });
export const WORLD_LAYOUT = [CITY_SALTBREAK, TOWN_STONEREACH, TOWN_MIREFEN, VILLAGE_1, VILLAGE_2, VILLAGE_3, VILLAGE_4, VILLAGE_5, DUNGEON_SHRINE, DUNGEON_KEEP];

// GREENHOLLOW town interiors (Phase 2) — furnished with the available prop set (the forge anvil, barrels,
// the fountain-as-font, the fence-as-counter/pew, a potted bush, chests). FLAG (HARD RULE 9): proper
// interior furniture — beds, tables, shelves, hearths, an altar — is an ART need for the finished polish;
// greybox-furnished with real props for now, never colour-boxed. Each: walls all round, the front door
// at the spawn, furniture wall-hugging so the body walks the room (navGates-validated, interiors.test).
export const GH_FORGE = interiorRegion({
  key: 'gh_forge', otx: 440, oty: 615, W: 12, H: 9, floor: 'dirt', mapColor: 0x4a3a2e, spawn: { tx: 6, ty: 7 },
  doors: [{ tx: 6, ty: 7, to: 'back', label: 'Leave the forge' }],
  furniture: [
    { tx: 2, ty: 1, key: 'prop_anvil', solid: true, dy: 4 },   // a REAL anvil (was the fountain-basin)
    { tx: 4, ty: 1, key: 'prop_table', solid: true, scale: 0.8, dy: -2 },   // the smith's workbench
    { tx: 9, ty: 1, key: 'prop_barrel', solid: true }, { tx: 10, ty: 2, key: 'prop_barrel', solid: true, scale: 0.9 },
    { tx: 1, ty: 4, key: 'prop_fence', solid: true }, { tx: 1, ty: 5, key: 'prop_fence', solid: true },
  ],
  chests: [{ tx: 9, ty: 5, id: 'gh_forge_chest', gold: 25 }],
});
export const GH_STORE = interiorRegion({
  key: 'gh_store', otx: 470, oty: 615, W: 12, H: 9, floor: 'dirt', mapColor: 0x5a4a32, spawn: { tx: 6, ty: 7 },
  doors: [{ tx: 6, ty: 7, to: 'back', label: 'Leave the store' }],
  furniture: [
    { tx: 2, ty: 1, key: 'prop_barrel', solid: true }, { tx: 3, ty: 1, key: 'prop_barrel', solid: true, scale: 0.9 }, { tx: 4, ty: 1, key: 'prop_barrel', solid: true, scale: 0.85, tint: 0xcab890 },
    { tx: 8, ty: 1, key: 'prop_sign', solid: false, scale: 0.8 }, { tx: 9, ty: 1, key: 'prop_barrel', solid: true },
    { tx: 2, ty: 4, key: 'prop_fence', solid: true }, { tx: 3, ty: 4, key: 'prop_fence', solid: true }, { tx: 4, ty: 4, key: 'prop_fence', solid: true },   // the counter
    { tx: 10, ty: 6, key: 'prop_bush', solid: false, scale: 0.6 },
  ],
  chests: [{ tx: 9, ty: 5, id: 'gh_store_chest', gold: 20 }],
});
export const GH_CHAPEL = interiorRegion({
  key: 'gh_chapel', otx: 500, oty: 615, W: 11, H: 12, floor: 'dirt', mapColor: 0x4a4658, spawn: { tx: 5, ty: 10 },
  doors: [{ tx: 5, ty: 10, to: 'back', label: 'Leave the chapel' }],
  furniture: [
    { tx: 5, ty: 1, key: 'prop_altar', solid: true, dy: -10 },   // a REAL stone shrine/altar at the head of the nave (was the fountain)
    { tx: 2, ty: 4, key: 'prop_fence', solid: true }, { tx: 3, ty: 4, key: 'prop_fence', solid: true }, { tx: 7, ty: 4, key: 'prop_fence', solid: true }, { tx: 8, ty: 4, key: 'prop_fence', solid: true },  // pews
    { tx: 2, ty: 6, key: 'prop_fence', solid: true }, { tx: 3, ty: 6, key: 'prop_fence', solid: true }, { tx: 7, ty: 6, key: 'prop_fence', solid: true }, { tx: 8, ty: 6, key: 'prop_fence', solid: true },
    { tx: 1, ty: 1, key: 'prop_bush', solid: false, scale: 0.6 }, { tx: 9, ty: 1, key: 'prop_bush', solid: false, scale: 0.6 },
  ],
  chests: [{ tx: 9, ty: 9, id: 'gh_chapel_chest', gold: 15 }],
});
export const GH_HOME1 = interiorRegion({
  key: 'gh_home1', otx: 530, oty: 615, W: 10, H: 8, floor: 'dirt', mapColor: 0x5a4636, spawn: { tx: 5, ty: 6 },
  doors: [{ tx: 5, ty: 6, to: 'back', label: 'Step outside' }],
  furniture: [
    { tx: 1, ty: 1, key: 'prop_bed', solid: true, dy: -2 },   // a REAL bed
    { tx: 8, ty: 1, key: 'prop_fireplace', solid: true, dy: -6 },   // a REAL hearth
    { tx: 3, ty: 4, key: 'prop_table', solid: true, scale: 0.8 }, { tx: 6, ty: 1, key: 'prop_dresser', solid: true, dy: -6 },
    { tx: 7, ty: 5, key: 'prop_bush', solid: false, scale: 0.55 },
  ],
  chests: [{ tx: 8, ty: 5, id: 'gh_home1_chest', gold: 18 }],
});
export const GH_HOME2 = interiorRegion({
  key: 'gh_home2', otx: 560, oty: 615, W: 10, H: 8, floor: 'dirt', mapColor: 0x4e4a38, spawn: { tx: 5, ty: 6 },
  doors: [{ tx: 5, ty: 6, to: 'back', label: 'Step outside' }],
  furniture: [
    { tx: 8, ty: 1, key: 'prop_bed', solid: true, dy: -2 }, { tx: 1, ty: 1, key: 'prop_fireplace', solid: true, dy: -6 },
    { tx: 3, ty: 4, key: 'prop_table', solid: true, scale: 0.8 }, { tx: 6, ty: 1, key: 'prop_dresser', solid: true, dy: -6 },
    { tx: 2, ty: 5, key: 'prop_bush', solid: false, scale: 0.6 },
  ],
  chests: [{ tx: 8, ty: 5, id: 'gh_home2_chest', gold: 16 }],
});

// THE LOST CEMETERY (Van's new node, MASTER-WORLD-SPEC §0.5) — the Marsh's grief/night vignette. An
// enclosed walled graveyard (eerie murky tint) of grave markers (LPC Grave Markers Rework, CC-BY-SA/GPL)
// + the founder's ornate stone + the angel statue; a fresh OPEN grave with a mourner tending it. Entered
// by walking through the lych-gate from the GH world-board (a Marsh-band place). navGate-validated.
const MOURNER = ['body_fem', 'head_fem', 'brows_chestnut', 'hair_parted_gray', 'shirt_leather', 'pants_brown', 'shoes_brown_fem'];
export const LOST_CEMETERY = interiorRegion({
  key: 'lost_cemetery', otx: 430, oty: 560, W: 22, H: 16, floor: 'dirt', mapColor: 0x2a2e2a, groundTint: 0x6a7068,
  spawn: { tx: 11, ty: 14 },
  doors: [{ tx: 11, ty: 14, to: 'back', label: 'Leave the cemetery' }],
  furniture: [
    // the founder's grave + two mourning angels at the head
    { tx: 10, ty: 2, key: 'prop_grave_large', solid: true, dy: -10 },
    { tx: 5, ty: 2, key: 'prop_altar', solid: true, dy: -8, tint: 0x9aa0a0 }, { tx: 16, ty: 2, key: 'prop_altar', solid: true, dy: -8, tint: 0x9aa0a0 },
    // rows of headstones (aisles between)
    { tx: 3, ty: 5, key: 'prop_grave_headstone', solid: true, dy: -4 }, { tx: 6, ty: 5, key: 'prop_grave_cross', solid: true, dy: -8 },
    { tx: 9, ty: 5, key: 'prop_grave_headstone', solid: true, dy: -4 }, { tx: 12, ty: 5, key: 'prop_grave_cross', solid: true, dy: -8 },
    { tx: 15, ty: 5, key: 'prop_grave_headstone', solid: true, dy: -4 }, { tx: 18, ty: 5, key: 'prop_grave_woodcross', solid: true, dy: -6 },
    { tx: 4, ty: 8, key: 'prop_grave_cross', solid: true, dy: -8 }, { tx: 8, ty: 8, key: 'prop_grave_headstone', solid: true, dy: -4 },
    { tx: 12, ty: 8, key: 'prop_grave_woodcross', solid: true, dy: -6 }, { tx: 16, ty: 8, key: 'prop_grave_headstone', solid: true, dy: -4 },
    { tx: 3, ty: 11, key: 'prop_grave_woodcross', solid: true, dy: -6 }, { tx: 7, ty: 11, key: 'prop_grave_headstone', solid: true, dy: -4 },
    // the fresh OPEN grave (the vignette) — a mourner kneels beside it
    { tx: 17, ty: 10, key: 'prop_grave_open', solid: true, dy: -8 },
    { tx: 19, ty: 12, key: 'prop_bush', solid: false, scale: 0.6, tint: 0x6b7560 }, { tx: 2, ty: 3, key: 'prop_bush', solid: false, scale: 0.6, tint: 0x6b7560 },
    { tx: 11, ty: 13, key: 'prop_sign', solid: false, text: 'THE LOST CEMETERY — they buried the drowned here, before Mirefen forgot their names. Tread softly; the marsh keeps its own.' },
  ],
  npcs: [
    { tx: 15, ty: 11, facing: 'right', name: 'Mother Cray', speed: 0, expression: 'sad', parts: MOURNER,
      greeting: ['Another name the water took. I dig the graves now — no one else remembers how. Stay if you like. The dead are poor company, but honest.'] },
  ],
  chests: [{ tx: 19, ty: 4, id: 'cemetery_offering', gold: 22 }],
});

export const INTERIORS = [TANKARD_F1, TANKARD_F2, TEST_CAVE_F1, TEST_CAVE_F2, GH_FORGE, GH_STORE, GH_CHAPEL, GH_HOME1, GH_HOME2, LOST_CEMETERY, MIREFEN_HUT, FENWICK_HOME, ...WORLD_LAYOUT];

export const REGIONS = [GREENHOLLOW, ASHEN_MARSH, WEST_BELT, SUNDERED_PEAKS, FOOTHILL_ROUTE, TIDEWRECK_COAST, EMBERWOOD, HOLLOW_SPIRE, ...INTERIORS];
const inBounds = (b, x, y) => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h;
/** The region whose bounds contain (x,y), or null (the green/bog belt between). */
export function regionAt(x, y) { for (const R of REGIONS) if (inBounds(R.bounds, x, y)) return R; return null; }
/** Is a world point inside Greenhollow's (safe) bounds? */
export function inGreenhollow(x, y) { return inBounds(GREENHOLLOW.bounds, x, y); }
export function inMarsh(x, y) { return inBounds(ASHEN_MARSH.bounds, x, y); }
export function inPeaks(x, y) { return inBounds(SUNDERED_PEAKS.bounds, x, y); }

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
const tintLerp = (TINT, t) => {
  const r = (TINT >> 16) & 255, g = (TINT >> 8) & 255, b = TINT & 255;
  return (lerpCh(255, r, t) << 16) | (lerpCh(255, g, t) << 8) | lerpCh(255, b, t);
};

// ---- THE GREEN→STONE SEAM (N): grass → cold mountain ground. 1 inside the Peaks; a
// gradient across the 10-tile foothill band (the land RISES N), restricted to the
// foothill x-corridor so GH/Belt stay green (mirror of bogness for the W bog seam).
function stoneness(x, y) {
  if (inPeaks(x, y)) return 1;
  const fhX0 = FOOTHILL_ORIGIN.x - CHUNK_PX, fhX1 = FOOTHILL_ORIGIN.x + FH_W * TILE + CHUNK_PX;
  if (x < fhX0 || x >= fhX1) return 0;                      // only in the N foothill corridor
  const peaksS = SUNDERED_PEAKS.bounds.y + SUNDERED_PEAKS.bounds.h, ghN = GREENHOLLOW.bounds.y;
  if (y >= ghN) return 0;                                   // inside GH proper = still green
  if (y <= peaksS) return 1;                                // at/above the Peaks mouth = full stone
  return Math.max(0, Math.min(1, (ghN - y) / (ghN - peaksS)));
}
/** Ground tint for a chunk centre — grass → BOG_TINT (W) or STONE_TINT (N) across a seam. */
export function groundTintAt(x, y) {
  const s = stoneness(x, y); if (s > 0) return tintLerp(STONE_TINT, s);
  const t = bogness(x, y); if (t <= 0) return 0xffffff;
  return tintLerp(BOG_TINT, t);
}
export { bogness, stoneness };

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
  // CLUSTERED woodland with CLEARINGS (not a uniform fill): a few clump-centres per chunk; trees
  // gather near them with a falloff, the gaps between read as breathing-room clearings. Each tree
  // varies in SIZE (scale, skewed small with occasional big canopy), SPECIES (oak/pine/bush) and
  // is randomly H-FLIPPED — so no two read the same and the treeline composes, not repeats.
  const centers = [];
  const nClusters = 1 + Math.floor(rnd() * 3);
  for (let i = 0; i < nClusters; i++) centers.push([rnd() * CHUNK_PX, rnd() * CHUNK_PX]);
  const count = Math.round((9 + rnd() * 9) * ramp);
  for (let i = 0; i < count; i++) {
    const c = centers[(rnd() * centers.length) | 0];
    const ang = rnd() * Math.PI * 2, rad = (rnd() * rnd()) * (CHUNK_PX * 0.42);   // gaussian-ish clump
    const x = Math.max(6, Math.min(CHUNK_PX - 6, c[0] + Math.cos(ang) * rad));
    const y = Math.max(6, Math.min(CHUNK_PX - 6, c[1] + Math.sin(ang) * rad));
    const sz = rnd(), scale = 0.6 + sz * sz * 0.85;        // skew small; the rare big canopy
    let key;
    if (bog > 0.5) key = 'prop_tree_pine';
    else if (scale < 0.78) key = rnd() < 0.45 ? 'prop_bush' : (rnd() < 0.5 ? 'prop_tree_oak' : 'prop_tree_pine');
    else key = rnd() < 0.55 ? 'prop_tree_oak' : 'prop_tree_pine';
    props.push({ key, x: ox + x, y: oy + y, scale: key === 'prop_bush' ? 0.7 + rnd() * 0.5 : scale, flip: rnd() < 0.5 });
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
