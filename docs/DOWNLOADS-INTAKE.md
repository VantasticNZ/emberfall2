# DOWNLOADS INTAKE — licence triage of the 2026-06-08 itch.io batch

> Van bulk-downloaded **100+ files** to `Downloads/` (itch.io, tagged "free"/"royalty-free").
> Per CLAUDE.md asset rules + the EXCELLENCE-FRAMEWORK conformance gate, **the itch "free" tag
> means nothing** — each pack's ACTUAL licence file was read. Verdict: **SAFE** (CC0/CC-BY[-SA]/
> OGA-BY/GPL, commercial-OK, **redistributable**) · **UNSAFE** (proprietary / no-redistribute /
> non-commercial / unclear — *our repo is PUBLIC, so "no redistribute" = we cannot commit it*) ·
> **UNKNOWN** (no licence found → unusable until clarified) · **OFF-FORMAT** (wrong style/size
> for the locked 32px-LPC 2D game). **Nothing is imported this session** — the batch is mostly
> unusable, and nothing both SAFE-and-conforming fills a CURRENT gap. This is the triage so Van
> can pick what (if anything) to actually vet+import next.

## ⚑ THE BLOCKER: our repo is PUBLIC
Committing a raw asset to a public GitHub repo is **redistribution**. So any licence that says
"no redistribute / all rights reserved / no-resell" — even if it allows *commercial use* — is
**UNUSABLE for us** (we'd be redistributing it publicly). Only licences that explicitly permit
redistribution (CC0 / CC-BY / CC-BY-SA / OGA-BY / GPL) can enter this repo.

---

## VERDICTS (by pack/source — licence READ, with evidence)

### ✅ SAFE — whitelist licence, redistributable
| Pack | Creator | Licence (evidence) | Category | Conform | Support |
|---|---|---|---|---|---|
| **Icons_Essential** | **Crusenho Agus Hennihuno** | **CC-BY 4.0** (bundled `License.txt`: "redistribute… even commercially… Attribution") | UI icons | UI (no 32px tile rule; check UI-style fit) | <https://crusenho.itch.io> |

*Only this one is cleanly SAFE among the batch. It's not a CURRENT gap (no UI-icon need yet) —
**catalogued as available**; stage+ledger it if/when we build the inventory/UI screen.*

### ⛔ UNSAFE — proprietary / no-redistribute (cannot go in a PUBLIC repo)
| Pack(s) | Creator | Licence (evidence) | Why rejected |
|---|---|---|---|
| **JDSherbert — Tabletop SFX (FREE), Ultimate UI SFX (FREE), Ambiences Music [FREE]** + the loose RPG/UI WAVs (`Sword Slash (Rpg)`, `Monster roar/death (Rpg)`, `Footsteps Loop (Rpg)`, `UI Open/Close`, `Level up Pickup (Rpg)`, `Rage up`, `Armor/Weapon break`, `Dagger Combo`, `Leap (Gj3)`, `Ambience Day (Gj)`, NPC voices, etc.) | **JDSherbert** | `LICENSE.pdf`: *"licensed for commercial & non-commercial… **Do not copy, modify, edit… or REDISTRIBUTE this material without prior consent. All rights reserved.**"* | Commercial USE ok but **NO redistribution + NO modify** → a public repo commit = redistribution = **breach**. Not whitelist. (Koha: ko-fi.com/jdsherbert — but still can't ship it in an open repo.) |
| **Free Inventory** | **ElvGames** | `License.txt`: *"free… commercial… You CANNOT: Sell this asset pack, not even modified."* | Custom non-whitelist "no-resale"; ambiguous on public-repo redistribution → unsafe (not CC). Twitter @ElvGames. |
| **Ambient WAVs** (`Submerged Ruins`, `Haunted Place`, `Old Cemitery`, `Mysterious Cavern`, `Sacred Shrine`, …) | **Dafydd Harvey** | `Readme.rtf`: *"free sound pack, all I ask is credits + a reference to my Soundcloud"* | Informal — no explicit commercial/redistribute GRANT (an ask, not a licence). Unsafe until a real licence is given. soundcloud.com/dafydd-harvey |
| **All `craftpix-net-*` / `craftpix-*` packs** (~30+: monsters, orcs, trolls, skeletons, goblins, dungeon, plants, farm-animals, trees, bushes, crystals, explosions, etc.) | **CraftPix.net** | **CraftPix "Free Licence"** (known, prior catalogue): attribution-required + **NO redistribution** | **BANNED** (already established in `ASSET-LIBRARY-CATALOGUE.md`) — proprietary, can't redistribute. |

### ⛔ OFF-FORMAT — wrong style/resolution for the locked 32px-LPC 2D game (reject regardless of licence)
- The ~45 huge **material/texture zips** (`Desert`, `Metal`, `Roof`, `Ground`, `Grass`, `Water`,
  `Lava`, `Snow`, `Sand`, `Mud`, `Flesh`, `Fur`, `Tree Bark`, `Stone Wall`, `Cave Floor/Wall`,
  `Cobble Stone`, `Sci-Fi`, `Alien Floor`, etc. — 30–180 MB each). These are **seamless PBR
  surface textures** (3D/material maps), NOT 32px pixel tiles → fail the lock (C4/format) for a
  2D LPC game. Reject (don't even licence-check — unusable format).

### ❓ UNKNOWN — licence not yet found → unusable until clarified
- The many loose **music tracks** (`.wav`/`.ogg`/`.mp3`/`.rar`: `7pm`, `Brain Empty`, `Bird's Song`,
  `Lo-Fi Beats To Ride Dragons With`, `Dark Wind`, `Between The Dunes`, `Ancient Horrors`, `Theo's
  BGM Collection`, `PeriTune Battle Tracks`, `Dreamcore`, `dungeon_loops`, `Eclipzodiac`, the
  `vgm-atmospheric-*` set, the synthwave/lofi batch, `28 High Quality 16-bit RPG Music`, …) — many
  itch composers; **each needs its own licence read**. PeriTune is typically CC-BY (likely SAFE) but
  confirm; most others UNKNOWN. **None vetted → none usable yet.**
- Various **pixel tilesets/characters** (`basic 32x32 series`, `72 Character Free`, `3 Free Pixel
  Characters (32x32)`, `Crops.zip`, `Pixel Trees 32x32`, `garden_gfx`, `GARDENING TOOLS`, `SLIMES`,
  `rune_pack 16x16`, `Forest Ground Details 32x32`, `Pocket-Islands`, `60 Retro Effects`, …) — SOME
  are 32px and could conform IF their licence is whitelist, but **each needs its licence read +
  a C4 style trial vs ElizaWy** (most itch pixel packs are a different hand → likely C4-clash like
  the rejected stone-town set). UNKNOWN until vetted per-pack.

---

## COUNTS
- **SAFE + usable:** **1** (Icons_Essential, CC-BY 4.0 — not a current gap, catalogued).
- **UNSAFE / rejected (licence):** JDSherbert (3 packs + ~25 loose WAVs), Free Inventory, Dafydd
  ambient (~25 WAVs), **all CraftPix (~30+ packs)** — the bulk of the batch.
- **OFF-FORMAT rejected:** ~45 PBR/material texture zips.
- **UNKNOWN (need per-pack licence read):** ~60+ music tracks + ~15 pixel tileset/character zips.
- **Creators recorded (for credit/koha where used):** Crusenho (CC-BY ✅), JDSherbert, ElvGames,
  Dafydd Harvey, CraftPix, PeriTune (+ the many UNKNOWN composers TBD).

## RECOMMENDATION (for Van) — this batch is too large + mostly unusable; TRIAGE first
1. **Don't expect to use most of it.** JDSherbert + CraftPix (the bulk) are **no-redistribute →
   can't go in our public repo**, full stop. The texture zips are **3D/wrong-format**.
2. **The current real gap is MUSIC BEDS** — and the clean path is the **Tallbeard CC0 loop bundle**
   (`SLICE-ASSETS.md`), which is CC0 (redistributable). If any of the new music is **CC0 or
   CC-BY** (e.g. PeriTune), name it and I'll vet+import that specific track.
3. **If you want LPC-conforming life props** (crops/trees/animals), the SAFE route is the **OGA
   LPC sets already scoped** in `SLICE-ASSETS.md` (LPC Crops / Cats&Dogs / farm animals — CC-BY-SA)
   — NOT the itch grab-bag (unknown licence + C4-clash risk).
4. **Tell me the 2–3 packs you actually want** and I'll read each licence + C4-trial + import only
   the SAFE-and-conforming ones. **I imported nothing this session** — nothing was both SAFE and a
   current need, and bulk-importing unvetted/no-redistribute art would breach licences + the lock.

*Cross-links: ASSET-LEDGER.md (the attribution+support policy) · SLICE-ASSETS.md (the CC0/OGA gap
fills) · ASSET-LIBRARY-CATALOGUE.md (CraftPix already banned) · QUALITY-SPEC.md §0 (the lock that
rejects off-format/off-style). Triage doc — no asset imported/committed this session.*
