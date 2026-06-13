# ASSET-GAP RESOLUTION — evidence, not assertion

> The accumulated art gaps, resolved by the four paths (A FETCH · B COMPOSITE/recolor · C LOCAL-GENERATE ·
> D COMMISSION/hand-art), split into the two classes the work actually divides into. **Every verdict below is
> backed by an investigation or a real generation test — images in `docs/asset-gap-evidence/`.** No game-code
> changes; no builds. Licence-first throughout.

## The local generation stack (PROVEN runnable this session)
- **GPU:** NVIDIA RTX 4060, 8 GB. **ComfyUI 0.18.1** at `C:/ComfyUI`, **torch 2.6 + CUDA**. Server started + the
  API queued real jobs successfully.
- **Models present:** SD1.5 `dreamshaper8` + `sd15`; **FLUX** `flux1-schnell-fp8`; and a **PixelArt LoRA**
  (`PixelArtRedmond15V-PixelArt-PIXARFK`). So a pixel-art-capable pipeline exists today.
- **The full LPC library** lives at `C:/GameAssets/lpc-full` (145k PNG, every body type + ALL 17 animations +
  `sheet_definitions`). This is the FETCH goldmine — most Class-B fetches resolve here.

---

## CLASS A — STANDALONE ART (no rig): item icons · portraits · concept/background
**Real test:** generated 3 pixel-art ITEM ICONS via ComfyUI (dreamshaper8 + PixelArt LoRA, 512², 26 steps).

| Target | Result | Evidence |
|---|---|---|
| Health potion | ✅ recognizable pixel potion (purple/white body, red cork) | `icon_potion_00001_.png` |
| Iron ore chunk | ✅ recognizable ore-rock pile with metallic glints | `icon_ore_00001_.png` |
| Steel sword | ❌ produced a whole armoured KNIGHT, not a sword (prompt drift) | `icon_sword_00001_.png` |

**Honest read of the output:** usable-as-CONCEPT, **not usable as-is**. Every image is 512² with a grey
(non-transparent) background + a drop shadow + a *rendered/semi-shaded* look that does **not** match the game's
flat LPC/eliza style; and ~1 in 3 misses the prompt (sword → knight). To become a game icon each needs:
downscale to 32–64px → background removal (the grey isn't pure) → palette/flatten pass → hand-clean. = **viable
draft pipeline, moderate per-icon finishing.**

**Better path for the buy-UI icons specifically — FETCH `eliza-objects`.** The library already has
`asset-library/2d/items/eliza-objects/Small Items/` (Ores & Ingots, Food, lighting, buckets, dishes, …) —
real LPC item sprites, **OGA-BY 3.0, style-matched, zero cleanup**. That closes the buy-UI-icon gap (task #66)
cleanly without AI.

**Class-A verdict:** the local stack CAN close standalone-art gaps (icons / NPC portraits / concept art) as
DRAFTS that need light-to-moderate hand-finishing. **Recommendation:** buy-UI icons → **FETCH eliza-objects**
(best); bespoke icons/portraits/concept art with no LPC equivalent → **local-gen draft + hand-finish** (now a
real option, document the workflow when first used).

---

## CLASS B — RIG-MATCHED CHARACTER PARTS
**Real test:** asked the same stack for an "LPC walk-cycle sprite sheet, 4 directions, fat bearded man,
transparent" → it produced **15 unrelated front-facing character portraits** (`rigtest_walksheet_00001_.png`):
no direction rows, no consistent frames, no transparency, wrong proportions, not the LPC rig. **This PROVES
local-gen cannot produce a usable rig-matched animation sheet** — only a sheet of disconnected concepts. (Useful
nuance: those 15 are good *reference* for a character's LOOK, but not a frame you can ship.)

| # | Gap | A FETCH (LPC same rig) | B composite | C local-gen | D commission/hand | RECOMMENDED |
|---|---|---|---|---|---|---|
| 1 | **Fazy fat/wide body** | `muscular` body exists (bulkier, NOT fat) — closest fetch; no true "fat" body in LPC | widen-warp the body → per-frame drift, risky | concept-only (the 15-man sheet is a great Fazy ref) | a fat LPC body across the 15 anims (known community gap) | **muscular as a stopgap** (reads bigger), or commission a fat body |
| 2 | **Sit frames** | ✅ `sit.png` exists in lpc-full for EVERY body (male/female/child/muscular) | n/a | n/a | n/a | **FETCH** — re-export sit.png through the eliza pipeline (cheap build) |
| 3 | **Dodge-roll frames** | no `roll`; `jump.png` exists as the nearest motion | n/a | concept-only | hand-draw a 6–8f roll, or adapt jump | **jump-as-roll stopgap**, else commission a true roll |
| 4 | **Monster/creature rig** | `tail`(lizard/wolf) + `wings`(bat/lizard) layers + recolor on the human rig; skeleton/zombie bodies exist | the goblin-child composite already SHIPS (green tint + horns) | concept-only | a bespoke creature rig | **goblin-composite now (done)** + tail/wings for variety; commission for a true creature |
| 5 | **Child stick/toy overlay (hand-tracked)** | ❌ LPC weapons cover male/muscular/teen — **not the child body** | a static (non-tracked) overlay bounces like the old hair | concept-only | adapt a teen weapon sheet to the child rig + hand-track per frame | **hand-art/commission** |

**Class-B verdict:** the local stack genuinely **cannot** close any of these (the rig test is the proof). They
resolve by FETCH where LPC covers it (sit ✅, monster tail/wings, muscular-stopgap), and by hand-art/commission
where it doesn't (true fat body, true roll, child weapon overlay).

---

## Blocking vs cosmetic, and honest cost

| Gap | Status | Cost of the real fix |
|---|---|---|
| **Buy-UI item icons** | quick win — not blocking | FETCH eliza-objects: ~1 build session (extract + ledger + wire). |
| **Sit frames** | cosmetic, cheap | FETCH lpc-full sit.png: ~1 short build session. |
| **Fazy fat body** | **most visible** ("reads wrong" now — thin + standing) | muscular stopgap = ~1 session; a true fat body = a commission (~15 anim sheets) or a careful hand-widen. Not game-breaking; the rename + posed-static seat hold meanwhile. |
| **Monster creature rig** | cosmetic (goblin-composite ships) | tail/wings variety = ~1 session; a true creature rig = commission. |
| **Dodge-roll frames** | cosmetic | jump-as-roll stopgap = ~1 session; a true roll = a small commission/hand-draw. |
| **Child stick overlay** | cosmetic-deferred | hand-art/commission a child weapon overlay + a Character child-weapon slot. |

**Bottom line:** the local stack (ComfyUI + PixelArt LoRA + FLUX, RTX 4060) **closes Class A** (standalone art,
with hand-finishing) — though the buy-UI icons are best closed by the eliza-objects FETCH. It **cannot close
Class B** (rig-matched frames) — proven by the rig test. Of the five rig gaps, **two are clean FETCHes** (sit;
monster tail/wings), one has a **stopgap FETCH** (muscular for Fazy), and the genuinely-must-commission set is
small: a true fat body, a true roll, and the child weapon overlay.

*Evidence images: `docs/asset-gap-evidence/` (icon_potion, icon_ore, icon_sword, rigtest_walksheet).*
