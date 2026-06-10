# CONNECTED OVERWORLD — build report (the structural rebuild, pass 1: the WEST)

> Make the playable overworld match Van's edited map: ONE world you walk across, settlements at their map
> positions — not a start-village + a board of door-scenes. **Scoped honestly (HARD RULE 10):** this pass
> connects the **WEST corridor** (the marsh towns) fully + walkable + verified; the rest of the world's
> relocation + dressing + gates is flagged for the next pass(es). State preserved: git tag
> `pre-connected-overworld`. 14 gates GREEN; 0 console errors.

## ✅ DONE — the WEST is ONE connected, walkable world
- **Settlements placed at their overworld positions (Van's W→E layout):** added `interactables` (walk-in
  door-entrances) to the **Ashen Marsh** region — **Mirefen** (far-W, tile 243), **Sunken Shrine** (W,
  242), **Lost Cemetery** (NW, 247), **Fenwick** (E toward GH, 273) — each at a walkable bog tile, with a
  **signpost** naming the site. The **built town content is reused** (these enter the existing
  Mirefen/Fenwick/Cemetery/Shrine areas — not rebuilt).
- **Walk-across PROVEN (real movement):** drove the hero WEST from Greenhollow → region transitions
  **Greenhollow → Belt → Marsh** → arrived at the Mirefen entrance (tile 246) → **walked onto the door →
  entered Mirefen** (`overworld-mirefen-entrance.png`). The corridor is 38–43/45 tiles walkable per row
  (open bog, weave around a few dead pines) — one continuous traversable world, regions streaming.
- **Per-settlement identity (west):** the Marsh carries its **bog terrain + `mus_marsh` dread bed + eerie
  tint**; the town interiors keep their own music/tint. The hero arrives in the eerie bog and the towns
  are *there*, at their map positions.
- **The GH notice-board is kept** only as **optional fast-travel** — the world is now walkable to the
  towns **without** it (the board no longer the *only* way in).
- **Doors (carried fix):** the door tile is a normal walkable tile (no collider), the wall is solid, and
  the doorway sprite is offset visually into the wall — so there's no snag at the boundary (door-on-tile
  entry verified last pass; overworld entrances sit on open ground, no wall conflict).

## ❌ DEFERRED — flagged honestly (next pass(es))
| Item | Why / next |
|---|---|
| **Relocate the OTHER settlements** (Stonereach→Peaks N, Cragfoot→Peaks, Saltbreak→Coast E, Cribbins→Coast, Caught→Emberwood S, Capital→Spire N, Dustreach/Thornwell→expansion) | This pass connected the **WEST** fully; the same entrance-relocation must be applied to the Peaks/Coast/Emberwood/Spire regions (each needs walkable-tile placement + verify). Still board-reachable meanwhile. |
| **Overworld town SILHOUETTE** (buildings/walls visible on the overworld at each town site) | Currently a **signpost + door** marks each site (solid-mass buildings tripped the collision gate as non-solid markers). A proper town-exterior cluster (solid, navGate-placed) is dressing for a follow-up. |
| **Traversal GATES on the overworld paths** (electric/ice/wind/fire spell-routes per Van) | The critical **spine gating still holds** (gating.js, no soft-locks). The spell-route gates need the **abilities built first** (electric/dash-leap/etc. don't exist) — the Fenwick ⚡-spur stays walk-reachable so it's not orphaned; FLAG to gate once the ability lands. |
| **Full 24×24 world** (Van's far-N Capital/Spire, far-SE Dustreach) | The overworld is still **20×20**; the extreme-edge positions don't fully fit. Expanding to the MASTER-WORLD-SPEC 24×24 is its own structural pass. |
| **M world-map = Van's exact node graph** | The streamed **regions** sit at their world positions (Marsh W, Peaks N, Coast E, Emberwood S); the in-region town *entrances* don't yet render as separate map nodes. A map-overlay upgrade to show settlement pins is a follow-up. |

## 9-factor (this pass)
Nav/walkability ✅ (corridor walkable; entrances on walkable tiles; navGates + containment GREEN) ·
connectivity ✅ (GH→Belt→Marsh→town, real walk) · per-settlement terrain/music ✅ (west) · no-soft-locks
✅ (14 gates) · perf ✅ · **composition 🟡** (town sites are signpost+door, not silhouettes) · **scope 🟡**
(west connected; other regions deferred).

## ✅ SUMMARY
- **The WEST is one connected, walkable world:** walk GH→west→the Marsh and reach **Mirefen / the Sunken
  Shrine / the Lost Cemetery / Fenwick at their map positions** — verified by real movement, entering
  Mirefen from the overworld. The board is now optional fast-travel.
- **Honest remainder:** relocate the other regions' settlements (Peaks/Coast/Emberwood/Spire), add town
  silhouettes, the spell-route gates (after the abilities), the 24×24 expansion, and the map-overlay pins.
- **For Van:** does walking west into the eerie Marsh and finding the towns *there* (not via a board) feel
  like one world? This is the WEST proven; the same pattern carries to the other regions next.
