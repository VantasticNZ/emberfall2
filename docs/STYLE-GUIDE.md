# EMBERFALL 2 — STYLE GUIDE (the objective "does this asset fit" standard)

Concrete, measurable values pulled from the current LPC setup. Any new art/UI is
judged against THESE (Gate I art-cohesion + Part 2.5 DoD). When in doubt, match.

## Pixel grid & resolution
- **Terrain tile:** 32 px (`TILE` in src/data/assets.js); tiled 1:1, never upscaled.
- **Character frame:** 64 px (`FRAME`); one sheet per animation, rows in order
  `up, left, down, right` (`DIR_ROW`).
- **Animations:** idle = 3 frames @ 4 fps; walk = 8 frames @ 16 fps (`ANIMS`).
- **Native render:** 768 × 432 (16:9, `VIEW`); pixelArt + roundPixels ON.
- **Scale mode:** ENVELOP (fills the window, no letterbox); zoom levels
  `[0.7, 0.85, 1.1]`, default 0.85.
- Pixel art is NEVER smoothed (CSS `image-rendering: pixelated`); UI text is the
  only thing allowed to be sub-pixel, via `setResolution(3)`.

## Art source, palette & perspective
- **Family:** Liberated Pixel Cup (LPC). Characters = ElizaWy LPC Revised; terrain
  = ElizaWy LPC + Sharm LPC buildings. New art MUST be LPC or LPC-compatible so the
  palette + density match. (Mana Seed is BANNED — anti-AI licence.)
- **Palette:** the LPC palette (do not introduce off-family hues). Recolours come
  from the real LPC colour variants (e.g. shirt "Forest"/"Leather"), NOT ad-hoc
  hue-rotation hacks.
- **Perspective:** top-down ¾ (LPC standard). Tall props (trees, buildings) y-sort
  by their base; floors always behind actors (Gate C).
- **Character proportions:** ElizaWy "Thin" body, ~slightly-chibi head; paper-doll
  layers in z-order body(20) < shoes(24) < legs(28) < torso(40) < head(50) <
  brows(55) < beard(57) < hair(60) < weapon/shield front.

## Entity clarity (Part 2.5 P5)
- Player, NPCs and enemies must differ at a glance via body/hair/outfit colour —
  real LPC layers, not a tint. (Hero blue; Mara feminine + forest + blonde bob;
  Bram bearded + gray + leather.)

## UI language (the dialogue/HUD system)
- **Font:** monospace, white/cream on a dark panel; `setResolution(3)` for crispness.
- **Panel:** fill `#14121c` @ ~0.85–0.95 alpha, 2–3px border `#ffe9c2`.
- **Type scale (px @ res 3):** title 15 · body/dialogue 13 · choices 12 · help/labels 10–11 · speaker name 16 bold.
- **Colours:** cream `#ffe9c2` (headings/highlight) · body `#f3ecff` · muted `#cfc6e6`/`#9b93b0` · positive `#9fe6a0` · panel `#14121c`.
- **Rule:** every on-screen string sits on a panel where it overlaps busy art, and
  is readable at normal zoom (Part 2.5 P1). Text never clips its box (Gate A).

## When an asset does NOT fit
Wrong pixel density, off-family palette, smoothed/anti-aliased pixels, a flat
colour-box placeholder, a tint-hack instead of a real layer, or a sprite clipped /
mis-depth-sorted → it FAILS. Omit + flag rather than ship a fake (Part 2.5 P3).
