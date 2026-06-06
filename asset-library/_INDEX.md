# EMBERFALL 2 — ASSET LIBRARY (index)

Licence-vetted art/audio. **Rule: only CC0 / clearly AI-assisted-commercial-safe
assets are usable. Anti-AI clause = banned. Unclear = `_UNLICENSED-PENDING/`.**
This is a **2D** game — 3D kits are parked (catalogue only) in `3d-future/`.
Do NOT touch the existing LPC character/terrain pipeline; that is separate.

Processed from `C:\Users\Administrator\Downloads` on 2026-06-06. Every licence
below was opened and read (not assumed). Result: **every candidate was CC0** —
nothing quarantined.

## ✅ USABLE — 2D + audio (copied into this library)
| pack | source | licence (AI-safe) | 2D/3D | category | format / px | filed |
|---|---|---|---|---|---|---|
| kenney_ui-pack-pixel-adventure | Kenney (kenney.nl) | CC0 ✅ | 2D | UI (pixel adventure) | PNG, mixed / 9-slice (514 files) | `2d/ui/` |
| kenney_ui-pack-rpg-expansion | Kenney | CC0 ✅ | 2D | UI (RPG panels/buttons) | PNG, 9-slice (90 files) | `2d/ui/` |
| kenney_rpg-audio | Kenney | CC0 ✅ | audio | SFX — RPG (52) | OGG | `audio/` |
| kenney_ui-audio | Kenney | CC0 ✅ | audio | SFX — UI/menu (52) | OGG | `audio/` |
| kenney_voiceover-pack | Kenney | CC0 ✅ | audio | voice/grunt VO (95) | OGG | `audio/` |

(No 2D *sprite/tile/character* packs were among the candidates — those "RPG Asset
Pack", "Platformer", "Easy Enemy", "Medieval Village" and "Ultimate …" names are
all **3D** Quaternius packs, see below. In-game characters/terrain remain on the
LPC pipeline.)

## ✅ USABLE — LPC character parts (working set, committed 2026-06-07)
A **two-tier** expansion (see `docs/ASSET-LEDGER.md` → "TWO-TIER ASSET LIBRARY"):
- **Master library** `C:\GameAssets\lpc-full` (local, NOT in git) — the full
  Universal-LPC generator: 145,452 PNG / 210 MB, every style/colour/bodytype, all
  17 animations + `sheet_definitions` + `palette_definitions` + `CREDITS.csv`.
  Catalogue at `C:\GameAssets\_INDEX\lpc-full.md`.
- **Repo working set** `2d/sprites/characters/{bodies,hair,clothing,accessories,weapons,shields}`
  — every style/colour/bodytype but only the rig's 3 anims (idle/walk/slash):
  **625 parts, 34,569 PNG, ~49 MB**. PARTS data in `manifest.json`, attribution in
  `CREDITS.md`. 64px paper-doll layers, LPC family. Source: Universal-LPC generator
  (github.com/LiberatedPixelCup/...). Licences: OGA-BY / CC-BY / CC-BY-SA / GPL /
  CC0 (all open-source, none anti-AI). **Not yet wired into the game** — catalogue
  only; the live rig still uses `public/art/eliza`.

| category | parts | source | licence (AI-safe) |
|---|---:|---|---|
| bodies (incl. skeleton/zombie + heads/eyes) | 130 | Universal-LPC | OGA-BY/CC-BY-SA/GPL/CC-BY/CC0 ✅ |
| hair (+ beards) | 117 | Universal-LPC | OGA-BY/CC-BY-SA/GPL/CC0 ✅ |
| clothing (torso/legs/feet/dress/arms/shoulders) | 182 | Universal-LPC | OGA-BY/CC-BY-SA/GPL ✅ |
| accessories (hats/capes/neck/facial/wings/backpack/tools) | 139 | Universal-LPC | OGA-BY/CC-BY-SA/GPL/CC-BY ✅ |
| weapons | 33 | Universal-LPC | OGA-BY/CC-BY-SA/GPL ✅ |
| shields | 24 | Universal-LPC | OGA-BY ✅ |

## ✅ USABLE — LPC environment/monsters/props/effects (gap hunt, committed 2026-06-07)
LPC-style assets filling Emberfall's flagged gaps (two-tier; full hauls at
`C:\GameAssets\lpc-env`, NOT in git). 364 files / ~5 MB. Manifest `2d/ENV-MANIFEST.json`,
attribution `2d/ENV-CREDITS.md`. **Not yet wired in** — staged catalogue.

| repo path | gap filled | source | licence |
|---|---|---|---|
| `2d/tiles/lpc-terrains/` | **bog/marsh** + caves + water + biomes | [LPC] Terrains (bluecarrot16 + many) | CC-BY-SA 4.0/3.0, CC-BY 3.0, GPL 3.0 ✅ |
| `2d/tiles/eliza-terrain/` | cliffs/waterfall/ice/plants/rocks | ElizaWy/LPC | OGA-BY 3.0 ✅ |
| `2d/buildings/eliza-structure/` | buildings + interiors | ElizaWy/LPC | OGA-BY 3.0 ✅ |
| `2d/items/eliza-objects/` | props (chests/barrels/furniture/…) | ElizaWy/LPC | OGA-BY 3.0 ✅ |
| `2d/sprites/enemies/lpc-monsters/` | 64px creatures (slime/bat/…) | [LPC] Monsters + Bat | CC-BY-SA 3.0, GPL 3.0, OGA-BY 3.0 ✅ |
| `2d/effects/lpc-magic/` | combat FX (fire/ice/lightning/…) | Extended LPC Magic pack | CC-BY-SA 3.0, GPL 3.0 ✅ |
| `2d/effects/eliza-water/` | water splash/ripple | ElizaWy/LPC | OGA-BY 3.0 ✅ |

Rejected (off-style, NOT committed): 16×16 monster packs; "Swamp 2D Tileset". UI: not
hunted (note only — fetch only if clearly LPC). See `docs/ASSET-LEDGER.md` → "LPC
ENVIRONMENT / MONSTER / PROP / EFFECT HUNT".

## 🧊 PARKED 3D — `3d-future/` (CATALOGUE ONLY, binaries NOT copied — see note)
All CC0, AI-safe, but 3D and therefore **not for the 2D pipeline**. Kept in
`Downloads/`, catalogued + vetted here; not committed to git (they total >1 GB —
copying them would bloat the repo). Move into `3d-future/` (or an external/LFS
store) only if/when 3D is ever revived.

**Quaternius (CC0 ✅, 3D)** — RPG Asset Pack (May 2017); Platformer Game Kit (Dec
2021, 440 models); Easy Animated Enemy Pack (Jan 2019); Medieval Village Pack (Dec
2020, 132); Ultimate Animated Character Pack (Nov 2019, 209); Ultimate Modular Men
(Feb 2022); Ultimate Modular Women (Apr 2022); Ultimate Monsters (200); Ultimate
RPG Items Pack (Aug 2019, 318 + png textures); Ultimate Fantasy RTS (Aug 2022, 512
+ png); Fantasy Props MegaKit[Standard]; Medieval Village MegaKit[Standard];
Stylized Nature MegaKit[Standard]; Universal Base Characters[Standard]; Modular
Character Outfits — Fantasy[Standard].

**KayKit / Kay Lousberg (CC0 ✅, 3D)** — Adventurers 2.0; BlockBits 1.0;
FantasyWeaponsBits 1.0; Forest Nature Pack 1.0; ResourceBits 1.0; Dungeon Pack
1.0; Mini-Game Variety Pack 1.2.

**Kenney (CC0 ✅, 3D kits)** — blocky-characters; brick-kit; cube-pets;
fantasy-town-kit; food-kit; marble-kit; retro-fantasy-kit; tower-defense-kit.

(Duplicate downloads exist — e.g. `KayKit_Adventurers … (1).zip`, several repeated
"Ultimate …" — same pack, ignore the copies.)

## ⛔ QUARANTINE — `_UNLICENSED-PENDING/`
**Empty.** No candidate failed the licence check — every pack inspected is CC0.
Anything added later whose licence cannot be confirmed AI-safe goes here, unused.

## Licence evidence (read, not assumed)
- **Kenney** — "License (Creative Commons Zero, CC0) … personal and commercial
  projects." (each pack's `License.txt`).
- **Quaternius** — "CC0 1.0 Universal … Public Domain Dedication" (each pack's
  `License.txt` / `License_Standard.txt`; the `[Standard]` packs are the free CC0
  versions, PRO/SOURCE sold separately on quaternius.com).
- **KayKit (Kay Lousberg)** — "License: (Creative Commons Zero, CC0) … free to use
  in personal, educational and commercial projects."

All three vendors: **CC0 → AI-assisted commercial dev permitted.**
