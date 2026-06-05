EMBERFALL 2 - PROOF SLICE (fresh start). This is a CLEAN NEW PROJECT at C:\Games\Emberfall2, built
right from line one to the Quality Bible. It is NOT the old C:\Games\Emberfall (that stays intact as
reference). Goal: PROVE the Mana Seed look + the write-once architecture + the DoD gates on a tiny
Greenhollow slice, using the FREE Mana Seed starter pack. Small, clean, correct - not big.

FIRST: read docs\QUALITY-BIBLE.md (the DoD - Part 0 governing principles, Part 1 core systems,
Part 2 gates, Part 3 verification), docs\MASTER-DESIGN.md, docs\WORLD-BIBLE.md, docs\DREAM-AND-
CRAFT.md. Everything below must conform to the Quality Bible.

CONTEXT: the free Mana Seed starter pack art is in (Van will place it) C:\Games\Emberfall2\art-src\
mana-seed-starter\ (Van: extract the downloaded starter pack there). It has a character base + basic
tiles. NPC double-ups / limited variety are EXPECTED + FINE for this proof - we are proving the look
+ pipeline, not final content.

TECH: fresh Vite + Phaser 3 project (same proven stack), JavaScript. Pin the dev port to 5173
(strictPort). git init, first commit, and (Van will add the remote later - just commit locally for
now, OR if a remote is set, push).

BUILD THESE - to the Quality Bible, ONE at a time, verify each LIVE with a screenshot before moving on:

TASK 1 - ASSET MANIFEST (Bible Part 0 #3 art-agnostic): create src/data/assets.js as the SINGLE
source mapping logical keys (e.g. tile_grass, tile_path, char_hero, npc_villager) to the Mana Seed
starter files + their grid size. ALL art loads through this manifest. Document the grid convention
at the top (whatever the Mana Seed pack uses - detect + state it). A future art swap = edit this
file only. Verify: the manifest loads all starter assets with no errors.

TASK 2 - CORE WRITE-ONCE SYSTEMS (Bible Part 1): build these as clean single-source-of-truth
modules, each used by ALL actors/objects (never per-instance):
  - movement (top-down)
  - collision (bodies vs solids; SOLIDITY IS A DATA FLAG; collider MUST match the visual footprint
    per Gate B)
  - depth-sort (floors below actors; tall props y-sort - Gate C)
  - interaction (face + press E -> action; forgiving radius; data-registered interactables - Gate B)
Verify each by its Bible gate method.

TASK 3 - GREENHOLLOW PROOF SLICE: a SMALL walkable slice of Greenhollow in Mana Seed art - some
grass/path/ground, a few buildings or props, 2-3 NPCs (double-ups OK), using the systems above.
Player walks, collides correctly (no walk-through, colliders match footprints), depth-sorts
correctly (never behind a floor tile, occluded by tall props), and can interact with an NPC/sign
(press E). Camera follows + clamps (never shows off-map). Mana Seed look visible + cohesive.

TASK 4 - DOD GATE CHECK + PROOF: run the RELEVANT gates by their OWN test methods:
  - Gate A (text/UI): any on-screen text fits its box, no overlap.
  - Gate B (collision/accessibility): walk into each solid from 4 sides (no walk-through); colliders
    match footprints; interactables reachable; no trap rooms.
  - Gate C (depth/render): player never behind a floor; tall props occlude; no sprite artifacts.
  - Gate I (art): one cohesive Mana Seed style, consistent grid.
  - Gate K (tech): 0 console errors; clean build; steady; no crashes.
CAPTURE SCREENSHOTS as proof for each (Van's eyes are ground truth per Part 3). 

CONSTRAINTS: SMALL + CORRECT, not big. Write-once systems (never per-instance behaviour). Data-driven
+ art-agnostic. Verify each task LIVE with a screenshot before the next. Per-file commit after each.
This is a PROOF the look + architecture + gates work - quality over size.

FINAL REPORT: confirm the Mana Seed look renders cohesively, the write-once systems work, each
relevant gate PASSED by its method with a screenshot, 0 console errors, clean build. Flag anything
that did not meet a gate honestly. Include the screenshots so Van can judge with his eyes.