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
