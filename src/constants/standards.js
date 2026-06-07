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
  KNOCKBACK_SPEED: 285,     // px/s knockback on the enemy when hit  [juice pass: 240->285, reads more]
  KNOCKBACK_FRAMES: 9,      //   [240->285 + 8->9: the strike shoves]
  HIT_FREEZE_FRAMES: 5,     // hit-pause (frames frozen on a landed hit)  [juice: 4->5]
  KILL_FREEZE_FRAMES: 9,    // the KILLING blow freezes harder (a beat of impact)  [NEW]
  SHAKE_HIT: 0.008,         // screen-shake on a sword hit  [juice: 0.006->0.008]
  SHAKE_KILL: 0.013,        // bigger shake on the killing blow  [NEW]
  SHAKE_CHARGE: 0.014,      // bigger shake on charge impact
  FLASH_MS: 100,            // white/red flash duration on hit  [juice: 90->100]
  HIT_POP_SCALE: 1.16,      // enemy squash-punch scale on a landed hit (reads as a flinch)  [NEW]
  INPUT_BUFFER_MS: 140,     // buffer an attack press made during recovery, so it isn't dropped  [NEW]

  // — ABILITIES. FEEL-TUNE PENDING: Van tunes every timing/distance/amount; these
  //   are sane defaults only. The LOGIC is unit-tested. —
  // DODGE-ROLL (defensive, i-frames — beats the charger):
  DODGE_DISTANCE: 110,      // px of the roll burst — reads as a real ESCAPE  [juice: 96->110]
  DODGE_DURATION_MS: 180,   // how long the burst moves                       [juice: 170->180]
  DODGE_IFRAME_MS: 265,     // invulnerability window (> duration = safe roll) [juice: 230->265]
  DODGE_COOLDOWN_MS: 600,   // between rolls                                  [juice: 620->600]
  // DASH (traversal — SEPARATE from the dodge-roll; a later skill unlock, longer, NO i-frames):
  DASH_DISTANCE: 220,       // crosses gaps/chasms                           [feel-tune]
  DASH_DURATION_MS: 260,    //                                               [feel-tune]
  DASH_COOLDOWN_MS: 1400,   //                                               [feel-tune]
  // BLOCK + PARRY. Block is SHIELD-SCALED: per-shield block fractions live on the
  // shield ITEMS; with NO shield only this fraction is negated (chip gets through):
  NO_SHIELD_BLOCK: 0.35,    // fraction of FRONTAL damage negated bare-handed [feel-tune]
  PARRY_WINDOW_MS: 160,     // tight window at the START of a block: negates + opens a punish [feel-tune]
  PARRY_STUN_MS: 900,       // enemy stagger after a successful parry         [feel-tune]
});

// NPC LIFE — per-agent jitter that keeps a crowd from moving in "creepy clockwork"
// lockstep (Part 2.6 Pillar 2: believable crowds are NOISY, not uniform). Seeded
// per NPC so it's stable within a session (no nondeterminism). Tune the feel here.
export const NPC_LIFE = Object.freeze({
  STAGGER_MIN_S: 0.3,    // a phase-change retarget fires after a per-NPC delay in [min,max]
  STAGGER_MAX_S: 2.5,    //   so departures FAN OUT, never a unison march
  SPEED_VAR: 0.18,       // persistent per-NPC speed multiplier = 1 ± this (~±18%)
  TARGET_JITTER_PX: 12,  // seek a slightly different point near the target tile (paths differ)
  TURN_COOLDOWN_S: 0.45, // min time between facing changes (eased turn; no synced pivots)
  CHORE_VAR: 0.45,       // per-NPC ± on chore/idle loop periods (animations not in phase)
});

// Other tuning is ALSO single-sourced — it lives in its owning module (listed
// here so there is one index of "where the knobs are"). Do not re-declare these:
//   TILE (32 px), CHAR_FOOTPRINT, FRAME/DIR_ROW/ANIMS  -> src/data/assets.js
//   per-actor movement speed                           -> DATA in src/data/world.js (Movement system)
//   camera lerp + baseZoom + cover-zoom                -> src/scenes/GreenhollowScene.js (the camera owner)
//   UI sizing / fonts / colours                        -> src/scenes/GreenhollowScene._buildUI + docs/STYLE-GUIDE.md
