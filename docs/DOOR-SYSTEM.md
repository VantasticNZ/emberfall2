# DOOR / ENTRANCE SYSTEM — the SET standard (one system, every door)

> Industry-standard door/entrance, applied uniformly to every enterable building, cave/dungeon, and
> interior. Reference feel: Stardew / Zelda ALttP — you step ONTO the dark inset threshold to enter; the
> rest of the building is solid. Status: **OPEN doorways BUILT + verified (GH)**; CLOSED/LOCKED states
> SPEC'd here for build-out (the morality-entrance hook). Reconciles `RPG-FEEL-STANDARD` pillar 1 +
> `no-floating-doors` (#20) + the new `doorway-geometry` gate (#21).

## 1. DOORWAY GEOMETRY (the standard — BUILT)
- A building is a **SOLID footprint** (its base-band collider) with **ONE doorway GAP carved in the front
  wall** (centre). The gap is ~1.1 tiles wide — left + right colliders flank it; everything else is solid.
- The **doorway tile** (the dark inset opening) is the **only walkable gap** in the front wall → you can
  only reach it by **stepping INTO the opening**, not from the path/grass in front.
- The **TRIGGER = the doorway tile itself.** Walk up into the threshold → enter. (NOT a tile in the yard.)
- The opening renders as a **dark inset threshold** under the building's own painted door — so it reads
  as walking *into* the building (the building's porch/door + the carved gap + the dark threshold).
- **Implementation:** a building prop carries `door:'<interior>'` (`world.js`); the region build
  (`_buildRegion`) carves the base-band into left+right colliders, draws the dark threshold, and
  registers the walk-trigger at the doorway tile (`this._buildingDoors`, read by `_checkDoorWalk`). No
  free-standing `prop_door` sprite (gate #20). Reusable for every building in every region.

## 2. DOOR STATES — collision · interaction · visual (OPEN built; CLOSED/LOCKED spec'd)
| State | Collision (passable?) | Interaction (walk-into) | Visual |
|---|---|---|---|
| **OPEN doorway** ✅ BUILT | the doorway tile is **walkable**; step in → enter | **no prompt** — walking into the threshold enters | dark inset opening under the building's painted door |
| **CLOSED door** 🔢 SPEC | doorway tile **blocked by the door**; walking in opens a CHOICE | choice prompt: **KNOCK** (an NPC may answer / open) · **TRY HANDLE** (may be unlocked → enter; *uninvited entry = small morality hit* `entered_uninvited`) · **FORCE** (morality hit `forced_entry` + a chance of a guard/own­er alarm) | a **closed-door sprite** in the doorway (panelled door) |
| **LOCKED door** 🔢 SPEC | blocked | **KNOCK** · **PICK** (if `lockpick`/able → enter, *trespass morality hit*) · **FORCE** (bigger morality hit + alarm) | closed door + a **lock indicator** (a keyhole/padlock glyph) |
- **The morality-entrance hook:** CLOSED/LOCKED states tie entry to Karma — invited/knock = clean; try-
  handle/pick/force = escalating Morality/Purity hits (reuse the canonical deed ids; FLAG: add
  `entered_uninvited`/`forced_entry` to the SSOT when built). A cruel hero finds doors barred; a trusted
  one is welcomed. (This is the long-planned "door-knock / morality entrance" feel-layer.)
- **Per-building config (when built):** `door:{ to, state:'open'|'closed'|'locked', owner, alarm? }`.

## 3. INTERIOR EXIT doors (BUILT)
- Embedded in the interior **wall**, **inset** (the `doorWallOffset` pushes the door sprite into the wall,
  not free-standing mid-floor); **walk INTO it to leave** (`to:'back'`, the return-stack). Kept as-is.

## 4. GATES / CHECKS that defend this system
- **#20 no-floating-doors** — a door never renders a free-standing `prop_door` on terrain (building door =
  the carved opening; cave/dungeon = a marker; interior exit = embedded).
- **#21 doorway-geometry (NEW)** — every enterable building-interior has a WAY IN (a building `door` or a
  door interactable) + every door leads to a real interior → no un-enterable holes, no door-to-nowhere.
- **Eyes-on (visual-truth) + a Playwright screenshot** per building from a FRESH cleared save — the
  doorway renders where the data says, and you enter by walking INTO it (the carve correctness, which a
  pure-geometry gate can't see — see PROCESS-RETRO on the visual-check pattern).

## ✅ STATUS
- **BUILT + verified (fresh cleared save, build current):** the **6 GH buildings** (chapel · tavern ·
  store · forge · 2 cottages) each carve an **inset doorway you walk INTO** — all enter correctly; no
  un-enterable holes; the chapel doorway reads as a recessed porch/threshold
  (`door-system-chapel-doorway.png`). Gate #21 passes.
- **SPEC'd / DEFERRED:** the CLOSED + LOCKED states (knock/try-handle/pick/force + the morality hits +
  guard alarm) — the morality-entrance build-out; per-building `door` config; the other regions' building
  doorways roll out the same carve. Tracked in `DEFERRED.md`.
