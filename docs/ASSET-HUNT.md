# ASSET HUNT — sourcing the MASTER-WORLD-SPEC 🔴 gaps (audit + fetch + manual list)

> Targeted sourcing to fill the spec's "assets" gap. **Headline correction:** the spec's `§7` rated
> assets 🔴 *big GAP* — but the **in-repo check shows ~90% is ALREADY HERE (ElizaWy LPC Objects /
> Structure / Terrain + the LPC character generator + the terrain-v7 atlas), licence-clean (OGA-BY 3.0 /
> CC-BY-SA), just UNWIRED into the game.** The real work is mostly **WIRE-not-source.** The genuinely-
> missing items are narrow (a literal altar; a richer dungeon tileset; extra building/desert variety).
> Bar: LPC-style, 32px-conformable, CC0/CC-BY/CC-BY-SA/OGA-BY/GPL — **no NC/ND/no-redistribute/anti-AI**
> (read the ACTUAL licence, not a store tag). Honours CLAUDE.md HARD RULE 3/9.

## 1. IN-REPO AUDIT — what we ALREADY HAVE (don't re-source — WIRE it)
| Spec gap | Already in-repo (unwired) | Licence | Verdict |
|---|---|---|---|
| **Interior furniture** | `asset-library/2d/items/eliza-objects/Furniture/`: **Beds** (child/single/double, many), **Tables** (Card/Ornate/Rough/Workshop), **Chairs** (Dining A-F · Office · Sofa A-G · Bar Stools · Loveseats), **Dresser · Cabinet · End Table · Desk · Shelf · Bin · Countertop**, **Fireplace + Cast-Iron** (hearth), **Cauldron**, **Rugs** ×4, **Lighting** (Floor/Outdoors/Table), **Mirror · Clock · Planter · Ladder · Sawhorse · Crate · Barrel** | OGA-BY 3.0 | ✅ **HAVE — wire it** (this fixes the greybox-interior flag almost entirely) |
| **Anvil / forge fittings** (Van flag) | `eliza-objects/Furniture/Smithing/`: **Anvils.png · Forge A.png · Workbench, Smith.png** (+ `Small Items/Tools, Smithing.png`) | OGA-BY 3.0 | ✅ **HAVE — wire it** (the real anvil, not the fountain hack) |
| **Buildings (exteriors + interior structure)** | `2d/buildings/eliza-structure/`: **Doors · Floors** (carpets/tile/dirt/subfloor) · **Fences · Bridges** + (walls/windows/roofing/stairs per ledger); `allacrost-stone` exterior | OGA-BY 3.0 | ✅ **HAVE base — wire it** (variety = a narrow top-up, §3) |
| **Biome terrains — desert/sand, snow, lava, water/ocean** | `2d/tiles/lpc-terrains/terrain-v7` atlas indexes **Sand ×2 · Snow ×2 · Lava ×1 · Water ×6 · Dirt ×5 · Grass ×4**; `eliza-terrain` adds **winter/snow + ice-shallows + waterfall + cliffs** | CC-BY-SA / OGA-BY | ✅ **HAVE — wire the atlas slices** (desert/snow/lava/coast are all in the atlas) |
| **Swamp / bog** | the same `lpc-terrains` set (bluecarrot16) bundles **bog/mud/murky-water**; currently the bog is a tinted-grass greybox | CC-BY-SA | ✅ **HAVE — wire the bog slices** |
| **Standout NPCs / character variety** | `2d/sprites/characters/` — the full **LPC modular character generator** parts (bodies/clothes/hair/accessories, male+female, walk+slash, many colours) | OGA-BY / CC-BY-SA | ✅ **HAVE — generate** the NPC roster from parts |
**So:** the asset 🔴 in `MASTER-WORLD-SPEC §7` should be **downgraded to 🟡 — mostly a wiring task.** The
furniture/anvil/terrains/characters are present + ledgered; Phase 2's "greybox furniture" flag is
resolved by **wiring eliza-objects**, not sourcing.

## 2. AUTONOMOUSLY FETCHED + IMPORTED (this session)
| Asset | Source | Licence (read on page + credit.txt) | Conform | Where |
|---|---|---|---|---|
| **[LPC] Dungeon Elements** — crypt/dungeon tileset (brick walls, **prison cell + barred gate**, skeletons/bones, cobwebs, cauldron, filth, animated fire) | [opengameart.org/content/lpc-dungeon-elements](https://opengameart.org/content/lpc-dungeon-elements) — Sharm; contrib. William.Thompsonj | **OGA-BY 3.0** (page also CC-BY 4.0/3.0 · GPL 3.0/2.0) — no NC/ND/anti-AI | ✅ 32px (512×384 + 320×320, **viewed** — genuine LPC crypt) | `asset-library/2d/tiles/lpc-dungeon/` + CREDITS + ledger entry |
*Fetched via `curl` (HTTP 200, 40 KB zip), extracted, licence-vetted, conform-checked by viewing, and
ledgered. Staged in `asset-library/` (not wired to `public/` — the licence gate is unaffected).* This
fills the **dungeon-tileset** gap (#4) — our crypt/keep interiors were greybox street-grids.

## 3. MANUAL-DOWNLOAD LIST (licence-clean, wanted, but download-gated — Van grabs these)
All verified clean (read the OGA "License(s)" field). Save the zip to `asset-library/_import-vet/`,
then ping Claude Code to vet + stage. Preserve each bundle's CREDITS/Attribution `.txt`.
| # | Asset | URL | Licence | What it gives | Save to |
|---|---|---|---|---|---|
| 1 | **[LPC] Cavern and ruin tiles** | https://opengameart.org/content/lpc-cavern-and-ruin-tiles | CC-BY-SA 3.0 / GPL 3.0/2.0 | **the ALTAR fix** — thrones, magic circles, stone signs/arcs, statues, coffin → composite a chapel/temple altar; also crypt walls/lava/water | `_import-vet/lpc-cavern-ruin/` |
| 2 | **[LPC] Medieval Village Decorations** | https://opengameart.org/content/lpc-medieval-village-decorations | CC-BY-SA 4.0/3.0 | statues, grave markers, banners, signage, lighting → temple-yard / shrine dressing | `_import-vet/lpc-medieval-deco/` |
| 3 | **[LPC] Victorian Buildings** | https://opengameart.org/content/lpc-victorian-buildings | CC-BY-SA 4.0/3.0 / GPL 3.0 | 10k+ tiles: **mansions, shopfronts, tenements** → Saltbreak/Stonereach city variety | `_import-vet/lpc-victorian/` |
| 4 | **[LPC] Colonial Buildings** (+a church) | https://opengameart.org/content/lpc-colonial-buildings | CC-BY-SA 4.0/3.0 / GPL 3.0 | Georgian/neoclassical civic + **a church** (the chapel exterior) | `_import-vet/lpc-colonial/` |
| 5 | **[LPC] Adobe Building Set** | https://opengameart.org/content/lpc-adobe-building-set | **OGA-BY 3.0** / CC-BY 4.0/3.0 / GPL 3.0/2.0 | adobe-brick houses → the **Desert** (Dustreach/Oasis) architecture (genuinely not in-repo) | `_import-vet/lpc-adobe/` |
| 6 | **[LPC] Castle Mega-Pack** (optional) | https://opengameart.org/content/lpc-castle-mega-pack | CC-BY-SA 3.0 | cathedral masonry, rose windows, buttresses → the Oracle Capital temples | `_import-vet/lpc-castle/` |
*(I could also auto-fetch some of these — they have direct `…/sites/default/files/*.zip` URLs — but the
big bluecarrot16 packs are CC-BY-SA share-alike + large; Van may prefer to choose which to pull in. Say
the word and I'll fetch + vet any of them autonomously like the dungeon set.)*

## 4. RECOMMENDED SOURCES PER GAP (the durable answer)
- **Interior furniture / anvil / altar:** **already in-repo** (eliza-objects) for furniture+smithing; for
  a literal **altar** there is **no off-the-shelf LPC altar sprite** (verified) → composite from
  **LPC Cavern & Ruin** (throne/magic-circle/stone-sign) + **LPC Medieval Decorations** (statues). This
  is the one true "no clean asset exists" finding — flag the altar as a small composite/commission task.
- **Buildings:** base = **eliza-structure** (in-repo). Variety = **bluecarrot16's LPC Victorian /
  Colonial / Castle** (CC-BY-SA) + **Sharm's Adobe** (OGA-BY, for the desert).
- **Biome terrains:** **already in-repo** — wire the **terrain-v7 atlas** (sand/snow/lava/water/dirt/grass)
  + **eliza-terrain** (winter/ice/cliffs/waterfall). No sourcing needed; a slicing/wiring pass.
- **Dungeon tilesets:** **[LPC] Dungeon Elements** (imported ✅) + **LPC Cavern & Ruin** (manual #1) +
  the in-repo `eliza-objects/Small Items/Dungeon Elements.png` props.
- **Standout NPCs / variety:** **already in-repo** — the **LPC character generator** parts; generate the
  roster. For the unique standouts (the gunhand/ninja-gran/jandal-cop) → custom recolours/overlays on the
  LPC base (in-pipeline), not a new source.
- **Rejected (logged so it isn't re-checked):** *Simple 2D Cave Tileset* (lpc.opengameart.org) — licence
  OK (CC-BY 3.0) but **16×16, non-LPC** → doesn't conform.

## ✅ SUMMARY
- **Auto-imported (1):** **[LPC] Dungeon Elements** — OGA-BY 3.0, 32px, viewed + ledgered + staged
  (`asset-library/2d/tiles/lpc-dungeon/`). Fills the dungeon-tileset gap.
- **Biggest finding:** the spec's asset 🔴 is **mostly already in-repo, unwired** — furniture (incl. the
  **anvil/forge**), desert/snow/lava/water terrains (the terrain-v7 atlas), and the LPC character
  generator are all present + licence-clean. **Downgrade §7 assets to 🟡 (wire-not-source).**
- **Manual-download list (6):** Cavern&Ruin (altar) · Medieval Deco · Victorian · Colonial · Adobe
  (desert) · Castle — all licence-vetted clean, URLs + save-paths above.
- **One true source-gap:** **a literal altar** — no clean LPC altar exists; composite from Cavern&Ruin +
  Medieval Deco (or commission a small one).
- Gates stay GREEN (asset-library staging doesn't touch `public/`); no game/scene changes.
