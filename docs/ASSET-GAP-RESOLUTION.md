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

---

## SPIKE — the consistency chain (LoRA + ControlNet/OpenPose + IP-Adapter): does free-tool consistency near "always"?

**Chain availability (checked):** PixelArt LoRA ✅ · ControlNet **OpenPose model present** (`control_v11p_sd15_openpose_fp16`) + ControlNet nodes ✅ · **IP-Adapter NOT installed** (no `models/ipadapter`, no `clip_vision`, no IPAdapter custom node). So I ran the installed half — **LoRA + ControlNet(OpenPose) + a LOCKED seed + identical prompt** — across two poses (the identity-locking IP-Adapter would slot in here but isn't present).

**Test:** drew two OpenPose COCO-18 skeletons (`pose_idle` legs-together / `pose_walk` legs-apart, arms swung) and generated the SAME character (green-tunic brown-hair boy) on each, same seed 4242, same prompt.

| | idle pose | walk pose |
|---|---|---|
| Pose followed? | ✅ stands, legs together | ✅ wider stance, legs apart, arms shifted |
| Evidence | `spike_idle_00001_.png` (+ `pose_idle.png`) | `spike_walk_00001_.png` (+ `pose_walk.png`) |

**Honest result:**
- **Pose control works** — ControlNet drove the stance from the skeleton in both.
- **Identity is *roughly* consistent** — same green tunic, brown hair, apron, boots, palette — better than expected from seed+prompt alone (and IP-Adapter, if installed, would tighten it further). Good enough for **concept art / a portrait set**.
- **But NOT frame-consistent for animation.** Each is a full illustrated FOREST SCENE (the prompt's "plain white" was ignored), at a **different scale, position, and registration**; **no transparency**; the **face, proportions, and exact garment pixels DRIFT** between the two. Forced into aligned transparent frames they would visibly wobble — turning these into real walk frames = redrawing each frame by hand = MORE work than hand-pixeling or using the LPC rig.
- **IP-Adapter (the missing piece) can't rescue it.** It improves *identity* match; it does nothing for *registration / scale / transparency / 4-direction rig alignment* — the parts that actually block animation. And it isn't installed (installing = the IPAdapter-plus node + ~1 GB of ip-adapter + clip_vision models — a setup task, not a runnable-as-is path).

**Verdict on the bigger question:** **No — the free-tool chain does NOT get near "always" for rig-matched animation frames.** It gets near "same character concept, re-posed" (useful for concept/reference/portraits, i.e. Class A), but the consistency that ANIMATION needs (identical sprite, registered on a grid, transparent, across 4 directions × N frames) is not achievable from this stack without per-frame hand-redrawing. Class B rig parts remain **FETCH (LPC) where it exists, else commission** — unchanged by the spike. The spike's positive: this chain IS a credible **concept/portrait** generator (Class A), which the prior Class-A test already supports.

---

## SPIKE 2 — generate-one → SAM-segment → rig-derive: viable future-games infra? (evidence, 2026-06-13)

Tested the full architecture on ONE character, free tools only. Images in `docs/asset-gap-evidence/`.

**1. Generate one clean idle** — ✅ feasible. Two tries gave a clean blue knight, front, plain bg
(`spike2_idleA`). Local-gen does standalone character CONCEPTS fine.

**2. SAM-segment** — SAM is **free + installs fast** (pip `segment-anything` + the ViT-B checkpoint, 357 MB in
~6 s; needs `opencv-python` too, also free). But on the detailed pixel-art knight `SamAutomaticMaskGenerator`
returned **57 masks** = one full-frame background blob + dozens of **armor-plate / shading fragments**, NOT body
parts (`spike2_sam_masks.png` — coloured patches scattered over the plates, not head/torso/arms/legs). To get
riggable limbs you'd have to **manually merge/recut ~56 fragments**, and armour plates cross the joint lines so
even merged they aren't limb-shaped. SAM segments by *visual region*, not *skeleton*.

**3. Rig + derive poses** — gave the rig its BEST case (a CLEAN manual limb split, bypassing SAM's mess) and
transformed parts into a walk + a turn (`spike2_derived_walk.png`, `spike2_derived_turn.png`):
- **Identity holds ✅** — same pixels, recognizably the same knight (as expected).
- **Walk frame ❌ joints break** — rotating/shifting flat parts leaves **gaps, seams, and detached limbs** at
  the shoulders/hips (white holes where the rotation exposes nothing behind). Flat parts don't foreshorten or
  bend; each derived frame needs **hand inpaint/cleanup**.
- **Turn ❌ impossible by transform** — a FRONT-only image has **no side data**, so a 3/4 or side view can't be
  derived; the "turn" is just a squashed front (still facing the camera). Turns/other directions need WHOLLY
  NEW art every time.

**Per-character effort (honest):** generate (retry to a clean one) + segment (SAM over-segments → manual
regroup, or just manual-split) + rig setup + per-pose transform + **per-frame hole-fill** + **a fresh generation
per direction** (front-only can't turn). That is **more** work than (a) the LPC layer-rig — author/FETCH one
canonical part, get ALL frames × 4 directions deterministically — or (b) hand-pixeling, and the consistency only
"holds" inside the mild transforms of one source view.

**VERDICT: NOT viable as cheap future-games infrastructure.** generate-one→segment→rig can jitter a front
character into rough pose variants (with hand-fill), but it cannot produce the 4-direction, clean-jointed,
registered animation set a game needs — turns alone break it, and SAM doesn't hand you limbs. The **LPC
layer-rig stays the answer** (one authored/fetched part → deterministic frames everywhere). Local-gen's real,
proven role is the **standalone concept/icon/portrait DRAFT** (Class A) — not character animation. No pipeline
commitment.

*Evidence images: `docs/asset-gap-evidence/` — spike2_idleA/B, spike2_idle_cut, spike2_sam_masks,
spike2_derived_walk, spike2_derived_turn (+ the earlier icon_*, rigtest_walksheet, pose_*, spike_idle/walk).*
