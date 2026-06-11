# SPEC — INTERIORS (slice step 2) — FULL-EXPECTATION SPEC, for Van's ~2-min review

> **STATUS: SPEC ONLY — do NOT build until Van approves/edits this.** (THE-SLICE method RULE 1.)
> **Reference (RULE 3):** Stardew Valley interiors (homes/shops with purpose-fit furniture, searchable
> containers, warm lighting, the owner present) + Zelda ALttP interiors (tight rooms, clear entry/exit, an
> object or NPC that rewards the visit). Each facet below names what the reference does; the build is diffed
> against it.

## SCOPE
Every enterable Greenhollow building's interior. Today GH has: **chapel · tavern (tankard f1+f2) · store ·
forge · home1 · home2 · manor · 2 generic cottages.** (Marsh/Peaks reuse the same generic interiors — same
spec applies, but the SLICE = GH only.)

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
