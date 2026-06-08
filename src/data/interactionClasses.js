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
  prop_bush: { solidByPlacement: true, cuttable: true, throwable: false, loot: 'loot_bush' },

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
  prop_sign: { solid: false },                  // a readable waypost — pass through

  // --- SPEC'd-but-GAP assets (Van's table; art not in repo — class DEFINED + ready) --
  // ⚑ prop_bush_big: { solid:true,  cuttable:true, throwable:true }  (needs art + throw engine)
  // ⚑ prop_reed:     { solid:true,  cuttable:true }                  (needs reed/flax art)
  // ⚑ prop_stump:    { solid:true,  cuttable:false }                 (needs stump art)
};

// Unknown solid prop → default SOLID (no accidental walk-through-by-default). A prop
// whose class is `solidByPlacement` uses the placement's `solid` flag (the bush case).
export const DEFAULT_CLASS = { solid: true };
export function ixClass(key) { return IX_CLASS[key] || DEFAULT_CLASS; }

/** Is a placement solid? The CLASS decides, except `solidByPlacement` assets (bush)
 *  which honour the placement's small-vs-big `solid` flag. */
export function isSolid(key, placementSolid) {
  const c = ixClass(key);
  if (c.solidByPlacement) return placementSolid === true;
  return c.solid === true;
}
