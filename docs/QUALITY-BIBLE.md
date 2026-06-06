# EMBERFALL — THE QUALITY BIBLE & DEFINITION OF DONE (v1)

> THE foundational standard. Every piece of the game is DESIGNED and BUILT to this, and VERIFIED
> against its gates before it counts as "done." This document governs everything. It is built to
> the spec Van confirmed: 64px+ art, ~30hr near-Fable scale, tonal mix (wholesome->dark->rude to
> the line), challenging-not-brutal + difficulty options, learn-the-pattern bosses, deep
> interlinked morality-driven story, deed-memory/callbacks, rare memorable twists/betrayals,
> eased backtracking, commercial ship. Self-testing gates, write-once systems, always-shippable.

================================================================
## PART 0 — THE GOVERNING PRINCIPLES (the meta-rules)
================================================================
1. WRITE ONCE, APPLY EVERYWHERE (systems vs instances): every consistent behaviour (collision,
   gravity, depth, permanence, interaction, damage, save, karma, dialogue, quests, AI) is ONE
   SYSTEM. Characters/objects/quests/items are DATA that opt into systems. NEVER code a shared
   behaviour per-instance. Fix a rule in one place -> everything benefits. This is the #1 time-saver.
2. DATA-DRIVEN CONTENT: a new weapon/armor/spell/monster/NPC/quest/item/area is a DATA ENTRY on an
   existing system, not new code. Content scales by authoring, not engineering.
3. ART-AGNOSTIC: all art via a central manifest (keys/sizes), so swapping art packs (or a future
   3D port) = swap the manifest, not rewrite logic.
4. SELF-TESTING GATES: every quality gate defines HOW to test it (a method + a measurable
   pass/fail), not just a yes/no question. If it can't be measured, it's not a gate.
5. ALWAYS SHIPPABLE: build so a complete, smaller version always exists (Greenhollow + Region 1 +
   an ending = a finished 3-5hr game; each region extends it). Never an unfinishable mountain.
6. BUILD-RIGHT-FIRST-TIME: the gates exist to prevent rework (the real time-sink). Verify to the
   gate (and to Van's eye) before "done" - skipping this causes the 3x-redo spiral.
7. QUALITY OVER QUANTITY: cut a quest/area before shipping a flat one. Numbers are aspirations;
   per-piece quality is the hard gate.
8. RARITY = POWER: twists, betrayals, trick-quests, shocks are RARE BY DESIGN - their impact comes
   from scarcity. Most content is honest; the tricks are spice.

================================================================
## PART 1 — THE CORE SYSTEMS (write once; everything obeys)
================================================================
These are written ONCE as engine-level systems. Everything else is data on top.
- MOVEMENT/PHYSICS: top-down movement; no gravity-fall (top-down) but "depth" via y-sorting.
  One system; all actors use it.
- COLLISION: bodies vs solids; one system. Solidity is a DATA flag on objects. Collider MUST match
  the visual footprint (gate below). Applies to player, NPCs, enemies, props identically.
- DEPTH-SORTING: floors always below actors; tall props y-sort; low props fixed-low. One system.
- OBJECT PERMANENCE/STATE: one save-backed state system. Chests/doors/pickups/quest-flags/deeds
  persist by writing to it. Opened stays opened; killed bosses stay dead; choices stick.
- INTERACTION: one "interactable" system (face + press E -> action), forgiving radius. NPCs,
  signs, chests, doors, searchables, liftables all register as interactables.
- DAMAGE/COMBAT: one system reading attacker stats + defender stats. Player/enemies/bosses all use
  it. Weapons/armor/spells are data feeding it.
- DEED-MEMORY/CALLBACK (a signature system): one log of notable player deeds (kicked the chicken,
  snooped a drawer, spared/killed X, choice outcomes). Quests/NPCs/twists QUERY this log to react +
  fire callbacks. This powers reactivity + most twists.
- KARMA: the two axes (Morality, Purity) + tiers; one system; everything queries it.
- QUEST ENGINE: one system; quests are data (giver, stages, conditions, rewards, morality hooks,
  callbacks, gating). Supports main/side, gating by karma/deeds/choices, branching.
- DIALOGUE: one system; data-driven nodes, choices, conditions, portraits, voice-blips, paginate.
- AI/BEHAVIOUR: archetype behaviours written once (charger/shielded/ranged/patrol/flee/boss-
  phases); enemies are data picking an archetype.
- SAVE/LOAD: one system; autosave on beats; restores location + all state. 0HP -> last save.

================================================================
## PART 2 — THE QUALITY GATES (self-testing; per area; measurable)
================================================================
Each gate = WHAT + HOW TO TEST + PASS/FAIL. Nothing is "done" until it passes its gates AND a
human-visible proof (screenshot/clip) is captured. (Lighter touch allowed for trivial cosmetic
items, but the method below is the standard.)

### GATE A — TEXT & UI
- TEST: screenshot every dialogue/quest/UI element at MAX content length. Measure: does any glyph
  or element cross its container boundary or another element's zone?
- PASS: all text inside its box (wraps/paginates); no element overlaps another (HUD, tracker,
  dialogue, minimap, banner, labels each in a reserved zone); legible at target resolution.
- FAIL: any clipping, overflow, or overlap. (This gate alone kills the recurring text-over-hearts.)

### GATE B — COLLISION & ACCESSIBILITY
- TEST: for every solid object, walk into it from 4 sides; for every pickup/door/NPC, approach
  from the natural path. Overlay collider boxes vs sprites.
- PASS: solids block (no walk-through); colliders match the visible footprint; every pickup/door/
  objective is reachable with a forgiving radius; no invisible walls in open space; no trap rooms
  (every interior has a working exit).
- FAIL: any walk-through solid, unreachable item, invisible wall, or no-exit room.

### GATE C — DEPTH & RENDER
- TEST: stand the player above/below/behind every prop type; zoom on the sprite.
- PASS: floors never cover the player; tall props occlude correctly; no z-fighting; sprites clean
  (no seams/holes/artifacts).
- FAIL: player behind a floor tile; broken occlusion; sprite artifacts.

### GATE D — QUEST QUALITY
- TEST (per quest): is the objective in immediate sight of the giver? Does it require travel/
  exploration/a beat? Does it tie to story/morality OR is it deliberately a fun/loot side? Does
  the giver have character? Does it use/feed the deed-memory or karma where relevant?
- PASS: objective is NOT in front of the giver (sole exception: the deliberate lazy-guy gag);
  there's a real journey/beat; it links to story/morality OR is an intentional fun/loot quest;
  the giver has voice; rewards are real.
- FAIL: "item right there", flavourless fetch, no link + not intentionally-fun, silent giver.

### GATE E — COMBAT FEEL
- TEST: fight each enemy type + each boss. Does combat have juice (hit-pause/flash/knockback/
  shake-with-toggle)? Is each enemy a distinct question? Does the boss need a learnable pattern +
  a trick + ~3-5 hits of a specific type? Is it challenging-not-brutal (and respects difficulty
  setting)?
- PASS: weighty feedback; varied enemies; boss = pattern+trick+twist, fair; dodge/block/roll
  matter; difficulty setting changes it.
- FAIL: mushy hits, identical enemies, hit-it-til-it-dies bosses, unfair or trivial.

### GATE F — RPG SYSTEMS
- TEST: gain XP -> level -> spend points -> see real effect + on the character sheet; equip gear
  -> stats/visuals change; durability/fuel deplete + refill; shop buy/sell/repair at fair prices.
- PASS: progression is meaningful + visible; gear shows on the character + in stats; economy fair
  (grind-a-bit, can't trivially out-earn); character sheet reads like a real RPG.
- FAIL: hollow levels, invisible gear, broken/unfair economy.

### GATE G — WORLD & SCALE
- TEST: traverse each area; measure travel time + density; check vistas/secrets/landmarks.
- PASS: real scale (run-through-a-town feel); spread-out objectives; rewarded curiosity (secrets/
  searchables/breakables); distinct regions (no reskins); honest edges; "what's over there?" pull.
- FAIL: cramped/tiny, objectives-on-top-of-each-other, empty/flat, reskinned regions.

### GATE H — STORY & DIALOGUE QUALITY
- TEST (per beat): does it advance spine/local/personal? Is the writing in-voice (tonal mix:
  wholesome/funny/dark/rude to the line, never explicit/minors)? Do choices have real, remembered
  consequences? Does it make you FEEL something?
- PASS: meaningful, in-voice, consequential, evocative; choices echo via deed-memory.
- FAIL: filler, off-tone, cosmetic choices, flavourless.

### GATE I — ART & PRESENTATION (commercial bar)
- TEST: view assets together; check cohesion, resolution (64px+ target), palette, animation,
  atmosphere; compare against the target polish.
- PASS: one cohesive style; consistent resolution/palette; animated; atmospheric; professional-
  looking; consistent UI language + font.
- FAIL: mixed styles, inconsistent res, static/stiff, amateur-looking.

### GATE J — AUDIO
- TEST: every action has SFX? context music present + loops cleanly? voice-blips per character?
  mix balanced? settings work?
- PASS: full SFX coverage, fitting cohesive music, distinct voice-blips, balanced, controllable.
- FAIL: silent actions, jarring/missing music, no character audio.

### GATE K — TECH & STABILITY (ship bar)
- TEST: full playthrough of the increment; watch console; measure framerate + loads; try to break
  (revisit, save/reload, edge inputs).
- PASS: 0 console errors in normal play; steady framerate; fast loads; no crashes/softlocks/lost
  progress; clean build.
- FAIL: any crash, softlock, error spam, lost save, stutter.

### GATE L — UX & ONBOARDING
- TEST: new player flow; is it clear how to play + where to go (unless intended)? mechanics taught
  diegetically? accessibility present (remap, text size, colourblind, reduce-motion, difficulty)?
  QoL (fast travel, map, skip text, autosave)?
- PASS: clear, well-taught, accessible, respectful of time, never lost-unintentionally.
- FAIL: confusing, untaught mechanics, missing accessibility/QoL, time-wasting.

================================================================
## PART 2.5 — PRESENTATION & FEEL DoD (visual work is NOT done on a green test)
================================================================
> WHY THIS EXISTS: headless tests verify LOGIC. They said the slice "passed" while
> the screen showed unreadable text, a flat-blue-box "pond", cut-off trees, raw
> terrain stripes, and a black letterbox. A green `npm test` is NEVER sufficient for
> anything that RENDERS. Any scene/render/UI/art work must pass EVERY check below —
> verified by SCREENSHOT at normal zoom (and the FEEL items by Van PLAYING it) —
> before it counts as done. Each check is pass/FAIL; one FAIL = the work is not done.
> The proof is the screenshot/clip, not the assertion.

P1. TEXT (self-verify by screenshot at normal zoom):
- PASS: every on-screen string is comfortably readable at normal zoom — proper
  size, high contrast, on a solid/semi panel wherever it sits over busy art, pixel
  text crisp (no aliasing/blur; render UI text at higher resolution or use a bitmap
  font). All text inside its box (Gate A still applies).
- FAIL: any text you have to squint at, low-contrast text on art with no panel,
  aliased/blurry glyphs, or text clipped/overflowing.

P2. TILES / WORLD (self-verify by screenshot):
- PASS: NO flat colour-box placeholders standing in for a feature; terrain meets
  via proper edge/transition (autotile/9-slice) tiles, not hard stripes; every
  sprite renders WHOLE (nothing clipped/cut-off at edges or by other layers);
  depth-sort correct (player passes behind tall props + in front of low ones); the
  view FILLS the canvas (no dead letterbox/pillarbox bars).
- FAIL: a coloured rectangle posing as water/floor/building; raw butting terrain
  edges; any clipped sprite; broken occlusion; black bars.

P3. NO PLACEHOLDERS (this is now a RULE, not a preference):
- A fake/placeholder asset (colour box, mismatched stand-in, programmer-art prop)
  is WORSE than not having the feature. If the real, licence-confirmed asset is not
  available, OMIT the feature and FLAG it (in the report + PLAN) — do not ship the
  fake. ("A blue box is worse than no water.")

P4. ART LICENCE (gate before any new art is used):
- Any new art must be licence-CONFIRMED (CC0 / OGA-BY / CC-BY[-SA] with no anti-AI
  clause) per docs/ART-LICENSE-NOTE.md + HARD RULE 3 BEFORE it goes in. Unconfirmed
  = do NOT use; quarantine + flag. Record the source + licence (credits-ready).

P5. NPC / ENTITY CLARITY (self-verify by screenshot):
- PASS: player, NPCs, and enemies are distinguishable AT A GLANCE (silhouette /
  colour / outfit), and a thing you can interact with reads as interactable.
- FAIL: the player and an NPC share one look; an enemy is indistinguishable from a
  villager; an interactable looks like scenery.

P6. FEEL — OWNER-JUDGED (Van's eye; screenshot is not enough — he must PLAY it):
These cannot be self-certified. List them in the report as "owner-judged — play
proof required" and hand them to Van explicitly:
- MOVEMENT: responsive, good walk/run cadence, no input lag.
- CAMERA: follow is smooth, not choppy (see PARKED POLISH: camera lerp).
- INTERACTION/DIALOGUE: prompts + advance/select feel responsive, not sticky.
- COMBAT (when built): telegraphs are READABLE (you can see the wind-up + react),
  hits have impact (hit-pause/flash/shake), dodge/block windows feel fair (Gate E).
A visual session is only "provisionally done" until Van has played the FEEL items.

================================================================
## PART 3 — THE VERIFICATION STANDARD (how "done" is proven)
================================================================
- NOTHING is "done" until: (a) it passes its relevant gates by the gates' OWN test methods, and
  (b) a human-visible PROOF exists (screenshot/clip) showing it - matching VAN'S EYE, not just a
  script's claim. Reports must show the proof, not assert it.
- The faces/chicken/text-overlap lesson: a scripted "verified" that contradicts what Van sees is a
  FAIL. Van's eyes are ground truth. Build to the gate, prove with an image, confirm with Van.
- Trivial cosmetic items: a lighter touch is OK, but the gate methods above remain the standard to
  reach for.
- EVERY build session ends by stating which gates were tested, how, and the proof.

================================================================
## PART 4 — THE CONTENT STANDARDS (the spec, concretely)
================================================================
- VISUAL: 64px+ assets, one cohesive style, consistent palette, animated, atmospheric.
- SCALE: ~30hr near-Fable; real-scale areas; eased backtracking + earned/bought fast-travel.
- STORY: deep interlinked morality-driven spine + side web; ~15-25 main quests (Fable shipped
  ~60 total - QUALITY + reactivity over count) + as many QUALITY interlinked side quests as serve
  it; most tie to story/morality, some intentional fun/loot. 3 endings + ~a dozen twists/variations
  driven by whole-game deeds (deed-memory). One ending per playthrough; replay-from-start for others.
- TONE: wholesome + funny + tricks + dark + rude, to the line (never explicit, never minors); a MIX.
- TWISTS (rare, memorable): morality-reactive trick-quests; an over-built-up brutal boss; the
  undefeatable-frog-needs-a-trick type; a few sneaky betrayals. Spice, not texture.
- COMBAT: challenging-not-brutal + difficulty options; dodge/roll/block; learn-the-pattern bosses
  (~3-5 hits of a specific type + a trick + a twist).
- SYSTEMS CONTENT: ~couple-dozen weapons, dozen+ armor, 5-10 spells/abilities, varied monsters -
  all data on the systems.
- QUEST MARKERS: givers have a "?" but the player can't SEE markers until the lazy-guy quest
  teaches it, then unlocks via a skill point (diegetic onboarding).
- PROFESSIONAL: looks good, deep engaging story, real puzzles + exploration + relationships,
  worth paying for, no glitches/blocked-paths/overlaps; consistent; respects player time; teaches
  without hand-holding; never betrays the player (no softlocks/lost progress); stable + performant;
  a first-15-min hook. Commercial ship (Steam/itch.io): credits (all asset licenses), store-ready.

================================================================
## PART 5 — THE BUILD PROCESS (gates baked into the loop)
================================================================
DESIGN PHASE (do the whole, then review): DoD -> World Map -> full Story + Quest web -> Systems
design (weapons/armor/magic/monsters) -> COHERENCE REVIEW (read end-to-end: every quest links,
choices pay off, map holds the story, no contradictions).
BUILD PHASE (region-by-region to completion, each a shippable increment):
  For each increment: build to the data/systems -> run the RELEVANT GATES (by their test methods)
  -> capture human-visible PROOF -> Van plays + confirms to his eye -> per-file commit + push ->
  only then "done" -> next.
EVERY SESSION: reference this Bible; state which gates apply; test by their methods; prove with
images; preserve + push. Build-right-first-time to avoid rework.

## THE ONE LINE
Write systems ONCE and feed them DATA; design the whole then build in shippable region-increments;
hold every piece to SELF-TESTING GATES proven to Van's eye; keep twists rare and quality high.
That is how we build a professional 30hr game efficiently, without redoing things.

================================================================
## GATE M — CHARACTER ANIMATION & EQUIPMENT (added per Van)
================================================================
WHAT: characters must visibly wear/hold/use equipped items, with consistent, sensible animations.
HOW TO TEST (per the LPC layered system):
- Equip a shirt/armour/hat -> the layer VISIBLY appears on the body in all directions + frames.
- Equip a weapon (sword/axe/bow) -> it shows IN HAND, and the attack animation uses the ARM
  (thrust/slash/shoot), not the body/feet.
- Equip a shield -> shows on the arm; block uses it.
- Pick up an item -> a pickup/hold pose plays; carried items show.
- Walk/run/idle/attack/cast/use all share aligned frames -> no layer drifts or misaligns.
PASS: every equipped layer renders correctly on the body across all 4 directions + every animation
frame; weapons swing from the hand; arms are used appropriately; pickups animate; nothing misaligns.
FAIL: any equipped item not shown, floating, swung from the body/feet, misaligned layer, or missing/
inconsistent animation.

================================================================
## GATE N — INPUT (controller + keyboard, added per Van)
================================================================
WHAT: every action is fully playable on an Xbox controller (primary) AND keyboard; bindings are
remappable; the active input device is auto-detected and on-screen prompts match it.
HOW TO TEST:
- Play a full slice with ONLY an Xbox controller: every action (move, interact, attack, block,
  cast, menus, dialogue advance/skip, map, inventory, emotes) is reachable + comfortable; no
  keyboard required.
- Play the same slice with ONLY keyboard+mouse: every action reachable.
- Open the controls menu: REBIND any action (controller and keyboard) -> the new binding works.
- Auto-detect: press a controller button -> prompts switch to Xbox glyphs (A/B/X/Y/LB/RT...);
  press a key -> prompts switch to key names. Hot-swap mid-play updates prompts immediately.
PASS: 100% of actions on controller AND keyboard; remap works + persists; device auto-detected;
on-screen prompts always match the device in use.
FAIL: any action unreachable on either device; unremappable bindings; wrong/stale prompts; no
auto-detect.

## PARKED POLISH ITEMS (revisit during polish pass, not now)
- Camera/background scroll is choppy when moving (likely pixel-snap / no camera lerp / roundPixels
  on a fractional camera). Fix in polish: smooth camera follow (lerp), consistent pixel rounding,
  check zoom isn't fractional. Judge in-game with real content, not on the test field.
- Walk cadence fine-tune (WALK_STRIDE constant) if feet still read slightly off.
