# EMBERFALL 2 — CONNECTOR ZONES (the traversable wilds between regions)

> **Design — Layer 2a addendum (PHYSICAL).** Van's note: the areas BETWEEN regions are too small;
> make them **much bigger with more to explore**. This expands the connector *route bands* from
> `MASTER-MAP §0` into full, build-ready specs: more length, **forking paths**, **secrets/caches**,
> **see-but-can't-reach teases**, **mini-encounter spots**, **landmarks**, **rest spots** — every
> element **channelled + legible + density-floored** per the gates, every asset tagged HAVE / HAVE⚙
> / GAP. **DOC-ONLY** (no build/visual this session — placement + feel are an eyes-on session).
>
> Coordinates = **world tiles** (32px grid; +x=E, +y=S). Origin refs: `GH_ORIGIN` tile (288,288).
> Existing connectors live in `worldmap.js` (Belt, Foothill); expansions keep those origins +
> grow the band. Terrain names = **terrain-v7 autotile terrains** (now 31 wired — *wire, don't
> source*) unless tagged `[GAP]`.

## 0. THE CONNECTOR DESIGN RULES (so a bigger zone still passes the gates)
1. **Channelled, never open** (`channelled-not-open` gate): a `route:true` band never has an open
   walkable block > **8×8 tiles**. Bigger ≠ a field — it's a **longer, wider, forking CORRIDOR**
   with cover (treeline / cliff / water / bramble) shaping every lane. Width grows by **adding
   parallel lanes + clearings off the spine**, not by removing the walls.
2. **Density floor** (`density floor` gate): every ~24-tile sector has content; wild/route screens
   want **6–12 features**, with deliberate **lulls ≥3** (a quiet rise before a vista). A longer
   band = more sectors = more required content (landmarks, caches, encounters, rest spots).
3. **Legible** (R-VIS): the *main* through-line always reads; forks branch off it at clear
   junctions (a waystone / a split boulder / a fork-tree). A player never loses the way forward.
4. **Tease → payoff, no orphans** (`no-soft-lock` gate + `TEASES`): every see-but-can't-reach
   cache pays off with a LATER tool you'll actually get — Belt water-gaps→**hookshot**, cliff
   shelves→**grapple**, fire-blocked nooks→**firefrost**. List each new tease in `gating.js TEASES`.
5. **Rest + encounter rhythm:** alternate **rest spots** (a log, a shrine, a dry camp = safe, a
   save-friendly beat) with **mini-encounter spots** (a 1–3 enemy pocket, an ambush hollow) so a
   long band has pacing, not a slog. Encounters use the existing `combat.enemies` data shape.
6. **Asset honesty:** anything tagged `[GAP]` is omitted + flagged at build, never faked.

---

## 1. WEST BELT — Greenhollow ↔ Ashen Marsh  (BUILT, expand ~2.5×)
**Now:** x278–288 / y293–327 — a ~10×34 channelled belt (treeline + bush + pond), a single lane
+ the Ph5 pond-island tease. Too short/linear.

**Expanded band:** widen to **x270–290 (20 wide) / y291–329 (~38 long)**, the river's W seep.
A braided **lowland-fen approach** to the Marsh: the ground wets as you go W (grass→`mud`→`Water_Shallows_Dirt`).

| Element | Where (local) | What | Asset |
|---|---|---|---|
| **Main lane (spine)** | down the centre, gently braided | the through-line — never lost | grass/`dirt` `[HAVE⚙]` |
| **FORK: the dry ridge vs the bog shortcut** | mid-band junction (a leaning waystone) | dry ridge = safe+longer; bog = shorter but a `mud` slow-zone + an encounter | `mud`/`mudstone` `[HAVE⚙]` |
| **Pond-island cache (existing tease)** | the widened pond | reachable only across a water gap → **hookshot** payoff | water `[HAVE⚙]` · chest `[HAVE]` |
| **Cut-bush cache** | off the dry ridge | a bramble screen → cut → a coin/herb stash (Interactables `cut`) | prop_bush `[HAVE]` |
| **Landmark: the Drowned Milestone** | band centre | a half-sunk old road-marker (story: the road the Marsh swallowed) — the "you are here" cue | prop_sign tinted `[HAVE]` ⚑ a sunk-stone variant = `[GAP]` |
| **Mini-encounter: the reed ambush** | a narrowing in the bog lane | 2–3 marsh skitterers in the reeds (combat data) | enemies `[HAVE]` (marsh set) |
| **Rest spot: the fenman's dry camp** | a raised hummock off-spine | a cold firepit + a log = a safe quiet beat (save-friendly) | props `[HAVE]` ⚑ campfire prop = `[GAP]` |
| **TEASE: the lantern-glow in the fog (W edge)** | see-but-can't-reach W | a light deep in the Marsh you can't reach until you've earned the lantern (foreshadows M9) | FX `[HAVE]` (glow) |

## 2. FOOTHILL — Greenhollow ↔ Sundered Peaks  (BUILT, expand ~2×, deepen the forks)
**Now:** x303–333 / y278–288 — 30×10, the trunk + the **quarry (NW)** / **keep (NE)** fork +
a dead-end spur cache. Good bones (the fork already works); too short vertically.

**Expanded band:** grow to **x300–336 (36 wide) / y270–288 (~18 long)** — a real switchback climb.

| Element | Where | What | Asset |
|---|---|---|---|
| **The switchback spine** | trunk, now 2 hairpins | a longer climb that reads as *gaining height* (cliff faces step up) | cliff `[HAVE]` · `rock`/`stone` `[HAVE⚙]` |
| **FORK A — quarry road (NW)** | existing, extend | leads to a worked-stone shelf + the foothill cache; an `ash`/`gravel` worksite | `gravel`/`ash` `[HAVE⚙]` |
| **FORK B — keep road (NE)** | existing, the pass | the direct climb to the cleft pass + Cinder Keep | `rock`/`snow` `[HAVE⚙]` |
| **FORK C — the goat track (new, hidden)** | a cut-bush behind a crag | a narrow third lane skipping a hairpin → a skyiron-charm cache | prop_bush + chest `[HAVE]` |
| **TEASE: the cliff shelf** | above the first hairpin | a visible ledge with a cache, no stair up → **grapple** payoff (Peaks grants grapple) | cliff `[HAVE]` |
| **Mini-encounter: the rockfall pocket** | the quarry fork narrows | 1 crag-archer + 1 charger (a taste of Peaks combat before town) | enemies `[HAVE]` |
| **Rest spot: the windbreak cairn** | a sheltered hairpin elbow | a stacked-stone cairn + a flat rock = the catch-your-breath beat + a vista back over GH | prop_rock `[HAVE]` |
| **Landmark: the broken Order milestone** | at the fork waystone | a toppled Order marker (lore: the road the Order let rot) | prop_sign `[HAVE]` |

## 3. RIVER-ROAD — Greenhollow ↔ Tidewreck Coast  (PLANNED — design now, build later)
**Band:** **x336–392 (56 long) / y298–323 (25 tall)** — follows the river's **S bank** E to the
delta; channelled by the **river (N)** + a **treeline ridge (S)**. The longest connector (it's the
spine's downhill run to the sea). The **grapple-gate** to the Coast lives at its E end (the
river-gorge), so the band itself is open to anyone but *teases* grapple/hookshot the whole way.

| Element | Where | What | Asset |
|---|---|---|---|
| **River-road spine** | the S bank towpath | the through-line; the river widens W→E (a real journey) | water/`water_deep` `[HAVE⚙]` · `dirt` road `[HAVE⚙]` |
| **FORK: towpath vs the ferryman's stones** | a stepping-stone crossing to the N bank | N bank = a shortcut + a cache, but a missing stone needs **hookshot** | water shallows `[HAVE⚙]` |
| **Landmark: the old toll-bridge (ruined)** | mid-band | a broken bridge — cross the gap with **grapple** (the gorge gate echo); a clear vista landmark | ⚑ bridge prop = `[GAP]` (eliza-structure has bridges — wire) |
| **TEASE ×2: the river-gorge shelf + the wreck on the far bank** | E end | grapple-only shelf (cache) + a see-but-can't-reach beached boat (foreshadows the Coast) | cliff `[HAVE]` ⚑ wreck = `[GAP]` |
| **Mini-encounter: the bandit weir** | a narrows | 2–3 road bandits (LPC bandit = character base) | enemies `[HAVE]` |
| **Rest spot: the miller's ruin** | off the towpath | a roofless mill = shelter + a searchable container (Interactables `search`) | props `[HAVE]` ⚑ mill = `[GAP]` |
| **Cut/search caches ×2** | bramble + a sunken crate | the playground filler keeps the long band alive | prop_bush/barrel `[HAVE]` |

## 4. RESERVED APPROACHES (skeleton now — fully specced when their region is next)
- **Coast → Emberwood (S chasm):** a **hookshot-gated** descent into the volcanic massif; the band
  transitions sea-grass → `ash`/`Earth_Cracked` → `lava` edges; the **fire-vs-cold** opposition
  starts here (warm pools). Teases: `firefrost`-blocked vents (fire walls you can't pass yet).
  `ash`/`lava` `[HAVE⚙]`.
- **Peaks → Hollow Spire (far-N ascent):** the highest, starkest band — `snow`/`snow2`/`ice` +
  `stone_white`/`rock_white`; a sparse, awe-dread climb with **firefrost**-gated ice walls + a
  shard-glow tease. `snow`/`ice`/`stone_white` `[HAVE⚙]` (all just wired in T3).

---

## 5. ASSET ROLL-UP (what a build needs)
- **HAVE / HAVE⚙ (wire, don't source):** every connector GROUND — grass, dirt/road, mud, mudstone,
  gravel, ash, rock/rock_dark/white, stone/stone_white, snow/snow2, ice, sand, the full **water**
  family (Water / Water_Deep / Water_Green / shallows). **All 31 are now wired (T3).** Cut-bushes,
  barrels, signs, fences, rocks, cliffs, chests, enemy sets, the glow-tease FX = in repo.
- **`[GAP]` (source/flag, to the 32px LPC lock):** a **sunk/road-milestone** stone variant, a
  **campfire** prop, a **bridge** (eliza-structure HAS bridges → a wiring pass, likely HAVE⚙), a
  **ruined-mill/wreck** structure, a proper **boarded-cave** mouth (shared with M4). None block the
  ground/lane build — they're set-dressing; omit+flag at build.

## 6. BUILD ORDER (when the eyes-on connector session runs)
1. **Expand the two BUILT bands first** (Belt, Foothill) — biggest felt win, lowest risk (origins
   exist; grow the band + add the table rows). Re-verify the channelled + density gates each.
2. **River-road** with the Coast build (it IS the Coast's approach).
3. Reserved approaches ride their region builds.
> Every expansion is **eyes-on** (composition + feel + the tease readability are HARD-RULE-9 EYE
> items) — this doc places the INTENT; the build session places the pixels + hands the feel to Van.

*Cross-refs: MASTER-MAP §0 (the route bands + the watershed spine) · QUALITY-SPEC §0/§3 (the lock +
density bands) · gating.js (TEASES — list each new tease's payoff tool) · terrainTiles.js (the 31
wired terrains) · INTERACTABLES-DESIGN (cut/search/push caches) · EXCELLENCE-FRAMEWORK (per-region
art-direction + the emotional pacing the connectors carry between moods).*
