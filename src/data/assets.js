// =============================================================================
// THE ASSET MANIFEST  —  the SINGLE SOURCE OF TRUTH for all art.
// (Quality Bible, Part 0 #3: ART-AGNOSTIC. "all art via a central manifest
//  (keys/sizes), so swapping art packs = swap the manifest, not rewrite logic.")
//
// RULES:
//   - Game code references ONLY logical keys (tile_grass, part 'body_light',
//     'sword') + animation STATES (idle/walk/run/attack/cast/use/pickup). It
//     never names a file path, a pixel size, or a sheet row.
//   - Everything needed to load, frame, animate, collide and depth-sort is DATA
//     declared here. A future art swap = edit THIS FILE ONLY.
// -----------------------------------------------------------------------------
// ART SOURCE STATUS (2026-06-05): REAL, AI-SAFE.
//   CHARACTERS: LPC (Liberated Pixel Cup) via the Universal-LPC-Spritesheet
//     project. 64px frames, LAYERED paper-doll (body+legs+feet+clothes+hair+hat
//     +weapon+shield). Licences: CC-BY-SA 3.0 / OGA-BY 3.0 / GPL 3.0 — NO anti-AI
//     clause => safe for this AI-assisted project. (Mana Seed remains BANNED: its
//     licence forbids AI-built projects. See docs/ART-LICENSE-NOTE.md.)
//   TILES/PROPS: LPC's OWN terrain (ElizaWy LPC, OGA-BY 3.0) — same art family
//     as the characters, so pixel density matches (cohesion). Pre-baked by
//     scripts/build_lpc_terrain.py into /public/art/terrain/. (The earlier
//     Kenney "Tiny Town" set was swapped out for cohesion; see ART-LICENSE-NOTE.)
// =============================================================================

export const ART_SOURCE = 'real';

// --- GRID CONVENTIONS (data, never hard-coded in systems) --------------------
//  WORLD TILES : LPC terrain is TILE px native, tiled 1:1 (no upscale => not
//                blocky, and same pixel density as the 64px characters). Tall
//                tree props (~125-136px) out-scale the hero (Gate C occlusion).
//  CHARACTERS  : LPC universal sheet, FRAME px square cells, 13 columns.
//                Animation BLOCKS are 4 rows in LPC direction order N,W,S,E; a
//                facing picks a row via DIR_ROW. Oversize attack art (the sword
//                swing) lives on a 192px sheet, centred on the same anchor, so
//                origin-0.5 stacking keeps every layer aligned regardless of
//                frame size.
export const TILE = 32;           // world tile px (LPC terrain native; tiled 1:1)
export const FRAME = 64;          // LPC character frame px

// LPC row order WITHIN an animation block: North, West, South, East.
export const DIR_ROW = { up: 0, left: 1, down: 2, right: 3 };

// =============================================================================
// ANIMATION CLIPS — the ONE write-once anim set every character + layer shares.
//   block  : first sheet row of the animation block (DIR_ROW is added to it)
//   frames : column indices played, in order
//   fw     : frame px of the texture this clip is read from (64 standard;
//            192 for the oversize sword swing)
//   The classic LPC universal rows used here (spellcast 0-3, thrust 4-7,
//   walk 8-11, slash 12-15) exist in EVERY layer sheet, so all layers stay in
//   lock-step. 'run' reuses the walk rows faster (LPC base has no separate run
//   that all equipment layers share); 'pickup' is a short reach built from the
//   thrust frames (LPC has no dedicated pickup) — documented, not hidden.
// =============================================================================
export const CLIPS = {
  idle:   { fw: 64, block: 8,  frames: [0],                   rate: 1,  repeat: 0 },
  walk:   { fw: 64, block: 8,  frames: [1, 2, 3, 4, 5, 6, 7, 8], rate: 8,  repeat: -1 },
  run:    { fw: 64, block: 8,  frames: [1, 2, 3, 4, 5, 6, 7, 8], rate: 13, repeat: -1 },
  cast:   { fw: 64, block: 0,  frames: [0, 1, 2, 3, 4, 5, 6],  rate: 9,  repeat: 0 },
  use:    { fw: 64, block: 4,  frames: [0, 1, 2, 3, 4, 5, 6, 7], rate: 11, repeat: 0 },
  pickup: { fw: 64, block: 4,  frames: [1, 2, 3, 2, 1],        rate: 9,  repeat: 0 },
  attack: { fw: 64, block: 12, frames: [0, 1, 2, 3, 4, 5],     rate: 13, repeat: 0 },
  // Oversize sword-swing clip: 192px sheet, rows 0-3 = N,W,S,E, 6 frames.
  attack_oversize: { fw: 192, block: 0, frames: [0, 1, 2, 3, 4, 5], rate: 13, repeat: 0 },
};

// States that loop vs play once is derived from `repeat`; the action states
// (one-shot) settle back to idle/walk when done.
export const ONESHOT = new Set(['attack', 'cast', 'use', 'pickup']);

// =============================================================================
// LAYER TEXTURES — every LPC sheet that can be drawn as a character layer.
//   src  : path under /public
//   fw   : frame px (64 universal | 192 oversize)
//   cols : columns in the sheet (frame index = row*cols + col)
//   states: which CLIP states this texture provides art for (registered as
//           animations). Standard sheets provide the full set; the oversize
//           swing sheets provide only the 'attack' state (via attack_oversize).
// =============================================================================
const STD_STATES = ['idle', 'walk', 'run', 'cast', 'use', 'pickup', 'attack'];
const tex64 = (src) => ({ src, fw: 64, cols: 13, states: STD_STATES });

export const LAYER_TEXTURES = {
  // bodies (NPC variety = body colour)
  body_light: tex64('art/lpc/body_light.png'),
  body_brown: tex64('art/lpc/body_brown.png'),
  body_olive: tex64('art/lpc/body_olive.png'),
  // eyes + brows (the v3 base body has a BLANK face — these are their own layers)
  eyes_blue:  tex64('art/lpc/eyes_blue.png'),
  eyes_brown: tex64('art/lpc/eyes_brown.png'),
  eyes_green: tex64('art/lpc/eyes_green.png'),
  brow_chestnut: tex64('art/lpc/brow_chestnut.png'),
  brow_black:    tex64('art/lpc/brow_black.png'),
  brow_gold:     tex64('art/lpc/brow_gold.png'),
  // nose + ears (skin-toned; complete the face)
  nose_light: tex64('art/lpc/nose_light.png'),
  nose_brown: tex64('art/lpc/nose_brown.png'),
  nose_olive: tex64('art/lpc/nose_olive.png'),
  ears_light: tex64('art/lpc/ears_light.png'),
  ears_brown: tex64('art/lpc/ears_brown.png'),
  ears_olive: tex64('art/lpc/ears_olive.png'),
  // hair
  hair_chestnut: tex64('art/lpc/hair_chestnut.png'),
  hair_black:    tex64('art/lpc/hair_black.png'),
  hair_gold:     tex64('art/lpc/hair_gold.png'),
  // legs / feet
  legs_charcoal: tex64('art/lpc/legs_charcoal.png'),
  legs_forest:   tex64('art/lpc/legs_forest.png'),
  legs_brown:    tex64('art/lpc/legs_brown.png'),
  feet_brown:    tex64('art/lpc/feet_brown.png'),
  feet_black:    tex64('art/lpc/feet_black.png'),
  // torso (shirt)
  torso_blue:    tex64('art/lpc/torso_blue.png'),
  torso_forest:  tex64('art/lpc/torso_forest.png'),
  torso_brown:   tex64('art/lpc/torso_brown.png'),
  // hat
  hat_feathercap: tex64('art/lpc/hat_feathercap.png'),
  // weapon carry (held during walk/idle/cast/use) — front + behind halves
  weapon_carry:        tex64('art/lpc/weapon_carry.png'),
  weapon_carry_behind: tex64('art/lpc/weapon_carry_behind.png'),
  // weapon swing (the slash arc) — oversize 192px, attack only, front + behind
  weapon_slash:        { src: 'art/lpc/weapon_slash.png',        fw: 192, cols: 6, states: ['attack'] },
  weapon_slash_behind: { src: 'art/lpc/weapon_slash_behind.png', fw: 192, cols: 6, states: ['attack'] },
  // shield — single universal sheet works for every state (present in slash too)
  shield_fg: tex64('art/lpc/shield_fg.png'),
  shield_bg: tex64('art/lpc/shield_bg.png'),
};

// =============================================================================
// PARTS — the paper-doll registry. Each part fills exactly one SLOT; equipping
// a part in a slot replaces whatever was there (data-driven toggle). A part
// contributes one or more visual LAYERS, each with a draw order `z` and an
// optional per-state texture override (the sword swaps to its oversize swing
// sheet for the 'attack' state).
//   slot  : which exclusive slot this occupies
//   layers: [{ tex, z, overrides? }]
//   label : shown in the equip HUD (Gate M proof)
// =============================================================================
const Z = { shieldBack: 10, weaponBack: 12, body: 20, ears: 21, nose: 22, eyes: 23,
            brows: 24, feet: 26, legs: 28, torso: 40, hair: 50, hat: 54,
            weaponFront: 80, shieldFront: 84 };

export const PARTS = {
  // --- base body + hair (always-equipped foundation parts) ---
  body_light:  { slot: 'body', label: 'Body (light)', layers: [{ tex: 'body_light', z: Z.body }] },
  body_brown:  { slot: 'body', label: 'Body (brown)', layers: [{ tex: 'body_brown', z: Z.body }] },
  body_olive:  { slot: 'body', label: 'Body (olive)', layers: [{ tex: 'body_olive', z: Z.body }] },
  eyes_blue:  { slot: 'eyes', label: 'Eyes (blue)',  layers: [{ tex: 'eyes_blue', z: Z.eyes }] },
  eyes_brown: { slot: 'eyes', label: 'Eyes (brown)', layers: [{ tex: 'eyes_brown', z: Z.eyes }] },
  eyes_green: { slot: 'eyes', label: 'Eyes (green)', layers: [{ tex: 'eyes_green', z: Z.eyes }] },
  brow_chestnut: { slot: 'brows', label: 'Brows (chestnut)', layers: [{ tex: 'brow_chestnut', z: Z.brows }] },
  brow_black:    { slot: 'brows', label: 'Brows (black)',    layers: [{ tex: 'brow_black', z: Z.brows }] },
  brow_gold:     { slot: 'brows', label: 'Brows (gold)',     layers: [{ tex: 'brow_gold', z: Z.brows }] },
  nose_light: { slot: 'nose', label: 'Nose (light)', layers: [{ tex: 'nose_light', z: Z.nose }] },
  nose_brown: { slot: 'nose', label: 'Nose (brown)', layers: [{ tex: 'nose_brown', z: Z.nose }] },
  nose_olive: { slot: 'nose', label: 'Nose (olive)', layers: [{ tex: 'nose_olive', z: Z.nose }] },
  ears_light: { slot: 'ears', label: 'Ears (light)', layers: [{ tex: 'ears_light', z: Z.ears }] },
  ears_brown: { slot: 'ears', label: 'Ears (brown)', layers: [{ tex: 'ears_brown', z: Z.ears }] },
  ears_olive: { slot: 'ears', label: 'Ears (olive)', layers: [{ tex: 'ears_olive', z: Z.ears }] },
  hair_chestnut: { slot: 'hair', label: 'Hair (chestnut)', layers: [{ tex: 'hair_chestnut', z: Z.hair }] },
  hair_black:    { slot: 'hair', label: 'Hair (black)',    layers: [{ tex: 'hair_black', z: Z.hair }] },
  hair_gold:     { slot: 'hair', label: 'Hair (gold)',     layers: [{ tex: 'hair_gold', z: Z.hair }] },

  // --- clothing ---
  pants_charcoal: { slot: 'legs', label: 'Pants (charcoal)', layers: [{ tex: 'legs_charcoal', z: Z.legs }] },
  pants_forest:   { slot: 'legs', label: 'Pants (forest)',   layers: [{ tex: 'legs_forest', z: Z.legs }] },
  pants_brown:    { slot: 'legs', label: 'Pants (brown)',    layers: [{ tex: 'legs_brown', z: Z.legs }] },
  shoes_brown:    { slot: 'feet', label: 'Shoes (brown)',    layers: [{ tex: 'feet_brown', z: Z.feet }] },
  shoes_black:    { slot: 'feet', label: 'Shoes (black)',    layers: [{ tex: 'feet_black', z: Z.feet }] },
  shirt_blue:     { slot: 'torso', label: 'Shirt (blue)',    layers: [{ tex: 'torso_blue', z: Z.torso }] },
  shirt_forest:   { slot: 'torso', label: 'Shirt (forest)',  layers: [{ tex: 'torso_forest', z: Z.torso }] },
  shirt_brown:    { slot: 'torso', label: 'Shirt (brown)',   layers: [{ tex: 'torso_brown', z: Z.torso }] },

  // --- equippable gear (Gate M) ---
  hat_feather: { slot: 'hat', label: 'Feathered cap',
    layers: [{ tex: 'hat_feathercap', z: Z.hat }] },
  sword: { slot: 'weapon', label: 'Longsword',
    layers: [
      { tex: 'weapon_carry_behind', z: Z.weaponBack,  overrides: { attack: 'weapon_slash_behind' } },
      { tex: 'weapon_carry',        z: Z.weaponFront, overrides: { attack: 'weapon_slash' } },
    ] },
  shield: { slot: 'shield', label: 'Heater shield',
    layers: [
      { tex: 'shield_bg', z: Z.shieldBack },
      { tex: 'shield_fg', z: Z.shieldFront },
    ] },
};

// Character footprint (feet box) in 64px frame space — collider + y-sort anchor.
// Anchored to frame centre; offY pushes it down to the soles. (Gate B / Gate C.)
export const CHAR_FOOTPRINT = { w: 16, h: 8, offX: 0, offY: 24 };

// =============================================================================
// TILES + PROPS (LPC terrain, ElizaWy, OGA-BY 3.0). Tiles are TILE px native;
// props are cropped to final px by scripts/build_lpc_terrain.py.
//   footprint: solid/visual base in FINAL px, anchored to the centre origin.
// =============================================================================
export const TILES = {
  tile_grass:  { src: 'art/terrain/grass.png' },
  tile_dirt:   { src: 'art/terrain/dirt.png' },
  tile_path:   { src: 'art/terrain/path.png' },
  tile_water:  { src: 'art/terrain/water.png' },
  tile_garden: { src: 'art/terrain/garden.png' },
};

export const PROPS = {
  prop_tree_oak:  { src: 'art/terrain/tree_oak.png',  width: 94, height: 125,
                    footprint: { w: 16, h: 8, offX: 0, offY: 58 } }, // trunk base
  prop_tree_pine: { src: 'art/terrain/tree_pine.png', width: 60, height: 136,
                    footprint: { w: 12, h: 8, offX: 0, offY: 64 } },
  prop_bush:      { src: 'art/terrain/bush.png', width: 32, height: 32,
                    footprint: null }, // decor, non-solid
  prop_sign:      { src: 'art/terrain/sign.png', width: 24, height: 24,
                    footprint: { w: 14, h: 6, offX: 0, offY: 8 } },
};

// Small ground decals scattered off-grid over the grass (Gate I — break the
// tiled-grass lattice). Non-solid; pinned just above the floor, below actors.
export const DECALS = {
  decal_tuft:         { src: 'art/terrain/decal_tuft.png' },
  decal_flower_pink:  { src: 'art/terrain/decal_flower_pink.png' },
  decal_flower_white: { src: 'art/terrain/decal_flower_white.png' },
};

// Animation key for a texture + state + facing (write-once naming).
export function animFor(textureKey, state, facing) {
  return `${textureKey}-${state}-${facing}`;
}
