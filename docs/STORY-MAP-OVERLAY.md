# EMBERFALL 2 — STORY MAP OVERLAY (M1–M20 + sides + cameos placed on the world)

> **Integrated master design — Layer 2b (NARRATIVE).** The story/quests already exist as
> DATA (`src/data/quests/*`); this places them SPATIALLY onto the physical `MASTER-MAP.md`
> (2a) and **validates the journey is walkable** — every quest reachable when the story sends
> you, no soft-locks. **This PLACES the existing story; it does not redesign it.** It must agree
> with `gating.js` (the machine-checked DAG) — conflicts are flagged, not overridden. Doc-only.

### How to read this
- **Spots** are the `MASTER-MAP.md` (2a) landmarks/hubs, in **world tiles** (32px grid).
- **Givers** are the actual NPCs in the quest data; **`[self]`** = a dungeon/set-piece entered
  (no giver). **Gate-in** = the `requires` that makes it available; **Earns** = tool/shard/deed.
- All givers sit in **safe hubs / roads** (cross-ref 2a encounter zones) unless a narrative
  reason puts them in danger (tagged). Source of placement truth: the quest data + 2a + `gating.js`.

---

## 1. THE CRITICAL PATH AS A WALKED ROUTE (M1–M20)

The player physically walks **GH → (W) Marsh → (N) Peaks → (E) Coast → (S) Emberwood → (far-N)
Spire** — a loop out from the hub, each region's tool unlocking the NEXT region's entry.

| # | Quest | Region · spot (world tile) | Giver | Gate-in (`requires`) | Earns |
|---|---|---|---|---|---|
| M1 | A Greenhollow Morning | GH · plaza/home (x314,y308) | Mara, Bram | — (boot) | wooden_toy; greeted_warmly/kept_to_self |
| M2 | Chores + Mischief | GH · hen yard (x330,y320 farm) | Mara, Tam | M1 | **chicken_kicked** seed (locks SG7) |
| M3 | The Coin | GH · lane (x322,y312) | Phil McCracken | M2 | coin_returned/kept/gifted |
| M4 | The Boarded Cave | GH · **boarded cave** (x308,y290) | Tam | M3 | **cave_lore** (secret-ending seed) |
| M5 | The Festival | GH · plaza + chapel (x316,y296) | Mara, Oracle, Hearthflame | M4 | festival_keepsake |
| M6 | The Night It Burned | GH · village→ash | Sela | M5 | **grief_vow / grief_vengeance**; time-skip |
| M7 | Ten Winters Gone | GH · return to plaza | Sela, Hodge | M6 | **wooden_sword**; sela_trusted/doubt; opens hub |
| M8 | Into the Ashen Marsh | Marsh · Mirefen (x258,y310) | Elder Yssa, Hagga | M7 | bogfolk_kind/cruel; opens Mirefen |
| M9 | The Sunken Shrine | Marsh · **Sunken Shrine** (x244,y299) | [self] (Drowned Guardian) | M8 | **tool_lantern + shard_1** |
| M10 | Hagga's Truth | Marsh · Hagga's hut (x247,y303) | Hagga | M9 | **PERM 1**: hagga_believed/reported/silent |
| M11 | The Sundered Peaks | Peaks · stone town (x318,y256) | Stonewright, Miner | M10 + **shard_1** (rockfall gate) | lean_workers/owner; opens town |
| M12 | Cinder Keep | Peaks · **Cinder Keep** (x318,y225) | [self] (Keep Sentinel) | M11 | **tool_grapple + shard_2**; order_chose_lie |
| M13 | The Tidewreck Coast | Coast · Saltbreak (x405,y330) | Harbourmaster | M12 + **tool_grapple** (river-gorge) | lean_smugglers/authority |
| M14 | The Drowned Vault | Coast · **Drowned Vault** (~x430,y300) | [self] (Tideward) | M13 + TIME:tide ⚑ | **tool_hookshot + shard_3**; vault_betrayal |
| M15 | The Emberwood | Emberwood · Caught Settlement (x315,y395) | Settler | M14 + **tool_hookshot** (chasm) | emberwood_reached |
| M16 | Ember Hollow | Emberwood · **Ember Hollow** (x340,y410) | [self] (Feverheart) | M15 | **tool_firefrost + shard_4**; **PERM 2**: mercy_shown/god_seized/god_taken |
| M17 | Sela's Design | Spire approach (ascent y206–218) | Sela, Hagga | M16 | **PERM 3**: sela_trusted/opposed/alone |
| M18 | The Long Ascent | Spire · gauntlet (switchbacks y202→165) | [self] (echoes) | M17 + **all 4 tools** | ascent_mercy/cruel; **the kicked chicken returns** |
| M19 | The Binding Chamber | Spire · **Binding Chamber** (x320,y160) | [self] (Warden of the Binding) | M18 | **shard_5** (5/5) |
| M20 | The Choice | Spire · summit (x320,y158) | [self] | M19 + **4 shards + firefrost** (Spire gate) | **ending_[W/S/T/L/A]** + ET1–12 |

**Tool→next-region lock (matches `gating.js`):** lantern(M9)→ unused for entry but powers SA3/
crypts · grapple(M12)→ **opens Coast** (gorge) · hookshot(M14)→ **opens Emberwood** (chasm) ·
firefrost(M16)+4 shards→ **opens Spire**. shard_1(M9)→ **opens Peaks** (the Marsh-truth rockfall).

---

## 2. PER-REGION OVERLAY (mains + sides + PH + cameos)

### 2.1 GREENHOLLOW (hub — safe) · M1–M7 · SG1–7 · GHUB · PH3 · PH6 · CAM2/CAM7 · GAG1
*Act-1 childhood plays as bounded vignettes around the plaza; Act-2 sides open after M7.*

| Quest | Spot | Giver | Trigger / gate |
|---|---|---|---|
| SG1 Fazy Lastard's Mug | quiet bench off the plaza (x322,y314) | Fazy Lastard (sitting, "?" marker) | M7; **GATE-D marker tutorial** → skill_see_markers |
| SG2 PEM WOZ ERE | the Crossroads waystone (x330,y298) | Pem (note) | M7 + **all 4 pem_clue_* deeds** → pem_found (ET9) |
| SG3 Hodge's Apprentice | the forge (x336,y304) | Hodge | M7 → skill_repair_discount |
| SG4 Mara's Letters | Mara's cottage (x310,y302) | Mara | M7; reactive to **drowned_letter** (SA5) |
| SG5 The Tankard Songs | the tavern (x326,y310) | Wayne Kerr, Amanda Hugginkiss | M7 → tavern_songs |
| SG7 The Orchard Thief | SE orchard (x334,y322) | Orchard Kid | M7; **LOCKED if chicken_kicked** (M2) |
| GHUB The Village Remembers | plaza (route-reactive) | villagers | M7; reads 4 childhood deeds → hub_reconnected |
| PH3 Grandfather's Axe | the forge yard (x336,y306) | Hodge, Cousin Ruck | M7 (hub) |
| PH6 Buridan's Mule | the stable/cart (x328,y320) | Seymour Butz | M7 (hub) |
| CAM2 The Stone That Won't Stay | a hill path off the ring road (x320,y294) | Old Sisyph | Act 2 |
| CAM7 Blow on the Pie | the bakery (x318,y310) | Baker, Constable Wiremu | Act 2 → meat_pie |
| GAG1 Roadside Wit | a signpost on the W trailhead (x290,y308) | Ben Dover, Dixie Normous | Act 2 |

**Encounter check:** GH is `safeZone` — every giver safe. ✅

### 2.2 ASHEN MARSH (combat; Mirefen = safe hub) · M8–M10 · SA1–5 · PH5 · CAM4 · NIGHT1

| Quest | Spot | Giver | Trigger / gate |
|---|---|---|---|
| SA1 Bog-Folk Troubles | Mirefen hub (x258,y310) | Elder Yssa | M8 **bogfolk_kind** → bog_troubles + **pem_clue_marsh** |
| SA2 Hagga's Errands | Hagga's hut (x247,y303) | Hagga | M8 kind + **notDeeds:[hagga_reported]** → hagga_ally_plus |
| SA3 The Sunken Dead | flooded crypts, deep mire (x250,y316) | [self] | **requires tool_lantern** (M9) — the in-region lantern loop |
| SA4 Frog of the Fen | a fen pool (x266,y318) | [self] | M8; TWIST (no-kill puzzle) → frog_trophy |
| SA5 Drowned Letters | a drowned body, black water (x254,y322) | [self] | M8 → **drowned_letter** (carry to Mara, seeds SG4) |
| PH5 The Experience Stone | a still tarn off Mirefen (x262,y306) | Mother Vell | M8 (hub-adjacent) |
| CAM4 Stardust | the Mirefen boardwalk at dusk (x256,y308) | Old Karl | Act 2 |
| NIGHT1 Things in the Dark | bog approach (x270,y312) | [self encounter] | **requires phase:night** → night_thing_met |

**Encounter check:** givers in Mirefen/hut (safe ring); SA3/4/5/NIGHT1 are self-triggered set-
pieces in the live mire (intended — they ARE the danger). ✅

### 2.3 SUNDERED PEAKS (combat; stone town = safe hub) · M11–M12 · SP1–5 · PH1 · CAM1
*(reconcile region — see MASTER-MAP §4; placement unaffected.)*

| Quest | Spot | Giver | Trigger / gate |
|---|---|---|---|
| SP1 The Order's Records | the records table, town (x322,y254) | [self] | M11 → order_records + **pem_clue_peaks** |
| SP2 Bounty: Crag Beast | town board → high crags (x336,y230) | Bounty-Master (town) | M11 → crag_beast_slain |
| SP3 The Stubborn Miner | town (x320,y258) | Mike Hunt, Miner | M11 → faction_workers/owner/peace (ET6) |
| SP4 High-Pass Climb | grapple ledges → tarn island (x294,y225) | [self] | **requires tool_grapple** (M12) — the grapple loop |
| SP5 A Stranger's Plea | town **edge** (x312,y262) | Desperate Stranger | M11; **reads karma** → stranger_used/rescued |
| PH1 The Runaway Cart | quarry-road incline (x332,y250) | Miner (Tomas/Garrick) | M11 |
| CAM1 The Cynic in the Marble Hall | the town hall (x318,y252) | Lord Pellamy, Diogo the Barrel | Act 2 |

**Encounter check:** all givers in the no-aggro town; SP2/SP4 *send* you into the crags but the
giver stands in town; SP5's stranger is at the town **edge** (narratively desperate, still safe). ✅

### 2.4 TIDEWRECK COAST (combat; Saltbreak = safe hub) · M13–M14 · ST1–5,ST8 · PH2 · CAM3 · EDG1/2

| Quest | Spot | Giver | Trigger / gate |
|---|---|---|---|
| ST1 Smuggler's Bargain | Saltbreak docks (x405,y332) | Hugh Jass | M13 → faction_smuggler/authority (ET5) |
| ST2 Tide-Cave Treasures | tide caves (x400,y288) | [self] | **requires tool_hookshot** (M14) — the hookshot loop |
| ST3 The Lighthouse Keeper | the **lighthouse** (x398,y285) | Holden McGroin | M13; heartfelt (mirrors Bram) → keeper_stayed (ET2) |
| ST4 Bounty: Wreck Wraith | board → the reef wrecks (x440,y300) | Bounty-Master (Saltbreak) | M13 → wreck_wraith_slain |
| ST5 Saltbreak Betrayal | Saltbreak backstreet (x408,y328) | route-reactive (Hugh's man/Deputy) | M13; reads ST1 faction → betrayal_* (ET7) |
| ST8 Message in a Bottle | the beach tideline (x396,y320) | [self] | M13 → message_bottle + **pem_clue_coast** |
| PH2 The Barber of Saltbreak | a barber's stall, harbour (x406,y330) | Old Crannock | M13 |
| CAM3 The Short General | the harbour wall (x404,y334) | General Petibon | Act 2 |
| EDG1 The Midnight Raid | tavern (x407,y331) | Big Sal | Act 2 (adult farce) |
| EDG2 Flowers for Someone | the fisher's jetty (x402,y336) | Shy Fisher | Act 2 → flowers_gathered |

**Encounter check:** Saltbreak hub safe; ST3 keeper at his lighthouse (a quiet landmark, off the
combat dunes); bounty givers in town. ✅ ⚑ ST2/M14 need the **tide-time** mechanic (engine, §4).

### 2.5 EMBERWOOD (combat; Caught Settlement = fraught hub) · M15–M16 · SE1–5 · PH4 · CAM6

| Quest | Spot | Giver | Trigger / gate |
|---|---|---|---|
| SE1 Fire and Frost | the settlement (x315,y395) | [self/lore] | M15 → fire_frost_lore + **pem_clue_emberwood** (4th → completes SG2) |
| SE2 The Caught Settlement | the burning/freezing halves (x312,y398) | Settler | M15; **no-win**: saved_burning/freezing (ET4) |
| SE3 Ashen Relics | elemental vault (x346,y408) | [self] | **requires tool_firefrost** (M16) — the firefrost loop |
| SE4 The Weeping Tree | the Weeping Tree (x330,y402) | [self] | M15; gut-punch → weeping_tree (ET11, L-hint) |
| SE5 Bounty: Cinder Stag | board → burning ridges (x350,y420) | Bounty-Master (settlement) | M15 → cinder_stag_slain |
| PH4 The Veil | the settlement commons (x316,y396) | Elder Ash | M15; routes on SE2 if made |
| CAM6 The Chill Prophet | a defiant feast-tent (x320,y400) | Vinizar the Glad | Act 2 → prophet_blessed |

**Encounter check:** givers in/around the settlement; SE3/SE5 send you into the flows. ✅

### 2.6 HOLLOW SPIRE (endgame; austere) · M17–M20
The ascent is the one forced corridor; givers are only at the approach (M17). M18–M20 are
self-driven set-pieces (gauntlet → boss → choice). Hagga appears at M17 **only if allied**
(hagga_believed or hagga_ally_plus). No side quests here (endgame is linear).

### 2.7 ROAMING · CAM5 The Wanderer Out of Time
A **rare-spawn** time-traveller on the connecting roads (Belt / river-road / ashen-road), gated
by `spawn_wanderer`. ⚑ Needs a rare-spawn mechanic (engine, §4) → wanderer_met.

---

## 3. GATE SET-PIECES (each `gating.js` gate → its physical enforcement + tease→payoff)

| Set-piece | Where (2a) | Enforces | Tease→payoff loop |
|---|---|---|---|
| **Boarded cave** | GH meadow (x308,y290) | M4 tease | see it boarded as a child → **tool_lantern** (M9) lights the dark interior |
| **Belt pond-island** | West Belt pond | water-gap tease | see the chest on the island → **tool_hookshot** (M14) crosses the gap |
| **Peaks rockfall** | Foothill N mouth (y278) | **shard_1** (Peaks entry) | blocked until the Marsh truth (M10/shard_1) shifts it — **BUILT** |
| **River-gorge** | river-road (x380,y310) | **tool_grapple** (Coast entry) | a sheer gorge bars the road E → grapple across (earned M12 Peaks) |
| **Chasm** | ashen-road (x320,y360) | **tool_hookshot** (Emberwood entry) | a chasm bars the road S → hookshot across (earned M14 Coast) |
| **Gated ascent** | Peaks headroom→ascent (y206→202) | **4 shards + tool_firefrost** (Spire) | the summit visible all game → climbable only with all 4 shards + firefrost |
| **Crypt locks** | Marsh deep mire (SA3) | tool_lantern | in-region: earn lantern → loot the dark crypts |
| **High-pass ledges** | Peaks tarn (SP4) | tool_grapple | in-region: grapple ledges → tarn-island treasure (also the "vale-lake island" tease) |
| **Tide caves** | Coast cliffs (ST2) | **TIME:tide** + tool_hookshot | ⚑ tide mechanic = engine (§4) |
| **Elemental vault** | Emberwood (SE3) | tool_firefrost | in-region: firefrost → fire/frost puzzle vault |

All teases have a named payoff (no orphan tease) — matches `gating.js` TEASES + the blueprint §3.

---

## 4. NPC DISTRIBUTION — verdict
- **Quest-givers + populace sit in safe hubs/roads**, never standing among monsters. Verified
  per region above (GH plaza; Mirefen; the stone town; Saltbreak; the Caught Settlement; the
  Spire approach). ✅
- **Sanctioned in-danger placements** (narrative): SP5 Desperate Stranger (town edge); ST3
  Lighthouse Keeper (his lighthouse); NIGHT1 bog-wraith + the bounty targets + dungeon bosses
  are **encounters**, not givers — the bounty/dungeon GIVER is always in the hub. ✅
- **Engine-dependent placements flagged (not faked):** **M14/ST2 tide-timed water**, **CAM5
  rare-spawn Wanderer**, NIGHT1 night-phase (TimeOfDay exists ✅). The Peaks Keep-Sentinel
  boss-flow into the overworld is still deferred (MASTER-MAP §4). These are build/engine deps,
  not placement errors.

---

## 5. JOURNEY REACHABILITY VALIDATION (the key check)

Walking the path start→end, **is every quest reachable when the story sends you?** (Agrees with
`gating.js`'s machine-checked no-soft-lock gate — this validates the QUEST→place mapping on top.)

| Step | Reachable? | Why |
|---|---|---|
| M1–M7 (GH childhood + return) | ✅ | open hub, sequential `unlocks` chain |
| M8 (Marsh) | ✅ | W open (Belt route built); no tool to ENTER |
| M9 → lantern + shard_1 | ✅ | Sunken Shrine reachable inside Marsh |
| M10 (Hagga) | ✅ | Hagga's hut in Marsh |
| **M11 (Peaks)** | ✅ | rockfall needs **shard_1** — earned at M9, BEFORE M11 ✓ |
| M12 → grapple + shard_2 | ✅ | Cinder Keep inside Peaks |
| **M13 (Coast)** | ✅ | gorge needs **grapple** — earned at M12 ✓ |
| M14 → hookshot + shard_3 | ✅* | Vault inside Coast — *⚑ tide-time entry = engine dep |
| **M15 (Emberwood)** | ✅ | chasm needs **hookshot** — earned at M14 ✓ |
| M16 → firefrost + shard_4 | ✅ | Ember Hollow inside Emberwood |
| M17 (Spire approach) | ✅ | open after M16 |
| **M18 Long Ascent** | ✅ | needs **all 4 tools** — all earned M9/M12/M14/M16 ✓ |
| **M19/M20 (Spire)** | ✅ | Spire gate needs **4 shards + firefrost** — all held; shard_5 earned inside (M19) ✓ |
| Tool-loop sides (SA3/SP4/ST2/SE3) | ✅ | each tool earned in-region BEFORE its side quest |
| Pem hunt (SA1/SP1/ST8/SE1 → SG2) | ✅ | clues gathered en route; **SG2 completes in GH** (hub always open — backtrack) |
| SG7 (locked if chicken_kicked) | ✅ intended | an optional lock, not a soft-lock |
| Endings (M20 offeredEndings) | ✅ | Warden is the always-reachable default; L/A gated on earned deeds; M20 shows only reachable |

**VERDICT: NO SOFT-LOCKS. Every critical-path quest is reachable when triggered** — each region's
entry key is earned in the PRIOR region, exactly as `gating.js` declares. Linear FIRST-clear,
non-linear revisit (2+ tools → free backtrack, e.g. for SG2). ✅

---

## 6. CONTRADICTIONS / FLAGS (reconcile, not override)
1. **Tide-time (M14/ST2)** — the Drowned Vault entry + tide-cave loot need a **tide-timed water
   mechanic = [ENGINE]**, not built. Coast build needs it OR a fallback entry (e.g. hookshot-only).
   *Flag, don't fake.* (Already noted in MASTER-MAP §5.)
2. **CAM5 Wanderer rare-spawn** — `spawn_wanderer` implies a rare-spawn system not yet built;
   place as a roaming road encounter, flag the spawn-gate engine dep.
3. **SG2 backtrack** — the 4th Pem clue (SE1) is in Emberwood (late); SG2 completes back in GH.
   Reachable (hub open + waystone fast-travel), but the design assumes the player returns — confirm
   the waystone/fast-travel is wired so it isn't a tedious walk. (Not a soft-lock.)
4. **Givers in unbuilt regions** — Coast/Emberwood/Spire givers (Harbourmaster, Hugh Jass, Holden
   McGroin, Settler, Elder Ash, Vinizar, Sela@Spire…) are placed here at 2a spots but their NPC
   data/positions get authored when those regions build (they live in quest dialogue today, not a
   region NPC table). No conflict — just a build note.
5. **Peaks boss-flow** — M12 Keep-Sentinel isn't wired into the overworld boss loop yet (grant at
   the Keep entrance for now) — a build dep, doesn't affect placement/reachability.
6. **No story redesign performed** — every id/giver/gate here is read from the quest data +
   `gating.js`; this doc only assigns SPOTS. Any future quest-data change must update this overlay.

*Cross-links: MASTER-MAP.md (the 2a physical spots this overlays) · WORLD-BLUEPRINT.md §3/§6
(gating DAG + M1–M20 critical-path) · gating.js (the machine-checked graph — this agrees) ·
src/data/quests/* + constants/{deeds,flags,endings}.js (the story SOURCE this places) ·
QUALITY-SPEC.md (the locked standard the eventual builds conform to). Doc-only; no code/SSOT touched.*
