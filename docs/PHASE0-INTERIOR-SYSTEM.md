# PHASE 0 — the INTERIOR / AREA-TRANSITION + MULTI-FLOOR system (REPORT)

> **5-hour game Phase 0** (`BUILD-TOOLING.md` / `WORLD-SCALE-DOD` DW1) — **the foundation ~half the
> content needs.** Enter a building/cave via a door → load its interior as a separate area, move
> between **floors**, and **exit back to the exact spot**, with **state persisting** across every
> transition (and save/reload). Built by **reusing the proven pipeline** — interiors are just REGIONS
> in a far corner, so streaming · `_buildRegion` · pixel-truth collision · depth-sort ·
> interaction-classes · `navGates` · SaveManager deltas all apply **unchanged**. 13 gates + 14 suites
> GREEN; 0 console errors. Stamp on the screenshots: `af4235a0`.

## ★ STATUS: the interior system works end-to-end — door→interior→floor→exit, with permanence.

## 1. The design (max reuse, minimal new code)
- **An interior is a REGION** placed in a reserved far corner (tiles 520–604, away from every overworld
  region). `interiorRegion()` (worldmap.js) builds an enclosed room: a floor terrain patch, **per-tile
  wall colliders** all round, walkable inside, a `spawn`, and **doors/stairs as `via:'door'`
  interactables** + chests. Because it's a region, **every proven system applies with zero changes.**
- **The transition** (`OverworldScene._enterArea`): a `via:'door'` interaction calls `_enterArea(to)`.
  `to` = an interior key (**enter**, pushing the current spot onto a **return-stack**) or `'back'`
  (**pop** → exit/descend/ascend). It teleports the player, re-streams (the far interior loads by
  proximity, the overworld unloads), centres the camera, and toggles the **interior view** (a dark
  backdrop under the floor + a dim camera bg, so the room reads as enclosed, not the overworld grass).
- **FLOORS** are just more interior regions reached by a stairs door (`to: 'tankard_f2'` pushes;
  `to: 'back'` pops). The return-stack nests cleanly: `overworld → f1 → f2 → f1 → overworld`, always
  returning to the **exact** entry tile.
- **State persistence** is automatic: tools/quests/karma/inv are global; an interior chest uses
  `SaveManager.recordOpened(chunk,id)` keyed by the interior's (unique, far-corner) chunk — so a looted
  interior chest **stays looted across transitions AND save/reload**, exactly like an overworld chest.

## 2. Live proof (eyes-on, real input, stamp `af4235a0`, 0 console errors)
| Transition | Verified | Screenshot |
|---|---|---|
| **door → INTERIOR** | GH tavern door (E) → **tankard_f1** loads as a separate enclosed room (walls + dark backdrop, the overworld gone) | `p0-1-tankard-interior.png` |
| **interior → FLOOR** | upstairs (E) → **tankard_f2**; the return-stack depth = 2 | `p0-2-tankard-floor2.png` |
| **exit → BACK at the door** | downstairs → f1 → leave → **Greenhollow at the exact tile (321,304)**, stack empty, overworld restored | `p0-3-back-at-gh-door.png` |
| **dungeon: door → DESCEND → ASCEND → exit** | GH cave door → **cave_f1** → descend → **cave_f2** → ascend → cave_f1 → leave → GH cave-mouth tile (326,309) | `p0-4-cave-interior.png` |

## 3. Permanence across transitions + save/reload — CONFIRMED
- Looted the **floor-2 chest** (gold 22→52). Exited the tavern entirely. **Re-entered → upstairs → the
  chest gives nothing (stays looted).**
- **F5 save → full page reload → auto-load → back into floor 2: gold still 52, the chest still looted
  (0 re-spawn).** The SaveManager chunk-delta permanence works for interiors identically to regions.

## 4. All proven systems carry over inside interiors — CONFIRMED
- **`navGates` (the runtime gate):** `scripts/fitcheck/interiors.test.mjs` (in `npm test`) runs the
  **body-walk reachability + no-solid-prop-on-walkable** gates on all 4 interiors — a real 16×8 body
  walks each spawn → its doors/stairs + chest; the walls hold; no prop on the floor. **All 4 pass.**
- **Collision / depth-sort / interaction-classes / chests / doors** all function inside (the chest's
  "Open the chest", the doors' prompts, the wall colliders bounding the player — all the region engine).
- **The 13 verify gates** stay GREEN with the 4 interiors as regions (channelled 9 routes, density +
  seam 12 regions); interiors are **excluded from the overworld entrance-coherence reachability** (they
  connect via the runtime door system, validated by navGates instead) — one small, documented gate guard.

## 5. What this unlocks (the foundation)
Every named interior (~30–50, `WORLD-SCALE-DOD §3.5`) and every multi-floor dungeon is now buildable as
an `interiorRegion` + a `via:'door'`. The **5h game's** Tankard, shops, homes, the Sunken Shrine floors,
the Boarded Cave — all sit on this exact system. **Greybox now** (a floor + walls); Phase 2/3 paint them
+ the procedural generators (`BUILD-TOOLING`) fill the bulk, every result `navGates`-validated.

## 6. NOTES / follow-ups (honest)
- **Greybox look:** the wall border is the channel-collider greybox; real wall/floor art + furniture is
  the Phase-2/3 art pass (the door/stairs are `prop_sign` markers for now).
- **Reload-inside-an-interior:** reloading while *inside* an interior restores the position but starts
  with an empty return-stack (the save stores position, not the area-stack). Minor — a save-the-stack
  follow-up; the chest/state permanence is unaffected (proven above). For now the player is inside the
  interior with a working exit door.
- **GH↔Coast on-foot seam** (flagged earlier) is unrelated and still pending its skeleton-seam pass.

## ✅ SUMMARY
- **Built the interior/area-transition + multi-floor system** by reusing the region pipeline: interiors
  are far-corner regions; `_enterArea` + a return-stack + `via:'door'` do the transitions; a dark
  backdrop gives the enclosed view.
- **Proven live:** door→interior (tavern + cave), interior→floor (up/down, descend/ascend), exit→back
  at the **exact** spot — 4 screenshots.
- **Permanence:** a looted interior chest stays looted across transitions **and** save/reload.
- **navGates pass in all 4 interiors** (in `npm test`); 13 gates + 14 suites GREEN; 0 console errors.
- **The foundation the whole 5h→30h build stands on is in.** Next (Phase 1): the room-template library
  + the procedural generators + the generate→navGate-validate loop.
