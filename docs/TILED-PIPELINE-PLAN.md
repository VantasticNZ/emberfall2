# TILED → EMBERFALL 2 — PIPELINE RESEARCH + SETUP PLAN

> **Doc-only research** (2026-06-09). How to wire **Tiled** (the map editor, mapeditor.org) into
> this **Phaser 3.90 / Vite 6** game on the locked **32px LPC** grid, reconciled with the existing
> `worldmap.js` region adapters, the **pixel-truth colliders**, the **entrance contracts**, the
> **chunk-delta save**, and the verify gates. **Not wired here** — wiring + the fit-check are an
> eyes-on session WITH Van (this is the plan to run then).

## 0. Decision up front — Tiled as a LAYOUT tool that FEEDS the adapters (not a replacement)
The engine is already data-driven + procedurally streamed (`worldmap.js` regions → `OverworldScene`
streams chunks; terrain via the `terrainTiles.js` autotiler; colliders DERIVED from opaque pixels;
saves keyed by chunk+id). **Recommendation: use Tiled for HAND-CRAFTED layout** (set-pieces,
dungeons, dense towns, the connector zones) and **import a Tiled map into the SAME region-adapter
shape** the engine already consumes — so depth-sort, pixel-truth collision, streaming, save deltas,
and every gate keep working **unchanged**. Tiled does NOT replace the procedural belt/streaming or
the autotiler; it's a second authoring front-end for the *placed* content (`props` / `interactables`
/ `npcs` / `chests` / `combat.enemies` / `entrances`). This is the lowest-risk, gate-preserving fit.
*(Alternative considered: LDtk — nicer for level-linking + has a clean JSON, but Phaser's
first-class loader is for Tiled JSON, and our content is region-data not tile-grid-first, so Tiled
+ a thin importer wins.)*

## 1. SETUP (one-time)
1. **Install Tiled** (mapeditor.org; free/open). New map: **Orthogonal**, tile size **32×32**,
   layer format CSV/Base64-zlib, **infinite OFF** (fixed region rects, like `worldmap.js bounds`).
2. **Tilesets (the LOCKED art):**
   - **Terrain:** import the shipped **`terrain-v7`** atlas (`asset-library/2d/tiles/lpc-terrains/`,
     the same one `terrainTiles.js` is generated from) as a Tiled tileset (32px). Define Tiled
     **Wang/terrain brushes** matching our 31 wired terrains (grass/dirt/rock/snow/water/mud/…) so
     Tiled paints feathered edges the same way the autotiler does.
   - **Props:** import each prop PNG (`public/art/terrain|structures/*.png`) as **image-collection
     tilesets** (one tile per prop) so props drop onto an **object layer** by reference. Keep the
     Tiled tile `name` == the engine **PROPS key** (`prop_barrel`, `prop_house_a`, …) — that name is
     the import key.
   - Keep a `tiled/` working dir (NOT shipped): `tiled/tilesets/*.tsx` + `tiled/maps/*.tmj`.
3. **Custom object Types** (Tiled "Custom Types" / class) so authored objects carry our data:
   `prop` (props key, solid, scale, tint, flip), `interactable` (via, id, loot, locked, …),
   `npc` (parts, facing, schedule, quest), `chest` (id, gold, line), `enemy` (id, placeId),
   `entrance` (connectsTo, gate, pos). These mirror the region-adapter fields exactly.

## 2. AUTHORING a region in Tiled
- **Tile layers** (drawn): `ground` (terrain Wang brush), optional `ground_detail` (decals).
- **Object layers** (placed, x/y in px): `props`, `interactables`, `npcs`, `chests`, `enemies`,
  `entrances`, `colliders` (only for BESPOKE walls/channels — most prop collision is automatic, §4).
- Author on the **32px grid**; objects snap to tile centres (so `tx,ty` survive the round-trip).

## 3. EXPORT
- Export each map as **`.tmj` (Tiled JSON)** with **external tilesets** (`.tsx` referenced, not
  embedded) so the art isn't duplicated per map. Put exports in `public/maps/<region>.tmj` (Vite
  serves them) OR `src/data/maps/` (bundled/imported).
- A Tiled **command/extension** can auto-export on save (`File → Export As` → JSON; or `tiled
  --export-map`), so authoring → JSON is one keystroke.

## 4. IMPORT into Phaser/Vite — a THIN `tiledToRegion()` adapter (the key piece)
Rather than `this.make.tilemap` (which assumes a tile-grid render), write **`src/data/tiledImport.js`:
`tiledToRegion(tmj)` → the SAME object `worldmap.js` exports** (`{ key, origin, bounds, props,
interactables, npcs, chests, combat, entrances, terrain, … }`). Then `OverworldScene` consumes it
with **zero engine change**. Mapping:
- **Object layers → arrays:** each Tiled object → `{ key|via|id|…, x, y, …customProps }` (x,y already
  px; tx,ty = x/32). Object `name`/Type → the engine key.
- **Ground tile layer → terrain patches:** convert painted Wang regions → `terrain:[{set, tx, ty,
  w, h}]` patches the existing autotiler renders (or, simplest first cut, a per-tile list). The
  31 wired sets map 1:1 to Tiled brushes.
- **Stable ids:** carry Tiled's object `id` (or the authored `id`) as the `placeId` → the chunk-delta
  save keys off it (chests/enemies/interactables stay permanent — verified by SavePermanence.test).

## 5. RECONCILIATION with the four pillars (must hold, or a gate breaks)
| Pillar | How Tiled reconciles |
|---|---|
| **Pixel-truth colliders** (`solidBox` from opaque pixels) | **Don't author prop colliders in Tiled.** A `prop`/`interactable` with `solid:true` gets its collider from `solidBox(key, PROPS[key])` at build — SAME as today, automatically pixel-accurate. Tiled's `colliders` object layer is ONLY for bespoke region walls/channels (cliff rings, lane edges) → static rects. Keeps gate #10 green. |
| **Entrance contracts** (`entrances.js` SSOT + gate #13) | Tiled `entrance` objects are **validated against `entrances.js`, not a bypass.** The importer asserts each Tiled entrance matches the SSOT two-sided handshake + gate; a mismatch fails import (mirrors the gate). Author entrances in Tiled for POSITION; `entrances.js` stays the contract. |
| **Chunk-delta save** (open/kill/pick by chunk+id) | Tiled objects keep **stable ids** → `placeId` → deltas persist unchanged. New ids just need to be unique per region. |
| **Streaming + density/channelled gates** | A Tiled region is a fixed rect with `bounds` → it slots into the existing region-load/stream path. Run `verify.mjs` on the imported region exactly as for code-authored ones (density floor, channelled-not-open, seam coherence, prop-key integrity all apply). |

## 6. FIT-CHECK PLAN — a THROWAWAY round-trip test map (run WITH Van)
**Goal:** prove the whole loop before authoring any real region. Build `tiled/maps/_fittest.tmj`:
1. A **16×12 tile** test region: a `ground` layer painted with 2 terrains (grass + a `water` pool
   via the Wang brush), an `obstacle` rock + a `house` on the `props` layer (solid), one
   `search`-barrel on `interactables`, one `chest`, one `entrance` linking to Greenhollow.
2. Export → `public/maps/_fittest.tmj`. Run `tiledToRegion()` → register as a dev region.
3. **Acceptance (go/no-go):**
   - [ ] Ground renders (grass + the water pool feathered) at 32px, crisp.
   - [ ] The house + rock render + **depth-sort by feet** (hero draws in front below / behind above).
   - [ ] The house/rock **collide pixel-truth** (the auto-test: stop at the visible edge, no clip).
   - [ ] The barrel **searches once** + the chest loots once; both **persist across save+reload**.
   - [ ] The entrance **handshakes** with Greenhollow (gate #13 passes on the imported region).
   - [ ] `npm run verify` is GREEN with the imported region in `REGIONS`.
4. If all ✅ → Tiled is viable; pick the first real target (a hand-crafted set-piece — e.g. the
   Sunken Shrine dungeon, or a connector zone from CONNECTORS.md). If any ✗ → fix the importer (it's
   the only new code) and re-run; the engine stays untouched.

## 7. RISKS / NOTES
- **Terrain feathering parity:** Tiled Wang brushes must match our autotile corner logic — the
  fit-check water pool de-risks this; if parity is fiddly, author ground as flat terrain patches
  (`{set,tx,ty,w,h}`) and let our autotiler feather at runtime (keeps one terrain truth).
- **No engine fork:** the importer is the ONLY new code; if it ever diverges from the region shape,
  the gates catch it. Keep `worldmap.js` (procedural/streamed) and Tiled (hand-crafted) both feeding
  the same `REGIONS` list.
- **Don't ship `tiled/` sources or duplicate art** — `.tsx` reference the existing `public/art`;
  commit the exported `.tmj` + the importer only.
- **Licence:** Tiled is open-source; the LPC art is already vetted/ledgered — no new asset risk.

*Cross-refs: worldmap.js (the region-adapter shape to target) · terrainTiles.js (the 31 wired Wang
brushes) · assets.js `solidBox` (pixel-truth colliders — NOT authored in Tiled) · entrances.js +
verify gate #13 (the entrance contract Tiled validates against) · SaveManager (stable-id deltas) ·
CONNECTORS.md / MASTER-MAP (candidate first hand-crafted targets).*
