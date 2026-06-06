// =============================================================================
// THE ASSET MANIFEST  —  the SINGLE SOURCE OF TRUTH for all art.
// (Quality Bible, Part 0 #3: ART-AGNOSTIC.)
//
// CHARACTERS: ElizaWy "LPC Revised" base (github.com/ElizaWy/LPC) — a COMPLETE
//   character base with full faces (eyes+brows+nose+mouth) and built-in
//   EXPRESSIONS (happy/sad/angry/shock). Licence OGA-BY 3.0 / CC-BY-SA 3.0
//   (no anti-AI clause). Unlike the universal sheets, ElizaWy ships one sheet
//   PER ANIMATION (idle/walk/attack), 64px frames, rows = facing (N,W,S,E),
//   cols = frames. Body + head + hair + clothing + props all share this format
//   and the SAME poses, so every layer aligns pixel-perfectly (no offset).
//   Pre-fetched to /public/art/eliza/<layer>/<state>.png by scripts/fetch_eliza.sh.
// TILES/PROPS: ElizaWy LPC terrain (OGA-BY 3.0), baked by build_lpc_terrain.py.
// (Mana Seed remains BANNED; the sanderfrenken universal base was replaced by
//  ElizaWy's for proper full faces — see docs/ART-LICENSE-NOTE.md.)
// =============================================================================

export const ART_SOURCE = 'real';

export const TILE = 32;   // world tile px (LPC terrain native; tiled 1:1)
export const FRAME = 64;  // character frame px

// Row order within every ElizaWy animation sheet: North, West, South, East.
export const DIR_ROW = { up: 0, left: 1, down: 2, right: 3 };

// =============================================================================
// ANIMATION STATES — each maps to one ElizaWy per-animation sheet. `frames` =
// columns per row (== sheet width / FRAME); a facing picks the row.
// =============================================================================
export const ANIMS = {
  idle:   { frames: 3, rate: 4,  repeat: -1 },
  walk:   { frames: 8, rate: 16, repeat: -1 },   // base fps; scaled to speed (below)
  attack: { frames: 7, rate: 14, repeat: 0 },    // Combat 1h - Slash
};
export const STATES = ['idle', 'walk', 'attack'];

// NO-SLIDE WALK: the leg cadence must match the move speed or the feet skate
// (the jolty/slow look). ElizaWy's walk advances ~WALK_STRIDE px of ground per
// step; an 8-frame cycle is 2 steps. So fps = 4*speed/stride, applied as a
// per-character anims timeScale. `run` is just walking at runSpeed => a faster
// (still matched) cycle. WALK_STRIDE is tuned to the eye.
export const WALK_STRIDE = 21;

// One-shot action states (settle back to idle when done).
export const ONESHOT = new Set(['attack']);

// EXPRESSIONS live on the head's Expressions sheet (expr.png): 12 expression
// COLUMNS x rows [legend, West, South, East]. North (back of head) has no face,
// so it falls back to the neutral idle head. Value = column index.
export const EXPRESSIONS = { neutral: 0, happy: 9, sad: 8, angry: 7, shock: 6 };
export const EXPR_COLS = 12;
export const EXPR_ROW = { left: 1, down: 2, right: 3 }; // 'up' => neutral head

// Draw order (low = behind).
const Z = {
  shieldBehind: 8, weaponBehind: 12, body: 20, shoes: 24, legs: 28, torso: 40,
  head: 50, brows: 55, beard: 57, hair: 60, weaponFront: 70, shieldFront: 72,
};

// =============================================================================
// PARTS — the paper-doll registry. A character is DATA: a list of parts. Each
// part fills one SLOT; equipping replaces the slot. A part contributes layers,
// each = { tex (folder under /art/eliza), z, expressive?, overrides? }.
//   expressive: the head — swaps to the expression face on idle (data-driven).
// (One outfit/skin is wired for the slice; colour/skin variants are more part
//  entries pointing at more /art/eliza/<folder>s — pure data, no logic change.)
// =============================================================================
export const PARTS = {
  body_ivory:    { slot: 'body',  label: 'Body',  layers: [{ tex: 'body', z: Z.body }] },
  head_ivory:    { slot: 'head',  label: 'Head',  layers: [{ tex: 'head', z: Z.head, expressive: true }] },
  brows_chestnut:{ slot: 'brows', label: 'Brows', layers: [{ tex: 'eyebrows', z: Z.brows }] },
  hair_chestnut: { slot: 'hair',  label: 'Hair',  layers: [{ tex: 'hair', z: Z.hair }] }, // hero — full "Natural"
  shirt_blue:    { slot: 'torso', label: 'Shirt', layers: [{ tex: 'shirt', z: Z.torso }] },
  pants_black:   { slot: 'legs',  label: 'Pants', layers: [{ tex: 'pants', z: Z.legs }] },
  shoes_brown:   { slot: 'feet',  label: 'Shoes', layers: [{ tex: 'shoes', z: Z.shoes }] },

  // --- distinct CAST layers (real ElizaWy LPC parts, not hue-rotation) ---
  // Mara — a feminine villager: feminine body/head, blonde bob, forest shirt.
  body_fem:        { slot: 'body',  label: 'Body',  layers: [{ tex: 'body_fem', z: Z.body }] },
  head_fem:        { slot: 'head',  label: 'Head',  layers: [{ tex: 'head_fem', z: Z.head, expressive: true }] },
  hair_bob_blonde: { slot: 'hair',  label: 'Hair',  layers: [{ tex: 'hair_mara', z: Z.hair }] },
  shirt_forest:    { slot: 'torso', label: 'Shirt', layers: [{ tex: 'shirt_forest', z: Z.torso }] },
  pants_brown:     { slot: 'legs',  label: 'Pants', layers: [{ tex: 'pants_fem', z: Z.legs }] },
  shoes_brown_fem: { slot: 'feet',  label: 'Shoes', layers: [{ tex: 'shoes_fem', z: Z.shoes }] },
  // Bram — an older bearded smith: gray parted hair + gray beard + leather shirt.
  hair_parted_gray:{ slot: 'hair',  label: 'Hair',  layers: [{ tex: 'hair_bram', z: Z.hair }] },
  beard_gray:      { slot: 'beard', label: 'Beard', layers: [{ tex: 'beard_bram', z: Z.beard }] },
  shirt_leather:   { slot: 'torso', label: 'Shirt', layers: [{ tex: 'shirt_leather', z: Z.torso }] },

  // Equipment (Gate M). ElizaWy weapons are COMBAT props — the swing is a 128px
  // oversize sheet (the blade extends past the body); a layer with `states`
  // shows only in those states. The sword draws + swings from the arm on attack.
  sword: { slot: 'weapon', label: 'Sword', layers: [
    { tex: 'sword_behind', z: Z.weaponBehind, fw: 128, states: ['attack'] },
    { tex: 'sword_front',  z: Z.weaponFront,  fw: 128, states: ['attack'] },
  ] },
  shield: { slot: 'shield', label: 'Shield', layers: [
    { tex: 'shield_behind', z: Z.shieldBehind, states: ['attack'] },
    { tex: 'shield_front',  z: Z.shieldFront,  states: ['attack'] },
  ] },
};

// Character footprint (feet box) in 64px frame space — collider + y-sort anchor.
export const CHAR_FOOTPRINT = { w: 16, h: 8, offX: 0, offY: 26 };

// =============================================================================
// TILES + PROPS + DECALS (LPC terrain, ElizaWy, OGA-BY 3.0).
// =============================================================================
export const TILES = {
  tile_grass:  { src: 'art/terrain/grass.png' },
  tile_dirt:   { src: 'art/terrain/dirt.png' },
  tile_path:   { src: 'art/terrain/path.png' },
  tile_water:  { src: 'art/terrain/water.png' },
  tile_garden: { src: 'art/terrain/garden.png' },
  // pond 9-slice (grass-banked water; blends to grass — replaces the flat blue box)
  pond_nw: { src: 'art/terrain/pond_nw.png' }, pond_n: { src: 'art/terrain/pond_n.png' }, pond_ne: { src: 'art/terrain/pond_ne.png' },
  pond_w:  { src: 'art/terrain/pond_w.png' },  pond_c: { src: 'art/terrain/pond_c.png' },  pond_e:  { src: 'art/terrain/pond_e.png' },
  pond_sw: { src: 'art/terrain/pond_sw.png' }, pond_s: { src: 'art/terrain/pond_s.png' }, pond_se: { src: 'art/terrain/pond_se.png' },
};

export const PROPS = {
  prop_tree_oak:  { src: 'art/terrain/tree_oak.png',  width: 94, height: 125,
                    footprint: { w: 16, h: 8, offX: 0, offY: 58 } },
  prop_tree_pine: { src: 'art/terrain/tree_pine.png', width: 60, height: 136,
                    footprint: { w: 12, h: 8, offX: 0, offY: 64 } },
  prop_bush:      { src: 'art/terrain/bush.png', width: 32, height: 32, footprint: null },
  prop_sign:      { src: 'art/terrain/sign.png', width: 24, height: 24,
                    footprint: { w: 14, h: 6, offX: 0, offY: 8 } },
  // The forge — a brick building assembled from the LPC house-exterior kit
  // (Sharm, CC-BY-SA/OGA-BY). Solid at the base; y-sorts like a tall prop.
  prop_forge:     { src: 'art/terrain/forge.png', width: 96, height: 128,
                    footprint: { w: 84, h: 18, offX: 0, offY: 54 } },
};

export const DECALS = {
  decal_tuft:         { src: 'art/terrain/decal_tuft.png' },
  decal_flower_pink:  { src: 'art/terrain/decal_flower_pink.png' },
  decal_flower_white: { src: 'art/terrain/decal_flower_white.png' },
  // ground-detail variety (lived-in field) — LPC plants_summer, OGA-BY
  decal_grass_lush:   { src: 'art/terrain/decal_grass_lush.png' },
  decal_grass_tall:   { src: 'art/terrain/decal_grass_tall.png' },
  decal_clover:       { src: 'art/terrain/decal_clover.png' },
  decal_fern:         { src: 'art/terrain/decal_fern.png' },
  decal_flower_blue:  { src: 'art/terrain/decal_flower_blue.png' },
  decal_dirt_patch:   { src: 'art/terrain/decal_dirt_patch.png' }, // soft worn ground
};

// Animation key for a layer texture + state + facing (write-once naming).
export function animFor(textureKey, state, facing) {
  return `${textureKey}-${state}-${facing}`;
}
