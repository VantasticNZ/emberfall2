# ASHEN MARSH — build report (Milestone 1, step 2 + 2b)

## STEP 2b (2026-06-10) — the Lost Cemetery (FINISHED) + a furnished Mirefen interior
**Done + eyes-on (0 errors, 156 fps, 21 navGate suites + 14 gates GREEN):**
- ✅ **THE LOST CEMETERY — finished new region.** Vetted + extracted **LPC Grave Markers Rework**
  (bluecarrot16, **CC-BY-SA 3.0 / GPL 3.0**, bundled licence) → cropped **5 grave props** (headstone ·
  stone cross · wooden cross · open grave · large founder's stone) into `public/art/furniture/`,
  ledgered. Built `lost_cemetery` (22×16 walled graveyard, **eerie dark floor tint**, the founder's
  ornate stone + two mourning angels, rows of varied graves, a **fresh open grave** with **Mother Cray**
  the gravekeeper tending it, an offering chest, the lych-gate inscription) — **`mus_marsh` dread bed**,
  walk-in from the GH board. Reads clearly as a finished, mournful cemetery. (`cemetery-eerie.png`)
- ✅ **Yssa's Hut — a furnished Mirefen interior.** Wired a walk-in door from the Mirefen street →
  `mirefen_hut` (a weathered marsh home: bed · hearth · table · dresser, **Elder Yssa** by the fire,
  a chest). Proven crop→furniture→interiorRegion pipeline. (`mirefen-hut-furnished.png`)
- ✅ **Engine support added (write-once):** `interiorRegion` now takes **`npcs`** (cemetery/hut NPCs) +
  **`groundTint`** (themed interior floors, applied to the floor renderTexture) — reusable for all regions.
**🟡 PARTIAL / ❌ NOT done (honest, HARD RULE 10):**
- 🟡 **Mirefen TOWN overworld** — still the **greybox street grid** (`mirefen-town.png`); a furnished
  interior + Yssa are in, but the town's **real marsh-buildings + finish** remain (the griddedSettlement→
  built-town pipeline is a focused next pass).
- ❌ **Fenwick** — still greybox (not built this pass).
- ❌ **Deep M8–M10 wiring** (the Mirefen→Marsh→Shrine quest flow beyond the existing M8 hook).
- ❌ **DASH + ELECTRIC ability-gates** — still **engine-blocked** (dash-leap-over-gap mechanic + the
  electric ability don't exist) — per the abilities-mechanics session. **Frog reskin** — pairs with that.

---

# ASHEN MARSH — build report (Milestone 1, step 2)

> M1 step 2 per `BUILD-PLAN`. This session delivered the **ATMOSPHERE slice** of the Marsh build — the
> eerie bog read + its audio identity — verified eyes-on. The **structural builds** (Mirefen full
> furnish · the Lost Cemetery · Fenwick · the ability-gates · deep M8–M10 wiring) are **scoped but NOT
> done this session** — honest checklist below (two are engine-blocked). 14 gates GREEN; 0 errors; 148fps.

## ✅ DONE this session — the Marsh's eerie identity (atmosphere + audio)
1. **Eerie murky palette** — re-tinted the bog from olive `0x8d9a6e` → **murky grey-teal `0x5a6357`**
   (ground), near-black water `0x2e433e`, grey dead trees/decals. Measured: the ground mean RGB dropped
   `(39,79,22)→(25,50,17)` — visibly darker/colder, reads as a dying mire vs the bright green before
   (`marsh-before.png` ↔ `marsh-after-dressed.png`). *Still tinted-grass (the known bog-tile 🟡 gap —
   true mud/black-water tiles would finish it).*
2. **`marsh.mp3` wired** — registered `mus_marsh` (HydroGene "Spirits Forest", the dread bed grabbed last
   session) + fixed `_musicForRegion` so the Marsh region (`bog:true`/key `Marsh`) actually plays it.
3. **Desolate ambient** — the bog now uses `amb_wind` (a dead wind), **not** birds.
4. **Denser dead mire** — +8 grey-tinted dead pines (thicker drowned-wood stands) + 4 reed clumps, so
   the bog reads as a brooding dead wood, not sparse field. navGate/density/collision GREEN.
- **Holds:** 10 NPCs (Yssa + Hagga, the M8 hook + the Insight/deception social demo already wired),
  pixel-truth collision, depth-sort, the morality HUD; **148 fps**, **0 console errors**, 14 verify gates.

## ❌ NOT done this session (scoped → next sessions; per HARD RULE 10)
| Item | Why deferred |
|---|---|
| **Mirefen full furnish** (weathered marsh-town + furnished interiors, walk-in) | A full region-build (the GH-pipeline applied to Mirefen's interiors) — its own focused, eyes-on pass; too large to also finish here to quality. |
| **The Lost Cemetery** (30×24 grief/night vignette) | New region — needs grave-marker crops (medieval-deco) + def + terrain + door + navGate + eyes-on. A self-contained build = its own session. |
| **Fenwick** build-out | Greybox today; depends on the electric-gate (below) for its intended access. |
| **DASH ability-gate** (boardwalk gap → reed-islet cache) | 🔧 **ENGINE-BLOCKED** — the swept-dodge is anti-tunnel (stops at solids), so "dash **across a gap**" isn't supported. Needs a **dash-leap-over-gap** mechanic first (FLAG per HARD RULE 2). |
| **ELECTRIC ability-gate** (Mirefen→Fenwick only-route) | 🔧 **ENGINE-BLOCKED** — there is **no electric tool/ability** in-game yet (it's a designed, not-built ability). Build the ability, then the gate. |
| **Deep M8–M10 wiring** (Mirefen → sides → Sunken Shrine flow) | The M8 Yssa→Hagga→Shrine hook + the Shrine entry exist in data; the full M8–M10 quest-flow + the Marsh sides/cameos is a content pass on top of the built town. |
| **Frog (SA4) stopgap reskin** | Pairs with the Mirefen/Marsh content pass; trivial once that lands (reskin `man_eater_flower`). |

## 9-FACTOR region-DoD (for the atmosphere slice)
1. Nav-first — ✅ navGates/density/collision GREEN (new props don't block). 2. Composition/variety — 🟡
**atmosphere improved** (denser dead stands + reeds), but Mirefen/Cemetery/Fenwick are still greybox →
not yet finished-quality region-wide. 3. Readability — ✅. 4. **Art-direction (eerie desaturated
murky-teal)** — ✅ palette shifted + measured darker (🟡 grass-texture still shows → bog-tile gap). 5.
Density — ✅ (decals 150 + denser trees + 10 NPCs + 7 enemies). 6. Collision/depth/interaction — ✅. 7.
**Audio** — ✅ **`mus_marsh` dread bed + desolate wind**. 8. **Performance** — ✅ 148 fps. 9. No
soft-locks — ✅ 14 gates GREEN.
→ **The ATMOSPHERE clears the bar; the region is NOT yet finished-quality** (Mirefen/Cemetery/Fenwick
greybox + 2 engine-blocked gates).

## ✅ SUMMARY (honest)
- **Done + verified:** the Marsh's **eerie bog atmosphere** (murky-teal palette, denser dead mire) + its
  **audio identity** (`mus_marsh` + desolate wind). 0 errors, 148 fps, 14 gates GREEN.
- **Deferred (next sessions):** Mirefen furnish · the Lost Cemetery · Fenwick · deep M8–M10 — each a
  focused region/content pass. **Engine FLAGS:** the **dash-leap-over-gap** mechanic + the **electric
  ability** must be built before their ability-gates (HARD RULE 2 — flagged, not silently faked).
- **For Van's eye (FEEL):** does the Marsh now **read + sound eerier** — a darker, brooding dead mire
  with the dread music + dead wind? (Compare `marsh-before` ↔ `marsh-after-dressed`.) It's the first
  slice; the town/cemetery/gates are the next focused builds. **Honest:** this is atmosphere, not the
  whole region — I did not fake the rest.
