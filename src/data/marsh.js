// =============================================================================
// ASHEN MARSH — arrival area, DATA ONLY (the bog approach + Mirefen + Hagga's
// vicinity). Same write-once systems + the proven Greenhollow render pattern,
// with a MURKY bog mood applied via tints (no bog-specific tiles are licence-
// confirmed yet — FLAGGED; we build with the real LPC water/grass/trees, mood-
// tinted, not placeholders). Wired to the EXISTING M8 quest (talk to Elder Yssa).
// =============================================================================

const HERO = ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_chestnut', 'shirt_blue', 'pants_black', 'shoes_brown'];
// Marsh cast (distinct via hair/shirt — limited LPC palette; FLAG: more colour/hair
// variants + an "old crone" body would distinguish Yssa/Hagga better).
const YSSA = ['body_fem', 'head_fem', 'brows_chestnut', 'hair_parted_gray', 'shirt_forest', 'pants_brown', 'shoes_brown_fem'];
const HAGGA = ['body_fem', 'head_fem', 'brows_chestnut', 'hair_bob_blonde', 'shirt_leather', 'pants_brown', 'shoes_brown_fem'];

export const MARSH = {
  widthTiles: 40,
  heightTiles: 34,

  // bog mood — the scene multiplies these onto the LPC tiles/props (tinting, not
  // new art). FLAG: proper bog tiles (mud, black water, dead trees, stilt
  // boardwalk, Hagga's hut) would replace the tints.
  tint: { ground: 0x8d9a6e, water: 0x3f5f57, tree: 0x9aa087, decal: 0x9aa882 },

  // reeds + mud, denser than the green (a waterlogged, lived-in mire).
  decals: {
    count: 150, seed: 99001,
    pool: ['decal_grass_tall', 'decal_grass_tall', 'decal_flower_blue', 'decal_flower_blue',
      'decal_tuft', 'decal_clover', 'decal_fern'],
  },
  mud: { count: 26, seed: 4242, pool: ['decal_dirt_patch'] },

  ground: { base: 'tile_grass' },

  // the BLACK WATER — several pools (9-sliced ponds, tinted dark).
  pools: [
    { tx: 6, ty: 19, w: 9, h: 5 },
    { tx: 25, ty: 22, w: 7, h: 4 },
    { tx: 17, ty: 7, w: 5, h: 3 },
    { tx: 30, ty: 11, w: 4, h: 3 },
  ],

  // dead trees (pines, gray-brown tinted) + the marsh sign. All in the ty10-27 band.
  props: [
    { key: 'prop_tree_pine', tx: 11, ty: 12, solid: true },
    { key: 'prop_tree_pine', tx: 29, ty: 13, solid: true },
    { key: 'prop_tree_pine', tx: 34, ty: 22, solid: true },
    { key: 'prop_tree_pine', tx: 14, ty: 26, solid: true },
    { key: 'prop_tree_pine', tx: 22, ty: 16, solid: true },
    { key: 'prop_tree_oak',  tx: 36, ty: 16, solid: true },
    { key: 'prop_sign', tx: 19, ty: 20, solid: true },
  ],

  // Elder Yssa guards the boardwalk into Mirefen (talk -> the real M8 quest).
  // Hagga waits across the black water with a short line (M8 reaches her in dialogue).
  npcs: [
    { tx: 20, ty: 17, facing: 'down', name: 'Elder Yssa', speed: 60, expression: 'sad', parts: YSSA, quest: 'M8',
      done: ['Mind the black water, outsider. Hagga waits — and her truth waits with her.'] },
    { tx: 30, ty: 26, facing: 'up', name: 'Hagga', speed: 60, expression: 'neutral', parts: HAGGA, greeting: [
      "Across the black water, they said, and across you came. Good. The Sunken Shrine first — then the truth.",
    ] },
  ],

  player: { tx: 19, ty: 29, facing: 'up', speed: 95, expression: 'neutral', parts: HERO },

  base: HERO,
  yssaParts: YSSA,
  haggaParts: HAGGA,
};
