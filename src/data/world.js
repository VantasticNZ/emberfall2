// =============================================================================
// GREENHOLLOW PROOF SLICE — DATA ONLY (Bible Part 0 #2: data-driven content).
// The scene builds the world purely from this structure on the write-once
// systems. Positions are TILE coordinates; the scene converts to px (TILE=32).
// Characters are LPC paper-dolls: just a list of PARTS (see assets.js) — NPCs
// and the hero differ only by the data they wear.
// =============================================================================

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
    {
      key: 'prop_sign', tx: 20, ty: 16, solid: true,
      interact: { prompt: 'Read', name: 'Signpost',
        lines: ['GREENHOLLOW', 'Population: small. Heart: large.', 'Mind the pond. — the Hollowfolk'] },
    },
  ],

  // NPCs — same layered Character system as the hero; varied PARTS for variety.
  // Bryn is a watchman: he wears a sword + shield, proving NPCs use the same
  // equip pipeline the hero does.
  npcs: [
    { tx: 9, ty: 11, facing: 'down', name: 'Mara', speed: 70, expression: 'happy',
      parts: ['body_brown', 'ears_brown', 'nose_brown', 'eyes_brown', 'brow_black', 'hair_black', 'pants_brown', 'shoes_brown', 'shirt_forest'],
      lines: ["Morning! Bread's nearly out the oven.", 'You grew up fast, you know that?'] },
    { tx: 16, ty: 10, facing: 'left', name: 'Old Edda', speed: 55, expression: 'sad',
      parts: ['body_olive', 'ears_olive', 'nose_olive', 'eyes_green', 'brow_gold', 'hair_gold', 'pants_forest', 'shoes_black', 'shirt_brown', 'hat_feather'],
      lines: ['The Hearthflame remembers, child.', 'Some truths are kinder left in the ash.'] },
    { tx: 27, ty: 21, facing: 'up', name: 'Bryn', speed: 75, expression: 'angry',
      parts: ['body_light', 'ears_light', 'nose_light', 'eyes_brown', 'brow_gold', 'hair_gold', 'pants_charcoal', 'shoes_black', 'shirt_brown', 'shield', 'sword'],
      lines: ['Heh. Mind where yer boots go.', "Tavern's shut. I drank it."] },
  ],

  // The hero starts at the crossroads, plainly dressed: the Gate M demo equips
  // a hat, sword and shield onto him live (keys 1/2/3) and triggers pickup (4).
  player: {
    tx: 19, ty: 18, facing: 'down', speed: 95, expression: 'neutral',
    parts: ['body_light', 'ears_light', 'nose_light', 'eyes_blue', 'brow_chestnut', 'hair_chestnut', 'pants_charcoal', 'shoes_brown', 'shirt_blue'],
  },
};
