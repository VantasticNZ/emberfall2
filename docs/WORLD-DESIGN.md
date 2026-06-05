# EMBERFALL — WORLD, PROGRESSION & GAME-FEEL DESIGN (deep-think reference)

> What makes a great top-down action-RPG world: map, positioning, progression, access,
> dungeons, towns, exploration. A reference to inform building - pull from it per slice.
> Companion to DESIGN.md / CHOICE-SYSTEM.md / BUILD-PLAN.md.

---

## 1. MAP & WORLD STRUCTURE

**Hub-and-spoke with a connective overworld (the proven RPG shape).**
- A central safe HUB (Greenhollow) the player returns to - grounds them, holds NPCs, shops,
  healing, story beats. Familiarity makes the wider world feel adventurous by contrast.
- Spokes = biomes/regions radiating out, each with its own identity, gated deeper by tools.
- An overworld that CONNECTS regions (not a menu) so travel feels continuous and the world
  feels real. Shortcuts/unlockable paths that loop back to the hub (Dark Souls-style "the
  world folds back on itself") make it feel designed, not sprawling.

**Landmarks for orientation.** Every region needs a readable silhouette/landmark (a volcano, a
giant tree, a broken tower) visible from afar - players navigate by landmarks, not minimaps.
"Go toward the mountain" beats "follow the quest arrow."

**Layered density (the "full but not crowded" rule).** Alternate DENSE pockets (a busy market,
a cluttered dungeon room) with CALM open space (a field, a quiet shrine, a lake). Uniform
density reads as either sparse or cluttered; VARIED density reads as real and lets the eye
rest. Each screen should have ONE clear focal point.

**Every area earns its space.** A region should offer at least one of: a resource, a secret, a
story beat, a unique enemy, a vista, a shortcut, or a choice. Empty traversal = cut it or fill
it. "Is this area worth walking through?" must be yes.

## 2. PROGRESSION & ACCESS (the Zelda/Metroidvania loop)

**Gate by ABILITY/ITEM, not invisible walls.** The player can TRY anywhere; they're stopped by
a missing tool (bombs for cracked walls, hookshot for chasms, fire for thorns, ice-walking for
the frozen lake) - and they SEE the obstacle and understand it. "I'll come back for that" is
the core engagement loop. Every block is legible and hinted.

**The lock-and-key rhythm.** Each region teaches/gives a new tool, which unlocks: (a) the rest
of that region, (b) previously-seen obstacles elsewhere, (c) optional secrets. New tool ->
mental list of "now I can reach X, Y, Z." This is the dopamine engine of exploration RPGs.

**Difficulty as soft-gating.** Wandering into a late zone early should be DANGEROUS but
POSSIBLE - tough enemies, not brick walls. Rewards bold/skilled players, punishes the reckless.
Tune enemy placement/scaling so this is exciting, not a free pass or a wall.

**Power curve = a staircase, not a ramp.** Periodic clear jumps in power (new weapon, heart
container, key ability) that recontextualize old areas (the enemies that were scary are now
easy - visible growth). Child->adult is the first big step; each region's tool is another.

**Always a breadcrumb.** The player should never be fully lost. Hints via: NPC dialogue, the
landmark you can see, a subtle path, an item description, environmental storytelling. Direction
without a hand-holding arrow - guide the eye, trust the player.

**Optional > mandatory ratio.** A great RPG world is mostly optional content around a clear
critical path. Let players who want the story barrel through, and explorers find depth. Don't
gate the main story behind every side dungeon.

## 3. DUNGEONS (the set-pieces)

**Hand-authored, with a completability guarantee.** Each dungeon is deliberately designed (not
random) and code-verified completable (key reachable before its door, boss gated, no soft-lock,
exit reachable - the check we already built). Quality over quantity.

**The dungeon arc:** entrance/theme-establish -> teach the dungeon's gimmick (often its new
tool) -> escalate using that gimmick -> mini-challenges/puzzles -> the boss that's the ultimate
test of the gimmick -> reward (the tool mastered + a heart container/key item) -> a shortcut
back. Self-contained satisfying loop.

**One core mechanic per dungeon.** Each dungeon explores ONE idea deeply (this dungeon is about
bombs; this one about ice; this one about light/dark). Introduce -> develop -> twist -> master.
Don't throw every mechanic at once.

**Puzzles + combat + traversal balance.** Vary the three so no dungeon is a slog of one. A good
room rhythm: fight room -> puzzle room -> traversal/platforming -> breather -> escalation.

**Readable space + the "aha" map.** Dungeons should be initially confusing then "click" once you
find the shortcut/key that reveals the layout's logic. The map becoming clear IS a reward.

## 4. TOWNS & SAFE AREAS

**A town is characters + services + story, not just buildings.** What makes a town feel ALIVE:
- NPCs with NAMES, VOICE, ROUTINES, and small arcs (the gruff smith, the warm baker, the kid
  who looks up to you). A few deep NPCs >> many shallow ones.
- Services with a reason to return: shop, healing/inn, save point, upgrade/crafting, quest-giver.
- Ambient life: animals, market activity, laundry, smoke, kids playing, day/night changes.
- Story presence: town reacts to your deeds (the karma web), changes as the plot moves (the
  catastrophe scars Greenhollow), gossip about what you've done.

**Towns as emotional anchors.** You make the player LOVE a place (warm intro, home, bonds) so
that threatening/losing it (the catastrophe) lands. Comfort -> stakes.

**Balanced size.** Big enough to explore + feel like a place; small enough that every building
matters and you can hold its map in your head. Greenhollow's enrichment (farm/market/tavern/
chapel/pond + varied density) is the model. Don't inflate beyond what's populated with meaning.

## 5. COMBAT & GAME FEEL

- **Game feel / "juice":** hit-pause, knockback, screen-shake, particles, sound, enemy flash on
  hit. The difference between combat that feels limp vs satisfying is mostly feedback, not depth.
- **Readable enemies:** clear silhouettes, telegraphed attacks, fair tells. The player should
  lose because they misplayed, not because it was unreadable.
- **Enemy variety with purpose:** each enemy poses a different question (the fast one, the
  ranged one, the shielded one, the one that forces movement). Combinations create emergent
  challenge.
- **Risk/reward:** aggression rewarded but punishable; resources (health/items) create tension.

## 6. PACING & THE OVERALL ARC

- **Tension and release:** alternate danger (dungeons, boss fights, dark zones) with safety
  (towns, vistas, gentle quests). Constant tension exhausts; constant safety bores.
- **Teach -> test -> twist:** introduce a mechanic safely, test it, then twist it in a new
  context later. The whole game is layered lessons.
- **A strong opening hour:** the childhood act - warm, low-stakes, character-building - so the
  catastrophe and the adult quest hit hard. First impressions decide if players stay.
- **Payoff for exploration:** secrets, lore, optional bosses, cosmetic/power rewards. Curiosity
  must pay, or players stop being curious.

---

## 7. EVERYTHING ELSE TO CONSIDER FOR AN AWESOME GAME (checklist)

**Onboarding & UX**
- A tutorial that teaches by DOING, not text walls (the childhood act IS the tutorial).
- Clear, legible UI (done: crisp bitmap text, tabbed menu). Controller + keyboard (done).
- Accessibility: remappable controls, colourblind-safe cues, text size, difficulty options.
- Good save/load + autosave at safe points (architecture done).

**Audio (massively underrated for feel)**
- Music per region/mood; combat vs exploration vs town themes; a memorable main theme.
- SFX for everything (hits, pickups, doors, footsteps, UI). Mute toggle done.
- Audio is ~50% of game feel and currently minimal - a real future priority.

**Narrative delivery**
- Rich connective dialogue (locked as the standard). Environmental storytelling (tell story
  through the world, not just text). Show don't tell. The karma web visible in NPC reactions.
- Lore that rewards the curious without blocking the main path.

**Replayability & depth**
- The two-axis karma + 3 endings (done in design) - make choices visibly matter.
- New-game-plus? Multiple builds/playstyles? Optional challenge content?

**Economy & systems**
- Money sinks + sources balanced (shops, rewards). Crafting/upgrades give long-term goals.
- Inventory that's useful not bloated. Equipment that visibly changes the character (paper-doll).

**Content scope realism (the honest one)**
- A 30-50hr open-world RPG is a HUGE scope for a solo dev. Consider a TIGHT, excellent ~5-10hr
  experience over a sprawling unfinished one. Vertical slice first: one biome, fully great,
  end to end - prove the loop before scaling. (This is the anti-NEXUS discipline applied to scope.)

**Technical & polish**
- Performance (web/Phaser - keep it smooth). Save robustness (done). Bug-free completability
  (dungeon check done). Crisp art at integer scale (done). Swappable sprites (building now).

**Playtesting**
- The thing that actually makes games good: people PLAYING it and you watching. Even one other
  person playing reveals more than any amount of design theory.

**The meta-discipline (most important)**
- Build the WORLD one judged slice at a time (the method that's worked). A great small thing
  beats a mediocre big thing. Finish a vertical slice before sprawling. Art swappable so it
  improves over time without blocking content. The game is the goal; tools serve it.

---

## 8. SECRETS, EASTER EGGS & ENVIRONMENTAL INVITATION (per Van)

A core part of Emberfall's soul: the world constantly INVITES curiosity and rewards it. Mix of
quest-linked secrets and pure-fun random finds.

**Environmental invitation (the design philosophy):** the map should LOOK like it wants you to
try things. A lone weird bush, a suspicious crack, a tempting ledge to jump, an animal that
runs when approached, a circle of mushrooms, an odd statue, a fountain. The player thinks "I
bet something happens if I..." - and sometimes it does. Telegraph through visual oddity:
anything that looks deliberately out-of-place or interactive is an invitation.

**Secret TYPES:**
- **Ritual/sequence secrets:** do an action in a pattern (run around the fountain 3x
  counterclockwise at night, light braziers in an order, play notes) -> something opens/appears.
  Hinted by NPCs ("me grandad swore the old fountain spins a tale to them who circle it widdershins
  by moonlight...") or environmental clues.
- **Hidden areas:** bombable walls, a fake bush hiding a hole, a path behind a waterfall, a
  loose floorboard - reachable now or later (Metroidvania-gated).
- **Interaction surprises:** chase the chicken and it drops something; jump off the right ledge;
  poke the weird bush (fart bush!); talk to an NPC 10 times; read a gravestone at night.
- **Reward variety:** some give items/coins/heart-pieces, some unlock shortcuts, some are pure
  comedy/flavour (a fart, a sassy message, a tiny scene), some advance a quest, some are lore.
  Not every secret needs a mechanical reward - delight/humour is a valid reward (per TONE bible).

**Quest-linked vs random:** some secrets are steps in quests (an NPC's hint leads to a quest
item); others are standalone "cool finds" that just reward exploration. Mix both.

**Hint system:** NPCs, signs, item descriptions, and environmental clues drop hints - playful,
in-character, sometimes cryptic, sometimes red herrings (a few fake-outs keep players guessing).
Per the open-world model: hints point at things you may not be able to reach yet ("come back").

**System design:** a data-driven SECRETS system - each secret = {trigger (sequence/interaction/
condition), location, requirement (item/ability/time-of-day), reward, hint source}. So adding a
secret is a data entry, and they can plug into quests, the time-of-day system, and abilities.
This needs: an interaction system, optional time-of-day (day/night), and trigger detection
(sequence/pattern recognition for ritual secrets).

**The feel goal:** the player learns the world is full of surprises, so they POKE at everything -
and Emberfall rewards that poking with delight, loot, lore, and laughs. Curiosity = the engine.

---

## 8b. SECRETS & EXPLORATION AS A PERVASIVE SYSTEM (expanded, per Van)

Secrets aren't a handful of eggs - they're a PERVASIVE design layer throughout the whole game.
It's one unified idea: the world is built to be READ, POKED, and EXPLORED, with constant payoff.
A SPECTRUM, from "locked path" to "hidden surprise":

**THE SPECTRUM (all of these, densely, everywhere):**

1. **Gated exploration (not secret, just locked - the Metroidvania spine):** cracked/different
   walls that need bombs; gaps/water/chasms that need a crossing item (hookshot, raft, ice);
   thorns needing fire; ledges needing a jump ability; heavy blocks needing strength. These are
   VISIBLE and LEGIBLE - the player sees them, understands "I need something," and remembers.
   They should be EVERYWHERE, constantly saying "come back when you can." This is the core
   exploration engine - not a bonus.

2. **Map-reading clues (environmental literacy):** the terrain itself hints. A suspicious
   dead-end, an out-of-place tile, a line of flowers leading somewhere, a worn path, a tower
   visible across the map, a different-coloured patch of ground, a waterfall that might have a
   gap behind it. Players who READ the world get rewarded. Teach this literacy early so players
   trust it.

3. **Interaction invitations (the map "invites" you):** anything that looks odd/interactive -
   a lone weird bush, a circle of mushrooms, an animal that flees, a tempting jump, an odd
   statue, a suspicious crack. The player thinks "I bet if I..." Telegraph via visual oddity.

4. **True secrets (rare, surprising, delightful):** ritual/sequence triggers (fountain 3x
   counterclockwise at night), hidden rooms behind bombable walls, sequences, time-gated events.
   Rarer and more rewarding - the "I can't believe that worked" moments.

**DENSITY & DISTRIBUTION:** every region should be DENSE with the spectrum - multiple gated
spots, several readable clues, a handful of interaction invitations, and 1-3 true secrets per
area. The player should ALWAYS have several "I noticed that, I'll come back" threads open.
Backtracking with new abilities should constantly reveal previously-seen-but-unreachable things.

**REWARD VARIETY (per TONE bible):** loot, heart-pieces, shortcuts, lore, quest steps, AND pure
comedy/delight (fart bush, sassy messages). Not all mechanical - delight is a valid reward.

**THE UNIFIED SYSTEM (data-driven):** one framework handles the whole spectrum:
- INTERACTABLES: things you can examine/poke/use (bushes, statues, cracks, NPCs, signs).
- GATES: obstacles tagged with their requirement (bomb-wall, hookshot-gap, fire-thorn, etc.) -
  the game knows what unlocks each; shows a hint when you lack it.
- TRIGGERS: sequence/ritual/condition detection (circle-the-fountain, light-in-order, time-of-day).
- HINT SOURCES: NPCs, signs, item text, environmental clues (some cryptic, a few red herrings).
- ABILITY/ITEM REGISTRY: the canonical list of gating tools (bombs, hookshot, fire, ice-walk,
  strength, jump...) and which region grants each - so gates can be placed to match progression.
Each secret/gate/interactable = a data entry referencing this framework. Build the framework
once; then populating the world with hundreds of these is content authoring, not coding.

**FEEL GOAL:** the player learns the world ALWAYS rewards attention - so they read every screen,
poke everything, and remember what they couldn't reach. Curiosity is the engine of the whole game.
