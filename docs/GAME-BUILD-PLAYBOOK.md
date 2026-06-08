# GAME-BUILD-PLAYBOOK v2
### The complete methodology for building 2D top-down action-RPGs (Emberfall 2 + future games)

This is the authoritative approach — principles, layers, systems, disciplines, and the fixed order of
operations — corrected against best-practice research and the real codebase. It exists so we **build
the world once, correctly, and never re-architect.** v2 fixes the wrong principle in v1, adds the
runtime-validation rule, the mechanics design level, performance, scope/risk, and corrects the
combat over-claim.

> **CHANGES FROM v1:** §0 principle corrected (was overstated as universal); added the
> "validate the runtime, not just the model" rule (§3.1) and its gates; added the **Mechanics**
> design level (§1, level 3b); added a performance system + gate (§3); added the scope/risk
> discipline (§4) and combat honesty (§7).
>
> *(Repo copy of the methodology — the authoritative source. Mirrors Van's GAME-BUILD-PLAYBOOK-v2.
> The empirical proof of §8.1 lives in `docs/TILED-FIT-CHECK-REPORT.md`; the review that produced v2
> is `docs/PLAYBOOK-REVIEW.md`.)*

---

## 0. THE GOVERNING PRINCIPLE (corrected)

**Two collision sources, cleanly separated, never in conflict:**

1. **The navigation layer defines the walkable world** — every corridor, fork, blocked zone, and
   gated blocker is authored as data *first*, independent of art. An art gap can never open a hole
   in a blocked zone, and a corridor can never be accidentally too narrow, because walkability is
   the locked truth.
2. **Solid props add collision on top** — a boulder, a building, a fence legitimately blocks you via
   its pixel-truth collider. This is correct, not a bug.

**The rule that keeps them from conflicting (this is the fix for the path bugs):**
> A solid prop must **never** sit on a tile the navigation layer marks walkable. Walkable corridors
> stay clear of solid colliders; props decorate the blocked/edge zones or are explicitly non-solid
> scatter. Enforced by a gate (§3).

v1 said "art never defines where you can walk" as a universal law — that was wrong, because solid
props *do* and *should* block. The precise principle is: **the nav layer owns the corridors; props
own their own footprint; the two must not overlap on a walkable tile.**

---

## 1. THE DESIGN HIERARCHY (build top-down; lock each level before the next)

| # | Level | Answers | "Done" = | Artifact |
|---|-------|---------|----------|----------|
| 1 | **Vision / pillars** | What the game IS (genre, feel, length, themes, arc) | Written, agreed | PLAN |
| 2 | **World topology** | Regions as nodes, the lock-and-key gating DAG (abstract) | Valid DAG, no soft-locks | `gating.js` |
| 3a | **Spatial / navigation layout** | WHERE regions sit + every walkable route + where blocked/gated. **Art-free collision truth.** | Reachability proven by a **real-body walk** (§3.1) | nav-layer maps |
| 3b | **Mechanics** *(new in v2)* | The core loop + progression/economy/combat depth: what the player *does* moment-to-moment and how they grow (levels? skills? gear? the tool-gated moveset?) | A named core loop + a progression model (even if minimal) | MECHANICS-DESIGN |
| 4 | **Content overlay** | Quests, NPCs, encounters, secrets on the layout | Every beat placed + reachable when sent | STORY-MAP-OVERLAY |
| 5 | **Art direction** | Palette, mood, theme, readability, audio mood per region | Locked standard + per-region table | QUALITY-SPEC + EXCELLENCE-FRAMEWORK |
| 6 | **The art pass** | Paint the visual world onto the locked nav layer | Reads as intended; cohesive; composed (variety rule) | the Tiled maps |
| 7 | **Systems** | Collision, depth, interaction, combat, save, audio, perf — as rules | Each is a rule + a gate (§3) | code + gates |
| 8 | **Game-feel / polish** | Juice, feedback, audio beds, wow-moments, combat *feel* | Feels good to move/fight; every action has feedback | — |
| 9 | **Validation** | Cross-checks at every level + the human-eye verdict | DoD met; eye says "amazing not just correct" | DoD matrix |

The circling was caused by building level 6 (art) before locking 3a (navigation), and by missing 3b
(mechanics) entirely. Lock 3a and 3b before any art.

---

## 2. THE LAYERED MAP MODEL (every map, authored in separate layers)

1. **Navigation layer** — grid of `walkable / blocked / gated(tool)`. The collision **truth**.
   Authored first. (Tiled: a dedicated tile/object layer.)
2. **Terrain layer** — ground art, painted to match the nav layer.
3. **Prop / decoration layers** — trees/bushes/rocks/buildings on top. Solid props carry pixel-truth
   collision **but never sit on a walkable nav tile** (§0). Non-solid scatter may overlap walkable
   tiles freely (decoration only).
4. **Object / entity layer** — spawns, triggers, NPCs, chests, signs, gates, entrances.

**Tiled** operationalizes this (it paints collision separately from art). **Integration (verified
feasible):** one `.tmj` per region, offset into the 640×640 world-space by the region's existing
`origin`, imported via a `tiledToRegion()` adapter to the current finite-region shape; the streamer
loads regions by bounds unchanged. **Open sub-risk to settle in the fit-check:** the engine renders
ground via the autotiler, not Tiled tile layers — decide *render the Tiled layer directly* vs
*convert to terrain-patches* before authoring real maps. (.world files are Tiled-side only; mirror
offsets in code from `worldmap.js`.)

Depth: everything sorts by feet/opaque-base Y (same anchor as collision) so rendering and collision
always agree.

---

## 3. EVERY FACTOR IS A SYSTEM (a rule + a gate)

Solve once, as a rule, enforced by an automated gate. Per-instance decisions cause "off to different
degrees."

| System | Rule | Gate |
|--------|------|------|
| **Navigation/collision** | Nav layer owns corridors; solid art adds its footprint; no solid prop on a walkable tile | nav-walkable + prop-overlap gate |
| **Collision (solid art)** | From opaque pixels, perspective-aware base band | pixel-truth gate |
| **Depth-sort** | Sort by feet/opaque-base Y | gate + test |
| **Interaction-class** | Every asset declares solid/cut/throw/push/search; behavior by class, uniform | gate (no asset without a class) |
| **Entrance-contract** | Regions connect only via declared entrances (two-sided handshake + gate match) | gate |
| **Asset conformance** | One locked standard (32/64 LPC); conform or reject | cohesion gate |
| **Gating** | Lock-and-key DAG; no soft-locks | reachability gate |
| **Density / composition** | Density bands + variety rule (vary size/type/spacing, layer undergrowth, breathing room, no monotony) | gate + eye |
| **Combat** *(to design — §7)* | Hit detection, damage, enemy AI/aggro, telegraph, i-frames, knockback, safe-zones — as rules | test + eye (feel) |
| **Audio** | Per-region soundscape + mood-matched music bed + action SFX always present | DoD |
| **Save / permanence** | Per-chunk deltas + flags; nothing re-grants/respawns | gate + test |
| **Movement / fast-body** | Swept collision for dashes (no tunneling) | test |
| **Performance** *(new in v2)* | A budget: framerate floor (≥60fps target), max active objects/draw-calls per region; the streamed vast world must hold it | perf gate |

### 3.1 VALIDATE THE RUNTIME, NOT JUST THE MODEL *(new in v2 — the deepest lesson)*

> A gate that checks the **design data** is not enough. The B2 path bug passed all 13 gates yet a
> real 16px body could not walk it. **Gates must verify what a real body experiences at runtime,
> not just that the data is internally consistent.**

Required runtime gates:
- **Body-walk reachability:** drive a real player-sized body through the nav layer (real input,
  realistic timing) and assert every intended destination is reachable and every blocked zone holds
  — *with props placed*. This is what makes "path bugs can't recur" actually true.
- **No-solid-prop-on-walkable-tile:** fail if any solid collider overlaps a nav-walkable tile.
- **Test against independent ground truth, never the thing itself** (the circular-collision lesson):
  a green test that contradicts the human eye means the test is wrong.

---

## 4. PROCESS DISCIPLINES

- **One objective per session.**
- **Eyes-on for visual; headless for logic.** The human eye is a *required* validation gate for
  visual quality — structural, not a defect. (Chat-side cannot see the screen.)
- **Validate the runtime, not the model** (§3.1).
- **Build-to-the-plan; never improvise content** (content is data, placed from the design).
- **Version stamp on screen** (confirm you're testing current code).
- **Vertical-slice-first** — one region to full quality before replicating.
- **Capture every fix as a rule + gate** (replicability).
- **Scope / risk discipline** *(new in v2):* maintain a risk register + content-volume tracking. The
  most likely failure for a solo+AI long RPG is **not finishing**, not a bug — track scope honestly,
  cut or stage ruthlessly, prefer a smaller finished world to a vast unfinished one.
- **Stop-and-ask for:** real money, third-party accounts, source deletion, licence-uncertain commits,
  force-push, branch deletion.

---

## 5. ASSET DISCIPLINE

- One locked standard; conform or reject (no patchwork).
- Source only to fill **confidence-ranked gaps**; a region doesn't build until its LOW-confidence
  assets are in hand.
- Read the **actual licence text**, never a store tag. Public repo ⇒ no-redistribute is unusable;
  need redistributable + commercial-OK + no anti-AI.
- **Stage uncertain assets** (catalogued, uncommitted, unshipped); full licence sweep before ship;
  build only on confirmed-clean assets meanwhile.
- Record artist + source + licence + support/koha link for every used asset.

---

## 6. THE REPLICABLE SEQUENCE (for any new region or game)

1. **Topology** — place in the gating DAG.
2. **Mechanics check** — confirm the region's encounters/progression fit the core loop (§1.3b).
3. **Navigation layout** — author the walkable/blocked/gated nav layer FIRST; **prove reachability
   with a real-body walk** (§3.1) before any art.
4. **Asset check** — every needed element HAVE or in-hand (source LOW gaps now).
5. **Terrain pass** — paint ground onto the nav layer.
6. **Prop / composition pass** — variety rule; solid props get pixel-truth collision; **no solid
   prop on a walkable tile**.
7. **Entity pass** — NPCs, quests, encounters, secrets, signs, entrances; safe-zones defined.
8. **Systems carry over automatically** (they're rules).
9. **Validate** — gates (incl. the runtime body-walk) + cross-verification + perf budget + the
   human-eye DoD ("amazing not just correct"). Iterate composition to the bar.

Follow this order and the path/collision/stuck/tunnel bug-class cannot occur.

---

## 7. WHERE EMBERFALL 2 IS NOW (honest audit)

**Done and good (keeps):** vision, topology + gating DAG, content overlay, art direction +
excellence framework, and most systems — pixel-truth collision, depth-sort, interaction-classes,
entrance-contracts, save/permanence, swept-dash, the cohesion/gating gates, version stamp, music +
SFX. Streaming↔Tiled integration confirmed **feasible** (regions are already finite rects).

**Must resolve before scaling (folded into the fit-check + gate set):**
- 🔴 **Runtime gates** (body-walk reachability + no-prop-on-walkable-tile) — without these, "bugs
  can't recur" is unproven.
- 🔴 **The §0 principle** — corrected above (nav owns corridors; props own footprints; no overlap).
- 🔴 **Tiled terrain-render path** — settle in the fit-check (render Tiled layer vs convert to
  autotiler patches).
- 🟠 **Mechanics level** — leveling/skills/XP are stubs; decide the core loop + progression model
  before building combat content.
- 🟠 **Performance gate** — none today; needed for a vast streamed world.
- 🟠 **Combat is an engine, not a designed experience** — it runs, but the *feel* (the unsatisfying
  slime fight) isn't designed. v1 over-claimed it "done."
- 🟠 **Existing-region migration** — decide: re-author GH/Marsh/Peaks in Tiled, or run two pipelines.
- 🟠 **Scope / risk register** — start tracking content-volume vs the 30hr goal.

**Nice-to-have before ship:** accessibility (beyond remap+audio), fuller journal, coordinate-system
SSOT formalisation, save-stability rule, a doc-hierarchy/SSOT index, a per-region playtest checklist.

---

## 8. THE COMMITTED FORWARD PLAN (locked)

1. **Tiled fit-check** (throwaway map) — the go/no-go. Must prove the **runtime** (a real body walks
   the nav layer *with props placed*; blocked zones hold even with art gaps; the prop-on-walkable
   gate works) **and the terrain-render path**, not just data consistency. Build the runtime gates
   here.
2. **Mechanics design** (doc) — name the core loop + the progression/economy/combat-depth model.
3. **Author the world navigation layer** — the walkable/blocked/gated truth for the whole vast
   world, all forks + gated blockers; reachability proven by real-body walk; no soft-locks. (No art —
   fast.)
4. **Vertical slice in Tiled** — paint Greenhollow→Peaks to full art direction + composition + audio
   + combat *feel* + the region DoD. Your eye is the gate.
5. **Replicate** — Marsh, the vast connectors, Coast/Emberwood/Spire — each via §6, LOW assets first.
6. **Polish** — interaction-feel, HUD customization + inventory + stat icons, wow-moments, cutscenes,
   accessibility.
7. **Pre-ship** — licence sweep, credits/koha screen, full playtest, scope reconciliation.

We do not re-architect. Composition iterates on your eye (normal art iteration). The architecture is
the stable foundation.

---

## APPENDIX — THE SYSTEMS/GATES CHECKLIST (quick reference)

A region is **done** only when all hold:
- [ ] Topology placed in the DAG · mechanics fit the core loop
- [ ] Nav layer authored; **real-body walk** proves reachability + blocked zones hold
- [ ] No solid prop on any walkable tile (gate)
- [ ] All assets HAVE/in-hand; conform to the lock
- [ ] Terrain painted to nav layer · props placed with the variety rule
- [ ] Pixel-truth collision + depth-sort + interaction-classes + entrances all pass
- [ ] Encounters/safe-zones placed; combat *feel* designed (not just functional)
- [ ] Audio: soundscape + music bed + action SFX
- [ ] Performance budget held (≥60fps, object/draw-call cap)
- [ ] Save/permanence verified
- [ ] Cross-verification matrix passes
- [ ] **Human eye: "amazing, not just correct"**
