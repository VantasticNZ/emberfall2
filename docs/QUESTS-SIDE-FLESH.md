# EMBERFALL — SIDE QUESTS, FULLY FLESHED (to QUALITY-BIBLE Gate D/H)

> Each: GOAL, beats (no item-in-front), choice/karma, reward, links. Most tie to story/morality/deed;
> some pure fun/loot. Funny names sprinkled. Built data-driven on the quest engine.

================================================================
# GREENHOLLOW (hub)
================================================================
## G1 "Fazy Lastard's Mug" (marker tutorial — the Gate-D exception) — REDESIGNED + RESEQUENCED 2026-06-07
FATLEY: **very fat, SITTING** in a **quiet out-of-the-way spot** (not the plaza), a **"?"** over his
head (not "!"). He acts like he **forgot he had a quest**, **stutters + improvises one on the spot**,
and the thing he "needs" (the mug) is **right in front of him** (too lazy to reach it). The ONE
item-in-front quest — the Gate-D exception — the characterisation IS the gag. KARMA: none. Sample
dialogue + the full character note: **PERSONALISATION-DESIGN.md §6.5**.

- **REWARD = an UNLOCK, not a grant:** completing it does **not** force `skill_see_markers`; it **opens
  the OPTION** to acquire the marker-observing trait (a Rogue/Social skill point — **buyable/learnable**,
  the player still **chooses**). Fazy Lastard is the template for the "lazy-guy teaches, you buy the skill" rule.
- **PLACEMENT:** **late CHILDHOOD** (one of the last kid-phase goals, ~M5, before M6) — **moved from**
  the current act-2 adult-return hub. Markers become a *late discovered reward*, after the player has
  learned to find their own way; early childhood runs **marker-free** (see GAPS-AND-DEPTH §4).
- **BUILD/DATA NOTES (do at build time — NOT this doc-only session):**
  - reframe `src/data/quests/greenhollow.side.js` SG1: completion records a NEW *offered* flag (e.g.
    `marker_sight_offered`) instead of `deed:'skill_see_markers'`; a separate **acquire** step (buy/
    learn at a skill point) grants `skill_see_markers`. **The `skill_see_markers` id stays.**
  - move SG1 to **act 1 / late-childhood** gating (a late-childhood flag, e.g. `child_late`) instead of
    the M7-`accept` unlock. Confirmed nothing earlier needs markers: M1–M6 are NPC-given diegetically;
    the Pem hunt uses `pem_clue_*` (a separate "Pem marker"), not `skill_see_markers`.
  - **`greenhollow.side.test.js` WILL need updating**: it currently asserts completion → `skill_see_markers`
    true; under the opt-in it should assert completion → *offered*, then *acquire* → `skill_see_markers`.
  - ⚑ ASSET/RENDER FLAGS: a sitting/heavyset Fazy Lastard pose + a "?" marker indicator (omit + flag until art
    lands; never a placeholder).
  - PROPOSED ids (list only, add at build): `marker_sight_offered`, `child_late`, a "?"-marker encounter
    tag. `skill_see_markers` already exists in `src/constants/flags.js`.
## G2 "PEM WOZ ERE" (clue-hunt, spans the game)
The gate graffiti starts it. Clues hidden in EVERY region (a scratched name, a rumour) -> assemble ->
find PEM (a wanderer) -> EPIC reward (unique weapon/trinket). REWARD: epic gear. LINKS: all regions.
## G3 "Hodge's Apprentice" (JOB)
Help the smith (mini smithing) -> gear discount + repair skill. Repeatable-ish. REWARD: discount,
skill. 
## G4 "Mara's Letters" (vignette/morality)
Find Mara's hidden love-letters. CHOICE: return discreetly (KIND) / read+keep silent (neutral, you
know a secret) / expose them (CRUEL — Mara cold forever, town gossip). DEED logged; Mara reacts for
the rest of the game.
## G5 "The Tankard Songs" (fun/social)
Learn rude tavern songs from patrons (incl. WAYNE KERR, AMANDA HUGGINKISS) -> unlock gestures/charisma.
REWARD: gestures, rep. Comedy.
## G6 "Pem's Deliveries" (JOB)
Parcel runs that teach roads + waystones. REWARD: gold, map knowledge. 
## G7 "The Orchard Thief" (morality fork)
Catch a kid stealing apples. CHOICE: punish (CRUEL) / cover for them (KIND) / recruit them (CHAOTIC).
The kid becomes a recurring ally or thief-enemy (deed-callback). DEED logged.
## CHILDHOOD CALLBACKS: the Chicken (M2), Coin (M3), Secret (M4) resurface as adult beats here.

================================================================
# ASHEN MARSH
================================================================
## A1 "Bog-Folk Troubles" (story)
Help Mirefen with the spreading black water. Deepens the sickness/lie. REWARD: bog-folk trust, lore.
## A2 "Hagga's Errands" (morality/Purity)
The exile asks favours others won't do. Helping her vs siding with oracle-loyalists forks PURITY +
sets her ally strength for M10/M17. DEED logged.
## A3 "The Sunken Dead" (fun/loot)
Lantern-gated shrine side-rooms; epic loot. REWARD: gear.
## A4 "Frog of the Fen" (TWIST — the undefeatable frog)
A giant frog chases you, UNKILLABLE. The trick: escape via dropping an APPLE (it eats), the BLOW-A-KISS
gesture (charms it), or LEADING it into the mire. Funny, memorable, puzzle-not-fight. REWARD: a quirky
trophy + a laugh + a hint that not everything is beaten by force (teaches lateral thinking).
## A5 "Drowned Letters" (deed-callback)
A corpse's letter names a GREENHOLLOW NPC (connects the world). Deliver it -> that NPC reacts. LINKS
to Greenhollow.

================================================================
# SUNDERED PEAKS
================================================================
## P1 "The Order's Records" (story)
Uncover how deep the oracle lie runs (supports M12 truth). REWARD: lore, a key for P-area.
## P2 "Bounty: The Crag Beast" (JOB/loot)
Tough optional hunt -> epic weapon. REWARD: epic gear.
## P3 "The Stubborn Miner" (morality fork)
Worker-vs-owner dispute (MIKE HUNT the owner). CHOICE: side worker (KIND) / owner (CORRUPT-lite, gold)
/ broker peace (PURE, WIS). Economic echo + faction rep. DEED logged.
## P4 "High-Pass Climb" (fun)
Grapple traversal challenge -> treasure. REWARD: gear/gold.
## P5 "A Stranger's Plea" (THE MORALITY-REACTIVE TRICK QUEST)
A stranger begs "help me save my brother." Your CURRENT MORALITY flips the outcome: if KIND, it's a
genuine rescue (reward, rep); if CRUEL/CORRUPT, the "brother" is a setup and you're used as a thug /
the stranger exploits you (a twist — you realize too late). The signature trick. DEED logged.

================================================================
# TIDEWRECK COAST
================================================================
## T1 "Smuggler's Bargain" (morality/Purity)
Run contraband for HUGH JASS the smuggler, or turn them in. PURITY fork + faction rep (smuggler vs
authority) echoing later. DEED logged.
## T2 "Tide-Cave Treasures" (fun/loot)
Tide-timed hookshot puzzles -> epic loot. REWARD: gear.
## T3 "The Lighthouse Keeper" (heartfelt/story)
A lonely keeper (HOLDEN McGROIN, but played straight + sad) — a quiet, human vignette about loss
mirroring Bram. CHOICE: stay and listen (KIND, emotional payoff) / brush off. DEED logged.
## T4 "Bounty: The Wreck Wraith" (JOB/loot). Epic gear reward.
## T5 "Saltbreak Betrayal" (deed-callback betrayal)
An ally you helped earlier (seeded by a Peaks/Coast deed) BETRAYS you for coin — small, sharp, lands
because it's rare. CHOICE: vengeance (CRUEL) / mercy (KIND/PURE). DEED logged.

================================================================
# EMBERWOOD
================================================================
## E1 "Fire and Frost" (story)
The elemental war = the god's fever (supports M16 truth). REWARD: lore, elemental key.
## E2 "The Caught Settlement" (heavy morality)
The settlement is half-burning, half-freezing. You can SAVE ONE SIDE FIRST (the other suffers) — you
can't fully save both. CHOICE weighs heavily (Morality + Purity), echoes to the epilogue. DEED logged.
## E3 "Ashen Relics" (fun/loot). Elemental puzzle treasure.
## E4 "The Weeping Tree" (heartfelt)
A quietly devastating discovery: a tree that weeps embers — a fragment of the god's pain. Deepens M16.
REWARD: emotional lore, a Purity nudge for compassion. 
## E5 "Bounty: Cinder Stag" (JOB/loot). Epic gear.

================================================================
# SPIRE (endgame side content)
================================================================
## S1 "Echoes of the Climb"
Deed-memory: spared/befriended NPCs aid the ascent; betrayed/killed ones hinder; the chicken cameo.
Not a separate quest so much as reactive ascent content (M18). 
## S2 "The Last Confession"
Optional truths before the end that unlock ENDING NUANCES (extra epilogue cards, clarity on the god).

================================================================
# JOBS / LIFE-SIM (repeatable, across hub+regions)
================================================================
Woodcutting, fishing, cooking (buff food), smithing-help (G3), deliveries (G6), bounties (P2/T4/E5).
Gold sinks: gear, consumables, durability/fuel, services, fast-travel(early), PROPERTY (buy a
Greenhollow house, late). Reputation/fame from gestures + deeds colours NPC reactions + prices.

## VOLUME: ~30 named + jobs/bounties + vignettes = the quality core. More addable as DATA if they
## serve the story. Every one quality-gated (Gate D); cut flat ones.
