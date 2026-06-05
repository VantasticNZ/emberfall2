// =============================================================================
// THE ASSET MANIFEST  —  the SINGLE SOURCE OF TRUTH for all art.
// (Quality Bible, Part 0 #3: ART-AGNOSTIC. "all art via a central manifest
//  (keys/sizes), so swapping art packs = swap the manifest, not rewrite logic.")
//
// RULES (enforced by convention across the codebase):
//   - Game code and systems reference ONLY logical keys (e.g. 'tile_grass',
//     'char_hero', 'npc_villager'). They NEVER name a file path or a pixel size.
//   - Everything an asset needs to be loaded, framed, collided and depth-sorted
//     is DATA declared here: its source, its grid, its footprint, its anims.
//   - A future art swap (new pack, or a 3D port) = edit THIS FILE ONLY.
// -----------------------------------------------------------------------------
// ART SOURCE STATUS (2026-06-05): PLACEHOLDER.
//   The Mana Seed starter pack CANNOT be used: its license forbids any project
//   that uses generative AI "anywhere in your development pipeline," explicitly
//   including "code" — and this project's code is AI-assisted. See
//   docs/ART-LICENSE-NOTE.md. Real art is pending Van's licensing decision.
//   While ART_SOURCE === 'placeholder', textures are generated procedurally
//   in-engine (ArtForge) at the SAME grid the real art will use, so the slice
//   proves the architecture + gates now. To adopt a license-compatible pack:
//     1. drop its files under /public/art/...
//     2. set ART_SOURCE = 'real'
//     3. fill each descriptor's `src` (+ confirm grid/footprint/anims).
//   Zero changes outside this file.
// =============================================================================

export const ART_SOURCE = 'placeholder'; // 'placeholder' | 'real'

// --- GRID CONVENTION (declared as data, never hard-coded in systems) ---------
//  World tiles : TILE px square. Floor/ground paints on a TILE grid.
//  Characters  : directional sheet, FRAME px square per cell. Row order is
//                [down, left, right, up]; columns are animation frames.
//                A pack with a different layout changes ONLY the numbers below.
export const TILE = 16;   // world tile size, px
export const FRAME = 64;  // character frame size, px  (Mana Seed-style 64; data only)

// Facing index -> sheet row, shared by every character (write-once mapping).
export const DIR_ROW = { down: 0, left: 1, right: 2, up: 3 };

// Helper so descriptors read declaratively.
const sheet = (cols, rows) => ({ frameWidth: FRAME, frameHeight: FRAME, cols, rows });

// =============================================================================
// THE ASSETS
//   kind      : 'tile' | 'image' | 'sheet'
//   src       : path under /public (string) when ART_SOURCE==='real'; null in
//               placeholder mode (ArtForge synthesises from `placeholder`).
//   footprint : {w,h,offX,offY} — the SOLID/visual base of the sprite in px,
//               anchored to the sprite's origin. Collision bodies and the
//               depth-sort anchor are derived from this, so "collider matches
//               the visual footprint" (Gate B) and the y-sort base (Gate C)
//               are ART DATA, not magic numbers in the systems.
//   anims     : named frame ranges {row, from, to} for 'sheet' assets.
//   placeholder: hints used only while ART_SOURCE==='placeholder'.
// =============================================================================
export const ASSETS = {
  // --- GROUND / FLOOR TILES (kind 'tile', TILE px) ---------------------------
  tile_grass: {
    kind: 'tile', src: 'art/tiles/grass.png', tileSize: TILE,
    placeholder: { base: 0x5a8f4a, speck: 0x6fa85c, kind: 'ground' },
  },
  tile_path: {
    kind: 'tile', src: 'art/tiles/path.png', tileSize: TILE,
    placeholder: { base: 0xc2a878, speck: 0xd4bd92, kind: 'ground' },
  },
  tile_dirt: {
    kind: 'tile', src: 'art/tiles/dirt.png', tileSize: TILE,
    placeholder: { base: 0x8a6b46, speck: 0x9c7d56, kind: 'ground' },
  },
  tile_water: {
    kind: 'tile', src: 'art/tiles/water.png', tileSize: TILE,
    placeholder: { base: 0x3a6ea5, speck: 0x4f86c0, kind: 'ground' },
  },

  // --- TALL PROPS (kind 'image'; y-sorted; footprint = base that collides) ---
  prop_tree: {
    kind: 'image', src: 'art/props/tree.png',
    width: 48, height: 64,
    footprint: { w: 18, h: 10, offX: 0, offY: 27 }, // trunk base only
    placeholder: { kind: 'tree' },
  },
  prop_house: {
    kind: 'image', src: 'art/props/house.png',
    width: 96, height: 96,
    footprint: { w: 88, h: 30, offX: 0, offY: 33 }, // wall base (doorway is data in world.js)
    placeholder: { kind: 'house' },
  },
  prop_sign: {
    kind: 'image', src: 'art/props/sign.png',
    width: 24, height: 28,
    footprint: { w: 14, h: 6, offX: 0, offY: 11 },
    placeholder: { kind: 'sign' },
  },
  prop_pot: {
    kind: 'image', src: 'art/props/pot.png',
    width: 16, height: 20,
    footprint: { w: 12, h: 7, offX: 0, offY: 6 },
    placeholder: { kind: 'pot' },
  },

  // --- CHARACTERS (kind 'sheet'; one write-once anim set; FRAME px) ----------
  char_hero: {
    kind: 'sheet', src: 'art/chars/hero.png', ...sheet(6, 4),
    footprint: { w: 16, h: 10, offX: 0, offY: 26 }, // feet box, centred-bottom
    anims: {
      'idle-down':  { row: 0, from: 0, to: 0 },
      'idle-left':  { row: 1, from: 0, to: 0 },
      'idle-right': { row: 2, from: 0, to: 0 },
      'idle-up':    { row: 3, from: 0, to: 0 },
      'walk-down':  { row: 0, from: 0, to: 5 },
      'walk-left':  { row: 1, from: 0, to: 5 },
      'walk-right': { row: 2, from: 0, to: 5 },
      'walk-up':    { row: 3, from: 0, to: 5 },
    },
    placeholder: { kind: 'char', body: 0x3b6ea5, trim: 0xf2d6a2 },
  },
  npc_villager: {
    kind: 'sheet', src: 'art/chars/villager.png', ...sheet(6, 4),
    footprint: { w: 16, h: 10, offX: 0, offY: 26 },
    anims: {
      'idle-down':  { row: 0, from: 0, to: 0 },
      'idle-left':  { row: 1, from: 0, to: 0 },
      'idle-right': { row: 2, from: 0, to: 0 },
      'idle-up':    { row: 3, from: 0, to: 0 },
      'walk-down':  { row: 0, from: 0, to: 5 },
      'walk-left':  { row: 1, from: 0, to: 5 },
      'walk-right': { row: 2, from: 0, to: 5 },
      'walk-up':    { row: 3, from: 0, to: 5 },
    },
    placeholder: { kind: 'char', body: 0x8a5a3b, trim: 0xe6c27a },
  },
  npc_elder: {
    kind: 'sheet', src: 'art/chars/elder.png', ...sheet(6, 4),
    footprint: { w: 16, h: 10, offX: 0, offY: 26 },
    anims: {
      'idle-down':  { row: 0, from: 0, to: 0 },
      'idle-left':  { row: 1, from: 0, to: 0 },
      'idle-right': { row: 2, from: 0, to: 0 },
      'idle-up':    { row: 3, from: 0, to: 0 },
      'walk-down':  { row: 0, from: 0, to: 5 },
      'walk-left':  { row: 1, from: 0, to: 5 },
      'walk-right': { row: 2, from: 0, to: 5 },
      'walk-up':    { row: 3, from: 0, to: 5 },
    },
    placeholder: { kind: 'char', body: 0x6b5a8a, trim: 0xd8d0e6 },
  },
};

// Convenience: animation key for an actor + state + facing (write-once naming).
export function animKey(state, facing) {
  return `${state}-${facing}`;
}
