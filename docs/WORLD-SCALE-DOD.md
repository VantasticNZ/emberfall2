# WORLD-SCALE DoD — sized BACKWARDS from the content (the missing cross-check)

> **Design/audit — the spec Claude Code builds TO (no more guessing small).** The map was sized
> abstractly (a 640-tile grid, single-screen regions) and **never cross-checked against the 66 quests,
> 30+ NPCs, and 40+ named places that already exist in the data**. This doc fixes that: it audits the
> real content → the places it needs → what's missing, derives the required world, reconciles with
> Van's commercial-scale target, and writes the concrete DoD + the foundational systems + the honest
> phasing. **Design only.** Cross-refs: all `src/data/quests/*`, `STORY-AND-QUESTS`, `WORLD-BLUEPRINT`,
> `MASTER-MAP`, `CONNECTORS`, `NPC-WORLD`, `ALIGNMENT-SYSTEM`, `MECHANICS-DESIGN`, `gating.js`,
> `EXCELLENCE-FRAMEWORK`.

## 0. THE DIAGNOSIS (why the map is too small)
The content is **already commercial-scale**; the *space* never caught up. The data holds **66 quests**
(20 main M1–M20 · 34 side · 12 cameo/edge/gag/night · 6 philosophy), **30+ named NPCs**, **40+ named
places** — but the built world is **single-screen regions with no interiors and greybox dungeons**.
Two structural gaps fall straight out of the audit:
1. **No INTERIOR system.** The content names ~30–50 interiors that you must enter (taverns with *rooms
   upstairs*, shops, homes, a marble **mansion hall**, the lighthouse, the mine, civic halls, multi-
   floor dungeons) — and **there is no way to enter a building or a dungeon floor.** This is the single
   biggest gap.
2. **Towns are nodes, not towns.** Each "settlement" (Mirefen, Saltbreak, the Peaks town, the Emberwood
   settlement) is a *cluster of 3–6 props* on one screen, yet each must hold **5–10 NPCs, multiple
   shops/factions, and 6–12 quests**. They're 5–10× too small for their own content.

**The fix is not "make the overworld enormous."** It's **(a) build the interior/area-transition system**
(interiors + dungeon floors are *separate scenes* — unlimited content without overworld bloat, exactly
how Zelda/Pokémon/Stardew scale), **(b) grow each town into a real, dense town** sized to its content,
**(c) author an interior scene for every named interior + every dungeon floor.** The overworld grows
*modestly*; the **30-hour scale lives in the interiors, dungeon floors, and quest density.**

---

## 1. CONTENT-TO-SPACE AUDIT (the missing cross-check) — content → required place → exists today?

Verdict key: **✅ exists** · **�v too-small** (exists as a node, can't hold its content) · **❌ missing**
(named in content, never built) · **🚪 needs-interior** (must be enterable; no system yet).

### Greenhollow Vale (Act 1 + hub) — holds M1–M7, SG1–SG7, GHUB, PH3/PH6, CAM2/CAM7, GAG1
| Place (content it holds) | Required | Today |
|---|---|---|
| **Greenhollow village** (the whole Act-1 cast + hub) | a real TOWN (plaza, districts, ~12 NPCs) | �v too-small (one screen) |
| **The Copper Tankard** (SG5 songs, PH-talk, *rooms upstairs*) | 🚪 tavern interior + an upstairs floor | ❌🚪 no interior |
| **Pem's General Store** (SG2, trade) | 🚪 shop interior | ❌🚪 |
| **The Forge / Smithy** (M1 Bram, SG3 Hodge) | 🚪 forge interior | ❌🚪 (exterior only) |
| **The Chapel** (festival, faith) | 🚪 chapel interior | ❌🚪 |
| **The Manor / Lord's house** (NE) | 🚪 a noble interior | ❌🚪 |
| **Homes district** (Mara's cottage + ~6 homes) | 🚪 several enterable homes | ❌🚪 |
| **The Boarded Cave** (M4 weeping-flame carving) | 🚪 a small cave interior | �v exists as a gated prop, no interior |
| **The Orchard** (SG7 thief), **the Brook/Pool**, **the Crossroads waystone** | overworld features | ✅/�v partial |
| **3 hidden caches** (40g/25g/15g) | secret spots | ✅ designed, �v not all placed |

### Ashen Marsh (M8–M11, SA1–SA5, PH5, CAM4, NIGHT1)
| Place | Required | Today |
|---|---|---|
| **Mirefen** (stilt settlement: Yssa + bog-folk, M8, SA1) | a stilt **hut-town** (~6 NPCs) | �v too-small |
| **Hagga's hut** (M8/M10 — the truth) | 🚪 a hut interior across the black water | ❌🚪 |
| **The Sunken Shrine** (M9 dungeon: Drowned Guardian, shard 1) + **drowned crypts** (SA3) | a multi-room DUNGEON + a side-crypt floor | �v greybox grant-node, no floors |
| The seeps (SA1), the Fen (SA4 the Frog), the reeds (SA5) | overworld set-pieces | ❌ not built |

### Sundered Peaks (M11–M12, SP1–SP5, PH1, CAM1, CAM3)
| Place | Required | Today |
|---|---|---|
| **The terraced stone town** (miners, Mike Hunt, Stonewright, factions, SP1–SP3) | a real mountain TOWN/CITY (~7 NPCs, town hall, mine office) | �v too-small |
| **Cinder Keep** (M12 dungeon: Keep Sentinel, shard 2, the Order's records SP1) | a multi-room KEEP dungeon + a records library | �v greybox grant-node |
| **The Mine** (SP3 dispute, PH1 the runaway cart) | 🚪 a mine interior + the cart set-piece | ❌🚪 |
| **Lord Pellamy's marble hall** (CAM1 the Cynic) | 🚪 a noble MANSION interior | ❌🚪 |
| **High Pass** (SP4 grapple cache), **High crags** (SP2 Crag Beast) | overworld traverse + a secret cache | ❌ not built |

### Tidewreck Coast (M13–M14, ST1–ST5/ST8, PH2, EDG1/EDG2)
| Place | Required | Today |
|---|---|---|
| **Saltbreak** (harbour town: smugglers vs authority, Hugh Jass, Harbourmaster, the most content-dense — 7+ NPCs, ST1/ST5/EDG1, the tavern) | a **HUGE harbour CITY** (docks, underworld, market) | ❌ greybox region only |
| **The harbour tavern** (PH2 the Barber, EDG1 the raid) | 🚪 a city tavern interior | ❌🚪 |
| **The Drowned Vault** (M14 dungeon: Tideward, shard 3) + **tide-caves** (ST2) | a tide-timed DUNGEON + a cave system | �v greybox grant-node |
| **The Lighthouse** (ST3 Holden — the grief mirror) | 🚪 a lighthouse interior (a tall multi-floor) | ❌🚪 |
| Wrecks (ST4), the strand (ST8 bottle), the headland (EDG2) | overworld set-pieces | ❌ |

### Emberwood (M15–M16, SE1–SE5, PH4, CAM6)
| Place | Required | Today |
|---|---|---|
| **The caught settlement** (SE2 the burning/freezing halves — the heavy choice) | a TOWN split fire/frost (~5 NPCs) | ❌ greybox region only |
| **Ember Hollow** (M16 dungeon: Feverheart, fire/frost tool, shard 4) | an elemental DUNGEON + the split altar | �v greybox grant-node |
| **The Weeping Tree grove** (SE4 — the god-fragment, the Liberator nudge) | a secret grove set-piece | ❌ |
| Burning ridges (SE5 stag), the burn/freeze seam (SE1), Ashen relics (SE3) | overworld + a gated secret | ❌ |

### Hollow Spire (M17–M20)
| Place | Required | Today |
|---|---|---|
| **Spire approach** (M17 Sela's Design) | an approach set-piece | �v greybox |
| **The Long Ascent** (M18 gauntlet, all 4 tools, the CHICKEN landing) | a MULTI-FLOOR ascent (lantern/grapple/hookshot/firefrost gates in turn) | �v greybox switchbacks, no floors |
| **The Binding Chamber** (M19 boss + M20 the 5-ending finale, shard 5) | a grand finale chamber | �v greybox grant-node |

### Roaming / world-wide
The **Wanderer** (CAM5, rare spawn, all regions) · **Sela** (the oracle, throughout) · **Pem's 4 marks**
(SG2, one per region) · the **standout characters** from NPC-WORLD (the jandal/constable cop **Wiremu**
already seeded as CAM7, the gunhand, the ninja-gran) · the **good-monster** (the Frog SA4 is the
puzzle-not-fight seed; the Weeping Tree is the gentle one). These need **spawn points + the systems**,
not new regions.

### AUDIT FINDINGS (the headline)
- **~30–50 INTERIORS are referenced and 0 are enterable** (no system). 🔴 the #1 gap.
- **Every "settlement" is 5–10× too small** for its NPCs/factions/quests. �v
- **The 5 dungeons + the Spire are greybox grant-nodes** — they need real multi-room/multi-floor maps. �v
- **Dozens of overworld set-pieces are unbuilt** (the seeps, the Frog fen, the lighthouse point, the
  Weeping grove, High Pass, the wrecks, the marble hall…). ❌
- **The existing content alone already demands a 6-region world of real towns + interiors + multi-room
  dungeons + secrets** — which is *already* near Van's commercial target, before adding any new content.

---

## 2. THE DERIVED WORLD (what the content actually requires) vs VAN'S TARGET

| | The existing content REQUIRES | Van's commercial target | Reconcile → BUILD TO |
|---|---|---|---|
| Major settlements | 5 (one per region) + the Spire | ~10 towns · 3 huge cities · 5 villages · 2 hut-towns | **Grow the 5 to real size + ADD the rest** (the content under-fills 10 towns/3 cities — so either distribute existing content wider OR add ~15–20 light side-settlements. Target is the ceiling, the content is the floor.) |
| Dungeons | 5 main (Shrine, Keep, Vault, Hollow, Spire) + side-crypts/tide-caves/records | 10+ dungeons | **5 main multi-floor + 5+ sub/secret dungeons** (crypts, tide-caves, High Pass, Boarded Cave, the marble vaults) |
| Secret/treasure areas | ~10 (caches, gated loot, Pem marks, Weeping Tree, High Pass) | 10+ secret areas | **matches** |
| Interiors | ~30–50 (taverns, shops, homes, halls, lighthouse, mine, mansion, civic) | houses/shops/caves/mansions/civic, multi-floor | **the foundational gap — build the system + author them** |
| Geography | bog, mountains, coast/ocean, fire-frost wood, highlands | + rivers, bridges, forests, swamps, deserts | **add the missing biomes** (a desert + a great river/bridges are NOT yet in the lore — a [DECISION]: add a desert region/route + river-crossings, or keep the 6-biome set) |
| Hours | ~66 quests × ~25 min + exploration/combat/secrets ≈ **27–40 h** *if* sized to hold them | 30+ h | **the content IS ~30h — the too-small map is what crams it into ~10–15h.** Sizing up *unlocks* the 30h. |

> **The reconciliation:** the **existing content** is the *floor* — and it already needs ~6 real
> regions with towns + interiors + multi-room dungeons (≈ Van's structure-(b)). **Van's targets (10
> towns, 3 cities)** are the *ceiling* — reaching them means **growing settlements + adding ~15–20
> light settlements/biomes + new side-content** to fill them. Build to the floor first (it's already a
> 30h game), grow toward the ceiling in later phases.

---

## 3. THE WORLD-SCALE DoD (concrete — what "done at scale" means)

### 3.1 Overworld scale
- **World grid: grow from 20×20 → ~30×30 chunks (~960 tiles / 30720 px)** — room for *real-size* towns
  (~60–120 tiles each) + the vast explorable connectors (CONNECTORS.md) + the new biomes, while
  interiors/dungeons live in **separate scenes** (so the overworld stays navigable, not bloated).
  *(Exact final grid to confirm once the town footprints are sized — start at 30×30.)*
- **6 regions** (the 5 + the Spire) on the gating spine, **+ 2–4 new sub-regions/biomes** for Van's
  scale (a desert + a great-river crossing + a deep-forest, [DECISION D-geo]).

### 3.2 Settlements (count · size · position · content)
| Tier | Count | Size (tiles) | Examples (content) |
|---|---|---|---|
| **Huge CITY** (6–10 streets, districts, many interiors) | **3** | ~110–160 | **Saltbreak** (Coast — docks/underworld/market, the densest), **Stonereach** (Peaks — mine-city + the Order's seat), **the Oracle Capital** (Sela's civic-religious seat — *new, fills the "libraries/temples/civilizations" depth*) |
| **TOWN** (plaza + districts + ~6–10 interiors) | **~10** | ~60–90 | **Greenhollow** (grown), the Emberwood split-town, + new road/river/forest towns |
| **VILLAGE / hut-town** | **~7** | ~30–50 | **Mirefen** (bog stilt-village), mountain hamlets, fishing villages, forest camps |
Each settlement DoD: its NPCs placed (with NPC-WORLD reaction types), its quests' places present, its
shops/factions as **enterable interiors**, a safe-zone, its art-direction mood, density-floor met.

### 3.3 Dungeons + caves (10+)
**5 main multi-floor** (Sunken Shrine, Cinder Keep, Drowned Vault, Ember Hollow, the Hollow Spire — the
Spire being the grand multi-floor finale) **+ 5+ sub/secret** (drowned crypts, tide-caves, the Order's
records-library, the Boarded Cave, High-Pass vault, the marble-hall undercroft). Each: real rooms, the
biome's enemy ecology (placed-difficulty), the tool/spell puzzle (MECHANICS), the boss/grant, save
permanence.

### 3.4 Secret / treasure areas (10+)
The 3 GH caches · SA3 drowned-loot · ST2 tide-loot · SE3 ashen-relics · SP4 high-pass · the Weeping Tree
· Pem's 4 marks → SG2 · the Wanderer spawn · the Frog fen — all placed, all paying off a tool/spell/deed.

### 3.5 Interiors & FLOORS (the foundational scope)
Every named interior is an **enterable separate scene**: ~**30–50 interiors** (taverns +upstairs,
shops, homes, the forge, chapel, manor, lighthouse +floors, mine, town halls, the marble hall, civic
libraries/temples). **Multi-floor** where named (the Tankard upstairs, the lighthouse, the keep, the
Spire). Each interior: its own small map, its NPCs/chests/quest-hooks, a door back to the overworld,
save permanence, an "interior name" indicator.

### 3.6 Geography
The lore biomes (bog · mountains · storm-coast/ocean · fire-frost wood · highlands · the green vale) +
**the playbook's missing set**: **rivers + bridges** (the watershed spine already in MASTER-MAP), a
**deep forest**, and (D-geo) a **desert** + **swamp** distinct from the bog. Connector zones per
CONNECTORS.md (vast, forking, secret-strewn).

### 3.7 Density → hours
**66 quests** (≈ 27–33 h of quest time at ~25 min each) **+** exploration of 3 cities / ~10 towns / 10+
dungeons / 10+ secrets **+** combat encounters **+** the 5-ending replay value **= 30–45 h** when built
to this scale. The content is already there; **scale is what converts it from a cramped ~12 h into the
30 h+ game.**

---

## 4. REQUIRED SYSTEMS (what the scale demands — flag as foundational builds)

1. **🔴 INTERIOR / AREA-TRANSITION SYSTEM (foundational — build FIRST).** A door/entrance on the
   overworld → load a **separate interior scene** (its own map); a way out at the door; **multi-FLOOR**
   (stairs → another scene/level); the **entrance-contract extended to interiors** (two-sided, save-
   stable ids); **save/permanence inside** (chests, NPC state, deltas keyed per-interior). Reuse the
   proven `tiledToRegion` pipeline for interior maps + the navGates. *Without this, ~half the content
   cannot exist.* **[DECISION DW1 — the top-priority build.]**
2. **Large-settlement / city support** — districts, many buildings, denser NPC schedules (NpcLife
   scales), a city minimap, street legibility. **[DW2]**
3. **Interior minimap + "you are in X" indicator + a fast-travel/return** (a city/world this size needs
   wayfinding). **[DW3]**
4. **Region/scene streaming for many maps** — the overworld stays chunk-streamed; interiors/dungeons
   load on enter (already feasible; formalize). **[DW4]**
5. **ASSET PIPELINE AT SCALE** (a parallel workstream, see §6) — interiors need floor/wall/furniture
   tilesets; cities need building variety; dungeons need per-biome tilesets; new biomes need terrain
   (desert/river/bridge); the standout NPCs + many more villagers need sprites. **[DW5]**
6. (lighter) NPC-WORLD systems (safe-mode, reactions, the standouts), the alignment transformation,
   the elemental magic/puzzles — already designed; they ride the slice builds.

---

## 5. HONEST SCOPE + PHASING (this is a large, multi-phase project — the goal is "finish", not "build-then-break")

This is a **commercial-scale RPG**: realistically **many months** of build at this pace. Vertical-
slice-first so it's **playable + growing at every stage**:

- **Phase 0 — THE INTERIOR SYSTEM (the foundation).** Build DW1 + prove it: enter the **Tankard**
  (one interior) → walk it → **go upstairs** (multi-floor) → exit; + **one dungeon floor**. Runtime-
  gated (navGates). *Nothing else scales until this exists.*
- **Phase 1 — ONE FULL-SCALE REGION SLICE: Greenhollow.** Grow GH into a real **town** (districts +
  ~8 enterable interiors + the cast + M1–M7 + its sides + the Boarded-Cave dungeon + the caches), to
  the EXCELLENCE region DoD. **The scale + quality proof Van judges** (joins the §8.4 art slice).
- **Phase 2 — REPLICATE region-by-region** (Marsh → Peaks-city → Saltbreak-city → Emberwood → the
  Oracle Capital → the Spire), each via the §6 sequence, **sourcing its assets first** (DW5).
- **Phase 3 — FILL TO THE CEILING:** the extra towns/villages/hut-towns, the new biomes (desert/river/
  forest), the 10+ secret areas, the standout-character encounters, the world-roaming content.
- **Phase 4 — POLISH:** density, wow-moments, cutscenes, accessibility, the full alignment
  transformation + magic, the licence sweep + credits.

At every phase the game is **playable end-to-end** (the greybox skeleton already lets you walk the
whole world; each phase replaces greybox with finished, scaled content).

---

## 6. CROSS-IMPACT (reconciled / flagged)
- **vs `gating.js`:** ✅ the tool-DAG is the spine, unchanged; interiors/floors live *within* regions;
  more gated content (dungeon floors, secret areas) uses tools/spells as optional gates (no soft-lock).
  New settlements slot onto the existing hub-and-spoke; new biomes add reserved blocks (like Coast/
  Emberwood did). **No re-architecture of the gate graph.**
- **vs the 5 endings:** ✅ unaffected — endings stay deed/karma-gated; **more content = more deed
  callbacks** (the audit already shows 12 epilogue twists + 50+ deed gates), *deepening* the endings.
- **vs the emotional pacing:** ✅ a bigger world must hold the **wholesome→dread→horror→awe** arc
  per region; the **3 cities add the civic/cultural depth** Van wants (libraries, temples, ancient
  texts, "whole civilizations") — placed in the Oracle Capital + Saltbreak + Stonereach.
- **vs the difficulty curve:** ✅ still **placed per region/dungeon, never auto-scaled**; bigger
  dungeons = more *placed* encounters; returning to early towns stays easy (the power-feel).
- **🔴 vs ASSET GAPS (the big flag):** a world this size needs **an order of magnitude more art** —
  ~30–50 interior tilesets (floors/walls/furniture), city building variety, per-biome dungeon tilesets,
  desert/river/bridge terrain, dozens more NPC sprites + the standout characters + the alignment
  transformation layers + spell VFX. **All must be licence-vetted (CC0/AI-safe) to the 32/64 LPC lock.**
  This is a **major parallel sourcing/commission workstream** — flag it now; a region **does not build
  until its assets are in hand** (the asset discipline). **[DECISION DW5 — start the interior/furniture
  + per-biome dungeon asset hunt in parallel with Phase 0.]**

---

## ✅ SUMMARY — the findings, the spec, the call
- **Audit:** the **content is already ~30h commercial-scale** (66 quests, 30+ NPCs, 40+ places) but the
  map is **5–10× too small per town and has 0 enterable interiors** — ~30–50 interiors + 5 multi-floor
  dungeons + dozens of set-pieces are **named but unbuilt**.
- **Derived world:** ~**3 cities · ~10 towns · ~7 villages/hut-towns · 5 main + 5+ sub dungeons · 10+
  secrets · 30–50 interiors**, on a **~30×30-chunk** overworld + interiors-as-separate-scenes, across
  the lore biomes **+ rivers/bridges + a desert + a deep forest** (D-geo).
- **Hours:** **30–45 h** when built to scale (the content exists; scale unlocks it).
- **Required systems:** **the INTERIOR/AREA-TRANSITION + multi-floor system is the #1 foundational
  build (DW1)**, then city support, wayfinding, and the **at-scale asset pipeline (DW5)**.
- **Scope/phasing:** a **large multi-phase project** — Phase 0 interior system → Phase 1 one full-scale
  Greenhollow slice → Phase 2 replicate region-by-region (assets first) → Phase 3 fill to Van's ceiling
  → Phase 4 polish. **Playable + growing at every stage; the risk is "finish", not "build-then-break".**
- **[DECISIONS] for Van:** **DW1** build the interior system first · **DW5** start the at-scale asset
  hunt in parallel · **D-geo** confirm the new biomes (desert/river/forest) + the 3 cities' identities
  (Saltbreak / Stonereach / the Oracle Capital) · confirm the **30×30 world grid** as the new target.
