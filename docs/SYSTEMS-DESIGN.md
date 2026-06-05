# EMBERFALL — SYSTEMS DESIGN DECISIONS (economy, death, mapping, edit tool, game-feel)

> Concrete decisions for the systems Van raised, plus a deep-think on game-feel/mechanics that
> make it AMAZING even in a classic style. Decide here, build to it.

================================================================
## PART 1 — ECONOMY (earn-vs-cost balance + healthy grind)
================================================================
PRINCIPLE: the player should never be able to trivially out-earn costs, but CAN grind a bit for
steady progress. Money stays meaningful all game.
- COIN SOURCES: breakables/grass (small, respawn on re-entry = the grind), enemies (small drops),
  chests (one-time, bigger), quest rewards (meaningful), selling materials (moderate).
- COIN SINKS: consumables (food/potions), gear upgrades (weapons/armour/shield), key services
  (healing, fast-travel maybe), some gated purchases (a needed item from a shop).
- BALANCE RULE: tune drop rates + prices so the player is usually a LITTLE short of the next big
  thing - grinding breakables/enemies gives steady but SLOW income (you can grind 10-15 min for an
  upgrade, not 1 min). Big purchases gated behind quests/progress, not pure grind.
- ANTI-INFLATION: respawnable sources give SMALL amounts; the big money is one-time (chests/quests)
  so you can't farm infinite wealth fast. Prices scale gently by region (later gear costs more).
- IMPLEMENT: data-driven prices + drop tables; a soft "wealth curve" target per region; playtest-
  tuned. Selling key/quest items disabled (item kind, per POLISH #17).

================================================================
## PART 2 — DEATH / 0 HP
================================================================
- AT 0 HP: return to the LAST SAVE (reload the saved state). Simple, classic, no harsh loss beyond
  lost progress since save -> makes autosave (below) important so death isn't punishing.
- AUTOSAVE on key beats (region enter/exit, boss start, shard, major choice) so "last save" is
  usually recent + fair.
- FUTURE (optional): REVIVE items (a phoenix-down equivalent) - consumable that revives once on
  death at the spot, instead of reload. Add later as a consumable item (data entry). Maybe a
  shrine/checkpoint respawn option too.
- NO permadeath. Death is a setback, not a punishment - keeps the tone (warm, not brutal).
- Define a death screen/beat (a brief fade + a gentle line, then reload) - not a harsh "GAME OVER".

================================================================
## PART 3 — MAPPING & HUD (full, classic, readable)
================================================================
### 3.1 HUD (always-on, minimal, honest - per POLISH #6)
- Hearts (HP), coins, equipped weapon/item icon, a MINIMAP (toggleable), active-quest tracker
  (toggleable). Only show unlocked things (no bombs until earned, etc.).
### 3.2 MINIMAP (corner, in-play)
- A small corner minimap showing the local area + the player's position + key markers (objective,
  fast-travel, entrances). Toggleable (settings + a hotkey). Reveals as you explore (fog-of-war
  style) so exploration matters.
### 3.3 FULL MAP (menu/settings - the MAP tab exists)
- A full map screen: the current region's map + the WORLD map (hub + regions + the Spire). Shows
  WHERE YOU ARE (player marker), discovered areas (revealed by visiting), fast-travel points,
  region names, current objective marker, secrets-found counters (encourage completion).
- World map shows the regions' relative positions (per WORLD-BIBLE) + locked/unlocked state +
  see-beyond hints (the Spire always visible as the goal).
### 3.4 MAP RULES
- You always know WHERE you are + where you've BEEN. Undiscovered = fogged/silhouette (curiosity).
- Objective markers guide without hand-holding (a soft marker, not a forced line).
- Maps are part of the "always readable" principle - the player is never lost without it being
  intentional (a deliberately maze-like dungeon is fine; being lost in the overworld is not).

================================================================
## PART 4 — IN-GAME EDIT / ANNOTATION TOOL (Van's live-feedback idea)
================================================================
GOAL: a dev-only in-game mode where Van can, WHILE PLAYING, mark things wrong or note changes -
so feedback is precise + located, not "that bush near the chapel" from memory. HIGHLY USEFUL for
fast iteration.
### 4.1 MVP (build first - simple + high-value)
- A toggle (e.g. F8 / a dev hotkey) enters EDIT/ANNOTATE mode (dev builds only).
- Click/tap anywhere to drop a NUMBERED PIN with a typed NOTE ("pond blocks door", "tile wrong
  here", "NPC silent"). Pins store the SCENE + x,y + text.
- Export: a button/key dumps all pins to a JSON file (or console/clipboard) Van can hand to Claude
  Code ("fix pins in marsh-notes.json") - each pin is an exact located task. 
- Pins visible as an overlay; toggle off to play normally.
### 4.2 NICE-TO-HAVE (later)
- Live-nudge: drag a prop/NPC/collider to a new position in edit mode, export the new coords (so
  Van can fix layout/accessibility live + Claude Code bakes it in).
- Toggle collision-box overlay (see colliders vs art - debug the "invisible wall / unreachable"
  class visually).
- A free-cam to inspect the whole map.
### 4.3 WHY IT'S WORTH IT
- Turns vague playtest feedback into precise located tasks -> faster, fewer-miss fixes (directly
  serves the working method + going fast). Build the MVP early; it pays for itself immediately.
- DEV-ONLY: gated behind a dev flag so it never ships to players.

================================================================
## PART 5 — UNIQUE REGIONS (no copy-paste)
================================================================
RULE: each region must be DISTINCT in biome, palette, layout, mechanic, mood, music, enemies,
culture, and architecture - never a recolour of another. (Per WORLD-BIBLE each already has a
distinct identity; this enforces it in execution.)
- BIOME/PALETTE: marsh (murky teal/brown) vs peaks (grey/stone/snow) vs coast (blue/sand/storm)
  vs emberwood (fire-orange/ash/frost) vs spire (cold marble/gold). Distinct tilesets per region
  (bespoke or clearly distinct selections - not one set recoloured).
- LAYOUT: marsh = maze of causeways over water; peaks = vertical switchbacks + mine; coast =
  open cliffs + islands (grapple); emberwood = dense burning/frozen groves; spire = ascending
  halls. Each LAYOUT TYPE differs - traversal feels different.
- MECHANIC: lantern/light vs strength/boulders vs hookshot/gaps vs fire-frost/elements vs all-
  tools. Each dungeon plays differently.
- MOOD/MUSIC/ENEMIES/CULTURE: each distinct (per WORLD-BIBLE casts + themes).
- ENFORCEMENT: when building each region, check it against the others - if it feels like a reskin,
  it's not done. Distinctiveness is a requirement (depth/excitement: VARIETY).

================================================================
## PART 6 — DEEP-THINK: GAME-FEEL & MECHANICS THAT MAKE IT AMAZING
================================================================
Classic style, but these are what make classic games feel GREAT (apply throughout):

### 6.1 JUICE (the cheap magic - huge feel-per-effort)
- Hit-pause/freeze-frame on impact (a few ms) - makes hits feel weighty.
- Screen-shake (subtle) on hits/explosions/big events (toggleable per accessibility).
- Knockback + flash on enemy hit; satisfying death (poof/particles/coins burst).
- Particles: dust on landing/running, sparkles on pickups, embers, splashes in water.
- Squash/stretch on jump/land/hit; weapon swing arcs with a trail.
- SFX on EVERYTHING (footsteps by surface, swings, hits, pickups, menus, doors) - audio feedback.
- Camera: subtle follow lag, a little lookahead in movement direction.
- These transform how combat + interaction FEEL. A juice pass punches way above its weight.

### 6.2 COMBAT DEPTH (readable, not button-mash)
- Each enemy is a QUESTION (a different approach): a charger (sidestep), a shielded foe (flank/
  light), a ranged foe (close gap/cover), a swarm (crowd control). Variety = engagement.
- Player options grow: basic attack -> charged/spin attack -> tools as weapons (bow, magic, bombs)
  -> shield block/parry. Combos of tool+sword.
- Telegraphed enemy attacks (wind-up tells) so combat is fair + learnable.
- Bosses = a multi-phase puzzle testing the region's mechanic + reflexes.

### 6.3 EXPLORATION FEEL
- The "just one more screen" pull: always something visible to investigate.
- Reward density: frequent small rewards (coins, hearts, lore) + rare big ones (heart container,
  tool, secret area). Variable reward = compelling.
- Secrets reward attention (cracked walls, suspicious bushes, lantern-revealed, off-path).
- Verticality/layers where possible (bridges, cliffs, look-down vistas) even in 2D top-down.

### 6.4 PROGRESSION FEEL
- Power AND knowledge grow; the world opens; old areas re-open with new tools (backtrack reward).
- "Look how far you've come" beats (a once-hard enemy now easy; returning to a changed Greenhollow).
- Meaningful upgrades the player CHOOSES (which gear, which path) - agency.

### 6.5 GAME-FEEL POLISH (the "amazing" layer)
- Responsive controls (no input lag; coyote-time-ish forgiveness on actions).
- Smooth scene transitions (a wipe/fade, not a hard cut).
- Readable, characterful UI (consistent frames, the bitmap font, juice on menu navigation).
- Consistent, deliberate art (the cohesion principle) + atmosphere (lighting, weather, mist,
  day/night) - mood is a feature.
- MUSIC that fits + shifts with context (calm/tense/combat/sad/triumph) - the emotional multiplier.
- Quality-of-life: fast-travel, a good map, autosave, skippable text, remappable controls.

### 6.6 THE "AMAZING" CHECKLIST (beyond "works")
[ ] Does combat feel WEIGHTY (juice)?
[ ] Is each enemy/boss a distinct QUESTION?
[ ] Is exploration REWARDED constantly (small) + occasionally (big)?
[ ] Does the world have ATMOSPHERE (mood/light/music/weather)?
[ ] Does progression feel like real GROWTH (power + knowledge + world opening)?
[ ] Are controls RESPONSIVE + forgiving?
[ ] Is the UI/map READABLE + characterful?
[ ] Does every beat make the player FEEL something (the golden rule)?
[ ] Is each region UNIQUE (no reskins)?
[ ] Quality-of-life present (fast-travel, map, autosave, skip text, remap)?

## THE ONE LINE
Classic-style doesn't mean basic: JUICE, distinct enemies, rewarded exploration, atmosphere,
real growth, responsive controls, a great map, and quality-of-life are what make an old-school
game feel AMAZING. Apply the checklist to everything.
