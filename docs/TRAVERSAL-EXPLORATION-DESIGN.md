# TRAVERSAL & EXPLORATION — the world-movement pillar (design capture, build LATER)

Make the WHOLE map fun to move through and explore — for a quest or for its own sake — with
**OoT-grade depth** (follow-the-river-upstream, jump puzzles, hidden pockets, terrain-as-puzzle).
**CAPTURE ONLY — no engine/scene/SSOT code this session.** This is the pillar that decides whether
the ~30h world is a joy to *be in* or just a quest-delivery grid.

Each rule: **rule · why · check** ([OBJECTIVE] threshold + a proposed **→ verify.mjs** lint where
wireable, or [EYE] w/ what Van judges) · build-cost tag **[FREE NOW]** (data/arrangement on the
current engine) vs **[ENGINE FEATURE]** (a new engine/render capability — one-line note). Same
honesty as QUALITY-BIBLE Part 2.6 F/G/H. Cross-ref **QUALITY-BIBLE Part 2.6** for settlement
structure + city verticality; this doc owns moving *between* and *through* places.

---

## ⚠ ENGINE-PREREQUISITES SUMMARY (read FIRST — the real cost of the OoT ambition)
Much of this pillar is **NOT free**. These heavy items each want their **own scoped engine
session / prototype** BEFORE any region commits to using them — do not assume them in a region build:

| Engine prerequisite | Powers | Rough weight | One-line note on what's needed |
|---|---|---|---|
| **Jump / ledge / climb + HEIGHT** | jumps, gaps, stepping-stones, drop-down ledges, terrain-as-puzzle | **LARGE** (the heaviest) | a z/height concept + jump arc + per-height collision + occlusion/depth-sort across levels; RegionScene is a single flat plane today |
| **Water traversal** | swim/wade, tides, boardwalk-only-safe-tiles, hookshot-over-water | **medium–large** | a water-movement state + per-tile "deep/shallow/safe" mask + (coast) a tide state |
| **Swappable scene exits / one-way gates** | shortcuts that unlock, kickable ladders, doors from the far side, the trickster-wizard's moving geography | **medium** | flag-keyed exit/prop placement + a transition system (also a PETS/INTERACTABLES dependency) |
| **Distant-vista layer** | showing a peak/spire/valley you can't yet reach (the "pull") | **medium** | a parallax/background layer rendered beyond the play bound + a non-walkable far silhouette |
| **NPC pathing** | (shared w/ Part 2.6 Pillar 2 life) routines, crowds | **medium** | waypoint/grid pathing + schedules |
| **Traversal MOVES for the tools** | dash-gap cross, grapple-pull, hookshot-zip, firefrost-melt | **medium** | per-tool scripted player move + the physical target objects (INTERACTABLES-DESIGN §tool-gated) |

> Recommendation: **scope/prototype these as their own engine sessions**, gated and proven in
> isolation, before a region's set-piece depends on them. The FREE-NOW items below deliver a lot of
> exploration joy with zero new physics — build those first.

---

## THE RULES

### 1. REWARD-FOR-LOOKING  *(the cardinal rule)*
- **Rule:** every interesting nook **pays out** — a chest, lore, a vista, a shortcut, a secret.
  Curiosity is **ALWAYS rewarded, NEVER dead-ended with nothing.**
- **Why:** one empty "why did I climb up here" teaches the player to stop exploring — fatal for a
  30h world. The reward needn't be loot (a view or a story counts), but it must *exist*.
- **Check:** [EYE] — does every out-of-the-way spot give *something*? [OBJECTIVE] (→verify.mjs):
  every flagged "nook" tile/marker in region data has an associated payoff (loot/lore/vista/shortcut).
  **[FREE NOW]** (design + content).

### 2. VISTAS & FRAMING
- **Rule:** the game deliberately **SHOWS a place before you can reach it** (a peak, the Spire, a far
  valley) to create *pull*. Sightlines are composed, not accidental.
- **Why:** a glimpsed goal is the cheapest, strongest motivator in open exploration.
- **Check:** [EYE] — is there a composed "there's where I'm headed" moment per region? **[FREE NOW]**
  composition + **[ENGINE FEATURE]** if the distant thing needs a far-layer render (see prereqs).

### 3. TERRAIN-AS-PUZZLE  *(the OoT river-upstream beat)*
- **Rule:** navigation itself is the puzzle — follow a river to its source, pick the route over
  rocks/gaps, read the landscape to find the way.
- **Why:** the landscape *being* the puzzle is OoT's signature; it makes plain movement engaging.
- **Check:** [EYE] — ≥1 "read the terrain to progress" sequence per region. **[MIX]** — gentle
  versions are [FREE NOW] (a winding safe-route through a marsh); the rich ones need jump/height.

### 4. JUMPS / LEDGES / CLIMBING
- **Rule:** gaps you jump, ledges you drop or climb, stepping-stones across water.
- **Why:** verticality + commitment turns a floor into a playground.
- **Check:** [EYE] — does moving feel athletic, not just walking? **[ENGINE FEATURE — the heaviest]**
  (jump arc + height + per-level collision/occlusion; see prereqs). Do NOT promise free.

### 5. TOOL-GATED NOOKS + METROIDVANIA BACKTRACKING
- **Rule:** areas **seen early but enterable only later** with dash / hookshot / grapple / firefrost;
  the world **re-opens** as you gain tools. The tools already exist as flags — this makes them
  **SPATIAL** (a physical gap/anchor/wall, not just a quest `requires`).
- **Why:** "I'll be back for that" is the engine of long-game exploration; it reuses tools you earn.
- **Check:** [EYE] — do earlier regions visibly hold locked nooks that later tools open? [OBJECTIVE]:
  ≥1 tool-gated nook per tool, placed before the tool is earned. **[FREE NOW]** for the *gating
  logic* (flag check + reveal); **[ENGINE FEATURE]** for the traversal *moves* (prereqs).

### 6. SHORTCUTS THAT UNLOCK
- **Rule:** one-way gates, kickable ladders, doors opened from the far side — **explored areas fold
  back into fast routes.**
- **Why:** the satisfaction of "oh, this connects back!" + it respects the player's time on return.
- **Check:** [EYE] — does the map knit itself into shortcuts as you explore? **[MIX]** — a simple
  one-way gate (flag + a removed barrier) is [FREE NOW]; far-side door transitions = [ENGINE FEATURE]
  (swappable exits, prereqs).

### 7. LAYERED SECRETS
- **Rule:** three depths — **visible-but-hard** (a chest across a gap), **hidden** (a cracked /
  bombable wall), **deep** (a multi-clue questline). Ties to **INTERACTABLES-DESIGN** (bombable
  walls) + the **trickster-wizard** (PERSONALISATION/GAPS).
- **Why:** layered difficulty rewards both the casual looker and the obsessive.
- **Check:** [EYE] — all three depths present across a region. [OBJECTIVE]: ≥1 of each depth per
  region. **[MIX]** — hidden/bombable = [FREE NOW] (interactables); across-a-gap = [ENGINE FEATURE].

### 8. LANDMARK NAVIGATION
- **Rule:** the world is **legible by sight** — you find your way by landmarks, not just the map.
- **Why:** a world you can hold in your head is a place; map-dependence is a maze.
- **Check:** [EYE] — can Van navigate region-to-region by landmarks alone (= Part 2.6 gate I)?
  **[FREE NOW]** (composition).

### 9. BIOME-AS-MECHANIC
- **Rule:** each region **TRAVERSES differently** so it stays fresh across ~30h — **marsh** slows /
  sinks (boardwalks + safe tiles), **peaks** are vertical + grapple, **coast** is water + tides +
  hookshot, **emberwood** is fire/frost gating.
- **Why:** if every region walks the same, 30h is a slog; movement variety = freshness.
- **Check:** [EYE] — does each region *feel* different to move through? **[ENGINE FEATURE per biome]**
  (each biome-movement = its own mechanic; marsh safe-tiles is the lightest, peaks/coast heaviest —
  prereqs). Scope per region.

### 10. ENVIRONMENTAL STORYTELLING
- **Rule:** ruins, graves, a still-warm campfire, claw-marks, an abandoned cart — the world tells
  stories **without text.**
- **Why:** the cheapest, most respected worldbuilding; rewards looking (rule 1) with meaning.
- **Check:** [EYE] — ≥1 wordless story-vignette per region. **[FREE NOW]** (prop arrangement + a
  little optional lore).

### 11. PACING / DENSITY RHYTHM
- **Rule:** alternate **tight, puzzle-y stretches** with **open breathing room**; exploration has
  rhythm, not uniform busyness.
- **Why:** unbroken density exhausts; unbroken openness bores; the rhythm is the craft.
- **Check:** [EYE] — does the region breathe (intense ↔ calm)? **[FREE NOW]** (layout/design).

### 12. "FUN WITHOUT A QUEST" BAR  *(the headline gate)*
- **Rule:** could a player **wander this region with no objective and still enjoy it?** If no, the
  region FAILS.
- **Why:** this is the single honest test of whether exploration is real or decorative.
- **Check:** **[EYE]** — Van turns off the quest tracker, wanders, and reports: *was that fun on its
  own?* The ultimate sign-off for a region's traversal/exploration. **[FREE NOW]** as a judgment
  (it's the sum of rules 1–11).

---

## PROPOSED SSOT IDS (LIST ONLY — do NOT add to `src/constants/` this session)
- traversal tools (some new): `tool_dash` (today's dash is the dodge-roll, not a tool), plus the
  existing `tool_grapple/hookshot/firefrost/lantern` made SPATIAL.
- nook/secret/vista markers: `nook_*`, `vista_*`, `shortcut_*`, `gate_oneway_*` (region data tags).
- environmental-story flags: `story_*` (e.g. `story_warm_campfire`, `story_old_grave`).
- biome-movement states: `wade`, `swim`, `climb`, `jump` (player states, not ids).

---

## BUILD-ORDER NOTE (shared with QUALITY-BIBLE Part 2.6)
Captures don't block region work. Agreed order:
1. **This capture** (Part 2.6 settlement expansion + this traversal doc).
2. **A SMALL Greenhollow nudge** [FREE NOW]: big-head modifier **defaults OFF** (bug), the
   **depth-sort fix** for the prop-occlusion clip (bug), **barrier/divider hedges + fences** between
   districts, and **a little hand-placed life** as a taste.
3. **NPC-LIFE as a REUSABLE system** — schedules + chore loops + ambient animals — **built once,
   inherited by every region** (Part 2.6 Pillar 2; the biggest "lived-in" win).
4. **Cut / lift interactable bushes** (INTERACTABLES-DESIGN free-now set).
5. **Traversal mechanics** per the engine-prereqs (jump/height, water, swappable exits) — each its
   own scoped session.
6. **Take Ashen Marsh to the full bar** — the first proof the whole rule-set TRAVELS beyond
   Greenhollow.

> Heavy engine items (jump/height/water/distant-vista) are scoped as their OWN sessions, never
> smuggled into a region build. The FREE-NOW exploration content (reward-for-looking, environmental
> storytelling, layered free-now secrets, vistas-by-composition, landmark legibility, pacing) is
> built first and already clears most of the "Fun Without a Quest" bar.
