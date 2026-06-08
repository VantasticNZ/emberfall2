# EMBERFALL 2 — WORLD BLUEPRINT (the authored master layout, doc-only)

> **Purpose:** end the generate-then-patch loop. This is the **deliberate, specified
> map** every later build session PLACES to — not procedural rules, an actual authored
> layout with coordinates, paths, gates, and landmarks. **Van LOCKS this before the next
> build phase.** Reconciles WORLD-MAP.md + WORLD-STRUCTURE-DESIGN (§2.1/2.1a watershed,
> §2.1b channelled-but-legible routes, §2.4 density/channelling gates, §2.5 gating law,
> §3 A/B/C cohesion ladder) + QUALITY-BIBLE 2.6 + TRAVERSAL-EXPLORATION + the built
> coords in `src/data/worldmap.js` + ASSET-LEDGER/ASSET-LIBRARY-CATALOGUE. **Doc-only —
> no code/SSOT/map-gen touched.**

> **Coordinate system (from the built code):** world = **512×512 tiles** (16384 px) =
> **16×16 chunks** of 32 tiles (1024 px) each. `TILE=32`. Origin top-left; **+x = EAST,
> +y = SOUTH**. All region blocks below are given in **tiles** (and chunk refs). Three
> regions are **already built at fixed coords — locked, do not move:** Greenhollow,
> Ashen Marsh, West Belt.

---

## 0. THE ONE-TENSION-TO-RESOLVE FIRST: Greenhollow is NOT centred

The built `GH_ORIGIN = chunk(5,5)` puts Greenhollow at tiles **x[160–211] y[160–199]** —
the **upper-left-of-centre** of the 16×16 world, not the middle (which would be ~chunk 8).
Consequence: there is **~300 tiles of room E and ~310 S**, but only **~160 N** (Peaks+Spire)
and the **W edge is already at Marsh**. WORLD-MAP says "Greenhollow at the CENTRE." This is
a contradiction between the doc-intent and the built coords.

**RESOLUTION (chosen — option A, no re-coordinate migration):** keep the built coords;
treat the world as **hub-biased-NW with the bulk of exploration unfolding E (Coast) and S
(Emberwood)**, and **Peaks/Spire stacked in the N strip** (160 tiles is plenty — Peaks ~72
tall + Spire ~50 tall + foothill bleed fits). This is *acceptable* hub-and-spoke (the Spire
still looms N on the horizon from everywhere) and avoids a risky shift of built content.
- ⚑ **FLAGGED ALTERNATIVE (B):** if Van wants true central symmetry, a one-time
  **re-centre migration** (shift GH/Marsh/Belt +~96 tiles E and +~64 S to ~chunk 8) OR
  **enlarge the world** (`WORLD_CHUNKS 16→20`) before building Peaks. Bigger change, better
  symmetry. **Decision needed at lock-time.** This blueprint is authored for **A**; the
  coord blocks below shift cleanly if B is chosen (they're all relative to GH).

---

## 1. LANDMASS + REGION PLACEMENT (authored coordinate blocks)

```
 WORLD 512×512 tiles. +x→E, +y→S. (chunk = 32 tiles)   [B]=built/locked  [P]=planned
 y
  24 ┌──────────────────────────────────────────────────────────┐
     │                    [P] HOLLOW SPIRE                        │  far-N endgame
  74 │                 x175–210  y24–74 (35×50, TALL silhouette)  │  (visible everywhere)
  78 │      ── gated ascent (all 4 tools + 4 shards) ──           │
     │                    [P] SUNDERED PEAKS                      │  N — strength
 150 │              x150–225  y78–150 (75×72)                     │  headwaters/snow
     │   foothill bleed band y150–160 (grass rises to stone)      │
 160 │   [B] ASHEN  │[B] BELT│      [B] GREENHOLLOW VALE          │··· river-road E ···┐
     │     MARSH    │ route  │         x160–211 y160–199           │                    │
     │  x110–149    │x150–159│         (52×40, the HUB)            │   [P] TIDEWRECK     │
 199 │  y165–198    │y165–198│   crossroads+waystone ~x200 y153    │       COAST  (E)    │
     │ (40×34 bog)  │(10×34) │                                     │  x260–345 y150–215  │
 200 ├──────────────┴────────┴─────────────────────────────────── │  (85×65) sea cliffs │
     │           ashen-road band  y200–235 (leaves→ash/frost)      │  + Saltbreak + delta│
 235 │                    [P] EMBERWOOD  (S)                       │  OCEAN at x>345 ────┘
     │              x160–235  y235–305 (75×70)                     │
 305 │           volcanic massif (high ground again)              │
     └──────────────────────────────────────────────────────────┘
        x: 110        160      211         260        345     →E (ocean edge)
```

| Region | Tiles (x / y) | ~Size | Compass | State | Borders (bleed) |
|---|---|---|---|---|---|
| **Greenhollow Vale** (hub) | x160–211 / y160–199 | 52×40 | centre-NW | **BUILT** | W→Belt→Marsh · N→foothills→Peaks · E→river-road→Coast · S→ashen-road→Emberwood |
| **West Belt route** | x150–159 / y165–198 | 10×34 | between GH & Marsh | **BUILT** (Ph5/5b) | E↔GH W-trailhead · W↔Marsh E-edge |
| **Ashen Marsh** | x110–149 / y165–198 | 40×34 | W | **BUILT** | E↔Belt · N/S mire gated (later tools) |
| **Sundered Peaks** | x150–225 / y78–150 | 75×72 | N | PLANNED | S↔GH foothills (y150–160) · N↔Spire ascent (gated) |
| **Hollow Spire** | x175–210 / y24–74 | 35×50 | far-N | PLANNED | S↔Peaks (gated, all-tools) |
| **Tidewreck Coast** | x260–345 / y150–215 | 85×65 | E | PLANNED | W↔river-road↔GH · E→ocean (world edge) |
| **Emberwood** | x160–235 / y235–305 | 75×70 | S | PLANNED | N↔ashen-road↔GH |

**Connecting wild/route bands** (the traversable wilds BETWEEN settlements, §2.1):
GH↔Marsh = the **West Belt** (built); GH↔Peaks = **foothill route** band y150–160 (N
trailhead at ~GH x185); GH↔Coast = **river-road** band x211–260 y170–195 (follows the river
E); GH↔Emberwood = **ashen-road** band y200–235 x180–210 (S trailhead); Peaks↔Spire =
the **gated ascent** y74–78.

---

## 2. PATH NETWORK (authored routes — channelled AND legible; the Phase-5b lesson)

**Design law for every route (baked from Phase-5b):** the lane READS as the obvious way at
a glance — **framed** by terrain walls (treeline/cliff/water), **not** lost in a thicket;
widen where tight; density goes OFF the path to block sightlines ACROSS it, never ALONG it.
Channelled-not-open AND legible. Routes FORK (real choices); the graph is a **WEB, not a
line** (§2.4 web-not-line — ≥2 viable routes between adjacent regions).

```
                         [SPIRE]
                            │  (single gated ascent — the one deliberate chokepoint, §2.5)
                         [PEAKS]
                    high-pass┊  fork: quarry-road ── mountain-town ── keep-road
                            │
              foothill route (N trailhead, x185 y150→160)
                            │
   [MARSH]══BELT══[GREENHOLLOW]════river-road════[COAST]
            (built  │  CROSSROADS+waystone (x200 y153)   fork: cliff-road / beach-road
          fork:N/S) │
                ashen-road (S trailhead)
                            │
                       [EMBERWOOD]
                    fork: burnt-village-road / deep-wood-road
```

- **West Belt (GH↔Marsh) — BUILT, being made legible in Ph5b:** trunk from GH W-trailhead
  → junction → **forks** N-scenic (skirts the pond) / S-direct (to Mirefen hub); a spur
  hides a cache. *Apply the legibility law here in Ph5b.*
- **Foothill route (GH↔Peaks):** leaves the **Crossroads** N; bends around a vale lake;
  **forks** at the foothills — a gentle **quarry-road** (to the mine/town) vs a steeper
  **keep-road** (to Cinder Keep). Channelled by rising stone ridges (cosmetic elevation
  = FREE; true climb = ENGINE/grapple).
- **River-road (GH↔Coast):** follows the **river E** (the watershed spine — you walk
  beside the water that left the Peaks and crossed the vale); bends through a **river-gorge**
  (the GRAPPLE gate, §3); **forks** at the coast into **cliff-road** (to tide caves) vs
  **beach-road** (to Saltbreak harbour). The river *guides* you (FREE-NOW — a painted
  path you walk beside).
- **Ashen-road (GH↔Emberwood):** leaves GH S; the green **bleeds to ash + frost** as you
  go; crosses a **chasm** (the HOOKSHOT gate, §3); **forks** at the wood into
  **burnt-village-road** vs **deep-wood-road** (to Ember Hollow).
- **The Crossroads (x~200 y~153, just N of GH):** the node where the N/E roads split + the
  **first waystone** (fast-travel anchor, unlocked by visiting). The W (Belt) and S
  (ashen) roads leave from GH's W/S edges and tie into the village ring road.

---

## 3. GATING PLACEMENT — the Metroidvania DAG (NO soft-locks; the strict gate)

**Tools (SSOT, built):** `tool_lantern` (Marsh) · `tool_grapple` (Peaks) · `tool_hookshot`
(Coast) · `tool_firefrost` (Emberwood). **Shards:** `shard_1..5`. The rule: **every gate's
key is obtainable BEFORE the gate; no circular gating.** The geography IS the gate (§2.1a).

```
DEPENDENCY DAG (read top→down = the only viable order to FIRST-reach each region):

  GREENHOLLOW (open from boot) ──W open──▶ ASHEN MARSH (open; no tool to ENTER)
        │                                        │ earn LANTERN + shard_1 + Marsh-truth
        │                                        ▼
        │   N road gated by [STORY: marsh_done/shard_1] ──▶ SUNDERED PEAKS
        │                                                       │ earn GRAPPLE + shard_2
        │                                                       ▼
        │   E river-gorge gated by [tool_grapple] ──────▶ TIDEWRECK COAST
        │                                                       │ earn HOOKSHOT + shard_3
        │                                                       ▼
        │   S chasm gated by [tool_hookshot] ───────────▶ EMBERWOOD
        │                                                       │ earn FIREFROST + shard_4
        │                                                       ▼
        └─ far-N ascent gated by [4 shards + tool_firefrost] ─▶ HOLLOW SPIRE ─▶ shard_5 + endings
```

**Why no soft-lock (proof):** Marsh needs **no** tool to enter (you *get* the lantern
inside) → start is always reachable. Each subsequent region's entry gate uses the tool
earned in the PRIOR region (grapple→Coast, hookshot→Emberwood), and the Spire uses
firefrost + the 4 shards you already hold. No region's key is locked behind itself, and the
first link (GH→Marsh) is ungated. **Linear FIRST-clear, non-linear REVISIT** (once you hold
2+ tools you can backtrack freely).

**TEASE → PAYOFF map (every see-but-can't-reach has a specified later key — no orphan teases):**

| Tease (see-it-early) | Where | Payoff key (reach-it-later) |
|---|---|---|
| **West Belt pond-ISLAND cache** (built Ph5) | West Belt (W of GH) | **`tool_hookshot`** (Coast) crosses the water gap — *reconciles the Ph5 "future water-crossing tool" tag with a concrete key; not engine-blocked, it's the hookshot* |
| **Boarded cave (M4)** | GH meadow | **`tool_lantern`** (Marsh) — lights the dark interior |
| High ledges / vale-lake island | GH, Marsh, Peaks foothills | **`tool_grapple`** (Peaks) |
| Tide caves (Coast) | Coast cliffs | **TIME gate** (tide) + `tool_hookshot` — [ENGINE: tide-timed water, §2.5 TIME] |
| Burnt-thicket / frozen-flow nooks | Emberwood, backtrack | **`tool_firefrost`** (Emberwood) |
| The Spire summit (visible all game) | horizon | the whole-game culmination (4 shards) |

⚑ **One deliberate flagged chokepoint:** the **Spire ascent** is intentionally the single
forced corridor (§2.5 allows a flagged story chokepoint). Everywhere else obeys web-not-line.

---

## 4. LANDMARKS · SECRETS · DENSITY FLOOR (per region; planning-level)

Orienting landmark law: the **Spire** is the global vista (visible N from everywhere); each
region has ≥1 **silhouette landmark** you navigate by. Density floor (§2.4): **every
screen-sized sector has something** (feature / POI / secret / encounter / story-beat) — planned
per region below, not per-tile.

| Region | Silhouette landmark(s) | Settlement | Dungeon/set-piece | Secrets/caches (examples) |
|---|---|---|---|---|
| **Greenhollow** | the village chapel + the Crossroads waystone; Spire on the N horizon | Greenhollow Village | (the boarded cave M4) | orchard cache, brook hollow (built: 3 chests) |
| **West Belt** | the trail waystone (junction) | — (Mirefen beyond) | — | reachable spur cache (built) + pond-island tease (built) |
| **Ashen Marsh** | Hagga's crooked hut; the Sunken Shrine spire | Mirefen (stilt-village) | **Sunken Shrine** (lantern dark/light) | sunk caches in black water; Pem-trail clue |
| **Sundered Peaks** | the riven cleft ("Sundered"); the mountain town terraces | stone mountain town | **Cinder Keep** | quarry/mine nooks; high-pass tarn; grapple ledges |
| **Tidewreck Coast** | the lighthouse; the great wreck on the reef | **Saltbreak** harbour | the **Drowned Vault** (tide/hookshot) | tide caves; message-in-a-bottle (Pem-trail); cliff caches |
| **Emberwood** | the **volcano cone + lava-glow**; the half-burnt half-frozen settlement | the Caught Settlement | **Ember Hollow** | ashen relics; the Weeping Tree; firefrost nooks |
| **Hollow Spire** | the Spire itself | the oracle sanctum | the **Binding Chamber** | the long-ascent gauntlet; shard_5 at the summit |

---

## 5. BIOME BOUNDARIES + TRANSITIONS (reconciled with the watershed §2.1a)

All seams **bleed** (Gate D feathered autotile + Gate C depth band) — no hard island edges.
The **watershed + elevation flow continuously THROUGH the seams** (the strongest "one place" cue):

- **GH → Marsh (W):** green → bog. The land **dips W** (low wet basin) → grass softens to
  reed/mud/black-water. A river **distributary** seeps W off the vale river INTO the marsh
  (reads as *why* it's wet). **BUILT** (the continuous `groundTintAt` green→bog gradient).
- **GH → Peaks (N):** green → foothill-grass → stone/snow. The land **rises N**; the
  **river enters GH from the N** (snowmelt headwaters) — trace it up into the Peaks.
- **GH → Coast (E):** green → river-delta → dune/rock → sea. The **river runs E downhill**,
  widening to a **delta where fresh meets the OCEAN**. Sea cliffs at the coast edge.
- **GH → Emberwood (S):** green → ash + frost. The land **rises again to the volcanic
  massif**; water here is **separate + warm** (steam springs / sulfur tarn) — the cold
  northern system does NOT flow here (fire vs cold-water opposition).
- **Peaks → Spire (far-N):** stone → snow/ice cap (the highest point).

---

## 6. CRITICAL-PATH OVERLAY (M1–M20 threaded through the map)

(Quests already BUILT as data — see PLAN; this is where each plays on the layout.)

| Beats | Region (coord block) | Gate to be there | Tool/shard earned |
|---|---|---|---|
| **M1–M7** childhood + return + hub side quests (SG1–SG7) | Greenhollow | open (childhood = bounded GH; roads open one-by-one after) | — (skill_see_markers via SG1) |
| **M8–M10** the first lie + shrine + boss | Ashen Marsh (via West Belt) | W open | `tool_lantern`, `shard_1` |
| **M11–M12** miners-vs-owner + Cinder Keep | Sundered Peaks | N road [story: shard_1] | `tool_grapple`, `shard_2` |
| **M13–M14** Saltbreak + Drowned Vault | Tidewreck Coast | E gorge [`tool_grapple`] | `tool_hookshot`, `shard_3` |
| **M15–M16** Caught Settlement + Ember Hollow (perm. decision) | Emberwood | S chasm [`tool_hookshot`] | `tool_firefrost`, `shard_4` |
| **M17–M20** Sela / the Long Ascent / Binding Chamber / the Choice | Hollow Spire | far-N ascent [4 shards + `tool_firefrost`] | `shard_5` → endings |

Optional content (Pem-trail clues, PH1–6 philosophy, cameos, side quests) hangs **off** the
critical path in each region's secret pockets — already built as data, placed per §4.

---

## 7. ASSET REALITY-CHECK (grounded in ASSET-LEDGER + ASSET-LIBRARY-CATALOGUE)

✅ = licence-safe art already in repo / staged (`asset-library/2d/...`, OGA-BY/CC-BY-SA).
⚑ = **FLAGGED GAP** → needs a targeted OGA/LPC hunt (the catalogue confirmed the
`D:\GameAssetLibrary` CraftPix packs are licence-BLOCKED, so gaps need a real LPC hunt).

| Region | Key visual needs | Status |
|---|---|---|
| **Greenhollow** | grass/village/forest/autotile | ✅ have (eliza + Sharm + lpc-terrains) |
| **West Belt / Marsh** | bog/reed/mud/water, pines | ✅ have (lpc-terrains bog + eliza) |
| **Sundered Peaks** | cliff/rock, stone buildings | ✅ cliffs (`eliza-terrain/cliff_*.png`) + lpc-terrains; ⚑ **snow/ice tiles**, ⚑ **terraced stone town** |
| **Tidewreck Coast** | ocean/sea-edge water, sand/dune, sea-cliffs, harbour/dock + wreck | ⚑ **GAP**: shore/ocean tiles, dune/sand, dock/pier + shipwreck props, lighthouse |
| **Emberwood** | lava/ember, frost/ice ground, volcano cone, ash trees | ⚑ **GAP**: lava+frost terrain, volcano silhouette, burnt/frosted trees (FX exist: `lpc-magic` fire/ice) |
| **Hollow Spire** | a tall tower/altar silhouette + sanctum interior | ⚑ **GAP**: spire/tower structure, altar/binding-chamber set |
| **Cross-cutting** | animals/critters, crops, bench; tool held-items (lantern/grapple/hookshot/firefrost) + FX | ⚑ **GAP** (animals/crops/bench per the catalogue) + ⚑ tool sprites/FX |

**Grounding note:** the WEST (Marsh) + central (GH) builds are fully art-supported now;
**Peaks is ~80% supported** (cliffs yes, snow/stone-town to source); **Coast + Emberwood +
Spire each need a targeted LPC/OGA art hunt BEFORE their build session** (don't generate
placeholders — flag + omit per HARD RULE 9). Sequence the hunts to lead each region build.

---

## 8. QUALITY-GATE SELF-CHECK (pass/fail)

| Gate | Verdict | Note |
|---|---|---|
| **Channelled-not-open + LEGIBLE** | ✅ PASS (by design) | every route in §2 is an authored framed lane that forks; Phase-5b legibility law is baked in as the route design law |
| **Density floor (per sector)** | ✅ PASS (designable) | §4 plans landmark+settlement+dungeon+secrets per region; "something per screen" satisfiable |
| **WEB-not-line (≥2 routes)** | ✅ PASS | every inter-region link + in-region route forks (§2); only the Spire ascent is a flagged deliberate chokepoint |
| **NO SOFT-LOCKS (strict)** | ✅ PASS (proven) | §3 DAG: ungated start, each gate's key earned in the prior region, every tease has a named payoff key, no circular gate |
| **Three-level cohesion (A/B/C) designable** | ✅ PASS | A: each region block self-contained; B: §5 watershed/biome bleed across every seam; C: web+landmarks+Spire-vista support "wander it with no quest" |
| **Reconciles with captured geography/gating/story** | ⚠ PASS *with flags resolved* | GH-not-centred (§0, resolved A, alt B flagged for Van); volcano-vs-wood (carried from §2.1a, resolved); belt-island tease key (resolved=hookshot); Marsh N/S mire gating (kept, opens with later tools) |

---

## 9. BUILD ORDER (place to THIS plan; don't generate)

1. **DONE:** Greenhollow (gold) + Ashen Marsh + West Belt (Phase 5 route; **Phase 5b =
   legibility + west-only exit** in flight).
2. **Sundered Peaks (N)** — next region + the GH↔Peaks foothill seam. (Art ~80% ready;
   source snow/stone-town first.) Re-verify Level A (Peaks) + B (foothill seam).
3. **Tidewreck Coast (E)** — + the river-road/gorge seam. **Art hunt first** (shore/dock/wreck).
4. **Emberwood (S)** — + the ashen-road/chasm seam. **Art hunt first** (lava/frost/volcano).
5. **Hollow Spire (far-N)** — + the gated ascent. **Art hunt first** (spire/altar). Then the
   3 endings + the Level-C "wander the whole world" capstone.

Each region session: paint terrain to the **coord block** (§1), lay the **authored path +
forks** (§2), drop the **gate + key** (§3), place **landmarks + secrets** (§4), bleed the
**biome seam** (§5), wire the already-built **quests** (§6) — verify A + B, hand C to Van.

---

## 10. LOCK-TIME DECISIONS FOR VAN
1. **§0:** accept **A** (keep GH at chunk 5,5, hub-biased-NW, bulk of world E+S) — or commit
   **B** (re-centre / enlarge the world) before Peaks? *(This blueprint assumes A.)*
2. **§3:** confirm the gate keys (N road = story/shard_1; E = grapple; S = hookshot; Spire =
   4 shards+firefrost) and the **belt-island tease payoff = hookshot**.
3. **§7:** approve sequencing an **art hunt to lead each of Coast / Emberwood / Spire**.

*Cross-links: WORLD-MAP.md · WORLD-STRUCTURE-DESIGN §2.1/2.1a/2.1b/2.4/2.5 · QUALITY-BIBLE
2.6 · TRAVERSAL-EXPLORATION · ASSET-LEDGER · ASSET-LIBRARY-CATALOGUE · src/data/worldmap.js
(built coords). Doc-only; no code/SSOT/map-gen touched.*
