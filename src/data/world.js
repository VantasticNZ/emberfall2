// =============================================================================
// GREENHOLLOW VALE — the hub region, DATA ONLY. A designed, sprawling village
// (not a staging field): a fountain SQUARE ringed by VARIED real LPC buildings on
// winding streets, opening N to the CROSSROADS (waystone), S to the OUTSKIRTS /
// MEADOW (farmland, orchard, brook, the old boarded cave), and W into the WOOD
// FRINGE (a hidden clearing). Lived-in scenery (fences, gardens, barrels, signs,
// flowers) + 3 SECRETS. The named cast live + work here. SAFE ZONE (no combat).
// =============================================================================

const HERO = ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_chestnut', 'shirt_blue', 'pants_black', 'shoes_brown'];
const MARA = ['body_fem', 'head_fem', 'brows_chestnut', 'hair_bob_blonde', 'shirt_forest', 'pants_brown', 'shoes_brown_fem'];
const BRAM = ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_parted_gray', 'beard_gray', 'shirt_leather', 'pants_black', 'shoes_brown'];
const HODGE = ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_chestnut', 'beard_gray', 'shirt_leather', 'pants_brown', 'shoes_brown'];
const TAM = ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_chestnut', 'shirt_forest', 'pants_brown', 'shoes_brown'];
const PHIL = ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_parted_gray', 'shirt_blue', 'pants_black', 'shoes_brown'];
const FATLEY = ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_chestnut', 'beard_gray', 'shirt_leather', 'pants_black', 'shoes_brown'];
const PEM = ['body_fem', 'head_fem', 'brows_chestnut', 'hair_bob_blonde', 'shirt_leather', 'pants_brown', 'shoes_brown_fem'];

// helper: a horizontal fence run (tileable segments)
const fenceRun = (tx, ty, n) => Array.from({ length: n }, (_, i) => ({ key: 'prop_fence', tx: tx + i, ty, solid: true }));

export const WORLD = {
  widthTiles: 52,
  heightTiles: 40,

  // lived-in ground detail. Dense grass with sprinkled flowers/clover; ferns sparse.
  decals: {
    count: 240, seed: 20260607,
    pool: ['decal_tuft', 'decal_tuft', 'decal_tuft', 'decal_grass_lush', 'decal_grass_lush', 'decal_grass_lush',
      'decal_grass_tall', 'decal_grass_tall', 'decal_clover', 'decal_flower_pink', 'decal_flower_white', 'decal_flower_blue'],
  },
  ferns: { count: 12, seed: 4242, pool: ['decal_fern'] },
  dirt: { count: 24, seed: 13371, pool: ['decal_dirt_patch'] },

  // GROUND: grass base + paved streets (path) + worn farmland + house gardens, so
  // the ground reads VARIED by zone, not one flat sheet.
  ground: { base: 'tile_grass', rects: [
    // — village streets + the fountain SQUARE (paved path) —
    ['tile_path', 25, 9, 3, 6],                 // north street (from the crossroads to the square)
    ['tile_path', 21, 15, 11, 9],               // the fountain SQUARE (plaza)
    ['tile_path', 25, 24, 3, 9],                // south street (square to the outskirts)
    ['tile_path', 12, 19, 40, 2],               // the east–west cross street through the square
    ['tile_path', 16, 16, 5, 2], ['tile_path', 32, 16, 5, 2],   // branch stubs to the west/east buildings
    ['tile_path', 17, 21, 4, 8], ['tile_path', 32, 21, 6, 8],   // stubs to the SW/SE houses
    // — the crossroads (north): five-road convergence —
    ['tile_path', 25, 3, 3, 6], ['tile_path', 13, 5, 13, 2], ['tile_path', 28, 5, 13, 2],
    // — the outskirts: farmland (worn earth) —
    ['tile_dirt', 6, 32, 9, 5], ['tile_dirt', 33, 32, 12, 4],
    // — house gardens (a different green) —
    ['tile_garden', 11, 12, 4, 3], ['tile_garden', 42, 30, 4, 3],
    ['tile_garden', 10, 21, 4, 3], ['tile_garden', 44, 16, 3, 3],
  ] },

  // the BROOK — a small banked pool in the south meadow.
  pond: { tx: 5, ty: 33, w: 5, h: 3 },

  // VARIED REAL BUILDINGS, ringing the square; tinted instances read distinct.
  props: [
    // ---- the fountain square ----
    { key: 'prop_fountain', tx: 26, ty: 19, solid: true },                 // the village WELL
    // ---- buildings (west cluster) ----
    { key: 'prop_forge', tx: 15, ty: 15, solid: true },                    // the SMITHY (Bram/Hodge)
    { key: 'prop_house_b', tx: 11, ty: 11, solid: true, tint: 0xd8c8a0 },  // Pem's Store (tan)
    { key: 'prop_house_b', tx: 12, ty: 26, solid: true },                  // a cottage (red brick)
    // ---- buildings (east cluster) ----
    { key: 'prop_house_a', tx: 40, ty: 12, solid: true },                  // the MANOR (notable house)
    { key: 'prop_house_paneled', tx: 39, ty: 27, solid: true },            // the TAVERN (Cracked Tankard)
    { key: 'prop_house_b', tx: 45, ty: 20, solid: true, tint: 0xb8c8e0 },  // a cottage (whitewashed blue)
    // ---- the chapel (north of the square) ----
    { key: 'prop_house_paneled', tx: 23, ty: 10, solid: true, tint: 0xc4c4d0 }, // the CHAPEL (grey stone)
    // ---- homestead (outskirts, south) ----
    { key: 'prop_house_b', tx: 43, ty: 34, solid: true, tint: 0xc8b890 },  // a meadow homestead

    // ---- WOOD FRINGE (west edge): dense trees + a path gap to a hidden clearing ----
    { key: 'prop_tree_pine', tx: 4, ty: 9, solid: true }, { key: 'prop_tree_pine', tx: 7, ty: 7, solid: true },
    { key: 'prop_tree_oak', tx: 4, ty: 15, solid: true }, { key: 'prop_tree_pine', tx: 7, ty: 18, solid: true },
    { key: 'prop_tree_oak', tx: 5, ty: 22, solid: true }, { key: 'prop_tree_pine', tx: 4, ty: 27, solid: true },
    { key: 'prop_tree_oak', tx: 8, ty: 30, solid: true },
    // ---- the orchard (south meadow): a loose row of oaks ----
    { key: 'prop_tree_oak', tx: 18, ty: 34, solid: true }, { key: 'prop_tree_oak', tx: 22, ty: 35, solid: true },
    { key: 'prop_tree_oak', tx: 26, ty: 34, solid: true }, { key: 'prop_tree_oak', tx: 30, ty: 35, solid: true },
    // ---- scattered shade trees ----
    { key: 'prop_tree_oak', tx: 34, ty: 16, solid: true }, { key: 'prop_tree_pine', tx: 48, ty: 26, solid: true },
    { key: 'prop_tree_oak', tx: 19, ty: 13, solid: true }, { key: 'prop_tree_pine', tx: 33, ty: 30, solid: true },

    // ---- scenery: bushes, barrels, gardens, fences, signs ----
    { key: 'prop_bush', tx: 22, ty: 22, solid: false }, { key: 'prop_bush', tx: 30, ty: 22, solid: false },
    { key: 'prop_bush', tx: 18, ty: 25, solid: false }, { key: 'prop_bush', tx: 36, ty: 22, solid: false },
    { key: 'prop_bush', tx: 14, ty: 18, solid: false }, { key: 'prop_bush', tx: 47, ty: 17, solid: false },
    { key: 'prop_bush', tx: 9, ty: 24, solid: false }, { key: 'prop_bush', tx: 42, ty: 31, solid: false },
    // barrels by the tavern + the forge
    { key: 'prop_barrel', tx: 36, ty: 28, solid: true }, { key: 'prop_barrel', tx: 37, ty: 29, solid: true },
    { key: 'prop_barrel', tx: 18, ty: 17, solid: true }, { key: 'prop_barrel', tx: 13, ty: 23, solid: true },
    // fenced gardens
    ...fenceRun(9, 23, 5), ...fenceRun(43, 18, 4),
    // signs: the waystone (crossroads), shop signs, the cave warning
    { key: 'prop_sign', tx: 26, ty: 7, solid: true },     // the WAYSTONE / gate ("PEM WOZ ERE" easter-egg)
    { key: 'prop_sign', tx: 14, ty: 13, solid: true },    // Pem's Store sign
    { key: 'prop_sign', tx: 37, ty: 25, solid: true },    // the Cracked Tankard sign
    { key: 'prop_sign', tx: 16, ty: 36, solid: true },    // "Old Cave — boarded up" (FLAG: a cave-mouth sprite is wanted)
  ],

  // SECRETS — 3 rewarding hidden spots (wired to chest interactions in the scene).
  chests: [
    { id: 'chest_wood', tx: 4, ty: 12, gold: 40, line: 'Tucked in a hollow off the wood path — a small cache of coin. Forty gold!' },
    { id: 'chest_manor', tx: 45, ty: 9, gold: 25, line: "Behind the manor, half-buried — someone's hidden stash. Twenty-five gold." },
    { id: 'chest_tavern', tx: 41, ty: 30, gold: 15, line: 'Behind the Cracked Tankard, under a tarp — a publican\'s forgotten till. Fifteen gold.' },
  ],

  // THE CAST — living + working in the village. Childhood quests M1–M4 + the social
  // system woven in (Bram's CHA shop). Hub side-quest givers placed for the return.
  npcs: [
    { tx: 24, ty: 22, facing: 'down', name: 'Mara', speed: 70, expression: 'happy', parts: MARA, quest: 'M1',
      done: ['Off you go then — and mind Old Edda, she\'s in a mood this morning.'] },
    { tx: 16, ty: 18, facing: 'down', name: 'Bram', speed: 70, expression: 'neutral', parts: BRAM, greeting: [
      "There's my little terror — up early for once! The forge is hot if you've come to watch me work.",
    ],
      social: { start: 'shop', nodes: {
        shop: { speaker: 'Bram', text: "Grown now, and after steel. A good steel sword runs {price:steel_sword}g — and I price by the cut of a person, mind.",
          options: [
            { label: 'Buy the steel sword ({price:steel_sword}g)', set: 'buy:steel_sword', to: 'bought' },
            { label: 'Haggle him down', check: { type: 'persuade', dc: 6, onPass: 'haggled', onFail: 'refused', onPassDeed: 'haggled_bram' } },
            { label: '(Maybe later.)', end: true },
          ] },
        bought: { speaker: 'Bram', text: 'Mind the edge — it bites truer than your tongue.', options: [{ label: '(Take it.)', end: true }] },
        haggled: { speaker: 'Bram', text: "...Hah. Silver tongue on you. Fine — a few coins off, just this once.", options: [{ label: '(Pocket the saving.)', end: true }] },
        refused: { speaker: 'Bram', text: 'Nice try. The price is the price — earn a name first.', options: [{ label: '(Let it stand.)', end: true }] },
      } } },
    { tx: 19, ty: 17, facing: 'down', name: 'Hodge', speed: 70, expression: 'neutral', parts: HODGE, quest: 'SG3',
      greeting: ['The forge runs hot all day. Come back when you\'ve hands for real work.'] },
    { tx: 30, ty: 24, facing: 'down', name: 'Tam', speed: 70, expression: 'happy', parts: TAM, quest: 'M2',
      greeting: ['Race you to the old cave! ...if your ma ever lets you off chores.'] },
    { tx: 13, ty: 23, facing: 'right', name: 'Phil McCracken', speed: 70, expression: 'neutral', parts: PHIL, quest: 'M3',
      greeting: ['Coin\'s coin, friend. Mind you don\'t lose any.'] },
    { tx: 36, ty: 30, facing: 'up', name: 'Fatley', speed: 70, expression: 'neutral', parts: FATLEY, quest: 'SG1',
      greeting: ['*hic* Oi. You. ...nah, later. Me back\'s gone.'] },
    { tx: 27, ty: 8, facing: 'down', name: 'Pem', speed: 70, expression: 'happy', parts: PEM, quest: 'SG2',
      greeting: ['*grins* You didn\'t see me. PEM WOZ ERE, though. Always.'] },
  ],

  player: { tx: 26, ty: 25, facing: 'up', speed: 95, expression: 'neutral', parts: HERO },

  base: HERO,
  maraParts: MARA, bramParts: BRAM,
  hodgeParts: HODGE, tamParts: TAM, philParts: PHIL, fatleyParts: FATLEY, pemParts: PEM,
};
