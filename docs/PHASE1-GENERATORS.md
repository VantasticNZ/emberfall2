# PHASE 1 — the room-template library + procedural generators + generate→validate loop (REPORT)

> **5-hour game Phase 1** (`BUILD-TOOLING.md` §2/§3) — **the multiplier.** The automation that fills
> rooms/dungeons: a **room-template library** + **procedural generators** (dungeon / cave / scatter /
> loot), where **every output is run through `navGates` and regenerated on failure** — so auto-content
> can never ship unwalkable or with a blocked objective. Built once, reused for 5h + 30h. Output = the
> Phase-0 `interiorRegion()`/region shape, so collision · depth · interaction-classes · save ·
> streaming all apply unchanged. 13 gates + 15 suites GREEN; 0 console errors. Stamp: `cb3fca4b`.

## ★ STATUS: generators build crafted, connected, navGate-VALIDATED dungeons + caves — live-walked.

## 1. What was built (`src/data/gen/`)
- **Room-template library** (`templates.js`) — 8 hand-designed 9×7 room templates the generator stamps
  + connects (the Spelunky/Isaac "crafted pieces" model): **entrance** (spawn) · 4 **normal** (pillars
  / debris / corner-blocks / plain junction) · 2 **treasure** · 1 **boss arena**. Chars: `#` wall ·
  `.` floor · `S` spawn · `C` chest · `o` decoration · `X` pillar. The **connection cross** (row 3 +
  col 4) is kept clear so any two doors are always linked.
- **Generators** (`index.js`):
  - **DUNGEON** — a connected grid of template rooms: rooms grown from the entrance (Isaac-style BFS
    with the <2-filled-neighbour rule), special roles assigned (**boss** = the graph-farthest cell,
    **treasure** = a dead-end), templates stamped, **2-tile doors carved** between adjacent rooms.
    Connected-by-construction (every room is grown adjacent to an existing one).
  - **CAVE** — **cellular automata** (~45 % seed, the 4-5 rule, 4 passes) + **flood-fill**: keep the
    largest floor region, fill the rest → **all floor reachable**; spawn at the near corner, the
    objective chest at the BFS-farthest floor tile.
  - **PROP-SCATTER** — Poisson-ish (min-spacing + a density roll) decoration on the floor, **clear of
    spawn/chest tiles**; only non-solid props on walkable tiles (the `X` pillars carve their tile out
    of the nav). Varied size/placement (the variety rule).
  - **LOOT** — chests placed from the room roles (treasure/boss), data-driven gold.
- **THE GENERATE→VALIDATE LOOP** (`generate()`) — the safety key: generate → scatter → `emit()` to the
  region shape → run **`bodyWalkReachability` + `noSolidPropOnWalkable`** → **return only if it passes**;
  else **reject + regenerate** (new seed) up to the retry cap; on exhaustion, a **guaranteed-valid
  fallback room**. *A generated dungeon/cave can NEVER ship unwalkable or with a blocked objective.*

## 2. Headless proof (`scripts/fitcheck/gen.test.mjs`, in `npm test`)
- **10 generated DUNGEONS — ALL pass navGates** (reachable entrance→objective, walls hold, no prop on a
  walkable tile). **0 fallbacks** (the generator is reliable — first-try valid).
- **10 generated CAVES — ALL pass navGates** (flood-fill connectivity holds). **0 fallbacks.**
- **Reject-on-fail PROVEN:** a deliberately broken layout (the objective walled off from the spawn) is
  **rejected** by `bodyWalkReachability` (`NOT reachable`) — exactly what the loop rejects + regenerates.
  *A validator that can't fail is worthless; this one fails on bad input.*
- **Fallback PROVEN:** `maxTries:0` forces the fallback, and the **fallback region is itself
  navGate-valid** — nothing broken ever ships.

## 3. Live proof (eyes-on, real input, stamp `cb3fca4b`, 0 console errors)
| | Verified | Screenshot |
|---|---|---|
| **Generated DUNGEON** | GH "Enter a GENERATED dungeon" door → a **36×21, 3-room** dungeon: crafted rooms connected by 2-tile doors, 2 chests (treasure + boss), corner pillars, spaced floor decoration — **walkable, reads as intentional** (validated try 1) | `p1-1-generated-dungeon.png` |
| **Generated CAVE** | GH "Enter a GENERATED cave" door → a **26×18 organic cavern** (cellular-automata, one connected blob), spawn → the objective chest at the far end, moss scattered — **walkable, distinct from the dungeon** (validated try 1) | `p1-2-generated-cave.png` |
- Each door **re-rolls a fresh seed** on every entry (Van can re-enter to see variety). The interior
  view is clean (the overworld ground/props/decals hidden — the enclosed look from Phase 0, extended to
  chunk props/decals).

## 4. Reconciliation with the proven systems
- **Output = the `interiorRegion()`/region shape** → `_buildRegion` builds it; **pixel-truth collision,
  depth-sort, interaction-classes (the chests' "Open the chest"), save deltas, streaming, the door
  system** all apply **unchanged**. A generated region is injected into `REGIONS` at runtime (a reserved
  gen slot) — not in the static source, so **no verify-gate impact**.
- **`navGates` is the validator** — the same runtime gate that guards hand-authored regions now guards
  generated ones. The B2 path-bug class is impossible even in auto-content.
- **The autotiler** feathers the generated floor patches; **the variety/density rules** are honoured by
  the scatter; **`gating.js`** is untouched (gen dungeons are optional content within the door system).

## 5. NOTES / follow-ups (honest)
- **Greybox art:** walls are the rock-greybox; doors/exits are `prop_sign` markers; decoration uses
  `prop_bush`/`prop_rock_small`. Phase 2/3 swap in real dungeon tilesets + furniture (the generators
  don't change — only the art keys do).
- **Templates are a starter set** (8). Phase 2/3 grow the library (shop/tavern/home interiors, biome-
  specific dungeon rooms) — the assembly + validate loop already handles any template.
- **Enemy/encounter tables** are stubbed (chests = the loot path); the enemy-ecology placement rides
  Phase 4 (combat), reusing the same table-driven, navGate-validated placement.
- **Cyclic/grammar layouts** (Dormans) are a future upgrade to the dungeon layout for lock-and-key
  loops; the current grid-of-rooms is connected + correct for the 5h dungeons.

## ✅ SUMMARY
- **Template library:** 8 crafted room templates (entrance/normal×4/treasure×2/boss).
- **Generators built:** dungeon (template-room grid + carved doors), cave (cellular-automata + flood-
  fill), constrained Poisson scatter, data-driven loot — all emitting the region shape.
- **Generate→validate loop:** every output `navGates`-checked; **reject + regenerate on fail** (proven
  it rejects a walled-off objective); guaranteed-valid fallback. **20/20 generated spaces valid, 0
  fallbacks.**
- **Live:** a generated dungeon + a generated cave walked, both clean + intentional (2 screenshots).
- 13 gates + 15 suites GREEN; 0 errors. **The multiplier that makes content fast AND safe is in.**
  Next (Phase 2): the full Greenhollow town + its template interiors.
