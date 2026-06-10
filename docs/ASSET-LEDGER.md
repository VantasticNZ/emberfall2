# ASSET LEDGER (machine-read by scripts/verify.mjs)

Every shipped asset directory under `public/art/` is accounted for here: source +
licence + AI-safe flag + category. The verify gate FAILS if any art file lives
outside a covered prefix, or under a prefix flagged `ai_safe=no`. Full per-asset
attribution + licence reasoning lives in [ART-LICENSE-NOTE.md](ART-LICENSE-NOTE.md);
the wider licence-vetted library (3D/audio) is in [ASSET-LIBRARY.md](ASSET-LIBRARY.md).

**AI-safe** = licence has NO anti-AI / no-genAI clause (CC0 / OGA-BY / CC-BY[-SA] /
GPL all qualify; Mana Seed does NOT — see ART-LICENSE-NOTE).

## ATTRIBUTION + SUPPORT POLICY (mandatory for every USED asset)
**No asset is "used" (committed under `public/` or baked into the game) until ALL of these are
recorded — for a credits screen AND a koha/payment to the creators:**
1. **Artist/creator name(s)** — the human(s) who made it (hard requirement; even CC0).
2. **Source URL** — the canonical OGA content page / GitHub repo it came from.
3. **Licence** — and the exact attribution string that licence requires (CC-BY/CC-BY-SA/GPL
   require credit; CC0 does not, but we credit anyway).
4. **Support / contact link** — where one exists: a Patreon / Ko-fi / donate page, else the
   creator's **OpenGameArt profile** (`opengameart.org/users/<handle>` — the canonical contact),
   so a future **koha (gift/payment) to the creator is possible**. If genuinely none can be
   found, record that honestly ("CC0, no attribution required; no support link found").

The machine-read `ledger` code-block below stays the **5-column gate map** (`prefix | source |
licence | ai_safe | category`); the **AUTHORITATIVE per-creator attribution + support links**
live in **[CREDITS.md](CREDITS.md)** — the human-readable "thanks + how to support these
creators" doc, ready for an in-game credits screen. Every prefix here MUST have a CREDITS.md entry.

The block below is the source of truth for the verify gate. Format, one row per line:
`prefix | source | licence | ai_safe | category`

```ledger
public/art/eliza/   | ElizaWy LPC (github.com/ElizaWy/LPC)                          | OGA-BY-3.0                        | yes | character
public/art/terrain/ | ElizaWy LPC terrain (incl. cliff/rock crops from eliza-terrain: cliff_face, cliff_wall, cliff_top, rock_crag/boulder/small — Sundered Peaks) + Sharm LPC house + [LPC] Terrains autotile atlas (bluecarrot16, Sharm, Daneeklu, Jetrel, Zabin, Hyptosis, C.Nilsson, Buko, et al.) | OGA-BY-3.0 / CC-BY-3.0 / CC-BY-SA-3.0 / GPL-3.0 | yes | terrain+building+transition-tiles+cliff/rock
public/art/kenney/  | Kenney (kenney.nl)                                            | CC0-1.0                           | yes | tiles (legacy, unreferenced)
public/art/lpc/     | sanderfrenken Universal-LPC-Spritesheet                       | CC-BY-SA-3.0 / OGA-BY-3.0 / GPL-3.0 | yes | character (legacy, superseded by eliza)
public/audio/ambient/ | OpenGameArt CC0 ambient — "wind woosh loop" (SketchMan3) + "Birds and Wind — Ambient" (Spring Spring; birds by isaiah658/syncopika/pauliuw) | CC0-1.0 | yes | ambient loops (Peaks wind · Greenhollow birdsong)
public/audio/       | Kenney RPG Audio + Kenney Interface Sounds (kenney.nl)        | CC0-1.0                           | yes | sfx (combat swing/hit/charge + UI confirm/select/deny/pickup)
public/audio/music/ | region music beds — "Peasant Theme" (nihilocrat, Greenhollow) + "Cave Theme" (Brandon Morris "Brandon75689", Peaks) [OGA, CC0] · **marsh.mp3 = "Spirits Forest" by HydroGene** ([hydrogene.itch.io/high-quality-16-bit-music](https://hydrogene.itch.io/high-quality-16-bit-music); readme grants *"feel free to use it in any way you want, credits are not mandatory"* — unrestricted, no NC/ND/no-redistribute/anti-AI) → the **Ashen Marsh** dread bed | CC0-1.0 · HydroGene royalty-free (unrestricted) | yes | music (per-region loop beds) |
public/art/monsters/| [LPC] Monsters — CharlesGabriel, bagzie, bluecarrot16 (OpenGameArt) | CC-BY-SA-3.0 / GPL-3.0       | yes | enemy creatures (snake/bat/worm/eyeball/ghost/slime/pumpking/man-eater)
public/art/structures/| ElizaWy LPC (github.com/ElizaWy/LPC) structure + objects     | OGA-BY-3.0                        | yes | buildings + village props (houses/fountain/chest/barrel/fence)
public/art/furniture/| single-sprite CROPS from ElizaWy LPC Objects (anvil/bed/table/dresser/fireplace) + [LPC] Statues (altar) + **[LPC] Grave Markers Rework (bluecarrot16) → grave_headstone/cross/woodcross/open/large** — same ledgered sources as asset-library/2d/items · **door.png = ORIGINAL pixel art (ours, CC0)** | OGA-BY-3.0 / CC-BY-3.0 / CC-BY-SA-3.0 / GPL-3.0 / CC0 | yes | interior furniture + cemetery markers + doorway
```

> Share-alike note: CC-BY-SA / GPL assets are copyleft — a commercial ship keeps
> the art under the same licence + an in-game credits screen. OGA-BY / CC0 are
> attribution-only / public-domain. Re-confirm before commercial release.

## TWO-TIER ASSET LIBRARY (LPC character parts — 2026-06-07)

A cross-project pattern: a **master library** lives on the host PC OUTSIDE git, and
only a **lean, rig-compatible working set** is committed to this repo.

### MASTER LIBRARY — `C:\GameAssets\lpc-full` (local, NOT in git)
The full Universal-LPC generator art:
- `spritesheets/` — every style/colour/bodytype, **all 17 animations** —
  145,452 PNG (210 MB actual / ~492 MB on disk).
- `sheet_definitions/`, `palette_definitions/`, `CREDITS.csv`, `LICENSE`, `README.md`.
- Catalogue: `C:\GameAssets\_INDEX\lpc-full.md` (counts + per-licence + 72-artist roll).
- Source: **Universal-LPC-Spritesheet-Character-Generator**
  (github.com/LiberatedPixelCup/Universal-LPC-Spritesheet-Character-Generator),
  which aggregates the OpenGameArt LPC collection with per-asset credits.
- It is deliberately kept out of git (same policy as the parked 3D kits) so history
  isn't bloated by 210 MB of art the game can't use yet.

### REPO WORKING SET — `asset-library/2d/sprites/characters/` (committed)
Every style/colour/bodytype, but **only the 3 animations the 64px paper-doll rig
uses (idle / walk / slash)** — 625 parts, 34,569 PNG, ~49 MB actual content.
Organised into `bodies/ hair/ clothing/ accessories/ weapons/ shields/`.
- **PARTS data:** `asset-library/2d/sprites/characters/manifest.json` (id, name,
  category, type, zPos, bodytypes, colours, anims, palettes, path, files,
  authors, licences, source urls per part). Catalogue only — **NOT wired into the
  game** (no `src/` change; the live rig still uses `public/art/eliza`).
- **Full attribution:** `asset-library/2d/sprites/characters/CREDITS.md`
  (per-part authors + licences + source URLs; deduped 71-artist + 14-licence roll).
- **Build script:** `scripts/build_lpc_charparts.py` (copies the working set from
  the master library); `scripts/build_lpc_manifest.py` (regenerates manifest +
  CREDITS.md from `sheet_definitions` + `CREDITS.csv`).

### ON-DEMAND WORKFLOW
When a future feature needs more animations (thrust/shoot/cast/jump/…), widen
`ANIMS` in `scripts/build_lpc_charparts.py` and re-run — the frames are copied
from `C:\GameAssets\lpc-full`, **never re-downloaded**.

### LICENCE
Every working-set part is open-source — **none anti-AI** (so all are usable in this
AI-assisted project). Breakdown by # of parts: GPL 3.0 (377), OGA-BY 3.0 (368),
CC-BY-SA 3.0 (303), OGA-BY 3.0+ (58), GPL 2.0 (56), CC-BY 3.0+ (53), CC0 (48),
CC-BY 3.0 (42), CC-BY 4.0 (28), CC-BY-SA 4.0 (13), OGA-BY 4.0 (4), CC-BY (3),
GPL 3.0+ (2), OGA-SA 3.0 (2). Nothing was rejected — the entire LPC generator is
open-licence; no anti-AI or no-licence assets were present. CC-BY-SA / GPL are
copyleft (keep same licence + credits screen on a commercial ship).

> verify scope note: `scripts/verify.mjs` licence-gate scans `public/art` +
> `public/audio` only (shipped art). The `asset-library/` working set is a staged
> catalogue, not shipped, so it is outside the gate — attribution is recorded here
> + in `manifest.json`/`CREDITS.md` instead. Re-confirm before wiring any of it
> into `public/`.

## LPC ENVIRONMENT / MONSTER / PROP / EFFECT HUNT (2026-06-07)

Gap-driven asset hunt — LPC-style only, two-tier. Master hauls at
`C:\GameAssets\lpc-env` (local, NOT in git); the LPC-style, Emberfall-usable subset
is committed to `asset-library/2d/`. Manifest: `asset-library/2d/ENV-MANIFEST.json`;
full attribution: `asset-library/2d/ENV-CREDITS.md`. Build:
`scripts/build_lpc_env.py` (copy subset from master) + `scripts/build_lpc_env_manifest.py`.
**Not wired into the game** — staged catalogue only. 364 files / ~5 MB.

| repo path | source | licence (AI-safe) | fills gap |
|---|---|---|---|
| `2d/tiles/lpc-terrains/` | **[LPC] Terrains** — bluecarrot16, Sharm, Daneeklu, Jetrel, Zabin, Hyptosis, C.Nilsson, Buko, Nushio, ZaPaper, billknye, W.Thompson, caeles, Redshrike, Bertram, RayaneFLX | CC-BY-SA 4.0/3.0 · CC-BY 3.0 · GPL 3.0 | **bog/marsh** (Ashen Marsh) + caves + water + biomes (32px) |
| `2d/tiles/eliza-terrain/` | **ElizaWy/LPC — Terrain** — Eliza Wyatt, Sharm, Hyptosis, bluecarrot16 | OGA-BY 3.0 | cliffs (mountain/coast), waterfall, ice-shallows, plants, mushrooms, rocks, seasons |
| `2d/tiles/lpc-dungeon/` | **[LPC] Dungeon Elements** — Sharm (Lanea Zimmerman); contributor William.Thompsonj. [src](https://opengameart.org/content/lpc-dungeon-elements) | OGA-BY 3.0 (page also CC-BY 4.0/3.0 · GPL 3.0/2.0) | crypt/dungeon interior (brick walls, prison cell + barred gate, skeletons/bones, cobwebs, cauldron, filth, animated fire) — Sunken Shrine / Cinder Keep / crypts (32px). *Autonomously fetched 2026-06-09, licence-vetted + viewed.* |
| `2d/buildings/lpc-victorian/` | **[LPC] Victorian Buildings** — bluecarrot16, Sharm, Casper Nilsson, Lyndsay Takacs (cyanowl), Redshrike. [src](https://opengameart.org/content/lpc-victorian-buildings) | CC-BY-SA 3.0 / GPL 3.0 | CITY buildings — mansions/tenements/shopfronts/windows/doors (Saltbreak·Stonereach). *Intake 2026-06-09, licence-vetted + viewed.* |
| `2d/buildings/lpc-colonial/` | **[LPC] Colonial Buildings** — bluecarrot16, Sharm, Wolthera (TheraHedwig), Guido Bos. [src](https://opengameart.org/content/lpc-colonial-buildings) | CC-BY-SA 3.0 / CC-BY 3.0 / GPL 3.0 | colonial/civic buildings + a CHURCH (the chapel exterior). *Intake 2026-06-09.* |
| `2d/buildings/lpc-adobe/` | **[LPC] Adobe Building Set** — Sharm; contrib. William.Thompsonj. [src](https://opengameart.org/content/lpc-adobe-building-set) | OGA-BY 3.0 (page also CC-BY 4.0/3.0 · GPL 3.0/2.0) | DESERT adobe houses (Dustreach·Oasis). *Intake 2026-06-09.* |
| `2d/buildings/lpc-desert-ruins/` | **[LPC] Desert Ruins** — bluecarrot16; comm. Pierre Vigier. [src](https://opengameart.org/content/lpc-desert-ruins) | OGA-BY 3.0 / CC-BY 3.0 / GPL 2.0 | desert temple/ruins + modular statues (Sunken Temple). *Intake 2026-06-09.* |
| `2d/buildings/lpc-blacksmith/` | **[LPC] Blacksmith Workshop** — bluecarrot16. [src](https://opengameart.org/content/lpc-blacksmith) | OGA-BY 3.0 / CC-BY 3.0 / GPL 2.0 | forge/smelter interior (Hodge's forge · Stonereach mine). *Intake 2026-06-09.* |
| `2d/tiles/lpc-cavern-ruins/` | **[LPC] Cavern and ruin tiles** — Reemax, Sharm, Hyptosis, Johann C, Tuomo Untinen. [src](https://opengameart.org/content/lpc-cavern-and-ruin-tiles) | CC-BY-SA 3.0 / GPL 3.0/2.0 | cavern/crypt tiles + **obelisk · monk statue · shrine arch · coffin** (dungeons + the ALTAR fix). *Intake 2026-06-09, viewed.* |
| `2d/items/lpc-statues-fountains/` | **[LPC] Statues & Fountains** — (CC-BY/CC-BY-SA authors per bundled credits) | CC-BY 3.0 / CC-BY-SA 3.0 | statues + fountains (chapel altar · civic dressing · 32×32 set). *Intake 2026-06-09.* |
| `2d/items/lpc-medieval-decorations/` | **[LPC] Medieval Village Decorations** — Reemax, Sharm + LPC contributors. [src](https://opengameart.org/content/lpc-medieval-village-decorations) | CC-BY-SA 3.0 / GPL 3.0 | village decorations (signs/statues/banners/lighting). *Intake 2026-06-09.* |
| `2d/buildings/eliza-structure/` | **ElizaWy/LPC — Structure** — Eliza Wyatt + LPC contributors | OGA-BY 3.0 | buildings + interiors (walls/floors/doors/windows/roofing/bridges/fences/stairs) |
| `2d/items/eliza-objects/` | **ElizaWy/LPC — Objects** — Eliza Wyatt + LPC contributors | OGA-BY 3.0 | props (chests/barrels/crates/cauldron/furniture/smithing/dungeon/wall items) |
| `2d/sprites/enemies/lpc-monsters/` | **[LPC] Monsters** + **[LPC] Bat extended** — CharlesGabriel, bagzie, bluecarrot16, Evert | CC-BY-SA 3.0 · GPL 3.0 · OGA-BY 3.0 | 64px creatures: slime/bat/eyeball/bee/worms/man-eater/pumpkin-king/ghost/snake |
| `2d/effects/lpc-magic/` | **Extended LPC Magic pack** — Daniel Eddeland (Daneeklu) | CC-BY-SA 3.0 · GPL 3.0 | combat FX: fire/ice/lightning/tornado/spikes (128px) |
| `2d/effects/eliza-water/` | **ElizaWy/LPC — FX** — Eliza Wyatt | OGA-BY 3.0 | water splash/ripple/reflections |

> Per-folder source `Credits.txt` / `CREDITS-terrain.txt` are bundled alongside the
> art. Skeleton/zombie/bandit enemies are covered by the LPC character base (Task A,
> `characters/manifest.json`). REJECTED for the repo: 16×16 "Monsters Slime/Skeleton/
> Goblin" and "Swamp 2D Tileset" — off-style (not LPC), so not committed. Clearly-
> modern ElizaWy Objects (copy machine, fridge, TV, laptop, vending machine, …) were
> excluded for medieval style fit (kept in master only). CC-BY-SA / GPL are copyleft.
