# EMBERFALL — FAST FULL-GAME ROLLOUT PLAN (+ what else to plan for)

> A think on: (a) what we haven't planned yet but will need, and (b) the fastest robust path to a
> COMPLETE game. Done while Claude Code builds (the working-method "think ahead" window).

================================================================
## PART A — WHAT ELSE TO PLAN FOR (gaps not yet in the docs)
================================================================
Things that WILL be needed and are easy to forget until they bite:

### A1. TITLE / INTRO / SAVE-SELECT / CREDITS (the frame)
- A proper title screen (have a basic one), a New Game vs Continue flow, save-slot select, an
  intro that sets the world, and CREDITS (REQUIRED - CC-BY/LPC/Ansimuz/Kenney attributions must
  ship in-game). Plan the credits now so attribution is never a scramble at the end.

### A2. SAVE SYSTEM AT SCALE (currently fragile)
- Autosave on key beats (region enter/exit, boss, shard, major choice); restore the saved
  LOCATION on Continue (currently dumps you in Greenhollow); surface Save clearly. Multi-slot
  tested across the full game. This needs a dedicated pass before the game gets big.

### A3. GAME-OVER / DEATH / FAIL STATES
- What happens at 0 HP? (respawn at last safe point / lose coins / reload save). Define it once.
- Softlock safety everywhere (the dungeon completability check pattern, extended world-wide).

### A4. ECONOMY BALANCE
- What coins are FOR (consumables, gear upgrades, maybe fast-travel) and the sources/sinks
  balance. Shops that actually buy/sell by item kind. Needs a tuning pass once content exists.

### A5. DIFFICULTY & ACCESSIBILITY
- Difficulty options (combat damage scaling); remappable controls; text size; colourblind-safe
  cues; toggle screen-shake. Cheap to add early, costly to retrofit. Plan into the settings menu.

### A6. PERFORMANCE & BROWSER
- As scenes/assets grow: asset loading/unloading per region (don't load everything at once),
  texture memory, steady framerate. A performance pass before release. (Van's RTX 4060/8GB is
  fine, but players vary.)

### A7. TUTORIALISATION (teach without hand-holding)
- The childhood act IS the tutorial (movement, talk, choices) - good. Each new tool teaches
  itself in its dungeon (lantern did this well). Make sure controls/mechanics are introduced
  diegetically. Plan a controls hint/cue for first-time actions.

### A8. CONTENT PIPELINE / CONSISTENCY
- As 5 regions get authored: keep NPC dialogue voice consistent (tone bible), keep difficulty
  curving up, keep the karma web wired. A "region authoring template" (below) keeps quality even.

### A9. PLAYTESTING BY OTHERS (the real fun-test)
- The single highest-leverage quality step. Plan for at least one external playtest of the v1
  slice BEFORE building regions 2-5 - real players reveal what no planning can.

### A10. BESPOKE ART/AUDIO POLISH (tracked debt)
- Current debt (fine for now, flagged): marsh tiles are tinted reuse; portraits reuse on-style
  busts; per-region music reuses themes; procedural dungeon art. A dedicated art/audio polish
  pass per region (or one big pass) before release. NONE block building the game loop now.

================================================================
## PART B — THE FAST ROBUST ROLLOUT PATH
================================================================
The principle: a REGION TEMPLATE makes regions 2-5 fast because they repeat a PROVEN pattern as
content, not new systems. We've now built that template by building Region 1.

### B1. THE REGION TEMPLATE (proven by the Ashen Marsh - reuse for each region)
Each region = the SAME 3 sub-slices we just did:
  1. AREA + SETTLEMENT + HOOKS (biome, town, NPCs, gated dungeon + a mystery hook, secrets).
  2. DUNGEON + TOOL (the region's ability, a core-mechanic dungeon, the gating payoff).
  3. BOSS + SHARD + TRUTH + KARMA CHOICE (complete the region, advance the lie, a moral choice).
Each region: ~3 slices. 4 remaining regions = ~12 slices. Plus the Spire/endgame (~2-3 slices).

### B2. THE FAST SEQUENCE (after Region 1 completes + playtests well)
1. FINISH + PLAYTEST REGION 1 (the slice) - the quality bar + the proof. [now]
2. SAVE-SYSTEM PASS (A2) - before the game gets big, make save robust + autosave + location.
3. REGIONS 2-5 via the template (~12 slices) - author content on proven systems. Each built to
   the DEPTH-AND-EXCITEMENT checklist so none is "flat".
4. THE INTERLINKING WEB + 3 ENDINGS - wire choices->consequences across regions; build the
   convergence + Warden/Tyrant/Liberator endings + gating.
5. THE FRAME (A1) - title/intro/save-select/credits.
6. SYSTEMS-AT-SCALE PASSES - economy balance (A4), difficulty/accessibility (A5), game-over (A3),
   performance (A6).
7. ART/AUDIO POLISH PASS (A10) - bespoke tiles/portraits/music per region.
8. EXTERNAL PLAYTEST (A9) + balance + bugfix.
9. SHIP (package for web/itch.io, credits compliance).

### B3. HOW TO GO FAST WITHOUT BREAKING (the discipline that enables speed)
- TEMPLATE-DRIVEN: regions reuse the proven slice pattern - the bottleneck is authoring (art/
  dialogue/layout), not engineering. 
- BATCH BY SYSTEM (proven): system-shaped sessions, not symptom-fixing.
- PRESERVE + PUSH every session (proven): never regress, never lose work.
- DOCS IN REPO (now done): Claude Code builds to the design - less rework.
- PLAYTEST GATES: don't scale until the slice is good; don't ship until external playtest passes.
- PARALLEL-ish: while a build runs, plan/learn/author the next (this window). 
- KNOW THE SCOPE CALL: v1 = Greenhollow + 1 region + a reachable ending (a COMPLETE short game),
  shippable on its own; regions 2-5 = expansions. A finished v1 is the goal; the epic grows from it.

### B4. REALISTIC SEQUENCING (not time estimates - order + gates)
- MILESTONE 1 (closest): Region 1 complete + playable vertical slice. -> playtest.
- MILESTONE 2: v1 = that slice polished into a complete short game with ONE ending reachable. ->
  external playtest -> could SHIP as v1.
- MILESTONE 3: full 5 regions + 3 endings (the epic). -> the full game.
- MILESTONE 4: polish/balance/perf/credits -> release.
Each milestone is independently valuable + shippable-ish. We never have "nothing finished."

## THE ONE LINE
We've now built the REGION TEMPLATE (Region 1). The fast path is: finish + playtest it, harden
save, then pour 4 regions + endings as CONTENT on proven systems, polish, external-test, ship -
with v1 (one region + an ending) as a complete game we could release on the way to the full epic.
