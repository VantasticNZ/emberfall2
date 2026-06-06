# MODIFIERS — design + planned registry

Game modifiers are **data** (`src/data/modifiers.js`), driven by the `ModifierRegistry`
system (`src/systems/Modifiers.js`), toggled in the options menu (`OptionsScene`).
Each entry: `id, name, desc, category, default, devDefault, effect?, ageGated?, requiresConfirm?`.

Categories: `cosmetic` · `gameplay` · `graphics` · `adult` (walled off — see bottom).
DEV: non-adult modifiers default **ON** (`devDefault`) so Van can see them; ship default is OFF.

## Built now (proof)
| id | category | effect | status |
|----|----------|--------|--------|
| blood_gore | graphics | gore on/off (off by default) | registry + flag wired; particle art later |
| big_head | cosmetic | head scale 1.8 | **wired + visible** (scales head-region layers) |
| loot_rich | gameplay | loot/gold ×2 | registry effect (`lootMult`) — economy reads it |
| more_gems | gameplay | gems ×3 | registry effect (`gemMult`) — loot reads it |

## Planned — COSMETIC
- Big-head / tiny-head / chibi proportions
- Colourblind palettes (protan/deutan/tritan), high-contrast UI
- Retro CRT / scanline filter, pixel-grid toggle
- Hat-only / costume cosmetics, name-tag styles
- Weather-always (rain/snow/fog) for screenshots

## Planned — GAMEPLAY / ACCESSIBILITY
- Loot-rich / gold-rich / gem-rain (economy multipliers)
- Damage modifiers: god-mode, one-hit-kills, double-enemy-HP, no-fall-damage
- Slow-motion combat, aim-assist, auto-pickup, infinite-stamina
- Permadeath / hardcore, no-minimap, no-quest-markers (immersion)
- Fast-travel-anywhere, day/night-lock, no-hunger
- Speedrun timer, enemy-density slider

## Planned — GRAPHICS / GORE
- Blood & gore on/off (OFF default), dismemberment (later, gated by intensity)
- Screen-shake intensity, flash-reduction (photosensitivity), damage-number style
- Particle density, depth-of-field, bloom

## ADULT MODE (18+) — WALLED OFF (architecture only; NO art exists)
Mature content for **adult characters only**, kept entirely separate:
- **OFF by default.** Enabling requires an explicit **18+ confirmation** in the options menu.
- A **master switch** (`adultMasterEnabled`) can remove the whole feature for a clean ship build.
- **HARD CODE CONSTRAINT** (`ModifierRegistry.adultAllowedFor(entity)`, unit-tested): adult-mode
  effects may apply ONLY to an entity that is `isAdult === true` and `isMinor !== true`. They can
  **NEVER** apply to the childhood protagonist or any minor — enforced in code, not convention.
- **No adult ART is built or planned here.** Any future art is a SEPARATE, licence-checked,
  much-later task with its own review. This document + the gated flag are the only footprint now.
- Planned (architecture placeholders only): mature dialogue/romance flags for adult NPCs, intensity
  sliders — all behind the same 18+/master/minor-safe gate.
