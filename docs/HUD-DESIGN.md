# HUD — the built spec (dedicated HUD pass)

What this session BUILT into `RegionScene` (so every region gets it for free), wired to
the REAL systems. No fabricated values — anything not yet a live system is reserved + flagged.

## Layout (all `scrollFactor 0`, on the UI camera, `DEPTH.OVERLAY`)
- **Stats panel** (top-left, under the title bar) — a solid dark panel, the established
  3× monospace font (Part 2.5 P1 readable).
- **Minimap** (top-right) — a live rendered map of the region.
- **Quest tracker** (under the minimap).
- **Objective marker** (a directional arrow near the player).
- **Full-map overlay** (centred, toggled).

## Elements → real system wiring
| Element | Source system | Notes |
|---|---|---|
| **HP** bar + `x/max` | `Inventory.hp` / `Inventory.stats().maxHp` (combat writes `inv.hp`) | turns red < 30% |
| **MP** bar | — | **RESERVED**: no mana system exists yet, so it's drawn **greyed + labelled "reserved (no mana system yet)"** — never a fake value. Wire when a mana/spell-points system lands. |
| **Gold** | `Inventory.gold` | live |
| **Morality + Purity** | `Karma.getStatus()` (both axes + `moralityTier`/`purityTier`) | both karma axes with tier labels |
| **Time** | `TimeOfDay.phase()` + `dayCount()` | now instantiated + ticked in `RegionScene` (`advanceRealSeconds(dt)`); shows phase word + day |
| **Quest tracker** | `QuestEngine.byState('active')` + `defs[id].title` + `defs[id].steps[step[id]].desc` | up to 3 active quests; current objective text |
| **Minimap / full map** | the scene's `ground.rects` + `_ponds` + `props` + `_poi` (NPCs) + player | colours: grass/path/dirt/garden/water/buildings/woods; gold = quest-givers, white = you |
| **Objective marker** | the active quest's giver NPC (`_npcByQuest[id]`) | a gold arrow offset from the player toward the target; hidden when you're already there |

## Toggles (canonical control map — SSOT, remappable)
Added to `src/constants/controls.js` (`ACTIONS` + labels + `DEFAULT_KEYBOARD`); read live from
`bindings.keyboard[action]` so they remain remappable:
- **`toggle_map`** (default **O**) — open/close the full-map overview. (`M` is the dev region-jump in Greenhollow, so the map uses `O`.)
- **`toggle_tracker`** (default **T**) — cycles the tracker: **full → off → title-only → full** (the on/off + detail toggle in one key).
- **`toggle_objective`** (default **Y**) — show/hide the objective arrow.
- **`toggle_hud`** (default **H**) — hide/show the whole HUD (clean view).

## Verified live (HARD RULE 9)
HP shrinks on damage (45 → 68px bar); gold updates (20→160); time advances (D1→D4); a karma
choice moves Morality/Purity + tiers; accepting a quest fills the tracker with its title +
objective; the minimap player dot tracks; the full map + tracker-detail + objective + hide-HUD
toggles work (incl. via the real key). `npm test` (9 suites) + `npm run verify` green; 0 errors.
Proof: `proof/hud-full.png`, `hud-fullmap.png`, `hud-tracker-title.png`, `hud-off.png`.

## Reserved / flagged for follow-up
- **Mana/MP** — reserved element only (no mana system yet).
- **Objective indicator** — ships as the **basic directional arrow** (toward the quest-giver). The
  Fable-style **glowing-path-on-the-ground** is the larger follow-up (needs per-step world target
  positions + a path/route renderer) — FLAGGED, not built this session.
- **HUD toggle persistence** — toggle states are per-session (in-memory). Persisting them needs the
  save plumbing (a settings/save block; bump `SAVE_VERSION` per the Save-Versioning rule) — FLAGGED.
- Minimap is a coloured schematic (rects + dots), not a textured render — sufficient + cheap; a
  prettier textured minimap is optional polish.
