// =============================================================================
// SINGLE SOURCE OF TRUTH — project-wide TUNING CONSTANTS.
// Reuse these; never redefine the same tuning value ad hoc in a scene/system.
// verify.mjs lints for bare literals that bypass these (best-effort).
// =============================================================================

// The canonical talk/interact reach, in px. ONE value for the whole game so
// "walk up + press E" feels identical everywhere. Per-entity overrides are
// allowed ONLY with a stated reason, and expressed as a DERIVED value
// (e.g. `INTERACTION_RADIUS * 1.5 /* big shrine, reachable from afar */`),
// never a bare magic number — so the canonical value still flows through.
export const INTERACTION_RADIUS = 40;   // ~one person-width from the entity: stand beside someone to talk, not call across the lawn

// COMBAT tuning (Stage 2a — the first fight). One place to tune feel; the scene
// reads ONLY these, never bare numbers. (Player max HP also comes from the
// Inventory/economy stats; PLAYER_HP here is the reference value.)
export const COMBAT = Object.freeze({
  PLAYER_HP: 100,
  ATTACK_DAMAGE: 12,        // sword damage per landed swing
  ATTACK_RANGE: 64,         // px reach of the swing from the player centre
  ATTACK_ARC_DOT: 0.25,     // facing cone: dot(toEnemy, facing) >= this (~75° each side)
  ATTACK_COOLDOWN_MS: 360,  // between swings
  CHARGER_HP: 40,           // ~4 hits to kill (Gate E: 3-5)
  CHARGE_DAMAGE: 14,        // the charge hit on the player
  CHARGE_SPEED: 300,        // px/s during the rush
  APPROACH_SPEED: 52,       // px/s while closing in (idle)
  KNOCKBACK_SPEED: 240,     // px/s knockback on the enemy when hit
  KNOCKBACK_FRAMES: 8,
  HIT_FREEZE_FRAMES: 4,     // hit-pause (frames frozen on a landed hit)
  SHAKE_HIT: 0.006,         // screen-shake on a sword hit
  SHAKE_CHARGE: 0.014,      // bigger shake on charge impact
  FLASH_MS: 90,             // white/red flash duration on hit
});

// Other tuning is ALSO single-sourced — it lives in its owning module (listed
// here so there is one index of "where the knobs are"). Do not re-declare these:
//   TILE (32 px), CHAR_FOOTPRINT, FRAME/DIR_ROW/ANIMS  -> src/data/assets.js
//   per-actor movement speed                           -> DATA in src/data/world.js (Movement system)
//   camera lerp + baseZoom + cover-zoom                -> src/scenes/GreenhollowScene.js (the camera owner)
//   UI sizing / fonts / colours                        -> src/scenes/GreenhollowScene._buildUI + docs/STYLE-GUIDE.md
