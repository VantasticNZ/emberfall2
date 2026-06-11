# SPEC — INTERIORS (slice step 2) — FULL-EXPECTATION SPEC **v2** (rules layer), for Van's ~2-min RE-review

> **STATUS: SPEC ONLY — do NOT build until Van approves/edits this v2.** (THE-SLICE method RULE 1.)
> **v2 adds the RULES LAYER Van identified** (§§ R1–R5 below): the property-type × region matrix, the
> non-collision rules, the stairs/floors rules, the theme/style rules, and the locked traversal rule —
> the write-once rule-set so every region's interiors are correct by construction. The 14 facets + case
> list + VAN-TEST (further down) are unchanged unless noted.
> **Reference (RULE 3):** Stardew Valley interiors (homes/shops with purpose-fit furniture, searchable
> containers, warm lighting, the owner present) + Zelda ALttP interiors (tight rooms, clear entry/exit, an
> object or NPC that rewards the visit). Each facet below names what the reference does; the build is diffed
> against it.

## SCOPE
Every enterable Greenhollow building's interior. Today GH has: **chapel · tavern (tankard f1+f2) · store ·
forge · home1 · home2 · manor · 2 generic cottages.** (Marsh/Peaks reuse the same generic interiors — same
spec applies, but the SLICE = GH only.)

## R1 — PROPERTY-TYPE × REGION-STYLE MATRIX (the write-once rule-set)
For each building TYPE, what its interior **MUST / MAY / MUST-NOT** have — then skinned per REGION-STYLE
(R4). Build every region's interiors from this, not ad-hoc.
| type | MUST have | MAY have | MUST NOT have |
|---|---|---|---|
| **home** | bed · hearth/heat source · table · a floor that fits the resident · 1 reach-path to every tile | dresser/chest · a resident NPC · a small personal item | shop counter · forge · altar · multi-floor (unless "manor") |
| **shop (store)** | counter · stocked shelves/barrels · the shopkeeper at the counter · a clear customer path to the counter | a back-room door · a chest | bed in the sales floor · forge/altar |
| **forge** | anvil · bellows/hearth-glow · tool rack/table · heat lighting | a back living area · a weapon display | bed in the work area · altar · plush home furniture |
| **tavern** | bar/counter · tables+stools · hearth · the keep behind the bar · **stairs up** (rooms above) | a fireplace nook · a cellar door · patrons | altar · forge |
| **chapel** | altar · pews/benches · candle/sacral lighting · a central aisle (clear) | a side shrine · a small bell | bar · forge · bed in the nave |
| **manor** | grander home set (bigger room or **2 floors via stairs**) · finer furniture | study/library · a servant | shop counter · forge |
| **hut (marsh)** | a single rough room · bog-appropriate floor/props · a hearth | herbs/charms · a cot | fine furniture · multi-floor |
Generic homes rotate a **set of ≥N variants** (Van decision (a)) drawn from the `home` row.

## R2 — NON-COLLISION RULES (encoded as table cases)
- **Min clear path:** every interior has a **≥1-tile-wide walkable path** from the entry spawn to **every
  container + every NPC + every exit/stairs**; no tile is reachable only by clipping furniture.
- **Door/stairs zone CLEAR:** the spawn tile + the tile in front of every door/stairs is **walkable and
  unblocked** (no furniture in the threshold; you never spawn on or behind a solid).
- **All containers reachable** (a body can stand adjacent to open it) and **no walk-behind trap** (no pocket
  a player can enter but not leave; navGate flood-fill proves full reachability + a sealed perimeter).
- **No solid prop on a walkable tile** (the collision-matches-visual-mass rule, inside too).

## R3 — STAIRS / FLOORS RULES
- **Multi-floor threshold:** a building gets a **second floor (stairs)** only if its TYPE is `tavern` or
  `manor`, OR its exterior footprint ≥ a size threshold (TBD on build — e.g. ≥ ~10×10 interior). Homes/
  shops/huts are **single-floor** unless explicitly flagged.
- **Stairs ≠ exit door:** floor-links carry `stairs:true` (built) → up = the next floor, down = the prior,
  leave (ground floor only) = outside. Stairs are placed against a wall, clear approach (R2).
- **What's upstairs:** tavern = guest **rooms** (beds); manor = **private quarters/study**. Each upper floor
  is its own built, isolated interior with its own `back` (down) link.

## R4 — THEME / STYLE RULES (interior matches exterior + region)
Interior **floor + wall + palette** are chosen per REGION-STYLE so inside reads continuous with outside:
| region | interior materials / palette |
|---|---|
| **Greenhollow** | warm wood/plaster, `stone`/`dirt` floor, cosy lamp-warm tint |
| **Ashen Marsh** | rough timber + bog-grime, `mud`/`dirt` floor, murky cold tint |
| **Sundered Peaks** | stone/`rock` floor, cold blue-grey, fire-glow accents |
| **Tidewreck Coast** | salt-bleached wood, `sand`/plank, sea-grey light |
| **Desert (M3)** | adobe/clay, `sand`/`soil`, warm ochre |
A building's interior **floor `set` must be a real TERRAIN set** (gated; the `floor:'wood'`→black bug).

## R5 — TRAVERSAL RULE (Van, verbatim — into the spec + reconciled with `gating.js`)
> *"Passes are unpassable except with the stated item/ability; paths can have side-areas (secrets/dead-
> ends/extras); a solid traversable path must always exist between places."*
- **Reconcile:** this is the law `gating.js` + the `no-soft-locks` gate already enforce for the OVERWORLD
  (every gated pass keys to a stated ability; every key obtainable in order; a clear main route always
  exists). v2 **extends it to interiors + the whole world**: an interior/dungeon may gate a side-area behind
  an ability (a secret/extra), but the REQUIRED route through it always has a solid, item-free traversable
  path. Side-areas = optional (secrets, dead-ends, extras); they never block progress.
- Encoded as a case: *every region/interior — there is a solid traversable main path between its entries
  with NO ability/item required; any ability-gated bit is a side-area, never on the only path.*

## R6 — ROOM-COMPOSITION RULES (rooms read as rooms, shops as shops; per-item, gate-enforced)
Furniture is base-anchored (sits on its tile, grows UP toward the back wall). Placement by TYPE:
- **Tall storage** (shelf · wardrobe/cabinet · dresser) — **MUST back a wall** (top edge near the back wall,
  or flush to a side/bottom wall). Never floating mid-room.
- **Fireplace** — **embedded in a wall** (backs the wall; the hearth tucks into it).
- **Bed** — **wall-headed or cornered** (backs the top/side wall).
- **Table · bench · stool · anvil · crate · barrel** — MAY be central (work/gather pieces).
- **Counter** (a table in a shop) — **separates the keeper zone (behind) from the customer zone (front)**:
  placed across the room with the keeper NPC behind it, the customer path in front.
- **Altar** — the chapel centre-piece (head of the nave). Nothing ELSE floats mid-room.
**Gate:** `furniture-non-collision (R2+R6)` asserts per-item — wall-back types touch a wall (`T≤1.6` or a
side/bottom edge), nothing overlaps, nothing blocks a door/approach; base-anchored items MAY embed into the
BACK wall (that's intended, not a clip). Plus `fence-clearance` (R6 exterior): every `prop_fence` ≥2 tiles
clear of every building entrance + approach, fully solid (no part-walkthrough fence across a doorway).

## THE FACETS — what every interior must have (the professional bar)
| # | Facet | The bar (reference) | Notes / decisions for Van |
|---|---|---|---|
| 1 | **Distinct layout per building type/purpose** | Stardew: a shop ≠ a home ≠ a tavern at a glance | Today **many houses open the SAME generic room** (the known repeat-look bug). Bar: a **purpose-fit set** — chapel (pews/altar), tavern (bar/tables/hearth/upstairs rooms), store (counter/shelves/stock), forge (anvil/bellows/racks), home (bed/hearth/table), manor (grander home). Generics → a **rotated SET of ≥3 home variants**, not one. |
| 2 | **Furniture that fits the resident** | a smith's home has tools; a priest's, books/candles | Furniture chosen per owner, from the licensed library; no placeholder/colour-box (omit+flag instead). |
| 3 | **Searchable containers + loot rules** | Stardew: chests/cupboards you open once | ≥1 container per interior where apt; **loot is once-only + persists** (chunk-delta `recordOpened`); no farm-loop. Trespassing into a home + looting = a **Karma cost** (ties to the door morality). Decision for Van: do private homes have lootable goods, or only "nothing of mine to take"? |
| 4 | **Lighting / mood** | warm interior tint vs the outside | Each interior has a **groundTint/ambient** fitting its mood (cosy home, dim forge-glow, cand-lit chapel). No flat grey. |
| 5 | **Entry/exit placement** | you exit where you entered, facing out | Exit door embedded in the wall at a sensible spot; **exit returns to the exact outside doorway tile** (valid-exit gate). Spawn-in faces into the room, on a clean walkable tile. |
| 6 | **The resident NPC present + relevant** | the shopkeeper is at the counter | Where the building has an owner (Pem=store, Hodge=forge, etc.), the **NPC is inside** and says something fitting. Decision: which buildings have a resident vs empty? |
| 7 | **Collision + depth correct** | walk around furniture; sort behind/in front | Solid furniture blocks + y-sorts (navGate: body routes around it); no walk-through solid, no z-flicker. |
| 8 | **Isolated rendering** | only this room visible, void around | Already enforced (`_inInterior` loads only the active interior). Re-verify per interior. |
| 9 | **Persistence of looted/changed state** | a looted chest stays looted on re-entry | Chunk-delta persists opened/picked across save/reload. |
| 10 | **Audio inside** | muffled/indoor bed + sfx | An **interior music/ambient** (or a clear "indoors" cue) distinct from the overworld; door open/close sfx. Decision: per-type beds or one indoor bed? |
| 11 | **Size proportional to the exterior** | a cottage interior isn't a hall | Interior footprint scaled to the building's exterior mass (no tiny room in a manor, no hall in a hut). |
| 12 | **No black floors / voids** | every tile a real floor | Floor `set` is a real TERRAIN set (gated); walls sealed; no void tile reachable. |
| 13 | **Stairs where multi-floor** | tavern up/down reads as stairs | Floor-links are stairs (built); up→f2/down→f1, leave→outside. |
| 14 | **Feel** | entering is quick + readable; no snag | Smooth transition (fade), spawn not on the threshold line, instant readability of the room's purpose. |

## EXHAUSTIVE-TABLE CASE LIST (every interior × every case — to test post-build)
For EACH GH interior: 1 layout-matches-purpose · 2 furniture-present(non-placeholder) · 3 container-loots-once+persists ·
4 lighting-applied · 5 exit-returns-to-outside-doorway(valid tile) · 6 resident-present-where-specced ·
7 collision+depth(navGate, no walk-through, no z-flicker) · 8 isolated(only this room renders — pixel/occlusion) ·
9 looted-state-persists-across-reload · 10 interior-audio-plays(ears/route-verified) · 11 size-proportional ·
12 floor-real+no-void(pixel) · 13 stairs(if multi-floor) · 14 spawn-clean+smooth-transition.
**Plus the player-pass (RULE 2):** wander each room, bump furniture, re-loot, re-enter, leave mid-action.

## VAN-TEST — INTERIORS (~5 min draft, refine on approval)
On a FRESH load (F8 first), after entering via the (frozen) doors:
1. Enter **chapel, tavern, store, forge, a home** — each room **looks different** + fits its purpose (not the same room).
2. **Furniture reads** (a forge has an anvil, a home a bed) — nothing is a blank box.
3. **Open a container** → get loot once; **leave + re-enter** → it stays looted.
4. **Resident** is there where expected (Pem in the store, etc.) and says something.
5. **Walk around** — furniture blocks you, depth looks right, the room is lit/cosy, only this room shows (black around).
6. **Tavern:** upstairs → up; downstairs → floor 1; leave → outside.
7. **Exit** each → land on the **outside doorway tile**, never black.
**PASS = all of the above feel like a real game's interiors, no snag.**

## OPEN DECISIONS FOR VAN (please mark)
- (a) Generic homes → how many distinct variants in the rotation (3? 5?)?
- (b) Which GH buildings have a **resident NPC inside** vs empty?
- (c) Private-home **looting**: allowed (with Karma cost) or "nothing to take"?
- (d) Interior **audio**: one shared indoor bed, or per-type?
- (e) Any building that needs a **bespoke** (hand-authored) interior beyond the type-set (e.g. the chapel)?
