# ASSET-LIBRARY CATALOGUE — `D:\GameAssetLibrary` (licence-vet + style-fit, 2026-06-08)

**Purpose:** inventory + licence-vet the shared asset library at `D:\GameAssetLibrary`
against Emberfall's rules (CLAUDE.md HARD RULE 3/4 + STYLE-GUIDE + ASSET-LEDGER), and
map the *usable* subset to our outstanding art gaps. **CATALOGUE ONLY — nothing was
imported into the repo, no scene/ledger change.** Import happens later, per-asset, with
a ledger entry, only for items marked **SAFE + style-fit** below.

> The library is a **shared, multi-game** library (its own `ASSET-LIBRARY.md` says it
> targets *low-poly 3D party games* and *pixel-art side-scrollers*). It was **not**
> assembled for an LPC top-down RPG, so most of it is either the wrong dimension (3D),
> the wrong format (side-scroll parallax), the wrong style (non-LPC pixel), or the wrong
> licence (CraftPix proprietary). Read the verdicts before reaching for anything here.

---

## TL;DR — headline verdict

- **The single most important finding:** the **entire tree contains ZERO licence /
  credit / copyright files** (one placeholder `backgrounds/jungle/README.txt`, which is
  an instruction note, not a licence). The manifest's `licence` tags are the *curator's*
  notes, **not** in-tree evidence. Per our rule ("do NOT assume safe without evidence;
  UNKNOWN = unusable"), nothing here may be imported until its licence is re-fetched from
  source and ledgered.
- **The bulk (~70 packs) is CraftPix** (source tag and/or the tell-tale `COUPON.png` ad
  bundled in every free CraftPix pack). CraftPix's free licence is **proprietary,
  attribution-required, and FORBIDS redistributing the raw asset** (the curator's own
  README says so: *"free WITH attribution (can't redistribute raw)"*). That is **not** one
  of our whitelisted families (CC0 / OGA-BY / CC-BY[-SA] / GPL) and the no-redistribution
  clause is incompatible with committing art to our public repo. → **BANNED for this repo.**
- **CC0 material exists** (Kenney, Quaternius, KayKit, PolyHaven, Ansimuz) and is
  genuinely safe **by source reputation** — but it's almost all **3D** (unusable, HARD
  RULE 4), **audio** (already have it), **UI** (clashes with our LPC/monospace UI), or
  **side-scroll parallax** (wrong format for top-down). **~0 CC0 items are LPC-style-fit
  gap-fillers.**
- **Net for Emberfall's art gaps: essentially nothing new is usable.** Every gap the
  library *names* (rocks, trees, animals, caves, crops) is either CraftPix-blocked or
  already covered by our staged LPC art (`asset-library/2d/...`, OGA-BY/CC-BY-SA).

### Pack tally (verdict)

| verdict | count | what |
|---|---:|---|
| **SAFE — CC0, but 3D → UNUSABLE for a 2D game (parked)** | 26 model packs + 7 HDRI skies | Kenney/KayKit/Quaternius glTF, PolyHaven HDRI |
| **SAFE — CC0, 2D, usable format** | ~8 | Kenney audio ×3, Kenney UI ×2, Kenney medals ×1, Ansimuz parallax ×1, Quaternius 2D-RPG render ×1 — **but ~none LPC-style-fit (see §4)** |
| **BANNED — CraftPix proprietary (no-redistribute, not whitelisted)** | ~70 | all `sprites-2d/*` (×25) + `backgrounds/*` craftpix (×25) + `misc/*` craftpix (~20) |
| **UNKNOWN — no licence, unattributable → unusable** | ~5 | `sprites-2d/rpg-monster-sprites` (source/licence conflict) + `misc/`: animated-explosion, easy-animated-enemy, rocky-area-objects, water-and-fire-magic-vector |

---

## 1. Inventory (structure + counts)

Top level: `models/ skies/ audio/ backgrounds/ sprites-2d/ misc/ tools/` + `ASSET-LIBRARY.md`
+ `library-manifest.json`. Total ≈ 19k files (mostly 3D + CraftPix sheets).

| bucket | packs | files | format | 2D-usable? |
|---|---:|---:|---|---|
| `models/` | 26 | 4897 | glTF (low-poly 3D) | ❌ 3D — HARD RULE 4 (parked, like the existing `asset-library/3d-future/`) |
| `skies/` | 7 files | 7 | HDRI 4k | ❌ 3D lighting only |
| `audio/` | 3 | 202 | wav/ogg | ✅ (CC0) — but SFX, not art; we already ship Kenney RPG audio |
| `backgrounds/` | 26 | 109 | parallax-layer PNG | ⚠ side-scroll parallax (wrong for top-down); 1 CC0, 25 CraftPix |
| `sprites-2d/` | 26 | 6192 | sprite-sheet PNG | ⚠ pixel-art but **non-LPC** + CraftPix |
| `misc/` | 30 | 3340 | 2D PNG / raw FBX | mixed: a few CC0 UI, mostly CraftPix, some raw FBX |
| `tools/` | — | 2 | `setup-assets.ps1` pipeline | n/a |

---

## 2. Licence verdict per group (with evidence)

**Evidence gathered:** (a) `find` for `*licen* *readme* *credit* *copyright* *.txt` across the
whole tree → **only** `backgrounds/jungle/README.txt` (a placeholder, not a licence);
(b) `library-manifest.json` `source`/`licence` tags; (c) `COUPON.png` presence (CraftPix
free-pack signature) found in 35 pack folders; (d) visual sampling of 3 sprites (§4).

### 2a. SAFE — CC0 (by source reputation; **NO in-tree licence file → re-fetch + ledger before import**)
- **`models/*` (26 packs)** — Kenney / KayKit / Quaternius, CC0. **3D → UNUSABLE here.**
  Treat exactly like the existing parked 3D kits (`asset-library/3d-future/`, not committed).
- **`skies/*` (7 HDRI)** — PolyHaven CC0. 3D lighting. Unusable.
- **`audio/kenney-rpg-audio | kenney-ui-audio | kenney-voiceover-pack`** — Kenney CC0.
  Usable (audio). `kenney-rpg-audio` is already in the repo (`public/audio/`, ledgered).
- **`backgrounds/parallax-forest-pack`** — Ansimuz, CC0. Usable licence, but it's a
  **side-scroll parallax** set (wide tileable layers), not top-down — wrong format for us.
- **`misc/kenney-ui-pack-pixel-adventure` (514) + `kenney-ui-pack-rpg-expansion` (90) +
  `kenney-medals` (31)** — Kenney CC0, genuine 2D PNG. Usable licence.
- **`misc/rpg` (Quaternius, 8 PNG)** — CC0, but a **low-poly 3D render** sheet, not pixel.
- **`misc/medieval-village-pack` (0 PNG) / `misc/ultimate-rpg-items-pack` (FBX)** — Quaternius
  CC0 but effectively **3D/empty** (FBX or no PNG). Parked-3D, not 2D-usable.

> ⚠ Even the CC0 set has **no licence file in the folder**. Before importing ANY of it,
> re-download the CC0 declaration from the source page (kenney.nl / quaternius.com /
> ansimuz.itch.io / polyhaven.com) and add an ASSET-LEDGER row. Do not import on the
> strength of the manifest tag alone.

### 2b. BANNED — CraftPix (proprietary free licence: attribution-required, **NO redistribution**)
Evidence: `source: "craftpix"` in the manifest for all `sprites-2d/*` and all
`backgrounds/*` (except `parallax-forest-pack`); plus a bundled **`COUPON.png`** (CraftPix's
free-pack discount ad) confirmed in these `misc/` + `sprites-2d/` folders:

```
misc/: top-down-trees, top-down-bushes, top-down-crystals, top-down-ruins,
       top-down-cave-objects, top-down-seabed-objects, rocks-and-stones-top-down,
       top-down-animals-farm-sprites(+-1), forest-objects-top-down, bridges-top-down,
       dungeon-objects, plants-for-farm, fantasy-2d-battlegrounds, 2d-top-down-pixel-dungeon,
       clouds, 11-explosion-sprites, animated-magic-book, pixel-magic-sprite-effects-pack
sprites-2d/: base-4-direction-male/female(+-1), top-down-orc-game-character,
       vampire-4-direction, knight/warrior/gorgon/minotaur/slime(+-mobs), predator-plant-mobs,
       magic-and-traps, glassblowers-workshop, fantasy-chibi-male, + (by source tag) 2d-fantasy-trolls,
       chibi-skeleton-warrior, orc, top-down-goblin, tribal-warrior-boss, slash-effects(+cartoon),
       water-effects, rpg-monster-sprites?(see UNKNOWN)
```
**Why BANNED for us:** CraftPix's free licence is **not** CC0/OGA-BY/CC-BY[-SA]/GPL; it
**requires attribution AND forbids redistributing the raw files** (curator's note:
*"free WITH attribution (can't redistribute raw)"*). Our repo is public and commits raw
art → the no-redistribution clause is a hard blocker. (Independent of style.) **Do not
import. Do not commit.** If Van ever wants a specific CraftPix asset, it must be bought/
licensed under terms that allow repo redistribution + checked for any anti-AI clause —
a separate decision, not this catalogue.

### 2c. UNKNOWN — no licence, unattributable (→ unusable until clarified)
- `sprites-2d/rpg-monster-sprites` — manifest says `source: quaternius` **but** `licence:
  attribution` (Quaternius is normally CC0). Conflicting, no licence file → **UNKNOWN.**
- `misc/animated-explosion-sprite-pack`, `misc/easy-animated-enemy-pack`,
  `misc/rocky-area-objects`, `misc/water-and-fire-magic-sprite-vector-pack` — no CraftPix
  coupon, no CC0 source, no licence file → **UNKNOWN.** (`rocky-area-objects` is likely
  CraftPix by naming/style, but unproven — treat as unusable either way.)

---

## 3. Banned/Unknown = DO-NOT-USE list (so it's never imported by mistake)

**Never import / commit:** anything under `sprites-2d/`, anything under `backgrounds/`
**except** `parallax-forest-pack`, and the CraftPix/`COUPON.png` + UNKNOWN `misc/` packs
listed in §2b/§2c. All `models/` + `skies/` are CC0-but-3D → **parked, not for the 2D
pipeline.** If in doubt, it's out.

---

## 4. Style-fit (of the licence-SAFE 2D set vs LPC)

STYLE-GUIDE bar: LPC family, 32 px terrain / 64 px char frame, top-down ¾, LPC palette,
flat-shaded. Visual samples taken this session:

- **CraftPix `top-down-trees/Autumn_tree1.png`** — ~128 px, painterly, detailed
  multi-tone shading, straight-down-ish. **Clashes** with LPC's flatter, chunkier 32px look.
- **CraftPix `rocks-and-stones-top-down/Rock1_1.png`** — ~64 px, painterly/realistic
  pixel shading. **Clashes.**
- **CraftPix `top-down-animals-farm-sprites/Chick…png`** — small multi-direction top-down
  pixel; closest to LPC *scale*, but still a different palette/shading family. (Moot —
  CraftPix-licensed.)
- **CC0 set:** Kenney UI = clean vector-ish UI (our UI is LPC/monospace dark-panel = **off-
  family**); Ansimuz parallax = side-scroll pixel (**wrong format**); Quaternius 2D = low-
  poly renders (**off-family**). → **None of the SAFE 2D set is an LPC style-fit** for our
  world/character art. Kenney UI could be cannibalised *deliberately* for a few UI bits if
  ever wanted, but it would visibly diverge from the established UI language — not recommended.

---

## 5. Gap → candidate map (the payoff)

Outstanding Emberfall art flags (from PLAN/QUALITY-BIBLE) vs what the library offers.
**Almost every name-match is CraftPix(BANNED)/UNKNOWN/clash AND already covered by our
staged LPC art** (`asset-library/2d/tiles/eliza-terrain` + `tiles/lpc-terrains`, OGA-BY/
CC-BY-SA — see ASSET-LEDGER §"LPC ENVIRONMENT HUNT").

| Emberfall gap | library name-match | verdict | use instead |
|---|---|---|---|
| **rock / cliff prop** (channelling, §2.1b) | `misc/rocks-and-stones-top-down`, `rocky-area-objects`, `top-down-crystals` | ❌ CraftPix/UNKNOWN + clash | ✅ **already staged:** `eliza-terrain/cliff_*.png` (OGA-BY) + `lpc-terrains` rocks |
| **animal / pet sprites** (chicken/dog/cat, critters slot) | `misc/top-down-animals-farm-sprites`(×2) | ❌ CraftPix + non-LPC | ⏳ gap remains — source LPC animals (OGA CC-BY-SA "LPC animals") in a future hunt |
| **bench** | — | — none | ⏳ LPC furniture (eliza Objects) — future |
| **crop-growth stages** | `misc/plants-for-farm` (3 PNG, CraftPix) | ❌ CraftPix | ⏳ LPC crops (CC-BY-SA) — future hunt |
| **cave-mouth / interior** | `misc/top-down-cave-objects`, `dungeon-objects` | ❌ CraftPix | ✅ `lpc-terrains` (caves) + `eliza-structure` interiors already staged |
| **bog / mountain tiles** | `backgrounds/mountain-*` (CraftPix, side-scroll) | ❌ wrong format + CraftPix | ✅ `lpc-terrains` (bog/marsh) + `eliza-terrain` cliffs already staged |
| **trees / foliage / hedge** | `misc/top-down-trees`, `top-down-bushes`, `forest-objects-top-down` | ❌ CraftPix + clash | ✅ existing LPC terrain/props (`public/art/terrain` + eliza) |
| **water FX (splash/ripple)** | `sprites-2d/water-effects-sprite-pack` | ❌ CraftPix | ✅ `asset-library/2d/effects/eliza-water` (OGA-BY) already staged |
| **slash / combat FX** | `sprites-2d/slash-effects-sprite-pack`, `slash-sprite-cartoon-effects` | ❌ CraftPix + clash | ✅ `asset-library/2d/effects/lpc-magic` (CC-BY-SA) already staged |
| **dialogue / UI** | `misc/kenney-ui-pack-pixel-adventure`, `kenney-ui-pack-rpg-expansion` (CC0) | ⚠ SAFE licence, **off-family style** | keep the existing LPC/monospace UI; cannibalise Kenney UI only if deliberately chosen |
| **SFX / audio** | `audio/kenney-*` (CC0) | ✅ SAFE | usable now if an audio pass wants more Kenney SFX (ledger it) — e.g. the flagged `sfx_death`/`sfx_hurt` |
| **night-darkening, LPC roll/block frames, Gate-N glyphs** | — | — engine/character work, not in this library | n/a |

**Only genuinely-actionable items from this library for Emberfall:** the **Kenney CC0
audio** (already partly shipped; could fill the flagged `sfx_death`/`sfx_hurt` cues), and
**Kenney CC0 UI** *if* a UI restyle is ever wanted (not recommended — off-family). For
world/character/prop **art**, this library adds nothing that is both licence-safe and
LPC-style-fit; our existing staged LPC libraries remain the source of truth.

---

## 6. Recommendation
1. **Do not import any CraftPix or UNKNOWN pack** (§2b/§2c) — licence-blocked.
2. **Treat `models/` + `skies/` as parked 3D** (CC0 but not for the 2D pipeline).
3. For real art gaps (animals, crops, bench), run a **targeted LPC/OGA hunt** (CC0/OGA-BY/
   CC-BY-SA, no anti-AI) like the prior LPC environment hunt — not this library.
4. If an audio pass needs `sfx_death`/`sfx_hurt`, the **Kenney CC0 audio** here is fair
   game — import the specific clips + add an ASSET-LEDGER row first.

*Cataloguing only — no repo import, no scene change, no ledger change this session.*
