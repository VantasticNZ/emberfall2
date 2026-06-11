# DOOR / ENTRANCE SYSTEM — the SET standard (one system, every door)

> Industry-standard door/entrance, applied uniformly to every enterable building, cave/dungeon, and
> interior. Reference feel: Stardew / Zelda ALttP — you step ONTO the dark inset threshold to enter; the
> rest of the building is solid. Status: **OPEN doorways BUILT + verified (GH)**; CLOSED/LOCKED states
> SPEC'd here for build-out (the morality-entrance hook). Reconciles `RPG-FEEL-STANDARD` pillar 1 +
> `no-floating-doors` (#20) + the new `doorway-geometry` gate (#21).

## 0. ASSET-OWNED DOORWAYS (the governing principle — Van) ★
**Every building ASSET declares its own doorway, so a fix to the door system applies to ALL buildings —
never patch doors per-building again.**
- In `assets.js`, each building PROP declares `doorway: { px }` — the painted door's horizontal offset
  from the sprite centre (native pixels), **read off the actual sprite art** (store door = bottom-RIGHT
  `+36`; paneled porch = `+40`; manor door = bottom-LEFT `-46`; forge = centre `0`).
- The ONE door system (`_buildRegion`) reads `PROPS[key].doorway.px` and builds the **visible door +
  walkable threshold + trigger as the SAME tile**, tile-aligned, automatically — wherever the building is
  placed, however many times. No per-placement or per-building door code.
- **Result:** fixing the door code fixes EVERY building; adding a building only needs its `doorway` in the
  asset def. The `placement.door` field carries only the STATE/target (open/closed/locked, which interior);
  the doorway POSITION is the asset's. Gate #21 **fails if any building asset omits `doorway`.**
- This killed the whole "store can't enter / shop off to the left / push-to-find-the-spot / tavern-exit-
  offset" class at once — they were all the same bug: the doorway was guessed per-building instead of
  declared by the asset. (`store-asset-doorway.png` — the store now enters dead-on its bottom-right door.)

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

## 2.5 INTERIOR ISOLATION + TRIGGER-ON-VISIBLE-DOOR (BUILT)
- **Interior isolation:** when `_inInterior`, `_maybeToggleRegion` loads **only the active interior** (its
  bounds) — never neighbouring interiors. The interiors share a far-band, so proximity-streaming would
  otherwise render several rooms in the black at once. Result: inside a building you see ONLY its room,
  pure void around. (Eyes-on: `interior-isolated.png`.)
- **Trigger on the VISIBLE door:** the carve centres the doorway on the collider, but some sprite art has
  its painted door off-centre (the paneled house's porch is on the right). A per-sprite **`DOOR_OFFSET`**
  shifts the doorway tile + threshold + trigger onto the painted door → you enter dead-centre through the
  opening you can SEE (`chapel-aligned-porch.png`). The threshold-clear also clears the **approach tile**
  in front of the door, so a neighbour's mass can't make a building un-reachable.

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

## 🔁 UNIFORM — EVERY building, EVERY region (the rebuild)
The carve + states are applied to **every building prop in every built region**, not just GH:
- `_resolveBuildingDoor(p)` gives any building (`prop_house*/forge/tavern/chapel/...`) a door — its explicit
  `door`, or a **default OPEN door to a shared generic interior** (`house_generic` / `forge_generic`,
  reused across buildings via the return-stack). **No building is un-enterable, anywhere.**
- `_clearDoorwayThresholds()` runs after each region's props build: it **disables any solid that landed on
  a doorway tile** (a procedurally-scattered Peaks rock, a neighbour's mass) so the threshold is always
  walkable — entry is robust regardless of placement. (`_solidAt` now also ignores disabled bodies.)
- Gate #21 asserts **ALL building props in EVERY region resolve to an interior** (fails on any un-enterable
  building), mirroring `_resolveBuildingDoor`.
- **Visible OPEN:** a closed/locked door that's tried/broken/keyed runs `_openDoorVisual` — the closed-door
  sprite hides, the **dark threshold appears (the door swings open)**, THEN (after ~440ms) the player walks
  through. Fixes "break worked but no open door appeared."
- **Break strength** (`door.breakStrength`) scales the force morality hit; **keys** (`door.key`) add a
  USE-KEY option when the player holds the item (wiring in place; a findable house-key is DEFERRED).

## 5. PRODUCTION METHOD — exhaustive table + the full-spec build (this pass)
- **Every building renders a REAL door sprite in its portal** (`_buildDoorVisual`, all states) — not just the
  forge. OPEN doors animate open, then you walk in.
- **Interiors are BUILT** — a gate asserts every interior's floor `set` is a real TERRAIN set (the
  `floor:'wood'`→black-room bug) + has a floor patch + a `back` exit.
- **Floor change = STAIRS** — interior floor-links carry `stairs:true`, render stone-tinted (distinct from the
  wooden exit door); up→f2 / down→f1 via the return-stack.
- **Step-away** closes the menu (`_dlgConfirm`) and the **`_lastTile` guard** stops it re-opening while you
  stand on the doorway; the avatar stays visible throughout.
- **Test method (now the standard):** a FULL pass/fail table — EVERY building × EVERY case, real input, fresh
  save — NOT done until 100% PASS. The exhaustive run surfaced a music-tween that halted the whole update loop
  (a few-building check missed it). Encoded in the gates above.

## ✅ STATUS
- **BUILT + verified (fresh cleared save, meta-rule 10):** the **6 GH buildings** each have an **exact
  tile-aligned inset doorway you walk INTO** — all enter **consistently**; the doorway tile is walkable
  on every one; **exit lands cleanly in the yard (NO stuck-on-the-line)** in + out. The **4 open** doors
  walk-in; **gh_home1 = CLOSED** (knock/try-handle → −3 morality) and **gh_home2 = LOCKED** (try → break
  → −10 morality + alarm) demonstrate the states; the deeds `entered_uninvited`/`forced_entry` fire.
  States read visually (closed-door sprite + lock glyph — `door-states-closed-locked.png`). Gates #20+#21
  pass; 0 console errors.
- **UNIFORM (this pass):** ALL **22 inline building props across GH (9) + Marsh/Mirefen (8) + Peaks (5)**
  are enterable on a fresh save — 0 blocked doorways; sample-entered each region by real movement; the
  visible door-open verified (closed sprite → hidden, threshold → shown, then enter); 165fps; 0 errors
  (`uniform-doors-mirefen-enterable.png`).
- **DEFERRED / FLAG:** Coast + Emberwood have **no inline building props yet** (their settlements are
  marker-entered scenes — enterability there comes with the inline-town conversion); a findable house-KEY
  item (the USE-KEY option is wired); KNOCK-answering + real guard/alarm spawn (flavor beats); the generic
  interiors are shared (repeat look) — bespoke interiors per building is a later polish. Tracked in `DEFERRED.md`.
