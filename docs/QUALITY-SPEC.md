# EMBERFALL 2 — QUALITY SPEC (the concrete look / size / cohesion bar)

> **Integrated-design foundation, Step 1 (pair of `ASSET-MANIFEST.md`).** Turns
> "amazing + cohesive" into a **measurable** bar: a number or a clear pass/fail per item,
> derived from the reference style (**LPC 32 px top-down**; the *Zelda: A Link to the Past
> / Adventure Time / classic pixel-RPG-map* look Van referenced) and from the **measured**
> repo assets. Sits under HARD RULE 9 / QUALITY-BIBLE Part 2.6 (this is the *quantified*
> companion to Gate I cohesion). Each item flags whether it can become a `verify.mjs`
> gate. Doc-only.

---

## 0. THE GROWTH PRINCIPLE — flexible across contexts, cohesive within
**The pipeline must ACCEPT future assets of different size / resolution / style / quality
(so we can upgrade or add art later), but any single VISUAL CONTEXT — a region / biome /
screen — must stay COHESIVE: one resolution + one style family + one scale.**

> Flexibility ACROSS contexts; uniformity WITHIN one. This is what lets us swap to
> better/different art later without a patchwork look — and it is *why* the deliberately
> "out-of-place character" gag reads as **intentional**: a mismatch is legible as a joke
> only because the default is strict. A region is the cohesion boundary; the world may
> hold several tiers, never a single screen.

So the spec below is **TIERED, not a single fixed standard.** The current LPC-32 numbers
are **Tier T0 — the baseline tier**, stated explicitly *as a tier*, with defined empty
slots for future tiers. Adding a tier is **config (a new row), not a rewrite**; every
cohesion check (§4) verifies *within the region's declared tier*, not against one global
hardcoded number.

### 0.1 TIER REGISTRY (each context declares one)
A **tier** = `{ tileSize, frameSize, family, paletteRef }`. A **region declares its tier**
(`region.tier`); the cohesion gates then check every asset in that region matches it.

| Tier | tileSize | charFrame | family / palette | status | used by |
|---|---|---|---|---|---|
| **T0 — LPC-32** (BASELINE) | **32 px** | 64 px | LPC (ElizaWy + terrain-v7), LPC palette | **ACTIVE** (the whole world today) | all regions |
| *T1 — LPC-64* (reserved) | 64 px | 128 px | LPC-HD / hand-upscale | *slot — undefined* | future high-res pass |
| *T2 — alt-style* (reserved) | (decl.) | (decl.) | a deliberate other family | *slot — undefined* | a themed zone / dream / the out-of-place gag |
| *Tn …* | … | … | … | *add a row* | … |

**Rule T — one tier per context:** `region.tier` defaults to **T0**. Mixing tiers *within*
one region/screen = FAIL (that's the patchwork look). Mixing tiers *across* regions = OK
(that's the growth path). A single intentionally-mismatched actor is allowed **only** when
explicitly tagged `outOfPlace:true` (the gag) — the gate reports it as deliberate, not drift.

### 0.2 What "a tier" parametrises (so nothing is hardcoded to 32)
Everything measured below is expressed **relative to the tier's `tileSize` (T)**, not the
literal 32. At T0, T = 32 px. The scale ratios (§2) are **dimensionless** and hold at any T.
Code that hardcodes `32` instead of reading the tier's T is listed in §7 (soften when a
non-T0 tier is actually added — *not before*; no speculative refactor).

---

## 1. RESOLUTION + GRID — Tier T0 (the active baseline, stated AS a tier)
| Item | Value | Pass/fail | Gate? |
|---|---|---|---|
| Terrain tile | **32 × 32 px**, tiled 1:1, never upscaled | every map tile is 32px-grid-aligned | ✅ gateable |
| Character / enemy frame | **64 × 64 px** (rows = N/W/S/E) | measured: idle 192×256, walk 512×256, attack 448×256 | ✅ gateable |
| Oversize FX / swing | **128 px** frames | sword 896×512, lpc-magic 512×512 | — |
| Native render | **768 × 432** (16:9) | `VIEW` in main.js | — |
| Camera zoom | **1.25** (Overworld, live) | ⚑ **supersedes STYLE-GUIDE's "ENVELOP / [0.7,0.85,1.1]@0.85"** (that was the discrete era). **Canonical = RESIZE + 1.25.** Update STYLE-GUIDE. | — |
| **Visible "screen"** | at 1.25 zoom ≈ **19.2 × 10.8 tiles** (≈ 207 tiles) | the design unit for density below | — |
| Pixel rendering | pixelArt ON, never smoothed | no anti-aliased/blurred art | ✅ gateable |

> *The table above lists Tier **T0** values (T = 32 px). A future tier restates the same
> rows at its own T — the structure is identical, only the numbers change.*

**Rule R1 — ONE grid, ONE family, PER CONTEXT:** every on-map asset **in a given region**
is that **region's tier**: terrain on the tier's T-px grid, characters at the tier's frame
size, in the tier's palette family. At T0: 32px LPC terrain / 64px LPC actors. **ZERO**
mixed-resolution *within a region* (the 16×16 `kenney/` tiles are BANNED from any T0 map),
**ZERO** off-family palette within a region. **Across regions, tiers MAY differ.** Pass/fail:
every referenced asset in region R ∈ `R.tier` (grid + family). The lone exception is an
actor tagged `outOfPlace:true` (the deliberate gag). → **verify candidate** (lint referenced
art dims/family against `R.tier`, not a global constant).

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
The ratios are **dimensionless** — expressed in TILE units (× T), so they hold at **any
tier's resolution**, not just 32px. (At T0, 1.5 tiles = 48px; at a 64px tier, 1.5 tiles =
96px — same ratio, same look.) Matches LPC/LttP convention (hero ~1.5 tiles, trees ~3–4,
buildings ~4–7). Pass/fail: no on-map asset falls outside its class band **in tile units**
(a "house" < 4 tiles, a "tree" < 3, a boulder taller than a building → FAIL) — measured
against the region's T, never an absolute px. → **verify candidate** (prop-height-in-tiles band lint).

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

## 4. COHESION — the explicit definitions (each checkable, WITHIN-CONTEXT)
The four things that made the first Peaks read *wrong*, now defined as pass/fail. **Every
cohesion check below is evaluated WITHIN a region against that region's declared `tier`
(§0)** — never against one global hardcoded number. Two regions on different tiers each pass
on their own terms; a single region mixing tiers FAILS. (So these gates survive a future
tier addition unchanged — they ask "is this region internally consistent?", not "is it 32px?".)

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

**C4 — RESOLUTION + PALETTE unity PER CONTEXT (no clashing mixes within a region).**
- One grid, one character frame standard, one palette family **per region — its tier's**
  (T0: 32px/64px/LPC). No painterly/AI-smooth/off-tier asset inside that region (R1). A
  different region may legitimately be a different tier. Pass/fail = R1 (tier-scoped). The
  sole within-region exception is an `outOfPlace:true` actor (the gag). → **verify candidate.**

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
> `verify.mjs` as each region is built, exactly like the 6 [OBJECTIVE] gates were. **Each gate
> reads the region's `tier`** (§0) — so when a non-T0 tier is added, the gates already work.

---

## 7. HARDCODED-32 LOCATIONS — soften ONLY when a non-T0 tier is actually added
The system is **already mostly tier-parametric**: nearly everything derives from the `TILE`
(32) and `FRAME` (64) constants, so a region's geometry scales if `TILE` changes. The blockers
to a *second, different-size* tier are (a) **`TILE` is GLOBAL, not per-context** and duplicated
in two files, and (b) a handful of **literal `32`s** that bypass the constant. **DO NOT refactor
these now** (no speculative engineering for assets we don't have) — this is the *located*
constraint list, to soften the day a non-32 tier lands.

| # | Location | What's pinned | Soften to |
|---|---|---|---|
| 1 | `src/data/assets.js:20-21` | `TILE = 32`, `FRAME = 64` — the **single global** tile/frame size (SSOT). | a **tier registry**; regions select a tier → its T/frame. |
| 2 | `src/data/worldmap.js:15-17` | **DUPLICATE** `TILE=32`, `CHUNK=32`, `CHUNK_PX` (not imported from assets.js). | one SSOT for `TILE`; dedupe the copy first. |
| 3 | `src/art/AssetLoader.js:44` | `lpc_terrain` loaded with literal `frameWidth: 32, frameHeight: 32`. | read the atlas's tile size from its tier, not `32`. |
| 4 | `src/data/terrainTiles.js:5` (`"cols": 32`) + `scripts/build_terrain_autotile.mjs:28` (`cols: 32`) | the autotile atlas grid (32 cols / 32px) is baked into the generator + output. | parametrise the generator on the atlas's tile size/cols per tier. |
| 5 | `src/scenes/OverworldScene.js` (chunk ground `tileSprite(…, 'tile_grass')` ~587; terrain RT `drawFrame('lpc_terrain', …, x*TILE, …)` ~299) | the streamer uses **one** `TILE`, **one** `'tile_grass'`, **one** `'lpc_terrain'` atlas for the whole world. | per-region tile size + per-tier ground atlas/key. |
| 6 | `src/systems/SaveManager.js:29` | `_CHUNK_PX = 1024` hardcoded (`= CHUNK×TILE`); chunk-delta keys assume the 32-grid. | derive from the active tier's chunk px (or keep world-space keys tier-independent). |
| 7 | `src/scenes/GreenhollowScene.js:93` (`const T = 32`) · `src/scenes/AssetSpikeScene.js:21` (`TILE=32, CHUNK=32`) | local 32s in the **discrete fallback** + a **throwaway spike** (not the live world). | low priority — fix if those paths ever take a non-T0 tier. |

*Per-asset PROPS dims (`assets.js` width/height in px) are already per-asset, and footprint
collision is px-based — both are resolution-agnostic, so they need no change for a new tier
(a higher-res prop simply ships bigger dims). Monster/character sheets already carry per-sheet
`fw` (64/128) in `BootScene`/`AssetLoader` — already flexible.*

**Bottom line:** growth-ready = **(i)** add the §0 tier registry + a `region.tier` field,
**(ii)** dedupe `TILE` to one SSOT, **(iii)** make the 5 atlas/loader/streamer spots read the
tier's tile size instead of literal `32`. Items (i)–(iii) are a *small* future change because
the geometry already flows from constants — the literals above are the only leaks.

---

*Cross-links: ASSET-MANIFEST.md (the measured assets) · STYLE-GUIDE.md (⚑ update its
scale/zoom per §1) · QUALITY-BIBLE Part 2.6 (Gate I — this quantifies it) · WORLD-BLUEPRINT.md
(per-region density/landmarks) · PEAKS-ART-CANDIDATES.md (the wiring that satisfies C1/C2) ·
verify.mjs (the gate roadmap §6). Doc-only; no code/SSOT touched.*
