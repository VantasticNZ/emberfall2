# EMBERFALL 2 — QUALITY SPEC (the concrete look / size / cohesion bar)

> **Integrated-design foundation, Step 1 (pair of `ASSET-MANIFEST.md`).** Turns
> "amazing + cohesive" into a **measurable** bar: a number or a clear pass/fail per item,
> derived from the reference style (**LPC 32 px top-down**; the *Zelda: A Link to the Past
> / Adventure Time / classic pixel-RPG-map* look Van referenced) and from the **measured**
> repo assets. Sits under HARD RULE 9 / QUALITY-BIBLE Part 2.6 (this is the *quantified*
> companion to Gate I cohesion). Each item flags whether it can become a `verify.mjs`
> gate. Doc-only.

---

## 1. RESOLUTION + GRID (the non-negotiable base)
| Item | Value | Pass/fail | Gate? |
|---|---|---|---|
| Terrain tile | **32 × 32 px**, tiled 1:1, never upscaled | every map tile is 32px-grid-aligned | ✅ gateable |
| Character / enemy frame | **64 × 64 px** (rows = N/W/S/E) | measured: idle 192×256, walk 512×256, attack 448×256 | ✅ gateable |
| Oversize FX / swing | **128 px** frames | sword 896×512, lpc-magic 512×512 | — |
| Native render | **768 × 432** (16:9) | `VIEW` in main.js | — |
| Camera zoom | **1.25** (Overworld, live) | ⚑ **supersedes STYLE-GUIDE's "ENVELOP / [0.7,0.85,1.1]@0.85"** (that was the discrete era). **Canonical = RESIZE + 1.25.** Update STYLE-GUIDE. | — |
| **Visible "screen"** | at 1.25 zoom ≈ **19.2 × 10.8 tiles** (≈ 207 tiles) | the design unit for density below | — |
| Pixel rendering | pixelArt ON, never smoothed | no anti-aliased/blurred art | ✅ gateable |

**Rule R1 — ONE grid, ONE family:** every on-map asset is LPC 32px-grid terrain or a 64px
LPC character/enemy. **ZERO** mixed-resolution (the 16×16 `kenney/` tiles are BANNED from
maps), **ZERO** off-family palette (no painterly, no AI-smoothed, no non-LPC hue). Pass/fail:
all referenced art ∈ LPC family + on-grid. → **verify candidate** (lint referenced art dims).

---

## 2. SCALE RATIOS (measured px → expected on-screen size)
Derived from actual file dims (`ASSET-MANIFEST.md`). In **tile units** (1 tile = 32px):

| Class | Measured height | Tiles tall | Footprint | Examples |
|---|---|---|---|---|
| **Character (visible)** | ~48 px (in a 64 frame) | **~1.5** | 1×~0.5 | hero, NPCs |
| **Small prop** | 30–32 px | **1** | 1×1 | barrel, chest, bush, rock_small |
| **Medium prop** | 54–96 px | **2–3** | 2×~1 | fountain (64×96), rock_crag (64×91), forge (96×128) |
| **Tree** | 125–136 px | **4** | 2×~1 | oak 94×125, pine 60×136 |
| **Building** | 160–224 px | **5–7** | 5–8×~3 | paneled 160, brick_b 192, brick_a 256×224 |

**Rule R2 — scale ratio ≈ `character : tree : building = 1 : 2.7 : 4.2`** (visible height).
Matches LPC/LttP convention (hero ~1.5 tiles, trees ~3–4, buildings ~4–7). Pass/fail: no
on-map asset falls outside its class band (e.g. a "house" < 4 tiles tall, or a "tree" < 3,
or a boulder taller than a building → FAIL). → **verify candidate** (prop-height band lint).

---

## 3. DENSITY — "full", not just the floor
The existing density **FLOOR** (QUALITY-BIBLE / verify gate 9) = *"every ~24-tile sector has
≥1 content."* That prevents *empty*; it does **not** define *full*. QUALITY-SPEC sets the
**target band** per **screen** (≈19×11 tiles), scaled by zone:

| Zone type | Props/features per screen | Landmark cadence | Bare-ground rule |
|---|---|---|---|
| **Settlement / town** | **15–25** (buildings, props, NPCs, detail) | a silhouette landmark on-screen | no bare run > **4×4** tiles |
| **Wild / route** | **6–12** (terrain features, scatter, POIs) | a landmark within **~2 screens** of travel | no bare run > **6×6** tiles |
| **Deliberate lull** (pacing) | **≥3**, intentional | — | a lull is ≤1 screen, then density resumes |

**Rule R3a — no dead ground:** no single-texture ground run **> 6×6 tiles** (wild) / **4×4**
(town) without a prop / decal cluster / feature / elevation break. (Tighter than the
24-tile floor.) → **verify candidate** (raise the floor check to a per-screen target band).

**Rule R3b — channelled:** a `route` region never has an open walkable block **> 8×8**
(already gate 8). Paths are framed by terrain on ≥1 side. ✅ already gated.

**Rule R3c — landmark legibility:** ≥1 orienting silhouette landmark reachable-by-eye within
2 screens anywhere in a region; the global Spire vista on the N horizon. → eye-judged + partial gate.

---

## 4. COHESION — the explicit definitions (each checkable)
The four things that made the first Peaks read *wrong*, now defined as pass/fail:

**C1 — A CLIFF is ONE continuous autotiled face (zero gaps showing through).**
- Every cliff cell belongs to a contiguous run (≥2) using the **cliff AUTOTILE set**
  (`cliff_summer.png`: top-edge → face → base, with outer/inner corners), NOT scattered
  single rock *props*.
- Pass/fail: **0 orphan cliff tiles** (a lone cliff cell with no matching neighbour edge);
  **0 visible ground pixels between adjacent cliff cells**; cliff perimeter uses transition
  (corner/edge) tiles, never a hard square cut. → **verify candidate** (needs a cliff data
  model: count orphans + require autotile edges). *This is exactly the current Peaks defect.*

**C2 — A BIOME GROUND is its OWN ground tile, not tinted grass.**
- Each region's dominant ground (**≥60%** of its non-path area) is a dedicated terrain SET
  (rock / sand / ash / bog / snow from the terrain-v7 atlas), **not** `grass` + `setTint`.
- Pass/fail: `region.groundSet` is defined and **≠ 'grass'** for any non-green biome; **flag
  any region whose biome read depends on `groundTintAt` alone** (← the current Peaks defect:
  stone-TINTED green grass). → **verify candidate** (assert a non-grass ground set per biome).

**C3 — A SEAM is a feathered transition band, not a hard line.**
- Adjacent biomes share an **autotiled transition band ≥1 tile** (Gate D feathering): grass→
  rock, grass→sand, etc. use corner-transition tiles. **No 1-tile hard colour step.**
- Pass/fail: every region-pair seam (already coord-checked by gate 11) ALSO has transition
  tiles present across the shared edge. → **verify candidate** (extend seam-coherence gate
  from coords-only to "transition tiles present").

**C4 — RESOLUTION + PALETTE unity (no clashing mixes).**
- One 32px grid, one 64px character standard, one LPC palette family across the whole map.
  No painterly/AI-smooth/off-res asset (R1). Pass/fail = R1. → **verify candidate.**

**C5 — SCALE consistency (R2):** no off-scale asset on the map. → verify candidate.

---

## 5. THE BAR, in one screen (what "amazing + cohesive" means here)
A region passes the QUALITY-SPEC when, at 1.25 zoom on a normal screen:
1. **Grid/family:** every tile 32px LPC, every actor 64px LPC — nothing clashes (C4/R1).
2. **Ground:** the biome reads from its **own ground tiles** (C2), feathering into neighbours
   at every seam (C3) — no tinted-grass stand-in, no hard lines.
3. **Cliffs/relief:** continuous autotiled faces (C1) — no scattered tiles, no gaps.
4. **Density:** the screen is **full** to its zone band (R3) — the eye always has a prop,
   feature, or landmark; no dead ground runs.
5. **Scale:** character ~1.5 tiles, trees ~4, buildings ~5–7 — the LttP/LPC proportion (R2).
6. **Legibility:** a silhouette landmark orients you; routes read as channelled paths (R3b/c).

---

## 6. verify.mjs GATE ROADMAP (which of these can self-enforce)
| Spec | Gate now? | How |
|---|---|---|
| R1 resolution/grid/family | **Yes (new)** | lint every referenced art file: dims on 32/64 grid, prefix in ledger (LPC) |
| R2 scale bands | **Yes (new)** | prop heights within class band per `PROPS` |
| R3a density "full" | **Yes (tune)** | raise gate 9 from floor (≥1) to a per-screen target band + bare-run check |
| C1 cliff continuity | **Later** | needs a cliff/elevation data model (autotile, not props) |
| C2 biome-ground-not-tint | **Yes (new)** | assert a non-grass `groundSet` for each biome region |
| C3 seam transition tiles | **Yes (extend gate 11)** | require transition tiles across shared edges, not just matching coords |
| C4/C5 palette/scale | **Partial / eye** | R1+R2 cover the measurable part; "feels LPC" stays Van-judged |

> **Build implication:** the next Peaks-fix session (per `PEAKS-ART-CANDIDATES.md`) should
> wire **C2** (rock ground set, not tint) + **C1** (cliff autotiler) first — they are the two
> defects this spec was written to catch. The new gates (R1/R2/R3a/C2/C3) should be wired into
> `verify.mjs` as each region is built, exactly like the 6 [OBJECTIVE] gates were.

*Cross-links: ASSET-MANIFEST.md (the measured assets) · STYLE-GUIDE.md (⚑ update its
scale/zoom per §1) · QUALITY-BIBLE Part 2.6 (Gate I — this quantifies it) · WORLD-BLUEPRINT.md
(per-region density/landmarks) · PEAKS-ART-CANDIDATES.md (the wiring that satisfies C1/C2) ·
verify.mjs (the gate roadmap §6). Doc-only; no code/SSOT touched.*
