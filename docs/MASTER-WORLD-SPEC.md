# MASTER WORLD SPEC — the SSOT (every place · contents · connections · progression)

> **The authoritative world design the build references.** The content (66 quests · 30+ NPCs · items ·
> systems) ALREADY EXISTS; this specs the WORLD that holds it, completely. **DESIGN ONLY — supersedes**
> `WORLD-GRAPH` · `WORLD-SCALE-DOD` · `WORLD-MAP-PLAN` (reconciled below); the existing game is preserved
> (`pre-world-layout`). **Visual: `docs/master-world-map.png`** (from `gen-master-world.mjs` — the node/
> edge data there IS this spec). Overworld **24×24 chunks = 768×768 tiles**, GH centred (chunk 12,12);
> cities/dungeons/interiors are **separate enterable scenes** (Phase-0 door system). 32px tiles.

## 0.5 🔒 LOCKED — VAN'S EDITED MAP IS THE SOURCE OF TRUTH (imported 2026-06-10)
Imported `docs/world-map-vanedit.json` (the editor export). **Van's node moves, music zones, elevation,
path traversal + widths are AUTHORITATIVE — the spec is reconciled TO them.** His changes:
- **Node positions (locked):** shrine → chunk (5.5,10) [moved N], Mirefen (4,12.5), Dustreach (21.5,18.5),
  Fenwick (7.5,13.5), Cragfoot (9,7), High Pass (15,7.5), Weeping Tree (9,20); all others as before.
- **NEW place — "The Lost Cemetery"** (village, **30×24**, chunk ~(6.2,7.4), NW mountain/bog transition):
  a graveyard — buildable from `lpc-medieval-decorations` (grave markers) + `lpc-statues-fountains`.
  *Home it: a somber side-area (a night/eerie cameo + a Pem-mark or a grief vignette — Van to flesh).*
- **Per-settlement MUSIC + ELEVATION (Van set):** GH `mus_green` elev+1; Mirefen `marsh-dread` elev−1;
  Saltbreak `storm-surf` elev 0; Oracle Capital + Spire `sacral`. **+14 music zones drawn** (per-
  settlement radii) **+ 2 terrain zones: "dark forest"** (chunk ~6.6,14.8, 8×8 — SW of Mirefen) and
  **"mountain streams"** (~4.4,4.9 — NW). Ocean E, Mountains N, Bog W, Forest/Desert SE as before.
- **PATH traversal (Van set — AUTHORITATIVE):** GH↔Mirefen a **wide winding road** (width 3, 5 bends);
  **Mirefen↔Fenwick = ⚡electric**; **Thornwell↔Dustreach = ❄ice**; **Saltbreak↔Lighthouse = 🌀wind**;
  **+ NEW Shrine↔Cragfoot = 🔥fire** and **Cragfoot↔GH = 🔥firefrost** (a late-tool alt loop GH↔Marsh
  via Cragfoot). GH↔Stonereach + GH↔Saltbreak gained a bend each.
- **FLAGS for Van (the only conflicts):** Van's traversal makes two SIDE spurs single-route + late-gated:
  **Fenwick is now ⚡electric-only** (its Pem-mark/SG2 clue + side content become late-game) and
  **Lighthouse is 🌀wind-only** (ST3 becomes late). Neither is on the critical path → **no soft-lock**,
  but the side content shifts later — *Van's call to keep or add an early walk-spur.* Everything else
  fits with no soft-lock (see §5 + BUILD-PLAN cross-check).

## 1. EVERY PLACE × CORRECT SIZE × POSITION
⇲ = separate scene. Sizes derived from content load; reconciles `WORLD-MAP-PLAN` (full sizes) — the
just-built greybox used **halved** placeholders (Saltbreak 56×40 etc.), noted where it differs.
| Place | Tier | Tiles (SSOT) | Chunk pos | Region |
|---|---|---|---|---|
| **Saltbreak** ⇲ | city | **120×96** (greybox 56×40) | (19,12) E | Coast |
| **Oracle Capital** ⇲ | city | **104×88** | (12,2) far-N | Spire |
| **Stonereach** ⇲ | city | **96×80** | (12,6) N | Peaks |
| **Greenhollow** | town | **64×52** | (12,12) centre | Greenhollow |
| **Caught Settlement** | town | **56×44** | (12,17) S | Emberwood |
| **Mirefen** | town | **44×36** | (4,12) W | Marsh |
| **Thornwell · Dustreach** | village | 34×28 · 32×26 | (17,17)·(21,21) SE | Forest·Desert |
| **Fenwick · Cribbins Cove · Cragfoot** | village | 28×24 ·28×24 ·26×22 | (7,14)·(17,15)·(9,5) | Marsh·Coast·Peaks |
| **The Hollow Spire** ⇲ | dungeon | 44×36 ×4F | (14,1) | Spire |
| **Cinder Keep** ⇲ | dungeon | 40×32 ×3F | (15,5) | Peaks |
| **Ember Hollow** ⇲ | dungeon | 38×30 ×2F | (12,20) | Emberwood |
| **Sunken Shrine** ⇲ | dungeon | 36×28 ×3F | (3,15) | Marsh |
| **Drowned Vault** ⇲ | dungeon | 36×30 ×2F | (22,15) | Coast |
| **High Pass · Boarded Cave · Weeping Tree** | secret | 20×16 ·16×12 ·14×12 | (15,7)·(14,11)·(9,19) | Peaks·GH·Emberwood |
| **Lighthouse** ⇲ | landmark | 18×14 ×3F | (18,9) | Coast |
**20 mapped places** (+ minor caches/teases). **Total authored area** ≈ 768² overworld + 3 cities
(multi-district) + ~10 dungeons (×2-4F) + ~30-50 interiors = **~55-70 separate scenes**.

## 2. PER-PLACE CONTENTS MANIFEST (who/what lives there) + the cross-check
| Place | NPCs (incl. standouts) | Quests | Items/loot | Enterable buildings (→ interiors) |
|---|---|---|---|---|
| **Greenhollow** | Mara, Bram, Hodge, Tam, Phil McCracken, Fatley, Pem, **Constable Wiremu** (jandal-cop, CAM7), Ben Dover/Dixie (GAG1), Old Sisyph (CAM2) | M1-M7 · SG1-7 · GHUB · PH3/PH6 | wooden→steel sword, leather, potions, 3 caches | Tankard(+upstairs) · Pem's Store · Forge · Chapel · Manor · 2 homes (**7 built**) |
| **Mirefen / Marsh** | Elder Yssa, **Hagga** (exiled oracle), Old Karl (CAM4), Mother Vell (PH5) | M8-M10 · SA1-5 · PH5 · NIGHT1 | lantern (M9) · shard 1 · epic blade (SA3) | Yssa's longhouse · Hagga's hut · (Shrine ⇲) |
| **Sunken Shrine** ⇲ | Drowned Guardian (boss) | M9 · SA3 crypts | **lantern** · **shard 1** | 3 floors + crypts |
| **Stonereach / Peaks** | Miner, **Mike Hunt**, Stonewright, Bounty-Master, **Lord Pellamy** (CAM1 mansion), Desperate Stranger (SP5) | M11 · SP1-5 · PH1 (the cart) | grapple (M12) · shard 2 · Crag Maul · sky-iron charm | town hall · mine office · Order seat · **Marble Hall** (CAM1) ⇲ |
| **Cinder Keep** ⇲ | Keep Sentinel (boss) | M12 · SP1 records | **grapple** · **shard 2** · records-library | 3 floors |
| **Saltbreak / Coast** | **Hugh Jass**, Harbourmaster, Holden McGroin (ST3), Big Sal/Widow Gusset (EDG1), Shy Fisher (EDG2), Old Crannock (PH2), **General Petibon** (CAM3) | M13-M14 · ST1-5/ST8 · PH2 · EDG1/2 | hookshot (M14) · shard 3 · Tideglass Blade · pearl circlet | docks · market · tavern · underworld · a **mansion** · **Lighthouse** ⇲ |
| **Drowned Vault** ⇲ | Tideward (boss) | M14 · ST2 tide-caves | **hookshot** · **shard 3** | 2 floors (tide-timed) |
| **Caught Settlement / Emberwood** | Settler, Elder Ash (PH4), **Vinizar the Glad** (CAM6) | M15-M16 · SE1-5 · PH4 | fire/frost (M16) · shard 4 · Emberfrost Band · Cinderhide Cloak | settlement halls · (Hollow ⇲, Weeping Tree) |
| **Ember Hollow** ⇲ | Feverheart (boss) | M16 · SE3 relics | **fire/frost** · **shard 4** | 2 floors + the split altar |
| **Oracle Capital / Spire** | **Sela** (the oracle), librarians/clergy | M17 · the civic/ancient-texts depth | (lore/keys) | libraries · temples · the oracle precinct · housing |
| **The Hollow Spire** ⇲ | Warden of the Binding (boss) · the kicked **CHICKEN** (M18) | M18-M20 (finale, 5 endings) | **shard 5** | 4 floors: Ascent · Binding Chamber |
| **Villages (Fenwick/Cribbins/Cragfoot/Thornwell/Dustreach/Oasis)** | local folk · **the gunhand / ninja-gran standouts** (Forest) · the **Wanderer** (CAM5, roams all) | side/cameo infill · the Pem-marks (SG2) | minor loot · the SG2 reward | a shop/inn each (1-2 ⇲) |
**CROSS-CHECK — every quest/NPC/cameo HOMED:** M1-20 ✅ · all SG/SA/SP/ST/SE ✅ · PH1-6 ✅ · CAM1-7 ✅
· EDG1/2·GAG1·NIGHT1 ✅ · 30+ NPCs ✅ · standouts (Wiremu/gunhand/ninja-gran/the Frog/Weeping Tree) ✅ ·
the 4 tools + 5 shards + the gear/relics ✅. **Nothing unplaced.**

## 3. EVERY CONNECTION — traversal + path-length + gate
Path-length in overworld tiles (min/avg/max over the forking routes). Traversal = the *means*.
| From ↔ To | Traversal means | Length (min/avg/max) | Gate (ability AND/OR story) |
|---|---|---|---|
| GH ↔ Mirefen | **walk** (West Belt) | 18/26/34 | — (open from start) |
| GH ↔ Boarded Cave | **lantern** (dark) | 6/8/10 | 🔒lantern |
| Mirefen ↔ Sunken Shrine | walk → **lantern** inside | 10/14/18 | story M8 |
| GH ↔ Stonereach | **walk** (Foothill) | 28/34/42 | 🔒shard_1 (rockfall) + story M10 |
| GH ↔ Saltbreak | **grapple** (river-gorge) | 30/38/48 | 🔒grapple |
| Stonereach ↔ High Pass | **grapple** (spire-climb) | 8/12/16 | 🔒grapple |
| GH ↔ Caught Settlement | **hookshot** (ashen chasm) | 26/32/40 | 🔒hookshot |
| Saltbreak ↔ Drowned Vault | **hookshot** (tide-timed) | 10/14/20 | 🔒hookshot + tide window |
| Stonereach ↔ Saltbreak | **grapple ridge** (a 2nd inter-region route) | 24/30/38 | 🔒grapple |
| Stonereach ↔ Oracle Capital ↔ Spire | **firefrost** + all 4 shards (the ascent) | 16/22/30 | 🔒firefrost + 4 shards + story M17 |
| Caught ↔ Ember Hollow | walk → **🔥 fire-melt** the ice-seal | 8/10/14 | story M15 |
| **⚡ GH ↔ Stonereach N-gate** | **electric-switch** opens a direct N gate | 14/14/14 (shortcut) | electric spell |
| **❄ GH ↔ Saltbreak foot** | **ice-freeze** the river → walk across | 22/22/22 (shortcut) | ice spell |
| **🌀 Saltbreak ↔ Thornwell** | **wind-gap** / **cut** the overgrowth | 12/16/22 | wind spell OR cut |
| **🪵 Saltbreak ↔ Caught** | **repaired bridge** (a side-quest) | 20/24/30 | story (bridge quest) |
| villages ↔ their region hub | **walk** (short spurs) | 4/8/12 | — / region's gate |
Also world-wide: **cut-bush** clears foliage shortcuts everywhere; **dash** crosses small gaps; the
**Wanderer (CAM5)** roams all regions (spawn-gated).

## 4. PROGRESSIVE INTERCONNECTION (the key — the world OPENS UP as the toolkit grows)
Each major place has **2-3 routes** that unlock across the progression — the *same overworld* reveals
new links as abilities/story arrive (not a linear chain).
| Place | EARLY route (walk/lantern/cut/dash) | MID route (grapple/hookshot) | LATE route (firefrost/spells/story) |
|---|---|---|---|
| **Greenhollow** | hub — open | grapple→Coast · hookshot→Emberwood | ⚡N-gate→Peaks · ❄river→Coast (2nd routes) |
| **Stonereach (Peaks)** | Foothill walk (shard_1) | grapple ridge ↔ Saltbreak (2nd) · High Pass | ⚡ direct from GH · firefrost→Capital |
| **Saltbreak (Coast)** | — (locked early) | grapple gorge (1st) · hookshot vault | ❄ foot-crossing (2nd) · 🪵 bridge→Caught · 🌀→Forest |
| **Caught (Emberwood)** | — | hookshot chasm (1st) | 🪵 bridge from Saltbreak (2nd) · 🔥 Hollow |
| **Oracle Capital/Spire** | — | — | firefrost + 4 shards (the finale gate) |
| **Forest/Desert (exp)** | — | — | 🌀 wind / cut from Saltbreak → Thornwell → Dustreach |
**Network evolution:** EARLY = GH + Marsh + the Foothill spur (a small open loop). MID = grapple+hookshot
fan out to Coast, Peaks-interior, Emberwood (the world ~triples). LATE = spells + story bridges add
**second/third routes + shortcuts** (electric N-gate, ice river-crossing, the repaired bridge, the
wind/forest link) → a **richly interconnected web**, plus the Spire finale. *Backtracking with new tools
reveals new links in old regions* (the metroidvania promise).

## 5. ACCESSIBILITY ORDER (unlock per place · no soft-locks)
GH (start) → **Marsh** (walk) → earn **lantern** (Sunken Shrine) + **shard 1** → **Peaks/Stonereach**
(shard_1 gate) → earn **grapple** (Cinder Keep) + **shard 2** → **Coast/Saltbreak** (grapple) → earn
**hookshot** (Drowned Vault) + **shard 3** → **Emberwood/Caught** (hookshot) → earn **fire/frost**
(Ember Hollow) + **shard 4** → **Oracle Capital → Spire** (firefrost + 4 shards) → **finale (shard 5)**.
The **spells** (fire/ice/wind/electric) are earned alongside and **open the 2nd/3rd routes + the
Forest/Desert expansion** (optional, not on the critical path). **Reconciles `gating.js`** — the
critical spine is the same acyclic key-before-lock DAG (verify's no-soft-locks gate); the progressive
routes are **additive** (every place still reachable by its 1st route, so adding shortcuts can't soft-
lock). **Confirmed: valid order, no soft-locks, and progressively MORE interconnected.**

## 6. EXPLORATION SPACE (real roaming between places)
The overworld 768×768 holds the settlement exteriors + **open-world swaths between** them:
- **Region wilds:** each region's settlement sits in ~120-160-tile wilds (≈ a 4-5 chunk band) — room to
  roam, not corridors. **Between-region connectors:** ~40-70 tiles wide, **forking** (2-3 branches each).
- **Populated by:** placed encounters (the per-region difficulty tier), **secrets** (caches · the Fen/Frog
  · High Pass · Weeping Tree · tide-caves · the Pem-marks), **landmarks** (the Lighthouse · Marble Hall ·
  the waystones), and the roaming **Wanderer**. The new routes (§4) thread *through* these swaths.
- **Total derived dimensions:** **OVERWORLD 768×768 tiles (24×24 chunks)** + **~55-70 separate scenes**
  (3 cities multi-district + ~10 dungeons ×2-4F + ~30-50 interiors). Streaming-feasible (proven).

## 7. CROSS-CHECK MATRIX (the spec × everything)
| Facet | Greenhollow | Marsh | Peaks | Coast | Emberwood | Spire | Forest/Desert |
|---|---|---|---|---|---|---|---|
| **Quests** ✅ | M1-7·SG | M8-10·SA·PH5 | M11-12·SP·PH1·CAM1/3 | M13-14·ST·PH2·EDG | M15-16·SE·PH4·CAM6 | M17-20 | exp side |
| **NPCs/standouts** ✅ | cast + Wiremu | Yssa/Hagga/Karl | Pellamy/Mike Hunt | Hugh/Petibon | Vinizar/Ash | Sela | gunhand/ninja-gran/Wanderer |
| **Monsters / PLACED difficulty** | tutorial (safe hub) | **t1** drowned/bog | **t2** crag/sentinel | **t3** tideward/wraith | **t4** ember/frost | **t5** Warden/fused | mid-tier infill |
| **Combat / skills / abilities** | sword·dash·safe-zone | lantern·Frog-puzzle | grapple·safe-ring | hookshot·tide | firefrost·split | 4-tool gauntlet | spell-gated optional |
| **Audio mood** (EXCELLENCE) | pastoral ✅`mus_green` | dread/wet 🟠 | cold-stone/wind 🟠 | storm-surf 🟠 | fire-vs-frost 🟠 | sacral/vast 🟠 | forest-calm/desert 🟠 |
| **Assets HAVE→GAP** | LPC+terrain+7 interiors ✅ (furniture GAP) | bog partial 🟠 | stone/snow GAP 🔴 | coast/ocean GAP 🔴 | fire/frost GAP 🔴 | spire/sacral GAP 🔴 | forest HAVE/desert GAP 🔴 |
**Result:** every facet fits — quests/NPCs homed ✅; the **placed difficulty curve maps tier 1→5 onto the
geography** ✅; combat/abilities/safe-zones/the spell-gated routes fit ✅; **audio designed, only GH
recorded** 🟠 (per-region scoring pass); **assets are the dominant GAP** 🔴 (most biome terrains + dungeon
tilesets + interior furniture + standout NPCs — a **major licence-vetted sourcing workstream**).

## 8. RECONCILE / SUPERSEDE / FLAGS
- **Supersedes** WORLD-GRAPH (no sizes/contents) · WORLD-SCALE-DOD (audit) · WORLD-MAP-PLAN (no contents/
  progression). This adds **the full per-place contents manifest + the connection/traversal/gating table
  + the progressive-interconnection design** = the complete SSOT.
- **vs the greybox build:** the build used **halved** placeholder sizes (Saltbreak 56×40) + clustered
  doors; the SSOT sizes (Saltbreak 120×96) + distributed-on-overworld connections are the **build
  target** — the greybox is a walkable proof, not the final scale.
- 🟠 **Forest/Desert + the spell-routes are not yet in `gating.js`** — **[D-geo / D-spell]** to add (as
  optional/secret edges; the critical spine is unchanged + already verified).
- 🔴 **Assets** = the big flag (cross-check row 6).

## ✅ SUMMARY (what Van approves)
- **Spec + map** (`master-world-map.png`): 20 places at **true relative scale**, connections **labelled by
  traversal + gate** and **coloured by progression stage** (early/mid/late) — the world **opens up** as the
  toolkit grows (each place 2-3 routes).
- **Sizes** (§1): cities 96-120 · towns 44-64 · villages 26-34 · dungeons 36-44/floor ×2-4F. **Total:
  768×768 overworld + ~55-70 separate scenes.**
- **Contents** (§2): every quest/NPC/cameo/item HOMED — nothing unplaced. **Connections** (§3) + **
  progression** (§4) + **accessibility** (§5, no soft-locks, progressively interconnected) + **roaming
  space** (§6) + **cross-check** (§7: quests/NPCs/difficulty/combat ✅, audio 🟠, assets 🔴).
- **[DECISIONS]:** approve the SSOT sizes + the progressive-route design + the 768×768 dimension · rule
  **D-geo/D-spell** (adopt Forest/Desert + spell-routes into gating) · greenlight **asset sourcing**.
