# EMBERFALL — THE QUALITY BIBLE & DEFINITION OF DONE (INDEX

> ## ★ THE QUALITY BAR — INDEX (read this first; the bars live in their own docs)
> One place that links every standard + when it applies. (The detailed v1 bible below is the historical
> foundation; the live, current bars are the linked docs.)
> | bar | doc | applies when |
> |---|---|---|
> | **Definition of Done** (runtime/eyes-on · **pixel-truth** · **Van's-exact-state** · exhaustive tables · asset cross-check) | `DONE-DEFINITION.md` | before claiming ANYTHING done |
> | **Professional feel** (the 6 open-world-but-gated pillars) | `RPG-FEEL-STANDARD.md` | building any region/corridor/gate |
> | **Door / entrance system** (asset-owned doorways · open/closed/locked/broken · purpose signs) | `DOOR-SYSTEM.md` | any building/door work |
> | **Interiors rules** (type×region matrix · non-collision · stairs · theme · traversal) | `SPEC-INTERIORS.md` (v2) | building any interior |
> | **Traversal rule** (passes need the stated item/ability; a solid main path always exists) | `SPEC-INTERIORS.md` §R5 + `gating.js` | any gated route/region |
> | **Asset-first** (audit library FIRST · report HAVE/GAP · ledger all) | `CLAUDE.md` HARD RULE 12d + `ASSET-LEDGER.md` | any visual/audio work |
> | **Licence bar** (CC0/CC-BY/-SA/OGA-BY/GPL safe; NC/ND/anti-AI banned; unclear=quarantine) | `ASSET-LEDGER.md` + HARD RULE 3 | importing any asset |
> | **Ship-gate** (`no-unverified-assets-at-ship`): licence-UNVERIFIED assets may ship at LOCAL/friends scope as tracked DEBT; **before any distribution beyond local/friends run `SHIP=true npm run verify` — it HARD-FAILS until every `unverified` row is source-verified (moved into the `ledger` block) or swapped to a CC0 candidate** (DEFERRED's music list). | `ASSET-LEDGER.md` `unverified` block + `verify.mjs` | before any release |
> | **Full-expectation specs** (decompose→Van-review→build→exhaustive table→player-pass) | `THE-SLICE.md` method + `SPEC-BACKLOG.md` | starting any system |
> | **Process meta-rules** (why gates went green while broken; the 12 rules) | `PROCESS-RETRO.md` | when a check disagrees with Van's eyes |
> | **What to build next** | `THE-SLICE.md` (order) · `PLAN.md` (current step) · `DEFERRED.md` (parked) | every session |

# EMBERFALL — THE QUALITY BIBLE & DEFINITION OF DONE (v1, detailed foundation)

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
## PART 2.6 — SPATIAL / WORLD-COHESION DoD (the "Fable-grade place" gates)
================================================================
Peer to Part 2.5, under HARD RULE 9. This turns "make every region feel like a real,
continuous, lived-in place" from a vibe into NAMED, CHECKABLE GATES, so Marsh / Peaks /
Coast / Emberwood / Spire are built to ONE explicit bar — not re-litigated from feel each
time. Greenhollow Vale is the reference build for these gates.

Each gate is: **rule** · **why** · **check**, and every check is tagged **[OBJECTIVE]** (a
script or screenshot verifies it — a measurable threshold is stated) or **[EYE]** (only
Van's play-judgment passes it — what he's looking for is stated). Where an [OBJECTIVE]
check is wireable as a lint, it is flagged **(→ verify.mjs)** as a PROPOSED check to wire in
a later code session — described here, NOT implemented now.

### A0. SPACE-FIRST, NOT PATH-FIRST  *(the root principle — refined per Van's v2 play-judgment)*
- **Rule:** lay out **SPACES first** — a plaza, yards, lanes, a green — and let **buildings + walls
  + fences ENCLOSE them** ("outdoor rooms"). Paths are the *negative space between enclosures*, not
  lines drawn on a field with objects scattered around them. Design the void, then wrap it.
- **Why:** "objects on a plain" (the v2 fail) is what you get when you place paths + props on open
  grass. Real towns read as *enclosed spaces you move between*. This is the fix that makes everything
  else land. Maps to Kevin Lynch's legible-place elements: **paths · edges · districts · nodes ·
  landmarks** — design all five, not just paths.
- **Check:** [EYE] — does every open area feel *bounded by built form* (you're in a square / a lane /
  a yard), not standing on a lawn? GATE: no region may read as objects on a plain.

### A. ENCLOSURE, OFF-CENTRE NODE & DISTRICTS  *(was: organic layout)*
- **Rule:** (1) **ENCLOSURE** — buildings **FRONT the streets** and **BACK onto fenced yards/
  gardens**; sides **near-touch** to define lanes. (2) **OFF-CENTRE NODE** — the gathering heart
  (fountain/well + benches + a notice board) **anchors but never symmetrically bisects** the map;
  break radial symmetry everywhere. (3) **DISTRICTS** — even a small village reads as **distinct
  zones**, each visually different: *social heart · homes-with-gardens · working smithy set apart ·
  farm margin.* Spacing varies — tight where life clusters, apart where logic demands.
- **Why:** enclosure + an off-centre node + readable districts are the difference between a *planned
  lived-in place* and a symmetric diagram. Symmetry and even spacing scream "level."
- **Check:** [EYE] — distinct districts you could name; the node is off-centre; yards are enclosed.
  [OBJECTIVE] proxy (→ verify.mjs): building centres NOT all tile-grid-aligned (≥40% off whole-tile
  rows/cols); nearest-neighbour spacing CoV ≥ ~0.35; the node is **not** within ~2 tiles of the map
  centre. (Proxy only; the [EYE] read is final.)

### B. PATH HIERARCHY (curve & wear)
- **Rule:** **GRADED surfaces, never one uniform path type** — paved plaza/node → packed-dirt road →
  narrow lane → worn desire-path. **Width + material signal importance.** Roads bend, fork, and
  narrow; they meet at junctions, not crossbars; they follow the spaces, not ruler lines.
- **Why:** a single uniform path everywhere is a flat diagram; graded width/material is how a real
  settlement shows what matters and where feet actually go.
- **Check:** [OBJECTIVE] (→ verify.mjs): **≥ 3 distinct path surface tiers** used; no straight run
  longer than **8 tiles** without a bend / fork / width or material change. [EYE]: do the tracks feel
  *trodden* — feet, not a ruler — and does the hierarchy read (you can tell the high street from a
  back lane)?

### C. BOUNDARY DEPTH BAND + DIEGETIC TRAILHEADS  *(supersedes the v2 flat-treeline pass)*
- **Rule:** every edge is a **BAND, not a line**: near **undergrowth / rocks** → **varied front
  trees** → **darker trees receding** → a **silhouette hint of the next area** (marsh-gloom W,
  foothills N, sea E…). **You can see INTO it** — the world continues. AND **DIEGETIC TRAILHEADS:**
  where a path leaves the map it **NARROWS and CURVES into denser trees** — **never a rectangular gap
  in a wall.** No edge stops at flat grass; no invisible wall.
- **Why:** a flat one-deep treeline still reads as a wall at the world's end. Depth (layers receding
  into a hinted beyond) is what makes the player *feel the world keeps going*. Rectangular gaps read
  as doors in a fence, not roads into a forest.
- **Check:** [OBJECTIVE] (→ verify.mjs): every edge bounded; **sprite spillCount == 0**; the boundary
  is **≥ 2 prop-rows deep** with a tint/scale gradient (front bright/large → back dark/small); exits
  narrow (no straight gap wider than the road + curve into trees). [EYE]: can Van **see into** the
  beyond, and does each trailhead read as a road *leaving into* somewhere?

### D. FEATHERED BIOME EDGES — via REAL transition tiles
- **Rule:** ground types **interpenetrate** — grass laps over path / dirt / sand / soil with **real
  LPC autotile/transition tiles** (corner-feathered), so seams are organic at the *tile* level;
  **edge-scatter only supplements**, never substitutes. Hard square biome borders are banned.
- **Why:** scatter-over-hard-seams was the v2 interim; real transition tiles are the actual fix and
  the Stardew/Fable look. (Licence-first: the bluecarrot16 **[LPC] Terrains** autotile atlas is
  AI-safe CC-BY/CC-BY-SA/GPL — ledgered.)
- **Check:** [OBJECTIVE] (→ verify.mjs): **no straight grass↔non-grass seam longer than ~4 tiles**
  without a transition/feather tile over it. [EYE]: seams read as organic interpenetration, not a
  cut. *(If no clean transition set can be loaded for a region, FLAG + keep dense scatter as interim
  — never fake tiles.)*

### E. GROUND & SCENERY VARIETY
- **Rule:** each region shows **≥ 4 distinct ground/scenery types** AND visible CHANGE as you
  cross it (the eye always has a new thing to read); density VARIES — busy core vs quiet lane
  vs open margin.
- **Why:** a region that's visually uniform end-to-end is boring to traverse and reads as cheap.
- **Check:** [OBJECTIVE] (→ verify.mjs): distinct ground tile-types used ≥ 4; scenery prop
  kinds ≥ ~6. [EYE]: does the change feel *intentional* (zones that read different), not noise?

### E2. TERRAIN-CHANNELLED TRAVERSAL  *(the world is NOT an open field — see WORLD-STRUCTURE §2.1b)*
- **Rule:** traversal is **shaped by terrain into ROUTES that fork**, never a large open walkable
  expanse. Like **Link to the Past / Link's Awakening / Adventure Time** (not BotW Hyrule-field):
  trees/cliffs/water/rock/ledges/fences **carve** the space; the player **flows along paths**, with
  **a couple of real direction choices** at junctions and **tempting blocked spurs** for later tools.
- **Why:** open ground reads as empty/cheap and kills the explore-by-route feel; channelling makes
  geography the obstacle course + the Metroidvania board (§2.5 gating made physical).
- **Check:** **[OBJECTIVE → verify.mjs]** no open traversable area exceeds **N tiles** without a
  channelling feature (else it must be a tagged `deliberate_lull`); ≥1 forking junction per stretch
  between landmarks. **[EYE]:** *"do I FLOW along routes, or wander a field?"* — must read as routes.
- **Also (anti-empty):** every **screen-sized sector** has something to see/collect/investigate — **no
  empty useless terrain**. [EYE]: *"is any sector boring/empty?"* — none may be. (The full density +
  web-not-line gates live in WORLD-STRUCTURE §2.4; this is the per-area echo. Verticality/elevation
  = Gate F + Pillar 4 = **[ENGINE FEATURE]**, cross-ref TRAVERSAL — don't over-promise true height.)

### F. ELEVATION & RELIEF  *(capture honestly — partly an ENGINE question)*
- **Rule:** regions are not one flat plane — hills, ridges, valleys, slopes where the region's
  identity wants them (Sundered Peaks especially).
- **Why:** flatness flattens identity; the Peaks must feel high and broken, not a green field
  with grey tints.
- **Check:** [EYE] for the look. Mark each elevation feature as one of:
  - **"cosmetic relief (free now)"** — arrange existing tiles + props (cliff-edge tiles as
    backdrops, raised treelines, layered overlap) to *imply* height. Achievable on the current
    RegionScene with no engine change.
  - **"NEEDS ENGINE FEATURE first"** — anything requiring **walkable elevation, multi-level
    occlusion / depth-sort across height, or true verticality**. RegionScene today is a single
    flat ground plane with footprint-based y-sort; real elevation needs: a height/layer concept,
    per-layer collision, and depth-sort that accounts for height. **FLAGGED build task** — do
    NOT over-promise the renderer can do this; cosmetic relief first, engine verticality later.

### G. CAVES & INTERIORS as real explorable space
- **Rule:** a cave-mouth / door leads SOMEWHERE (an interior space), not a sign that says "cave."
- **Why:** "boarded cave = a sign" is a current Greenhollow placeholder; dungeons are core.
- **Check:** [EYE] for "it's a real place inside." FLAGS (build tasks): a **real cave-mouth
  sprite** is still wanted (currently a sign); and an **interior scene + transition** (enter/exit,
  a RegionScene interior variant or scene-swap) is an **engine prerequisite** — FLAGGED, not
  assumed to exist.

### H. SIGNATURE REGIONAL SET-PIECES
- **Rule:** each region earns **≥ 1 identity landmark/feature the others don't have** — e.g. the
  Tidewreck **underwater base/section** (the hookshot tool already exists), the **burning/freezing
  heart** of Emberwood, the **Spire** itself, the Sunken Shrine, Cinder Keep.
- **Why:** without a signature, regions blur into "another field with tinted trees."
- **Check:** [EYE] — is there one thing here you'll remember the region by? FLAGS: some set-pieces
  (e.g. an **underwater layer** for the Coast) may be **engine prerequisites** (a swim/under-water
  mode + visual layer) — FLAG as a build task if the look needs more than tiles+props.

### I. LANDMARKS & LEGIBILITY
- **Rule:** each region has clear landmarks to orient by — you can navigate it from memory
  WITHOUT the HUD map. The space is readable: distinct silhouettes, sightlines to the goal.
- **Why:** a place you can hold in your head is a place; a maze of samey tiles is not.
- **Check:** [EYE] — can Van cross the region and find his way by landmarks alone?

### J. SECRETS REWARD EXPLORATION
- **Rule:** off-path discoveries reward looking around — the **3 Greenhollow chests** are the
  reference. Every region seeds **≥ 3** stated secrets (a tucked cache, a hidden path/clearing,
  an easter-egg corner).
- **Why:** exploration without payoff trains players to stop exploring.
- **Check:** [OBJECTIVE] (→ verify.mjs): secrets count ≥ 3 per region (from the region's
  `chests`/secrets data). [EYE]: is each one actually *worth finding* (a real reward + a smile)?

### K. INTERACTABLE PLAYGROUND  *(proposed — see docs/INTERACTABLES-DESIGN.md)*
- **Rule:** each region uses **≥ 3 interactable kinds** (cut/lift/throw/break/smash/push/bomb/
  tool-gated) and **≥ 1 secret is gated behind a breakable/cuttable/bombable** (counts toward
  Gate J). **Why:** an inert map is a museum; reacting objects make exploring feel alive.
- **Check:** [OBJECTIVE] (→ verify.mjs): from the region's interactable DATA, distinct interaction
  kinds ≥ 3 + at least one breakable-gated secret. [EYE]: do the interactions have JUICE (cut/
  shatter FX + sfx, readable "this is breakable" silhouette, a rewarding reveal)? Full spec + the
  honest FREE-NOW vs NEEDS-ENGINE split is in **docs/INTERACTABLES-DESIGN.md**.

### ASSET POLICY (binding rule for every spatial build)
Build to this bar with **WHAT WE HAVE** and **WHAT'S FREE** (OGA / LPC / CC0) **FIRST**. Only
spend money once the game is **working and feels right** AND free genuinely falls short for a
**specific** need — and only after a **licence + anti-AI-clause check** (Mana Seed stays BANNED).
No build session reaches for a purchase prematurely; a missing asset is OMITTED + FLAGGED, never
faked. (Cross-ref `docs/ASSET-SOURCING-TIERS.md` if/when it exists.)

### PROCESS HOOK
Every region "gold-standard" session MUST self-check this Part 2.6 — the **[OBJECTIVE]** gates
with proof + screenshots, and hand the **[EYE]** gates to Van to play-judge — exactly the shape
of the Part 2.5 Presentation & Feel DoD, under HARD RULE 9.

#### ✅ WIRED into `scripts/verify.mjs` (2026-06-08) — these [OBJECTIVE] gates now SELF-ENFORCE
A drifting build FAILS `npm run verify` (the pre-commit hook) and can't commit. Reading region/
world DATA (`src/data/worldmap.js` REGIONS + `src/data/gating.js` the gate DAG):
- **NO SOFT-LOCKS** (WORLD-STRUCTURE §2.5 "clear eventual key") — the gating DAG: every key
  obtainable, acyclic, no key-behind-itself, every tease pays off. *(the strict one)*
- **CHANNELLED-NOT-OPEN** (§2.1b/2.4) — a `route:true` region may not contain an open k×k
  walkable block > 8 tiles (would read as open field).
- **DENSITY FLOOR per sector** (§2.4) — every ~24-tile screen-sector of every region has content.
- **COLLISION-MATCHES-VISUAL-MASS** (the recurring Phase-5 bug) — a region with non-solid
  solid-mass props (trees/buildings) MUST have colliders, else the player walks through them.
- **SEAM COHERENCE** (Level-B seam lint) — adjacent regions share EXACT edge coords (no gap/overlap).
- **PROP-KEY INTEGRITY** — every region prop key exists in the PROPS manifest (+ the existing
  ASSET-LEDGER licence gate covers the art FILES).

#### STILL [OBJECTIVE]-but-PROPOSED (need data we don't yet capture / per-region art metrics — wire when built)
A-proxy (grid-alignment), B (straight-run path tiers), C (spill/edge-bound), D (seam-tile run),
E (ground/scenery variety counts), J (secret count ≥3), K (interactable kinds ≥3), WEB-NOT-LINE
(≥2 routes) — these read pixel/tile-render or per-region metadata the data doesn't expose yet;
flagged, not faked. Wire each as its region reaches gold-standard.

----------------------------------------------------------------
## PART 2.6 — SETTLEMENT DESIGN: THE FOUR PILLARS (all scales: hamlet → city)
----------------------------------------------------------------
The gates A0–K above are the *cohesion* bar. THIS is the *settlement* rule-set — how a town or
city is composed at any scale. Each rule: **rule · why · check** ([OBJECTIVE] w/ a measurable
threshold + a proposed **→ verify.mjs** lint where wireable, or [EYE] w/ what Van judges) ·
build-cost tag **[FREE NOW]** vs **[ENGINE FEATURE]** · scale tag **[hamlet]/[town]/[city]/[all]**.
Greenhollow (v3) is the reference HAMLET. Cross-ref **docs/TRAVERSAL-EXPLORATION-DESIGN.md** for
moving *between* and *through* places, and city VERTICALITY.

### PILLAR 1 — SPATIAL STRUCTURE  *(folds in gates A0/A/B/C — keep those; this generalises)*
- **ENCLOSED ROOMS, NOT ONE OPEN FIELD** [all] [FREE NOW] — a settlement is a *sequence of
  enclosed spaces*, never one area seen all at once. *Why:* the root of "place vs plain" (gate A0).
  *Check:* [EYE] every space feels bounded by built form. [OBJECTIVE] (→verify.mjs): no single
  open ground region exceeds ~25% of the settlement's walkable area.
- **DISTRICTS WALLED DIEGETICALLY** [all] [FREE NOW] — separate places are divided by *in-world*
  barriers (fence, hedge, low wall, water, level change, dense planting). *Why:* **barriers exist
  to CREATE places, not just to block.** *Check:* [EYE] each district has a readable edge.
  [OBJECTIVE] proxy: ≥1 diegetic divider between each named district pair.
- **ROUTE HIERARCHY** [all] [FREE NOW] — graded surfaces/widths (plaza → road → lane → worn track)
  so importance + footfall read at a glance. *Why:* uniform paths = a diagram. *Check:* = gate B
  ([OBJECTIVE]: ≥3 surface tiers).
- **REVEALS / CONCEALMENT** [town]/[city] strong, [hamlet] light [FREE NOW] — you **cannot see the
  whole settlement at once**; buildings, walls, planting and bends hide what's round the corner, so
  moving through is *discovery*. *Why:* hidden-then-revealed space is the core pleasure of a place.
  *Check:* [EYE] you turn a corner and something new opens up. [OBJECTIVE] proxy: no single camera
  view (at play zoom) frames > ~60% of a town/city's buildings.
- **LANDMARKS** [all] [FREE NOW] — orienting landmarks (well, great tree, spire, lighthouse) you
  navigate by **without the HUD map** (= gate I). *Check:* [EYE] Van crosses it by landmark alone.
- **DESIRE-PATHS** [all] [FREE NOW] — worn shortcuts where people actually walk, not only laid
  roads. *Check:* [EYE] at least one "feet, not a planner" cut; [OBJECTIVE]: ≥1 sub-tier worn path.
- *(ENCLOSURE + OFF-CENTRE NODE + districts — see gate A; keep, folded here.)*

### PILLAR 2 — LIFE & MOVEMENT  *(the BIGGEST current gap — mostly [ENGINE FEATURE] + data)*
- **NPC ROUTINES** [all] [ENGINE FEATURE: a schedule + pathing system] — NPCs follow daily
  schedules on the TimeOfDay phases (work by day, home at night, market in the morning). *Why:*
  schedules sell "lived-in" more than any art. *Engine note:* needs waypoint pathing + a per-NPC
  schedule table + phase-driven goals; RegionScene/Character today only do scripted facing.
  *Check:* [EYE] the town's population *moves with the day*. [OBJECTIVE]: ≥N scheduled NPCs relocate
  on `onPhaseChange`. Cross-ref GAPS-AND-DEPTH §8.
- **CHORES, NOT IDLE** [all] [ENGINE FEATURE: chore-anim loops] — NPCs visibly DOING things
  (sweeping, hauling, hammering, tending), not standing in clumps. *Why:* idle clumps read as a
  diorama. *Check:* [EYE] most NPCs are *busy*. *Engine note:* a small looped-action anim + anchor.
- **CROWDS ARE NOISY, NOT UNIFORM** [all] [FREE NOW] — **every SHARED NPC action needs per-agent
  jitter in timing, speed, and path.** On a phase change, departures STAGGER (a per-NPC delay);
  each NPC has a persistent speed multiplier + a slightly offset target (paths differ); facing EASES
  (turns desync); chore loops run out of phase; an optional `tempo` trait (brisk/ambler/dawdler)
  scales it so variation reads as PERSONALITY. *Why:* synchronised motion (a unison pivot/march) is
  the "creepy clockwork" tell that instantly breaks "these are people." *Check:* [EYE] **NPCs never
  pivot or move in visible unison** — a crowd transition fans out. (Built in `NpcLife`; seeded per
  NPC so it's deterministic. Tuning: `standards.js NPC_LIFE`.)
- **ANIMALS / WILDLIFE / PETS** [all] [ENGINE FEATURE: ambient critter movers + art] — dogs, cats,
  chickens, birds crossing, livestock penned. *Why:* motion at the edges = a living place.
  Ties to **PETS-DESIGN**. *Check:* [EYE] ambient creatures present. *(art: flag — see asset policy.)*
- **AMBIENT MOTION** [all] [partly ENGINE FEATURE] — chimney smoke, laundry on lines, flowing
  water, swaying foliage, lantern flicker. *Why:* a still town is a photo; motion is life. *Check:*
  [EYE] ≥3 sources of ambient motion. *Engine note:* particle/tween emitters (smoke/flicker) are a
  small additive; swaying foliage is a shader/tween pass (flag).
- **SOUND POCKETS** [all] [ENGINE FEATURE: positional audio states] — market din vs quiet lane vs
  birdsong at the edge. *Why:* spatial audio is half of "place." Ties to the audio-system spec
  (GAPS-AND-DEPTH §6). *Check:* [EYE] the soundscape changes as you move.
- **WORLD CHANGES OVER TIME** [all] [FREE NOW data] — the time-skip transformation + small ongoing
  changes (cross-ref GAPS-AND-DEPTH §9). *Check:* = that doc's gates.

### PILLAR 3 — VARIETY & STORYTELLING
- **WEALTH GRADIENT** [town]/[city]; [hamlet]=modest only [FREE NOW] — a settlement spans **rich →
  poor**: mansions / a fancy quarter → modest homes → run-down shacks / slums. *Why:* the
  **contrast** is what makes a place feel real and, at city scale, BIG. *Check:* [EYE] you can point
  to the rich part and the poor part. [OBJECTIVE] (→verify.mjs): ≥3 building "tiers" (size/state)
  present in a town/city.
- **BUILDINGS HINT AT OCCUPANTS** [all] [FREE NOW] — each building's size/state/props say who
  lives/works there (smith's anvil + soot, healer's herbs, drunk's bottles). *Why:* environmental
  character without a word. *Check:* [EYE] you can guess the occupant from outside.
- **EDGE VARIETY** [all] [FREE NOW] — boundaries VARY (cliff, river, sea, dense wood, farmland, town
  wall) — **never the same treeline everywhere** — and each hints the biome beyond (= gate C depth
  band + gate H). *Why:* repeated edges read as a tileset, not a world. *Check:* [EYE] + [OBJECTIVE]:
  ≥2 distinct edge types per region.
- **WEAR + AGE** [all] [FREE NOW] — cracks, repairs, patches, overgrowth, weathering; nothing
  pristine-uniform; age tells history. *Why:* uniformity = a kit; wear = a past. *Check:* [EYE] no
  two same-type buildings look factory-identical (vary tint/props/state).
- **A SECRET OR TWO** [all] [FREE NOW] — off the beaten path in every settlement (= gate J + the
  traversal doc). *Check:* = gate J (≥3 region-wide; ≥1 in each settlement).

### PILLAR 4 — SCALE (define each tier explicitly)
- **HAMLET** [hamlet] [FREE NOW] — ONE node, a handful of homes, a farm/working edge, **modest
  only**. *(Greenhollow v3 is the reference.)*
- **TOWN** [town] [FREE NOW] — **2–3 distinct districts**, a market/square, services (inn, shop,
  smith, temple), a **mix of wealth**. *Check:* [EYE] districts you could name + the full services.
- **CITY** [city] [mostly FREE NOW; verticality = ENGINE] — **defensive walls + gates**, multiple
  **QUARTERS** of distinct character, an explicit **rich-quarter vs slums/lower-town** split, a
  **market crush**, civic landmarks. *Check:* [EYE] it reads BIG + stratified; [OBJECTIVE]: ≥3
  quarters, a wall+gate, ≥3 wealth tiers.
- **VERTICALITY** [city] [ENGINE FEATURE: elevation] — upper-town / lower-town, stairs, bridges,
  terraces; **scale expressed in HEIGHT, not just footprint.** *Engine note:* needs walkable
  elevation + multi-level occlusion (= gate F "NEEDS ENGINE"; cross-ref the traversal doc). *Check:*
  [EYE] the city has *levels*.
- **DENSITY GRADIENT** [all] [FREE NOW] — built density + footfall + detail **rise toward the
  centre**, thin toward the edges. *Why:* a flat density reads as wallpaper. *Check:* [EYE] the core
  is busy, the margins quiet; [OBJECTIVE] proxy: prop/building density per zone decreases outward.

### HOW TO BUILD A SETTLEMENT (the checklist a region session runs)
1. **Pick the scale** (hamlet / town / city) → set the district + wealth + verticality ambition.
2. **Place the node(s)** off-centre (well/square/crossroads).
3. **Carve districts** with **diegetic barriers** (fence/hedge/wall/water/level).
4. **Lay the route hierarchy** (plaza → road → lane → desire-path).
5. **Set the wealth gradient** (rich quarter → modest → poor) + make buildings hint at occupants.
6. **Bound the edges with VARIETY** (different barrier per edge; hint the biome beyond — gate C).
7. **Seed life** (routines/chores/animals/ambient motion — Pillar 2) **+ secrets** (gate J).
8. **Self-check the gates** (A0–K + these four pillars): [OBJECTIVE] with proof, [EYE] to Van.

> PROPOSED SSOT ids (LIST ONLY — not added): per-NPC `schedule` tables + `chore` anim tags; a
> `district` tag on world data; building-tier tags (`tier_rich/modest/poor`). Added at build time.

### BUILD-ORDER (shared with docs/TRAVERSAL-EXPLORATION-DESIGN.md — captures don't block regions)
(1) this capture; (2) a small Greenhollow nudge — big-head modifier **defaults OFF** (bug),
**depth-sort fix** for the prop-occlusion clip (bug), **divider hedges/fences** between districts,
a little hand-placed life [FREE NOW]; (3) **NPC-LIFE as a REUSABLE system** (schedules + chore loops
+ ambient animals — built once, inherited by every region); (4) cut/lift interactable bushes;
(5) traversal mechanics per the engine-prereqs; (6) take **Ashen Marsh** to the full bar = the first
proof the whole rule-set travels. Heavy engine items (jump/height/water) = their own scoped sessions.

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

### REGRESSION RULE (no backsliding)
- Breaking an EXISTING test suite BLOCKS the change — full stop. `scripts/verify.mjs`
  (run via `npm run verify` + the git pre-commit hook) fails the commit if any suite
  fails or any id/asset/storage rule is violated. Don't "fix" a red suite by deleting
  its assertion; fix the cause.
- EVERY bug found gets a TEST that reproduces it, added BEFORE/WITH the fix, so it can
  never silently return. Bugs become permanent guardrails.
- The SSOT + verify orphan-check exist so a typo'd/renamed/orphaned id is a build
  error, not a quest that silently stops firing.

### SAVE VERSIONING (a playthrough is sacred)
- Every persisted blob carries a schema version (`serialize()` writes `v`). When the
  schema changes, BUMP the version and MIGRATE old saves forward in `hydrate()` —
  never read an old save in a way that throws or loses progress.
- A save must survive an update: load an old-version save → migrate → play on. Test
  the migration (a fixture of the old shape that hydrates cleanly). Losing a player's
  run to a schema change is a SHIP-blocking failure (Gate K: no lost progress).

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
- COMBAT PLACEMENT RULE (act-gating): NO combat enemies in the CHILDHOOD act (M1–M6) — the player
  is a CHILD doing chores; the tone is wholesome/discovery, not danger. REAL combat begins AFTER the
  catastrophe + time-skip, in the first ADULT region (ASHEN MARSH, M8+). The Greenhollow slice's
  charger is a DEV TEST only (flagged in code) — it is NOT childhood canon and must not ship in
  Greenhollow. Region scenes that are childhood-era render NPCs/quests/exploration but never enemies.
- SAFE ZONES RULE (settlements are peaceful): combat enemies do NOT spawn in VILLAGES/HUBS/TOWNS —
  monsters belong in the WILDERNESS, DUNGEONS, and region wilds, never in a settlement. Implemented
  as region config: `combat.safeZone:true` (a whole peaceful region — e.g. Greenhollow village; the
  dev-test charger is dev-only, spawned by a key, not in normal play) and `combat.safe:{tx,ty,r}` (a
  peaceful HUB inside a combat region — e.g. Mirefen in the marsh, the miners' town in the peaks: no
  enemy aggros or wanders into it). Standing in a settlement must be safe.
- THREAT INDICATORS / ENEMY INTUITION: on-screen threat indicators (targeting chevrons/arrows) are
  OFF by default for a clean screen (enemy TELEGRAPHS still always show — Gate E). They are a toggle
  in the options menu, and the always-on + enhanced version is gated behind the ENEMY INTUITION skill
  (Rogue/Social perception branch — senses nearby threats, clarifies tells). Default play reads the
  enemy + its telegraph; the skill/toggle adds the indicator layer.
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
