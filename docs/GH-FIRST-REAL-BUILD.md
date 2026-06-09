# GREENHOLLOW — first REAL build: furnished interiors via the rich library (REPORT)

> The first real build of the grounded 5h game (per `GROUNDED-DESIGN`): stop greyboxing — **wire the
> actual library + the LPC forge** so Greenhollow is a real, populated, furnished town. This pass closed
> the **furnished-interiors gap** (the clearest greybox→finished win): real **altar · anvil · beds ·
> tables · dressers · hearths** replace the greybox `prop_sign`/fountain placeholders. 13 gates + 19
> navGate suites GREEN; 0 console errors; 60 fps. Stamp on shots: `309c4d03`.

## ★ STATUS: Greenhollow's interiors are now FURNISHED with real LPC furniture — not greybox.

## 1. What was built (the wiring)
- **6 real furniture props wired in** (cropped single sprites from the ledgered library → `public/art/
  furniture/`, registered in `assets.js` PROPS + `interactionClasses.js`): **prop_altar** (LPC Statues),
  **prop_anvil · prop_bed · prop_table · prop_dresser · prop_fireplace** (ElizaWy LPC Objects). OGA-BY /
  CC-BY / CC-BY-SA — ledgered (`public/art/furniture/` row).
- **Re-furnished the GH interiors** (worldmap.js) with the real props (replacing the greybox):
  - **Chapel** — a **real stone altar** at the nave head (was the fountain) + pews + flanking plants.
  - **Hodge's forge** — a **real anvil** + a smith's **workbench** (was a fountain-basin) + casks.
  - **Cottages ×2** — **bed · hearth (fireplace) · table · dresser** + a potted plant — lived-in.
  - **The Copper Tankard** — a **hearth** + tavern **tables** + the bar's casks; **upstairs = beds** +
    a table + dresser (rooms above).
- The furniture is placed **solid** → `interiorRegion` carves the nav tile + adds the collider, so the
  body routes around it and **navGates still validate** (no prop-on-walkable; every interior re-proven).

## 2. Live proof (eyes-on, real input, 0 console errors)
| | Verified | Screenshot |
|---|---|---|
| **BEFORE town** | the Phase-2 town (populated) | `gh-before-town.png` |
| **Chapel — real ALTAR** | a stone shrine-altar at the nave head + pews (the fountain-altar is FIXED) | `gh-interior-chapel-altar.png` |
| **Cottage — FURNISHED** | bed · dresser · hearth · table · plant · chest — a lived-in home (not greybox) | `gh-interior-home-furnished.png` |
| **Town — populated** | warm pastoral village, plaza/fountain/paths, **14 forge-composed LPC NPCs** | `gh-after-town-populated.png` |

## 3. EXCELLENCE region-DoD — 9-factor self-check
1. **Nav-first / walkable** — ✅ navGates pass the town + **all interiors** (19 suites; furniture carves nav, never blocks).
2. **Composition / variety** — ✅ town: varied buildings + flora; **interiors now REAL furniture** (altar/anvil/bed/table/dresser/hearth) — finished, not greybox.
3. **Readability** — ✅ paths, doors, NPCs, furniture all parse at a glance.
4. **Art-direction (warm pastoral, green + hearth-orange)** — ✅ green grass, warm dirt lanes, red roofs, the plaza; warm furnished interiors.
5. **Density** — ✅ 315 town props + 14 NPCs; interiors furnished + lived-in.
6. **Collision / depth / interaction** — ✅ pixel-truth collision, depth-sort, interaction-classes (the new furniture carries classes; chests/doors work).
7. **Audio** — ✅ `mus_green` + `amb_birds` + SFX.
8. **Performance** — ✅ **60 fps** (~17 ms avg) with the town + NPCs + furnished interiors.
9. **No soft-locks / no prop-on-walkable** — ✅ navGates + all 13 verify gates GREEN.
- **Population (forge):** ✅ 14 NPCs as composed LPC paper-dolls (the hero + NPCs are the same forge);
  safe-mode non-lethal + the Morality/Purity HUD live.

## 4. NOTES / honest flags
- 🟠 **The altar + anvil crops** read correctly but are quick single-frame crops from multi-frame LPC
  sheets — a precise frame-extraction polish (tighter altar statue, cleaner anvil) is a small follow-up.
- 🟠 **Furniture set is the hero pieces** (6) — more variety (chairs/shelves/rugs/lamps, all in-library)
  is a quick expand using the same crop→register→place pipeline now proven.
- 🟠 **Town overworld** is Phase-2 quality (a good warm village); wiring the **new Victorian/Colonial
  building sets** + a further composition pass is the next finish step (the buildings are in-library).
- ✅ **The pipeline is proven:** library crop → PROPS + class → interiorRegion furniture → navGate-valid
  → eyes-on. Repeatable for every interior + every region.

## ✅ SUMMARY
- **Greenhollow's interiors are FURNISHED for real** — a stone **altar** (fountain fixed), **anvil**,
  **beds/tables/dressers/hearths** across the chapel, forge, 2 cottages, and the Tankard (+upstairs).
- **Town populated** with 14 forge-composed LPC NPCs; warm pastoral; 60 fps; 0 errors; 13 gates + 19
  navGate suites GREEN.
- **9-factor DoD:** all green (composition now real-furniture, not greybox).
- **For Van's eye (FEEL):** does Greenhollow now read + feel like a **real, lived-in, populated town you
  walk into** — beds by the hearth, an altar in the chapel, an anvil in the forge? This is the
  finished-quality proof that the rich library + forge produce a real game. Next finish steps: the
  furniture-crop polish, more furniture variety, and wiring the new building sets into the town.
