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

import { OPAQUE_BOUNDS } from './opaqueBounds.js';   // precomputed opaque-pixel bounds (build_opaque_bounds.mjs) — pixel-truth colliders

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
  // CLIFF autotile tiles (ElizaWy cliff_summer crops, OGA-BY) — a continuous rock FACE
  // (tiles seamlessly) + the rock-lip TOP edge; rendered as a cliff RenderTexture so cliff
  // masses read as ONE continuous face (QUALITY-SPEC C1), not scattered props.
  cliff_wall: { src: 'art/terrain/cliff_wall.png' },
  cliff_top:  { src: 'art/terrain/cliff_top.png' },
};

export const PROPS = {
  prop_tree_oak:  { src: 'art/terrain/tree_oak.png',  width: 94, height: 125,
                    footprint: { w: 16, h: 8, offX: 0, offY: 58 } },
  prop_tree_pine: { src: 'art/terrain/tree_pine.png', width: 60, height: 136,
                    footprint: { w: 12, h: 8, offX: 0, offY: 64 } },
  prop_bush:      { src: 'art/terrain/bush.png', width: 32, height: 32,
                    footprint: { w: 22, h: 12, offX: 0, offY: 8 } },   // enables SOLID bushes (channel movement); non-solid placements stay passable
  prop_sign:      { src: 'art/terrain/sign.png', width: 24, height: 24,
                    footprint: { w: 14, h: 6, offX: 0, offY: 8 } },
  // The forge — a brick building (LPC house-exterior kit, Sharm). FULLY SOLID (no interior):
  // the footprint covers the building's whole MASS (walls+door+base), bottom-aligned so the
  // y-sort anchor is unchanged — you can't walk into ANY face. (The thin base-only strip let
  // the player walk into the front/door = the reported walk-through-houses bug.)
  // ASSET-OWNED DOORWAY (Van's governing principle): each building asset DECLARES its own portal —
  // `doorway.px` = the painted door's horizontal offset from the sprite centre (native pixels). The ONE
  // door system reads this, so the visible door + walkable threshold + trigger land on the SAME tile,
  // automatically, wherever the building is placed. A fix to the door code fixes EVERY building; a new
  // building only needs its `doorway` here. (Doors verified against the actual sprite art.)
  // `doorway` = the painted door RECT MEASURED FROM THE SPRITE ART, in local pixels relative to the sprite
  // centre: {cx,cy} = the opening's centre offset, {w,h} = its size. The door system places + SIZES the
  // door sprite to exactly this rect and puts the trigger at the door's ground — so the door sits IN the
  // painted opening, fits it, and the avatar (at the feet line) sorts IN FRONT of it. (Per-asset, correct
  // by construction for every placement; verified with an overlay shot per building type.)
  prop_forge:     { src: 'art/terrain/forge.png', width: 96, height: 128,
                    footprint: { w: 88, h: 96, offX: 0, offY: 16 }, doorway: { cx: 0, cy: 30, w: 28, h: 48 }, doorArt: 'prop_door_panel', signAnchor: { cx: 0, cy: -14 } },        // wooden door, dead-centre
  // REAL LPC buildings (ElizaWy LPC structure, OGA-BY). FULLY SOLID — footprint = full mass.
  prop_house_a:   { src: 'art/structures/house_brick_a.png', width: 256, height: 224,   // a notable house / manor
                    footprint: { w: 224, h: 160, offX: 0, offY: 32 }, doorway: { cx: -47, cy: 39, w: 32, h: 56 }, doorArt: 'prop_door_arched' },    // arched door, bottom-LEFT
  prop_house_b:   { src: 'art/structures/house_brick_b.png', width: 192, height: 192,   // a brick cottage
                    footprint: { w: 172, h: 140, offX: 0, offY: 26 }, doorway: { cx: 16, cy: 66, w: 44, h: 58 }, doorArt: 'prop_door_arched', signAnchor: { cx: 16, cy: 24 } },     // arched door, bottom-RIGHT
  prop_house_paneled: { src: 'art/structures/house_paneled.png', width: 160, height: 160, // paneled house (tavern/shop)
                    footprint: { w: 144, h: 116, offX: 0, offY: 22 }, doorway: { cx: 42, cy: 24, w: 26, h: 48 }, doorArt: 'prop_door_panel', signAnchor: { cx: -8, cy: -18 } },     // porch doorway, RIGHT
  prop_fountain:  { src: 'art/structures/fountain.png', width: 64, height: 96,          // the village well/fountain
                    footprint: { w: 46, h: 16, offX: 0, offY: 34 } },
  prop_barrel:    { src: 'art/structures/barrel.png', width: 32, height: 32,            // scenery
                    footprint: { w: 22, h: 10, offX: 0, offY: 10 } },
  prop_fence:     { src: 'art/structures/fence_h.png', width: 32, height: 32,           // a tileable fence segment
                    footprint: { w: 32, h: 8, offX: 0, offY: 10 } },
  prop_chest:     { src: 'art/structures/chest.png', width: 32, height: 32, footprint: null }, // a findable chest (interactable)

  // REAL INTERIOR FURNITURE (ElizaWy LPC Objects, OGA-BY 3.0; altar = LPC Statues, CC-BY/CC-BY-SA) —
  // cropped single sprites for the furnished interiors. footprint:null — interiorRegion carves the nav
  // tile + adds the collider when placed solid (so they're collider-backed, not walk-through mass).
  prop_altar:     { src: 'art/furniture/altar.png',     width: 64, height: 64,  footprint: null }, // chapel shrine statue (replaces the fountain-altar)
  prop_anvil:     { src: 'art/furniture/anvil.png',     width: 64, height: 36,  footprint: null }, // smithing anvil (the forge)
  prop_bed:       { src: 'art/furniture/bed.png',       width: 64, height: 128, footprint: null }, // a single bed (homes / tavern upstairs)
  prop_table:     { src: 'art/furniture/table.png',     width: 96, height: 64,  footprint: null }, // a wooden table/bench (homes / shop counter / forge bench)
  prop_dresser:   { src: 'art/furniture/dresser.png',   width: 64, height: 96,  footprint: null }, // a dresser (homes)
  prop_fireplace: { src: 'art/furniture/fireplace.png', width: 64, height: 96,  footprint: null }, // a hearth (homes / tavern)
  prop_cabinet:   { src: 'art/furniture/cabinet.png',   width: 32, height: 67,  footprint: null }, // a wardrobe/cabinet (home variety)
  prop_crate:     { src: 'art/furniture/crate.png',     width: 31, height: 40,  footprint: null }, // a storage crate (shop/storeroom)

  // CEMETERY markers (LPC Grave Markers Rework, bluecarrot16 — CC-BY-SA 3.0 / GPL 3.0) — the Lost Cemetery.
  prop_grave_headstone: { src: 'art/furniture/grave_headstone.png', width: 32, height: 40, footprint: null }, // a rounded headstone
  prop_grave_cross:     { src: 'art/furniture/grave_cross.png',     width: 32, height: 54, footprint: null }, // a stone cross
  prop_grave_woodcross: { src: 'art/furniture/grave_woodcross.png', width: 32, height: 50, footprint: null }, // a wooden cross on a mound
  prop_grave_open:      { src: 'art/furniture/grave_open.png',      width: 64, height: 96, footprint: null }, // a freshly-dug open grave
  prop_grave_large:     { src: 'art/furniture/grave_large.png',     width: 96, height: 96, footprint: null }, // a large ornate headstone (the founder's grave)

  // DOORWAY marker (original pixel art, CC0/ours) — the walk-through entrance/exit sprite (replaces the
  // prop_sign door-markers so a door reads as a DOOR, not a sign). Non-solid: you walk ONTO it to enter.
  prop_door:      { src: 'art/furniture/door.png',      width: 32, height: 44,  footprint: null },
  prop_door_arched: { src: 'art/structures/door_arched.png', width: 64, height: 64, footprint: null },   // eliza arched door — matches the brick-house openings (closed/locked/broken)
  prop_door_panel:  { src: 'art/structures/door_panel.png',  width: 32, height: 48, footprint: null },   // eliza 12-panel door — matches the PANELED house (tavern/chapel) + forge
  // HANGING PURPOSE SIGNS (eliza Sign board + icon; chapel = composed cross) — mounted per BUILDING (the
  // building asset names WHERE via `signAnchor`; the placement names WHICH via `sign`). 32x32.
  prop_sign_forge:  { src: 'art/structures/sign_forge.png',  width: 32, height: 32, footprint: null },   // sword = smithy
  prop_sign_store:  { src: 'art/structures/sign_store.png',  width: 32, height: 32, footprint: null },   // coin-purse = store
  prop_sign_tavern: { src: 'art/structures/sign_tavern.png', width: 32, height: 32, footprint: null },   // INN = tavern
  prop_sign_chapel: { src: 'art/structures/sign_chapel.png', width: 32, height: 32, footprint: null },   // cross = chapel

  // ROCK / CLIFF props (ElizaWy eliza-terrain crops, OGA-BY 3.0) — the Sundered Peaks
  // mountain mass: a tall cliff face frames routes + the riven cleft; boulders/scree
  // give rocky density. Solid at the base; y-sort like tall props. (FLAG: snow-cap +
  // proper terraced-stone-town autotile remain to source — see ASSET-LIBRARY.)
  prop_cliff_face: { src: 'art/terrain/cliff_face.png', width: 64, height: 128,
                     footprint: { w: 56, h: 16, offX: 0, offY: 54 } },
  prop_rock_crag:  { src: 'art/terrain/rock_crag.png', width: 64, height: 91,
                     footprint: { w: 52, h: 14, offX: 0, offY: 36 } },
  prop_rock_boulder:{ src: 'art/terrain/rock_boulder.png', width: 59, height: 54,
                     footprint: { w: 48, h: 12, offX: 0, offY: 18 } },
  prop_rock_small: { src: 'art/terrain/rock_small.png', width: 32, height: 30,
                     footprint: { w: 24, h: 10, offX: 0, offY: 8 } },
};

// =============================================================================
// THE ONE COLLISION RULE — PIXEL-TRUTH + PERSPECTIVE-AWARE: derive a solid's collider from its
// OPAQUE PIXELS (OPAQUE_BOUNDS, precomputed by scripts/build_opaque_bounds.mjs), NOT the PNG frame.
// HORIZONTAL extent is always the opaque silhouette WIDTH (matches the visible left/right edges).
// VERTICAL extent is the object's GROUND FOOTPRINT — anchored to the opaque BASE — by class:
//   • CANOPY (trees)     → trunk/ground band only; walk behind the canopy (y-sorted).
//   • BUILDING (tall ¾)  → a BASE GROUND BAND (the wall-foot where it meets the ground), full
//                          opaque width: you stop at the front base AND walk BEHIND the upper
//                          roof (y-sorted) — not blocked at the roofline. Band depth ≈ the ¾
//                          ground projection (opaque width × 0.5), so it scales with the footprint.
//   • COMPACT (rocks/etc)→ the FULL opaque silhouette (solid top-to-bottom; you walk around it).
// Returns { w, h, offX, offY } relative to the sprite CENTRE, UNSCALED frame px (origin 0.5/0.5).
// =============================================================================
const _CANOPY = /tree/;
const _BUILDING = /forge|house|paneled|structure|hall|keep|cottage|tower|manor/;
export function solidBox(key, d) {
  const W = d.width, H = d.height;
  const ob = OPAQUE_BOUNDS[key];
  if (ob) {
    const oH = ob.y1 - ob.y0 + 1, oW = ob.x1 - ob.x0 + 1;
    const cx = (ob.x0 + ob.x1 + 1) / 2 - W / 2;            // opaque centre x, relative to frame centre
    const baseAnchoredBand = (h) => ({ w: oW, h, offX: Math.round(cx), offY: Math.round((ob.y1 + 1) - h / 2 - H / 2) });
    if (_CANOPY.test(key)) {                                // trunk = opaque ground band (narrow)
      const bandH = Math.min(16, Math.max(2, Math.round(oH * 0.14)));
      const bcx = (ob.baseX0 + ob.baseX1 + 1) / 2 - W / 2;
      return { w: ob.baseX1 - ob.baseX0 + 1, h: bandH, offX: Math.round(bcx), offY: Math.round((ob.y1 + 1) - bandH / 2 - H / 2) };
    }
    if (_BUILDING.test(key)) {                              // BASE GROUND BAND (walk behind the roof)
      const bandH = Math.max(24, Math.min(oH, Math.round(oW * 0.5)));
      return baseAnchoredBand(bandH);
    }
    return { w: oW, h: oH,                                  // COMPACT: FULL opaque silhouette
             offX: Math.round(cx), offY: Math.round((ob.y0 + ob.y1 + 1) / 2 - H / 2) };
  }
  // fallback (no opaque bounds, e.g. palette PNG): manifest footprint, else a base box
  const fp = d.footprint || { w: Math.round(W * 0.7), h: Math.max(8, Math.round(H * 0.3)), offX: 0, offY: Math.round(H * 0.2) };
  return { w: fp.w, h: fp.h, offX: fp.offX || 0, offY: fp.offY || 0 };
}

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
