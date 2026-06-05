# EMBERFALL — COMPLETENESS GAP-CHECK

> Not more open-ended planning. A structured audit of every major aspect: SETTLED (thought
> through / built) vs GAP (genuinely under-considered, could hurt the feel if ignored). Goal:
> surface real foundational gaps NOW, so building doesn't hit a "we never considered this" wall.
> Feel/content items are flagged as "discover by playing" - not gaps, just not paper-solvable.

LEGEND: [SETTLED] thought through or built · [GAP] needs a decision before/while building ·
        [PLAY] can only be judged by building + playing, not planning

---

## FOUNDATIONAL / ARCHITECTURAL (must be right early - expensive to retrofit)
- [SETTLED] Save/state architecture (central, swappable, isolated per save).
- [SETTLED] Two-axis karma + flags + query API.
- [SETTLED] Character creation + Form State (age/gender/appearance plug-ins).
- [SETTLED] Age-stage system (child->catastrophe->adult).
- [SETTLED] Text/UI rendering pipeline (bitmap font, integer scale - the hard-won one).
- [SETTLED] Swappable fixed-size sprite system (art upgradeable 1-by-1).
- [SETTLED] Tabbed OoT-style menu (equipment/key items/map/status/settings).
- [GAP] ART STYLE + SPRITE SIZE - the big pending foundational decision. Drives every asset +
  the world scale. DECIDE NOW (cozy storybook / 16-bit SNES / Zelda-like; 16 or 32px).
- [GAP] AUDIO ARCHITECTURE - music/SFX system barely exists (just a mute toggle). Audio is ~50%
  of feel. Needs: a music manager (per-area/mood tracks, crossfade), an SFX system (hits,
  pickups, doors, UI, footsteps). FOUNDATIONAL for feel - plan the system before content piles up.
- [GAP] DIALOGUE SYSTEM DEPTH - currently basic lines + pronoun tokens. For the "rich connective
  story" goal, consider: branching dialogue, conditions (karma/flags gate lines), NPC memory of
  past choices, portraits/emotes. Decide the dialogue DATA STRUCTURE now so rich writing fits in.
- [GAP] QUEST SYSTEM - is there a real quest/objective tracker beyond the single main-quest hook?
  For many child quests + side quests, need a data-driven quest system (states, triggers,
  rewards, journal). Plan the structure before authoring lots of quests.

## WORLD & PROGRESSION (mostly designed in WORLD-DESIGN.md)
- [SETTLED] Hub-and-spoke + ability-gated open world (Zelda model) - designed.
- [SETTLED] Dungeon completability checks - built + proven.
- [GAP] WORLD MAP / FAST TRAVEL - how does the player navigate a big world? Map screen (the menu
  tab is a placeholder), fast-travel points? Decide before the world grows.
- [GAP] TOOL/ABILITY PROGRESSION LIST - the concrete list of gating tools (bombs done; hookshot,
  ice-walking, fire, etc.) and which region grants each. Lock the progression spine so regions
  can be built to gate correctly.
- [PLAY] Whether exploration FEELS rewarding - judged by playing.
- [PLAY] Whether the difficulty/soft-gating feels fair - tuned by playing.

## STORY & CHOICE (richly designed already)
- [SETTLED] Full plot, child->adult arc, catastrophe, 3 endings (STORY.md).
- [SETTLED] Two-axis karma, 20+ decisions, impact web, the chicken dilemma (CHOICE-SYSTEM.md).
- [GAP] CHOICE -> CONSEQUENCE WIRING - the system exists; the actual hookup of specific choices
  to specific later payoffs needs authoring as content is built (per the web design).
- [PLAY] Whether the dilemmas land emotionally / whether choices FEEL weighty - play to judge.
- [PLAY] Whether dialogue is warm/enmeshing enough - play + read to judge.

## COMBAT & FEEL
- [SETTLED] Real-time sword combat, enemies, HP/knockback/death (built).
- [GAP] COMBAT DEPTH PLAN - is sword-only enough, or are there abilities/magic/items in combat?
  Enemy variety roster (each posing a different challenge)? Decide the combat vocabulary.
- [GAP] GAME-FEEL / JUICE PASS - hit-pause, screen-shake, particles, SFX on hits. Currently
  minimal. A dedicated "juice" pass massively lifts feel. Plan it as a slice.
- [PLAY] Whether combat actually FEELS satisfying - only playing tells.

## SYSTEMS & ECONOMY
- [SETTLED] Hearts, coins, bombs, inventory, items catalogue (data-driven).
- [GAP] ECONOMY DESIGN - what do coins buy? Shops, upgrades, healing? Money sources/sinks
  balanced? Decide the economy loop.
- [GAP] EQUIPMENT/UPGRADE PROGRESSION - paper-doll equipment was planned; what gear exists, how
  is it earned, does it change stats AND appearance? Plan the progression.
- [GAP] HEALING / DEATH / CHECKPOINTS - how does the player heal? What happens on death (respawn
  where? lose what?)? Checkpoint/save-point design? Core loop feel - decide it.

## PRESENTATION & POLISH
- [GAP] AUDIO (repeated - it's the biggest feel gap).
- [PLAY] Visual cohesion once real art is in.
- [GAP] ACCESSIBILITY - remappable controls, text size, colourblind cues, difficulty options.
  Plan early; cheap to build in, expensive to retrofit.
- [GAP] TITLE/INTRO/CREDITS polish, settings depth.

## SCOPE (the meta-gap)
- [GAP] TARGET SCOPE - 30-50hr open-world is huge for solo. STRONGLY consider a tight excellent
  ~5-10hr vertical slice (one biome + the childhood arc + one dungeon + the 3 endings) FIRST,
  fully polished, before sprawling. Decide the realistic v1 scope.

---

## THE HONEST TAKEAWAY
Foundational architecture is ~90% settled (great). The REAL remaining gaps that affect FEEL and
are worth deciding BEFORE/AS we build (not after): ART STYLE+SIZE, AUDIO system, DIALOGUE
structure, QUEST system, TOOL-progression spine, ECONOMY/healing/death loop, JUICE pass,
ACCESSIBILITY, and TARGET SCOPE. These are concrete decisions, not endless philosophizing -
make them as we reach each, and the feel won't get blindsided. Everything tagged [PLAY] cannot
be solved on paper - it's found by building and playing. Plan the [GAP]s; play the [PLAY]s.
