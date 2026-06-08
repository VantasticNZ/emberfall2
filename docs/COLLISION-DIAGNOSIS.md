# COLLISION DIAGNOSIS — why the test passes but the game visibly clips (2026-06-08)

> Van: collision is visibly broken (hero clips into houses/rocks from multiple sides), yet the
> auto-test reports **11,886 passes**. This documents the REAL mismatch with visual + numeric
> proof, names the root cause, and proposes a non-circular "pixel-truth" test. **No fix this
> session** — diagnosis only.

## TL;DR
The collider is derived from the sprite's **frame rectangle × a fixed fraction** (MASS = "lower
55%"), **not** from the sprite's **actual opaque pixels** nor the object's true solid extent. So
the collider sits in the wrong place, the hero stops at the collider (not at the visible wall),
and **the test still passes because it checks the hero against the collider's own geometry — it
never looks at the sprite's pixels. The test is circular.**

## THE SMOKING GUN — the test is self-referential
`scripts/collision-autotest.browser.js` asserts: *"after pushing into a solid, the player's centre
did not cross the COLLIDER's centre."* Ground-truth = the collider. But the collider **is** where
the player stops, so the assertion is ~always true **regardless of whether the collider matches the
visible sprite**. A collider that is 24px too short (rock) or floating in transparent padding
(house) sails through the test while the hero visibly clips. It validates the collider against
itself.

## VISUAL PROOF
| screenshot | what it shows |
|---|---|
| `diag-clip-rock.png` | the hero **buried to the waist inside a boulder** — walked onto the rock's top and stopped mid-rock |
| `diag-clip-house.png` | the hero **walked 58px into the forge from the top and vanished behind it** (occluded) = "walked into the house" |
| `diag-overlay-forge.png` | **RED = collider, CYAN = sprite visible bounds.** The forge's whole upper mass (roof/windows) sits ABOVE the red collider — uncovered |
| `diag-overlay-town.png` | wide view, all colliders red: rock **tops poke out above** their colliders everywhere |

## NUMERIC PROOF (collider vs the sprite's actual pixels)
Measured live (sprite origin 0.5/0.5 → centre at p.x,p.y; collider = `solidBox` static rect):

| object | frame | opaque pixels (alpha>16) | collider | the mismatch |
|---|---|---|---|---|
| **prop_rock_boulder** | 59×54 | fills frame (0,0–58,53) | top is **24px BELOW** the visible top | hero walks onto the top **24px (≈45%)** of the rock → buried in it (drive-test: feet stopped 24px inside the visible top) |
| **prop_forge** (town hall/keep) | 96×128 | fills frame | top is **58px BELOW** the visible top | hero walks **58px into** the upper building from the N (drive-test confirmed +58px) |
| **prop_house_a** | 256×224 | (24,0)–(231,200): **24px transparent L+R, 23px transparent BOTTOM** | frame-based, so it extends INTO the padding | collider bottom sits **23px below** the visible base (phantom strip); collider is **~13px wider** than the wall each side → blocked in empty space / "invisible wall" |
| **prop_house_b** | 192×192 | (23,0)–(166,191): **23px L, 25px R transparent** | frame-based | hero stops **~13–15px before** the visible wall on E/W (gap) |
| **prop_fountain** | 64×96 | bottom at 0.854: **14px transparent bottom** | frame-based | collider bottom 14px below the visible base |
| **prop_tree_pine** | 60×136 | fills frame | trunk 16×14 at base; **canopy 122px uncovered** | OK *by intent* (walk behind canopy) — but the same frame-fraction math, not pixel-derived |
| **player** (hero) | container, body 16×8, offset(-8,22) | — | feet-box ~30px below sprite centre | **CORRECT** — the player body is a proper feet anchor; the clip is the OBJECT colliders, not the player |

## ROOT CAUSE (three compounding faults, one origin)
**Origin:** `solidBox(key, d)` (src/data/assets.js) builds the collider from `d.width/d.height`
(the PNG **frame**) and a class fraction — never from the sprite's opaque silhouette or the
object's true solid shape.

1. **Frame ≠ opaque pixels.** The eliza-structure buildings (house_a/b) and the fountain have
   **transparent padding** baked into their frames (24px sides, 23px bottom). A frame-derived
   collider lands in that empty padding → the hero is blocked in mid-air or short of the wall.
   (forge + house_paneled happen to fill their frames, so they escape *this* fault — which is
   exactly why "houses are off to different degrees": the error depends on each PNG's padding.)
2. **"Lower 55%" is wrong for compact objects.** That fraction encodes "walk behind the roof,"
   which only makes sense for tall buildings. For **rocks** (compact ground objects that are solid
   all the way up) it leaves the **top ~45% uncovered** → the hero walks into the rock. Rocks
   should be ~100% solid; the one-fraction-fits-all rule conflates rocks with buildings.
3. **Even for buildings the fraction is a guess** (58px of the forge's solid mass is walkable),
   and the y-sort base-anchor uses the *same* frame math, so collider and sort agree with each
   other but **neither agrees with the pixels**.

**Not the cause:** the player's own body (a correct 16×8 feet-box); sprite origin is a consistent
0.5/0.5 (no top-left/centre anchor bug). The fault is purely how the **object** collider is sized.

## PROPOSED FIX — a PIXEL-TRUTH test + collider (next session, not done here)
The test must use ground-truth that is **independent of the collider** = the sprite's **opaque
pixels**.

**Derive ground truth from art, once per texture** (the `__opaque(key)` probe already built this
session): scan the frame's alpha channel → the opaque bounding box, and a per-column "lowest
opaque pixel" profile (the silhouette's ground line).

**The collider rule becomes pixel-anchored:**
- Collider **width + horizontal position** = the opaque box (not the frame) → no padding gaps.
- Collider **bottom** = the opaque box's bottom (the visible base) → no phantom strip.
- Collider **height/extent** by class, measured from the opaque box:
  - **Compact/ground** (rock, barrel, chest, fence, fountain): the **full opaque box** — solid all
    around, you can't walk onto any part.
  - **Walk-behind** (tree, building): the lower **ground-contact band** of the opaque box (the
    trunk / the wall-foot), with only the genuine overhang (canopy/roof) left open — and that
    band's height comes from the silhouette, not a blanket 55%.

**The test (non-circular):** for each object, for each of N/S/E/W, drive the hero in (real input
or stepped physics) and assert the hero's **feet edge stops within ±T px of the OPAQUE-pixel edge**
(compact: all four sides; walk-behind: the base from S/E/W, occluded-behind from N) — comparing the
stop to the **sprite pixels**, computed separately from the collider. A collider that doesn't match
the silhouette now **fails** (hero stops inside/short of the visible mass). Tolerance T ≈ the
player half-footprint (~8px). This can never pass while visibly clipping.

**Scope note for the fix:** apply per-texture opaque bounds (cache them), keep ONE rule, and
re-run the pixel-truth test over every solid in GH + Peaks until every object stops at its visible
edge.

*Cross-links: src/data/assets.js `solidBox` (the rule to replace) · scripts/collision-autotest.browser.js
(the circular test to replace) · scripts/verify.mjs gate #10 (asserts the rule, also frame-based).
Diagnosis only — no collision code changed this session.*
