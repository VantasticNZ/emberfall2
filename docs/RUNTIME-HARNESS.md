# RUNTIME-ASSERTION HARNESS — the live gate that ends the false-pass cycle

> **The doctrine is now two gates, not one.** `npm run verify` is the **data gate** (fast, pre-commit: tests +
> id-orphan + licence + the ~50 source/data assertions). `npm run verify:runtime` is the **runtime gate**: it
> boots the REAL game in a headless WebGL browser, drives it with REAL keypresses the way Van plays, and asserts
> on the ACTUAL RENDERED SCREEN. Five features false-passed because a green DATA gate asserted a field while the
> SCREEN rendered the opposite (char-select faced the BACK; the shop list never reached Van's keeper; the menu
> "closed" on Map). Those classes are caught ONLY by eyes-on — this harness makes eyes-on automatic.

## Run it

```
npm run verify:runtime
```

- It auto-detects a running dev server (`npm run dev`, port 5273) or spawns one, then boots a headless Chromium
  (ANGLE + SwiftShader so WebGL renders with no GPU), runs the assertions, and prints `✓ / ✗` per check.
- Exit **0** = all green · **1** = a real assertion FAILED (a genuine still-broken bug) · **2** = could not run
  (no Chromium — `npx playwright install chromium`; this is an honest skip, NOT a green).
- It is **NOT** in the pre-commit hook (it needs a browser + ~90s). Run it before a release, after any
  visual/UI/feel change, and when porting a new false-pass. The fast data `verify` stays the per-commit gate.

## What's in it

- `scripts/runtime/harness.mjs` — the library. Three proven layers:
  1. **BOOT** — `boot(browser)` loads the game at a FRESH cleared save (Van's exact state), waits for the Title to
     actually render. WebGL is real (renderer.type === Phaser.WEBGL).
  2. **INPUT** — `press(page, key)` / `hold(page, key, ms)` send genuine browser keydown/up; `frames(page, n)`
     waits on Phaser's own loop counter (real frames, not wall-clock). `pressUntil(...)` re-presses past the
     headless dropped-first-keypress artifact (see Caveats).
  3. **PIXELS** — `pixels(page, x, y, w, h)` reads REAL rendered pixels via Phaser's `snapshot` (works with
     `preserveDrawingBuffer:false`, which a plain canvas readback does NOT). Returns nonBlack / avgLum /
     distinctColours for a region. `shot(page, name)` saves a full-frame PNG proof.
- `scripts/runtime/tests.mjs` — the assertions. The first five are the ported false-passes (T1–T5).

## The 5 ported false-passes (permanent regression tests)

| # | False-pass it would have caught | How it's driven + asserted (real input → rendered/real outcome) |
|---|---|---|
| T1 | char-select rendered the BACK while data said 'down' | real ENTER → char-select; assert the preview's layers PLAY a `-down` (front) animation, not the up/back row or a no-op frame 0 |
| T2 | M2 completed on dialogue-CLOSE, not the physical catch | M2 active; open + close its dialogue with real keys; assert M2 is STILL active (only the catch completes it) |
| T3 | punch fired but flashed past unseen / was a slash | real J; assert the body plays a `punch-*` anim that ADVANCES ≥2 frames, and the child is UNARMED |
| T4 | the SMITH Van opens showed a one-line buy, no list/sell | open the smith's wares dialogue, confirm with real E; assert the shop list panel + a labelled SELL toggle RENDER on the uiCamera |
| T5 | the menu "closed" navigating to Map | real ESC + arrow to Map; assert the menu is STILL open, the tab bar is visible, and the map renders |

## How to add a runtime assertion (do this for every new visual/feel feature — BUILD-METHOD)

1. Add an `async function tN_name(page, R)` to the `TESTS` array in `scripts/runtime/tests.mjs`.
2. **Drive with real input.** Reach the Overworld with `toOverworld(page)`, then use `press` / `hold` /
   `pressUntil`. Set up only the PRECONDITION state via `evalGame` (teleport, set a quest active) — never the
   thing under test. Headless can't walk 10 minutes of play; the precondition is not what you're asserting.
3. **Assert on the REAL outcome.** For a VISUAL claim, use `pixels(...)` on the region, or read the actually-
   rendered frame/anim (`currentAnim.key`, a visible Text object on the uiCamera) — never a `.data` flag that
   could lie. For a BEHAVIOURAL claim, assert the state REACHED by the real input.
4. `R.check('clear name of the promise', condition, 'detail for the log')`.
5. **Negative-prove it:** break the fix, confirm the check goes ✗, restore, confirm ✓. A runtime check you
   haven't watched fail is unproven.

## Caveats / honest limits (the most real version achievable here)

- **Headless drops the FIRST synthetic keydown after a panel opens** (a Playwright/Chromium artifact — the real
  browser Van uses does NOT). Use `pressUntil(page, key, readState, want)` for panel navigation so a dropped key
  is retried. (This is why the live MCP browser navigated the menu fine on the first try but the harness needed a
  retry.)
- **Headless Interaction *spatial* resolution can be flaky** (the talk-radius pick). It works live for Van; it is
  not a false-pass class. Where a test needs to "talk to NPC X", it may invoke `_npcInteract(def)` — the EXACT
  onInteract the E key fires — as the talk-trigger, then drive the rest (dialogue/option) with real keys and
  assert the rendered result. The MECHANISM under test (e.g. the shop opening + rendering) is always real-input +
  rendered-screen.
- **Pixel readback uses Phaser's `snapshot`**, not a raw canvas read (the WebGL buffer is cleared each frame with
  `preserveDrawingBuffer:false`). Full-frame screenshots (`shot`) are composited by Chromium and are reliable.
