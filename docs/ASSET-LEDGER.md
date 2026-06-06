# ASSET LEDGER (machine-read by scripts/verify.mjs)

Every shipped asset directory under `public/art/` is accounted for here: source +
licence + AI-safe flag + category. The verify gate FAILS if any art file lives
outside a covered prefix, or under a prefix flagged `ai_safe=no`. Full per-asset
attribution + licence reasoning lives in [ART-LICENSE-NOTE.md](ART-LICENSE-NOTE.md);
the wider licence-vetted library (3D/audio) is in [ASSET-LIBRARY.md](ASSET-LIBRARY.md).

**AI-safe** = licence has NO anti-AI / no-genAI clause (CC0 / OGA-BY / CC-BY[-SA] /
GPL all qualify; Mana Seed does NOT — see ART-LICENSE-NOTE).

The block below is the source of truth for the verify gate. Format, one row per line:
`prefix | source | licence | ai_safe | category`

```ledger
public/art/eliza/   | ElizaWy LPC (github.com/ElizaWy/LPC)                          | OGA-BY-3.0                        | yes | character
public/art/terrain/ | ElizaWy LPC terrain + Sharm LPC house (OpenGameArt/LiberatedPixelCup) | OGA-BY-3.0 / CC-BY-SA-3.0 / GPL-3.0 | yes | terrain+building
public/art/kenney/  | Kenney (kenney.nl)                                            | CC0-1.0                           | yes | tiles (legacy, unreferenced)
public/art/lpc/     | sanderfrenken Universal-LPC-Spritesheet                       | CC-BY-SA-3.0 / OGA-BY-3.0 / GPL-3.0 | yes | character (legacy, superseded by eliza)
public/audio/       | Kenney RPG Audio (kenney.nl)                                  | CC0-1.0                           | yes | sfx (swing/hit/charge-impact)
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
