# SAVE / PERMANENCE — STRESS-TEST REPORT (2026-06-09)

> Stress-tested SaveManager across regions/chunks + the linked sub-systems. **Verdict: SOLID —
> no holes found.** Nothing respawns or re-grants; position + every delta + karma/quest/inventory/
> time all persist, idempotently, across save→reload AND a full browser reload.

## What was tested
**Headless** (`src/systems/SavePermanence.test.js`, in `npm test`) — a realistic cross-region
playthrough then a fresh-world load:
- **Chunk DELTAS in 3 different chunks** (GH/Marsh/Peaks): chests `recordOpened`, a searched
  container (same `opened` family), `recordKilled` ×3 (a boss + 2 enemies), `recordPicked`, a
  `setChunkFlag` lever → all restored exactly.
- **Linked systems:** Karma (deeds: tool_lantern/shard_1/cave_lore + morality 37 / purity −12),
  Inventory (gold +123, items, an equipped steel_sword), QuestEngine (M4 complete + the choice),
  TimeOfDay — all restored exactly.
- **NEGATIVE checks:** an un-touched chest/enemy is NOT marked opened/killed (no false permanence
  / no accidental respawn-block).
- **Idempotency:** save→load→**save→load** again = no drift.
- **Post-load guards:** the scene's `if (looted || save.isOpened(...))` guard still fires after a
  reload → a looted chest can't be re-claimed; a killed enemy isn't respawned.

**Live** (Playwright, build `7b814460`, real flow): searched a Peaks barrel (gold +2) → `F5` save →
**full page reload** → the scene auto-`load()`s → gold (22), the test deed, and position all
restored; **re-searching the barrel granted nothing** (still searched across the reload).

## Results
| Axis | Result |
|---|---|
| Position / area / timeFrac | ✅ persists |
| Chests opened (delta) | ✅ stay looted — no re-loot, no respawn |
| Searchable containers (Interactables) | ✅ stay searched (same `opened` delta family) |
| Enemies killed (delta) | ✅ stay dead across region re-entry |
| Items picked / chunk flags | ✅ persist |
| Karma deeds + morality/purity | ✅ persist |
| Inventory gold / items / equipment | ✅ persist |
| Quest state + choices | ✅ persist |
| TimeOfDay | ✅ persists |
| Idempotent double round-trip | ✅ no drift |
| Full browser reload (auto-load) | ✅ everything restored |

## Holes found
**None.** No fix required. The chunk-delta + linked-system composition (`save.link(...)`) is
robust; the chest/search/kill guards all key off the same persisted deltas.

## Notes (not holes)
- Enemy/chest/container permanence all share the per-chunk `opened`/`killed`/`picked` delta keyed by
  the placement `id` — so any NEW interactable just needs a stable `id` (the T1 interactables use
  `ix_<id>`, which round-trips — verified).
- The recentre-v3 chunk-key shift (`RECENTRE_V3_SHIFT`) is handled by `hydrate()` migration (covered
  by the existing SaveManager.test); this stress test runs on current-version saves.

*Cross-refs: SaveManager.js (deltas + link/serialize/hydrate) · SaveManager.test.js (version
migration + base round-trip) · Interactables.test.js (search-once permanence) · OverworldScene
(saveGame/loadGame + the chest/kill/search guards).*
