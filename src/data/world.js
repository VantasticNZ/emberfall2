// =============================================================================
// GREENHOLLOW — VERTICAL SLICE courtyard, DATA ONLY. A small village green on the
// write-once systems: a grass base with a generous margin BEYOND the tree line on
// every edge (so trees never clip the world/screen edge), a banked POND, whole
// trees + bushes + a sign + the forge, and lived-in ground-detail scatter (varied
// grass/flowers/clover + worn dirt patches). Mara (M1 quest) + Bram (at the forge).
// =============================================================================

// Real, distinct LPC outfits (own body/hair/clothing layers — not a hue hack).
const HERO = ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_chestnut', 'shirt_blue', 'pants_black', 'shoes_brown'];
const MARA = ['body_fem', 'head_fem', 'brows_chestnut', 'hair_bob_blonde', 'shirt_forest', 'pants_brown', 'shoes_brown_fem'];
const BRAM = ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_parted_gray', 'beard_gray', 'shirt_leather', 'pants_black', 'shoes_brown'];

export const WORLD = {
  widthTiles: 40,
  heightTiles: 34,   // taller than the play area -> grass MARGIN above/below the trees

  // lived-in ground detail (varied grass/flowers/clover/fern), weighted so grass
  // dominates and flowers/fern are sprinkled — not a uniform sheet, not clutter.
  decals: {
    count: 150, seed: 20260605,
    pool: [
      'decal_tuft', 'decal_tuft', 'decal_tuft', 'decal_grass_lush', 'decal_grass_lush', 'decal_grass_lush',
      'decal_grass_tall', 'decal_grass_tall', 'decal_clover', 'decal_flower_pink',
      'decal_flower_white', 'decal_flower_blue',
    ],
  },
  // a few larger ferns, sparse, so they read as the odd wild plant — not clutter.
  ferns: { count: 7, seed: 4242, pool: ['decal_fern'] },
  // soft worn-dirt patches (drawn under the plants) for trodden, lived-in ground.
  dirt: { count: 12, seed: 13371, pool: ['decal_dirt_patch'] },

  ground: { base: 'tile_grass', rects: [] },

  // banked pond in the lower-left of the green.
  pond: { tx: 6, ty: 22, w: 6, h: 4 },

  // props — all trees sit in the ty13-26 band (top margin ty0-12, bottom ty27-33),
  // so every tree renders whole. The forge is Greenhollow's smithy (Bram's).
  props: [
    { key: 'prop_tree_oak',  tx: 13, ty: 13, solid: true },
    { key: 'prop_tree_oak',  tx: 31, ty: 14, solid: true },
    { key: 'prop_tree_oak',  tx: 34, ty: 25, solid: true },
    { key: 'prop_tree_pine', tx: 9,  ty: 17, solid: true },
    { key: 'prop_tree_pine', tx: 16, ty: 27, solid: true },
    { key: 'prop_tree_pine', tx: 36, ty: 20, solid: true },
    { key: 'prop_bush', tx: 16, ty: 15, solid: false },
    { key: 'prop_bush', tx: 28, ty: 17, solid: false },
    { key: 'prop_bush', tx: 32, ty: 19, solid: false },
    { key: 'prop_bush', tx: 14, ty: 24, solid: false },
    { key: 'prop_bush', tx: 33, ty: 22, solid: false },
    { key: 'prop_sign', tx: 21, ty: 16, solid: true },
    { key: 'prop_forge', tx: 24, ty: 13, solid: true },
  ],

  // NPCs — Mara (M1 quest) stands in the green; Bram (greeting only for now) stands
  // AT the forge, so "Bram's down at the forge already" pays off when you walk over.
  npcs: [
    { tx: 19, ty: 18, facing: 'down', name: 'Mara', speed: 70, expression: 'happy', parts: MARA, quest: 'M1' },
    { tx: 24, ty: 16, facing: 'down', name: 'Bram', speed: 70, expression: 'neutral', parts: BRAM, greeting: [
      "There's my little terror — up early for once! The forge is hot if you've come to watch me work.",
      "Go on now, say hello to your mother before she skins the both of us. I'll be right here.",
    ] },
  ],

  player: { tx: 17, ty: 19, facing: 'down', speed: 95, expression: 'neutral', parts: HERO },

  base: HERO,
  maraParts: MARA,
  bramParts: BRAM,
};
