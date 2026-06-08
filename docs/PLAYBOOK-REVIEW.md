# GAME-BUILD-PLAYBOOK — ADVERSARIAL REVIEW

> **Purpose (2026-06-09):** stress-test `GAME-BUILD-PLAYBOOK.md` (Van's Downloads) against established
> best practice + the *actual* Emberfall 2 codebase, BEFORE we commit the world to it. Adversarial,
> not a rubber stamp. **No game code changed** — review + research only. Verdict at the bottom.
>
> Method: read the playbook in full; mapped the real engine (OverworldScene streaming, worldmap.js
> regions/chunks, SaveManager, Combat, QuestEngine, the 13 verify gates, TILED-PIPELINE-PLAN);
> web-researched Phaser/Tiled/streaming/gating/data-pipeline best practice with cited sources.

## 0. ONE-LINE BOTTOM LINE
**The methodology is fundamentally sound and ~85% complete. The streaming↔Tiled integration is
GO (cleaner than feared — the world is already finite regions in a coordinate space, not pure
procedural streaming). But there are TWO things that MUST be resolved before authoring any region,
and ONE that's actually *wrong* in the playbook.** Details below.

---

## 1. THE CRITICAL VERDICT — streaming overworld ↔ Tiled reconciliation

### 1.1 What the engine actually is (this changes everything)
The overworld is **NOT** a pure procedurally-streamed infinite space. It is:
- A **640×640-tile (20×20 chunk, 20480 px) world coordinate space** (`worldmap.js:15-19`).
- **Finite, hand-authored REGIONS** — each a rect with an `origin` + `bounds` + `widthTiles/heightTiles`
  and its own `props / colliders / terrain / npcs / chests / combat` arrays (GH 52×40, Marsh, Belt,
  Peaks 30-ish, Foothill 30×10). `REGIONS` + `regionAt(x,y)` (`worldmap.js:496`).
- **Procedural `chunkContent(cx,cy)`** that streams *open-field decorative scatter* per 32-tile chunk
  in the space *between* regions (`worldmap.js:569`).
- `OverworldScene` streams regions by proximity + chunks for the filler, with pooling + cull
  (`OverworldScene.js:61 pool, ~108 perf, ~817-846 pooling`).

**Why this matters:** a Tiled map is a finite rect. A worldmap region is *already* a finite rect with
an `origin`. **They are the same shape.** The feared mismatch ("infinite stream vs finite map") does
not exist — the authored world is finite regions; only the *filler between them* is procedural.

### 1.2 VERDICT: ✅ GO — feasible and clean
Finite Tiled maps compose into the world the obvious way: **one Tiled map per region (and per
connector), offset into world-space by that region's `origin`.** The existing region-streaming loads
finite regions by `bounds`; Tiled-imported regions slot into that path unchanged. This is exactly
what `TILED-PIPELINE-PLAN.md` already proposes (`tiledToRegion(tmj)` → the region-adapter shape) — and
it is the right call.

### 1.3 Recommended integration pattern (concrete)
1. **One `.tmj` per region + connector.** Layers: `nav` (collision SSOT — see below), `terrain`
   (ground tile layer), `props`/`objects` (image-collection tilesets, by PROPS key), `entities`
   (object layer: npcs/chests/signs/entrances/enemies with custom props).
2. **Offset by the region `origin`.** Phaser has **no built-in `.world` loader** (research §2 —
   `.world` is a Tiled *authoring* construct only). Two equally-valid ways to supply offsets:
   (a) keep the region origins in `worldmap.js` as the SSOT and pass them to the importer (recommended
   — origins already exist + are gate-checked for seams), or (b) author a Tiled `.world` file and
   mirror its `x/y` offsets in the loader. **Do NOT expect Phaser to read `.world` directly.**
3. **`tiledToRegion(tmj, origin)`** → the existing `{origin, bounds, props, colliders, terrain,
   npcs, chests, combat, entrances}` shape. Zero engine change downstream (the plan's key insight).
4. **Nav layer → static bodies = the channel-wall SSOT.** Author collision as a dedicated layer
   (object-rectangles OR a `collides`-property tile layer → `setCollisionByProperty`), the standard
   Phaser pattern (research §1, §3). This **replaces the hand-coded `_buildFoothillColliders`/belt
   tile-colliders**. Solid *props* still carry pixel-truth colliders (unchanged) — see the WRONG-#1
   tension in §3.
5. **Procedural `chunkContent` filler stays** for the open between-region space (or specific
   connectors become Tiled maps). It does not need to become Tiled.

### 1.4 The make-or-break sub-risks (must be settled in the fit-check, §8.1 of the playbook)
- **🔴 TERRAIN RENDERING is the real unknown, not collision.** The engine renders ground today via the
  **autotiler** (`terrainTiles.js` corner-transition patches + `tileSprite`), NOT Tiled tile layers.
  A Tiled map's ground IS a tile layer. The fit-check MUST decide: **render the Tiled tile layer
  directly** (new render path; loses the autotiler's runtime feathering) **vs convert the Tiled ground
  → terrain patches** (importer flattens it; keeps the autotiler). This is the single biggest
  integration cost and is currently under-specified in both docs. *Resolve it in the throwaway map
  before authoring anything real.*
- **🟠 Two collision sources must be reconciled cleanly:** nav-layer (paths) + pixel-truth (props).
  New code needed: a nav-layer→static-body builder. Bounded, but it's the thing that, done wrong,
  re-creates the B2 path bug.
- **🟠 Migration of the 5 EXISTING regions.** GH/Marsh/Belt/Peaks/Foothill are working hand-authored
  content. The playbook §8.3 ("paint GH→Peaks in Tiled") implies **re-authoring working regions** =
  real rework, OR running **two pipelines** (code-regions + Tiled-regions) indefinitely. The playbook
  does not state which. Decide explicitly (recommend: new/re-terrain regions in Tiled; keep the
  working code-regions until a region needs rework — but ONE importer path so both produce the same
  shape).
- **🟡 Streaming churn:** async-preload the neighbour region before the seam (research §5: synchronous
  boundary loads = pop-in; physics-body churn). The engine already streams; adding `.tmj` load adds
  an async step. Bounded.

**Net:** no blocker. The architecture is *favourable* to Tiled. The fit-check is the correct gate;
just make sure the fit-check explicitly answers the **terrain-render question (🔴)** — not only
"does collision work."

---

## 2. GAPS — confirmed, added, with severity

Severity: **🔴 BLOCKER** (resolve before building) · **🟠 IMPORTANT** (resolve before scaling past the
slice) · **🟡 NICE-TO-HAVE** (before ship).

| # | Gap | Status | Severity | Note |
|---|-----|--------|----------|------|
| G1 | **Gates verify the MODEL, not the RUNTIME** | **ADDED (the deepest one)** | 🔴 | The B2 path bug **passed all 13 gates** yet was unwalkable by a real body — because BFS-of-nav-data ≠ a 16px body threading solid-prop fragments. The playbook's own lesson ("test against independent ground truth / real-input drive", §3) is a *discipline*, not a *gate*. Add a **headless body-walk reachability gate** (or at minimum: "no solid-prop collider intrudes on a nav-walkable tile"). Without it the circling can recur. |
| G2 | **Nav-walkability vs solid props — no gate** | **ADDED** | 🔴 | Directly caused B2 (solid scatter fragmenting a nav-clear lane). The playbook states the nav layer owns path walkability AND keeps pixel-truth props — but nothing enforces that a solid prop never lands on a walkable nav tile. This is the #1 recurring-bug class. Gate it. |
| G3 | **Terrain-render path for Tiled** | **ADDED** | 🔴 | See §1.4. The fit-check must resolve direct-tile-layer vs convert-to-patches. |
| G4 | **Performance budget as a gate** | Confirmed | 🟠 | No FPS floor / object-count cap / draw-call budget in `verify.mjs`. Telemetry exists (`perf()`), pooling + cull exist, but nothing FAILS the build at 30 fps. For a "vast" world this is the scaling risk. The eye-gate can't catch a slow region reliably. Add a live perf gate (FPS floor under load + object-count cap). |
| G5 | **RPG MECHANICS are not a hierarchy level** | **ADDED** | 🟠 | The playbook's 9-level hierarchy is a *world-building* methodology (space→art→engine-systems). It has **no level for game-design-as-mechanics**: the progression curve, economy balance, build variety, combat depth/loot — the things that make an action-RPG *replayable*. Codebase confirms: leveling curve absent, skills defined-but-unwired, XP not automated, only CHA attribute used (gap-sweep §3). Insert a "Mechanics design" level between Content (4) and Art (5). |
| G6 | **Core gameplay loop not stated/validated** | **ADDED** | 🟠 | The playbook optimises hard for an *amazing world* but never states/validates the moment-to-moment loop (explore→fight→loot→progress→unlock→explore) as an artifact. You can build a gorgeous world that isn't fun to *play*. Tie to G5. Make "the core loop is fun" an explicit DoD before replicating regions. |
| G7 | **"Vast/explorable" vs "channelled-not-open" gate** | **ADDED (a contradiction)** | 🟠 | §8.2 wants "vast and explorable"; the `channelled-not-open` gate FORBIDS open walkable blocks >8×8. Is the world Zelda-corridors or open exploration? The prose and the gate disagree. Reconcile the design intent (recommend: explicit "exploration pockets" allowance with sightline/landmark rules) or it gets re-litigated per region. |
| G8 | **Fate of procedural `chunkContent` under nav-first** | **ADDED** | 🟠 | The playbook says "author the nav layer for the *whole* world." But a big part of the live world is *procedurally generated* filler (`chunkContent`), not authored. Is the filler authored away, constrained, or kept (and is it walkable open space that violates G7)? Unaddressed. |
| G9 | **Combat: engine works, but FEEL/BALANCE/encounter-design ungated** | Confirmed (re-scoped) | 🟠 | Correction to the brief AND the playbook: combat is **not "broken"** — `Combat.js`/`EnemyController`/`Monsters.js` are a real, tested system (`Combat.test.js`, gate #1). BUT the playbook §7 over-claims it "done/good": there is **no gate or DoD for combat FEEL, difficulty curve, or encounter placement**. "Engine works" ≠ "combat is fun." Add a combat-feel DoD (eye/hands gate) + an encounter-density/curve design pass. |
| G10 | **Scope / content-volume budget + risk register** | Confirmed | 🟠 | §8 is a forward *plan* with no **volume estimate** (regions × quests × assets × sessions) and **no risk register**. "Vast" is unquantified. The nav layer is fast; *painting + populating it to "amazing"* is the slow, eye-gated part — that's the schedule risk. Vertical-slice-first mitigates but doesn't budget. Add a 1-page scope estimate + a living risk register (this doc can seed it). |
| G11 | **Coordinate SSOT not an explicit named system** | Confirmed | 🟠 (was 🟡; Tiled raises it) | The recentre bug is fixed + migration-tested (`SaveManager` v2→v3), and `worldmap.js` is the de-facto SSOT — but it's implicit. With Tiled **offsets** entering, region `origin` ↔ Tiled offset alignment becomes load-bearing. Promote "coordinate SSOT" to a §3 system with the seam gate explicitly guarding it. |
| G12 | **Accessibility absent from the methodology** | Confirmed | 🟡 | Codebase has remap + audio sliders only (gap-sweep §7): no colorblind, text-size, difficulty, captions, UI-scale. Audio/binding persistence not even wired to storage. The playbook never mentions accessibility. Add it to the polish layer DoD (and note difficulty ties to G5/G9). |
| G13 | **Quest/Dialogue engine missing from the §3 systems table** | Confirmed | 🟡 | The engine EXISTS and works (`QuestEngine`, dialogue node-graphs, karma-reactive routers; orphan-id gate partly guards it). But the playbook's "every factor is a system" table (§3) omits it. The **journal** is a minimal tracker HUD, not a full log — fine for now, list as polish. |
| G14 | **Save-stability across the Tiled migration** | **ADDED** | 🟡 | Saves key off chunk+entity-id. Re-authoring regions in Tiled can move entity positions/ids → break deltas. No real saves to protect pre-ship, but state the rule: Tiled entity ids must be stable + map to the same `placeId`. |
| G15 | **Documentation SSOT index / read-order** | Confirmed | 🟡 | Many docs (PLAN/QUALITY-SPEC/BLUEPRINT/MASTER-MAP/EXCELLENCE/TILED-PLAN…); `CLAUDE.md` is the index but the playbook itself doesn't map "which doc owns what / read order." Minor; fold the playbook into the index as the top-level methodology doc. |
| G16 | **Playtest-efficiency protocol** | Confirmed | 🟡 | `PLAYTEST-LOG.md` exists; the playbook's "eyes-on" is a principle without a per-session checklist (what to drive, what to screenshot, how to capture the verdict). Add a 6-line playtest checklist. |

---

## 3. WHAT'S ACTUALLY *WRONG* (not just incomplete) in the playbook

1. **🔴 §0 overstates the principle as absolute, and §2.3/§3 quietly contradict it.** §0: *"art never
   defines where you can walk."* But §2.3 + §3 keep **pixel-truth collision derived from prop art** —
   so for props, *art DOES define walkability*. A solid prop dropped on a nav-walkable tile blocks you
   (precisely the B2 bug). The principle is *right for paths*, but stated as universal it's false and
   it papered over the exact bug that caused the last re-approach. **Fix the wording + add the gate
   (G2):** "The nav layer is the sole authority for *route* walkability. Props may add collision but a
   solid prop may never occupy a nav-walkable route tile — enforced by a gate." This is the single
   most important correction.

2. **🟠 §7 self-audit is too generous on combat.** It lists combat under "Done and good." The engine
   is good; combat as an *experience* (balance, encounter design, feel) is unbuilt/ungated. Calling it
   done risks shipping a world you fight badly in. Re-label: "combat ENGINE done; combat EXPERIENCE
   not yet designed/gated."

3. **🟠 §8 calls the plan "locked … does not change," yet it embeds two unmade decisions** — terrain
   render path (§1.4 🔴) and existing-region migration (§1.4 🟠). A plan can't be "locked" while its
   load-bearing technical choices are unmade. Lock it *after* the fit-check answers those two.

4. **🟡 §3's headline lesson is correct but mis-filed as a discipline.** "Test against independent
   ground truth" (the 11,886-false-pass story) is the most valuable lesson in the document — but it
   lives as prose, not as a *gate*, which is why B2 still slipped through (G1). Promote it to a gate.

Everything else in the playbook is correct and should stand — the layer separation, the
systems-as-rules-with-gates discipline, vertical-slice-first, asset/licence discipline, the §6
sequence, and the Tiled adoption itself are all aligned with established best practice (§4).

---

## 4. RESEARCH SOURCES (established best practice — corroborating + correcting)

**Phaser 3 + Tiled pipeline & collision** (validates §2 + §1.4):
- Modular Game Worlds in Phaser 3 (Hadley, the de-facto reference): https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6
- Collision via tile property — official example: https://phaser.io/examples/v3.85.0/tilemap/view/set-colliding-by-property
- Object-layer rects → static bodies: https://github.com/mikewesthad/phaser-3-tilemap-blog-posts/blob/master/posts/post-5/README.md
- TilemapLayer API (culling/`setCollisionByProperty`): https://docs.phaser.io/api-documentation/class/tilemaps-tilemaplayer

**Composing many finite maps / `.world` / streaming** (validates §1.1-1.4; the `.world` honesty caveat):
- Tiled Worlds manual (`.world` format + World Tool): https://doc.mapeditor.org/en/stable/manual/worlds/
- World Tool intro: https://thorbjorn.itch.io/tiled/devlog/131493/introducing-the-world-tool
- **Caveat (verified by absence in the API docs): Phaser has NO built-in `.world` loader** — mirror the offsets in loader code.
- Big-maps / chunk streaming in Phaser: https://www.dynetisgames.com/2018/02/24/manage-big-maps-phaser-3/ · ChunkMap: https://github.com/marcus-robinson/chunk-map · forum: https://phaser.discourse.group/t/performance-of-really-big-tile-maps/1192

**Collision-layer-separate-from-art principle** (validates §0, with the §3 caveat I raise):
- https://phaser.io/examples/v3.85.0/tilemap/view/set-colliding-by-property · GameMaker tile-vs-object: https://steamcommunity.com/app/585410/discussions/0/1694917906655615487/

**Metroidvania gating as a DAG / no-soft-locks** (validates `gating.js` + gate #7):
- Boris the Brave, Lock and Key Dungeons: https://www.boristhebrave.com/2021/02/27/lock-and-key-dungeons/
- Explorer's Design, locks with more keys: https://www.explorersdesign.com/designing-locks-with-keys/
- Procedural-Metroidvania ASP reachability thesis: https://scholarworks.calstate.edu/downloads/5712mc924

**Streaming / culling / pooling at scale** (validates G4):
- TilemapLayer self-cull: https://docs.phaser.io/api-documentation/class/tilemaps-tilemaplayer · StreamingTilemap concepts: https://github.com/zerppa/StreamingTilemap

**Data-driven content pipelines** (validates the write-once-systems / content-as-data architecture):
- ECS / database analogy: https://en.wikipedia.org/wiki/Entity_component_system · data-oriented vs data-driven (HN): https://news.ycombinator.com/item?id=26716958

*Honesty caveats from the research: the DAG-reachability math citations are general graph theory applied
by analogy; the Phaser-perf third-party blog is lower-authority than the official docs cited alongside it;
no single canonical "Phaser+Tiled streaming" GDC talk exists — the streaming guidance is ecosystem
consensus (Dynetis/ChunkMap/forums).*

---

## 5. BOTTOM LINE — is it robust enough to build on without re-approaching?

**Yes — with three gates and two decisions added first.** The methodology's spine (layer separation,
nav-first, systems-as-rules-with-gates, Tiled adoption, vertical-slice-first) matches established best
practice and the engine is *favourable* to it. It will not need re-architecting again **if** we close
the items that would otherwise force exactly that:

**MUST resolve before authoring any real region (🔴):**
1. **G3 — terrain render path** for Tiled (direct tile-layer vs convert-to-patches). Settle in the
   throwaway fit-check; it's the biggest integration unknown.
2. **G1 + G2 — gate the runtime, not just the model.** Add (a) a headless **body-walk** reachability
   check of the nav layer, and (b) a **"no solid prop on a nav-walkable tile"** gate. These two catch
   the exact bug class (B2) that caused the last circling. Until they exist, "the path bugs can't
   recur" (§6) is unproven.
3. **Fix the §0/§3 wording contradiction** (the nav-layer principle is not universal — props derive
   from art). One paragraph + the G2 gate.

**MUST decide before scaling past the slice (🟠):**
4. **Existing-region migration** — re-author in Tiled vs two pipelines (G-§1.4). State it.
5. **Add a "Mechanics design" hierarchy level + a stated, validated core loop** (G5/G6), and a
   **performance gate** (G4) and a **scope/risk register** (G10). Combat is an *engine*, not yet an
   *experience* (G9) — gate its feel.

**Nice-to-have before ship (🟡):** accessibility (G12), fuller journal (G13), coordinate-SSOT
formalisation (G11), save-stability rule (G14), doc index + playtest checklist (G15/G16).

If items 1-3 are folded into the fit-check and the gate set, **this is a stable foundation — build on
it.** The fit-check (playbook §8.1) is correctly identified as the go/no-go; this review's only
substantive change to it is: *the fit-check must prove the runtime (a real body walks the nav layer
with props placed) and the terrain render path — not merely that an imported map's data is consistent.*

*Change-no-code review. `npm test` + `npm run verify` GREEN at time of writing. — PLAYBOOK-REVIEW v1*
