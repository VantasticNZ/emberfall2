# DEFERRED — the living tracker (nothing silently dropped)

> Every deferred item, with WHY, what UNBLOCKS it, and WHEN it must be built (milestone). Born from
> `PROCESS-RETRO` meta-rule 6 (deferred ≠ dropped). **Rule: you may defer, but you must LOG here — and
> when you start the unblocking milestone, you must clear the matching rows.** Update every session that
> defers or builds an item. Milestones: **M1** = shippable 5h core (GH→Marsh→Shrine) · **M2** = replicate
> the 6-region spine + 5 endings · **M3** = expansion + spell-route web · **ABIL** = the abilities-mechanics
> session (a prerequisite) · **POLISH** = anytime quality.

## GUARD CONFRONT LADDER — chase / knock-out / lock-up (the escalation past "flee", step 5+)
The Fable-style ladder is built through step 4: crime → noise → the guard WALKS to you → "Stop right there!"
warning → comply window (stand still = pay/can't-pay fine; flee = lapse, fine stays owed, re-confront on
proximity). The DESIGNED escalation past a flee is **not** built: a guard who is fled should CHASE (a short
sprint), and on catch KNOCK OUT / drag to a LOCK-UP (cell + a held-time or bail), with repeat-offence
heat scaling. **When:** the reactivity/crime-system pass (post-slice) — needs a chase AI + a jail location +
a heat model. For now a flee just lapses to a proximity re-confront (fine never lost). **Milestone: POLISH/M2.**

## DAY/NIGHT CYCLE — wire the TimeOfDay clock to ADVANCE in the live Overworld (POLISH/system decision)
The `TimeOfDay` system is built (HUD shows the phase; NpcLife is designed to retarget on phase changes;
the legacy RegionScene advances it). But **OverworldScene never advances `tod`** during play — the clock is
frozen at 'day' (frac 0.35), so no phase changes ever fire in the live slice. Consequences logged here so it
is not silently assumed working:
- **Repair pacing (item 4, `437dc0eb`)** wires `tod.onPhaseChange` and would complete on a real phase change,
  but since the clock is frozen it actually completes on a config-derived real-time floor (one day-phase ≈ 6s).
- **NPC schedules** (dawn/day/dusk/night routines) never switch — NPCs hold their 'day' post (mitigated for
  feel by the item-5 wander, `764f1e1f`).
**When:** a deliberate decision for Van — enabling the cycle changes NPC routines + needs a sane `RATE`
(currently a full day ≈ 24 real s, very fast). One line (`this.tod.advanceRealSeconds(dt)` in `update`, when
not paused) + a `RATE` tune. **Milestone: POLISH** (or whenever Van wants a living day/night in the slice).

## DEPTH RULE — apply the game-wide feet formula to the parked legacy scenes (POLISH)
`f1e42e15` made `depth = feet` game-wide via `DepthSort.trackProp` and converted **OverworldScene** (the live
boot scene) + added the `game-wide-depth-rule` gate. The parked scenes **Greenhollow/Marsh/Peaks/RegionScene**
(NOT in the boot flow — `BootScene` starts 'Overworld') still call the old `DepthSort.track(spr, footprint…)`.
The new `trackProp` is a strict improvement for them (identical for origin-0.5 props, corrected otherwise), but
they were **not converted or eyes-on this session** since they're unreachable in the slice. **When:** if/when a
legacy scene is revived, convert its prop `track()` calls to `trackProp` + eyes-on. **Milestone: POLISH.**

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
| **Routed ZIG-ZAG to the map** (5 bends: 9.5,10.5→9,12→8,10.5→8,12.5→6.5,11) | 🟡 **DEFERRED (unattended 2026-06-12):** re-routing the live WEST_BELT lanes is a HIGH-RISK geometry change to a working, gate-green, bounded corridor (channelled-not-open · no-soft-locks · seam · density all depend on it), the bend coords are partial (x9.5→6.5, not the full BW=10 corridor), and there's no Van present to feel-judge a re-routed road. Per the conservative rules (ambiguity → conservative reading; no design decisions), the working forked winding belt is kept. | Van-present pass |
| **ELEVATION descent** GH +1 → bog −1 (visible contour/steps) | 🔴 **BLOCKED — no elevation render system exists.** Van's elev values (GH+1/Mirefen−1) are locked DATA, but rendering a contour/step descent needs a NEW elevation system; building one is forbidden under the conservative/no-new-systems rules. Stays deferred until an elevation render system is built. | ELEV-system / POLISH |
| **TERRAIN-TRANSITION bands** (grass→bog blended, not hard edge) | 🟡 **DEFERRED (unattended 2026-06-12):** the belt already shows a green→bog gradient (prop-tints bog-west/oak-east) + the marsh's own bog ground. A true *blended ground band* is a per-chunk streaming-terrain change (risky to touch unattended); a finer prop-tint blend is marginal. Conservative: existing gradient kept. | Van-present pass |
| **Mirefen sized to spec** (44×36 footprint/population) | 🟡 **DEFERRED (unattended 2026-06-12):** §0.5 locks Mirefen's POSITION + 44×36 size but NOT a detailed building LAYOUT — growing the 8-building inline town to a 44×36 footprint requires choosing where the new buildings/streets go = a DESIGN DECISION (forbidden unattended). The 8-building inline Mirefen is the conservative build. **Population enriched this session** (WS3 — see below). | Van-present layout pass |
| **Mirefen NPC LIFE** (marsh role palette: fisher/herb-wife/mire-folk/keeper, no guards) | ✅ **BUILT (`fd184a12`, unattended 2026-06-12):** enriched Bett (herb-wife)/Coll (fisher)/Tam (protected kid) + new Old Sedge (mire-folk) + Trader Pell (keeper, mirefen_trader shop) — schedules/topics/greetings on the frozen NpcLife/dialog/shop. All frozen tables green. | done |
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
| **Stairs SPRITE for interior floor-links** | tavern up/down works as stairs (return-stack) but the link renders as a door sprite; a stairs sprite would read clearer | POLISH |
| **Varied generic interiors** (many houses open the SAME room) | rotate the default among a SET of 3–5 distinct generic layouts (by a position hash) so it's not identical every time; + bespoke interiors for key buildings | POLISH (next) |
| **Re-home the GENERATED dungeon/cave dev-warps** (removed from GH plaza) | place __gendungeon/__gencave at a proper Peaks/Marsh cliff cave-mouth (they were dev test-entrances dumped in the starting town) | per-region |
| **Re-home the M4 BOARDED CAVE** (lantern → `cave_lore`, ending-A seed) | REMOVED from GH (the `prop_cliff_face` read as a misplaced cliff amid the homes + no clean reachable spot in town); re-home as a proper boarded-cave entrance in the WILDS (Marsh/Peaks cliff). A dedicated boarded-cave SPRITE is the art need (currently a cliff-face stand-in). | per-region |
| Findable house-KEY item (the USE-KEY door option is wired) | no key item/placement yet; door.key + inv.has() wiring is in place | feature pass |
| Lock glyph more prominent (6×7px now) + threshold depth polish | functional but small | POLISH |

## LIVING-WORLD ART — ElizaWy-repo fetch audit (2026-06-12, probed github.com/ElizaWy/LPC)
**FETCHED + integrated:** ✅ **Guard helm** — ElizaWy "Head Accessories / Helm 05 - Kettle Helm" (OGA-BY,
public/art/eliza/helm/, frames 3/8/7 match the rig exactly) → PARTS `helm_kettle` (slot hat, z over hair) →
on the guard pair; eyes-on verified (guard-helm.png). The repo also offers Run/Sitting/swing-variant anims
(future polish — a real `sit` for sleep would need fetching Sitting.png × every layer + a new ANIMS state).
**Stays graceful-degrade (evidence-backed, NOT a clean fetch):**
- **Chore/tool anims** (chop/hoe/till/sweep/pray): ElizaWy ships swing variants but **NO tool anims**; the
  classic **ULPC** tool anims are a **different base/rig → won't align**. The **slash anim doubles as the
  work motion** for hammer/chop/till (visible arm-swing). pray/sweep = idle-at-workstation. Proper tool
  anims = a custom ElizaWy-format commission.
- **Child skins:** ElizaWy `Children/` has **Body + Head only** (no child-fitted clothing/hair) → a real
  child skin would be naked/misaligned (adult clothes don't fit the smaller child body). The **scaled,
  clothed villager** reads as a kid better. Keep scaled until child clothing/hair exists.
- **Spear:** a weapon prop (attack-only); low value vs the helm. Deferred. Milestone: polish.

## LIVING-WORLD — post-slice layers (spec'd 2026-06-11, SPEC-NPCS-LIVING-WORLD.md)
Deferred to post-slice (slice ships the 3-phase + GH palette): **full hourly schedules** (named meals/sleep)
· **deeper reactive webs** (rumours/factions/escalation) · **Marsh/Peaks/Coast role palettes** · **property
BUILD** (purchase UI, rent loop, furnish/rename — the deed SCHEMA ships in-slice to avoid retrofit) ·
**chore-anim fetches** (ULPC forge: chop/hoe/hammer/sweep/pray/guard-spear — slice degrades to idle-at-
workstation until fetched + ledgered). UNBLOCK per item: at its milestone. Milestones: schedules/webs = M2; palettes = per-region; property build = M2; anims = anytime polish.

## INTERIOR AUDIO BEDS — hooks pending, tracks deferred (2026-06-11)
GH interiors currently inherit the GH overworld bed. SPEC-INTERIORS (d) wants a shared indoor-home bed +
bespoke chapel & tavern beds — but no LICENCE-CLEAN interior track exists yet (see the music audit below).
So the bespoke interior beds are **deferred** until a clean track is sourced/Van-confirmed. No placeholder
audio wired (licence-first). UNBLOCK: a clean home/chapel/tavern bed → wire per-interior `music`. Milestone: M1.

## MUSIC BEDS — needed vs HAVE (asset-first audit 2026-06-11)
**WIRED (SAFE):** green (Peasant Theme, nihilocrat CC0) · peaks (Cave Theme, Brandon Morris CC0) · marsh
(Spirits Forest, HydroGene — ⚑ "royalty-free" ≠ a clear licence; re-verify or replace before ship).
**WIRED 2026-06-11 (Van's call, LOCAL/friends scope) as LICENCE DEBT** — 8 Downloads beds wired + tracked
in the ASSET-LEDGER `unverified` block; the `no-unverified-assets-at-ship` gate HARD-FAILS at `SHIP=true`:
cemetery-eerie=mus_cemetery ("Old Cemitery") · dungeon-tension=mus_dungeon ("Mysterious cavern") · spire-
sacral/chapel=mus_sacral ("The Sage Den") · ember-tension=mus_ember ("Old Ruins") · coast-storm=mus_coast
("Submerged Ruins") · settlement=mus_town ("Plains (contrasting)") · interior-home=mus_home ("Forest - Under
The Great Tree") · interior-tavern=mus_tavern ("Tea Time For Cats").
**RESOLVE before any wider release:** for each, confirm the source/licence (move it into the `ledger` block)
OR swap to a CC0 candidate — OpenGameArt "Sacred"/"Shrine" (sacral), nihilocrat + Brandon Morris CC0 sets
(already trusted), "Dungeon/Cave Ambient" CC0, "Eerie/Cemetery" CC0 ambiences. Run `SHIP=true npm run verify`
to see the live debt list.

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

## SHOPS-v2 — WS1 overnight (2026-06-12)
| Item | State | Why | Need / when |
|---|---|---|---|
| **Buy-UI item ICONS** (eliza-objects) | 🟡 DEFERRED (asset-first audit done) | RULE-4 audit: the licence-vetted library has item art for only a small FOOD/sundry subset (`eliza-objects/Small Items/Food`); **every weapon/armour/shield/trinket/potion/book/material — the bulk of shop stock — is a GAP**. Items carry no `icon` field; no image-slicing tool (sharp/jimp) is installed to extract from the packed grids; and choosing a per-item frame from a packed sheet is a curation call better made with Van's eye. Building food-only icons = ~15% coverage for a new preload/atlas pipeline. | When Van is present: pick ~5–6 food frames (bread/cheese/apple/meat/fish) + a packed-sheet → Phaser-spritesheet preload, render a frame before each buy row, text-fallback the rest. **The buy UI already shows name · price · xN/(out) clearly without icons.** |
| **Replenishing-stock RESTOCK is clock-dependent** | ✅ BUILT, ⚠ partial-live | The restock day-cadence keys off `tod.dayCount()`, which is **frozen** (the day clock doesn't advance — root cause already logged). Mitigated: a real-time day-equivalent fallback (`STOCK.RESTOCK_MS` ≈ 24 s) drives restock anyway, so shelves DO replenish live; the *day-count* path activates for free when the clock is unfrozen. | Clears when the day-clock freeze is fixed — no further shop work needed. |
| **Shop INTERIORS dressed with goods** (WS1b) | ⬜ pending this night | Sequenced after WS1d+WS1c. The interiors spec (`SPEC-INTERIORS v2`) covers shop dressing; eliza-objects furniture/shelf props are in-library. | This night if budget, else next shops pass: visible goods props in shop interiors (R2/R6 footprint-checked). |

## OVERNIGHT-2 carry-overs (2026-06-12)
| Item | State | Why | Need / when |
|---|---|---|---|
| **NPC life for the GREYBOX settlements** (Saltbreak, Stonereach, Cribbins, Cragfoot, Thornwell) | 🟡 DEFERRED | WS2 done for the inline-with-buildings towns (Peaks ✅, Fenwick ✅). These five are GREYBOX (procedural street blocks, no dressed buildings, no cast) — populating them means standing NPCs on empty lots. Building the town first is a DESIGN milestone, not conservative additive NPC-life. | When each greybox town is built out (dressed buildings) — then apply the proven role-palette + NpcLife pattern. |
| **town_mirefen (enter-scene) bare NPCs** | 🟡 DEFERRED | Has buildings + 4 silent NPCs, but it's a possibly-legacy enter-scene (not in the designed-vs-built settlement list; the INLINE Mirefen is the one Van walks). Enriching it risks duplicating the inline Mirefen work. | Confirm with Van whether town_mirefen is live or legacy; if live, enrich its 4 NPCs like Fenwick. |
| **Victorian/barred door VARIANTS for marsh/peaks** (WS3c) | 🟡 DEFERRED (no gap) | doorway-geometry gate proves EVERY building style already has a door+doorway mapping (4 assets, 22 buildings) — nothing lacks one. Swapping a distinct victorian/barred door per region is a visual STYLE choice (Van's eye), not a missing mapping. | A style pass with Van: map in-library victorian/barred door art per region for visual variety. |
| **Pixel-truth conversions of data-only gates** (WS4 part 1) | 🟡 DEFERRED | The combined-regression tables (entry: all-4-orientations ✅, repair: staged-pacing ✅) were the high-value WS4 win and are done. Converting the data/simulation gates (density/seam/feel) to pixel-truth needs the live-render VISUAL-TRUTH harness per gate — a larger build, lower value than the extensive eyes-on done this night. | Build the screenshot+pixel harness per `GATE-AUDIT.md` §VISUAL-TRUTH when a gate's eyes-on gap actually bites. |

## TOWN-FEEL carry-overs (2026-06-13)
| Item | State | Why | Need / when |
|---|---|---|---|
| **Chicken quest (M2) — free-ROAM traversal** | 🟡 DEFERRED (7a shipped a tracked loop) | M2 is now a real multi-step go-and-do (objective tracker advances eggs→water→hen → choice) via the new `set:'advance:/complete:'` dialogue commands — but the "doing" is narrated per beat, not a walk-to-placed-objects hunt. A true free-roam version needs new world wiring the engine lacks: worldDriven completion (now possible via `complete:`), step-advance ON interactable (a quest-objective interactable class), an objective ARROW that points to a LOCATION (today it's NPC-only), and a hen actor/sprite (none exists). | A quest-objective system pass: place coop/pen interactables, advance on interact, arrow-to-location, optional hen sprite. The `advance:`/`complete:` commands are the foundation. |
| **Runtime hook-throttle (7c)** | 🟡 DEFERRED (rule + gating shipped) | Hooks now gate on progression (SG1→GH1) + the HOOK PACING spec rule + `QUEST_HOOKS` [TUNE] knobs are in. A *runtime* throttle that actively defers a 2nd same-day offer isn't built (the gating staggers them instead). | Build when a stage has many same-trigger hooks: track last-offer day, suppress a 2nd within `HOOK_MIN_INTERVAL_DAYS`. |
| **Wardrobe — marsh/peaks generics + bespoke quest-NPC faces** | 🟡 DEFERRED (GH cast widened) | The GH cast now has 8 distinct shirt colours; the marsh/peaks ambient generics + the 29 quest-only portrait speakers still use the narrower pools / a role-generic fallback face. | Spread the new shirt palette to marsh/peaks casts; author bespoke faces (gender/role/expression) for prominent quest-only speakers (Sela, Yssa, Hagga, …). |

## CROUCH / DODGE-ROLL FRAME — audit verdict (2026-06-13, item 5)
**GAP — no crouch/duck/roll animation frame exists.** The loaded ElizaWy character set has ONLY `idle`,
`walk`, `attack` (`scripts/fetch_eliza.sh` fetches Idle/Walk/Combat-1h-Slash per layer; `STATES` in
`assets.js` lists those three). No crouch/duck/roll/jump/hurt sheet is in `public/art/eliza/` OR the
`asset-library`. The dodge (`Combat.dodgeRoll`) is **logic-only** — i-frames + a burst-move + cooldown — and
the avatar slid with the walk frames (no roll read).
- **Stopgap WIRED (no new art):** `_duckRollFx` — a procedural squash (scaleY≈0.72, scaleX≈1.16) + directional
  lean over the dodge window, so the roll now READS as a quick duck and restores cleanly. Verified live.
- **What a real fix needs (commission / fetch):** a licence-clean (OGA-BY / CC0) **LPC dodge-ROLL animation
  sheet** matching the ElizaWy base body proportions + frame layout (a community "[LPC] roll/run+roll"
  expansion, or a commission), per layer (body/clothes/hair/etc.) — then add a `roll` state to `ANIMS`/`STATES`,
  fetch it in `fetch_eliza.sh`, and play it during `isDodgeMoving` instead of the procedural squash.
- ElizaWy's source has other fetchable states (thrust/shoot/cast/jump per the ASSET-LEDGER note) but **none is
  a true ground-roll/crouch** — jump is the nearest and would not read as a dodge-roll.

## MILESTONE GATES (must pass before advancing)
- **Post-M1 TRIPLE-CHECK** (BUILD-PLAN §4b): after GH+Marsh+Shrine are BUILT, run the full cohesiveness +
  EXCELLENCE pass against the BUILT game (real cohesion, not paper) before M2 scales. **Status: pending M1
  completion (Shrine + deep M8–M10).**
