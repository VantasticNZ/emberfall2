# ART LICENSE NOTE — Mana Seed Free RPG Starter Pack (BLOCKER)

> Date: 2026-06-05. Authored during the proof-slice build. Decisive finding: the
> Mana Seed art **cannot** be used in Emberfall 2 as currently built, because the
> project's code is written with AI assistance and the Mana Seed license forbids
> exactly that. Preserved here so the constraint is never accidentally violated.

## Source reviewed
- `art-src/mana-seed-starter/NO AI, NO EXCEPTIONS.txt`
- `art-src/mana-seed-starter/Mana Seed readme.txt`
- `art-src/mana-seed-starter/this is a Mana Seed demo.txt`
- `art-src/mana-seed-starter/character_base/readme.txt`
- `art-src/mana-seed-starter/character_base/this is a Character Base demo.txt`
- `art-src/mana-seed-starter/character_base/guides/using this base.txt`
- Full User License: https://selieltheshaper.weebly.com/user-license.html

## Findings (verbatim quotes)

### Commercial use — ALLOWED
- "You may use this demo asset commercially or non-commercially." (Character Base demo)
- "The 'product' in question MAY be a commercial product you charge money for." (User License)

### Attribution — OPTIONAL
- "No, you don't have to credit me, though I would appreciate it 💖 Just don't claim
  you drew it yourself." (User License)

### AI — FORBIDDEN (the blocker), and it explicitly includes CODE
From `NO AI, NO EXCEPTIONS.txt`:
- "This art is totally free, but must NOT be used alongside ANY generative AI content!"
- "AI images? No! / AI voice acting? No! / AI music? No! / **AI code? No!**"
- "If you insist on using genAI anywhere in your development pipeline, I ask that you
  please delete these assets now."
- "I do not want my art to appear in any game that uses genAI in any way."

From the User License:
- "I do not consent for any of my art to be used in any machine learning datasets, nor
  used in a project alongside 'AI' generated imagery, writing, **code**, or anything else."
- "I am morally opposed to this technology for many reasons, please do not ask me if
  your use-case is special; it is not."

## Conclusion
Emberfall 2 is built with AI-assisted code. The Mana Seed license forbids use of the
art in any project that uses generative AI "anywhere in your development pipeline,"
explicitly including "code." Therefore **Mana Seed art must not be used in this project.**
Commercial-permitted + attribution-optional are both irrelevant given this clause.

## Resolution (pending Van's decision)
1. RECOMMENDED — adopt a license-compatible art source (CC0 / OpenGameArt / a license
   that permits AI-assisted projects). License-check it the same rigorous way before use.
2. Build without AI assistance (changes the entire working method).

Until Van decides, the manifest (`src/data/assets.js`) runs in `ART_SOURCE='placeholder'`
mode: procedural textures generated in-engine (no third-party art, no license issue),
sized to the same grid the real art will use, so the slice proves the architecture and
gates now. Dropping in a compatible pack later is a manifest-only edit.

================================================================================
# RESOLUTION (2026-06-05): AI-SAFE ART NOW IN USE
================================================================================
The proof slice now renders REAL, AI-safe art. `ART_SOURCE='real'`. None of the
licences below contain an anti-AI / no-genAI clause, so they are compatible with
this AI-assisted project (unlike Mana Seed). Each was licence-checked against the
project's CREDITS before use.

## CHARACTERS — LPC (Liberated Pixel Cup), via the Universal-LPC-Spritesheet
Source project: https://github.com/sanderfrenken/Universal-LPC-Spritesheet-Character-Generator
Licence files: the repo ships `cc-by-sa-3_0.txt` and `gpl-3_0.txt`; per-asset
authors/licences are in its `CREDITS.csv`. Every asset used here is some union of
**CC-BY-SA 3.0 / OGA-BY 3.0 / GPL 3.0** — all attribution/share-alike licences,
**none anti-AI**. Attribution (required by CC-BY-SA & OGA-BY) for the exact files used:

- **Body** (`body_*.png` — male light/brown/olive) — CC-BY-SA 3.0, GPL 3.0 —
  bluecarrot16; Benjamin K. Smith (BenCreating); Evert; Eliza Wyatt (ElizaWy);
  TheraHedwig; MuffinElZangano; Durrani; Johannes Sjölund (wulax); Stephen
  Challener (Redshrike).
- **Hair** (`hair_*.png` — "plain", male) — CC-BY-SA 3.0, GPL 3.0 —
  Manuel Riecke (MrBeast); Joe White.
- **Pants** (`legs_*.png` — pants, male) — OGA-BY 3.0, GPL 3.0, CC-BY-SA 3.0 —
  bluecarrot16; JaidynReiman; ElizaWy; Matthew Krohn (Makrohn); Johannes Sjölund (wulax).
- **Shoes** (`feet_*.png` — shoes, male) — OGA-BY 3.0, CC-BY-SA 3.0, GPL 3.0 —
  bluecarrot16; Johannes Sjölund (wulax).
- **Shirt** (`torso_*.png` — longsleeve, male) — CC-BY-SA 3.0, GPL 3.0 —
  JaidynReiman; Johannes Sjölund (wulax).
- **Hat** (`hat_feathercap.png` — cloth/feather_cap) — OGA-BY 3.0, CC-BY-SA 3.0,
  GPL 3.0 — Johannes Sjölund (wulax); Matthew Krohn (Makrohn); JaidynReiman.
- **Sword** (`weapon_carry*.png`, `weapon_slash*.png` — sword/longsword + its
  attack_slash/behind sheets) — OGA-BY 3.0, CC-BY-SA 3.0 —
  Johannes Sjölund (wulax); bluecarrot16.
- **Shield** (`shield_fg.png`, `shield_bg.png` — heater/original/wood) —
  OGA-BY 3.0 — bluecarrot16; Sander Frenken (castelonia); ElizaWy.

> SHARE-ALIKE NOTE: CC-BY-SA 3.0 / GPL 3.0 are copyleft. If Emberfall ships these
> exact sprite sheets, the art assets (not necessarily the game code) must carry
> the same licence + attribution. A commercial ship should keep an in-game CREDITS
> screen listing the above, and ideally bundle the licence texts. (OGA-BY 3.0 is
> attribution-only.) Re-confirm before commercial release.

## TILES / PROPS — LPC terrain (ElizaWy LPC)
Source: https://github.com/ElizaWy/LPC  (`Terrain/` + `Structure/Signs/`).
Bundled source atlases under `public/art/terrain/_src/`; the 32px ground tiles +
cropped tree/bush/sign props under `public/art/terrain/` are derived by
`scripts/build_lpc_terrain.py`. Licence: **OGA-BY 3.0** (attribution-only, **no
anti-AI clause**). Chosen to replace Kenney so terrain shares the characters' LPC
art family + pixel density (cohesion). Attribution for the assets used:

- **Terrain** (grass/dirt/path/water — `terrain_summer.png`) — OGA-BY 3.0 —
  Lanea Zimmerman (Sharm); Eliza Wyatt (DeathsDarling).
- **Tilled soil** (`tilled_soil.png` — garden) — OGA-BY 3.0 — Eliza Wyatt.
- **Trees** (`trees_summer.png` — oak/pine) — OGA-BY 3.0 — Lanea Zimmerman (Sharm);
  Eliza Wyatt.
- **Plants/bush** (`plants_summer.png`) — OGA-BY 3.0 — Lanea Zimmerman (Sharm);
  Eliza Wyatt; Hyptosis (used under OGA-BY per ElizaWy's Credits).
- **Sign** (`Sign Backgrounds A.png`) — OGA-BY 3.0 — Lanea Zimmerman (Sharm);
  Eliza Wyatt.

> Kenney "Tiny Town" (CC0) was used in the first art pass and is no longer wired
> into the manifest. (Its files may linger under `public/art/kenney/`; harmless,
> CC0, unreferenced.)

## CHARACTER FACES — LPC eyes layer
The LPC v3 base body sheets render a head but **no eyes** (blank face). Fixed by
adding an `eyes/human/adult/*.png` layer to every character. — OGA-BY 3.0 /
CC-BY-SA 3.0 / GPL 3.0 — JaidynReiman; Matthew Krohn (makrohn); Stephen Challener
(Redshrike); Mark Weyer; Johannes Sjölund (wulax).

## VERDICT
All art in the slice is AI-safe and commercially usable. Keep this note + an
in-game credits screen current as assets are added.
