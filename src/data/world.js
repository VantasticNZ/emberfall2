// =============================================================================
// GREENHOLLOW PROOF SLICE — DATA ONLY (Bible Part 0 #2: data-driven content).
// The scene builds the world purely from this structure using the write-once
// systems. Every position is in TILE coordinates; the scene converts to px.
// A new area is a new data file like this — not new code.
// =============================================================================

export const WORLD = {
  tile: 16,
  widthTiles: 60,   // 960 px  — wider than the 480px viewport (tests camera clamp)
  heightTiles: 44,  // 704 px

  // Ground is painted in layers: a base fill, then path strips, then patches.
  ground: {
    base: 'tile_grass',
    // [key, tileX, tileY, widthTiles, heightTiles]
    rects: [
      ['tile_path', 0, 20, 60, 4],   // east-west road
      ['tile_path', 28, 0, 4, 44],   // north-south road (crossroads at the village)
      ['tile_dirt', 6, 6, 7, 5],     // a tilled patch by the north house
      ['tile_dirt', 44, 30, 8, 6],   // a yard by the south house
      ['tile_water', 46, 6, 9, 7],   // a pond (visual; edged by trees)
    ],
  },

  // Props. `solid` => Collision.makeSolid (footprint from manifest). All props
  // y-sort by their footprint base (tall ones occlude actors behind them).
  props: [
    { key: 'prop_house', tx: 9,  ty: 9,  solid: true },
    { key: 'prop_house', tx: 47, ty: 27, solid: true },
    { key: 'prop_tree',  tx: 18, ty: 7,  solid: true },
    { key: 'prop_tree',  tx: 21, ty: 9,  solid: true },
    { key: 'prop_tree',  tx: 43, ty: 5,  solid: true },
    { key: 'prop_tree',  tx: 55, ty: 13, solid: true },
    { key: 'prop_tree',  tx: 14, ty: 30, solid: true },
    { key: 'prop_tree',  tx: 38, ty: 16, solid: true }, // stands on the road edge for occlusion test
    { key: 'prop_pot',   tx: 12, ty: 13, solid: true },
    { key: 'prop_pot',   tx: 13, ty: 13, solid: true },
    { key: 'prop_pot',   tx: 49, ty: 31, solid: true },
    {
      key: 'prop_sign', tx: 30, ty: 23, solid: true,
      interact: { prompt: 'Read', name: 'Signpost',
        lines: ['GREENHOLLOW', 'Population: small. Heart: large.', 'Mind the pots. — the Hollowfolk'] },
    },
  ],

  // NPCs (double-ups are fine for the proof). Each is an interactable that
  // talks. They use the same character system + footprint as the player.
  npcs: [
    { key: 'npc_villager', tx: 24, ty: 18, facing: 'down', name: 'Mara',
      lines: ['Morning! Bread\'s nearly out the oven.', 'You grew up fast, you know that?'] },
    { key: 'npc_elder', tx: 35, ty: 22, facing: 'left', name: 'Old Edda',
      lines: ['The Hearthflame remembers, child.', 'Some truths are kinder left in the ash.'] },
    { key: 'npc_villager', tx: 41, ty: 30, facing: 'up', name: 'Bryn',
      lines: ['Heh. Mind where yer boots go.', 'Tavern\'s shut. I drank it.'] },
  ],

  // Where the hero starts (at the crossroads).
  player: { key: 'char_hero', tx: 30, ty: 26, facing: 'down', speed: 95 },
};
