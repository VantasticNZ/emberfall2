# WORLD LAYOUT — the halved-scope world, BUILT greybox + walkable (REPORT)

> **Built (not planned):** the content-sized halved-scope world — **1 city · 2 towns · 5 villages · 2
> dungeons** — laid out at computed sizes, **walkable greybox**, navGate-validated, reachable from
> Greenhollow. Reuses the proven pipeline (the Phase-0 interior/door system + navGates). Per the
> approved `WORLD-MAP-PLAN` structure: **overworld + separate enterable scenes.** Existing game
> preserved (`pre-world-layout`). 13 gates + 19-suite navGates GREEN (27 regions); 0 errors. Stamp `50ab969f`.

## ★ STATUS: 10 content-sized greybox places — the city blocked out into streets/districts, all walkable.

## 1. The scale math (per-place size from content load)
`griddedSettlement()` auto-blocks out each place at its footprint: a **street grid** (walkable lanes
every `pitch` tiles) with **building-footprint blocks** (solid) between → a city reads as streets +
districts, a village as a few blocks + a lane.
| Place | Tier | Tiles | Content it sizes for |
|---|---|---|---|
| **SALTBREAK** | **city** | **56×40** (999 walkable street tiles, ~30 blocks, 4 districts: docks/market/mansion/underworld) | the densest — M13 · ST1-5/8 · ~8 NPC · shops/mansions |
| **Stonereach** | town | 36×28 | M11 · SP1-3 · the Order/mine |
| **Mirefen** | town | 34×26 | M8 · SA1 · Yssa · bog-folk |
| **Fenwick · Cribbins Cove · Cragfoot · Mirage Oasis · Thornwell** | village ×5 | 20×16 each | fisherfolk / fishing / mountain / oasis / woodfolk |
| **Sunken Shrine · Cinder Keep** | dungeon ×2 | 24×18 each | M9/shard 1 · M12/shard 2 |
- **New greybox area:** ~6,600 tiles across **10 separate scenes** (city 2240 + towns 1892 + villages
  1600 + dungeons 864).

## 2. The total world dimensions
- **Overworld (the open-world roaming layer): 640×640 tiles (20×20 chunks)** — the existing walkable
  skeleton (GH centred; Marsh W, Peaks/Spire N, Coast E, Emberwood S; **forking paths + barriers
  (cliffs/water as nav-blocks) + the gating DAG**; walkable end-to-end). *(The `WORLD-MAP-PLAN` target
  is 24×24=768²; resizing the overworld is a separate step — this build adds the content-sized places
  onto the current 640² open-world.)*
- **+ 10 content-sized greybox scenes** (this build) **+ 9 interiors** (Phase 0-2) = **27 regions**.
- **Structure:** overworld + **separate enterable scenes** (cities/towns/villages/dungeons via the
  Phase-0 door system) — so a 56-tile city doesn't bloat the streamed overworld. Engine-feasible
  (proximity-streaming unchanged).

## 3. Connected + WALKABLE (the deliverable)
- **Reachable from GH:** a **WORLD-LAYOUT board** in Greenhollow's south meadow (10 signposts) — walk to
  it, press E, enter any place, walk its streets/lanes, exit back to GH. All 10 live-verified to enter.
- **The open-world between:** the existing overworld (the 8-region skeleton) — forking walkable
  paths/connectors + barriers + the tool-gates (🔒lantern/grapple/hookshot/firefrost/shard_1), GH→all
  walkable (proven in the world-skeleton milestone).
- **navGates pass every new place** (`interiors.test.mjs`, in `npm test`): the **street grid connects
  the spawn → every district chest + the exit; the building blocks hold; no prop on a street.** 19
  interiors+settlements reachability-proven. **No soft-locks.**

## 4. Live proof (eyes-on, real input, stamp `50ab969f`, 0 console errors)
| | Verified | Screenshot |
|---|---|---|
| **The CITY blocked out** | Saltbreak — a street grid of building-block districts, walkable lanes, 4 district chests | `wl-1-city-saltbreak.png` |
| **A VILLAGE** | Fenwick 20×16 — smaller, more open, a few blocks + a lane (the size reads vs the city) | `wl-2-village-fenwick.png` |
| **The WORLD MAP (M)** | overworld focused (the regions + gates) + the **content-sized places listed with sizes** | `wl-3-worldmap.png` |
- The M-map was **fixed** (interiors/settlements were stretching its bbox since Phase 0) — now it shows
  the overworld + a "content-sized places (door-entered scenes)" list.

## 5. NOTES / honest flags (HARD RULE 9)
- **Greybox only** — placeholder dirt streets + building-footprint *markers* (prop_sign). **No final
  art** (the fill-with-assets pass comes after Van approves the layout).
- **The city blockout is a REGULAR street grid** (auto-laid) — reads clearly as a city plan; organic
  district shapes + real building art are the art pass.
- **Doors are clustered on the GH world-board** for guaranteed walkable reach + review. **Distributing
  them across the overworld at each place's grid position** (so you walk the open-world *to* each place's
  door) is the wiring follow-up — the open-world traversal itself already works (the skeleton).
- **Overworld stays 640²** here; resizing to the `WORLD-MAP-PLAN` 768² (24×24) is the next step if Van
  approves that dimension.

## ✅ SUMMARY
- **Built the halved-scope world walkable greybox:** 1 city (56×40, streets+districts) · 2 towns
  (36×28, 34×26) · 5 villages (20×16) · 2 dungeons (24×18) — **all reachable from GH + navGate-valid.**
- **Total:** a 640×640 overworld (the walkable open-world, GH-centred, gated, forking) + **10
  content-sized separate scenes** + 9 interiors (27 regions).
- **Van can walk the whole thing** — the overworld paths + into every content-sized place via the GH
  world-board. 13 gates + 19 navGate suites GREEN; 0 errors. **The laid-out world to walk + approve
  before the asset-fill pass.**
