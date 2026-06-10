# DEFERRED — the living tracker (nothing silently dropped)

> Every deferred item, with WHY, what UNBLOCKS it, and WHEN it must be built (milestone). Born from
> `PROCESS-RETRO` meta-rule 6 (deferred ≠ dropped). **Rule: you may defer, but you must LOG here — and
> when you start the unblocking milestone, you must clear the matching rows.** Update every session that
> defers or builds an item. Milestones: **M1** = shippable 5h core (GH→Marsh→Shrine) · **M2** = replicate
> the 6-region spine + 5 endings · **M3** = expansion + spell-route web · **ABIL** = the abilities-mechanics
> session (a prerequisite) · **POLISH** = anytime quality.

## 🔒 SEAMLESS OVERWORLD (Van option B, LOCKED) — convert towns to inline terrain (gate #19)
**Target: every town/village/city is inline walk-through terrain (0 enter-scenes).** Proven pattern:
**Mirefen is DONE** (inline in the Marsh — buildings + NPCs + the hut interior-door, no enter-door; walk
through its streets seamlessly). Apply the SAME pattern to the rest.
| Town to convert (still enter-scene) | Host overworld region | When |
|---|---|---|
| **Fenwick · Lost Cemetery** | Marsh (W) | next pass |
| **Stonereach · Cragfoot** | Peaks (N) | next pass |
| **Saltbreak · Cribbins** | Coast (E) | next pass |
| **Thornwell** | Emberwood (S) | next pass |
| **Mirage Oasis** | needs a Desert region (M3) | M3 |
*Each: place the built buildings/NPCs/interior-doors INLINE in the host region at the map position;
remove the enter-door; add to gate #19 `SEAMLESS_DONE`; make the town a no-aggro safe hub; navGate + perf
+ eyes-on walk-through.* **Polish:** widen the inline streets (Mirefen's are navigable but tight); the
old griddedSettlement town SCENES become orphaned once inline (clean them up).

## GH→MIREFEN CORRIDOR — to-standard (the proven slice; structure remainder deferred)
The feel-layer is on it (see below); the **structural geometry** is the remaining work to make it match
Van's map exactly — then roll the same to every corridor.
| Item | Status | When |
|---|---|---|
| Bounded corridor (can't stray, off-path blocked) | ✅ WEST_BELT (276 channel-wall colliders) | done |
| Mirefen inline (seamless) | ✅ (no enter-door) | done |
| See-it-before tease + legible sign (islet cache) | ✅ built (corridor-see-it-before-tease) | done |
| Soft guidance (waystones funnel to Mirefen) + density (reeds/trees/pools/enemies/NPCs) | ✅ built | done |
| **Routed ZIG-ZAG to the map** (5 bends: 9.5,10.5→9,12→8,10.5→8,12.5→6.5,11) | ❌ belt winds but not the exact bend coords | next |
| **ELEVATION descent** GH +1 → bog −1 (visible contour/steps) | ❌ not built (no elevation render yet) | next |
| **TERRAIN-TRANSITION bands** (grass→bog blended, not hard edge) | ❌ not built | next |
| **Mirefen sized to spec** (44×36 footprint/population) | ❌ inline town is smaller (8 buildings) | next |
| **Backtrack reach** (dash across to the islet cache) | 🔧 engine-blocked (no dash-leap-over-gap) | ABIL |

## BLOCKERS / PREREQUISITES (build these to unblock others)
| Item | Why deferred | Unblocks | When |
|---|---|---|---|
| **Abilities-mechanics session** — build dash-leap-over-gap, electric, fire, ice, wind, bomb | not in the engine; the M1 ability-gates + Fenwick's ⚡-spur + all spell-routes depend on them | the M1 dash/electric ability-gates · Fenwick electric entry · M2/M3 spell-route gates | **ABIL** (before they're needed in play) |
| **lpc-monsters.zip licence confirm** (staged UNKNOWN) | no in-pack licence | a real non-humanoid monster/boss roster (beast bounties + creature variety) | M2 (before boss-heavy regions) |
| **Confirm LPC Chicken Rework OGA licence** (loose PNGs in Downloads) | no bundled licence | the hen sprite (chicken callback) | M1 |

## M1 — the shippable 5h core
| Item | Why deferred | Unblocks/Need | When |
|---|---|---|---|
| **Frog sprite (SA4)** | not sourced; lpc-monsters UNKNOWN | the Frog good-monster (heart-beat); stopgap = reskin man_eater_flower | M1 |
| **Hen sprite** | licence unconfirmed (above) | the kicked-chicken callback | M1 |
| **marsh-dread music** | ✅ DONE (HydroGene, wired) | — | done |
| **The Sunken Shrine build** (dungeon: lantern puzzle + Drowned Guardian + shard 1) | not built | M1 core completion | M1 |
| **Deep M8–M10 quest wiring** (Mirefen→Marsh→Shrine flow beyond the M8 hook) | only the hook exists | the core arc | M1 |
| **Mirefen/Fenwick density-fill** (bare edge-blocks) | cores built, edges sparse | finished towns | M1/POLISH |
| **dash + bomb ability-gate secrets** (Marsh boardwalk cache, Shrine cracked wall) | engine-blocked (ABIL) | optional caches | ABIL→M1 |

## M2 — replicate the 6-region spine
| Item | Why deferred | Unblocks/Need | When |
|---|---|---|---|
| ~~Relocate Peaks settlements (Stonereach, Cragfoot, Cinder Keep)~~ | ✅ **DONE pass 2** — overworld entrances in the Peaks (N), all enter correctly | — | done |
| ~~Relocate Coast settlements (Saltbreak, Cribbins)~~ | ✅ **DONE pass 2** — entrances in the Coast (E) | — | done |
| ~~Relocate Emberwood (Thornwell)~~ | ✅ **DONE pass 2** — entrance in Emberwood (S) | — | done |
| **Relocate the rest** (High Pass, Lighthouse, Drowned Vault, Caught, Weeping, Ember Hollow — landmarks/dungeons/the S town) at their positions | pass 2 did the 6 board-only SETTLEMENTS; the landmark/dungeon NODES + Caught town still need overworld entrances | full N/E/S/finale connectivity | M2 |
| **Relocate Spire** (Oracle Capital, Hollow Spire) at far-N positions | needs the 24×24 expansion (below) | the finale region | M2/M3 |
| **Mirage Oasis (vil_oasis)** — the only remaining board-only settlement (gate #16: 1/11) | no DESERT overworld region exists yet (it's far-SE expansion) | a desert region (M3 expansion) | M3 |
| **Overworld town SILHOUETTES** (solid building clusters at each town site) | collision-gate complexity; signpost+door for now | towns read as places on the world | M2 |
| **Music beds: storm-surf (Coast), sacral (Capital/Spire), fire-frost (Emberwood), dungeon-tension** | not sourced (CC0 from Van's RPG-music zip) | per-region audio identity | M2 (per region) |
| **Boss reskins** (Drowned Guardian/Keep Sentinel/Tideward/Feverheart/Warden as LPC humanoids) | bespoke art deferred | the named bosses | M2 |
| **electric/wind ability-gates** (Fenwick spur, Lighthouse) | ABIL prerequisite | the side spurs | ABIL→M2 |

## M3 — expansion + the spell-route web
| Item | Why deferred | Unblocks/Need | When |
|---|---|---|---|
| **24×24 world expansion** (overworld is 20×20; far-N Capital/Spire + far-SE Dustreach don't fit) | structural; MASTER-WORLD-SPEC target | Van's full map | M3 |
| **Forest/Desert expansion** (Thornwell, Dustreach, Oasis, Sunken Temple) | post-core | the expansion content | M3 |
| **Spell-route shortcuts** (electric/ice/wind/fire/firefrost interconnections) | ABIL prerequisite | the interconnected web | ABIL→M3 |
| **cemetery-eerie music** | not sourced | the Lost Cemetery identity (uses mus_marsh for now) | M3/POLISH |

## RPG-FEEL STANDARD — apply the 6 pillars as each region is built (`RPG-FEEL-STANDARD.md`)
| Item | Status / need | When |
|---|---|---|
| **Gate LEGIBILITY (pillar 1)** — gates read as their ability | ✅ **STARTED** — the 4 tool-gates (grapple/hookshot/lantern/firefrost) are now colour-coded + ability-named (`_buildRegionGate` GATE_LOOK); proof: the grapple-gorge reads as a tall brown anchor | done (tint+label) |
| **Bespoke per-ability gate SPRITES** (cracked-wall=bomb, ice-block=firefrost, grapple-anchor, hookshot-ring, dark-mouth=lantern, cut-brambles) | tint+label deliver legibility now; bespoke art is the finish | per-region / POLISH |
| **Teases (pillar 2)** placed per region (see-it-before-you-reach-it) | the gating.js TEASES exist; each region needs a *visible* tease built | per-region |
| **Backtrack rewards (pillar 3)** — a reward on revisit-with-new-tool, per early area | design + place | per-region |
| **Soft guidance (pillar 4)** — landmarks/sightlines/funnelling per region | apply as built | per-region |
| **Density-with-purpose (pillar 5)** — every ~24-tile stretch has a POI/tease/resource | extend the density-floor check to *purpose* | per-region |
| **Ambient life / responsive audio (pillar 6)** | NPC schedules exist; wildlife + per-place audio crossfades to refine | POLISH |

## DOOR / ENTRANCE SYSTEM (`DOOR-SYSTEM.md`) — roll out + the morality states
| Item | Status | When |
|---|---|---|
| Inset doorways you walk INTO (EXACT tile-aligned carve + threshold) | ✅ BUILT for the 6 GH buildings, consistent + no-stuck + gate #21 | done |
| **CLOSED + LOCKED door states** (knock / try-handle / FORCE + morality hits) | ✅ BUILT (gh_home1 closed, gh_home2 locked; `entered_uninvited` −3 / `forced_entry` −10 in the SSOT) | done |
| KNOCK answering (an NPC opens) + a real guard/alarm spawn on FORCE | 🔧 currently a flavor beat (sfx+banner); deepen in the social pass | social pass |
| PICK (a lockpick item) as an alternative to FORCE on a LOCKED door | not built (no lockpick item yet) | feature pass |
| **Other regions' building doorways** roll out the same carve | ✅ DONE — uniform across GH/Marsh/Peaks (every building enterable via generic interiors + the carve) | done |
| Coast + Emberwood inline buildings enterable | no inline building props there yet (marker-entered settlements) — comes with the inline-town conversion | per-region |
| **Varied generic interiors** (many houses open the SAME room) | rotate the default among a SET of 3–5 distinct generic layouts (by a position hash) so it's not identical every time; + bespoke interiors for key buildings | POLISH (next) |
| **Re-home the GENERATED dungeon/cave dev-warps** (removed from GH plaza) | place __gendungeon/__gencave at a proper Peaks/Marsh cliff cave-mouth (they were dev test-entrances dumped in the starting town) | per-region |
| Findable house-KEY item (the USE-KEY door option is wired) | no key item/placement yet; door.key + inv.has() wiring is in place | feature pass |
| Lock glyph more prominent (6×7px now) + threshold depth polish | functional but small | POLISH |

## POLISH — anytime quality
| Item | Why deferred | Need | When |
|---|---|---|---|
| **Furniture crop polish** (tighter altar statue, cleaner anvil) | quick single-frame crops | finish quality | POLISH |
| **More furniture variety** (chairs/shelves/rugs/lamps — in-library) | hero pieces only | richer interiors | POLISH |
| **Wire Victorian/Colonial buildings into GH composition** | GH is Phase-2 quality | a finished GH look | POLISH |
| **Bog-tile terrain** (true mud/black-water vs tinted grass) | bog-tile gap | the Marsh reads as mud not grass | POLISH |
| **Doorway sprite placement on GH buildings** (freestanding in yards) | trigger-tile compromise | doors look attached to buildings | POLISH |
| ~~M-map settlement pins~~ | ✅ **DONE** — the M-map now pins each settlement at its live overworld-entrance position (matches the walkable world) | — | done |
| **Bespoke boss/god-reveal VFX** | art polish | the finale's unique look | M3/POLISH |

## MILESTONE GATES (must pass before advancing)
- **Post-M1 TRIPLE-CHECK** (BUILD-PLAN §4b): after GH+Marsh+Shrine are BUILT, run the full cohesiveness +
  EXCELLENCE pass against the BUILT game (real cohesion, not paper) before M2 scales. **Status: pending M1
  completion (Shrine + deep M8–M10).**
