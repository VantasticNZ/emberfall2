# EMBERFALL 2 — STANDARDS (single-sourced tuning + completion discipline)

Project-wide constants live ONCE and are reused — never re-hardcoded ad hoc in a
scene or system. `scripts/verify.mjs` lints for bare literals that bypass the SSOT.

## Canonical tuning constants

| constant | value | home | rule |
|---|---|---|---|
| **INTERACTION_RADIUS** | 72 px | `src/constants/standards.js` | the ONE talk/interact reach. Per-entity override ONLY with a stated reason, expressed as a DERIVED value (`INTERACTION_RADIUS * 1.5 /* reason */`), never a bare number. The Interaction system reads it as the default radius. |
| TILE | 32 px | `src/data/assets.js` | every tile coordinate uses `TILE` (e.g. `t * TILE`), never a bare `32`. |
| FRAME / DIR_ROW / ANIMS | — | `src/data/assets.js` | character frame size + row order + animation timing. |
| CHAR_FOOTPRINT | — | `src/data/assets.js` | collider + y-sort anchor. |
| per-actor movement speed | DATA | `src/data/world.js` | speed is a data field on each actor; the Movement system reads it. |
| camera lerp / baseZoom / cover-zoom | — | `src/scenes/GreenhollowScene.js` | the camera owner; one place. |
| UI sizing / fonts / colours | — | `GreenhollowScene._buildUI` + `docs/STYLE-GUIDE.md` | one UI language. |

**Adding a new shared tuning value:** put it in `src/constants/standards.js` (or its
owning module for module-local config) and import it. If you find the same number in
two places, that's drift — hoist it to the SSOT.

## verify enforcement
`scripts/verify.mjs` consistency check (best-effort) flags:
- a bare `radius: <number>` literal anywhere in `src/` → use `INTERACTION_RADIUS`.
- bare tile-size math (`* 32` / `32 *`) outside `assets.js` → use `TILE`.
Constant-derived expressions (`INTERACTION_RADIUS * 1.5`, `t * TILE`) pass.

## Session-completion discipline (CLAUDE.md HARD RULE 10)
- ONE focused, finishable objective per session.
- Multi-item request → end with a per-item **✅/❌ checklist**, proof for each. A
  dropped item shows as **❌ with a reason**, never silently omitted.
- Not "done" until every item is ✅ or explicitly ❌. Never silently re-prioritise
  away a requested item.
- End with the DoD self-check + (visual work) a screenshot.
