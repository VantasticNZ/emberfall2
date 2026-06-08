# TILED FIT-CHECK — REPORT (the empirical go/no-go)

> **GAME-BUILD-PLAYBOOK v2 §8.1.** The throwaway prototype that proves the methodology at RUNTIME,
> not just in data, before we commit the world to it. Built: a `tiledToRegion()` adapter, a test
> `.tmj` with separate layers, the two runtime gates, and an eyes-on real-body drive of the imported
> map. **No real region touched** — the test map is an isolated fixture (`src/data/fitcheck/`, never
> referenced by game code, never added to `REGIONS`). Build stamp on every screenshot: `7921dc03`.

## ★ BOTTOM LINE: **GO.** The methodology round-trips at runtime. No remaining blocker.

A real `.tmj`, imported by `tiledToRegion()` and offset into world-space, renders and **plays**
correctly on the existing engine: a real player-sized body walks the nav corridor, is held by the
nav layer even where the art is absent, the gated branch blocks/opens by tool, and solid props block
without sitting on the path. The two runtime gates pass on the good map and **catch the B2 bug class**
on a bad one. The one open sub-risk (terrain render) is settled below.

---

## 1. TERRAIN-RENDER VERDICT — **CONVERT TO AUTOTILER PATCHES** (not direct tile-layer render)

The importer converts the Tiled `terrain` tile layer → the engine's existing `terrain.patches`
(`{set, rects}`) by mapping each tileset tile's `set` property to an autotiler set
(`terrainTiles.js`). Result, verified live (`fit-0-overview.png`): the dirt path + water pool
**rendered correctly through the existing `_buildRegionTerrain` autotiler** — feathered edges and
all — with **zero new render code**.

| Option | Verdict |
|---|---|
| **Convert → autotiler patches** ✅ **RECOMMENDED** | Reuses `_buildRegionTerrain` unchanged; keeps the autotiler's runtime corner-feathering; ONE render system; the importer is the only new code. Proven to render live. |
| Direct Phaser `TilemapLayer` render | Works in Phaser generally, but adds a SECOND, parallel ground-render path alongside the existing tileSprite/renderTexture system, and loses the autotiler's feathering (Tiled would have to pre-bake every transition tile). More code, more divergence. Rejected. |

**Authoring rule that follows:** in Tiled, paint ground with tiles tagged by a `set` property naming
a wired autotiler set (the 31 from `terrainTiles.js`). The importer does the rest. (A base-grass
tile carries no `set` → it falls through to the streamed grass base.)

> Minor note from the prototype: at the test origin (chunk 2, far NW) the streamed grass **base** is
> tinted brownish, so the dirt-vs-base contrast was subtle on screen. In a real region the blocked
> zones get cliff/water art (distinct), so this is a fixture artifact, not an engine issue.

---

## 2. RUNTIME PROOF (eyes-on, real input, realistic timing — the §3.1 requirement)

Each case drove the **actual player body** (16×8) with **real key input** through the **live imported
map**, against the real colliders. Measurements + screenshots:

| Case | What it proves | Result (measured) | Screenshot |
|---|---|---|---|
| **A — corridor walk** | The nav corridor is WALKABLE (no pinch) | Body walked the trunk ty11→ty7 (**130px up**), no stick | `fit-A-corridor-walk.png` |
| **B — blocked, art-gap** | Collision is from the NAV LAYER, not art | Pushed RIGHT into the open-looking grass zone (which has **NO barrier art**) → moved **8px, stopped at tx 9.75** — held | `fit-B-blocked-art-gap.png` |
| **C1 — gated branch, no tool** | The gate BLOCKS without the tool | Pushed right into the gate → **8px, tx 9.75** — blocked | `fit-C1-gated-blocked.png` |
| **C2 — gated branch, with tool** | The gate OPENS with the tool | Granted `tool_lantern`, gate removed → walked through to **tx 13.0** (the right exit) | `fit-C2-gated-open-with-tool.png` |
| **D — solid prop off-path** | A solid prop blocks (real collider) but none sit on the walkable path | Boulder is a registered SOLID collider in `this.solids`, sitting in the blocked zone (tile 12,8); the dirt corridor stays clear | `fit-D-prop-off-path.png` |

Also verified live on the imported region: **depth-sort** (hero/props sort by feet), **interaction**
(the sign imported as a readable prop; the chest as a chest), **entrance** extracted (`to:Greenhollow`),
and **0 console errors** throughout.

---

## 3. THE RUNTIME GATES (the 🔴 blockers from the review — now built + wired)

`src/systems/navGates.js` (reusable on any region) + `scripts/fitcheck/fitcheck.test.mjs` (in
`npm test`). Both are **body-aware + collider-true** — they check what a real 16×8 body experiences
against the real colliders, not just data consistency:

- **`bodyWalkReachability(region, expect)`** — floods the FREE configuration space of a 16×8 body
  (8px sub-tile resolution) against ALL colliders (nav + gate + solid props), from the start tile.
  Asserts: open destinations reachable, gated destinations reachable **only with the tool**, every
  blocked zone **holds**.
- **`noSolidPropOnWalkable(region)`** — fails if any solid prop's collider overlaps a nav-walkable
  tile (the §0 rule; the exact B2 cause).

**Proof the gates actually work (independent ground truth — a gate that can't fail is worthless):**
the test reproduces the **B2 bug** — three solid boulders dropped across the walkable trunk — and
asserts **both gates FAIL** (no-prop-on-walkable reports the offending tiles; body-walk reports the
open exit now unreachable). On the well-formed map, both PASS. ✅ (`fitcheck.test: 5 checks passed`,
in the `npm test` chain; `npm run verify` GREEN.)

---

## 4. WHAT'S NEEDED TO AUTHOR THE REAL WORLD THIS WAY

The prototype proves the pipeline; scaling to real regions needs only this bounded work (no
re-architecture):

1. **Tiled authoring conventions** (a 1-page spec): the four layers (`nav` object-rects with
   `kind=blocked|gate` + `tool`; `terrain` tiles tagged `set`; `props` by PROPS key + `solid`;
   `entities` typed chest/sign/entrance/npc) — exactly the contract `tiledToRegion` already reads.
2. **Region loading**: wire `tiledToRegion` outputs into the region-streaming **activation list**
   (the prototype called `_buildRegion` directly; real regions must register in the streamer's
   region set so they stream by proximity like the code-regions). Small, known change.
3. **Run the runtime gates on every region** (not just the fixture) — generalise the `expect`
   (intended destinations) from the nav layer's entrances/exits, and add the gates to `verify.mjs`
   for real regions once they exist.
4. **Gate-collider toggling**: the prototype toggled gated colliders by tool in the harness; the
   engine needs one small reusable "gated collider" path (the foothill already does this ad-hoc —
   unify it).
5. **Existing-region decision** (still open, per v2 §7): re-author GH/Marsh/Peaks in Tiled vs run
   two pipelines. The importer makes either viable; pick when the slice starts.

## 5. REMAINING BLOCKERS
**None.** The three 🔴 review blockers are closed: terrain-render path **settled** (convert-to-patches,
proven), runtime gates **built + proven to catch the bug class**, and the §0 principle is enforced by
a gate. Items in §4 are normal forward work, not blockers.

---

## 6. FILES (committed — pipeline + gates + report; the test map is an isolated fixture)
- `src/data/tiledImport.js` — `tiledToRegion()` (the real adapter).
- `src/systems/navGates.js` — the two reusable runtime gates.
- `src/data/fitcheck/fittest-map.js` — the test `.tmj` (valid Tiled JSON; **fixture only**, never in `REGIONS`).
- `scripts/fitcheck/fitcheck.test.mjs` — headless proof (import + terrain + gates + B2 negative), in `npm test`.
- `scripts/verify.mjs` — excludes `fitcheck/` from the magic-number gate (Tiled maps are literal-px data).
- `docs/TILED-FIT-CHECK-REPORT.md` + `fit-{0,A,B,C1,C2,D}-*.png` — this report + the runtime screenshots.

*Verdict: **GO** — build the world with Tiled via `tiledToRegion()` + convert-to-patches terrain +
the runtime gates. Proceed to v2 §8.2 (Mechanics design) and §8.3 (author the world nav layer).*
