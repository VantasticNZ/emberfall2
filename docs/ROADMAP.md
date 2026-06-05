# EMBERFALL — BUILD ROADMAP TO A FINISHED GAME

> The ordered, robust path from where we are now to an amazing finished game. Each step is a
> scoped, verifiable slice. Built on the principle: prove ONE complete vertical slice, then scale.
> Companion to MASTER-DESIGN.md (the what) - this is the (in what order + how safely).

---

## THE ROBUSTNESS DISCIPLINE (applies to EVERY step)
Every slice from here follows these rules, so nothing breaks and quality stays high:
1. ADDITIVE ONLY: new work builds on top; never removes/rewrites a working system unless that IS
   the explicit task. Every hand-off carries the preservation rule (preserve all existing
   systems/content; STOP + flag if a change would break something).
2. ONE SCOPED SLICE per session: small enough to verify fully, big enough to be real progress.
3. VERIFY IN THE LIVE GAME: not a proof scene - New Game, play the actual path, with image
   evidence. "Auto-checks prove it runs; only Van proves it's good."
4. VAN JUDGES FEEL: after each slice, Van plays + judges fun/tone/look. Reports verify function;
   only play verifies fun.
5. PER-FILE COMMITS + PUSH: commit each unit; PUSH to a remote backup so nothing is ever lost.
6. HONEST REPORTING: no "fake done" - HTTP/again evidence, real screenshots, honest gaps flagged.
7. DATA-DRIVEN: new content (NPCs, quests, items, secrets, regions) as DATA entries on proven
   systems - so scaling is authoring, not re-coding.

## ZERO-LOSS BACKUP (do this once, now)
- Push the repo to a private remote (GitHub/GitLab). Every session pushes after committing.
- This is the single best "never lose anything" insurance. Without it, all work is local-only.

---

## WHERE WE ARE (done + verified)
- Engine, movement, combat, save, karma, character creation, age arc, OoT-style menu, settings.
- Art: cohesive 32px CC0 world + LPC characters (faces fixed - heads composited), dialogue
  portraits, quest system (HUD + pause + items), distinct NPCs.
- Childhood act: bigger Greenhollow + outskirts, gated cave, named cast + portraits + dialogue,
  3 quests incl. the seeded chicken choice, paced catastrophe -> adult arc.
- Audio: (in progress this session) music + SFX wired to settings.
- Design: full master bible (story/progression/karma web/mysteries/map/world-rules) + this roadmap.

---

## PHASE 1 — COMPLETE THE VERTICAL SLICE (the proof the whole game works)
Goal: one COMPLETE playable arc - childhood -> catastrophe -> first full region -> a milestone -
so the entire loop is proven before scaling. This is the most important phase.

STEP 1.1 — AUDIO (in progress): music per context + SFX, wired to settings. [robust: additive]
STEP 1.2 — POLISH THE CHILDHOOD ACT to "great":
  - A proper CHOICE-MENU UI for weighty dilemmas (the Coin, the Secret) - not just verb-based.
  - Deepen dialogue (NPC personality, a bit of branching, reactions to the chicken choice).
  - Make the CATASTROPHE land: build it as the emotional hinge (pacing, the sad cue, Bram's
    loss, visual drama, a beat of aftermath). This is the Act1->2 gut-punch.
  - Light day/night OR a festival beat (optional) to deepen attachment before the fall.
  [robust: each is an additive sub-slice; verify the arc still completes]
STEP 1.3 — THE FIRST ADULT REGION + DUNGEON (the big one - proves Act 2):
  Open the (now-adult) cave/first region. Build the full region loop ONCE, completely:
  - A region area to explore (biome, layout, varied density, landmarks).
  - A new TOOL/ABILITY (e.g. the LANTERN) that gates + adds puzzle/combat options.
  - A DUNGEON: one core mechanic, the lock-and-key rhythm, puzzles + combat + traversal, a
    completability guarantee (the check we have).
  - A BOSS (the tool-mastery test) + a heart container.
  - An EMBER SHARD + a TRUTH fragment (story payoff).
  - KARMA CHOICES in the region + NPC reactions by tier (wire the social web here for real).
  - The region's local story that ties back to the Ember.
  [robust: build sub-slices - area, then tool+gating, then dungeon, then boss, then story/karma -
   each verified before the next; never one mega-build]
STEP 1.4 — WIRE THE SYSTEMIC RULES into the slice (prove them once):
  - Respawn rules (breakables/monsters on re-entry; chests/puzzles persist).
  - Safe-zone rule (monsters out of towns; the catastrophe as the exception).
  - The gating/ability registry (tools actually unlock seeded gates - incl. the childhood-seeded
    cracked walls).
  - Fast-travel point + map screen for the slice.
STEP 1.5 — PLAYTEST THE SLICE: Van plays start->milestone. Refine for FUN. This is the gate to
  Phase 2 - do not scale until the slice is genuinely good.

## PHASE 2 — SCALE TO THE FULL GAME (repeat the proven pattern)
Goal: build the remaining 4 regions + the endgame, reusing the proven region loop as a template.
STEP 2.1-2.4 — REGIONS 2-5: each = area + tool + dungeon + boss + shard + truth + local story +
  karma choices, authored as DATA/content on the proven systems. (Ashen Marsh, Sundered Peaks,
  Tidewreck Coast, Emberwood, Hollow Spire per MASTER-DESIGN - one already done in Phase 1.)
  [robust: each region is the same verified sub-slice pattern; interlink choices/characters across
   regions per the web]
STEP 2.5 — THE INTERLINKING WEB: wire choice->consequence across regions + the childhood seeds
  (one choice -> many payoffs). Recurring characters. The karma social web fully active.
STEP 2.6 — THE THREE ENDINGS: build Warden/Tyrant/Liberator + their gating (karma + truths +
  key choices). The convergence event. Make each ending land.

## PHASE 3 — DEPTH, POLISH & JUICE (make it AMAZING, not just complete)
- COMBAT depth: enemy variety (each a different question), abilities/skills, boss design.
- GAME-FEEL/JUICE pass: hit-pause, screen-shake, particles, satisfying feedback everywhere.
- SECRETS populated densely (the pervasive system: rituals, hidden areas, fart bush, finds).
- MYSTERIES paid off (Bram's fate, the rival seeker, the childhood Secret).
- AUDIO depth: per-region themes, boss music, ambient SFX, the emotional cues.
- ECONOMY: shops that work, upgrades, money sinks/sources balanced.
- LORE + environmental storytelling throughout.
- DAY/NIGHT + NPC schedules (if not earlier) for a living world.
- ACCESSIBILITY: remappable controls, text size, colourblind cues, difficulty.

## PHASE 4 — SHIP IT (finished + releasable)
- Full playtest passes (others playing - the real fun-test). Balance + bug fixing.
- Title/intro/credits (LPC + all CC-BY credits shipped - required).
- Save robustness at full scale; multiple slots tested.
- Performance pass (smooth in-browser).
- Build/package for release (web/itch.io etc.). License/credits compliance check (CC0 vs CC-BY
  vs LPC share-alike all documented + shipped).
- A name/store page/marketing if selling.

---

## THE GUIDING PRINCIPLES (so it becomes AMAZING)
1. PROVE ONE SLICE, THEN SCALE. A finished small Emberfall beats an unfinished huge one. Phase 1
   is the whole game in miniature - get it great, the rest is repetition.
2. EVERY PIECE MAKES YOU FEEL SOMETHING (the tone golden rule). Cut/punch-up flavourless content.
3. SYSTEMS ONCE, CONTENT MANY. Build each system robustly once; pour content as data.
4. PLAY DECIDES FUN. Build -> play -> feel -> refine. Van's play is the real verification.
5. ROBUST + ADDITIVE ALWAYS. Preserve everything; push to backup; never lose progress.
6. SCOPE HONESTLY. If a slice is too big, split it. Solid-partial beats half-broken.

## IMMEDIATE NEXT STEPS (the order)
1. [running] Audio (1.1).
2. Set up the git remote backup (zero-loss).
3. Polish the childhood act (1.2) - choice UI + catastrophe punch.
4. Build the first region/dungeon (1.3) - the big Act-2 proof, in sub-slices.
5. Wire systemic rules (1.4) + playtest (1.5).
-> Then Phase 2 scaling.
