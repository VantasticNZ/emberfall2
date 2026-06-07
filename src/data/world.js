// =============================================================================
// GREENHOLLOW VALE — the hub region, DATA ONLY. A continuous, lived-in village:
// a fountain SQUARE with the cast's homes CLUSTERED tight around it, the smithy
// set a little off (heat/noise), winding tracks out to the OUTSKIRTS/MEADOW
// (farm + orchard + brook) and the CROSSROADS. The whole vale is WALLED by a
// diegetic boundary — a dense treeline with marsh-gloom to the W and a foothill
// ridge to the N (a hint of the regions beyond), road GAPS where the roads leave.
// Edge-scatter decals soften every grass↔path seam. 3 SECRETS. SAFE ZONE.
// =============================================================================

const HERO = ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_chestnut', 'shirt_blue', 'pants_black', 'shoes_brown'];
const MARA = ['body_fem', 'head_fem', 'brows_chestnut', 'hair_bob_blonde', 'shirt_forest', 'pants_brown', 'shoes_brown_fem'];
const BRAM = ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_parted_gray', 'beard_gray', 'shirt_leather', 'pants_black', 'shoes_brown'];
const HODGE = ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_chestnut', 'beard_gray', 'shirt_leather', 'pants_brown', 'shoes_brown'];
const TAM = ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_chestnut', 'shirt_forest', 'pants_brown', 'shoes_brown'];
const PHIL = ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_parted_gray', 'shirt_blue', 'pants_black', 'shoes_brown'];
const FATLEY = ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_chestnut', 'beard_gray', 'shirt_leather', 'pants_black', 'shoes_brown'];
const PEM = ['body_fem', 'head_fem', 'brows_chestnut', 'hair_bob_blonde', 'shirt_leather', 'pants_brown', 'shoes_brown_fem'];

const W = 52, H = 40;
const fenceRun = (tx, ty, n) => Array.from({ length: n }, (_, i) => ({ key: 'prop_fence', tx: tx + i, ty, solid: true }));

// DIEGETIC BOUNDARY — a dense perimeter treeline kept STRICTLY inside the world
// bounds (so nothing clips the camera edge), with GAPS at the four road exits.
// W = marsh-gloom (darker tint, dead look); N = foothill ridge (grey, → the peaks).
// This is what the camera shows at every edge instead of empty void (the tree-fix).
function perimeter() {
  const out = [];
  const oak = 'prop_tree_oak', pine = 'prop_tree_pine';
  const GLOOM = 0x6f7d6a, RIDGE = 0x97a3ad;          // W marsh-gloom · N foothill-grey
  const T = (key, tx, ty, tint) => out.push({ key, tx, ty, solid: true, tint });
  const ewGap = (ty) => ty >= 18 && ty <= 21;        // the E–W road leaves W and E here
  const nsGap = (tx) => tx >= 24 && tx <= 28;         // the N–S road leaves N and S here
  // West wall (marsh gloom) — two staggered columns = a solid forest edge
  for (let ty = 3; ty <= 36; ty += 2) { if (ewGap(ty)) continue; T(ty % 4 ? oak : pine, 1, ty, GLOOM); T(pine, 2, Math.min(36, ty + 1), GLOOM); }
  // East wall (open wood) — two staggered columns
  for (let ty = 3; ty <= 36; ty += 2) { if (ewGap(ty)) continue; T(ty % 4 ? pine : oak, 50, ty); T(oak, 49, Math.min(36, ty + 1)); }
  // North ridge (foothills rising to the peaks) — a treeline + a low bush hedge in front
  for (let tx = 3; tx <= 49; tx += 2) { if (nsGap(tx)) continue; T(tx % 4 ? pine : oak, tx, 2, RIDGE); out.push({ key: 'prop_bush', tx, ty: 1, solid: false, tint: RIDGE }); }
  // South treeline (the meadow's far hedge) — skip the brook gap
  for (let tx = 3; tx <= 49; tx += 2) { if (nsGap(tx) || (tx >= 4 && tx <= 10)) continue; T(tx % 4 ? oak : pine, tx, 37); out.push({ key: 'prop_bush', tx, ty: 38, solid: false }); }
  return out;
}

export const WORLD = {
  widthTiles: W,
  heightTiles: H,

  // lived-in ground detail. Dense grass + sprinkled flowers/clover; ferns sparse.
  decals: {
    count: 230, seed: 20260607,
    pool: ['decal_tuft', 'decal_tuft', 'decal_tuft', 'decal_grass_lush', 'decal_grass_lush', 'decal_grass_lush',
      'decal_grass_tall', 'decal_grass_tall', 'decal_clover', 'decal_flower_pink', 'decal_flower_white', 'decal_flower_blue'],
  },
  ferns: { count: 14, seed: 4242, pool: ['decal_fern'] },
  dirt: { count: 26, seed: 13371, pool: ['decal_dirt_patch'] },
  // EDGE-SCATTER: tufts/ferns straddling every grass↔path/dirt seam + treeline base,
  // so no border is a hard straight line (no transition tiles are licence-loaded).
  edgeScatter: { seed: 99173, prob: 0.7, pool: ['decal_tuft', 'decal_grass_lush', 'decal_grass_tall', 'decal_fern', 'decal_clover'] },

  // GROUND: grass base + WINDING paved tracks (stepped, not straight) + farmland + gardens.
  ground: { base: 'tile_grass', rects: [
    // — the fountain SQUARE (paved plaza) —
    ['tile_path', 22, 16, 9, 8],
    // — north track to the crossroads (bends NW then straightens) —
    ['tile_path', 25, 13, 3, 3], ['tile_path', 24, 9, 3, 4], ['tile_path', 25, 3, 3, 6],
    // — south track to the meadow (bends SE) —
    ['tile_path', 25, 24, 3, 4], ['tile_path', 26, 28, 3, 5],
    // — east–west cross street (slight kink at the square) —
    ['tile_path', 12, 19, 10, 2], ['tile_path', 31, 19, 13, 2],
    // — short branch stubs to the doors —
    ['tile_path', 18, 17, 4, 2], ['tile_path', 31, 17, 4, 2], ['tile_path', 19, 22, 3, 6], ['tile_path', 31, 22, 5, 6],
    // — crossroads (north): the roads converge —
    ['tile_path', 14, 5, 11, 2], ['tile_path', 28, 5, 12, 2],
    // — the outskirts: farmland (worn earth) —
    ['tile_dirt', 7, 31, 8, 5], ['tile_dirt', 34, 31, 11, 4],
    // — house gardens (a different green) —
    ['tile_garden', 11, 12, 4, 3], ['tile_garden', 42, 29, 4, 3], ['tile_garden', 10, 22, 3, 3], ['tile_garden', 43, 16, 3, 3],
  ] },

  // the BROOK — a small banked pool in the SW meadow.
  pond: { tx: 5, ty: 33, w: 5, h: 3 },

  props: [
    // ---- the fountain square ----
    { key: 'prop_fountain', tx: 26, ty: 19, solid: true },                 // the village WELL (the heart)
    // ---- homes CLUSTERED tight around the square ----
    { key: 'prop_house_a', tx: 38, ty: 13, solid: true },                  // the MANOR (notable house, NE)
    { key: 'prop_house_paneled', tx: 23, ty: 11, solid: true, tint: 0xc4c4d0 }, // the CHAPEL (grey stone, N)
    { key: 'prop_house_b', tx: 12, ty: 12, solid: true, tint: 0xd8c8a0 },  // Pem's Store (tan, NW)
    { key: 'prop_house_b', tx: 13, ty: 25, solid: true },                  // a cottage (red brick, SW)
    { key: 'prop_house_paneled', tx: 37, ty: 26, solid: true },            // the TAVERN (Cracked Tankard, SE)
    { key: 'prop_house_b', tx: 42, ty: 21, solid: true, tint: 0xb8c8e0 },  // a cottage (whitewashed blue, E)
    // ---- the SMITHY set a little off (heat + noise), W ----
    { key: 'prop_forge', tx: 15, ty: 16, solid: true },
    // ---- a meadow homestead + its farm at the S edge ----
    { key: 'prop_house_b', tx: 41, ty: 34, solid: true, tint: 0xc8b890 },

    // ---- a couple of interior shade trees (depth; the boundary treeline is generated) ----
    { key: 'prop_tree_oak', tx: 33, ty: 16, solid: true }, { key: 'prop_tree_oak', tx: 19, ty: 14, solid: true },
    { key: 'prop_tree_oak', tx: 30, ty: 31, solid: true }, { key: 'prop_tree_pine', tx: 9, ty: 28, solid: true },
    // ---- the orchard (a tended row of oaks in the meadow) ----
    { key: 'prop_tree_oak', tx: 18, ty: 33, solid: true }, { key: 'prop_tree_oak', tx: 21, ty: 34, solid: true },
    { key: 'prop_tree_oak', tx: 33, ty: 34, solid: true }, { key: 'prop_tree_oak', tx: 36, ty: 33, solid: true },

    // ---- scenery: bushes, barrels/crates, gardens, fences, signs, a market stall ----
    { key: 'prop_bush', tx: 22, ty: 23, solid: false }, { key: 'prop_bush', tx: 30, ty: 23, solid: false },
    { key: 'prop_bush', tx: 20, ty: 17, solid: false }, { key: 'prop_bush', tx: 35, ty: 22, solid: false },
    { key: 'prop_bush', tx: 14, ty: 19, solid: false }, { key: 'prop_bush', tx: 45, ty: 18, solid: false },
    { key: 'prop_bush', tx: 40, ty: 30, solid: false }, { key: 'prop_bush', tx: 17, ty: 27, solid: false },
    // barrels/crates by the tavern, the forge, the store (a working village)
    { key: 'prop_barrel', tx: 35, ty: 27, solid: true }, { key: 'prop_barrel', tx: 36, ty: 28, solid: true },
    { key: 'prop_barrel', tx: 18, ty: 18, solid: true }, { key: 'prop_barrel', tx: 14, ty: 23, solid: true },
    { key: 'prop_barrel', tx: 29, ty: 22, solid: true },     // a market crate on the square
    // fenced gardens (the cottage plots)
    ...fenceRun(9, 24, 4), ...fenceRun(42, 17, 4),
    // signs: the waystone (crossroads gate), shop signs, the cave warning
    { key: 'prop_sign', tx: 26, ty: 7, solid: true },     // the WAYSTONE / village gate ("PEM WOZ ERE")
    { key: 'prop_sign', tx: 14, ty: 14, solid: true },    // Pem's Store sign
    { key: 'prop_sign', tx: 35, ty: 24, solid: true },    // the Cracked Tankard sign
    { key: 'prop_sign', tx: 15, ty: 35, solid: true },    // "Old Cave — boarded up" (FLAG: a cave-mouth sprite is wanted)
    // gate posts at the north road (a way OUT, framing the exit)
    { key: 'prop_fence', tx: 23, ty: 6, solid: true }, { key: 'prop_fence', tx: 29, ty: 6, solid: true },

    // ---- the diegetic BOUNDARY treeline (generated last; depth-sorts like any prop) ----
    ...perimeter(),
  ],

  // SECRETS — 3 rewarding hidden spots (wired to chest interactions in the scene).
  chests: [
    { id: 'chest_wood', tx: 3, ty: 30, gold: 40, line: 'Tucked in a hollow at the wood\'s edge — a small cache of coin. Forty gold!' },
    { id: 'chest_manor', tx: 44, ty: 11, gold: 25, line: "Behind the manor, half-buried — someone's hidden stash. Twenty-five gold." },
    { id: 'chest_tavern', tx: 40, ty: 28, gold: 15, line: 'Behind the Cracked Tankard, under a tarp — a publican\'s forgotten till. Fifteen gold.' },
  ],

  // THE CAST — clustered where they live/work; M1–M4 + hub side quests + the social system.
  npcs: [
    { tx: 25, ty: 22, facing: 'down', name: 'Mara', speed: 70, expression: 'happy', parts: MARA, quest: 'M1',
      done: ['Off you go then — and mind Old Edda, she\'s in a mood this morning.'] },
    { tx: 16, ty: 19, facing: 'down', name: 'Bram', speed: 70, expression: 'neutral', parts: BRAM, greeting: [
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
    { tx: 18, ty: 17, facing: 'down', name: 'Hodge', speed: 70, expression: 'neutral', parts: HODGE, quest: 'SG3',
      greeting: ['The forge runs hot all day. Come back when you\'ve hands for real work.'] },
    { tx: 29, ty: 21, facing: 'down', name: 'Tam', speed: 70, expression: 'happy', parts: TAM, quest: 'M2',
      greeting: ['Race you to the old cave! ...if your ma ever lets you off chores.'] },
    { tx: 14, ty: 23, facing: 'right', name: 'Phil McCracken', speed: 70, expression: 'neutral', parts: PHIL, quest: 'M3',
      greeting: ['Coin\'s coin, friend. Mind you don\'t lose any.'] },
    { tx: 35, ty: 28, facing: 'up', name: 'Fatley', speed: 70, expression: 'neutral', parts: FATLEY, quest: 'SG1',
      greeting: ['*hic* Oi. You. ...nah, later. Me back\'s gone.'] },
    { tx: 27, ty: 9, facing: 'down', name: 'Pem', speed: 70, expression: 'happy', parts: PEM, quest: 'SG2',
      greeting: ['*grins* You didn\'t see me. PEM WOZ ERE, though. Always.'] },
  ],

  player: { tx: 26, ty: 24, facing: 'up', speed: 95, expression: 'neutral', parts: HERO },

  base: HERO,
  maraParts: MARA, bramParts: BRAM,
  hodgeParts: HODGE, tamParts: TAM, philParts: PHIL, fatleyParts: FATLEY, pemParts: PEM,
};
