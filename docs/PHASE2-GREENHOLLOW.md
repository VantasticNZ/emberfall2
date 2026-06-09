# PHASE 2 — Greenhollow town to finished quality + enterable interiors (REPORT)

> **5-hour game Phase 2** (`BUILD-TOOLING.md` / `GAME-5HR-SCOPE`) — the **finished-quality showcase**:
> Greenhollow as a real, lived-in small town with **enterable interiors**, the M1–M7 hub. Hand-crafted
> (the story-critical home town), reusing the Phase-0 interior system + Phase-1 template approach.
> 13 gates + 15 suites GREEN (17 regions); 0 console errors; 57 fps. Stamp: `6848b65f`.

## ★ STATUS: Greenhollow is a lived-in town with 7 enterable, furnished, navGate-valid interiors.

## 1. What was built
- **6 new building doors → 5 new furnished interiors** (the Tankard + floor 2 already existed from
  Phase 0 → **7 enterable interiors total**): **Hodge's forge** (furnace-basin + barrels + work-counter
  + a gear chest), **Pem's store** (goods barrels + a counter + a notice + a chest), **the chapel** (a
  nave: an altar-font, two rows of pews flanking the aisle, flanking plants, a chest), **two cottages**
  (hearth/storage + a chest each). Each via `interiorRegion()` + a `via:'door'` on the building front.
- **`interiorRegion()` extended with FURNITURE** — a solid piece **carves its tile out of the nav**
  (collider + non-walkable) so the body routes around it and **navGates still validate** (the furniture
  never blocks the spawn→door/chest paths; proven in `interiors.test.mjs`).
- **Composition enrichment (overworld)** — a **non-solid flora pass** (14 varied-scale/tint undergrowth
  clumps) framing the lanes + softening edges (the variety rule), zero nav impact.
- The town's existing fabric (plaza + fountain, dirt lanes, the Tankard/store/forge/chapel/manor/
  cottages, the farm + orchard + pond, the tree-ring, signs + the notice board, the autotiled terrain +
  flower decals, 14 placed NPCs) carries forward as the hand-crafted base.

## 2. Live proof (eyes-on, real input, stamp `6848b65f`, 0 console errors)
| | Verified | Screenshot |
|---|---|---|
| **BEFORE** | the town pre-Phase-2 (competent village, no enterable interiors) | `p2-before-greenhollow.png` |
| **AFTER** | the town with the flora enrichment + the building doors | `p2-after-greenhollow.png` |
| **Forge interior** | entered "Hodge's forge" → furnished room (furnace-basin, barrels, counter, gear chest), walkable | `p2-interior-forge.png` |
| **Chapel interior** | entered "the chapel" → a readable nave (altar-font + pews + aisle + chest) | `p2-interior-chapel.png` |
- **All 5 building doors live-verified** to enter their interior (forge/store/chapel/2 cottages), each
  with its prompt; the enclosed interior view (dark backdrop, overworld hidden) applies.

## 3. The 9-factor DoD self-check (EXCELLENCE-FRAMEWORK)
1. **Nav-first / walkability** — ✅ town walkable; **all 7 interiors navGate-validated** (body-walk +
   no-prop, `interiors.test.mjs`).
2. **Composition / variety** — 🟡 **good** — varied houses/trees + the new varied-scale/tint flora,
   layered + framed; **interiors greybox-furnished** (see §4 flag).
3. **Readability** — ✅ lanes, doors (clear prompts), buildings, NPCs all parse at a glance.
4. **Art-direction (warm pastoral, green + hearth-orange)** — ✅ green grass, warm dirt lanes, red
   roofs, the plaza hearth; warm dirt interior floors.
5. **Density** — ✅ density-floor gate passes (315 town props, 14 NPCs); no empty dead zones.
6. **Collision / depth / interaction** — ✅ pixel-truth collision, depth-sort, interaction-classes
   (the chests' "Open", the signs, the doors) all live on the finished town + interiors.
7. **Audio** — ✅ `mus_green` (pastoral bed) + `amb_birds` (ambient) playing; SFX on interaction.
8. **Performance** — ✅ **57 fps, ~18 ms avg** (within budget) with the town + flora loaded.
9. **No soft-locks / no prop-on-walkable** — ✅ navGates pass town + interiors; 13 verify gates GREEN.
- **Population taste** — ✅ 14 NPCs placed (the M1–M7 givers + townsfolk), safe-mode non-lethal default.
- **State persistence** — ✅ the interiors use the same chest/SaveManager path **proven in Phase 0**
  (looted stays looted across transition + save/reload); the 5 new chests are keyed identically.

## 4. NOTES / honest flags (HARD RULE 9 — omit/flag, never colour-box)
- 🟠 **Interior furniture is greybox** — furnished with the **available prop set** (barrels, a fountain-
  as-font/furnace, fences-as-counter/pews, a potted bush, chests). **Proper interior furniture — beds,
  tables, shelves, an anvil, a hearth, an altar — is an ART need** for the finished polish (flagged in
  the data). The chapel reads well (pews + altar + aisle); the homes/forge are functional but want the
  furniture art to feel fully lived-in.
- 🟠 **The overworld is a "good village," not a dramatic sprawling city** — Greenhollow is a *small
  town* by design (`GAME-5HR-SCOPE`), and the hand-crafted base already existed; Phase 2 added the
  **enterable interiors** (the headline gap) + a flora lift. Further street-by-street beauty polish is
  iterative (and the 3 huge *cities* are the full-game's Saltbreak/Stonereach/Capital).
- 🟠 **NPC presence only** — the 14 NPCs are placed (the town feels inhabited) but full AI/dialogue/
  schedules are **Phase 4**.

## ✅ SUMMARY
- **Greenhollow now has 7 enterable, furnished, navGate-valid interiors** (Tankard +upstairs, forge,
  store, chapel, 2 cottages) reached by working building doors, on the hand-crafted town with a flora-
  enriched composition, live audio, 14 NPCs, and the full systems.
- **9-factor DoD:** 8 ✅, composition 🟡 good (greybox furniture flagged for art). 57 fps; 0 errors;
  13 gates + 15 suites GREEN.
- **For Van's eye (FEEL):** does Greenhollow now read as a real, lived-in town you can walk *into*? The
  interiors + flora are in; the furniture-art + further beauty polish is the remaining iterative pass.
- Next (Phase 3): the Ashen Marsh + the Sunken Shrine (hybrid hand-craft + the Phase-1 generators).
