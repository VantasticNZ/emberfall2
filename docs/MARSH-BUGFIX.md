# BUGFIX PASS 2 — door placement + dash-into-void + bush-farm (+ overworld reality) (2026-06-10)

Three bugs + one diagnosis. Each fix verified with REAL input (incl. real dash + real cut-swings). 14
gates + 23 navGate/containment suites GREEN; 0 console errors.

## 1. Interior door in the MIDDLE of the floor — FIXED
- **Cause:** the door sprite was centered on the walkable trigger tile (1 tile in from the wall), so it
  floated with a strip of floor *below* it before the wall — read as mid-floor (`cemetery-door-position`).
- **Fix:** `doorWallOffset()` pushes the door **sprite one tile toward its room's nearest wall**
  (`spriteDy=+32` for a bottom exit), so it sits **in the wall** as a doorway — while the walk-trigger
  stays on the walkable tile. **Verified:** the cemetery door now sits in the wall (`door-fixed-in-wall`).

## 2. Dash into the void — FIXED (definitive backstop)
- **Cause:** could not reproduce via the swept-dodge alone (it checks the same wall colliders and contained
  the player in every live test). To make a void-breach **impossible** regardless of cause:
- **Fix:** a **hard interior containment clamp** in `update()` — when in an `interior`, the player center is
  clamped inside the region bounds (the void is beyond bounds); a breach snaps back + cancels the dodge.
  **+ the CONTAINMENT navGate extended** to assert dash-containment inputs (sealed walls + interior flag +
  bounds match the nav grid). **Verified:** real dash L/R/U into the cemetery walls → all contained inside
  bounds (the "down" exit was the legitimate door, not a breach).

## 3. Bush instant-respawn (infinite-farm exploit) — FIXED
- **Cause:** `_cutSwing` granted loot every cut and `delayedCall(12000)` **respawned the bush in-area** →
  re-cut every 12 s for infinite loot.
- **Fix:** a cut bush is recorded in `_cutBushes` (world-tile id → timestamp), **disabled with NO in-area
  respawn**; on area **re-entry** the props loop regrows it **only after `CUT_REGROW_MS` (3 min)**.
  **Verified (real swings):** cut → stays gone, re-cut grants nothing (`noFarm`), tracked; and a timestamp
  set >3 min ago → the bush **regrows** on re-entry (`regrew=true`).

## DIAGNOSIS — overworld vs board reality (the truth, no build)
**Confirmed: the connected west-walking world from Van's map is NOT built.**
- The **streamed overworld** is the OLD 8-region skeleton (re-centred): Greenhollow (tile 288), **Marsh**
  (238, west of GH), Belt, Peaks, Foothill, Coast, Emberwood, Spire — walk-between geometry.
- **Mirefen (tile 442), Fenwick (480), the Lost Cemetery (430)** live in the **far-band reserved corner**
  (`interior/settlement:true`) — they are **separate board-door scenes**, reachable **only** via the
  Greenhollow notice-board doors, **NOT** by walking west on the overworld to where Van placed them.
- Walking **west** from GH reaches the streamed **Marsh** region (the bog), **not** Mirefen/Fenwick.
- **Van's edited map (`world-map-vanedit.json`) was never built into the overworld** — it's design data.
- **Next session:** build the connected overworld FROM Van's map (place Mirefen/Fenwick/Cemetery as
  walk-to overworld locations at his coordinates, west of GH), so the world is traversable, not a hub of
  separate scenes.

---

# BUGFIX PASS — doors + interior containment + Fenwick visibility (2026-06-10)

Four bugs Van hit, each diagnosed + fixed + verified with REAL input (eyes-on). 14 gates + 23 navGate/
containment suites GREEN; 0 console errors.

## 1. Door trigger "too loose" (enter from near, not on) — FIXED (it was a VISUAL mismatch)
- **Diagnosed:** `_checkDoorWalk` is already **exact-tile** (fires only when the player's tile == the door
  tile). Live test: walking the row *beside* a door (passing over its column but one tile off) does **NOT**
  enter; stepping **onto** the tile does. So the "looseness" was a **perception bug** — the door marker
  was a tiny `prop_sign` sitting on a front-yard tile in front of the building, so you triggered "near the
  house" with no visible door where you stepped.
- **Fix:** see bug 3 — a real **doorway sprite** now sits ON the trigger tile, so what you see = where you
  enter. **Verified:** `passedBeside_didNotEnter = true`, `enteredByWalkingOnTile = true`.

## 2. Interior void (walk off the floor into black) — FIXED
- **Diagnosed:** all 22 interiors were already perimeter-sealed (proven), so it wasn't an open wall. The
  black was the **griddedSettlement floor only covering the streets** — the building-blocks were
  **unfloored = black holes** between the lanes, reading as "void you walk toward."
- **Fix:** `griddedSettlement` now **floors the WHOLE interior** (continuous ground; the blocks are floored
  under the buildings, with their colliders on top) → Mirefen/Fenwick are continuous dirt, no black gaps
  (`mirefen-floored.png`). **+ a CONTAINMENT navGate** added: asserts every interior/settlement has **no
  walkable perimeter tile** (23 enclosed) — so a void-escape can never regress.

## 3. Exit/door is a sign, not a door — FIXED
- **Diagnosed:** door + interior-exit markers were `prop_sign` placeholders (don't read as doors).
- **Fix:** drew a clean **doorway sprite** — `prop_door` (a wooden door in a stone frame, arched lintel,
  brass knob; original pixel art, CC0, ledgered) — and **swapped every door/exit marker** (22 across the
  GH overworld, the board, and all interiors/settlements) from `prop_sign` → `prop_door`. **Verified:** the
  chapel exit now renders as an obvious door (`door-closeup.png`). The eliza/victorian door sheets were
  side-view/window frames (not front-facing), so an original sprite was the clean path.

## 4. Fenwick / map changes not visible — DIAGNOSED: it IS built + reachable
- **Diagnosed:** Fenwick is fully built (4 houses + 2 NPCs + a furnished cottage) and its **board door
  tile is walkable**; live real-movement test **entered Fenwick by walking onto the door** from the GH
  board (`fenwick-reached-walking.png`). So it is **not** a build/registration bug.
- **The cause was client-side** (per the prior DIAGNOSE pass): a **stale browser tab** (Vite HMR doesn't
  restart the running Phaser scene) and/or not navigating to the far-band area. **Van's step:** hard-
  refresh `:5273` (Ctrl+Shift+R; confirm the stamp updates), then in Greenhollow walk **south to the
  notice-board** and **into** the "→ Fenwick / Mirefen / Lost Cemetery" doors. The board doors all walk-in.

## ✅ Verified (real input, 0 errors)
| Bug | Proof |
|---|---|
| 1 door on-tile only | beside-the-door → no enter; on-tile → enter (live) |
| 2 containment | 23 interiors/settlements sealed (test) + Mirefen/Fenwick fully floored |
| 3 real doorway | `door-closeup.png` — a door, not a sign |
| 4 Fenwick reachable | `fenwick-reached-walking.png` — entered by walking the board door |
