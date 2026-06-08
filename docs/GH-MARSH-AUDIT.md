# GH + MARSH — CONFORMANCE AUDIT (vs MASTER-MAP / QUALITY-SPEC / the gates)

> **Audit + report** (2026-06-09). Greenhollow + Ashen Marsh were built before the master-map and
> before the pixel-truth collider + feet-line depth fixes. This re-validates them. **Method:** the
> 13 verify gates (all GREEN) + the global engine fixes + a live look on the current build
> (`build 7b814460`). Per the overnight rule: trivial/safe items fixed, everything visual flagged
> 👁️-NEEDS-VAN (don't re-terrain/re-place unattended).

## TL;DR
The **live path is the Overworld** (`BootScene → scene.start('Overworld')`), so GH + Marsh inherit
the GLOBAL fixes automatically and **pass every gate**. The one real, long-standing gap is the
**Marsh ground = a tint, not a terrain set** (C2) — now *fixable* (T3 wired mud/mudstone/water), but
a visual re-terrain → flagged. Plus two flags (interactables; legacy discrete scenes).

## ✅ NOW CONFORMS (automatic — inherited from the global fixes; gates GREEN)
| Aspect | Why it conforms now | Evidence |
|---|---|---|
| **Colliders (pixel-truth)** | GH+Marsh props go through the SAME overworld `_buildRegion` → `solidBox` (opaque-pixel, perspective-aware) | `collision matches visual mass` gate GREEN for all 5 regions |
| **Depth-sort (feet-line)** | global `DepthSort`; actors tracked at `body.offset.y+height` (=30, the feet) — the front/back render fix applies everywhere | hero/NPC draw on-top-in-front / behind-when-above in every region |
| **Density floor** | unchanged content still clears the floor | `density floor: every ~24-tile sector across 5 regions has content` GREEN |
| **Seam coherence** | GH↔Belt↔Marsh edges share exact coords | `seam coherence (5 regions)` GREEN |
| **Prop-key / entrance / no-soft-lock** | all data-valid | gates GREEN; Marsh reachable, grants lantern+shard_1 |

## 👁️ GAPS TO FIX (eyes-on — NOT done unattended)
1. **Marsh ground is a TINT, not a terrain set (C2 violation — the long-standing flag).**
   The Marsh ground = `tile_grass` × `BOG_TINT 0x8d9a6e`; the "black water" = dark-tinted grass-ponds.
   Live look (`audit-marsh-tint-ground.png`): it reads as a **dark-green woodland, not an ashen
   mire** — `terrainPatches: 0` (no real terrain sets). **NOW FIXABLE:** T3 wired the bog grounds —
   lay **`mud` / `mudstone` / `mudstone_brown`** for the ground + **`water_green` / `water_deep`**
   for the black water (replace the tints). *Eyes-on:* does mud read as bog? mood/contrast vs the
   green? — a composition pass, exactly the Peaks C2 re-fix shape. **FLAG.**
2. **Marsh trees/decals are mood-tinted** (gray-brown) — acceptable for PROPS (tint-for-mood is
   fine); only the GROUND must become a terrain set. No action beyond #1.
3. **Interactable playground (proposed Gate K):** GH has the M4 cave (T4) + Peaks has cut/search/
   push (T1); **the Marsh has none.** Per Gate K (≥3 interactable kinds, ≥1 secret behind a
   breakable) the Marsh wants cut-reeds / searchable stilt-huts / a bog-cache secret. Data is
   safe-ish but PLACEMENT is eyes-on → **FLAG** (slot into the Marsh content pass).
4. **Legacy discrete scenes diverge (`GreenhollowScene`/`MarshScene`/`RegionScene`).** These are
   **NOT in the boot flow** (Boot→Overworld), but they still use the OLD `Collision.makeSolid` +
   footprint colliders + the pre-fix depth anchor (`RegionScene` ~L197/L201). Not a LIVE gap, but
   **divergent dead-ish code** → **FLAG**: either retire them or note clearly they're not the live
   path, so a future session doesn't "fix the Marsh" in the wrong file.

## 🔧 FIXED THIS PASS (trivial/safe)
- **None.** Every identified gap is a VISUAL re-terrain / placement / dead-code decision — none is a
  purely-safe logic edit, so per the overnight rule they're reported + flagged, not changed.

## RECOMMENDATION (for Van / the next eyes-on session)
1. **Marsh C2 re-terrain** (highest value): swap the tint-ground for `mud`/`mudstone` + `water_green`
   black water (T3 made this a *wiring* job, no sourcing). Same playbook as the Peaks C2 fix; judge
   the bog mood on the eye. Re-run the density + collision gates after.
2. **Marsh interactables** (Gate K): add cut-reeds + a searchable stilt-hut + one bog-cache secret.
3. **Decide the legacy scenes' fate** (retire vs keep-as-reference).
> GH itself needs no re-terrain (it already uses real terrain sets + reads correctly); its only add
> is the connector-zone expansion (see CONNECTORS.md) — also eyes-on.

*Cross-refs: MASTER-MAP §3 (Marsh spec + the "reconcile ground" flag) · QUALITY-SPEC §0/C2 (terrain
cohesion) · terrainTiles.js (mud/mudstone/water_green now wired, T3) · INTERACTABLES-DESIGN (Gate K)
· CONNECTORS.md (the GH↔Marsh belt expansion). Proof: audit-marsh-tint-ground.png.*
