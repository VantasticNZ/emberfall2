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

  // Ground: a base fill, then dirt roads + a garden + a flower patch.
  ground: {
    base: 'tile_grass',
    // [key, tileX, tileY, widthTiles, heightTiles]
    rects: [
      ['tile_dirt',   0, 13, 40, 3],  // east-west road
      ['tile_dirt',  18,  0,  3, 28], // north-south road (crossroads)
      ['tile_garden', 4,  4,  5,  4], // tilled patch by the north house
      ['tile_flower',30,  4,  4,  3], // wildflowers
      ['tile_flower', 6, 21,  4,  2],
    ],
  },

  // Props. `solid` => Collision.makeSolid (footprint from manifest). Tall props
  // (houses) y-sort and occlude actors behind them (Gate C).
  props: [
    { key: 'prop_house',  tx: 6,  ty: 8,  solid: true },
    { key: 'prop_house',  tx: 31, ty: 19, solid: true },
    { key: 'prop_tree',   tx: 12, ty: 5,  solid: true },
    { key: 'prop_tree',   tx: 14, ty: 7,  solid: true },
    { key: 'prop_tree',   tx: 34, ty: 6,  solid: true },
    { key: 'prop_tree',   tx: 3,  ty: 20, solid: true },
    { key: 'prop_tree',   tx: 25, ty: 10, solid: true }, // by the road, for the occlusion test
    { key: 'prop_bush',   tx: 22, ty: 17, solid: false },
    { key: 'prop_bush',   tx: 9,  ty: 18, solid: false },
    { key: 'prop_mushroom', tx: 4, ty: 19, solid: false },
    { key: 'prop_barrel', tx: 28, ty: 18, solid: true },
    { key: 'prop_barrel', tx: 29, ty: 18, solid: true },
    {
      key: 'prop_sign', tx: 20, ty: 16, solid: true,
      interact: { prompt: 'Read', name: 'Signpost',
        lines: ['GREENHOLLOW', 'Population: small. Heart: large.', 'Mind the barrels. — the Hollowfolk'] },
    },
  ],

  // NPCs — same layered Character system as the hero; varied PARTS for variety.
  // Bryn is a watchman: he wears a sword + shield, proving NPCs use the same
  // equip pipeline the hero does.
  npcs: [
    { tx: 9, ty: 11, facing: 'down', name: 'Mara', speed: 70,
      parts: ['body_brown', 'hair_black', 'pants_brown', 'shoes_brown', 'shirt_forest'],
      lines: ["Morning! Bread's nearly out the oven.", 'You grew up fast, you know that?'] },
    { tx: 16, ty: 10, facing: 'left', name: 'Old Edda', speed: 55,
      parts: ['body_olive', 'hair_gold', 'pants_forest', 'shoes_black', 'shirt_brown', 'hat_feather'],
      lines: ['The Hearthflame remembers, child.', 'Some truths are kinder left in the ash.'] },
    { tx: 27, ty: 21, facing: 'up', name: 'Bryn', speed: 75,
      parts: ['body_light', 'hair_gold', 'pants_charcoal', 'shoes_black', 'shirt_brown', 'shield', 'sword'],
      lines: ['Heh. Mind where yer boots go.', "Tavern's shut. I drank it."] },
  ],

  // The hero starts at the crossroads, plainly dressed: the Gate M demo equips
  // a hat, sword and shield onto him live (keys 1/2/3) and triggers pickup (4).
  player: {
    tx: 19, ty: 18, facing: 'down', speed: 95,
    parts: ['body_light', 'hair_chestnut', 'pants_charcoal', 'shoes_brown', 'shirt_blue'],
  },
};
