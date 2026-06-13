# EMBERFALL — SYSTEMS DESIGN (Plan B: weapons, armour, magic, monsters, skills, stats — as data)

> All built on the write-once engines (QUALITY-BIBLE Part 1). Content below is DATA on those engines.
> Numbers are starting specs to tune in-game. Gates F (RPG), E (combat), M (equip/use) apply.

================================================================
## STATS (DnD-style, per QUALITY-BIBLE)
================================================================
STR -> melee damage + carry. DEX -> attack/move speed + dodge. CON -> max HP. INT -> magic power +
spell slots. WIS -> magic defence + perception (loot/secrets). CHA -> shop prices + dialogue options.
Range 1-20-ish; +1 per stat point on level-up. Derived: ATK (STR+weapon), DEF (armour+CON), SPD
(DEX+gear), MAGIC (INT). Character sheet shows all + totals.

## XP / LEVELS / SKILL POINTS
XP from enemies + quests. Level-up -> +HP, +1 stat point, +1 skill point. Soft cap ~30.

## SKILL TREE (4 branches)
- WARRIOR: power attack, dodge-roll upgrade, block->parry, bleed, weapon mastery.
- MAGE: unlock/upgrade spells, +slots, faster cast, elemental potency.
- SURVIVOR: +HP, +carry, cheaper repair, durability saver, lockpicking.
- ROGUE/SOCIAL: SEE QUEST MARKERS (the Fazy Lastard unlock), better prices, persuade, crit, sneak.
Points are scarce -> meaningful builds, not all-unlocks.

================================================================
## WEAPONS (~24, data-driven; tiers + types)
================================================================
Fields: name, type, dmg, speed, reach, durability, effect, tier, value.
TYPES: SWORD (balanced), AXE/MACE (slow, high dmg, can break guard), DAGGER (fast, low dmg, crit),
SPEAR (reach), BOW (ranged, needs arrows), STAFF (scales INT, casts).
TIERS: stick/wooden (start) -> iron -> steel -> fine -> enchanted -> unique/epic.
EXAMPLES: Whittled Stick (start, breaks), Wooden Sword (Hodge), Iron Sword, Steel Axe, Hunter's Bow,
Fen Dagger (poison), Peak Maul (guard-break), Tide Spear (reach+knockback), Ashwood Staff (fire),
Frostbrand (frost sword), + region/quest uniques (e.g. Pem clue-hunt reward, bounty rewards).
DURABILITY: most wear + can break -> repair (smith/gold) or replace. Uniques durable.

## ARMOUR (~12+ pieces; slots: head/body/feet + shield)
Fields: name, slot, def, weight(->speed), effect, tier, value.
EXAMPLES: Cloth (start), Leather set, Chain set, Plate set (heavy, slows), Fen Cloak (poison resist),
Peak Mail, Tide Garb (water), Ember Plate (fire resist), Frost Cloak (frost resist). SHIELDS: Wooden,
Iron, Tower (slow), Kite. Heavier = more DEF, less SPD -> real tradeoff. Visible on character (Gate M).

## MAGIC (5-10 spells; scale INT; cost mana/slots; combat + utility + puzzle)
1 Emberbolt (fire projectile / light braziers), 2 Frost Shard (frost dmg / freeze water+gates),
3 Mend (heal), 4 Gust (knockback / move things / cross gaps), 5 Stoneskin (temp DEF), 6 Spark Dash
(blink/dodge), 7 Lure (the "blow a kiss"-adjacent charm / frog escape / social), 8 Quake (AoE, late).
Spells double as TOOLS (elemental gates in Emberwood, etc.). Learned via skill tree + found tomes.

## TOOLS (region-earned, Metroidvania; also combat/puzzle)
Lantern (Marsh - light/reveal), Climb-Grapple (Peaks - verticality/pull), Hookshot (Coast - cross/
yank), Fire/Frost (Emberwood - burn/freeze gates, also spells 1-2). Each opens prior areas (backtrack).

================================================================
## MONSTERS (archetypes written once; instances are data per region)
================================================================
ARCHETYPES (behaviour, per QUALITY-BIBLE Gate E - each a distinct QUESTION, telegraphed):
- CHARGER (telegraphed rush -> dodge), SHIELDED (front-blocks -> flank/guard-break), RANGED
  (projectiles -> close/block/cover), SWARM (weak, many -> AoE/crowd), BRUTE (slow, heavy -> dodge+
  punish), CASTER (elemental -> interrupt), AMBUSHER (hides -> perception/WIS).
REGION SKINS (same archetypes, themed data + art): Marsh (bog-things, drowned), Peaks (crag beasts,
order-revenants), Coast (wreck-wraiths, smugglers), Emberwood (cinder/frost beasts), Spire (gauntlet
of all + oracle constructs).
SPECIALS: the UNDEFEATABLE FROG (unkillable; escape-puzzle, not a stat fight).
BOSSES (learn-the-pattern, ~3-5 hits of a specific type + a trick + a twist; tests the region tool +
dodge/block): Drowned Guardian (Marsh/lantern), Cinder Keep boss (Peaks/grapple), Drowned Vault boss
(Coast/hookshot), Ember Hollow boss (Emberwood/fire-frost), the over-built-up Spire boss (M19).

================================================================
## ECONOMY (fair, per QUALITY-BIBLE)
================================================================
Income: enemy drops (small), quests (medium), jobs/bounties (repeatable small-medium), selling loot.
Sinks: gear, consumables, durability/fuel (oil, repair), services, fast-travel(early), PROPERTY (buy
a house, late, Fable-style + bigger purse upgrades). Tuned so you can grind a bit but not trivially
out-earn costs. Prices shift with CHA.

================================================================
## DIFFICULTY SETTING (per Van)
================================================================
Story / Normal / Hard - scales enemy dmg+HP, not puzzle logic. Bosses always need the trick; harder
modes punish mistakes more. Set at start, changeable in options.

## DATA-DRIVEN NOTE
All weapons/armour/spells/monsters/quest-rewards are DATA entries. Adding content later = new data,
not new code. Everything references the asset manifest (art-agnostic).

## NEXT (plan): FULL QUEST FLESH (main, then side per region), then COHERENCE REVIEW.

================================================================
## ABILITIES (skill-tree unlocks) — added
================================================================
- DASH: cross gaps + fast getaway (i-frames brief).
- DODGE-ROLL: i-frames, directional.
- SWIRL / SPIN HIT: hits all directions at once, any weapon (AoE melee).
- SEE-QUEST-MARKERS: reveals "?" over quest-givers — UNLOCKS only AFTER the Fazy Lastard quest, via a
  Rogue/Social skill point.
- Branch unlocks also give: power attack, parry (block upgrade), bleed, crit, weapon mastery,
  +carry, cheaper repair, durability-saver, lockpicking, better prices, persuade, sneak.

## GEAR DEPTH — added
- Weapons/armour grant POWERS/ABILITIES/BONUSES, not just stats (e.g. bleed sword, fire-resist+regen
  armour, knockback mace).
- TRINKET/ACCESSORY SLOT: rings/amulets = passive abilities (e.g. +crit, +mana regen, see-secrets).
- A real MIX so builds differ.

## CONSUMABLES / POTIONS — added
Heal, buffs (STR/DEX/etc. temp), antidote, stamina/mana, food (cooking output). Limited carry.

## LIFE-SIM + PROGRESSION EXTRAS — added
- MOUNTS / fast-travel ability (later-game; carriage -> mount -> teleport-to-waystone).
- Optional PET/COMPANION (adds heart; fits tone; minor utility).
- LOCKPICKING + STEALING (Rogue branch; ties to snoop/rude vignettes; caught = karma/rep hit).
- FISHING + COOKING (light life-sim jobs -> gold + buff food).
- REPUTATION / FAME (gestures + deeds -> how towns treat you, Fable-style; tiers).

## GESTURES (learned SOCIAL emotes — NOT magic) — added
Data-driven, affect NPC reaction + reputation. Learned/unlocked through play:
blow a kiss, high five, bear hug, butt slap, middle finger, thumbs up, follow me, stop, go away,
wave, bow, kneel, hands-together (ask forgiveness / contrition), laugh, cry, dance, taunt, salute,
fart, and "suck it" (arms down to crotch — crude, R18 tone). Each has NPC reactions by standing.

## INPUT / CONTROLS (controller + keyboard) — added per Van
REQUIREMENT: full **gamepad support with Xbox controller as the PRIMARY device**, AND full
keyboard+mouse. Verified by QUALITY-BIBLE **Gate N — Input**.
- COVERAGE: every action is playable end-to-end on Xbox controller alone, and on keyboard alone —
  movement, interact/confirm, cancel/back, attack, block/dodge, cast/ability, item use, menus
  (inventory/character/map/quests), dialogue advance + skip, fast-travel, and the social emotes
  (gesture wheel).
- DEFAULT XBOX MAP (suggested, all remappable): Left stick / D-pad = move; A = interact/confirm;
  B = cancel/back; X = attack; Y = use/pickup; RT = primary attack / RB = secondary; LT = aim /
  LB = block; right stick = camera/aim; right-stick click = lock-on; Start = pause/menu;
  Select/View = map; bumpers or radial = ability/emote wheel.
- REMAPPABLE BINDINGS: a Controls menu lets the player rebind EVERY action for BOTH controller and
  keyboard; bindings persist to the save/config. No hard-coded inputs.
- AUTO-DETECT (input method): the game detects the last-used device (controller button vs key/mouse)
  and switches the active scheme live; hot-swap is seamless mid-session.
- DEVICE-MATCHED PROMPTS: all on-screen prompts/tutorials show glyphs for the ACTIVE device — Xbox
  button glyphs (A/B/X/Y/LB/RB/LT/RT/sticks/D-pad) when on controller, key/mouse labels when on
  keyboard — and update immediately on hot-swap.
- DATA-DRIVEN: bindings + the prompt glyph set are data (an input map), so adding an action or a
  device is data, not new input plumbing. (Other devices, e.g. PlayStation glyphs, are a later
  data add.)
- ACCESSIBILITY ties: pairs with remap/hold-vs-toggle/sensitivity options (Gate L / Part 4).
