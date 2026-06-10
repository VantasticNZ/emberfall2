# DOOR / ENTRANCE SYSTEM — the SET standard (one system, every door)

> Industry-standard door/entrance, applied uniformly to every enterable building, cave/dungeon, and
> interior. Reference feel: Stardew / Zelda ALttP — you step ONTO the dark inset threshold to enter; the
> rest of the building is solid. Status: **OPEN doorways BUILT + verified (GH)**; CLOSED/LOCKED states
> SPEC'd here for build-out (the morality-entrance hook). Reconciles `RPG-FEEL-STANDARD` pillar 1 +
> `no-floating-doors` (#20) + the new `doorway-geometry` gate (#21).

## 1. DOORWAY GEOMETRY (the standard — BUILT, EXACT TILE-ALIGNED)
- A building is a **SOLID footprint** (its base-band collider) with **ONE doorway carved in the front
  wall** = **exactly ONE clean TILE-ALIGNED walkable tile** (NOT an approximate float gap). The base-band
  is split into **tile-aligned** left + right solids around that tile; everything else is solid.
- **Why tile-aligned (the consistency fix):** the old ~1.1-tile float gap could leave the walkable gap and
  the trigger tile (`round(ccx/TILE)`) **mis-registered** — the trigger sometimes sat partly under a
  collider → "enters on some buildings, not others" + a **sub-tile sliver to snag on**. Snapping the
  doorway to a whole tile (`dCol=round((ccx-TILE/2)/TILE)`, solids end exactly at `dCol*TILE` /
  `(dCol+1)*TILE`) makes entry **identical on every building** and the gap unambiguous.
- The **doorway tile** is the **only walkable gap** → you reach it only by **stepping INTO the opening**,
  not from the path in front. The **TRIGGER = that tile.** Walk up into the threshold → enter.
- The opening renders as a **dark inset threshold** under the building's painted door (open state).
- **Implementation:** a building prop carries `door:'<interior>'` **or** `door:{to,state,owner}`
  (`world.js`); `_buildRegion` computes the tile-aligned doorway, builds the flanking solids, draws the
  threshold, and registers the trigger at the doorway tile (`this._buildingDoors{tx,ty,dcx,dcy,to,state}`,
  read by `_checkDoorWalk`). No free-standing `prop_door` sprite (gate #20). Identical for every building.

## 2. DOOR STATES — collision · interaction · visual (ALL BUILT)
| State | Walk-into behaviour | Choice (always consistent) | Consequence | Visual |
|---|---|---|---|---|
| **OPEN** ✅ | step into the threshold → enter | none | none | dark inset threshold |
| **CLOSED** ✅ | walking in ALWAYS opens the choice | **KNOCK** (no answer here yet) · **TRY THE HANDLE** → enter · **(Step away)** | try-handle = `entered_uninvited`, **−3 morality / −2 purity** | **closed-door sprite** in the doorway |
| **LOCKED** ✅ | walking in ALWAYS opens the choice | **KNOCK** · **TRY THE HANDLE** → "locked" → **BREAK IT DOWN** → enter · **(Step away)** | break = `forced_entry`, **−10 morality / −6 purity** + a "someone will have heard" alarm beat (sfx + banner) | closed door + a **lock glyph** |
- **The morality-entrance hook (LIVE):** invited/knock = clean; try-handle = a small hit; force/break = a
  big hit. Wired to Karma via `karma.commit({deed, morality, purity})` (the deeds `entered_uninvited` /
  `forced_entry` are now in the SSOT). A cruel hero racks up trespass; a courteous one knocks.
- **Config:** `door:{ to, state:'open'|'closed'|'locked', owner }` on the building prop. Every closed/
  locked door behaves identically (the choice is generated, not per-door). FLAG: KNOCK answering (an NPC
  opens) + the guard/alarm spawn are stubs (flavor beat only) — deepen in the social pass.

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
- **BUILT + verified (fresh cleared save, meta-rule 10):** the **6 GH buildings** each have an **exact
  tile-aligned inset doorway you walk INTO** — all enter **consistently**; the doorway tile is walkable
  on every one; **exit lands cleanly in the yard (NO stuck-on-the-line)** in + out. The **4 open** doors
  walk-in; **gh_home1 = CLOSED** (knock/try-handle → −3 morality) and **gh_home2 = LOCKED** (try → break
  → −10 morality + alarm) demonstrate the states; the deeds `entered_uninvited`/`forced_entry` fire.
  States read visually (closed-door sprite + lock glyph — `door-states-closed-locked.png`). Gates #20+#21
  pass; 0 console errors.
- **DEFERRED / FLAG:** KNOCK answering (an NPC opens) + a real guard/alarm spawn (currently a flavor beat);
  the lock glyph could be more prominent (polish); the other regions' building doorways roll out the same
  carve; PICK (lockpick item) as an alternative to FORCE. Tracked in `DEFERRED.md`.
