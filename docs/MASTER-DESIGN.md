# EMBERFALL — MASTER DESIGN BIBLE (the whole-game deep-think)

> The complete design that ties everything together: story, plots, interlinking, progression,
> gating, the karma-gated social web, mysteries, puzzles, systems. The reference that prevents
> circling - decide it here, build to it. Companion to STORY.md, CHOICE-SYSTEM.md, WORLD-DESIGN.md,
> TONE-AND-FEEL.md, GAP-CHECK.md. Where this conflicts with an older doc, this is the integrating view.

---

## PART 1 — THE STORY, WHOLE AND INTERLINKED

### 1.1 The core (locked)
The land of Emberfall is kept alive by the sacred fire "the Hearthflame" - secretly a bound,
suffering fire-god "the Ember," broken into 5 Ember Shards. Oracles have lied for generations to
keep it bound. Oracle Sela sends the hero to gather the shards. The hero's journey is the slow
uncovering of this lie + the moral question of what to do with the truth.

### 1.2 The three-act spine
- ACT 1 — CHILDHOOD (Greenhollow, ~1hr gentle): warm, funny, low-stakes. Establish home, bonds
  (Bram the guardian, Mara, Bryn, child friends), the 3 seeded childhood choices (Chicken/Coin/
  Secret). Ends in CATASTROPHE: the village burns, Bram is lost, time-skip to adult.
- ACT 2 — THE GATHERING (the world opens): adult hero, Sela's quest to find 5 Ember Shards across
  5 regions. Each region = a culture, a dungeon, a shard, a tool/ability, and a piece of the truth.
  The lie unravels region by region. Mid-act turn: the hero learns the Hearthflame is a suffering
  god, not just a fire.
- ACT 3 — THE CHOICE (convergence): all shards gathered, the full truth known. The three endings
  branch here based on cumulative karma + key choices + what truths the hero uncovered:
  - WARDEN (re-bind, bittersweet, default): keep the lie to keep the land alive. The Ember suffers on.
  - TYRANT (seize the Ember's power, dark): corrupt path, gated by Cruel+Corrupt karma.
  - LIBERATOR (free the Ember, best/secret): gated by truth+Pure+mercy - the hardest, most hopeful.

### 1.3 The 5 regions (Act 2) — each a self-contained arc that feeds the whole
Each region should have: a distinct culture/biome, a local conflict (a standalone story), a
dungeon, a SHARD, a new TOOL/ABILITY (the gating key), a TRUTH fragment about the Ember, and
karma-relevant choices. Suggested set (flesh out per build):
1. The Ashen Marsh — bog/witch culture; tool: LANTERN (light dark areas); truth: the first lie.
2. The Sundered Peaks — mountain/miner culture; tool: BOMBS upgrade / STRENGTH (move boulders);
   truth: a shard was taken by force.
3. The Tidewreck Coast — sea/fisher culture; tool: HOOKSHOT / GRAPPLE (cross gaps); truth: an
   oracle who refused to lie.
4. The Emberwood — burning forest; tool: FIRE-WARD / FROST (pass thorns/fire); truth: the Ember's
   voice first heard.
5. The Hollow Spire — the oracle seat; tool: the final key; truth: the whole lie laid bare.
INTERLINK: each region's local conflict secretly ties to the Ember (e.g. the marsh witch was an
exiled oracle; the miners' curse is shard-corruption). Standalone stories that compound into one.

### 1.4 How plots interlink (the web, not the line)
- The 3 CHILDHOOD choices (Chicken/Coin/Secret) each echo in Act 2-3: who you meet again, who
  trusts you, what's available. (One early choice -> many late payoffs.)
- Each region's choice affects other regions (help the miners -> the coast hears of it -> a
  character there reacts) and the ending options.
- The TRUTH is gated: you CAN reach Act 3, but the LIBERATOR ending requires having uncovered
  enough truth fragments (so a rushing player gets Warden/Tyrant; a thorough one unlocks Liberator).
- Recurring characters across regions create continuity (a travelling merchant, a rival shard-
  seeker, a survivor of Greenhollow).

---

## PART 2 — PROGRESSION & LEVELING

### 2.1 Power growth = a staircase (per WORLD-DESIGN)
Two intertwined growth tracks:
- TOOLS/ABILITIES (the Metroidvania spine): lantern, strength, hookshot, fire-ward, etc. - each
  gates exploration AND adds combat/puzzle options. The PRIMARY progression (Zelda-style).
- STATS/HEALTH (RPG layer): heart containers (max HP) from bosses + heart pieces hidden in the
  world; optional upgrades (stronger sword, more bomb capacity, stamina). Keep light - this is
  Zelda-with-RPG-flavour, not a deep stat grind.

### 2.2 Leveling - keep it simple + diegetic
- NO heavy XP grind. Growth comes from FINDING (tools, heart pieces, upgrades) and DOING
  (quests, bosses) - so progression is tied to exploration + story, not farming.
- Optional light "skill" unlocks (a spin attack, a charged hit) earned from trainers/quests, not
  XP bars - keeps it classic-feeling.
- Currency (coins) for consumables + upgrades (shops) - a money sink that rewards exploration.

### 2.3 What gates what (the ability->access map - decide concretely)
A canonical ABILITY/ITEM REGISTRY (per WORLD-DESIGN 8b) - each gate references a requirement:
- LANTERN -> dark caves, the Ashen Marsh interior, reading faded text in the dark.
- STRENGTH (gloves/might) -> push boulders, move blocks, certain doors.
- BOMBS -> cracked walls everywhere (seeded from Act 1; capacity grows).
- HOOKSHOT/GRAPPLE -> cross chasms, pull to ledges, grab distant switches/items.
- FIRE-WARD / FROST -> pass fire/thorns, cross the Emberwood, freeze water to walk.
- SWIM / RAFT -> deep water, the Tidewreck Coast.
- (Story keys) -> region entrances gated by plot progress.
Seed VISIBLE versions of each gate early (a cracked wall in Greenhollow you can't bomb yet) so
"come back later" threads open from the start.

---

## PART 3 — THE KARMA-GATED SOCIAL WEB (the standout system)

### 3.1 Two axes (locked, per CHOICE-SYSTEM)
- MORALITY: Cruel (-100) <-> Kind (+100)
- PURITY: Corrupt (-100) <-> Pure (+100)
Independent. Most choices move one or both. Tracked, saved, queryable.

### 3.2 How karma SHAPES the world (the "great game" part Van wants)
- NPC REACTIONS by karma tier: NPCs greet/treat you differently at thresholds. A Kind+Pure hero
  is welcomed, trusted, given quests + discounts + secrets. A Cruel/Corrupt hero is feared,
  refused service, attacked by guards, or - darkly - respected by villains.
- WHO YOU CAN TALK TO: some NPCs refuse a Corrupt hero (a priestess won't speak to you; a child
  hides). Some only open up to a Corrupt/Cruel hero (a black-market dealer, a cult). So karma
  GATES social access both ways - content you only see on certain alignments (replay value).
- QUEST AVAILABILITY: some quests require a karma tier (the temple's blessing quest needs Pure;
  the thieves' guild needs Corrupt). Mutually exclusive paths.
- PRICES/SERVICE: shops, healers, inns react to reputation (discounts vs refusal vs gouging).
- WORLD STATE: the karma web - cumulative deeds change Greenhollow + regions (the town you helped
  flourishes; the one you wronged is hostile). NPCs gossip about your deeds.
- THE ENDINGS: karma is the primary gate on which endings are reachable (see 1.2).

### 3.3 Reactions at certain levels (tiers - decide thresholds)
Define tiers per axis (e.g. Cruel <=-50, Neutral -49..49, Kind >=50; same for Purity) and a few
combined archetypes the world recognises: Saint (Kind+Pure), Tyrant-in-waiting (Cruel+Corrupt),
Trickster (Kind+Corrupt), Zealot (Cruel+Pure). NPCs/factions react to the archetype.

### 3.4 Reputation as separate-but-related (optional depth)
Consider a light REGIONAL reputation (per-region standing) layered on global karma, so local
deeds have local effects. Optional - don't over-engineer; karma tiers may suffice for v1.

---

## PART 4 — MYSTERIES & PUZZLES

### 4.1 The central mystery (the spine)
What IS the Hearthflame? The slow reveal (region by region) that it's a bound suffering god. The
player should suspect before it's confirmed - drop clues (NPC half-truths, environmental
storytelling, the Ember's voice in dreams). Mystery drives Act 2.

### 4.2 Layered mysteries (optional threads)
- What happened to Bram in the fire? (a thread that pays off late - is he truly dead?)
- Who are the other shard-seekers / the rival? (recurring antagonist mystery)
- The childhood Secret choice - what was it, and who remembers? (personal mystery)
- Each region has a local mystery (the marsh witch's identity, the miners' curse).

### 4.3 Puzzles (per dungeon, per WORLD-DESIGN)
- One core mechanic per dungeon (lantern-light puzzles; bomb/block puzzles; hookshot traversal;
  fire/ice state puzzles). Introduce -> develop -> twist -> master.
- Overworld puzzles tied to secrets (the fountain ritual, light-braziers-in-order, push-blocks).
- Environmental/observation puzzles (read the world for clues - per the pervasive-secrets system).
- Keep puzzles fair + telegraphed; the "aha" is the reward.

---

## PART 5 — GRAPHICS & INTERFACE (the cohering layer)

### 5.1 Graphics (locked direction)
- Style: warm classic 16-bit/SNES-Zelda fantasy. 32px world (ArMM CC0), LPC characters (64px,
  CC-BY-SA). Faces via DIALOGUE PORTRAITS (sprite faces are minimal - genre-normal).
- Cohesion: one palette family; deliberate standouts tagged. Varied density (lush, not flat).
- Polish targets: tile transitions/autotiling, building variety, FX/juice (hit-pause, shake,
  particles), screen transitions.

### 5.2 Interface (OoT-style, in progress)
- Tabbed pause menu: Inventory, Key Items, Equipment, Map, Quests (key vs side), Status, Settings.
- HUD: hearts, coins, equipped item, quest tracker (toggleable), minimap (toggleable).
- Settings: audio sliders, text speed, visual toggles, HUD toggles, colour/accessibility options.
- Dialogue: portrait + name + text panel; text-speed setting; choices where relevant.
- Map: overworld map + local maps; fast-travel points (unlock as you progress); marks secrets
  found / regions / objectives.

### 5.3 Accessibility (build in early - cheap now, costly later)
Remappable controls, text size, colourblind-safe cues, difficulty options, toggleable screen-shake.

---

## PART 6 — THE BIG GAP-CHECK: WHAT'S MISSING / NEEDS DECISION

Honest list of things to decide/build for a GREAT (not just good) game:

SYSTEMS NOT YET BUILT:
- [GAP] AUDIO - music (per region/mood/combat) + SFX. The single biggest missing feel-piece.
- [GAP] The ABILITY/GATING system end-to-end (tools that actually gate + unlock the world).
- [GAP] The KARMA SOCIAL WEB wired into NPCs (reactions/availability by tier) - designed above,
  not built.
- [GAP] The QUEST web at scale (main + side, interlinked) - system exists; content + interlinks don't.
- [GAP] The full DIALOGUE system (branching, conditions, portraits, NPC memory of choices).
- [GAP] WORLD MAP + fast travel + minimap.
- [GAP] Combat depth (abilities/skills, enemy variety, juice) beyond basic sword.
- [GAP] Economy (what coins buy, shops that work, upgrades).
- [GAP] Save robustness across the bigger game; multiple save slots (have) tested at scale.
- [GAP] The 5 regions actually built (only Greenhollow + 1 dungeon exist).
- [GAP] Boss design (one per region + final).
- [GAP] The catastrophe + time-skip polished as the emotional Act 1->2 hinge.

CONTENT NOT YET WRITTEN:
- [GAP] Full dialogue for the named cast + region casts (warm/funny/heartfelt per tone bible).
- [GAP] The 5 regions' local stories + how they interlink to the Ember.
- [GAP] The 20+ karma choices placed through the game + their consequence-web wiring.
- [GAP] The 3 endings written + their gating conditions implemented.
- [GAP] Lore/environmental storytelling throughout.
- [GAP] Secrets/easter eggs populated (system designed; content sparse).

THINGS TO DECIDE (design choices):
- Target SCOPE for v1: a tight vertical slice (Greenhollow + 1 full region + the arc + 3 endings)
  vs the full 5-region game. STRONG RECOMMENDATION: build ONE region fully great first (vertical
  slice), prove the whole loop end-to-end, THEN scale to 5. Avoids the unfinished-sprawl trap.
- Combat identity: sword-only + tools, or add magic/skills?
- How heavy the RPG layer is (light Zelda-flavour recommended).
- Dialogue portrait scope (named cast only, or everyone?).

### THE HONEST PRIORITY ORDER (to make it GREAT without circling)
1. Finish the CORE LOOP in ONE place: faces (portraits) -> the childhood act fully (content,
   quests, characters, the catastrophe) -> ONE full region with its dungeon/tool/shard/boss/
   truth/karma-choices. A complete vertical slice you can PLAY start to a milestone.
2. Layer AUDIO (transforms feel).
3. Wire the KARMA SOCIAL WEB + GATING into that slice (so the systems are real, not just designed).
4. PLAYTEST the slice. Refine for fun.
5. THEN scale to the remaining regions, reusing the proven loop.
Build the slice great; the rest is repetition of a proven pattern. A finished small Emberfall
beats an unfinished huge one.

---

## PART 7 — THE MAP & SYSTEMIC WORLD RULES (how it all lives together)

### 7.1 How the story maps onto the geography
The world is a connected overworld (hub-and-spoke, per WORLD-DESIGN) where geography reflects the
story:
- GREENHOLLOW (central hub): the warm home village. Act 1 plays here. After the catastrophe it's
  scarred but remains the hub you return to (shops, healing, save, recurring NPCs, gossip about
  your deeds).
- The 5 REGIONS radiate out, each gated by story progress + a tool, positioned so the world
  "folds back" (shortcuts unlock that loop to the hub). Geographic logic: Ashen Marsh (low,
  west), Sundered Peaks (high, north), Tidewreck Coast (east, sea), Emberwood (south, burning),
  Hollow Spire (centre/far, the oracle seat - revealed last).
- LANDMARKS orient: the Spire visible from everywhere (the goal on the horizon); each region has
  a readable silhouette. The map is navigated by sight + the in-game map screen.
- GATING ON THE MAP: paths between regions are blocked by tool-gates (a chasm needs the hookshot,
  a flooded pass needs the raft) and story-gates (a region opens when its arc begins). Seed
  visible gates early so the map advertises "later."
- FAST TRAVEL: unlock travel points (e.g. a shrine in each region + the hub) as you progress, so
  backtracking the bigger map isn't tedious. Early game = walk (learn the world); later = warp.

### 7.2 Respawning rules (decide concretely - consistency makes the world feel fair)
- BREAKABLE OBJECTS (barrels, crates, pots, bushes, grass): respawn on ROOM/AREA RE-ENTRY (leave
  the screen/area and return) - the classic Zelda rule. So they're a renewable source of pickups
  (coins, hearts, ammo) for farming/restocking, but don't pop back while you watch. Cut grass/
  bushes regrow on re-entry. Pushed rocks/solved puzzles do NOT reset (puzzle state persists).
- DROPS: breakables/grass have a chance to drop hearts/coins/ammo - the heal/restock economy.
- CHESTS: one-time (never respawn); their contents persist as taken.
- QUEST/STORY objects: never respawn; state persists.

### 7.3 Monster spawning + respawning
- MONSTERS respawn on AREA RE-ENTRY (leave + return), like breakables - so the world stays
  dangerous/farmable, but you get safe passage right after clearing. NOT while you're watching.
- DUNGEON monsters: respawn on re-entry EXCEPT cleared-room puzzle gates + bosses (bosses are
  one-time; mini-bosses one-time). Dungeon completion state persists.
- DENSITY scales by region difficulty (soft-gating - per WORLD-DESIGN); later regions hit harder.
- Some ELITE/named enemies are one-time (tied to quests/secrets).

### 7.4 Safe zones - monsters OUT of villages (except special circumstances)
- VILLAGES/TOWNS/SAFE AREAS are monster-free by default - they're the tension-release zones
  (per WORLD-DESIGN pacing). The player can breathe, talk, shop, save.
- SPECIAL CIRCUMSTANCES where monsters DO enter a safe zone (scripted, rare, high-impact):
  - The CATASTROPHE (Act 1->2): Greenhollow is attacked/burns - the one time home is violated.
  - A story SIEGE/INVASION event (a region town attacked as part of its arc).
  - NIGHT incursions (optional): a normally-safe outskirt gets weak night-spawns (see 7.6).
  - A karma consequence: a town you wronged loses its guard / gets raided.
  These are EVENTS, not ambient - their rarity is what gives them weight.

### 7.5 Major events (world beats that punctuate play)
Scripted set-pieces that change the world + pace the game:
- THE CATASTROPHE (Act 1->2 hinge): village burns, Bram lost, time-skip. The emotional pivot.
- SHARD RECOVERIES (5): each is a major beat - boss, truth reveal, world reaction, a tool gained.
- THE MID-ACT TURN: the Ember's true nature revealed (a dream/vision event).
- REGION CLIMAXES: each region's local story resolves in an event (the witch's fate, the miners
  freed, etc.) - and ripples outward (other NPCs react).
- THE CONVERGENCE (Act 3): all shards gathered triggers the endgame - the world shifts (sky,
  music, NPC dialogue all change to "the end is near").
- KARMA MILESTONES: crossing into Saint/Tyrant/etc. can trigger a world-reaction event.
- SEASONAL/FESTIVAL events (optional flavour): a Greenhollow festival early (warm, doomed-feeling
  in hindsight); could recur post-catastrophe as bittersweet.

### 7.6 Day / night system (decide scope - big feel payoff)
- A DAY/NIGHT cycle (real-time-ish or event-driven). Affects:
  - LIGHTING/mood (the lantern matters more at night; tone shifts).
  - NPC SCHEDULES: NPCs follow routines (work by day, home/tavern at night, asleep late) - towns
    feel alive + believable. Shops close at night. Some NPCs only out at certain times.
  - SECRETS gated by time: the fountain ritual "at night" (per WORLD-DESIGN 8b); some secrets/
    NPCs/items only appear day or night.
  - SPAWNS: optional weak night-monsters on safe-zone outskirts/roads (night = slightly
    dangerous); tougher overworld enemies at night.
  - QUESTS: some quests require/change by time (meet someone at midnight; a creature only out by day).
- SCOPE CALL: a full schedule system is big. For v1, a LIGHT day/night (visual + a few time-gated
  secrets/NPCs + shop hours) may be enough; full NPC schedules can come later. Decide per slice.

### 7.7 The unifying principle
Every rule above serves CONSISTENCY + ALIVENESS: the player learns how the world works (breakables
come back on re-entry, towns are safe, night is different, events have weight) and TRUSTS it - so
the world feels real, fair, and reactive. Decide these rules ONCE, apply them everywhere, and the
game coheres instead of feeling arbitrary.

---

## PART 8 — WEAPON & EQUIPMENT PROGRESSION (per Van: earn your arsenal)

The hero does NOT start with a sword. Weapons/gear are EARNED - each a milestone, quest, or
find - giving a satisfying power staircase (per Part 2) and keeping the childhood tone gentle.

### 8.1 The progression arc (rough order - flesh out across the game)
- CHILD (Act 1): NO weapon / a STICK. The stick is for play + light interaction (whack bushes,
  poke things) - NOT real combat. Fits the gentle, weaponless childhood. (A kid swinging a sword
  is wrong for the tone.) Childhood "combat" is minimal/playful at most.
- EARLY ADULT (Act 2 start): a WOODEN SWORD or training blade - the first real weapon, earned as
  a QUEST/milestone (e.g. the smith, a mentor, or found) - this is a MOMENT, not a default.
- MID: a proper IRON/STEEL SWORD (an upgrade quest/find), then a SHIELD (block/deflect).
- LATER: a BOW (ranged - also a gating tool: hit distant switches/enemies), MAGIC (elemental -
  ties to the tools: fire/frost, also gating), and SPECIAL/UNIQUE weapons (region rewards, a
  legendary blade tied to the Ember).
- ARMOUR: progression from clothes -> leather -> mail -> special - improves defense AND visibly
  changes the character (paper-doll, LPC supports layered gear).
- Each weapon/tool also serves the GATING + puzzle systems (bow hits switches, magic passes
  elemental gates, etc.) - so combat progression IS exploration progression.

### 8.2 How they're earned (tie to story/karma/exploration)
- Quests + milestones (the smith forges your first real sword after a task).
- Dungeon/region rewards (a weapon or tool per region, per Part 1.3).
- Found in the world (hidden/secret weapons reward exploration).
- Karma-gated options (a Corrupt path might get a darker weapon; Pure a blessed one) - choices
  matter to your arsenal.

### 8.3 Systems needed
- EQUIPMENT system: equip weapon/shield/armour/accessory; the equipped weapon drives combat
  (damage/range/type); gear shows on the character (paper-doll via LPC layers - the equip
  feature Van wanted) and in the Equipment menu (OoT-style, exists).
- Combat reads the equipped weapon (no weapon/stick = weak/none; sword = melee; bow = ranged;
  magic = elemental). 
- Inventory/Key Items track owned weapons/tools; the menu shows them with icons (library has
  weapon/item icons).
- Seed the progression: the child has stick-only; the adult arc opens with earning the first
  blade; each region adds to the arsenal.

### 8.4 Robustness note
Build the EQUIPMENT/weapon system ONCE (data-driven: each weapon = {id, type, damage, range,
sprite/layer, icon, how-acquired}), then every new weapon is a DATA entry. Combat already exists -
this extends it to read the equipped weapon rather than a hardcoded sword. Additive; preserve
existing combat.
