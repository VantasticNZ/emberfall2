# ASSET LIBRARY (summary)

Full, licence-vetted index: **`asset-library/_INDEX.md`**.

Emberfall 2 is **2D**. Assets must be **CC0 / AI-assisted-commercial-safe** (anti-AI
clause banned; unclear = quarantined, unused). The existing **LPC** character/terrain
pipeline is separate and untouched.

## What's in the library now (processed 2026-06-06, all licences read)
- **Usable 2D + audio (committed, CC0):** Kenney `ui-pack-pixel-adventure` +
  `ui-pack-rpg-expansion` → `asset-library/2d/ui/`; Kenney `rpg-audio`, `ui-audio`,
  `voiceover-pack` → `asset-library/audio/`.
- **LPC character parts (committed, open-source — added 2026-06-07):** 625 parts /
  34,569 PNG (~49 MB) in `asset-library/2d/sprites/characters/` — the rig-compatible
  (idle/walk/slash) working set of the Universal-LPC generator: bodies (incl.
  skeleton/zombie), hair/beards, clothing, accessories (hats/capes/wings/…), weapons,
  shields. PARTS data `manifest.json`, attribution `CREDITS.md`. Two-tier: the full
  17-anim master (210 MB) lives at `C:\GameAssets\lpc-full` (local, NOT in git). See
  `docs/ASSET-LEDGER.md` → "TWO-TIER ASSET LIBRARY". Catalogue only — not yet wired in.
- **Parked 3D (CC0, catalogue only — NOT committed):** ~30 Quaternius / KayKit /
  Kenney 3D kits, listed in `asset-library/3d-future/_PARKED-3D.md`. They total
  >1 GB and are not for the 2D pipeline, so the binaries stay in `Downloads/`,
  vetted but out of git.
- **Quarantined:** none — every candidate was CC0.

Note: the "RPG Asset Pack / Platformer / Easy Enemy / Medieval Village / Ultimate …"
downloads sound 2D but are actually **3D** (Quaternius); inspection corrected that.
The only usable 2D among the candidates is Kenney UI; in-game characters/terrain
stay on LPC.
