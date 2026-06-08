# EMBERFALL 2 — ASSET MASTER MANIFEST (every asset measured)

> **Integrated-design foundation, Step 1.** A measured inventory of every art/audio
> asset in the repo (shipped `public/` + staged `asset-library/`), so the master-map
> design works from FACTS, not guesses. **Dimensions are READ from the files**, not
> assumed. Licences are from `docs/ASSET-LEDGER.md` + the per-pack `Credits.txt`
> (quoted). Pair doc: `docs/QUALITY-SPEC.md` (the look/size bar). Doc-only.

**Scope measured:** 491 tile/prop/building/FX/character-sheet/audio files measured
individually (via `PIL.Image.size`) + the **625-part / 34,569-PNG** LPC character
working set summarized from its `manifest.json`. Total ≈ **35,060 assets inventoried**.

**Family:** Liberated Pixel Cup (LPC). Terrain/props = **32 px** grid; characters/enemies/
FX = **64 px** frames (FX 128 px oversize). All AI-safe licences (CC0 / OGA-BY / CC-BY[-SA] /
GPL — none anti-AI). See `ASSET-LEDGER.md` for the machine-checked prefix coverage.

---

## A. CHARACTERS

### A1. SHIPPED — ElizaWy LPC Revised (`public/art/eliza/`) — the LIVE rig
- **52 sheets across 19 layers** (body, body_fem, head, head_fem, eyebrows, hair ×3,
  beard, shirt ×3, pants ×2, shoes ×2, shield, sword). One sheet PER ANIMATION.
- **Measured frame standard (FRAME = 64 px; rows = facing N/W/S/E):**
  - `idle.png` = **192×256** (3 cols × 4 rows)
  - `walk.png` = **512×256** (8 × 4)
  - `attack.png` = **448×256** (7 × 4)
  - `expr.png` (head only) = **768×256** (12 expression cols × 4)
  - `sword_*/shield_* attack` = **896×512** / 448×256 (oversize **128 px** swing frames)
- Licence **OGA-BY 3.0** (`public/art/eliza/` ledger row). Style = LPC "Thin", slightly-chibi head.
- **Builds:** the hero + every named NPC (paper-doll by data; recolours = real LPC variants).

### A2. STAGED — LPC universal working set (`asset-library/2d/sprites/characters/`)
- **625 parts / 34,569 PNG (~49 MB)**, 64 px frames, the 3 rig animations (idle/walk/slash),
  organised bodies/hair/clothing/accessories/weapons/shields. Manifest:
  `characters/manifest.json` (id/category/zPos/bodytypes/colours/anims/authors/licences).
- Licences: GPL 3.0 / OGA-BY 3.0 / CC-BY-SA 3.0 / CC0 mix (per-part in `CREDITS.md`; **none anti-AI**).
- **NOT wired** (staged catalogue; the live rig uses `public/art/eliza`). Builds: any new
  cast member (more bodies/hair/outfits/accessories) on demand.

### A3. LEGACY (do not use)
- `public/art/lpc/` — sanderfrenken Universal-LPC sheets (832×2944 / 832×1344 universal
  format, 34 files). **Superseded by eliza**; CC-BY-SA/OGA-BY/GPL.
- `public/art/kenney/` — Kenney tiles (11 files; **16×16 dirt/grass/garden = OFF the 32px
  grid**, 32×32 props, 192×176 tiny_town). CC0. **Legacy, unreferenced.** ⚑ Off-grid → never mix onto the 32px map.

## B. ENEMIES / MONSTERS (64 px frames)
| Source | Files | Dims (frames) | Licence | Builds |
|---|---|---|---|---|
| **`public/art/monsters/`** (SHIPPED, 8) | bat/eyeball/snake 448×256 · big_worm/ghost/pumpking 384×256 · slime 512×256 · man_eater_flower 768×512 (boss maw) | 64px (boss 128px) | CC-BY-SA 3.0 / GPL 3.0 | the 9 combat archetypes + the Marsh boss |
| **`asset-library/.../enemies/lpc-monsters/`** (STAGED, 12) | as above + bat_extended 128×320, bee 192×128, small_worm 704×256, slime-projectile 64×16 | 64px | CC-BY-SA 3.0 / GPL 3.0 / OGA-BY 3.0 | extra creatures (bee/worm variants/projectile) |

## C. TERRAIN — GROUND + AUTOTILE (32 px grid)

### C1. SHIPPED (`public/art/terrain/`)
- **`lpc_terrain.png` = 1024×2048** — the **[LPC] Terrains "terrain-v7" mega-atlas** (32×64
  = 2048 tiles). Its `.tsx` (staged) defines **34 Wang autotile terrains**: Dirt ×3, **Rock
  White/Gray/Dark/Black**, **Stone White/Tan**, **Mudstone Gray/Brown**, **Gravel**, Grass ×4,
  Soil, **Sand**, **Snow 1/2**, **Ice / Ice_Melting**, **Lava**, Water ×5, Earth_Cracked,
  Hole, Mud, Dirt_Roots. CC-BY 3.0 / CC-BY-SA 3.0 / GPL 3.0. **The autotiler
  (`terrainTiles.js`) currently wires only dirt/road/soil/gravel/sand** — rock/stone/snow/
  lava/water are present-but-unwired. → see GAPS.
- Single 32×32 tiles: `grass`, `dirt`, `path`, `water`, `garden`; pond 9-slice (`pond_nw…se`, 9×32×32).
- Decals (sub-tile): tuft 22×32, grass_tall 27×32, fern 27×16, clover 32×32, flowers 9×6–13×18, dirt_patch 28×20.
- `_src/` bakery sources: `terrain_summer` 512×832, `trees_summer` 512×576, `plants_summer` 512×160, `tilled_soil` 256×256, `lpc_house` 288×224.
- Licence: `public/art/terrain/` ledger row (OGA-BY / CC-BY[-SA] / GPL), ai_safe.

### C2. STAGED — ElizaWy terrain (`asset-library/2d/tiles/eliza-terrain/`, OGA-BY 3.0)
| File | Dims | Type | Builds |
|---|---|---|---|
| `cliff_summer/autumn/winter/winter_ice/spring.png` | **512×448** (16×14 tiles) | **CLIFF AUTOTILE SET** (faces/corners/inner-corners/grass-top/cave-mouth/stairs/waterfall) | continuous cliff faces (Peaks/Coast); winter = snow-capped |
| `terrain_summer/autumn/winter/winter_ice/spring.png` | 512×832 | base ground autotile (grass/dirt/shallows) | seasonal ground |
| `trees_*` | 512×576 | tree props sheet | seasonal trees |
| `Rocks, Cliffs.png` / `Rocks, Grasslands.png` | 192×128 / 192×384 | rock/boulder props | scree/boulders (source of the shipped rock_* crops) |
| `Waterfall.png` | 512×608 | animated waterfall | cliff waterfalls |
| `ice-shallows.png` | 192×192 | ice water edge | frozen tarn/lake |
| `plants_*`/`wildflowers_*`/`flowers.png`/`mushrooms.png` | 144–512 × 160 | ground detail | foliage variety |
| `tilled_soil.png` | 256×256 | farm soil | crop beds (soil only — no growth stages) |

### C3. STAGED — [LPC] Terrains source (`asset-library/2d/tiles/lpc-terrains/`)
- `terrain-v7.png` 1024×2048 (= the shipped atlas) + **`terrain-v7.tsx`** (the Wang autotile
  data) + `CREDITS-terrain.txt`. CC-BY 3.0 / CC-BY-SA 3.0 / GPL 3.0.

## D. BUILDINGS / STRUCTURES

### D1. SHIPPED (`public/art/structures/` + `terrain/forge.png`)
- `house_brick_a` 256×224, `house_brick_b` 192×192, `house_paneled` 160×160, `fountain` 64×96,
  `forge` 96×128, `barrel`/`chest`/`fence_h` 32×32. OGA-BY 3.0 (ElizaWy structure / Sharm).
- **Builds:** the assembled village houses + forge + props in use now.

### D2. STAGED — ElizaWy structure (`asset-library/2d/buildings/eliza-structure/`, OGA-BY 3.0, ~97 files)
Mostly **interior + façade KIT pieces** (assemble, not drop-in): **Walls** (Brick A/B 192–384×288,
**Jagged Stone Walls 192×288**, Adobe, wallpapers), **Floors** (tile/wood/diamond/herringbone,
Gritty Dirt 64×64), **Roofing** (Flat/Gable/Hipped Shingle 768–960×~480, Adobe, Brick Chimney),
**Stairs** (Cement/Wood/Short 160–256×~350), **Pillars** (**Stone Pillar A 288×384**, Floral),
**Doors** (32×48/32×64/arched), **Windows** (Ornamental/**Stone 96×128**), **Bridges** (Wood/Rope
320×384), **Fences**, **Signs** (backgrounds 64×64 + icons), **Structures** (Brick House A/B,
Paneled House A — the shipped exteriors). **Builds:** stone-town walls/windows/stairs/pillars +
interiors (oracle sanctum, keep interior). ⚑ *Exterior assembled "terraced stone town" houses are
limited to the 3 brick/paneled exteriors — a dedicated set is a gap (see GAPS).*

## E. PROPS / ITEMS — ElizaWy objects (`asset-library/2d/items/eliza-objects/`, OGA-BY 3.0, ~173 files)
- **Furniture (94):** beds (child/single/double), seating (chairs/sofas/ottomans/stools — **indoor**),
  tables, dressers/cabinets/shelves, **Cauldron 32×160**, **Smithing/Workbench/Anvil**, fireplace,
  ladder, planter, trough, **Stone Slab 128×128 / Wolf Stone 128×128** (altar candidates).
- **Small Items (60):** baskets/buckets/boxes/crates, **Lumber/Hay/Sawdust**, tools
  (carpentry/sewing/smithing), **Flowers 288×128**, **Dungeon Elements 64×128**, skeletons,
  **Food (26 sheets:** bread/cheese/fruit/veg/meat/seafood/grains/eggs/nuts/mushrooms**)**,
  **Ores & Ingots (8:** coal/copper/gold/iron/silver/stone/tin/alloys**)**.
- **Wall Items (13):** paintings/curtains/lighting/mirrors/posters. **Moveable (6):** cart, wheelchairs.
- **Builds:** shop/home interiors, smithy, altar (Stone Slab/Wolf Stone), market clutter, mine ore,
  food economy. ⚑ *All furniture seating is INDOOR; no outdoor bench. No animals. No crop growth-stages.*

## F. FX (`asset-library/2d/effects/`)
- **`lpc-magic/` (15, CC-BY-SA 3.0 / GPL 3.0):** fire (firelion 512×512 ×4 dir), ice (iceshield/
  icetacle/turtleshell), lightning (lightningclaw), tornado, spikes 640×256, snakebite, torrentacle.
  → tool/spell FX (firefrost, combat magic).
- **`eliza-water/` (5, OGA-BY 3.0):** Splash 384×32, WaterRipple 128×32, Water Reflections 128×96.
  → water splash/ripple.

## G. AUDIO (`public/audio/`, Kenney CC0)
- `swing.ogg`, `hit.ogg`, `charge_impact.ogg` (combat SFX). ⚑ *No music, no ambient, no
  death/hurt/UI cues — flagged in PLAYTEST-LOG.*

---

## H. GAPS TABLE — WORLD-BLUEPRINT region needs vs what we HAVE

`[HAVE]` = a fit asset is in-repo (✅ shipped+wired · ⚙ in-repo but UNWIRED, needs an
autotiler/bake pass — no sourcing) · `[GAP]` = needs sourcing/assembly.

| Region | Need | Status | Asset / note |
|---|---|---|---|
| **Greenhollow** | grass/village/forest/autotile, houses | **[HAVE ✅]** | shipped terrain + structures — complete |
| **West Belt / Marsh** | bog/reed/mud/black-water, pines | **[HAVE ✅]** | terrain-v7 Mud/Water + eliza pines (wired) |
| **Sundered Peaks** | rock/scree GROUND tile | **[HAVE ⚙]** | terrain-v7 **Rock_Gray** (tile 109) — present, **unwired** |
| | cliff AUTOTILE face | **[HAVE ⚙]** | eliza `cliff_summer.png` — present, needs cliff-autotiler |
| | snow-cap | **[HAVE ⚙]** | terrain-v7 **Snow_1/2/Ice** + `cliff_winter.png` |
| | terraced stone-town (exterior) | **[GAP / assemble]** | Jagged Stone Walls + Stone Pillar/Windows + brick houses HAVE; a dedicated terraced-stone-town exterior set = gap |
| | cave mouth (mine/keep) | **[HAVE ⚙]** | eliza cliff sheet cave + `Dungeon Elements` |
| **Tidewreck Coast** | ocean / deep water / shore | **[HAVE ⚙]** | terrain-v7 Water/Water_Deep/Shallows + eliza-water FX |
| | sand / dune | **[HAVE ⚙]** | terrain-v7 **Sand** |
| | sea-cliffs | **[HAVE ⚙]** | eliza cliffs |
| | harbour / DOCK / PIER | **[GAP]** | Wood/Rope Bridge approximates; dedicated dock = gap |
| | SHIPWRECK on the reef | **[GAP]** | none |
| | LIGHTHOUSE | **[GAP]** | none (assemble from structure kit? = gap) |
| **Emberwood** | lava ground | **[HAVE ⚙]** | terrain-v7 **Lava** |
| | frost / ice ground | **[HAVE ⚙]** | terrain-v7 Ice/Snow + ice-shallows |
| | fire / ice FX | **[HAVE ✅]** | lpc-magic |
| | VOLCANO cone (silhouette) | **[GAP]** | cliffs approximate; dedicated cone = gap |
| | burnt / frosted trees | **[GAP / recolour]** | `trees_winter` = frost; BURNT tree = recolour/source |
| | ash ground | **[HAVE ⚙ / approx]** | Earth_Cracked / Rock_Black / Rock_Dark |
| **Hollow Spire** | tall TOWER / spire structure | **[GAP]** | none (tallest structure = brick house) |
| | ALTAR / binding chamber | **[HAVE ⚙ / partial]** | Stone Slab / Wolf Stone / Dungeon Elements |
| | oracle sanctum interior | **[HAVE ⚙]** | eliza-structure interiors |
| **Cross-cutting** | ANIMALS / critters | **[GAP]** | none in repo |
| | CROP growth-stages | **[GAP]** | `tilled_soil` HAVE; growing-crop sprites = gap |
| | outdoor BENCH | **[GAP]** | seating is all indoor |
| | tool HELD-items (lantern/grapple/hookshot/firefrost) + their FX | **[GAP / partial]** | lpc-magic covers spell FX; held-item sprites = gap |
| | fast-travel WAYSTONE | **[HAVE ⚙ / approx]** | sign/Stone Pillar approximate |

### Gap count by region (needs-sourcing/assembly `[GAP]` only)
- **Greenhollow:** 0 · **West Belt / Marsh:** 0
- **Sundered Peaks:** 1 (terraced stone-town exterior) — *the rest are HAVE-but-unwired*
- **Tidewreck Coast:** 3 (dock/pier, shipwreck, lighthouse)
- **Emberwood:** 2 (volcano cone, burnt trees)
- **Hollow Spire:** 1 (tower/spire structure)
- **Cross-cutting:** 4 (animals, crop growth-stages, outdoor bench, tool held-items)
- **TOTAL distinct GAP items: 11** (+ ~8 HAVE-but-UNWIRED that need an autotiler/bake pass, NOT sourcing).

**Headline:** the biggest "missing" items (rock ground, cliffs, snow, lava, ocean, sand) are
**already in-repo and licence-vetted — they are a WIRING gap, not a sourcing gap.** True
sourcing gaps are the region SET-PIECES (dock/wreck/lighthouse/volcano/spire) + cross-cutting
life (animals/crops/bench/tool-items). See `PEAKS-ART-CANDIDATES.md` for the Peaks wiring path.

---

## I. CONTRADICTIONS / FLAGS (reconcile, don't override)
1. **STYLE-GUIDE vs live scale/zoom:** STYLE-GUIDE says *"Scale mode: ENVELOP; zoom
   [0.7, 0.85, 1.1], default 0.85."* The **live OverworldScene uses `Phaser.Scale.RESIZE`
   + zoom 1.25** (`main.js:31`, `OverworldScene.js:85`). STYLE-GUIDE describes the *discrete*
   RegionScene era. ⚑ **Flag for QUALITY-SPEC to set the canonical value** (see that doc §1).
2. **Off-grid legacy art:** `public/art/kenney/` has 16×16 tiles (off the 32 px grid) + the
   `public/art/lpc/` universal sheets are superseded. Both legacy/unreferenced — **keep out of
   new maps** (QUALITY-SPEC palette/grid rule should forbid mixing).
3. **terrain-v7 under-wired:** 34 autotile terrains exist; only 5 are wired. Not a contradiction,
   a **latent capability** the master map should exploit (rock/snow/lava/water/sand all ready).
4. **No animals/crops/bench/tool-items** despite WORLD-BIBLE/Part-2.6 "living world" intent —
   a real gap (cross-cutting), not yet sourced.

*Cross-links: ASSET-LEDGER.md (licence gate) · STYLE-GUIDE.md (fit values) · QUALITY-BIBLE 2.6
(Gate I cohesion) · WORLD-BLUEPRINT.md §7 (asset reality-check) · PEAKS-ART-CANDIDATES.md ·
QUALITY-SPEC.md (the bar these assets are judged against). Measured 2026-06-08; doc-only.*
