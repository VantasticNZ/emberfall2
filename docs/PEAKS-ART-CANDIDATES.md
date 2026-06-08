# PEAKS ART CANDIDATES — licence-vetted mountain tiles (sourcing + proposal)

> **Session: ART-SOURCING (find tiles; do NOT import/build).** Goal: a cohesive
> mountain Sundered Peaks. The build read wrong because cliffs were placed as
> disjointed single-tile *props* and the ground is stone-TINTED green grass (no rock
> ground tile). This doc ranks licence-safe tiles to fix that, with the exact get-it
> steps. **Import happens in the NEXT session, per-asset, with ledger entries + verify.**

## TL;DR — the gap is ALREADY SOLVED IN-REPO (no new download required)

The two priority tiles **already exist in the repository, already licence-vetted, and
(for the ground) already shipped in the live atlas** — they were simply never wired:

| Need | Where it already is | Licence (AI-safe) | What's missing |
|---|---|---|---|
| **(1) Rock/scree GROUND tile (autotiling)** | `public/art/terrain/lpc_terrain.png` (the **shipped** atlas — it IS the full 1024×2048 `terrain-v7`) → terrain **`Rock_Gray`** (tile 109), + `Rock_Dark/White/Black`, `Stone_Tan`, `Gravel_1`. Wang/corner-autotile data already authored in `asset-library/2d/tiles/lpc-terrains/terrain-v7.tsx`. | CC-BY 3.0 / CC-BY-SA 3.0 / GPL 3.0 | **One line** in `scripts/build_terrain_autotile.mjs` (`OVERLAYS`) + re-gen `terrainTiles.js`. **No art, no download, no new licence.** |
| **(2) CLIFF / rock-face set (autotiling into continuous faces)** | `asset-library/2d/tiles/eliza-terrain/cliff_summer.png` (+ `cliff_autumn/winter/winter_ice`) — a complete LPC **cliff autotile set**: top edges, outer + inner corners, vertical faces, grass-top transition, a cave mouth, stairs, waterfall. 512×448 = 16×14 tiles @ 32px. | OGA-BY 3.0 | Bake into `public/art/` + ledger row + **a cliff-aware autotiler** (height: top→face→base — not the flat 4-corner Wang). This is the real engineering. |
| **(3) SNOW cap (bonus, lower priority)** | Same shipped atlas → `Snow_1`, `Snow_2`, `Ice`, `Ice_Melting`; plus `cliff_winter.png` (snow-topped cliffs). | CC-BY-SA / OGA-BY | Add `snow` to the generator (like rock) + use the winter cliff variant up high. |
| **(4) Stone-town buildings (bonus)** | `asset-library/2d/buildings/eliza-structure/Walls/Jagged Stone Walls.png`, `Pillars/Stone Pillar A.png`, `Stone Slab`. | OGA-BY 3.0 | Assemble + bake stone-house props (a later pass). |

**Conclusion:** this is **not an art hunt — it's a wiring/autotiler pass.** Every tile
needed for a cohesive Peaks (and for the future Coast/Emberwood/Spire — see the atlas's
`Lava`, `Water_*`, `Sand`, `Snow`) is already in the licence-vetted repo. The external
URLs below are **provenance + optional upgrades**, not requirements.

---

## Evidence — licences quoted

### In-repo, primary (use these)

**`lpc-terrains/terrain-v7.png` — "[LPC] Terrains" (bluecarrot16 et al.)**
- Repo credit file `asset-library/2d/tiles/lpc-terrains/CREDITS-terrain.txt` lists the
  component sources, each **CC-BY 3.0 / CC-BY-SA 3.0 / GPL 3.0** — e.g.
  *"[LPC] Sand+Rock Alt Colors — William.Thompsonj, Daniel Eddeland — CC-BY-SA 3.0 / GPL 3.0"*
  (the rock-ground source). No anti-AI / non-commercial clause anywhere.
- Canonical OGA page: <https://opengameart.org/content/lpc-terrains> — verified license
  **CC-BY-SA 4.0 / CC-BY-SA 3.0**, **no anti-AI / no non-commercial clause**; description
  explicitly lists *"sand, dirt, rock, stone, grass, water, snow, ice"* (+ lava, bog, mud).
- 32px, LPC palette → exact style match (it is literally the atlas the game already uses
  for dirt/road/soil/gravel/sand autotiling).
- **Proof it's already shipped + wired-ready:** `public/art/terrain/lpc_terrain.png` is
  1024×2048 (= terrain-v7, 2048 tiles), and `src/data/terrainTiles.js` is auto-generated
  from `terrain-v7.tsx` by `scripts/build_terrain_autotile.mjs`, whose `OVERLAYS` currently
  = `{dirt, road, soil, gravel, sand}` (full tiles 97/100/333/345/336 — they match the
  `.tsx` terrain indices). Adding `rock: idx('Rock_Gray')` emits a `rock` autotile set the
  same way. Rock_Gray (tile 109) is **already in the loaded texture**.

**`eliza-terrain/cliff_summer.png` (+ seasons) — ElizaWy / LPC Terrain**
- Repo credit `asset-library/2d/tiles/eliza-terrain/Credits.txt`:
  *"Cliff (all seasons) — ARTIST(S): Eliza Wyatt (DeathsDarling), Lanea Zimmerman (Sharm) — LICENSE: OGA-BY 3.0"*
  and the header note *"Hyptosis has given permission to use his CC-by 3 work under the OGA-by 3 license."* No anti-AI clause; OGA-BY is attribution-only.
- Source: ElizaWy LPC — <https://github.com/ElizaWy/LPC> (Terrain). 32px LPC.
- Already covered by the ledger prefix `public/art/terrain/` (OGA-BY, ai_safe=yes) once baked.

### External — optional upgrades / provenance (NOT required this build)

**[LPC] Mountains — bluecarrot16** — <https://opengameart.org/content/lpc-mountains>
- License **CC-BY-SA 4.0 / CC-BY-SA 3.0** (fetched + verified); **no anti-AI / non-commercial**.
- The *dedicated* cliff-autotile set: *"many varieties of mountains and hills… grassy
  variations, snowy overlays for all varieties, Tiled terrains + Tiled automapping files…
  terrain tool to draw cliffs, automap to draw the walls."* 32px LPC.
- **This is the strongest external candidate** if the eliza cliff sheet proves awkward —
  it ships the automapping rules (cliff-wall placement) we'd otherwise hand-write, and has
  built-in snow overlays for the high peaks.
- ⚑ **Caveat (still licence-safe, but flag it):** one *complementary* style in its Tiled
  files derives from *The Mana World: Forest Tileset* under **GPL v2**. GPL is AI-safe and
  whitelisted, but it's a different copyleft to the rest — **use only the CC-BY-SA cliff
  styles** (avoid that one sub-style) to keep the licence story simple.

**[LPC] Sand+Rock Alt Colors — William Thompson, Daniel Eddeland** —
<https://opengameart.org/content/lpc-sandrock-alt-colors> — **CC-BY-SA 3.0 / GPL 3.0**.
More rock-ground recolours; *already a component of terrain-v7* (so in-repo). Only fetch
if more rock hues than Rock_White/Gray/Dark/Black are wanted.

**LPC cliffs/mountains with grass top and more** —
<https://opengameart.org/content/lpc-cliffsmountains-with-grass-top-and-more> — LPC
CC-BY-SA family; an alternative grass-top cliff source (overlaps eliza's). Lower priority.

**LPC Additional Mountain and Cave Opening Tiles** —
<https://opengameart.org/content/lpc-additional-mountain-and-cave-opening-tiles> — LPC
cave-mouth tiles (for Cinder Keep / mine entrances), if eliza's cave tile is insufficient.

> **Re-proposal guard:** none of these are the D:\GameAssetLibrary CraftPix packs
> (proprietary, no-redistribution = BANNED per ASSET-LIBRARY-CATALOGUE). All sources here
> are OGA CC-BY-SA / OGA-BY / GPL — whitelisted, no anti-AI clause.

---

## RANKING

### Best STONE-GROUND tile → **`Rock_Gray` from the in-repo terrain-v7 atlas** ⭐
- URL/provenance: <https://opengameart.org/content/lpc-terrains> · Licence **CC-BY-SA 4.0/3.0** · Fit **perfect** (the game's own ground atlas).
- Why: neutral cold-grey cobbled stone, full Wang autotile (feathers into grass exactly like
  the existing dirt/gravel sets), **already shipped + zero download + zero new licence**.
- Plaza alt: `Stone_Tan` or `Gravel_1` (warmer, worked) for the town floor vs `Rock_Gray`/
  `Rock_Dark` for the wild scree slopes — gives an elevation/zone read.
- **Recolour needed? No** — Rock_Gray is already neutral granite-grey.

### Best CLIFF AUTOTILE set → **`cliff_summer.png` (in-repo, eliza-terrain)** ⭐ for now; **[LPC] Mountains** as the upgrade
- In-repo: `asset-library/2d/tiles/eliza-terrain/cliff_summer.png` · **OGA-BY 3.0** · Fit
  **perfect** (same family already used). Complete autotile (faces/corners/inner-corners/
  grass-top/cave/stairs). Use `cliff_winter.png` up high for snow-capped faces.
- Upgrade option: **[LPC] Mountains** <https://opengameart.org/content/lpc-mountains>
  (**CC-BY-SA 4.0/3.0**) — ships automapping rules + snow overlays; pick this if we want the
  cliff-wall placement logic done for us rather than hand-writing the cliff-autotiler.
- **Recolour needed? No** for the brown foothill faces; the winter sheet already supplies
  the snow-capped variant.

---

## EXACT GET-IT STEPS for Van

### Recommended path — **nothing to download** (in-repo, Claude Code does it all)
The next BUILD session (not this one) will, with **no manual step from Van**:
1. **Rock ground:** add `rock: idx('Rock_Gray')` (and optionally `stone: idx('Stone_Tan')`,
   `snow: idx('Snow_1')`) to `OVERLAYS` in `scripts/build_terrain_autotile.mjs`, re-run it
   to regenerate `src/data/terrainTiles.js` (new `rock` autotile set), then lay a `rock`
   terrain patch under the Peaks bowl + a `stone`/`gravel` plaza — replacing the green
   stone-tint. *(The atlas tile is already in `public/art/terrain/lpc_terrain.png`.)*
2. **Cliffs:** bake `cliff_summer.png` (+ `cliff_winter.png`) into `public/art/terrain/`
   (covered by the existing OGA-BY ledger prefix — add a clarifying row), and write a
   cliff-aware autotiler (top-edge → face → base) so walls render as continuous faces, not
   scattered tiles. Re-verify all 12 gates.
- **Claude Code can do 100% of this** — no download, no Van action.

### Optional upgrade path — pull **[LPC] Mountains** (only if we want its automapping/snow)
- **Claude Code can attempt the fetch** (public OGA download, CC-BY-SA). If OGA's download
  gate blocks automation, Van does the one manual step:
  1. Open <https://opengameart.org/content/lpc-mountains>, download the ZIP (the
     `[LPC] Mountains` files button).
  2. Unzip and drop the tileset PNG(s) into **`asset-library/2d/tiles/lpc-mountains/`**
     (staging — NOT `public/` yet), keeping the bundled `CREDITS`/license text alongside.
  3. Tell Claude Code; next session it vets the specific files (skip the GPL-v2 Mana-World
     sub-style), bakes the chosen tiles into `public/art/`, adds the ledger row, and wires
     the autotiler — then `npm run verify`.
- Staging-not-`public/` keeps it outside the verify licence-gate until it's deliberately
  imported (the established two-tier pattern in ASSET-LEDGER §"verify scope note").

---

## What this unblocks beyond Peaks
The same in-repo `terrain-v7` atlas already contains the autotile terrains for **every
remaining region** — `Lava` (Emberwood), `Water/Water_Deep/Water_Shallows/Sand` (Tidewreck
Coast), `Snow/Ice` (Spire) — so future region builds are likewise a generator/autotiler
wiring pass, not an art hunt, for their GROUND. Region-specific *props* (wreck, dock,
volcano cone, spire structure) still need their own targeted hunts per the blueprint §7.

*Cross-links: ASSET-LEDGER.md (licence gate + two-tier staging) · STYLE-GUIDE.md (32px LPC
fit) · WORLD-BLUEPRINT.md §7 (asset reality-check) · src/data/terrainTiles.js +
scripts/build_terrain_autotile.mjs (the autotiler the rock set plugs into). Sourcing only —
no code/art touched this session.*

---

# SLICE TOOL-REPRESENTATION DECISION (the GH→Peaks [LOW] asset, resolved 2026-06-08)

> The GH→Peaks vertical slice grants/uses the **GRAPPLE** at Cinder Keep + wants the captured
> **overhead "item-get"** beat. `EXCELLENCE-FRAMEWORK §6` flagged the rigged **tool held-item
> sprite** as the slice's one **[LOW]-confidence** asset — resolve BEFORE building. This is that
> resolution. **Sourcing + decision only — no import/build.**

## 1. In-repo check — what the rig actually has
- **Live ElizaWy rig (`public/art/eliza/`):** only **idle / walk / attack(1h-slash)** animations
  (`ANIMS`/`STATES` = idle/walk/attack). **No thrust / tool / cast / shoot / "raise-item" rows.**
- Weapons (`PARTS.sword`/`shield`) are **attack-only** oversize overlays — there is no held-tool
  layer, and no animation state a held tool could play in.
- **Staged working set (`asset-library/2d/sprites/characters/`):** `accessories/tools` = only LPC
  **mining/farming overlays** (`smash`, `thrust` — pickaxe/spear poses); `weapons/weapon` =
  swords/polearms/maces/bows/wands. **No grapple, no hookshot, no held lantern.** And only the 3
  rig anims are copied into the working set.
- **Verdict (in-repo):** **NO** held-tool sprite for grapple/hookshot/lantern, and no rig
  animation state to host one.

## 2. Source check — does a conforming LPC held grapple/hookshot exist?
- OGA/LPC search (verified): the documented LPC collections have **no grappling-hook / hookshot
  held-item animation.** Related-but-not-it: *[LPC] Misc animations and items*, *LPC push and
  carry*, a *grab* anim, *[LPC] Extended Weapon Animations* — none provide the metroidvania tools.
- A held **LANTERN** is *closer* (LPC lantern objects exist as props; some LPC "carry/torch"
  variants exist) but not a clean rigged paper-doll layer matching the eliza rig across facings.
- **Verdict (source):** a CONFORMING **rigged held grapple/hookshot does NOT exist** licence-clean
  — building it = **custom LPC art + new rig animation states** (engine + art) = out of slice scope.

## 3. CONFIDENCE VERDICT for the slice
| Asset | Verdict |
|---|---|
| Fully-rigged held GRAPPLE animation (in hand, all facings, swing) | **STILL [LOW] / effectively a GAP** — doesn't exist; custom art + new rig states. **Out of slice scope.** |
| Rigged "hero raises item overhead" pose | **[LOW]** — not in the eliza rig either. |
| The "item-get" beat done in **2D** (icon floats above the hero) | **HAVE / HIGH** — needs only the existing rig idle + a 32px item icon + a tween. |
| A 32px **item ICON** (lantern) | **HAVE** — eliza-objects `Lighting, Outdoors`/`Lighting, Table`. |
| A 32px **item ICON** (grapple hook) | **HIGH (trivial)** — crop a small hook from an LPC item sheet; floor = the in-scene `ow_orb` glow + the naming banner. |

## 4. DECISION — **USE THE FALLBACK** (unblock the slice on definitely-have assets)
The slice represents the tool **without any new rig layer**, using only in-hand primitives that
conform to the locked standard (the existing 64px LPC rig in its real states + 2D 32px LPC item
icons + Graphics VFX):

- **GRANT beat (Cinder Keep — already partly built):** the hero stands (existing **idle**) at the
  Keep; a **banner + an "item-get" STING** fire and `tool_grapple`+`shard_2` record + save (this
  already works — `_buildPeaksKeep`). **ADD the overhead flourish in 2D:** spawn a **32px item
  icon above the hero's head**, tween it **up ~24px + scale-up + a flash/sparkle** (the `ow_orb`
  glow behind it), hold, fade. Icon = a real LPC item sprite (lantern = HAVE; grapple-hook =
  HIGH-trivial crop; guaranteed floor = the orb-glow + the banner that names the tool). **No
  paper-doll layer, no new animation state.**
- **USE beat (grapple a ledge / the Keep set-piece):** represent grappling with a **drawn VFX** —
  a `Graphics` line + a small hook sprite from hero→anchor — plus a quick **dash/tween** of the
  hero toward the ledge (reuse the existing dodge/move tween), gated by the `tool_grapple` deed.
  The hero plays **walk/idle**; the grapple is the **VFX + the traversal result**, not a rigged swing.
- **DEFER (future polish, stays [LOW]):** the fully-rigged held-tool animation (hero visibly holds
  + swings the grapple across all facings) — needs custom LPC layer art + new rig states; not the slice.

**Why this is correct:** the rigged asset doesn't exist licence-clean, so the slice must NOT wait
on it (the §6 rule: don't start a region on an unconfirmed asset). The fallback is 100% in-hand,
conforms to the lock, and delivers BOTH the grant ("got the grapple!") and the use (grapple a
ledge) beats — the player reads the tool clearly without a single new rig frame.

## 5. RECOMMENDATION → **FALLBACK** (chosen). The slice's [LOW] gap is RESOLVED.
- **Source just-in-time during the build (both HIGH/HAVE, no risk):** the lantern item-icon (HAVE,
  eliza-objects) and a grapple-hook 32px icon (HIGH-trivial crop) — or ship the orb-glow floor.
- **Do NOT source/build** the rigged held-tool animation for the slice — deferred.
- Net: **no [LOW]-confidence asset blocks the GH→Peaks slice anymore.** The remaining slice
  sourcing is the stone-town exterior set (**[HIGH]**) + standing up the audio system; both are
  HIGH/known, not risky-LOW.

*Cross-links: EXCELLENCE-FRAMEWORK.md §6 (the asset-confidence rule this resolves) · ASSET-
MANIFEST.md (tool held-items gap) · QUALITY-SPEC.md §0 (the locked standard the fallback conforms
to) · GAPS-AND-DEPTH / PERSONALISATION (the overhead-pickup design intent). Decision only — no
code/art touched this session.*
