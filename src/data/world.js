// =============================================================================
// GREENHOLLOW PROOF SLICE — DATA ONLY (Bible Part 0 #2: data-driven content).
// The scene builds the world purely from this structure on the write-once
// systems. Positions are TILE coordinates; the scene converts to px (TILE=32).
// Characters are LPC paper-dolls: just a list of PARTS (see assets.js) — NPCs
// and the hero differ only by the data they wear.
// =============================================================================

// The ElizaWy base outfit (one skin/outfit for this migration slice).
const ELIZA_BASE = ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_chestnut',
  'shirt_blue', 'pants_black', 'shoes_brown'];

export const WORLD = {
  widthTiles: 40,   // 1280 px — wider than the 480px viewport (camera clamp)
  heightTiles: 28,  // 896 px

  // Scattered grass decals (off-grid) so the flat grass base isn't uniform.
  // pool repeats favour tufts over flowers; seed keeps screenshots stable.
  decals: {
    count: 110, seed: 20260605,
    pool: ['decal_tuft', 'decal_tuft', 'decal_tuft', 'decal_flower_pink', 'decal_flower_white'],
  },

  // Ground: a base fill, then a dirt road + a sand path + a garden + a pond.
  ground: {
    base: 'tile_grass',
    // [key, tileX, tileY, widthTiles, heightTiles]
    rects: [
      ['tile_dirt',   0, 13, 40, 3],  // east-west road
      ['tile_path',  18,  0,  3, 28], // north-south path (crossroads)
      ['tile_garden', 4,  4,  5,  4], // tilled patch
      ['tile_water', 31,  4,  6,  5], // pond
    ],
  },

  // Props. `solid` => Collision.makeSolid (footprint from manifest). Tall LPC
  // trees y-sort and occlude actors behind them (Gate C).
  props: [
    { key: 'prop_tree_oak',  tx: 6,  ty: 8,  solid: true },
    { key: 'prop_tree_oak',  tx: 24, ty: 9,  solid: true }, // by the road, for the occlusion test
    { key: 'prop_tree_oak',  tx: 34, ty: 19, solid: true },
    { key: 'prop_tree_pine', tx: 12, ty: 6,  solid: true },
    { key: 'prop_tree_pine', tx: 3,  ty: 20, solid: true },
    { key: 'prop_tree_pine', tx: 37, ty: 9,  solid: true },
    { key: 'prop_bush',      tx: 9,  ty: 18, solid: false },
    { key: 'prop_bush',      tx: 22, ty: 17, solid: false },
    { key: 'prop_bush',      tx: 28, ty: 11, solid: false },
    { key: 'prop_bush',      tx: 14, ty: 22, solid: false },
    { key: 'prop_sign', tx: 24, ty: 16, solid: true },
  ],

  // NPCs — same layered Character system as the hero; varied PARTS for variety.
  // Bryn is a watchman: he wears a sword + shield, proving NPCs use the same
  // equip pipeline the hero does.
  // NPCs share the ElizaWy base outfit for this slice; each carries a different
  // EXPRESSION (happy/sad/angry) — the migration's headline. Colour/skin/hair
  // variants are more PARTS (data) once their /art/eliza folders are added.
  // VERTICAL SLICE — STAGE 1: one talkable NPC (Mara), wired to the real M1
  // quest dialogue via the QuestEngine. `quest` names the quest her interaction
  // starts. (Childhood-callback colour/expression NPCs return in later stages.)
  npcs: [
    { tx: 22, ty: 16, facing: 'down', name: 'Mara', speed: 70, expression: 'happy',
      parts: ELIZA_BASE, quest: 'M1' },
  ],

  // The base outfit, re-exported so portraits can reuse it per speaker.
  base: ELIZA_BASE,

  player: {
    tx: 19, ty: 18, facing: 'down', speed: 95, expression: 'neutral',
    parts: ELIZA_BASE,
  },
};
