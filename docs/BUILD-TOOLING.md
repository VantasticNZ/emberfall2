# BUILD-TOOLING — the hybrid procedural / template / hand-craft pipeline (fill rooms & dungeons efficiently)

> **Design/plan.** How to BUILD the 5h game (and then the 30h world) **efficiently** without sacrificing
> quality: a **hybrid pipeline** — hand-craft the story-critical spaces, assemble the rest from a library
> of **crafted room templates**, and **procedurally generate** the bulk layouts/caves/scatter — with
> **every generated space validated by the proven runtime gates** so nothing broken ships. Reconciled
> with the proven systems (nav-first · `tiledToRegion` · `navGates` · interaction-classes · autotiler ·
> entrance-contracts). Pairs with `GAME-5HR-SCOPE.md`. *Plan only — no build yet.*

## 0. THE GOVERNING IDEA: GENERATED, BUT MADE OF CRAFTED PIECES, ALWAYS VALIDATED
The fear with "procedural" is *soulless, broken levels*. We avoid both:
1. **Crafted pieces, not noise** — generators assemble **hand-designed room templates**, so a generated
   dungeon is built of authored rooms (the Spelunky / Binding-of-Isaac / Unexplored model), not random
   tiles. Soul comes from the templates; variety from the assembly.
2. **Nav-FIRST, always** — every generator outputs the **navigation layer first** (walkable/blocked/
   gated), exactly the v2 model; terrain + props paint onto it. The proc layout *is* the nav layer.
3. **Generate-then-VALIDATE** — the roguelike discipline: after generating, run the **runtime gates**
   (`navGates`: body-walk reachability + no-solid-prop-on-walkable) + the design gates; **reject +
   regenerate on failure**. A dungeon that a real body can't clear *can never ship*. This is what makes
   procedural *safe* here — the B2 path-bug class is impossible by construction.

## 1. THE THREE TOOLS — WHAT BUILDS WHAT
| Tool | Builds | Why |
|---|---|---|
| **HAND-CRAFT** (Tiled, nav-first) | the **TOWN** (Greenhollow) · **story-critical rooms** (boss rooms, shard chambers, M-beat set-pieces, Hagga's hut, the weeping-flame carving) · the overworld region nav layers | the spaces the player remembers must be authored to the EXCELLENCE DoD |
| **TEMPLATE / PREFAB** (a library of crafted room chunks the generator places + connects) | **interiors** (shop · tavern · home · crypt-room · treasure-room · boss-room · corridor/junction pieces) · the **non-key rooms of main dungeons** · repeatable civic buildings | crafted feel at scale; one template → many placements, lightly varied |
| **PROCEDURAL** (generators) | **dungeon LAYOUTS** (which template-rooms, where, connected how) · **CAVES** (organic) · **PROP-SCATTER** (decoration within constraints) · **LOOT/ENCOUNTER** placement | the bulk that makes 30h feasible — layout + fill, never the soul |

**Split per space type (the 5h game):**
- **Greenhollow town** → hand-craft (the showcase).
- **Town interiors** → templates (shop/tavern/home), furnished by the scatter generator; hand-craft the
  forge + Hagga's hut (story).
- **The Sunken Shrine** (main dungeon) → **hybrid**: hand-craft the boss + shard rooms; procedural
  layout places template crypt-rooms between them; scatter + loot/encounter tables fill; navGate-validate.
- **Boarded Cave · Drowned Crypts** → procedural caves (cellular automata) + scatter + navGate-validate.
- **Overworld connectors** → nav-first hand-authored skeleton (already built) + scatter for decorative density.

## 2. THE GENERATORS (techniques + how each reconciles with our systems)

### 2.1 Dungeon LAYOUT — BSP and/or graph/grammar placement of template rooms
- **Technique:** **Binary Space Partitioning (BSP)** recursively splits the area into cells, drops a
  room in each, connects siblings with corridors — the classic room-and-corridor dungeon. For
  *designed* progression, prefer **graph/grammar-based** placement: build a **mission graph** (entry →
  key → lock → boss, with the lantern/tool gate as a lock edge), then **space the graph** into rooms +
  corridors — "**cyclic dungeon generation**" (Joris Dormans / *Unexplored*) gives loops + lock-and-key
  structure instead of dead-end trees.
- **Output:** a **nav layer** (room rects walkable, walls blocked, the tool-gate as a `gated` edge) +
  a room-list (which template per slot). → fed to `tiledToRegion`-shaped output → `_buildRegion`.
- **Reconcile:** the **gate edges = our tool-gates** (`gating.js` keys); the **entry/exit = declared
  entrances** (entrance-contract); the mission graph guarantees the lantern is reachable before its lock
  (no soft-lock — same rule as `gating.js`).
- Sources: RogueBasin (BSP & dungeon-gen), Red Blob Games, Boris the Brave / Joris Dormans (cyclic).

### 2.2 CAVES — cellular automata + guaranteed connectivity
- **Technique:** seed the grid ~45% wall, run the **4–5 cellular-automata smoothing rule** a few passes
  → organic caverns; then **flood-fill** to find regions and **connect (or discard) disconnected
  pockets** so *all floor is reachable*.
- **Output:** nav layer (floor walkable, rock blocked) → terrain (the biome's cave tiles via the
  autotiler) → scatter.
- **Reconcile:** the flood-fill connectivity guarantee is exactly what `navGates` *re-checks* with a
  real body — belt-and-braces; the cave floor becomes terrain patches the **autotiler** feathers.
- Sources: RogueBasin "Cellular Automata Method for Generating Caves", Red Blob Games.

### 2.3 PROP-SCATTER — constrained, variety-rule, never on the path
- **Technique:** scatter decoration with **Poisson-disk sampling** (natural minimum spacing, no clumps)
  + **weighted type tables** per biome, under **hard constraints**: only on non-walkable/edge tiles for
  SOLID props (the **§0 rule**), free on decorative tiles for non-solid scatter; obey the **variety
  rule** (vary size/species, layer undergrowth, leave breathing room) + the **density bands**.
- **Reconcile:** props get their **interaction-classes automatically** (the SSOT table); the **no-solid-
  prop-on-walkable gate** is enforced *at generation* (a solid prop is only ever placed on a blocked
  tile) **and** re-validated by `navGates`; the variety rule + density band map to the existing gates.
- Sources: Red Blob Games (Poisson-disk), the variety/composition rule (EXCELLENCE-FRAMEWORK).

### 2.4 LOOT / ENCOUNTER placement — from weighted tables, at valid nav positions
- **Technique:** place chests/searchables/enemies from **weighted tables** (the existing `loot.js` +
  the per-biome enemy ecology) at valid positions: chests off the critical-path choke, enemies in the
  designed pockets (placed-difficulty, teach-then-combine), safe-zones respected.
- **Reconcile:** chests/searchables use the **interaction-classes + loot tables**; enemies use the
  **archetype FSM + the per-region ecology** (MECHANICS); save-permanence keys off the stable ids.

## 3. THE PIPELINE (generate → validate → accept) — the safety loop
```
  spec (graph/biome/size, the tool-gate, the templates) 
    → GENERATE nav layer (BSP/cellular/graph) + place template rooms
    → paint terrain (autotiler patches) + scatter props (constrained) + loot/encounters (tables)
    → import via tiledToRegion-shape → the SAME region shape _buildRegion consumes
    → VALIDATE: navGates (body-walk reachability + no-solid-prop-on-walkable) + design gates
        ├─ PASS → accept (deterministic seed recorded, so it's reproducible/hand-tunable)
        └─ FAIL → reject + regenerate (or nudge the seed)  ← nothing broken ever ships
```
Everything flows through the **proven `tiledToRegion` + `navGates`** path the fit-check already proved —
generated and hand-authored spaces are **the same shape**, so the engine, gates, save, and entrances
treat them identically. Generation is **seeded + reproducible** (a good seed can be frozen + hand-edited
in Tiled — proc as a *starting point*, not a black box).

## 4. NEW SYSTEMS THIS NEEDS (flagged)
1. **🔴 Interior / area-transition + multi-floor system** (`WORLD-SCALE-DOD` DW1) — the foundation:
   doors → interior scenes, stairs → floors. Generated dungeons/interiors are *separate scenes* loaded
   on enter. **Build FIRST.**
2. **The ROOM-TEMPLATE format + library** — small Tiled chunks with **declared door/connection points**
   + a `nav`/`terrain`/`props`/`entities` layer set (the same layer contract as `tiledToRegion`), so a
   template is just a mini-region the generator stamps + stitches at the door points. **[new — the key
   authoring asset.]**
2. **The GENERATOR module** — `src/data/gen/` (pure, Node+browser): `bspLayout`, `caveCA`,
   `placeTemplates`, `scatterProps`, `placeLoot` → emits the region shape; reuses `navGates` to validate.
   **[new code; reuses the proven shape + gates.]**
3. (lighter) a **seed/console dev-reroll** to preview generated dungeons (rides the `?debug` mode).

## 5. RECOMMENDED BUILD ORDER (for the 5h game, with this tooling — playable + growing each phase)
- **Phase 0 — INTERIOR/TRANSITION SYSTEM (foundational).** Doors → interior scenes + one multi-floor.
  Prove on the Copper Tankard (+upstairs) + one dungeon floor. *Nothing scales until this exists.*
- **Phase 1 — THE TOOLING.** Author the **room-template library** (shop/tavern/home/crypt/treasure/boss
  + corridors) + build the **generators** (BSP/graph layout, cellular caves, constrained scatter, loot/
  encounter) + the **generate→navGate-validate loop**. Prove on **one fully-generated cave + one hybrid
  dungeon**. *(This is the multiplier — build it once, reuse for every dungeon/interior, 5h and 30h.)*
- **Phase 2 — GREENHOLLOW, the full town** (hand-craft, nav-first) + its **template interiors** — the
  finished-quality showcase (the EXCELLENCE region DoD; Van's eye gate).
- **Phase 3 — THE ASHEN MARSH + THE SUNKEN SHRINE** — region nav-first; the shrine **hybrid** (hand-craft
  boss/shard rooms + procedural template-room fill + scatter + the lantern puzzle), the 2 small caves
  procedural; all **navGate-validated**.
- **Phase 4 — QUESTS + NPCs + COMBAT + ALIGNMENT** — wire M1–M10 + the curated sides/cameos onto the
  spaces; the Marsh enemy ecology + the Drowned Guardian boss (combat *feel*); the morality HUD + the
  aura-transformation taste + safe-mode + the good-monster (Frog) beat.
- **Phase 5 — POLISH + SHIP** — audio beds/SFX, composition iteration on the eye, game-feel, the 5h
  playtest to the DoD; licence sweep; 0 errors; all gates GREEN.

The full **30h game then reuses every tool** — adding Peaks/Coast/Emberwood/Spire is *more template
rooms + more generator runs + more hand-crafted set-pieces* on the same validated pipeline, onto the
already-walkable greybox world skeleton.

## 6. RECONCILIATION (with all systems) + flags
- **nav-first / `navGates`:** generators output the nav layer first + are validated by the runtime body-
  walk gate — the methodology is *strengthened* (proc can't violate it). ✅
- **`tiledToRegion` / autotiler / interaction-classes / entrances / save:** generated spaces emit the
  **same region shape** → all four systems apply unchanged. ✅
- **gating.js / endings / difficulty:** the mission-graph gate edges = the tool-gates; placed-difficulty
  per dungeon; endings unaffected. ✅
- 🟠 **Asset scale:** templates + generators reduce *layout* labour, **not art** — the biome tilesets,
  furniture, and dungeon art are still the big sourcing job (`WORLD-SCALE-DOD` DW5). Flag.
- 🟠 **Hand-tune over pure-random:** treat generation as a *seeded starting point* for hand-polish, not
  a shipping black box — freeze good seeds, edit set-pieces in Tiled. (Quality > novelty.)

## 7. RESEARCH SOURCES (established techniques — verified)
- **BSP dungeons:** RogueBasin "Basic BSP Dungeon generation" <https://www.roguebasin.com/index.php/Basic_BSP_Dungeon_generation> · Liapis, PCG-Book Ch.3 (constructive dungeons) <https://antoniosliapis.com/articles/pcgbook_dungeons.php>
- **Cellular-automata caves (4-5 rule + flood-fill connectivity):** RogueBasin <https://www.roguebasin.com/index.php/Cellular_Automata_Method_for_Generating_Random_Cave-Like_Levels> · worked walkthrough <http://pixelenvy.ca/wa/ca_cave.html>
- **Template/prefab rooms ("generated of crafted pieces"):** Spelunky generator (Kazemi's "Spelunky Generator Lessons"; Derek Yu, *Spelunky*, Boss Fight Books; GDC 2011 postmortem <https://www.gamedeveloper.com/design/video-a-postmortem-look-at-the-making-of-i-spelunky-i-hd>) · Binding of Isaac (Boris the Brave) <https://www.boristhebrave.com/2020/09/12/dungeon-generation-in-binding-of-isaac/>
- **Constrained scatter (Poisson-disk / blue-noise):** Red Blob Games <https://www.redblobgames.com/x/1830-jittered-grid/> · Bridson, "Fast Poisson Disk Sampling" <https://www.cs.ubc.ca/~rbridson/docs/bridson-siggraph07-poissondisk.pdf>
- **Generate-then-validate (generate-and-test PCG):** Togelius et al., "Search-Based PCG" <https://course.ccs.neu.edu/cs5150f14/readings/togelius_sbpcg.pdf> · *PCG in Games* (free) <http://pcgbook.com/>
- **Graph/grammar & cyclic generation (mission-graph → space):** Boris the Brave on *Unexplored* <https://www.boristhebrave.com/2021/04/10/dungeon-generation-in-unexplored/> · Dormans, "Unexplored's Secret: Cyclic Dungeon Generation" <https://www.gamedeveloper.com/design/unexplored-s-secret-cyclic-dungeon-generation-> · Dormans, "Adventures in Level Design" (missions+spaces for action-adventure) <http://www.jorisdormans.nl/pdf/dormans_adventuresInLevelDesign.pdf>
> *The pipeline maps onto these: BSP/CA for the raw shape → grammar/cyclic mission-graph for the
> lock-and-key structure → template rooms for the crafted content in the generated slots → Poisson
> constrained scatter for decoration → a generate-and-test (navGates) validation gate that re-checks
> reachability with a real body and regenerates on failure.* (RogueBasin returned 403 to the fetcher
> but the pages are canonical; Kazemi's Spelunky demo URL is paired with the durable Boss-Fight/GDC
> citations.)

## ✅ SUMMARY
- **The split:** **hand-craft** the town + story-critical rooms + overworld nav · **templates** for
  interiors + non-key dungeon rooms · **procedural** for dungeon layouts + caves + prop-scatter + loot/
  encounters — **all validated by `navGates` (generate-then-validate), all flowing through the proven
  `tiledToRegion` shape.**
- **What fills rooms/dungeons automatically:** BSP/graph layout assembling **crafted template rooms**,
  cellular-automata caves, constrained Poisson-scatter props (respecting the no-prop-on-walkable + variety
  rules), and table-driven loot/encounters — every result body-walk-validated or rejected.
- **Build order:** interior system → the template-library + generators → the town → the dungeons →
  quests/NPCs/combat/alignment → polish. Each phase playable; the tooling is the multiplier for 5h → 30h.
- **New systems:** the **interior/transition + multi-floor system** (DW1, foundational) + the **template
  format/library** + the **generator module** (reusing the proven shape + gates).
