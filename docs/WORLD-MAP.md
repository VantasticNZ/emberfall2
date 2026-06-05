# EMBERFALL — THE WORLD MAP (full geography, ~30hr, Fable-style connected regions)

> Built to QUALITY-BIBLE scale standard. Fable-style: big regions with BLEEDING EDGES (each zone's
> border visually flows into the next - reads as one connected world, not separate islands). Eased
> backtracking + earned/bought fast-travel. Clean zone-seams (also makes a future 3D port easier).
> Uses the existing five regions from WORLD-BIBLE (kept as-is per Van).

================================================================
## THE SHAPE: HUB + SPOKES, ONE CONNECTED LANDMASS
================================================================
Greenhollow Vale sits at the heart. Five regions radiate out, each reachable on foot via roads that
bleed from one biome into the next (forest thins into marsh-edge; grassland rises into foothills).
The Hollow Spire looms on the far north horizon from almost everywhere - the visible goal. The world
gates by TOOLS + STORY (Metroidvania), so early you can wander but not pass certain barriers.

Rough layout (compass):
                        [HOLLOW SPIRE]  (far N, endgame)
                              |
                     [SUNDERED PEAKS]   (N - strength/might)
                              |
   [ASHEN MARSH] --- [GREENHOLLOW VALE] --- [TIDEWRECK COAST]
        (W, first)         (HUB)                  (E)
                              |
                       [EMBERWOOD]      (S - fire/frost heart)

================================================================
## REGION 0 - GREENHOLLOW VALE (the hub, childhood + return)
================================================================
ROLE: the heart. Childhood act (~1hr) plays here; you return here as an adult after the catastrophe;
it's the social/economic hub you keep coming back to. Warm, pastoral, alive.
SUB-AREAS:
- Greenhollow Village - the town: homes, the Smithy (Hodge), Pem's Store, the tavern (The Cracked
  Tankard), the chapel, the well, the village green, the gate. Named cast live here.
- The Outskirts / Meadow - farmland, the orchard, the old boarded cave, the brook, scattered
  homesteads. Where childhood quests spread out (travel, not "it's there").
- The Crossroads - where the five roads meet; the first waystone (fast-travel anchor).
- Greenhollow Wood - light forest fringe, bleeds W into Ashen Marsh's edge.
SCALE: the largest single settled area; you should be able to run across it and feel it's a place.
GATING: childhood = a safe bounded Greenhollow; post-catastrophe the roads open one by one.

================================================================
## REGION 1 - ASHEN MARSH (W) - the first lie
================================================================
ROLE: first region, first shard, first crack in the oracle lie. Atmospheric, melancholy bog.
TOOL EARNED: the LANTERN (lights dark, reveals hidden paths, gates).
SUB-AREAS: the bog approach (bleeds from Greenhollow Wood - boggy trees thicken, ground softens);
Mirefen settlement (bog-folk on stilts); the black water; Hagga's hut (the exiled oracle); the
Sunken Shrine (dungeon - dark/light lantern puzzles). 
BOSS: the Drowned Guardian (learn-the-pattern: use lantern light to strip its shroud, then strike;
dodge its lunge, block its volley). SHARD #1. TRUTH: the Hearthflame is something alive + bound.
EDGE BLEED: E back to Greenhollow Wood; impassable mire N+S until later tools.

================================================================
## REGION 2 - SUNDERED PEAKS (N) - strength / the broken order
================================================================
ROLE: mountains; a hardier people; the oracle order's old stronghold. Tests might + traversal.
TOOL EARNED: a CLIMB/GRAPPLE or might tool (reach high ledges, move heavy things) - opens verticality
+ backtrack paths elsewhere.
SUB-AREAS: foothills (grassland rises - bleed from Greenhollow N road); a mountain town (terraced,
stone); high passes; a quarry/mine; the Cinder Keep dungeon (the order's ruined fastness).
BOSS: a learn-the-pattern guardian using the new tool + dodge/block. SHARD #2. TRUTH: the order knew
+ chose the lie. EDGE BLEED: S to Greenhollow foothills; the road N continues toward the Spire (gated).

================================================================
## REGION 3 - TIDEWRECK COAST (E) - the drowned truth
================================================================
ROLE: storm-battered coast, wreck-strewn, smuggler/fisher folk; secrets under the waves.
TOOL EARNED: the HOOKSHOT (pull to anchor points, cross gaps, yank things/enemies) - big traversal +
combat + backtrack unlocks.
SUB-AREAS: cliffs + beaches (grassland breaks into dunes/rock - bleed from Greenhollow E road); a
harbour town (Saltbreak); tide caves (tide-timed access); a sunken/wrecked dungeon.
BOSS: hookshot-dependent learn-the-pattern fight. SHARD #3. TRUTH: a shard was deliberately hidden /
a betrayal in the lie's history. EDGE BLEED: W to Greenhollow; coastal road loops.

================================================================
## REGION 4 - EMBERWOOD (S) - fire + frost, the god's pain
================================================================
ROLE: an unnatural wood where fire + frost war (the dying god's fever) - the most overtly magical,
dangerous region. The emotional + thematic core before the endgame.
TOOL EARNED: a FIRE/FROST tool or spell (burn/freeze gates, light braziers, combat element) - the
"magic" pillar lands here.
SUB-AREAS: the wood's edge (Greenhollow S road, leaves turn ash + frost); a half-abandoned settlement
caught between burn + freeze; deep wood; the Ember Hollow dungeon (elemental puzzles).
BOSS: an elemental learn-the-pattern boss (alternate fire/frost; a real twist). SHARD #4. TRUTH: the
god's suffering is the land's sickness; the full horror of the binding. EDGE BLEED: N to Greenhollow.

================================================================
## REGION 5 - HOLLOW SPIRE (far N) - the endgame
================================================================
ROLE: the bound god's prison-altar; where the oracles do their work; the final region. Reachable only
after all 4 shards + the truths. Visible on the horizon the whole game; now you climb it.
TOOL: uses ALL prior tools (the culmination). SUB-AREAS: the long ascent (gauntlet of earlier enemy
types + tool gates); the oracle sanctum; the binding chamber. SHARD #5 = at the summit.
ENDGAME: the THREE endings branch here (Warden / Tyrant / Liberator), gated by whole-game karma +
purity + deeds (deed-memory). The over-built-up brutal boss + the final choice live here.

================================================================
## CONNECTIVITY, GATING, TRAVEL
================================================================
- ROADS bleed biome-to-biome (no hard island seams). You can SEE into the next region from the border.
- METROIDVANIA GATING: each region's TOOL opens barriers in OTHER regions + Greenhollow (light backtrack
  with payoff). Suggested order Marsh -> Peaks -> Coast -> Emberwood -> Spire, but some nonlinearity
  once 2+ tools exist.
- FAST TRAVEL: waystones (one per region + the Greenhollow Crossroads), unlocked by visiting. Early =
  travel on foot (learn the world); later = earned/bought fast-travel (carriage at Greenhollow, then a
  teleport-to-waystone ability) respects time. Eased backtracking, never tedious.
- THE SPIRE on the horizon = constant goal/orientation from everywhere.

================================================================
## BUILD ORDER (region-by-region, each a shippable increment per the Bible)
================================================================
1. GREENHOLLOW VALE complete (childhood + return + hub) + ASHEN MARSH complete + a reachable early
   ending state = the first SHIPPABLE slice (a 3-5hr Emberfall).
2. Then Sundered Peaks, 3. Tidewreck Coast, 4. Emberwood, 5. Hollow Spire + the 3 endings - each
   extends the shippable game.

## ONE LINE
A hub-and-spoke landmass: Greenhollow at heart, five tool-gated regions bleeding into one connected
world, the Spire on the horizon as the goal - built region-by-region, each a complete shippable bite.
