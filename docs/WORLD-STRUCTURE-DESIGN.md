# ONE BIG WORLD — migration · composition · cohesion (design capture, build LATER)

**DECISION (made):** ONE seamless, huge, beautiful, cohesive **OVERWORLD** in a single
world-coordinate space — you WALK across area/biome boundaries with no hard cut, with fast-travel
between discovered points so huge ≠ tedious. **Interiors / caves / dungeons stay DISCRETE loaded
scenes** (door/entrance → load → exit), reusing the proven RegionScene model.

This doc is the COMMITTED architecture + composition + verification plan, in three pillars:
**(1) how to BUILD it · (2) how to FILL it well · (3) how to VERIFY it lands** (alone, against
neighbours, as a whole). **CAPTURE ONLY** — no engine/scene/SSOT code, no migration started.

> Cross-refs: **WORLD-MAP.md** (the geography this realises), **QUALITY-BIBLE Part 2.6** (settlement
> four-pillars + spatial gates — now applied at WORLD scale), **TRAVERSAL-EXPLORATION-DESIGN.md**
> (reward-for-looking, biome-as-mechanic, the "fun without a quest" bar), **GAPS-AND-DEPTH §5**
> (the SaveManager this depends on).

---

## ⚠ HONEST COST / RISK (read FIRST)
This is the **largest, highest-risk change in the project.** Plainly:
- **Many sessions of engine work** — streaming, world-coords, a new camera model, save format, NPC/
  combat/minimap rework. Not a one-session job.
- **The biggest threat to the never-regress rule.** Every system below assumes "one small bounded
  scene"; this rewires all of them. A botched step can break a working game.
- **There WILL be a mid-migration window where the world is NOT fully playable** — unlike every prior
  session (which ended at a working checkpoint). This is stated up front and is unavoidable for a
  change this deep; the phased plan minimises it but cannot eliminate it.
- **The safeguards** (non-negotiable): a **Phase-0 prototype on a throwaway world** that proves the
  cost/feel BEFORE any real region is touched, and the **three-level verification ladder** (Pillar 3)
  on every step. If Phase 0 shows the feel/cost is wrong, we reconsider before committing the regions.

---

## 0. AUDIT — the current architecture (the never-regress baseline)
Everything today assumes **ONE small bounded scene at a time**:
- **Scenes:** `BootScene → Greenhollow`; **M / N / G hotkeys** do `scene.start('Marsh'|'Peaks'|
  'Greenhollow')` = a full scene **tear-down + rebuild (hard cut)**. Each region is its own Phaser
  Scene extending **RegionScene**.
- **Coordinates:** each scene has its OWN `(0,0)`-origin space. `worldW = widthTiles*TILE`; physics
  `setBounds(edgeMargin … worldW-edgeMargin)`; tile coords are **local** to each scene; the player
  spawns at the scene's `player.tx/ty`.
- **Camera:** `setBounds(0,0,worldW,worldH)`; `_applyCamera` **cover-zooms to FIT a small world**
  (`max(W/worldW, H/worldH, baseZoom)`). Assumes the world is small + fully bounded.
- **Save/load:** per-system `serialize()` keyed `emberfall:<sys>:<slot>` (Karma/Inventory/TimeOfDay/
  Quest) — BUT the live game uses **volatile `memoryStorage()`**, there is **no unified save**, and
  **no world-position / current-area persistence** (see GAPS §5).
- **NpcLife / EnemyController / safe-zones:** per-scene instances; schedules + enemy spawns + safe
  hubs all in **scene-local tile coords**; only ever one scene's worth alive.
- **Depth-sort:** `DepthSort.reset()` per scene; tracks that scene's objects; sorts by world-Y.
- **Minimap + full-map:** `_renderMapInto` derives from **`this.cfg.world`** (one scene's ground
  rects + props + `worldW/H`). It maps ONE scene.
- **Asset loading:** **ALL** art/audio loaded **once** in `BootScene.preload` (AssetLoader.queue +
  monster sheets + the terrain atlas). Everything resident at once.
- **Interaction:** a global singleton, `reset()` per scene.

**Conclusion:** the migration touches *every* spatial system. The discrete-scene model is, however,
EXACTLY right for **interiors** — so we keep it there and only build streaming for the **overworld**.

================================================================
## PILLAR 1 — HOW TO BUILD IT (architecture + migration)
================================================================

### 1.1 Target architecture
- **One persistent `OverworldScene`** in a single global world-coordinate space (world px = global
  tile × TILE). Regions become **AREAS** (rectangular bands) within it. The player walks across area/
  biome borders with **no scene change** — it's all one scene, streamed.
- **Areas are DATA** authored in **world-coords** (a `WorldMap` declares each area's world-tile rect,
  biome, ground, props, NPCs, enemies, safe-zones). RegionScene's `cfg.world` shape generalises to
  a per-area chunk descriptor.
- **Interiors / caves / dungeons stay DISCRETE scenes** — a door/entrance is an interactable that
  `scene.start`s an **InteriorScene** (today's RegionScene, near-unchanged: small, bounded, its own
  coords). Exit returns to the overworld at the door's world position. **This carve-out REDUCES
  scope** — dungeons keep the proven, working model; only the overworld is new.
- **Fast-travel:** discovered waystones/landmarks teleport the player within the overworld (re-centre
  streaming at the destination). Not a scene change — a position jump + a stream reload.

### 1.2 STREAMING (the 30h world can't be resident at once)
- **Honest budget note:** on the **RTX 4060 / i5-14400F / 32GB** target, **RAM is NOT the constraint**
  (32GB holds far more than this 2D world's data). The real budgets are **active GameObjects +
  physics bodies + draw-calls + resident texture memory**. So streaming is about keeping the *active/
  drawn set* bounded, not about fitting bytes in RAM.
- **Chunk grid:** the world is a grid of fixed-size **chunks** (e.g. 32×32 tiles). The streamer keeps
  a **loaded window** (the player's chunk + a ring of neighbours, e.g. 5×5 = 25 chunks) and
  **unloads** chunks that leave the ring. Load = instantiate that chunk's terrain + props + NPCs +
  enemies; unload = destroy/pool them and persist their dynamic state (§save).
- **Terrain:** a **culled tilemap** (Phaser Tilemap layer, or the autotile RenderTexture baked
  per-chunk) so off-screen terrain costs nothing to draw. Bake feathered transitions per-chunk
  (Part 2.6 Gate D) at author/load time.
- **Pooling:** props/NPCs/enemies/FX **pooled** across chunk load/unload (reuse objects; don't
  churn the GC). Honour the GAPS §12 performance budget (cull, pool, watch draw-calls).
- **Hysteresis:** load a ring slightly larger than the unload ring so walking back and forth across a
  border doesn't thrash load/unload.
- **Resident vs streamed art:** **shared** art (character layers, common props, UI, audio core) stays
  **resident**; **biome-specific** art (marsh tiles, peak cliffs, coast/dunes) **streams** — Phaser's
  loader runs **mid-game** on chunk approach, then frees on departure. Prototype this in Phase 0
  (mid-game loads can hitch — measure).

### 1.3 SEAMLESS HANDOFF (stitching adjacent areas)
- **Coordinate continuity:** all areas live in ONE world-coord space, so an area's east edge IS the
  next area's west edge — no remap, no `(0,0)` reset. Author areas as world-tile rects that **abut**.
- **Shared edges:** the seam between biomes is a **transition BAND** (Part 2.6 Gate C/D — feathered
  autotile + a depth band), authored to span BOTH areas' tiles so the biome bleeds (forest→marsh
  gloom, grass→foothills). No hard line; the player walks *through* the change.
- **No pop/seam:** the streamer loads the next chunk **before** it enters view (the load ring extends
  past the camera), so you never see a chunk pop in. Continuous camera (§1.4) means no cut.
- **NPC/enemy continuity across a seam:** an NPC whose schedule crosses a chunk border is handled by
  the world-coord schedule + persistence (it's the same world, not two scenes).

### 1.4 SYSTEMS-IMPACT MATRIX (honest blast radius)
For each system: **what changes · what BREAKS · how it's protected (never-regress).**

| System | What changes | What BREAKS if naive | Protection (never-regress) |
|---|---|---|---|
| **RegionScene** | SPLIT: stays as **InteriorScene** for dungeons; a NEW **OverworldScene** owns streaming + world-coords. Shared rendering/NPC/combat code is extracted to mixins both use. | Forking logic per scene; double-maintenance. | Extract shared code ONCE (the RegionScene-refactor discipline); interiors stay byte-for-byte behaviourally identical. |
| **Transitions** | M/N/G hotkeys → **walk across** (overworld) + **door→InteriorScene** (interiors) + **fast-travel** (position jump). | Lost dev nav; stranded areas mid-migration. | Keep the M/N/G dev hotkeys working AS A FALLBACK until the seam they replace is proven; remove only per-phase. |
| **Save/load** | Must persist **world position (x,y)**, current area / interior, the day/time, AND per-chunk **dynamic state** (opened chests, dead enemies, NPC schedule progress, world-changes). The **unified SaveManager** (GAPS §5) becomes a prerequisite, not optional. | Reload spawns you in the wrong place / loses chunk state / can't represent "in a dungeon". | Build the SaveManager FIRST (its own session, GAPS §5); a save schema that includes position + area + a sparse per-chunk delta; version it (Save-Versioning rule). |
| **NpcLife** | NPCs belong to a **chunk/area**; alive only when their chunk is loaded; schedules in **world-coords**; sleeping/off-chunk NPCs persist (re-instantiate at the correct scheduled spot on load). | NPCs vanish/dupe at chunk borders; schedules reset on stream. | Schedule state is data (deeds/derived); on chunk load, place the NPC at its *current-phase* spot. De-sync jitter (NPC_LIFE) is per-NPC seeded → stable. |
| **Depth-sort** | Still per-Y — fine — but now over a **streamed set**; track/untrack on chunk load/unload; the footprint-base fix stays. | Leaks (tracking destroyed sprites); sort over a huge list. | track() on load, untrack() on unload; the sorted list = only loaded objects (bounded). |
| **Camera** | Bounds become the **whole world** (or unbounded with the streamer clamping); the **cover-zoom-to-fit-small-world is REMOVED** (the world is always bigger than the screen) — a fixed play zoom + a soft follow deadzone (already added) + fast-travel re-centre. | The cover-zoom math (`max(W/worldW,…)`) zooms wrong on a huge world. | Replace `_applyCamera` for the overworld with a fixed-zoom follow; interiors keep cover-zoom. The deadzone work already lands here. |
| **Minimap + full-map** | Render from the **GLOBAL WorldMap** + the player's **world position**; the full-map becomes a real world map (discovered areas); the minimap is a window. | The current per-`cfg.world` render maps only one area. | Drive the map from the WorldMap data (areas + POIs + player world-pos); reveal areas as discovered. |
| **Combat / safe-zones** | Safe zones become **world-coord regions** (settlement areas); enemies belong to chunks (spawn on load, despawn/persist on unload); the safe-hub + roam checks use world-coords. | Enemies dupe/leak across chunks; safe-zone math wrong. | Per-chunk enemy ownership; safe-zone = a world-rect test; the roam (ROAM_RADIUS) keeps enemies in their chunk. |
| **Asset loading** | All-at-once → **streamed per-biome** (load a biome's unique art on approach, free on departure); shared art resident. | Loading the whole 30h world's art at boot = blows texture memory / long boot. | Resident core + per-biome bundles loaded mid-game (Phase-0 proves the hitch is acceptable); the AssetLoader gains a load/free-bundle API + the ledger still covers everything. |
| **Interaction** | World-coord interactables; only loaded ones registered; chests/doors persist opened-state. | Stale interactables from unloaded chunks. | register on chunk load / clear on unload; opened-state in the save delta. |

### 1.5 PHASED MIGRATION (de-risk first — NON-NEGOTIABLE)
Each phase: **entry criteria · what it converts · how verified · rollback.** The game returns to a
working checkpoint per phase **as much as possible** — except the explicitly-flagged windows.

- **PHASE 0 — PROTOTYPE on a THROWAWAY test world (do this FIRST; do NOT touch real regions).**
  - *Entry:* none. *Converts:* nothing real — a **sacrificial** placeholder world (e.g. a 160×160-tile
    grid of flat-coloured chunks + a few props).
  - *Proves:* chunk **streaming** (load/unload around the player, hysteresis, pooling), **seamless
    handoff** (walk across chunk borders — NO pop/seam), **world-coords + a continuous follow camera**,
    **mid-game asset bundle load/free** (measure the hitch), and the **memory/draw/FPS budget** on the
    4060/32GB. *Find the true cost + feel HERE.*
  - *Verified:* FPS holds (target 60) across borders; memory bounded as you traverse; no visible pop;
    the walk *feels* seamless (Van play-judges Level B/C on the throwaway). 
  - *Gate to proceed:* **if the prototype's cost/feel is wrong, STOP and reconsider** before any real
    region is migrated. This is the project's go/no-go on One Big World.
  - *Rollback:* trivial — it's throwaway; the real game is untouched.

- **PHASE 1 — the OverworldScene shell + the SaveManager prerequisite.**
  - *Entry:* Phase 0 passed. *Converts:* stand up `OverworldScene` (streaming proven in P0) + build the
    unified **SaveManager** (GAPS §5: position + area + chunk-delta + versioned). Extract shared
    RegionScene code into mixins. *Verified:* a single real area (Greenhollow, re-authored in
    world-coords) runs in the OverworldScene with save/load of position; all Greenhollow quests/NPC-
    life/combat-safe still pass (Level A). *Rollback:* OverworldScene is additive — the discrete scenes
    still exist; revert by not routing to it.
  - ⚑ **NOT-FULLY-PLAYABLE WINDOW MAY BEGIN HERE** if the discrete scenes are unwired — keep them as
    the fallback until each seam is proven.

- **PHASE 2…N — convert ONE area/seam at a time, with FULL re-verification after each.**
  - e.g. **2:** stitch the **Greenhollow↔Marsh (W) seam** in world-coords — walk across, no cut;
    re-verify both areas (Level A) + the seam (Level B). **3:** add **Peaks (N) seam**. **4:** Coast (E).
    **5:** Emberwood (S). **6:** the Spire approach (far N). Each: re-author the area in world-coords,
    place it adjacent, bake the transition band, re-verify A + B, hand C to Van.
  - *Per phase:* entry = prior seam green; convert = one area + its seam; verified = Level A (self) +
    Level B (seam) self-checked, handed to Van; rollback = the prior phase's checkpoint (the discrete
    fallback for the un-migrated areas).
  - ⚑ **HONEST:** between Phase 1 and the final seam, the world is **mid-migration** — some areas on
    the overworld, some still discrete; **not fully seamlessly playable end-to-end** until the last
    seam lands. State this to Van each phase; keep the dev hotkeys as the bridge.

- **FINAL — remove the dev hotkeys + discrete overworld scenes; interiors remain discrete.**

================================================================
## PILLAR 2 — HOW TO FILL IT WELL ("huge ≠ empty")
================================================================
The cardinal failure of big maps: **vast + empty + lumpy density.** This pillar is the discipline
that keeps the world **densely, variedly, purposefully filled.**

### 2.1 WORLD LAYOUT (one believable landmass — reconcile with WORLD-MAP.md)
- **Committed geography intent:** **Greenhollow sits near the CENTRE of the world**, ringed by its own
  **green belt** — forest, fields, farms, mostly-green pastoral surrounds (the safe, gentle home
  ground). The other regions **radiate OUTWARD** from that centre; the Spire stands on the far-N
  horizon (visible from almost everywhere — the vista pull, TRAVERSAL §2).
- **The space BETWEEN settlements is TRAVERSABLE WILDS**, not empty filler — ranging **easy → tricky**:
  false turns, dead-ends, forks, natural obstacles, environmental puzzles. The wilds are content, not
  corridor (this is where the density floor + reward-for-looking earn their keep, §2.2).
- **The world is a WEB, not a LINE — MANY routes to many places.** No single forced corridor between
  regions; multiple viable paths, shortcuts, and back-ways. (Made an explicit gate in §2.4 + §2.5.)
- The five regions + the Spire are arranged as ONE contiguous landmass radiating from the
  **Greenhollow Vale** hub (per WORLD-MAP): **Ashen Marsh (W)**, **Sundered Peaks (N)**, **Tidewreck
  Coast (E)**, **Emberwood (S)**, and the **Hollow Spire** (far N). Roads + wilds **bleed** biome→biome
  (forest thins to marsh, grass rises to foothills).
- **Where things sit:** each region's **settlements/landmarks/set-pieces** (the Sunken Shrine, Cinder
  Keep, the underwater Drowned Vault, Ember Hollow, the Spire) are placed at world-coords; the
  **critical path** (M1→M20) threads through them, with **optional areas** hung off the path (side-
  quest pockets, secrets, the Pem trail, cameos). 
- **Reconcile with WORLD-MAP:** the WorldMap data is the single source for area rects + adjacency +
  edge-bleed; this doc commits to realising WORLD-MAP's adjacency literally in world-coords.

### 2.2 DENSITY / PACING (always something within a short walk)
- **Content-per-area floor:** every authored area meets a **point-of-interest density floor** — within
  a short walk you always find *something* (a secret, a vista, an NPC, a landmark, a set-piece, an
  interactable, an environmental-story beat). Reward-for-looking (TRAVERSAL §1) at world scale.
- **Pacing rhythm:** alternate **dense zones** (settlements, dungeons, set-pieces) with **intentional
  breathing room** (a quiet moor, a long ridge) — but **empty space is allowed ONLY when DELIBERATE**
  (a composed lull with a vista or a mood), **never accidental dead space**.
- This is an **[OBJECTIVE] gate** — see 2.4 (a POI-density floor per area; flag any area below it).

### 2.3 COHESION OF CONTENT (the spatial rules, now at WORLD scale)
- **Biome transitions** believable — Part 2.6 Gate C (boundary depth band) + Gate D (feathered
  autotile) now applied to **seams between areas**, not just map edges. The forest→marsh bleed is the
  reference.
- **Settlement four-pillars + the traversal pillar apply PER-AREA** (each town/area passes Part 2.6 +
  TRAVERSAL on its own), AND consistently across the world (scale/density/wealth/landmark legibility
  don't lurch at a border).
- **Fast-travel network:** waystones at the crossroads + each region (the first at the Greenhollow
  crossroads, per WORLD-MAP) form a coherent fast-travel graph — discovered by walking there first.

### 2.4 "FILLED NICELY" QUALITY GATES
- **DENSITY** [OBJECTIVE → verify.mjs]: every area meets the **POI-density floor** (≥ N points-of-
  interest per area-size unit, N TBD in Phase-2 tuning) AND no walkable run longer than **D tiles**
  with zero POI/landmark in sight. [EYE]: there's always something pulling you onward.
- **VARIETY** [OBJECTIVE]: per area ≥4 ground types + ≥6 scenery kinds (Part 2.6 Gate E), and **across
  the world** ≥5 visually-distinct biomes. [EYE]: the eye keeps getting something new.
- **NO DEAD SPACE** [EYE + OBJECTIVE proxy]: any empty stretch is tagged `deliberate_lull` in data
  (with a vista/mood reason); **untagged** empty stretches over D tiles FAIL the lint.
- **BIOME COHERENCE** [EYE + OBJECTIVE]: no hard biome border (Gate D); the seam reads as a believable
  bleed; scale/density don't lurch (Level B, Pillar 3).
- **WEB-NOT-LINE** [OBJECTIVE → verify.mjs]: between any two adjacent regions there are **≥2 viable
  routes** (the route graph is not a single corridor); the WORLD's traversal graph has **no forced
  single chokepoint** except where a gate (§2.5) deliberately makes one. [EYE]: it feels like a place
  you can *wander*, with choices, not a track you're pushed down.

### 2.5 PROGRESSION GATING — "fully explorable, but only when ready" (a design LAW)
The whole map is designed to be **eventually reachable**, but access is **PACED** so you arrive when
the player + the story are ready. This is Zelda-style **see-it-early, reach-it-later** at world scale —
and it is a LAW, not a nicety. Cross-ref TRAVERSAL-EXPLORATION (tool-gated nooks, shortcuts-that-
unlock, layered secrets), applied to the whole world.

- **The four gate TYPES** (a gated area uses one or more):
  1. **STORY / QUEST state** — an area opens when a quest beat clears it (a bridge raised, a foe routed,
     a faction won). 2. **ITEMS** — a key, a pass, a lantern, bombs. 3. **ABILITIES** — the Metroidvania
     **tool-gates**: hookshot/grapple (chasms), dash (long gaps), firefrost (melt/freeze), etc. 4. **TIME**
     — night-only or specific-day/calendar access (a tide, a festival, a moon).
  2. A few areas may stay **permanently hard / secret** (deep optional challenge or lore) — deliberate,
     and flagged as such so they don't read as a bug.
- **The patterns these enable** (design intent, Zelda DNA): **see-but-can't-reach** teases (a vista, a
  walled nook, an island) that you **REMEMBER and RETURN to** once you have the key; **bombable-wall**-
  style "come back with the tool" loops; healthy **back-and-forth**; **puzzle-it-out** access; and
  **side-quests that route you all over the map** (the world taught through play, not a checklist).
- **THE GATING GATES** ([OBJECTIVE]/[EYE] — soft-lock safety is non-negotiable):
  - **CLEAR EVENTUAL KEY** [OBJECTIVE → verify.mjs]: **every** gated area declares, in data, the exact
    key that opens it (quest id / item id / ability id / time-condition). **No area may be reachable-
    in-principle yet have no obtainable key** → that's a **soft-lock**; the lint **FAILS** on any gated
    area with a missing or unobtainable key, or a key locked behind itself (circular gate).
  - **TEASE → PAYOFF** [OBJECTIVE + EYE]: every **see-but-can't-reach** tease is tagged in data with the
    gate that later opens it; the lint flags a tease with **no remembered payoff** (a tease that never
    becomes reachable). [EYE]: the return moment lands ("*that's* what the hookshot was for").
  - **MULTIPLE VIABLE ROUTES** [OBJECTIVE]: see WEB-NOT-LINE (§2.4) — gating paces discovery without
    collapsing the world to one corridor; a gate narrows *one* route, never the *only* route (unless a
    deliberate, flagged story chokepoint).
  - **NO ACCIDENTAL EARLY ACCESS** [EYE]: an area meant for later shouldn't be trivially reachable
    early in a way that breaks pacing/difficulty (Van play-judges; the streamer + collision enforce
    the intended gate, not an invisible wall that reads as broken).

### 2.6 ECOLOGY (design intent — reserve the principle, DETAIL LATER)
*(Note for a later content-design pass — not designed here.)*
- **Region-appropriate MONSTERS:** different regions are populated by different threats (marsh things,
  peak things, coast things) so place reads through its inhabitants, not just its tiles. (Ties to the
  EnemyController per-area ownership in the §1.4 matrix.)
- **PETS by source:** some pets are found **wild** (region-specific), some only in **villages / shops**,
  some only via **specific quests** (cross-ref PETS-DESIGN). Reserve the principle; detail the roster,
  habitats, and acquisition routes in a dedicated later pass.

================================================================
## PILLAR 3 — HOW TO VERIFY IT LANDS (the three-level cohesion ladder)
================================================================
Van's verification ladder — three levels, each with its own gates, tied to **HARD RULE 9**:

### LEVEL A — EACH AREA ALONE
- *Gate:* an area passes the **settlement four-pillars + the traversal pillar + Part 2.6 A0–K** on its
  **own merits** — enclosed spaces, path hierarchy, boundary depth, feathered edges, variety, secrets,
  density floor, the interactable playground.
- *Check:* **[OBJECTIVE]** the per-area verify.mjs gates (Part 2.6 + density) with proof + screenshots;
  **[EYE]** Van play-judges the area's feel.
- *Process:* the **migration/area session self-checks Level A** before handing up (HARD RULE 9).

### LEVEL B — AGAINST NEIGHBOURS (the SEAMS) — *the level most big maps FAIL*
- *Gate (explicit seam checks):* the border between two adjacent areas must —
  1. **biome transition reads believable** (a feathered bleed band, no hard line — Gate C/D across the seam);
  2. **NO pop / NO seam** (chunks stream in before view; continuous camera; no tile/lighting discontinuity);
  3. **coordinate continuity** (one world-coord space; the walk-across is unbroken, no reset/teleport);
  4. **consistent SCALE + DENSITY across the border** (building size, tile scale, POI cadence don't lurch);
  5. **the walk between feels INTENTIONAL** (a composed journey, not a dead corridor — a vista, a
     landmark hand-off, a mood shift).
- *Check:* **[OBJECTIVE → verify.mjs]** seam lint — adjacent area edges share coords + a transition
  band exists + no scale jump in the border data; **[EYE]** Van **walks the seam** and judges 1–5.
- *Process:* every seam migration **hands Level B to Van to play-judge** (it cannot be auto-passed).

### LEVEL C — AS A WHOLE
- *Gate:* the entire world reads as **ONE coherent place** — consistent **art / scale / tone**, a
  **legible mental map** (you can hold the world in your head, navigate by landmarks), a **coherent
  fast-travel** graph, **no jarring shifts** region-to-region.
- *Headline [EYE] gate:* **"Could you wander the WHOLE world with no quest and still enjoy it?"** —
  the world-scale version of the TRAVERSAL "fun without a quest" bar. If no, the world fails.
- *Check:* **[EYE]** Van free-roams the assembled world (quest tracker off) and reports; **[OBJECTIVE]**
  the full-map renders one coherent landmass; fast-travel reaches every discovered point.
- *Process:* handed to Van **as a whole** after each major assembly milestone (HARD RULE 9).

> Every migration/area session: **self-check A** (objective + proof), **hand B (seams) and C (whole)
> to Van** to play-judge — the same shape as Part 2.5 / 2.6, under HARD RULE 9.

### LEVEL D (forward-reference, QUEUED CAPSTONE — do NOT design here)
Once the world structure is built, a future **GRAND COHERENCE REVIEW** will check the **whole game** —
map + quests + stories + time/calendar + abilities + items — **individually, against each other,
physically (in-world), and as a timeline.** Noted here only as a **queued capstone gate** above the
A/B/C ladder; to be specced in its own session when the world exists.

---

## PROPOSED SSOT IDS (LIST ONLY — do NOT add to `src/constants/` this session)
- world structure: `area_<name>` ids, `chunk` coords (data, not SSOT ids), `seam_<a>_<b>` tags,
  `waystone_<name>` (fast-travel points), `deliberate_lull` (the tagged-empty marker).
- gating (§2.5): a per-area `gate` descriptor `{ type: 'story'|'item'|'ability'|'time', key: <id> }`
  reusing EXISTING quest/item/ability ids (never a synonym); `tease_<name>` tags (see-but-can't-reach
  → its opening gate); `route_<a>_<b>` edges for the web-not-line graph; `permanent_secret` marker.
- save: a `world` save block (player world-x/y, current area / interior id, per-chunk delta map) —
  bump `SAVE_VERSION` (Save-Versioning rule).
- the **WorldMap** data file (`src/data/worldmap.js` — areas + adjacency + edge-bleed + POIs) and an
  **asset-bundle** manifest (per-biome resident/streamed art) are systems/data, not SSOT ids.

---

## BUILD-ORDER (does NOT block current region/feel work)
1. **Phase 0 prototype** (throwaway) — the go/no-go. 2. **SaveManager** (GAPS §5) + OverworldScene
shell. 3. Convert **one seam at a time** (Greenhollow↔Marsh first) with Level-A self-check + Level-B/C
to Van. 4. Wire the streamed minimap/full-map + fast-travel. 5. Remove dev hotkeys; interiors remain
discrete. Heavy + risky — **Phase 0 + the three-level ladder are the safeguards;** do NOT start the
real-region migration until Phase 0 proves the cost and feel.
