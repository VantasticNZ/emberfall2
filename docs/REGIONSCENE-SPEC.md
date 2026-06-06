# RegionScene base — refactor spec (the template for every region)

Status: **✅ DONE (2026-06-07)** — `src/scenes/RegionScene.js` built; `GreenhollowScene`
+ `MarshScene` are now thin subclasses (config + hooks). Verified live: Greenhollow
(walk/M1/Mara/Bram/combat, charger now a real snake monster, big-head, options) +
Marsh (walk/M8/Yssa-Hagga/shrine-M9/lantern/Drowned-Guardian-boss/7 creature
archetypes/combat) both play, 0 console errors, verify green. The Greenhollow dev
charger MOVED onto the EnemyController (was a humanoid; now `mon_snake`) — the one
intended visual change (unification); combat BEHAVIOUR is identical.

--- original spec (executed) below ---

Specced so it executes cleanly + safely in a focused session (per the Regression Rule:
a botched refactor of two working combat scenes regresses M1/M8/M9/combat). The COMBAT
is already a shared system
(`EnemyController` + `PlayerCombat` + `InputMap` + `ModifierRegistry`); what remains
is to dedupe the per-scene RENDERING + DIALOGUE + camera + the combat *orchestration*
that `GreenhollowScene` and `MarshScene` currently duplicate.

## Goal
`src/scenes/RegionScene.js` (abstract base). Each region = a thin subclass that
supplies DATA + a few hooks. After the refactor BOTH scenes must load + play
IDENTICALLY to now.

## What the base OWNS (extract from the two scenes — they're ~equivalent)
- **World render** from `regionConfig().world`: ground tilesprite (+ optional tint),
  water (pond 9-slice / pools, + tint), seeded decals, props (solids + tint), NPCs,
  player. (Greenhollow uses `WORLD`; Marsh uses `MARSH` — unify the shape.)
- **Camera**: bounds, cover-zoom (`baseZoom`), follow, `setRoundPixels(false)`,
  resize handler; a dedicated **UI camera** (zoom 1) + the `ui` ignore-list.
- **Dialogue UI**: build box/portrait/options, `_renderNode/_renderOptions/_nav/
  _confirm/_close`, `_startQuest`, `_startGreeting`, `_buildPortrait`. (Near-identical
  already — extract verbatim; provide `SPEAKER_FACE` via config.)
- **Interaction**: register NPCs/props, the `update()` prompt.
- **Input**: `InputMap` + canonical actions (interact/attack/dodge/settings + dialogue
  nav). Combat actions only active if `config.combat`.
- **Player-combat scaffolding** (if `config.combat`): `PlayerCombat`, `Inventory` HP,
  `EnemyController`, attack/dodge/block, `_onPlayerHit/_onPlayerRecoil`, player visual
  (dodge-roll crouch + block arc + flash), HP bar, hit-freeze, respawn. (Marsh's
  version is the reference; Greenhollow's is the same minus encounters.)
- **The `update()` loop** (freeze → dialogue → movement → combat → depth-sort → prompt).

## What each REGION supplies (config + hooks)
- `regionConfig()` → `{ key, title, world, quests, faces, tints, combat:boolean,
  enemies:[{id,tx,ty}], helpText }`.
- `onCreateExtra()` hook — region-specific setup:
  - **Greenhollow**: the DEV-TEST charger (move it onto `EnemyController` so it too
    renders as a real monster — unifies the legacy `_spawnCharger` path), big-head
    apply, the `M` dev-nav key, options-menu (`Esc`) launch.
  - **Marsh**: the shrine Interaction + the M9 boss hand-off.
- `onDialogueConfirm(wasNodeId)` hook — Marsh intercepts `'guardian'` → `_startBossFight`.

## Conversion order (verify after EACH — do not batch)
1. Build `RegionScene` from the **Marsh** code (most combat-complete).
2. Convert `MarshScene` → `extends RegionScene` + config. **Verify**: walk, talk
   Yssa/Hagga (M8), shrine→M9→boss (lantern trick + enrage), real monsters, 0 errors.
3. Convert `GreenhollowScene` → `extends RegionScene` + config (+ its dev hooks).
   **Verify**: walk, talk Mara/Bram (M1), dev charger, dodge/block, options menu,
   big-head, 0 errors.
4. If anything differs from today, fix before declaring done. If unfixable in budget,
   REVERT that scene (keep it working) and report.

## Acceptance
Both scenes byte-for-byte behaviourally identical to the pre-refactor build; the two
scenes' bodies shrink to config + hooks; `npm run verify` green; 0 console errors;
screenshots of both playing.
