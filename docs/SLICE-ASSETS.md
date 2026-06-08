# EMBERFALL 2 — SLICE ASSET SOURCING (GH→Peaks HIGH-confidence + living-world scoping)

> **Vertical-slice prep** (`EXCELLENCE-FRAMEWORK §6`). **PRINCIPLE: source ONLY to fill
> confidence-ranked GAPS, conforming to the locked 32px/64px LPC standard (`QUALITY-SPEC §0`).
> NOT a haul — a wrong/oversized/off-style asset used badly is worse than fewer good ones;
> anything non-conforming is REJECTED.** All licences below are AI-safe (CC0 / CC-BY-SA / GPL /
> CC-BY — no anti-AI, no non-commercial), to be **ledgered per-asset at import**. **Sourcing +
> proposal only — no import/build/ledger change this session.** Import is the next step, per-asset.

**In-repo check first (what we already have, so we don't re-source):** Peaks stone town currently
uses **brick-house stand-ins**; `eliza-structure` has stone *kit* pieces (Jagged Stone Walls,
Stone Pillar, Stone Windows) + 3 assembled exteriors (Brick House A/B, Paneled House A) but **no
dedicated stone/mountain-town exterior set**. **No animals, no crop growth-stages, no outdoor
bench** in repo at all. Audio = **3 combat SFX only** (Kenney CC0). These are the real gaps below.

---

## 1. STONE-TOWN EXTERIOR SET — [HIGH] (the Peaks slice)
Replace the brick-house stand-ins with a real stone-building exterior set (32px, LPC-compatible).

| Candidate | URL | Licence (evidence) | Conformance | Use |
|---|---|---|---|---|
| **Stone Home Exterior Tileset** ⭐ (Roots / Tyler Olsen + Jetrel) | <https://opengameart.org/content/stone-home-exterior-tileset> | **CC-BY-SA 3.0** (fetched; no anti-AI / non-commercial). Attrib: Hyptosis+Zabin (windows), Reemax (signs), C.Nilsson (flowerboxes) | **32×32 px**, top-down, **LPC-compatible** (not pure-LPC — verify palette fit on import) | **THE stone-town set** — walls/roofs/doors/windows/signs for variable stone buildings |
| **[LPC] Thatched-roof Cottage** (bluecarrot16) | <https://opengameart.org/content/lpc-thatched-roof-cottage> | **CC-BY-SA 3.0 / GPL 3.0** (fetched; no anti-AI). Based on Sharm/HughSpectrum/C.Nilsson LPC base | **32px LPC** ✓ (`cottage.png`+`thatched-roof.png`) | timber-frame cottage — a warm accent building (also reusable in Greenhollow) |
| **[LPC] Medieval Village Decorations** (bluecarrot16 + 18 others) | <https://opengameart.org/content/lpc-medieval-village-decorations> | **CC-BY-SA 4.0 / 3.0** (fetched; no anti-AI) | LPC, Tiled .tsx (Wang fences) | the **dressing** (market stalls, banners, signage, lighting, fences) for town density + the **outdoor bench** gap |

**Rank:** ⭐ **Stone Home Exterior Tileset** is the stone-town spine (CC-BY-SA, 32px, stone
walls+roofs+doors+windows). Pair with **eliza-structure stone kit** (already in repo) + the
**Medieval Village Decorations** for dressing. ⚑ *Conformance caveat:* "LPC-compatible, not
pure-LPC" — at import, value-check the palette against `QUALITY-SPEC §0`; if a piece clashes,
reject/recolour (don't ship off-family).
**Get-it (next session, per-asset):** download the OGA zip → stage to
`asset-library/2d/buildings/<name>/` (keep the OGA licence/credits file) → vet specific pieces
vs the lock → bake the chosen exteriors to `public/art/structures/` → **add an ASSET-LEDGER row
(CC-BY-SA, ai_safe=yes)** → wire as PROPS → `npm run verify`. **Claude can fetch** (public OGA);
if the download gate blocks automation, Van downloads the zip from the URL and drops it in staging.

## 2. MOOD MUSIC (beds only — bespoke leitmotifs/narrator stay deferred) — [HIGH]
Loopable CC0 beds matching the art-direction moods: **Greenhollow = gentle pastoral folk**,
**Sundered Peaks = stark wind / low drone**. `.ogg` for web-audio.

| Candidate | URL | Licence | Use |
|---|---|---|---|
| **Tallbeard Studios — Music Loop Bundle** ⭐ | <https://tallbeard.itch.io/music-loop-bundle> | **CC0** | 200+ seamless loops — pick a pastoral loop (GH) + an ambient/sparse loop (Peaks) |
| **Not Jam Music Pack** | <https://not-jam.itch.io/not-jam-music-pack> | **CC0** | multi-genre seamless loops (.wav/.ogg) — pastoral + ambient options |
| **OpenGameArt — CC0 Music** | <https://opengameart.org/content/cc0-music-0> | **CC0** | OGA's CC0 music pool — folk + ambient/drone tracks |

**Rank:** ⭐ Tallbeard bundle (biggest CC0 loop set, clean). **Pick exactly 2 for the slice** —
one pastoral (GH), one stark/wind-drone (Peaks) — don't import the whole bundle. **Get-it:**
download → choose the 2 tracks → convert to `.ogg` → stage → ledger (CC0) → wire into a minimal
music player (state-swap on region) → verify. *(The music STATE-MACHINE + ducking is a small
engine task, separate; beds first.)*

## 3. AMBIENT / FEEDBACK SFX (the "no action without feedback" floor) — [HIGH]
The slice needs: **chest-open · item pickup/get · UI confirm/deny · wind ambient (Peaks) ·
birdsong ambient (GH)**. (Combat swing/hit/charge already in repo, Kenney CC0.)

| Need | Candidate | URL | Licence |
|---|---|---|---|
| UI confirm/deny, pickup, click | **Kenney — Interface Sounds** (100 SFX) | <https://kenney.nl/assets/interface-sounds> | **CC0** |
| chest-open / latch / generic SFX | **OGA — CC0 Sounds Library** / 30 CC0 SFX loops | <https://opengameart.org/content/cc0-sounds-library> | **CC0** |
| Peaks WIND ambient (loop) | **OGA — wind whoosh loop** | <https://opengameart.org/content/wind-whoosh-loop> | **CC0** |
| GH birdsong/wind ambient (loop) | **OGA — Birds and Wind (ambient)** | <https://opengameart.org/content/birds-and-wind-ambient-birds-wind-and-synth> | **CC0** |

**Rank:** Kenney Interface (CC0, same trusted source already in repo) for the UI/pickup cues +
OGA CC0 for chest-open + the 2 ambient loops. **Get-it:** download → pick the few needed clips →
`.ogg` → `public/audio/` → ledger (CC0, the existing `public/audio/` row covers it) → wire to the
existing `_sfx()` + a region-ambient loop → verify. **All CC0 = lowest-friction.**

---

## 4. LIVING-WORLD LIFE GAPS — SCOPE + RANK (don't source yet; dedicated session next)
These lift **ALL** regions (the WORLD-BIBLE "living world" intent). **Verdict: every one is
[HIGH] — conforming LPC sources exist; none are LOW/risky.** A dedicated living-world session is
low-risk.

| Gap | Confidence | Source (LPC, AI-safe) | Note / get-it |
|---|---|---|---|
| **Chicken** (canon — Henrietta, `chicken_kicked`) | **HIGH** | **LPC Chicken Rework** <https://opengameart.org/content/lpc-chicken-rework> + LPC farm animals | the M2 hen — highest-value single animal |
| **Cat & Dog** | **HIGH** | **[LPC] Cats and Dogs** (Daniel Eddeland) <https://opengameart.org/content/lpc-cats-and-dogs> — 4-dir walk + sleep/eat, 4 colours each | CC-BY-SA / GPL |
| **Farm animals** (cow/pig/sheep) | **HIGH** | **LPC style farm animals** (Daniel Eddeland) <https://opengameart.org/content/lpc-style-farm-animals> | walk+eat; licence GPL2+/CC-BY (copyleft — credits on ship) |
| **Crop growth-stages** | **HIGH** | **[LPC] Crops** (bluecarrot16) <https://opengameart.org/content/lpc-crops> — **5-frame growing anims for 50 crops** (seedling→harvest), LPC | CC-BY-SA 4.0/3.0 / GPL 3.0 — *exact* match for the gap |
| **Outdoor bench** | **HIGH** | **[LPC] Medieval Village Decorations** (town-square furniture) + LPC furniture sets | a simple LPC prop; comes with §1's decorations set |
| **High-value extra life props** (market stalls, banners, signage, fences, outdoor lighting) | **HIGH** | **[LPC] Medieval Village Decorations** | one set covers town density + bench + fences across all regions |

**Living-world session plan (next, low-risk):** fetch the 4–5 LPC sets above → stage to
`asset-library/2d/sprites/animals/` + `.../tiles/crops/` + buildings → vet + bake the needed
sprites → ledger each (CC-BY-SA / GPL / CC-BY — **all copyleft except none; keep credits on a
commercial ship**) → wire animals as ambient critters (NpcLife hook already exists) + crops as
growth-stage props + the bench/decorations as props → verify. **No LOW/risky item in the set.**

⚑ **Licence note (copyleft):** several of these are **CC-BY-SA / GPL** (share-alike/copyleft) —
AI-safe and whitelisted, but a commercial ship must keep the same licence + an in-game credits
screen (already the ledger policy). CC0 (music/SFX, Kenney) is attribution-free. No anti-AI, no
non-commercial anywhere — all conform.

---

## 5. SLICE SOURCING SUMMARY (what to actually pull for GH→Peaks)
1. **Stone-town:** Stone Home Exterior Tileset (CC-BY-SA) + Medieval Village Decorations (dressing+bench).
2. **Music:** 2 loops from the Tallbeard CC0 bundle — pastoral (GH) + wind-drone (Peaks).
3. **SFX:** Kenney Interface (CC0) pickup/UI + OGA CC0 chest-open + 2 ambient loops (wind / birds).
4. **Tool held-item:** NONE — the slice uses the **2D item-get fallback** (`PEAKS-ART-CANDIDATES.md`),
   not a sourced asset.
**Every slice gap is now HAVE or HIGH-confidence with a named, licence-evidenced candidate — no
[LOW]/risky asset remains for the GH→Peaks slice.** Living-world life = a separate HIGH-confidence session.

*Cross-links: EXCELLENCE-FRAMEWORK.md §6 (confidence rule + gap list) · ASSET-MANIFEST.md (the gaps) ·
PEAKS-ART-CANDIDATES.md (the tool-held fallback + the Peaks terrain wiring) · QUALITY-SPEC.md §0
(the lock every candidate conforms to) · ASSET-LEDGER.md (per-asset ledger at import) ·
STYLE-GUIDE.md (32px LPC fit). Sourcing + proposal only — no code/art/ledger touched this session.*
