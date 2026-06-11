# THE SLICE — the governing plan (read THIS first each session)

> This one-pager supersedes day-to-day reading of the doc library. The library (`WORLD-*`, `QUESTS-*`,
> `SYSTEMS-*`, `DOOR-SYSTEM`, `RPG-FEEL-STANDARD`, etc.) is REFERENCE — consult it when a task needs it,
> not as mandatory reading. **Build the Greenhollow vertical slice to Van's bar, one system at a time,
> nothing else, until Van signs off.**

## SCOPE — the Greenhollow vertical slice ONLY
A complete, shippable-feeling first slice with **ZERO known bugs**, signed off by **Van playing ~30 min
snag-free**:
- Every GH building **enterable**, with a **visible door** (pixel-proven) + **dead-on entry**.
- Every GH interior **built** (floor/walls/props, not black) + **distinct-enough** (not all the identical room).
- **NPCs speak**; dialog works; portraits/names correct.
- **Quests M1–M4 playable end-to-end** (start → steps → completion → reward/karma).
- **First-enemy combat feels right** (telegraph, hit, dodge, block — Van's feel-judgment).
- **Audio** (region music + ambient + sfx actually play) and **save/load** round-trip.

## METHOD — the production loop (per system)
1. Build ONE system to spec.
2. **Exhaustive pass/fail table** — every instance × every case, REAL input, fresh save. **Pixel-truth for
   anything visual** (snapshotPixel / depth-vs-occluder — NEVER `.visible`; see `DONE-DEFINITION` §B).
3. A **~5-minute VAN-TEST script** (below) so Van can confirm in minutes.
4. **Van sign-off** → the system is **FROZEN** (gate-guarded; changing it later needs an explicit unfreeze).

## ORDER (do not skip ahead)
1. **DOORS** ← close it out now (depth fixed + pixel-proven; run the VAN-TEST).
2. **Interiors** (built + distinct-enough; varied generics).
3. **NPCs / dialog.**
4. **Quests M1–M4** end-to-end.
5. **Combat-feel** (first enemy).
6. **Audio / polish.**
7. **The 30-minute playthrough** → Van sign-off → slice FROZEN.

## DISCIPLINE
- **Nothing outside the slice is built or fixed until sign-off.** See a tempting tangent? **log it in
  `DEFERRED.md` and move on.** No "while we're at it." No new regions, no other towns, no extra features.
- Every session **states which ORDER step it's on** and does only that.

## VAN-TEST — DOORS (~5 min, on a FRESH load, F8 / hard-refresh first)
Walk it with real keys; expect zero snags:
1. Walk **head-on** into each of the **9 Greenhollow buildings** — chapel, tavern, store, manor, forge, 2
   cottages (home1, home2), + the 2 generic cottages — each shows a **visible door** and enters **dead-on**
   (no angling, no push-to-find).
2. **home1 (closed):** walk in → **Knock** (no answer) then **Try the handle** → you enter; **morality dips**
   (uninvited).
3. **home2 (locked):** walk in → **Try** → "locked" → **Break it down** → you enter; **morality dips more**.
4. **Step away once:** at a closed door pick **(Step away.)** → the menu closes, you keep control, it does
   **not** re-open while you stand there.
5. **Tavern stairs:** inside, take the **Upstairs** → upper floor; **Downstairs** → back to floor 1; then
   **Leave** → outside.
6. **Exit every building** → you land **outside on a clean tile**, never in black.
7. Throughout, **your avatar stays visible** (incl. during the door menu).
**PASS = all of the above, no snag.** Any snag → tell CC the building + what happened; CC fixes + re-runs the
pixel-truth table before re-handing.
