# GATE PROMISE-vs-ASSERTION AUDIT

> The recurring failure (PROCESS-RETRO): a gate asserts **narrower** than the law it defends, so the build goes
> green while the promise is broken — L1 trusted the `childClothed` *flag* while the child was pantless; L2
> checked *speaker placement* but not the *spoken claim*. This audit states, for every law + major frozen-system
> gate, what the law **PROMISES** vs what the gate **ASSERTS**, and marks each **ALIGNED** / **WIDENED-NOW** /
> **RESIDUAL-GAP** (deferred, with the cost to close). The rule going forward: a gate must assert its law's
> *truth class* — pixel where the promise is visual, runtime where it is behavioural — or the gap is logged here.

## Laws L1–L6

| Law | PROMISE | GATE ASSERTS | Status |
|---|---|---|---|
| **L1** composition | every character renders a COMPLETE matched set (visual) | data (clothed flag, no cross-body-type, body+head present) **+ PIXEL leg-coverage on idle AND walk** (decodes the sheet, fails on a bare-leg band) + child-hair declares a seat `oy` | **WIDENED-NOW** (idle→idle+walk this pass). RESIDUAL: hair *seating* is asserted by `oy`-presence (data), not by compositing head+hair and pixel-checking the cap — close = a Node head+hair compositor (~medium). |
| **L2** presence | no disembodied speaker; a line's location-claim matches placement | speaker shares the giver's REGION; `LOCATION_CLAIMS` manifest checks each claimed NPC is placed in the claimed REGION | **ALIGNED at region grain.** RESIDUAL: region-level, not tile-level (an NPC in the right region but across the map still passes) — close = claim a building/tile + assert tile-proximity (~cheap, needs richer manifest). |
| **L3** spatial continuity | exiting an interior lands you at that building's EXTERIOR door tile | `doorway-geometry`: every interior has a `back` exit + a real floor. **No gate asserts the landing POSITION == the door tile** (it's the runtime return-stack) | **RESIDUAL-GAP** (runtime). Eyes-on + the live VAN-TEST cover it. Close = a Playwright assertion (enter→exit→assert player tile == door tile) — needs the runtime-assertion harness (~medium). |
| **L4** critical beats | a mandatory beat BLOCKS progression until done | `blocking-beats-block`: the blocker check EXISTS in data | **RESIDUAL-GAP** (runtime). The actual shut-door is eyes-on (proven live this slice). Close = Playwright (try-exit-before-beat → assert blocked) — runtime harness (~medium). |
| **L5** panels | balanced, on-screen at ANY viewport | `panel-bounds-inside-viewport`: each panel registers with the zoom-1 uiCamera (so it is screen-space + clamped by `_clampPanel`) | **ALIGNED for the mechanism.** RESIDUAL: the clamp MATH isn't pixel-verified at exotic sizes — close = Playwright resize sweep + bounds read (~medium). |
| **L6** deed-timing | karma moves on the DOING, never the intent | `deed-timing`: every karma-moving choice is classified; a `deferred` choice's option must carry `defer:true` | **ALIGNED for the data invariant** (an intent-fork can't silently move karma on the line) — negative-proven. RESIDUAL: the gate can't prove the SCENE actually fires the deferred deed (could pledge-then-never-resolve → quest stuck). Runtime-proven manually this pass. Close = Playwright (pledge → do the action → assert deed) — runtime harness (~medium). |

## Major frozen-system gates

| Gate | PROMISE | ASSERTS | Status |
|---|---|---|---|
| `collision-matches-visual-mass` | no walk-through solid-mass prop | every visual-mass prop is `solid` OR collider-backed (data) | RESIDUAL: collider EXISTS ≠ collider BLOCKS at runtime (no real physics). Eyes-on. (PROCESS-RETRO §weak-gates.) |
| `doorway-geometry` | every building enterable, door in the painted opening, interior not a black void | door targets resolve, every building enterable, every interior has a `back` + a real terrain floor; door declared on the asset | ALIGNED at data grain; the door-sits-in-the-painted-opening pixel was proven once (snapshotPixel), not per-build. |
| `furniture-non-collision (R2+R6)` | no furniture overlap/clip/blocked-approach; wall-backed items back a wall | per-item footprint + wall-adjacency by type (logical tiles) | ALIGNED (simulation over the real placement data). |
| `no-soft-locks` / `ability-coverage` | every key reachable; no key behind itself | graph reachability + acyclicity over the gate data | RESIDUAL: graph, not physical traversal (a key reachable on the graph but walled-off in pixels). The nav flood-fill gates partly cover the physical side. |
| `designed-vs-built` | the running world matches the locked map | settlement build-state vs the spec (data) | ALIGNED for presence; the 7 board-only relocations are tracked in DEFERRED, not hidden. |
| `kids-protected` | a child can never be harmed | every `kid` NPC is `protected:true` (data) + the scene tags `protected` | ALIGNED (data invariant; the no-target path is eyes-on). |
| `shop-stock-non-empty` | no empty buy menu on a fresh save | every shop/keeper offers ≥1 buyable on a fresh-save simulation | ALIGNED. |
| `modifier-applied-in-active-scene` | a toggle actually does something | big-head/gore apply in the active scene (source check) | ALIGNED for wiring; the visual effect was pixel-proven once, not per-build. |

## What was WIDENED this pass (cheap, no new harness)
- **L1 leg-coverage → idle + walk:** the pixel leg-band check now decodes BOTH the idle and the walk sheet of
  every clothed child body, so a body covered standing but bare-legged walking now FAILS (negative-proven).

## RESIDUAL gaps DEFERRED (need the runtime-assertion harness) — see DEFERRED.md
The behavioural/runtime promises (L3 landing-tile, L4 actual-block, L5 exotic-viewport bounds, L6 deferred-deed
actually-fires) and the per-build pixel re-proofs (door-in-opening, modifier-visual, hair-seating composite)
all need a standing **Playwright runtime-assertion harness** in CI (enter/exit/try/do → assert state/pixel),
which is a ~medium build. Until then they are covered by eyes-on + the live VAN-TEST each slice step. Logged
in DEFERRED.md with the harness as the single unlock.
