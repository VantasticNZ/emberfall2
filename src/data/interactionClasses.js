// =============================================================================
// INTERACTION-CLASS TABLE (SSOT) — every solid/interactable asset declares ALL its
// behaviour ONCE, applied uniformly in EVERY region (no per-object, no per-region
// ad-hoc). Van's principle: "consistent rules for how we can/can't interact with each
// asset." The scene reads this for collision (solid) + the verbs (cuttable/throwable/
// pushable/searchable). solidBox (assets.js) still derives the collider SHAPE; this
// says WHETHER it's solid + which verbs apply.
//
// FIELDS: solid (blocks from ALL directions), cuttable (sword-swing removes → loot),
//   throwable (lift+throw — ⚑ NEEDS-ENGINE: carry/throw not built; declared only),
//   pushable (slide one tile), searchable (loot once → searched flag), loot (table id).
// =============================================================================

export const IX_CLASS = {
  // --- BUSHES ---------------------------------------------------------------
  // prop_bush is the ONE bush asset, used in two roles: small walk-through scrub
  // (placed solid:false) AND solid hedge/undergrowth (placed solid:true). The CLASS
  // makes it CUTTABLE in BOTH roles (the "cut works in GH not Peaks" fix); its
  // solid/walk-through stays the placement's small-vs-big choice (see `solidByPlacement`).
  prop_bush: { solid: false, cuttable: true, throwable: false, loot: 'loot_bush' },

  // --- TREES — solid TRUNK (walk behind the canopy, via solidBox), not cuttable --
  prop_tree_oak: { solid: true, cuttable: false },
  prop_tree_pine: { solid: true, cuttable: false },

  // --- ROCKS — solid; small is pushable, boulder/crag too big; not cuttable ------
  prop_rock_small: { solid: true, cuttable: false, pushable: true },
  prop_rock_boulder: { solid: true, cuttable: false, pushable: false },
  prop_rock_crag: { solid: true, cuttable: false, pushable: false },
  prop_cliff_face: { solid: true, cuttable: false },

  // --- STRUCTURES / FURNITURE — solid (base band); barrels searchable ------------
  prop_forge: { solid: true },
  prop_house_a: { solid: true },
  prop_house_b: { solid: true },
  prop_house_paneled: { solid: true },
  prop_fountain: { solid: true },
  prop_fence: { solid: true },
  prop_barrel: { solid: true, searchable: 'loot_barrel' },
  prop_chest: { solid: true },                  // chests use their own permanence path
  // interior furniture (solid scenery — collision via the interiorRegion nav-carve)
  prop_altar: { solid: true }, prop_anvil: { solid: true }, prop_bed: { solid: true },
  prop_table: { solid: true }, prop_dresser: { solid: true }, prop_fireplace: { solid: true },
  prop_cabinet: { solid: true }, prop_crate: { solid: true },
  prop_stool: { solid: true }, prop_bench: { solid: true }, prop_shelf: { solid: true },
  // cemetery markers (solid scenery)
  prop_grave_headstone: { solid: true }, prop_grave_cross: { solid: true }, prop_grave_woodcross: { solid: true },
  prop_grave_open: { solid: true }, prop_grave_large: { solid: true },
  prop_door: { solid: false },  // a walk-through doorway marker (entrance/exit) — non-solid, the walk-trigger handles it
  prop_sign: { solid: false, readable: true },  // a sign/waypost/notice board — press-E to READ its `text`
  // --- COAST PROPS (Saltbreak) ---
  prop_dock: { solid: false },                  // walkable boardwalk decking laid along the shore
  prop_boat: { solid: true },                   // a beached rowboat — solid scenery
  prop_wreck: { solid: true },                  // the beached shipwreck hull — solid mass
  prop_seawater: { solid: true },               // open sea — visual mass, never walkable (the water-collision law)

  // --- SPEC'd-but-GAP assets (Van's table; art not in repo — class DEFINED + ready) --
  // ⚑ prop_bush_big: { solid:true,  cuttable:true, throwable:true }  (needs art + throw engine)
  // ⚑ prop_reed:     { solid:true,  cuttable:true }                  (needs reed/flax art)
  // ⚑ prop_stump:    { solid:true,  cuttable:false }                 (needs stump art)
};

// Unknown solid prop → default SOLID (no accidental walk-through-by-default). A prop
// whose class is `solidByPlacement` uses the placement's `solid` flag (the bush case).
export const DEFAULT_CLASS = { solid: true };
export function ixClass(key) { return IX_CLASS[key] || DEFAULT_CLASS; }

/** Is a placement solid? An EXPLICIT placement `solid` flag WINS — this is how the same asset
 *  serves as both blocking mass AND decorative cover (the Peaks/foothill scatter is placed
 *  `solid:false` = walk-among-it; a hedge bush is `solid:true`). When a placement gives NO flag,
 *  the CLASS default applies (so a bare prop is never accidentally walk-through). The class still
 *  drives the VERBS (cut/push/search) uniformly — that's the consistency that matters; solid-vs-
 *  decorative is a legitimate placement intent, not the per-region inconsistency Van flagged. */
export function isSolid(key, placementSolid) {
  if (placementSolid !== undefined) return placementSolid === true;
  return ixClass(key).solid === true;
}
