// =============================================================================
// SINGLE SOURCE OF TRUTH — project-wide TUNING CONSTANTS.
// Reuse these; never redefine the same tuning value ad hoc in a scene/system.
// verify.mjs lints for bare literals that bypass these (best-effort).
// =============================================================================

// =============================================================================
// ★ INTERACTION-STANDARDS — every interaction distance / window / offset is a
// NAMED, MEASURED constant here, with its SOURCE recorded. No interaction code
// may use a bare literal (verify gate `no-inline-interaction-literals` lints it).
// Documented in docs/QUALITY-BIBLE.md (Interaction Standards). SOURCE legend:
//   [MEASURED]   — read off the artwork / a measured runtime value
//   [DERIVED]    — computed from TILE / a frame budget / a geometric identity
//   [PLAY-JUDGED]— Van play-judged the feel (owner: Van)
//   [GENRE-REF]  — matched to a genre reference (Fable/Zelda/Stardew)
//   [TUNE]       — a sane default, NOT yet play-judged → owner: Van, flagged TUNE
//
//  CONSTANT                          VALUE   SOURCE        WHAT
//  INTERACTION_RADIUS                40px    [DERIVED]     talk/interact reach (~1.25×TILE, one person-width)
//  INTERACTION.NO_FACING_FRAC        0.6     [PLAY-JUDGED] within 60% of reach, facing is ignored (walk-up is rock-solid)
//  INTERACTION.FACING_AWAY_DOT       -0.4    [DERIVED]     reject a target only if facing >~113° away (cos≈-0.4)
//  INTERACTION.ENTRY_FRAME_BUDGET    7       [MEASURED]    threshold→interior transport (synchronous; measured)
//  DOOR.AREA_DEBOUNCE_MS             180     [TUNE]        re-trigger lock-out after an area transition
//  DOOR.CHOICE_ENTER_REVEAL_MS       440     [PLAY-JUDGED] after CHOOSING to enter a shut door, let it visibly open
//  DOOR facing tolerance             ±45°    [DERIVED]     the doorway is cardinal (4-way) — face within 45° of it
//  DOOR feet-line offset             ~1.3 t  [MEASURED]    the painted doorway sits ~1.3 tiles ABOVE the walkable
//                                                          threshold tile (per-art; NOT a constant — the threshold IS
//                                                          the feet line below the door, measured from each doorway rect)
//  GUARD_HEARING.FORCE_DOOR_PX       430px   [TUNE]        forced-door hearing radius (×breakStrength)
//  GUARD.NOTICE_RANGE_PX             150px   [TUNE]        a fined player this close makes a guard start over
//  GUARD.WARN_RANGE_PX               96px    [TUNE]        guard halts here + shouts "Stop right there!"
//  GUARD.COMPLY_MS                   2000ms  [PLAY-JUDGED] stand-still window = comply
//  GUARD.FLEE_DIST_PX                70px    [TUNE]        move this far from the warn spot = flee
//  GUARD.RECONFRONT_COOLDOWN_MS      6000ms  [TUNE]        after a flee, the guard waits this long
//  REPAIR.WORKER_RANGE_PX            700px   [DERIVED]     show the joiner if within ~a screen of the door
//  REPAIR.HAMMER_MS / LINE_MS        820/3400 [TUNE]       hammer-swing cadence / occasional mutter
// =============================================================================

// The canonical talk/interact reach, in px. ONE value for the whole game so
// "walk up + press E" feels identical everywhere. Per-entity overrides are
// allowed ONLY with a stated reason, and expressed as a DERIVED value
// (e.g. `INTERACTION_RADIUS * 1.5 /* big shrine, reachable from afar */`),
// never a bare magic number — so the canonical value still flows through.
export const INTERACTION_RADIUS = 40;   // [DERIVED] ~1.25×TILE — one person-width from the entity: stand beside someone, not call across the lawn

// INTERACTION FACING + ENTRY — the "walk up + press E" forgiveness model + the door-entry frame budget.
export const INTERACTION = Object.freeze({
  NO_FACING_FRAC: 0.6,      // [PLAY-JUDGED] within 60% of INTERACTION_RADIUS, facing is NOT checked (close = always reachable)
  FACING_AWAY_DOT: -0.4,    // [DERIVED] further out, reject only if dot(toTarget, facing) < this — i.e. facing >~113° away (cos⁻¹(-0.4))
  ENTRY_FRAME_BUDGET: 7,    // [MEASURED] frames from stepping on a threshold to the interior (synchronous transport + 1 stream); a perf budget, not a delay
});

// DOOR ENTRY timings (the threshold walk-in path). Geometry (threshold tile, the ~1.3-tile feet-line offset,
// cardinal facing) is DERIVED from each doorway's MEASURED art rect in buildingDoorTrigger — see the INDEX.
export const DOOR = Object.freeze({
  AREA_DEBOUNCE_MS: 180,         // [TUNE] after an area transition, ignore re-triggers for this long (anti double-fire)
  CHOICE_ENTER_REVEAL_MS: 440,   // [PLAY-JUDGED] after you CHOOSE to enter a shut door, let it visibly open before the cut
  // THE ONE DOORSTEP RULE: the entry/exit tile is DERIVED FROM THE DOOR ART for every building — the doorstep sits
  // this many px below the painted door's BOTTOM edge (doorWY + doorway.h/2). One reference (the door rect, same
  // as the door VISUAL), so every building lands the player the SAME small distance in front of its door — never
  // the per-building collision feet-line (which varies with footprint height = the "some land far out" bug).
  // 16px ≈ half a tile, the gap the cottage already had + reads right; CHAR_FOOTPRINT.offY (26) below that keeps
  // the avatar's feet past the building feet-line so it renders IN FRONT of the wall, not behind it.
  DOORSTEP_OFFSET: 16,           // [PLAY-JUDGED] px below the painted door bottom where the avatar stands
});

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
  // SHIELDED / BOSS guard tuning — a guard that CLOSES IN (threat) but re-faces SLOWLY
  // (so flanking it is viable). Was a hardcoded *8 advance + instant re-face.
  GUARD_ADVANCE_MULT: 13,   // shielded/boss advance speed = stats.speed × this (8->13: it pressures you)  [NEW]
  GUARD_TURN_FRAMES: 22,    // a guarding enemy only re-faces every N frames → FLANK window (was every frame)  [NEW]
  // ROAMING — a pre-aggro enemy gently PATROLS near its home instead of standing static
  // (reuses NpcLife-style per-agent jitter: staggered, varied speed/path, no clockwork).
  ROAM_RADIUS_PX: 80,       // wander within this of the home spot (stays in its encounter zone)  [NEW]
  ROAM_SPEED_MULT: 6,       // roam speed = stats.speed × this (a slow amble, not a chase)  [NEW]

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
  WALK_SPEED_SCALE: 0.9, // [TUNE] global stroll-pace scale — a calmer town walk (item 5; applied in add())
  // GLANCE/SWING cadence is now TIME-based + RE-RANDOMISED per occurrence (item 5): each NPC re-rolls its
  // own next-glance interval, so identical periods can never ALIAS into a unison turn (the "everyone pivots
  // at once" Van saw). Intervals are deliberately LONG so the town reads CALM, not twitchy. [seconds]
  GLANCE_MIN_S: 3.2,     // [TUNE] a chore NPC (sweep/tend/chat) glances about this..max apart — slow + individual
  GLANCE_MAX_S: 7.0,
  IDLE_GLANCE_MIN_S: 4.5,// [TUNE] a plain idler glances even less often (calmest cadence)
  IDLE_GLANCE_MAX_S: 9.5,
  SWING_MIN_S: 2.0,      // [TUNE] a work chore (hammer/chop/till) replays its swing this..max apart
  SWING_MAX_S: 3.6,
  // MOTION BUDGET (a plaza that reads ALIVE-but-CALM, not a field of statues nor a swarm):
  WANDER_RADIUS_PX: 72,  // a free (idle) NPC takes short PURPOSEFUL hops within this of its post
  WANDER_PAUSE_MIN_S: 2.6,// after a hop it pauses (idles) for [min,max]s before the next — staggered per NPC (raised: calmer)
  WANDER_PAUSE_MAX_S: 6.0,
  MAX_IDLE_FRACTION: 0.62,// at most this fraction of FREE NPCs may stand idle at once (raised: more standing = calmer)
  MAX_PER_ZONE: 4,       // [TUNE] density cap (item 4): >this free NPCs clustered within a zone → excess disperse outward
  ZONE_RADIUS_PX: 120,   // [DERIVED] the cluster radius the per-zone cap measures (≈ the fountain apron)
});

// GUARD HEARING — a noisy crime (a forced door) RADIATES noise from the event; every guard whose post is
// within the hearing radius walks to investigate and confronts THERE (not only if it later wanders past the
// player). Radius (px) = loudness × toughness, so a tougher door (more force to break) is heard further.
export const GUARD_HEARING = Object.freeze({
  FORCE_DOOR_PX: 430,     // [TUNE] a forced door's base hearing radius (covers most of a settlement); ×breakStrength — Van play-judge
});

// GUARD CONFRONT LADDER (Fable-style) — a guard who HEARD a crime (or notices a fined player) WALKS from
// his actual post to the player, shouts a WARNING, then opens a COMPLY window: stand still and he reads you
// the fine (pay / can't-pay); flee and the confrontation LAPSES (fine stays owed, re-confront on proximity).
// Chase / knock-out / lock-up are the DEFERRED escalation (step 5+). NOT a teleport — the guard is visibly en route.
export const GUARD = Object.freeze({
  NOTICE_RANGE_PX: 150,   // [TUNE] a fined player THIS close to a guard makes the guard start walking over — Van play-judge
  WARN_RANGE_PX: 96,      // [TUNE] the guard stops here (~3×TILE), faces the player, and shouts "Stop right there!"
  COMPLY_MS: 2000,        // [PLAY-JUDGED] stand still within this window = comply → the fine dialog opens (owner: Van)
  FLEE_DIST_PX: 70,       // [TUNE] move this far from where you were warned = flee → confrontation lapses (fine owed)
  RECONFRONT_COOLDOWN_MS: 6000, // [TUNE] after a flee, the guard waits this long before trying again
});

// QUEST HOOK PACING (town-feel item 7c) — the temporal-crowding rule: don't dump every hook on the player
// at once. New hooks GATE on progression (requires.quests/deeds) or day (requires.phase), and at most ONE new
// hook should surface per HOOK_MIN_INTERVAL_DAYS so tasks land one-at-a-time, not as a wall. The gating is the
// live mechanism (e.g. SG1 now requires GH1); this interval is the [TUNE] design rule (see docs/SPEC-QUESTS-M1-4.md).
export const QUEST_HOOKS = Object.freeze({
  HOOK_MIN_INTERVAL_DAYS: 1,   // [TUNE] surface at most one NEW optional hook per in-game day (design rule; staggers offers)
  MAX_CONCURRENT_OFFERS: 3,    // [TUNE] soft ceiling on simultaneously-available side hooks (a fuller throttle is future work)
});

// REPAIR PACING — a forced door is mended through a STAGED, visible sequence the player can read beat by beat:
//   break -> WAIT (a discovery beat — nobody notices instantly) -> the alarm goes up + a joiner TRAVELS
//   (walks across the ground to the door) -> WORK (a long, visible hammering job) -> RESTORED.
// Each stage is gated by a NAMED FLOOR below so none can collapse (the 2nd-report regression: the worker
// teleported onto the door and the frozen 6s day-phase finished it instantly). The pure state-machine in
// src/systems/repairPacing.js drives the stage boundaries; repairPacing.test.js asserts every floor by
// timestamp as a permanent case. WORK_MS is the FLOOR; the scene takes max(WORK_MS, the live day-phase) so a
// running clock still spans a real phase — but the floor guarantees it ALWAYS reads as a long job.
export const REPAIR = Object.freeze({
  DISCOVERY_MS: 2200,     // [TUNE] the beat AFTER the break before the alarm goes up — no instant grumble
  TRAVEL_MS: 2500,        // [DERIVED] the joiner's visible walk to the door (= TRAVEL_TILES*TILE / WORKER_SPEED_PX)
  WORK_MS: 12000,         // [TUNE] the LONG visible hammering job (day-phase-scale FLOOR — never the old instant pop)
  TRAVEL_TILES: 5,        // [DERIVED] how far in front of the door the joiner starts his approach (a visible crossing)
  WORKER_SPEED_PX: 64,    // [TUNE] the joiner's walk pace during travel (sets a no-feet-slide stride)
  HAMMER_MS: 820,         // [TUNE] replay the joiner's hammer swing this often (CONTINUOUS work, not a one-off)
  LINE_MS: 3400,          // [TUNE] an occasional joiner mutter while working
  WORKER_RANGE_PX: 700,   // [DERIVED] ~a screen of the door — show the worker if within (else presence implied by lines)
  PHASE_MS_FALLBACK: 6000, // [DERIVED] day-phase fallback if this._phaseMs is unset (= one quarter-day at default RATE)
});

// Other tuning is ALSO single-sourced — it lives in its owning module (listed
// here so there is one index of "where the knobs are"). Do not re-declare these:
//   TILE (32 px), CHAR_FOOTPRINT, FRAME/DIR_ROW/ANIMS  -> src/data/assets.js
//   per-actor movement speed                           -> DATA in src/data/world.js (Movement system)
//   camera lerp + baseZoom + cover-zoom                -> src/scenes/GreenhollowScene.js (the camera owner)
//   UI sizing / fonts / colours                        -> src/scenes/GreenhollowScene._buildUI + docs/STYLE-GUIDE.md
