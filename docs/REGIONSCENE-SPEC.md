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

---

## NPC LIFE — schedules + chores + ambient (added 2026-06-07; src/systems/NpcLife.js)
Part 2.6 Pillar 2, built once in RegionScene, inherited by every region as DATA.

**Schedules** — give a world NPC an optional `schedule` (rows of `[phase, tx, ty, activity]`):
```js
const sched = (rows) => rows.map(([phase, tx, ty, d]) => ({ phase, tx, ty, do: d || 'idle' }));
// ...
{ tx, ty, name, parts, quest, /* ... */,
  schedule: sched([
    ['dawn', 20, 16, 'chat'],
    ['day',  22, 17, 'tend'],     // a quest-giver's DAY spot == its old static spot (stay reachable)
    ['dusk', 23, 19, 'idle'],
    ['night',24, 21, 'sleep'],
  ]) }
```
- `phase` ∈ `dawn|day|dusk|night` (TimeOfDay). A phase not listed keeps the previous target.
- `do` (activity, looped at the spot): `idle | sweep | tend | chat | hammer | sleep`.
- An NPC **without** a `schedule` stays a static immovable obstacle (back-compat).
- Authoring rules: keep `do` spots on CLEAR ground (not inside a building footprint or behind a
  divider) — movement is a simple seek + a light unstick nudge, **not** navmesh. A quest-giver's
  day spot should be reachable so its quest never strands. Movement respects collision (scheduled
  NPCs are movable actors that separate from buildings/dividers).

**Ambient** — `cfg.world.ambient = { birds: true, critters: [{ key, count, area }] }`:
- `birds` adds a light silhouette-crossing FX (motion, no sprite).
- `critters` is a DATA slot for wildlife/pets — it spawns ONLY if `key`'s texture exists, so with
  no animal art loaded the hook is inert + FLAGGED (never a faked sprite).

**Integration guarantees:** moving NPCs depth-sort by footprint BASE; their Interaction follows
their live position (`target` on the interactable) so you can talk mid-routine; a moving NPC
freezes while a dialogue is open; the minimap/objective markers read live positions.

**FLAGS (future):** dedicated chore animations (sweep/hammer use existing idle/attack frames);
real obstacle pathing (navmesh) for cross-divider routes; the smooth dusk/dawn world-tint lerp
(so night reads dark) — Part 2.6 Pillar 2 / GAPS-AND-DEPTH §8; animal/pet sprites for `critters`.
