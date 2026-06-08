# EMBERFALL 2 — MASTER MAP (build-ready physical spec, all regions)

> **Integrated master design — Layer 2a (PHYSICAL).** The `WORLD-BLUEPRINT.md` says
> *where* regions go; **this says WHAT is in them, specifically enough that a build session
> PLACES it without inventing.** The absence of this layer is what made Peaks come out
> improvised/disjointed. Story/quest/gate *overlay* = the next session (2b); this references
> the gating order but does not place quests. **Doc-only.**

### How to read this
- **Coordinates = WORLD TILES** on the locked 32px grid (origin top-left; +x = E, +y = S;
  world = 640×640 tiles). Each region lists its **bounds**; positions inside are world tiles.
- **Every map element maps to an asset verdict:** `[HAVE]` (a conforming in-repo asset, per
  `ASSET-MANIFEST.md`), `[HAVE⚙]` (in-repo but needs a WIRING pass — e.g. an unwired terrain-v7
  autotile), or `[GAP]` (needs sourcing first, to the locked 32px LPC standard — `QUALITY-SPEC §0.3`).
- **Everything conforms to THE LOCK** (`QUALITY-SPEC §0`): 32px LPC terrain, 64px LPC actors,
  LPC palette, scale ratio 1:2.7:4.2. Terrain names are **terrain-v7 autotile terrains** (the
  atlas is already shipped — *wire, don't source*) unless tagged `[GAP]`.
- **Density bands** (`QUALITY-SPEC §3`, screen ≈ 19×11 tiles @ 1.25 zoom): town **15–25**
  features/screen · wild/route **6–12** · deliberate lull **≥3**; no bare ground run > 6×6
  (wild) / 4×4 (town); a `route` never has an open walkable block > 8×8.

---

## 0. THE WORLD SKELETON (what stitches the regions)

**The watershed spine (the "one place" cue, WORLD-STRUCTURE §2.1a):** snowmelt is born at the
**Spire/Peaks (N, highest)** → a **river enters Greenhollow from the N** (the canon brook) →
widens crossing the vale → **runs E** to a **delta meeting the OCEAN at Tidewreck Coast**. The
**Marsh (W)** is the low wet basin the river seeps into; **Emberwood (S)** is the volcanic
massif with its *own* warm water (fire vs cold-water opposition — no northern flow reaches it).
Trace water uphill N to find the Peaks; downhill E to find the sea. `[terrain HAVE⚙: Water /
Water_Deep / Water_Shallows]`

**Connecting route bands (the traversable wilds between settlements):**

| Link | Band (world tiles) | Channelled by | State |
|---|---|---|---|
| GH ↔ Marsh | **West Belt** x278–288 / y293–327 | treeline + bush + pond water | **BUILT** |
| GH ↔ Peaks | **Foothill route** x303–333 / y278–288 | cliff faces + scrub | **BUILT** |
| GH ↔ Coast | **River-road** x340–388 / y298–323 | the river (S bank) + treeline ridge (N) | planned |
| GH ↔ Emberwood | **Ashen-road** x308–338 / y328–363 | ash/frost bleed + chasm walls | planned |
| Peaks ↔ Spire | **Gated ascent** through Peaks N headroom y206–218 → ascent y202–206 | single forced corridor (the one sanctioned chokepoint, §2.5) | planned |

**Gating order (DAG — `gating.js`, do not re-place):** GH (open) → Marsh (open; earn
`tool_lantern`+`shard_1`) → Peaks `[shard_1]` (earn `tool_grapple`+`shard_2`) → Coast
`[tool_grapple]` (earn `tool_hookshot`+`shard_3`) → Emberwood `[tool_hookshot]` (earn
`tool_firefrost`+`shard_4`) → Spire `[4 shards + tool_firefrost]` (earn `shard_5`).
**Tease→payoff keys:** belt pond-island → `tool_hookshot`; boarded cave (GH) → `tool_lantern`;
high ledges / vale-lake island → `tool_grapple`; tide caves → TIME(tide)+`tool_hookshot`;
burnt/frozen nooks → `tool_firefrost`; Spire summit → 4 shards.

**The global vista:** the **Spire** silhouette is visible on the N horizon from everywhere
(orientation anchor). `[GAP: spire/tower silhouette structure]`

---

## 1. GREENHOLLOW VALE — the hub  ·  bounds x288–340 / y288–328 (52×40) · **BUILT** (reconcile)

**Role:** the central safe village + the crossroads where the N (foothill) and E (river-road)
roads fork. Childhood + return hub (M1–M7).

1. **PATHS:** the **ring road** loops the village (plaza centre ≈ x314,y308); spurs leave at
   four diegetic trailheads — **W** (to the Belt, x288 mid-y), **N** (foothill trailhead ≈
   x313,y288), **E** (river-road ≈ x340,y305), **S** (ashen-road ≈ x320,y328). The **Crossroads
   + first waystone** sits where the N and E roads split, just NE of the plaza ≈ **x330,y298**.
   `[HAVE: Dirt_Brown road autotile; prop_sign waystone]` ⚑ *(blueprint §2's "x200 y153"
   crossroads is stale pre-recentre A-coords — corrected here to x330,y298.)*
2. **TERRAIN MASSES:** `Grass` base; `Gravel_1` plaza (centre ~6×6); `Dirt_Brown` ring road +
   spurs; `Soil` farm plots (SE, ~x330,y320); the **brook** = `Water` + pond 9-slice (SW,
   ~x295,y322) flowing in from the **N** (the river headwater enters here). `[HAVE]`
3. **LANDMARKS:** the **village chapel** (silhouette, N-centre ~x316,y296) `[HAVE: house/
   structure kit]`; the **Crossroads waystone** `[HAVE]`; **Spire on the N horizon** `[GAP]`.
4. **SECRETS + TEASES:** **orchard cache** (SE orchard, built) `[HAVE: prop_chest]`; **brook
   hollow** (3 chests, built) `[HAVE]`; **the boarded cave (M4)** — a TEASE, dark interior,
   payoff `tool_lantern` (meadow N-edge ~x308,y290) `[HAVE: cliff cave-mouth tile / Dungeon
   Elements for the boards]`.
5. **ENCOUNTERS:** **NONE** — `safeZone:true`. (The flagged Greenhollow charger is a DEV test
   only; childhood M1–M6 is combat-free by design.) Safe hub = the whole region.
6. **DENSITY (~10 screens):** village core = **town band 15–25** (houses/fountain/NPCs/props);
   farm + orchard margins = **8–12**; the treeline boundary ring is a deliberate dense frame
   (no bare edge). ✅ meets bands (built).
7. **BOM:** all `[HAVE]` except the Spire-vista silhouette `[GAP]` and the cave-mouth art for
   M4 (use the eliza cliff cave tile when the cliff autotiler lands `[HAVE⚙]`).

---

## 2. WEST BELT — the GH↔Marsh route · bounds x278–288 / y293–327 (10×34) · **BUILT**

1. **PATHS:** a winding **dirt LANE** from the GH W-trailhead (E edge) → a **junction** → FORKS:
   **N-scenic** (skirts the pond) / **S-direct** (to Mirefen); a short **SPUR** hides a cache.
   Channelled by contiguous tile-colliders (treeline/bush walls) — no off-lane walking. `[HAVE]`
2. **TERRAIN:** `Grass` → `Mud_Brown` bleed W; `Dirt_Tan` trail; the **scenic pond** (`Water` +
   9-slice) holds the tease island; a reed pool SW. `[HAVE]`
3. **LANDMARKS:** the **trail waystone** at the junction. `[HAVE: prop_sign]`
4. **SECRETS + TEASES:** **reachable spur cache** (`belt_cache`, built) `[HAVE]`; **pond-island
   chest** = TEASE, payoff `tool_hookshot` (water-gap crossing). `[HAVE: prop_chest visual]`
5. **ENCOUNTERS:** none (safe travel corridor; combat lives in the Marsh). A path-side traveller
   (Joss) at the GH end. `[HAVE]`
6. **DENSITY (~2 screens):** route band **6–12** (bush/tree walls + waystone + cache + traveller);
   channelled (max open block ≤3 — passes). ✅ built.
7. **BOM:** all `[HAVE]`.

---

## 3. ASHEN MARSH — the W bog · bounds x238–278 / y293–327 (40×34) · **BUILT** (reconcile ground)

1. **PATHS:** the Belt empties onto the **bog approach** (E edge); a **boardwalk/causeway**
   threads between black-water pools to **Mirefen** (the stilt-village hub, ~x258,y310) then on
   to the **Sunken Shrine** (W, ~x244,y299). Channel = water pools + dead pines frame the
   causeway. `[HAVE: Dirt_Dark causeway; pines]`
2. **TERRAIN MASSES (⚑ reconcile per C2):** currently a **tint** on grass — should be the real
   biome ground: `Mud_Brown` base + `Grass_Dead` reed fringe + `Water`/`Water_Deep` black pools
   (dark-tinted) + `Water_Shallows_Dirt` margins. `[HAVE⚙ — wire the terrain-v7 sets to replace
   the green-tint]`
3. **LANDMARKS:** **Hagga's crooked hut** (silhouette, NW ~x247,y303) `[HAVE: house kit, tinted]`;
   **the Sunken Shrine spire** (W ~x244,y299) `[HAVE: structure/Dungeon Elements]`.
4. **SECRETS + TEASES:** **sunk caches in the black water** (grapple/looking) `[HAVE: prop_chest]`;
   **Pem-trail clue** (`pem_clue_marsh`). High-ledge nook → `tool_grapple`.
5. **ENCOUNTERS:** **LIVE combat** (first adult region) — 7 archetypes across the approach + deep
   mire; **Mirefen = no-aggro safe hub** (radius around Elder Yssa); the **Drowned Guardian boss**
   at the shrine (M9, lantern beat). `[HAVE: monster sheets]`
6. **DENSITY (~6.5 screens):** approach + mire = **wild 6–12** (pines/pools/reeds/enemies/caches);
   Mirefen = **town 15–25** (stilt huts/NPCs); deliberate lulls in open black water (≥3). ✅ (built;
   ground-tint → terrain-set is the reconcile item).
7. **BOM:** `[HAVE]` cast/combat/structures; `[HAVE⚙]` the bog terrain-v7 ground sets (de-tint).

---

## 4. SUNDERED PEAKS — the N mountains · bounds x288–348 / y218–278 (60×60) · **BUILT (defects to RECONCILE)**

> ⚑ **The reconcile region.** Built, but it violates two locked cohesion rules: **C2** (ground
> is stone-TINTED green grass, not a rock tile) and **C1** (cliffs are scattered single props,
> not a continuous autotiled face). This section is the FIX SPEC. Footprint is 60×60 inside the
> reserved 75×72 (278–353/206–278) — the **N headroom y206–218 is reserved for the Spire ascent**.

1. **PATHS:** the **Foothill route** (x303–333/y278–288) enters the **S mouth** (gap x303–333);
   rises through the **town terraces** (centre ~x318,y256) then forks at the **riven cleft**
   (pass ~x315–321, y232–242): **keep-road** N to **Cinder Keep** (~x318,y225) vs **quarry-road**
   E to the mine nook (~x336,y252). Channel = continuous cliff faces + ridges. `[HAVE⚙ cliff
   autotile; HAVE Dirt road]`
2. **TERRAIN MASSES (the fix):** **`Rock_Gray` scree** = the dominant slope ground (replaces the
   tinted grass, C2) `[HAVE⚙]`; **`Stone_Tan`/`Gravel_1`** town terraces `[HAVE⚙]`; **`Snow_1`**
   cap on the high N band (y218–230) bleeding toward the Spire `[HAVE⚙]`; **high-pass tarn** =
   `Ice`/`ice-shallows` (NW ~x294,y225) `[HAVE⚙]`; **cliff faces** = the eliza **cliff autotile
   set** assembled into continuous walls (the cleft + perimeter), NOT `prop_rock_crag` scatter
   (C1) `[HAVE⚙ — needs the cliff-autotiler]`.
3. **LANDMARKS:** the **riven cleft** ("Sundered", the silhouette) `[HAVE⚙ cliff set]`; the
   **terraced stone town** `[GAP: a true terraced-stone-town exterior set — currently cold-tinted
   brick houses stand in]`; **Cinder Keep** (looming N) `[HAVE: structure kit, dark]`.
4. **SECRETS + TEASES:** **quarry/mine nooks** (caches) `[HAVE: prop_chest]`; **high-pass tarn**
   island + **grapple ledges** = TEASE, payoff `tool_grapple` `[HAVE⚙]`; a vista of the **Spire**
   directly N `[GAP]`.
5. **ENCOUNTERS:** **LIVE** — 6 mountain archetypes on the scree slopes (Crag Ram/Order Revenant/
   Crag Archer/Stone Ogre/Storm Crawler/crag-bats); **town = no-aggro hub**; **Keep Sentinel boss**
   at Cinder Keep (M12 grapple beat — ⚑ boss-flow not yet in the overworld; grant taken at the
   Keep entrance for now). `[HAVE]`
6. **DENSITY (~17 screens):** town terraces = **15–25**; scree slopes = **8–12** (boulders/pines/
   enemies/caches); the cleft + keep approach framed by cliff walls (no bare run > 6×6). ✅ floor
   passes; the *cohesion* (C1/C2) is the fix.
7. **BOM:** `[HAVE⚙]` Rock_Gray + Snow_1 + Stone_Tan ground (wire terrain-v7), cliff autotile
   (wire the autotiler); `[GAP]` terraced-stone-town exterior set; `[HAVE]` cast/combat/keep.

---

## 5. TIDEWRECK COAST — the E sea · bounds x388–473 / y278–343 (85×65) · **RESERVED** (art hunt first)

1. **PATHS:** the **river-road** (x340–388/y298–323) follows the river E from GH; it bends
   through a **river-gorge** (the GRAPPLE gate, ~x380,y310) into the Coast; at the shore it
   **FORKS**: **beach-road** S to **Saltbreak harbour** (~x405,y330) vs **cliff-road** N to the
   **tide caves** (~x400,y288). Channel = the river (S) + a treeline/sea-cliff ridge (N). `[HAVE
   Dirt road; HAVE⚙ cliff for the gorge walls]`
2. **TERRAIN MASSES:** `Grass` inland fringe (W) → `Sand` beach/dune (centre) → `Water_Shallows_
   Sand` shore → `Water`/`Water_Deep` **OCEAN** (E, to the world edge ~x540) `[HAVE⚙ all in
   terrain-v7]`; **sea-cliffs** = eliza cliff autotile along the N headland `[HAVE⚙]`; the
   **river delta** (fresh→salt) at the river mouth ~x390,y315 `[HAVE⚙ Water_Shallows]`.
3. **LANDMARKS:** the **lighthouse** (N headland silhouette, ~x398,y285) `[GAP]`; the **great
   wreck on the reef** (offshore E, ~x440,y300) `[GAP]`; **Saltbreak harbour + docks** `[GAP:
   dock/pier set]`.
4. **SECRETS + TEASES:** **tide caves** = TEASE, payoff TIME(tide)+`tool_hookshot` (⚑ tide-timed
   water = [ENGINE], deferred); **message-in-a-bottle** (`pem_clue_coast`) on the beach; **cliff
   caches** (hookshot ledges). `[HAVE: prop_chest; GAP: bottle prop — or reuse a small item]`
5. **ENCOUNTERS:** **LIVE** coastal archetypes on the dunes/cliffs + reef approach; **Saltbreak =
   no-aggro harbour hub**; the **Drowned Vault** dungeon (M14, hookshot/tide) `[HAVE monster
   sheets; GAP: vault set-piece — Dungeon Elements partial]`.
6. **DENSITY (~27 screens — the biggest region):** Saltbreak = **15–25**; beach/dune + cliff
   roads = **8–12** (rocks/driftwood/caches/enemies); open **ocean** is a deliberate lull edge
   (≥3 — gulls/buoys/the wreck on the horizon) — flag the ocean band so it doesn't read as dead.
7. **BOM:** `[HAVE⚙]` Sand/Water/Shallows ground + sea-cliff autotile; `[GAP]` **lighthouse**,
   **shipwreck**, **dock/pier**, (driftwood/buoy/bottle minor props). **Art hunt these before the
   Coast build.**

---

## 6. EMBERWOOD — the S volcanic wood · bounds x288–363 / y363–433 (75×70) · **RESERVED** (art hunt first)

1. **PATHS:** the **ashen-road** (x308–338/y328–363) leaves GH S; the green **bleeds to ash +
   frost**; it crosses a **chasm** (the HOOKSHOT gate, ~x320,y360) into the wood; at the wood it
   **FORKS**: **burnt-village-road** to the **Caught Settlement** (~x315,y395) vs **deep-wood-road**
   to **Ember Hollow** (~x340,y410). Channel = ash ridges + frozen flows + chasm walls. `[HAVE
   Dirt road; HAVE⚙ cliff for chasm walls]`
2. **TERRAIN MASSES:** `Earth_Cracked`/`Rock_Black` **ash ground** (base) `[HAVE⚙]`; **`Lava`
   flows** (the fire half, glowing) `[HAVE⚙]`; **`Snow_2`/`Ice`/`Ice_Melting` frost half** (the
   opposition) `[HAVE⚙]`; `Grass_Dead` burnt fringe. The fire/frost split is the signature read
   (half-burnt/half-frozen). `[HAVE⚙ terrain-v7]`
3. **LANDMARKS:** the **volcano cone + lava-glow** (S silhouette, ~x325,y430) `[GAP: volcano cone
   silhouette]`; the **half-burnt half-frozen settlement** (the Caught Settlement) `[HAVE houses;
   GAP burnt/frosted variants]`; the **Weeping Tree** `[GAP: a distinct tree prop — or recolour]`.
4. **SECRETS + TEASES:** **ashen relics** + **firefrost nooks** = TEASE, payoff `tool_firefrost`
   (burnt-thicket / frozen-flow) `[HAVE prop_chest]`; **`pem_clue_emberwood`** (the 4th Pem clue).
5. **ENCOUNTERS:** **LIVE** fire/frost archetypes (use `lpc-magic` fire/ice FX) on the flows;
   **the Caught Settlement = a fraught hub** (the no-win beat); **Ember Hollow** dungeon (M16,
   firefrost + the permanent decision). `[HAVE monster sheets + FX]`
6. **DENSITY (~25 screens):** settlement = **15–25**; ash/frost wilds = **8–12** (burnt trees/
   lava cracks/frozen flows/relics/enemies); lava fields = deliberate hazard-lulls (≥3, but
   ⚑ lava-as-hazard = [ENGINE], cosmetic-only for now).
7. **BOM:** `[HAVE⚙]` Lava/Ash/Frost ground + fire/ice FX; `[GAP]` **volcano cone**, **burnt
   trees** (recolour `trees_winter`?), Weeping Tree, frosted-house variants. **Art hunt before
   the Emberwood build.**

---

## 7. HOLLOW SPIRE — the far-N endgame · bounds x303–338 / y152–202 (35×50) · **RESERVED** (art hunt first)

1. **PATHS:** the **gated ascent** — the single forced corridor (the one sanctioned chokepoint,
   §2.5) — climbs from the Peaks N headroom (y206–218) through the **ascent band** (y202–206)
   into the Spire; a **long-ascent gauntlet** switchbacks up to the **summit** (~x320,y158).
   Channel = sheer snow/ice cliffs on both sides (no fork — deliberate). `[HAVE⚙ cliff_winter]`
2. **TERRAIN MASSES:** `Snow_1`/`Snow_2` ice-cap base; `Ice`/`Ice_Melting` glaze; `Rock_White`
   high stone; **`cliff_winter`** snow-capped faces walling the gauntlet. `[HAVE⚙ terrain-v7 +
   eliza cliff_winter]`
3. **LANDMARKS:** **the Spire itself** (the global vista, the tower silhouette, ~x320,y160)
   `[GAP: a tall tower/spire structure]`; the **oracle sanctum** (interior) `[HAVE⚙ eliza-structure
   interiors]`; the **Binding Chamber** `[GAP/partial: Stone Slab / Wolf Stone / Dungeon Elements
   for the altar]`.
4. **SECRETS + TEASES:** the **long-ascent gauntlet** itself (the over-built challenge); **shard_5
   at the summit** (the whole-game culmination). Minimal off-path secrets (endgame is linear).
5. **ENCOUNTERS:** **LIVE** — the toughest gauntlet enemies; **the Binding Chamber boss** (M19,
   the brutal over-built fight → `shard_5`); the oracle sanctum = a brief safe beat. `[HAVE monster
   sheets; the boss reuses the archetype+trick+twist pattern]`
6. **DENSITY (~8 screens):** the gauntlet is **deliberately sparse-but-lethal** (wild 6–12, but
   weighted to encounters not props — a frozen, austere place); the sanctum = a single dense beat.
   ⚑ Note: this is the one region where "lull" is the *aesthetic* (austere ascent) — keep ≥3 but
   lean on encounters + the Spire vista for legibility.
7. **BOM:** `[HAVE⚙]` Snow/Ice ground + cliff_winter; `[GAP]` **spire/tower structure**, **altar/
   binding-chamber set** (partly from Stone Slab/Dungeon Elements). **Art hunt before the Spire build.**

---

## 8. CONSOLIDATED ASSET GAP LIST — what to source before which region

> *Wire-not-source items (terrain-v7 ground autotiles + the eliza cliff autotile) are `[HAVE⚙]`
> — they need an autotiler/bake PASS, not a hunt; see `PEAKS-ART-CANDIDATES.md`. The list below
> is true `[GAP]` sourcing, to the locked 32px LPC standard (`QUALITY-SPEC §0.3`).*

| Before building… | Must source `[GAP]` | Notes |
|---|---|---|
| **Peaks re-fix** (next) | terraced stone-town **exterior** set | + wire Rock_Gray/Snow/cliff (HAVE⚙) — that's the main fix |
| **Tidewreck Coast** | **lighthouse**, **shipwreck**, **dock/pier** set (+ driftwood/buoy/bottle minor) | terrain (sand/ocean/shallows/sea-cliff) all HAVE⚙ |
| **Emberwood** | **volcano cone** silhouette, **burnt trees**, Weeping Tree, frosted-house variants | lava/ash/frost ground + fire/ice FX all HAVE⚙ |
| **Hollow Spire** | **spire/tower** structure, **altar / binding-chamber** set | snow/ice/cliff_winter all HAVE⚙; altar partly from Stone Slab/Dungeon Elements |
| **Cross-cutting** (any region) | **animals/critters**, **crop growth-stages**, **outdoor bench**, **tool held-items** (lantern/grapple/hookshot/firefrost held sprites + their world FX) | living-world + tool-feedback; not region-blocking but flagged |
| **Global** | **Spire-vista silhouette** (visible N everywhere) | same asset as the Spire structure, used as a distant billboard |

**Engine-deferred (not art):** tide-timed water (Coast tide caves), lava-as-hazard (Emberwood),
the Peaks Keep-Sentinel boss-flow into the overworld, true verticality/climb. Tag, don't fake.

---

## 9. CONTRADICTIONS FLAGGED (reconcile, not overridden)
1. **Peaks built ≠ reserved + cohesion defects:** built 60×60 (288–348/218–278) inside the
   reserved 75×72; ground is stone-TINTED grass (violates C2) and cliffs are scattered props
   (violate C1). **This doc's §4 is the fix spec** (rock terrain set + cliff autotiler). The N
   headroom y206–218 stays reserved for the Spire ascent.
2. **Stale crossroads coords:** WORLD-BLUEPRINT §2 puts the Crossroads/waystone at "x200 y153"
   (pre-recentre A-coords). Corrected here to **x330,y298** (NE of the live GH plaza). Blueprint
   §1 ASCII is likewise old-A; the §1 *table* (live B) is authoritative.
3. **Marsh ground is a tint, not a terrain set:** works visually but violates C2 — flagged in §3
   to wire `Mud_Brown`/`Grass_Dead`/`Water` sets in a reconcile pass.
4. **Living-world assets absent:** animals/crops/bench in the WORLD-BIBLE/Part-2.6 intent have no
   conforming asset yet (§8 cross-cutting) — regions are specced without them; add when sourced.
5. **Engine prerequisites** (tide/lava-hazard/climb/overworld-boss) are referenced but **not**
   promised as physical-now — tagged [ENGINE], deferred to their own sessions.

*Cross-links: WORLD-BLUEPRINT.md (locked coords/paths/gating — this fleshes it) · QUALITY-SPEC.md
(the locked 32px standard + density bands + C1–C5 this conforms to) · ASSET-MANIFEST.md (the
HAVE/GAP source of every BOM verdict) · WORLD-STRUCTURE-DESIGN §2.1b/2.4/2.5/2.6 · PEAKS-ART-
CANDIDATES.md (the wire-not-source path for terrain/cliff) · gating.js (the DAG). The STORY/QUEST
overlay (where M1–M20 + side quests + the gate set-pieces sit on this map) = **Layer 2b, next
session.** Doc-only; no code/SSOT touched.*
