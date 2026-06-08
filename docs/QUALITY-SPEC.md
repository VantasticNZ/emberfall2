# EMBERFALL 2 — QUALITY SPEC (the concrete look / size / cohesion bar)

> **Integrated-design foundation, Step 1 (pair of `ASSET-MANIFEST.md`).** Turns
> "amazing + cohesive" into a **measurable** bar: a number or a clear pass/fail per item,
> derived from the reference style (**LPC 32 px top-down**; the *Zelda: A Link to the Past
> / Adventure Time / classic pixel-RPG-map* look Van referenced) and from the **measured**
> repo assets. Sits under HARD RULE 9 / QUALITY-BIBLE Part 2.6 (this is the *quantified*
> companion to Gate I cohesion). Each item flags whether it can become a `verify.mjs`
> gate. Doc-only.

---

## 0. THE LOCK — ONE canonical asset standard for the WHOLE game (LAW, non-negotiable)
**The entire game — every region, every screen, every asset, current and all future — uses
ONE canonical standard. There are no tiers, no resolutions-per-zone, no mixing.**

### 0.1 THE LOCKED STANDARD
| Axis | Locked value |
|---|---|
| **Family / style** | **Liberated Pixel Cup (LPC)** — ElizaWy LPC Revised (characters) + ElizaWy/terrain-v7 LPC terrain. ¾ top-down. |
| **Terrain tile** | **32 × 32 px**, tiled 1:1, never upscaled |
| **Character / enemy frame** | **64 × 64 px** (128 px oversize for swing/FX) |
| **Palette** | the **LPC palette family** (recolours only from real LPC colour variants — no ad-hoc hue, no off-family hue) |
| **Scale ratios** | **character : tree : building ≈ 1 : 2.7 : 4.2** (visible height; §2) — hero ~1.5 tiles, trees ~4, buildings ~5–7 |
| **Render** | 768 × 432 native, pixelArt ON (never smoothed), camera zoom 1.25 |

### 0.2 THE LAW
1. **Conform or be rejected.** Every asset MUST match the locked standard (size + grid + LPC
   style + palette family). A non-conforming asset is **REJECTED** — it is recoloured/resized
   to conform before use, or it is not used. **We do not adapt the game to the asset; the asset
   conforms to the game.**
2. **No mixing, ever.** No second resolution, no alternate style family, no "HD zone." Whole-game
   visual continuity is the goal — a player never sees two art standards on one screen, or across
   the world, *except* the one sanctioned exception below.
3. **The ONLY sanctioned exception — the "out-of-place character" gag.** A single character may be
   deliberately drawn in a *different* style as a joke. It is legible as intentional **only because
   the default is strict.** It MUST be explicitly tagged `outOfPlace:true` so it is recorded as the
   sanctioned exception and **never counts as a cohesion violation**. Nothing else — no terrain, no
   prop, no building, no biome — may ever be off-standard.

> **⚑ SUPERSEDES the tier model.** A prior Step-1 addendum proposed a multi-tier registry
> (reserved T0/T1/T2 slots, "flexible across contexts"). **Van has LOCKED to a single standard
> for whole-game continuity — that decision wins and RETIRES the tier registry.** The locked
> standard above *is* the former "T0"; the reserved T1/T2 slots are **withdrawn**. The hardcoded
> `TILE = 32` / `FRAME = 64` constants are therefore **correct and intentional** (the lock made
> physical) — see §7 (the only cleanup is deduping `TILE` to one SSOT; do NOT make it configurable).

### 0.3 NEW-ASSET CONFORMANCE GATE (every sourcing session runs this BEFORE import)
Any asset proposed for the game is checked against the lock **before** it enters `public/` or
the ledger. It passes only if ALL hold; otherwise it is **conformed or rejected** (never
adapted-around):

| Check | Pass condition |
|---|---|
| **Grid** | terrain on a **32px** grid (dims multiples of 32, or a prop sized in 32px-tile space); character/creature on **64px** frames |
| **Style family** | **LPC** (or LPC-compatible — same proportions/line-weight/perspective). No painterly, no AA/smoothed, no 3D-render, no off-family pixel set |
| **Palette** | within the **LPC palette family**; recolours come from real LPC colour variants, not ad-hoc hue rotation |
| **Scale** | fits the §2 class bands (character ~1.5 tiles, tree ~4, building ~5–7) |
| **Licence** | AI-safe (CC0 / OGA-BY / CC-BY[-SA] / GPL); ledgered (orthogonal to the lock but also mandatory) |

**Outcome of a fail:** (a) **recolour / resize** it to conform (e.g. tint to the LPC palette,
re-grid to 32px) and re-check; or (b) **REJECT** it and source an LPC-conforming alternative.
A non-conforming asset is **never** shipped on the strength of "we'll make the game accept it."
→ this is the rule `PEAKS-ART-CANDIDATES.md`-style sourcing sessions already apply; now it is law.

---

## 1. RESOLUTION + GRID — the locked standard, measured
| Item | Value | Pass/fail | Gate? |
|---|---|---|---|
| Terrain tile | **32 × 32 px**, tiled 1:1, never upscaled | every map tile is 32px-grid-aligned | ✅ gateable |
| Character / enemy frame | **64 × 64 px** (rows = N/W/S/E) | measured: idle 192×256, walk 512×256, attack 448×256 | ✅ gateable |
| Oversize FX / swing | **128 px** frames | sword 896×512, lpc-magic 512×512 | — |
| Native render | **768 × 432** (16:9) | `VIEW` in main.js | — |
| Camera zoom | **1.25** (Overworld, live) | ⚑ **supersedes STYLE-GUIDE's "ENVELOP / [0.7,0.85,1.1]@0.85"** (that was the discrete era). **Canonical = RESIZE + 1.25.** Update STYLE-GUIDE. | — |
| **Visible "screen"** | at 1.25 zoom ≈ **19.2 × 10.8 tiles** (≈ 207 tiles) | the design unit for density below | — |
| Pixel rendering | pixelArt ON, never smoothed | no anti-aliased/blurred art | ✅ gateable |

**Rule R1 — ONE grid, ONE family, WHOLE GAME:** every on-map asset everywhere is the locked
standard: **32px LPC terrain / 64px LPC actors, LPC palette.** **ZERO** mixed-resolution
(the 16×16 `kenney/` tiles are BANNED from every map), **ZERO** off-family palette, **ZERO**
painterly/AI-smoothed art — in any region, any screen. Pass/fail: every referenced asset ∈
the locked standard (grid + family + palette). The **only** exception is an actor tagged
`outOfPlace:true` (the sanctioned gag, §0.2). → **verify candidate** (lint every referenced
art file's dims/family against the one locked standard).

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
At the locked 32px tile: hero ~1.5 tiles (~48px), trees ~4 (~130px), buildings ~5–7
(~160–224px) — the LPC/LttP convention. Pass/fail: no on-map asset falls outside its class
band (a "house" < 4 tiles, a "tree" < 3, a boulder taller than a building → FAIL). →
**verify candidate** (prop-height band lint against the locked scale).

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

## 4. COHESION — the explicit definitions (each checkable, against THE LOCK)
The four things that made the first Peaks read *wrong*, now defined as pass/fail. **Every
cohesion check below is evaluated against the ONE locked standard (§0)** — 32px LPC / 64px
LPC actors / LPC palette — for every region and every screen. There is no per-context
variation to honour: a single fixed bar, world-wide. (The lone allowed deviation is an
`outOfPlace:true` actor — the gag — which is recorded as the sanctioned exception, §0.2.)

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

**C4 — RESOLUTION + PALETTE unity, WHOLE GAME (no clashing mixes anywhere).**
- One grid (32px), one character frame standard (64px), one palette family (LPC) across the
  entire game — every region, every screen. No painterly/AI-smooth/off-standard asset
  anywhere (R1). Pass/fail = R1. The sole exception is an `outOfPlace:true` actor (the gag,
  §0.2). → **verify candidate.**

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
> `verify.mjs` as each region is built, exactly like the 6 [OBJECTIVE] gates were. Each gate
> checks against the **one locked standard** (§0) — there is no per-context variation to read.

---

## 7. WHERE THE LOCKED 32 LIVES (these hardcodes are CORRECT — do NOT make them configurable)
The `TILE = 32` / `FRAME = 64` constants and the literal `32`s below **ARE the lock made
physical** — they are *intended* to be single + global, and must stay that way. This is the
inventory of where the canonical size is enforced, NOT a refactor list. (The prior addendum
framed these as "soften for a future tier"; the LOCK retires that — keep them pinned.)

| # | Location | The locked 32/64 | Status under the lock |
|---|---|---|---|
| 1 | `src/data/assets.js:20-21` | `TILE = 32`, `FRAME = 64` — the canonical SSOT | **KEEP fixed.** This is the law. |
| 2 | `src/data/worldmap.js:15-17` | **DUPLICATE** `TILE=32`, `CHUNK=32`, `CHUNK_PX` | ⚑ **ONE hygiene item:** dedupe — import `TILE` from `assets.js` so there is a *single* SSOT (two copies could silently drift). Not for tiers — for correctness. |
| 3 | `src/art/AssetLoader.js:44` | `lpc_terrain` `frameWidth: 32` | KEEP fixed (matches the atlas + the lock). |
| 4 | `terrainTiles.js:5` (`cols:32`) + `build_terrain_autotile.mjs:28` | autotile atlas grid 32px/32-col | KEEP fixed. |
| 5 | `OverworldScene.js` (`tileSprite(…'tile_grass')` ~587; `drawFrame('lpc_terrain',…,x*TILE)` ~299) | one `TILE` / one ground atlas, world-wide | KEEP fixed — single-standard streamer is exactly the lock. |
| 6 | `SaveManager.js:29` | `_CHUNK_PX = 1024` (`= CHUNK×TILE`) | KEEP fixed. |
| 7 | `GreenhollowScene.js:93` (`const T = 32`) · `AssetSpikeScene.js:21` | local 32s (discrete fallback / throwaway spike) | KEEP fixed (consistent with the lock). |

**Bottom line:** the lock means the only outstanding code item is **deduping the two `TILE`
definitions (assets.js ↔ worldmap.js) to one SSOT** — a correctness fix, not a flexibility
one. Everything else hardcoding 32/64 is the canonical standard working as intended. **Do not
add a tier system, a `region.tier` field, or per-context tile sizes.**

---

*Cross-links: ASSET-MANIFEST.md (the measured assets + CONFORMS field) · STYLE-GUIDE.md
(⚑ should be updated to state THE LOCK — its "ENVELOP / zoom 0.85" line is stale; canonical
= 32px LPC / 64px frame / RESIZE+1.25) · QUALITY-BIBLE Part 2.6 (Gate I — this quantifies it) · WORLD-BLUEPRINT.md
(per-region density/landmarks) · PEAKS-ART-CANDIDATES.md (the wiring that satisfies C1/C2) ·
verify.mjs (the gate roadmap §6). Doc-only; no code/SSOT touched.*
