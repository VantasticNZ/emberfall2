// =============================================================================
// GREENHOLLOW — VERTICAL SLICE courtyard, DATA ONLY. A small village green on the
// write-once systems: a grass base, a banked POND (9-sliced LPC water that blends
// to grass — no flat blue box), whole trees + bushes + a sign, scattered decals.
// One talkable NPC (Mara, distinct RED shirt) wired to the real M1 quest.
// =============================================================================

const HERO = ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_chestnut', 'shirt_blue', 'pants_black', 'shoes_brown'];
const MARA = ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_chestnut', 'shirt_red', 'pants_black', 'shoes_brown'];

export const WORLD = {
  widthTiles: 40,
  heightTiles: 28,

  // grass is a flat fill; variety comes from off-grid decals (kept off the pond).
  decals: {
    count: 120, seed: 20260605,
    pool: ['decal_tuft', 'decal_tuft', 'decal_tuft', 'decal_flower_pink', 'decal_flower_white'],
  },

  // ground: grass everywhere (no raw road/path stripes). The pond is rendered
  // separately as a 9-slice (see scene._buildPond) so it has real banks.
  ground: { base: 'tile_grass', rects: [] },

  // a banked pond in the body of the green — 9-sliced from the LPC water block.
  pond: { tx: 7, ty: 18, w: 6, h: 4 },

  // props — trees placed in the body of the green (whole, not clipped at edges);
  // bushes + the village sign for life.
  props: [
    { key: 'prop_tree_oak',  tx: 14, ty: 10, solid: true },
    { key: 'prop_tree_oak',  tx: 28, ty: 11, solid: true },
    { key: 'prop_tree_oak',  tx: 31, ty: 19, solid: true },
    { key: 'prop_tree_pine', tx: 12, ty: 17, solid: true },
    { key: 'prop_tree_pine', tx: 25, ty: 8,  solid: true },
    { key: 'prop_tree_pine', tx: 34, ty: 13, solid: true },
    { key: 'prop_bush', tx: 16, ty: 13, solid: false },
    { key: 'prop_bush', tx: 24, ty: 15, solid: false },
    { key: 'prop_bush', tx: 30, ty: 16, solid: false },
    { key: 'prop_bush', tx: 17, ty: 22, solid: false },
    { key: 'prop_bush', tx: 20, ty: 9,  solid: false },
    { key: 'prop_sign', tx: 24, ty: 17, solid: true },
  ],

  // one talkable NPC, wired to the real M1 quest. Mara wears a RED shirt so she
  // reads as clearly distinct from the blue-shirted hero at a glance.
  npcs: [
    { tx: 21, ty: 15, facing: 'down', name: 'Mara', speed: 70, expression: 'happy', parts: MARA, quest: 'M1' },
  ],

  player: { tx: 18, ty: 16, facing: 'down', speed: 95, expression: 'neutral', parts: HERO },

  base: HERO,
  maraParts: MARA,
};
