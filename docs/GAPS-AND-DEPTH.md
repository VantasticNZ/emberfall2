# GAPS, DEPTH & POLISH — the "good design → great game" register (design capture)

A tracked design-intent register for the depth/polish layer that turns a working systems game
into a *great* one. **CAPTURE ONLY — no engine/scene/quest/SSOT code this session.** None of this
blocks region work; it's the quality/feel/depth backlog with honest build-cost tags.

For every item: **rule · why · build-cost tags** — `[FREE NOW]` (data/arrangement on the current
engine) vs `[ENGINE FEATURE]` (needs a new engine/render capability — one-line note). Where an item
should be a quality gate, it's flagged as a PROPOSED Part 2.6 / `verify.mjs` check (described, not
built). Proposed SSOT ids are LISTED, never added.

---

## SCOPE NOTE (correcting the record — read first)
The playable path is **40+ quests**: the main spine **M1–M20**, region side sets (**SG/SP/ST/SA/SE**),
**PH1–PH6**, the **CAM/EDG/GAG** cameo layer, and **5 endings + ET1–ET12** epilogue twists — all
already authored as DATA. **A ~30-hour playthrough is SUPPORTED and is the TARGET. Do not shrink it.**

The only real caveat is **build-runway for a solo dev** — so define a finishable proof-point en route:

> **POLISHED MILESTONE TARGET** = **Greenhollow + Ashen Marsh + the first shard**, taken fully to the
> Part 2.6 Spatial bar **with tuned, great-feeling combat**. A shippable, self-contained vertical
> slice that proves the whole loop (childhood → catastrophe → first adult region → first shard →
> a moral fork) at final quality.

This is **sequencing insurance, not a scope cut** — the full 30h game remains the goal; the milestone
is the first thing that's *done-done* and could be shown/shipped while the rest is built.

---

## 1. CORE GAME-FEEL / JUICE  *(highest-leverage work — do this next)*
- **Rule:** the build so far is systems + DATA; **"fun" lives in feel** — hit-feedback weight, dodge
  timing, telegraph readability, loot snap/pickup pop, screen-shake/hit-pause balance.
- **Why:** a player judges the game in the first fight, by *hand-feel*, not by the quest graph. No
  amount of content rescues a mushy hit. This is the single highest-leverage session available.
- **Recommendation:** the **NEXT build session is a JUICE PASS on Marsh's first fight** — tune
  `standards.js COMBAT` (hit-pause frames, shake, knockback, flash, dodge i-frames/cooldown, telegraph
  lead-time) until it feels *great in-hand*, **before** more content. Hand the feel to Van to play-judge
  (HARD RULE 9). `[FREE NOW]` (tuning + the existing juice layer: shake/flash/sfx/knockback already
  exist; this is calibration, not new systems).

## 2. PROGRESSION — XP · LEVELS · SKILL TREE  *(the biggest design gap)*
- **Rule:** a real, motivating tree, not just bigger numbers. **XP sources** (kills small, quests
  medium, discovery/secrets a trickle, bosses big); a **level-pacing curve matched to region
  difficulty**; and a deliberate mix of **(a) stat/number gains** and **(b) NEW ABILITIES that change
  HOW you play** ("cool and useful in different ways" — a parry-counter, a charge-dash, a lure, a
  short blink, an AoE, a life-steal, a slow-time on perfect-dodge).
- **Why:** progression is the spine of a 30h RPG's motivation; "+2 STR" doesn't pull a player forward —
  *a new verb* does. Difficulty must rise by region so story-pace play is viable BUT **grinding /
  side-quests give a deliberate EDGE** — that's the intended power valve, not an exploit.
- **Hooks (exist):** `Inventory.skills{}` + `learnSkill/hasSkill/skillPoints`; **books-teach-skills**
  (`Economy.learnBook`); the SYSTEMS-DESIGN-V2 skill branches (Warrior/Rogue-Social/Mage/Wisdom).
- **Tags:** the **design + the stat/number gains + most ability *flags*** are `[FREE NOW]` (data on
  existing skill hooks). Specific abilities that need new mechanics (blink/teleport, slow-time,
  AoE-with-new-collision) are `[ENGINE FEATURE]` per ability — tag each at build. An **XP/level curve
  + a level-up + a tree UI** are new but small-medium `[FREE NOW]`-ish data/UI work.
- **Proposed gate:** difficulty-vs-level pacing table per region (a balance doc), checkable that
  region N's monster stats sit in the intended band for the expected level.

## 3. EARNED / DIEGETIC UNLOCKS  *(not free menu options)*
- **Rule:** modifiers (big-head etc.) and QoL skills are **EARNED, then BOUGHT** — never default-on.
  Meet a big-head NPC → it unlocks *for purchase*; the full silly-modifier suite unlocks **after a
  playthrough**. The **see-quest-givers** skill is the template (the lazy-quest-guy *teaches* it, but
  you still **buy** it — the choice is preserved). **NEW:** a purchasable **Charisma/Insight perception
  skill** that **tints dialogue options red/green** (bad/good outcome hint) — social perception as a
  *build choice*, wired to the existing **Social** system (`Social.state`/`tag` already classify
  options; the tint is a render of that).
- **Why:** discovery + cost makes a feature feel *earned*; a menu of toggles feels like cheats. It also
  rewards exploration and money.
- **Hooks (exist):** `ModifierRegistry` (big_head…); `skill_see_markers` flag; the Social option
  classifier. **Tags:** `[FREE NOW]` (data: an unlock flag + a shop entry + the existing modifier/skill
  machinery; the red/green tint is a small additive render on Social's existing state).

## 4. ONBOARDING / FIRST 30 MIN  *(childhood)*  — MARKER-FREE EARLY (resequenced 2026-06-07)
- **Rule:** **~10 min of soft, built-in teaching** — move / talk / interact woven *into the story*
  (Mara calls you down, Bram's at the forge, fetch the eggs), **not a tutorial wall** — then real
  kid-story, early decisions, and play; **childhood ≈ 30 minutes** total. **First combat stays gated to
  Marsh** (no combat in childhood, per the existing rule).
- **NO QUEST-MARKERS EARLY (the resequence):** early childhood deliberately runs **WITHOUT** the "?"
  marker sight — it's *find-your-own-way*, which fits the soft onboarding and makes the world feel
  discovered, not signposted. The teaching is carried **entirely by named NPCs in story context**, not
  by markers:
  - **M1 "A Greenhollow Morning"** IS the tutorial — *wake (move)* → *find Bram at the forge (navigate
    + interact)* → *greet around the square (talk)*. No marker needed; the story tells you where to go.
  - **M2 Chores** (eggs / water the saplings / catch the hen) reinforces move + interact through play.
  - M3–M5 add the early decisions. None of M1–M6 depend on markers (verified: they're NPC-given; the
    Pem hunt uses a separate `pem_clue_*` flag, not the marker skill).
- **Markers arrive LATE, as a DISCOVERED REWARD:** **FATLEY** (the sitting lazy-guy, met in **late
  childhood**, ~M5) gives the made-up mug quest; completing it **opens the OPTION** to acquire marker
  sight (a skill point — **buyable/learnable, the player chooses**; never force-granted). So the player
  has already learned to navigate by *story + landmarks* before markers are even offered — markers
  become a convenience you *earn + opt into*, not a crutch you start with. See
  **PERSONALISATION-DESIGN.md §6.5** + **STORY-AND-QUESTS** (marker onboarding) + **QUESTS-SIDE-FLESH G1**.
- **Why:** the opening 30 minutes decide whether a player stays; teaching by doing (Zelda/Ocarina
  Kokiri-forest model) respects them and sets tone. Marker-free early = the world reads *explored*, and
  the late opt-in keeps player agency (and characterises Fazy Lastard).
- **Tags:** `[FREE NOW]` (quest/dialogue DATA + placement; the systems all exist). *(Build note: this
  resequences SG1 from the act-2 hub to late act-1 + makes its reward opt-in — the side-quest test will
  need updating; see QUESTS-SIDE-FLESH G1.)*

## 5. SAVE SYSTEM  *(decided: crystals, no autosave)*
- **Rule:** **NO autosave.** Save via **CRYSTALS** — occasionally found, mostly **earned or bought** (a
  managed resource that raises stakes and suits permanent moral choices).
- **Open question (flag for Van):** do permanent moral decisions **save raw** (over-slot, can't undo —
  leaning this; it matches the game's soul) **vs** a protective slot? — Van's later call.
- **Why:** a scarce save resource makes choices weigh; it's tonally right for a karma game where the
  world remembers.
- **HONEST CURRENT STATE:** per-system `serialize()/hydrate()/save()/load()` primitives EXIST
  (Inventory, Karma w/ `SAVE_VERSION = 1`, TimeOfDay, QuestEngine) — BUT the **live game runs on
  volatile `memoryStorage()`**, so **nothing actually persists across sessions today**, and there is
  **no unified game-save** (one slot bundling all systems), **no crystal resource**, and **no
  load-on-boot**. **Tag: `[ENGINE FEATURE]`** — save/load robustness is **load-bearing for a 30h game**:
  needs a unified SaveManager (collect every system's serialize into one slot, real persistent
  storage, version-migrate per the Save-Versioning rule, a crystal-gated save flow, and a load-game
  boot path). Build this before the world gets long enough to lose progress in.

## 6. AUDIO AS A SYSTEM  *(Van: "the soul")*
- **Rule:** not just files — a SYSTEM: **tension STATES** (safe / explore / combat / dread) with
  **smooth transitions**; **scripted STINGS** tied to specific encounters (the eternal-frog 3-beat gag:
  shark-"dun-nun" on approach → comic deflation [it's a frog] → dread [it's *unkillable*]; the slasher
  "dun dun dunnn"; rival appearances; cameo reveals); **LEITMOTIFS** for key places/characters; an
  **Ocarina-grade memorable overworld theme** as the aspiration.
- **Why:** music is the cheapest route to emotion + memory; the stinger gags are *written into* the
  comedy and need audio to land.
- **Free-first:** crawl/download **licence-clean CC0** audio (Kenney, **Sonniss GameAudioGDC**, OGA,
  **Freesound-CC0**) to build a working palette **before any composer spend** (per the binding asset
  policy). **Tags:** the **palette + the stinger triggers (data hooks on encounters)** are `[FREE NOW]`;
  the **music-state manager** (cross-fading layers, state machine, ducking under stings) is a small
  contained `[ENGINE FEATURE]`.

## 7. VOICE / TTS  *(decided: synthetic, not human VA)*
- **Rule:** a player **VOICE ON/OFF** toggle + a funny, cheeky **NARRATOR** track (the highest-value
  voice to do FIRST — one voice, big personality, ties the world together). **Do NOT voice NPCs until
  the script is FROZEN** (every line edit = a regenerate).
- **Why:** a single strong narrator is huge bang-for-buck and survives script churn (it's commentary,
  not per-line NPC barks); doing NPCs early would mean endless re-gen as lines change.
- **Now (free, local, commercial-safe TTS):** **Piper** (MIT, CPU — easy narrator test), **Kokoro**
  (Apache), **Chatterbox-Turbo** (MIT, voice-clone, runs on the RTX 4060), **CosyVoice2** (already in
  NEXUS). **BANNED (non-commercial weights):** **XTTS v2, F5-TTS, Fish Audio weights** — do NOT use.
  **Paid tiers** (Fish Audio S2 / Inworld ~$15/1M; ElevenLabs Starter $5/mo → Creator $22/mo, commercial
  licence on PAID only) to be vetted into `docs/ASSET-SOURCING-TIERS.md` later. **Tag: `[FREE NOW]`**
  (local TTS render of the narrator script to audio clips, played by the audio system §6).

## 8. NPC SCHEDULES + DAY/NIGHT
- **Rule:** NPCs follow **daily routines** (work by day, home/tavern at night) on the existing
  **TimeOfDay** phases; plus **SMOOTH dusk/dawn transitions** — a gradual colour/light **lerp** between
  phase tints (warm low-angle dawn/dusk), not a hard cut.
- **Why:** schedules disproportionately sell "lived-in" for cheap; a smooth golden-hour lerp is the
  difference between "a clock" and "a world breathing."
- **HONEST STATE:** `TimeOfDay` phases + phase-change callbacks EXIST and the HUD shows the phase; but
  there are **NO phase colour tints** and no world-tint render today. **Tags:** **schedules** (NPCs walk
  a per-phase waypoint, swap home/work positions on `onPhaseChange`) = `[FREE NOW]` (data + a small
  mover); the **smooth tint lerp** = a small contained `[ENGINE FEATURE]` (per-phase tint values + a
  camera/scene colour-overlay lerped over the phase boundary).

## 9. LIVING WORLD — TIME-SKIP + ONGOING CHANGE
- **(a) TIME-SKIP:** **ONLY childhood-accessible areas transform** (the first town + its surrounds) —
  you can't feel a place change that you never saw young. A **per-region checklist keyed to the
  time-skip flag**: an NPC who's *transitioned and lives as herself*; someone now *bearded/aged*; a
  *sapling → tree*; a *tree → stump*; a building *new / upgraded / derelict*.
- **(b) ONGOING during-play:** a FEW visible changes — a house **going up over several visits**, a
  forestry stand **being cleared** — keyed to **progress flags**, light, "the world lives without me."
- **Why:** a world that visibly remembers and moves on is the deepest "it's alive" payoff; gating it to
  seen-young keeps it *felt*, not abstract.
- **Tags:** `[FREE NOW]` — **alternate region DATA** (a post-skip variant of the props/NPCs) selected by
  the **`time_skip`** flag, and incremental prop swaps keyed to progress deeds. No engine change.

## 10. THE TRICKSTER WIZARD  *(new quest)*
- **Rule:** **moving geography played as INTENTIONAL, never a bug** — a cave-mouth / door / path isn't
  where it was; the player doubts themselves. **CRITICAL SAFEGUARD:** every displacement leaves his
  **CALLING CARD** (varied each time — sparkles / a tiny sign flipping you off / a floating top-hat /
  glitter spelling "nope") so the player **always blames HIM, not the game.** He **shakes you down for
  coin** on each appearance (the economy hook = a *real motive to hunt him*). A **CLUE-TRAIL** leads to
  his lair, where there are **FOUR morality-distinct ways to stop him for good**, each a different deed
  + world-state echo:
  - **merciful / clever** — out-trick him; he yields laughing (maybe a later quirky ally). `wizard_outwitted`
  - **lawful / just** — bind/banish him by the rules. `wizard_bound`
  - **ruthless** — destroy him; fast, **costs Morality**, the world loses his colour. `wizard_destroyed`
  - **bargain / coward** — pay him off; he leaves *YOU* alone but preys on others — quietly damning. `wizard_bargained`
  Feeds the ending-gates like everything else.
- **Why:** it turns the one thing that *would* feel like a bug (geometry moving) into signature comedy +
  a four-way moral fork — pure Emberfall.
- **DESIGN CONSTRAINT (binding):** it must always read as **"the world is being messed with," never
  "the game is broken"** — the calling card is non-negotiable on every displacement.
- **Tags:** the quest, clue-trail, shakedown, and four resolutions are `[FREE NOW]` (DATA + deeds +
  the calling-card FX). **Moving geography** needs a small `[ENGINE FEATURE]`: **swappable scene exits /
  prop positions keyed to a flag** (RegionScene can already place props by data; this is "re-place this
  exit/cave when `wizard_moved_X` is set" — a contained additive).

## 11. ACCESSIBILITY & DIFFICULTY
- **Rule:** difficulty options; an **ease-combat option** for story/morality-focused players (the karma
  story is the point — let people reach it); **text size**; **colourblind-safe telegraphs** (shape +
  colour, not colour alone).
- **Why:** far cheaper to design in now than retrofit; widens who can finish the story; the telegraph
  system already exists to make colourblind-safe.
- **Tags:** difficulty scalars + text size = `[FREE NOW]` (read existing `standards.js` tunables /
  options); colourblind telegraph variants = `[FREE NOW]` (shape cues on the existing telegraph layer);
  a full options-accessibility panel UI = small `[ENGINE FEATURE]` (extend OptionsScene).
- **Proposed gate:** telegraphs must encode threat by **shape, not colour alone** (Part 2.5 readability
  extension) — checkable by review.

## 12. PERFORMANCE BUDGET  *(binding coding-discipline rule)*
- **Rule:** 2D Phaser on an RTX 4060 / i5-14400F / 32GB target is **massively over-spec — there is NO
  hardware concern for RUNNING it.** "Runs smoothly" is a **CODING-DISCIPLINE** rule, not a hardware
  one: **sprite culling**, **object POOLING** (thrown objects, FX, particles, projectiles), watch
  **draw-calls / texture memory**, don't leak tweens/timers.
- **Why:** a 2D game *should* run flawlessly; any jank is sloppy code, not the machine — so the bar is
  "zero avoidable jank."
- **Tag:** `[FREE NOW]` (discipline). **Every visual/interactable session respects this budget** — pool
  the interactable/thrown-object spawns (§INTERACTABLES), cull off-camera, reuse graphics.

## 13. DEPLOYMENT  *(decided/clarified)*
- **Rule:** single-player, **solo-per-browser**. Hosting many simultaneous players = serving a **STATIC
  site** — each player runs **entirely client-side** (their save / karma / world LOCAL) — so "concurrent
  players" **does not load Van's PC or the game logic**; only file-bandwidth scales, handled by a static
  host (**Vercel / Netlify / Cloudflare Pages**), never Van's PC. **Binding design rule:** keep saves
  **LOCAL**, keep the build **STATIC-HOSTABLE**, so it deploys to the world unchanged.
- **Why:** it makes "ship to everyone" free and trivial, and keeps the architecture honest (no
  accidental server dependency creeping in).
- **Out of scope:** server-side features (cloud saves / leaderboards / accounts) = a *separate* backend,
  later. **NOT multiplayer.** **Tag:** `[FREE NOW]` (already a static Vite build; the rule is "don't
  break it" — e.g. the storage adapter stays the only persistence path).

---

## BUILD-ORDER RECOMMENDATION (captures don't block region work)
1. **GAME-FEEL / JUICE pass on Marsh's first fight (§1)** — the highest-leverage next session; tune
   until it feels great in-hand, Van play-judges.
2. **Wire the Part 2.6 objective gates into `verify.mjs`** (the A-proxy / B-straight-run / C-spill /
   D-seam / E-variety / J-secret / K-interactable checks) so the spatial bar is automated.
3. **Flesh the SKILL TREE (§2)** — XP + level curve + the ability set (the progression spine).
4. **Take Ashen Marsh to the Part 2.6 bar** (the milestone region #2).
5. **Save/crystal SaveManager (§5)** before the playable path gets long enough to lose progress.
6. **Audio system (§6) + narrator TTS (§7), living-world (§8–9), the Trickster Wizard (§10),
   accessibility (§11)** — slot in as their dependencies allow.

> The **POLISHED MILESTONE TARGET** (Greenhollow + Marsh + first shard, to the Part 2.6 bar with tuned
> combat) is the first "done-done, shippable" checkpoint — steps 1–5 above are exactly its critical path.

---

## PROPOSED SSOT IDS (LIST ONLY — do NOT add to `src/constants/` this session)
- **progression:** an XP/level field on Inventory (state, not an id); ability skill ids
  (`skill_parry_counter`, `skill_charge_dash`, `skill_blink`, `skill_aoe`, `skill_lifesteal`,
  `skill_slowtime` …) — most fold under the existing SKILLS flag space.
- **earned unlocks:** `unlock_bighead`, `unlock_modifier_suite`, `skill_social_sight` (the red/green
  dialogue-tint perception skill).
- **save:** a crystal item (`save_crystal`) + a `SaveManager` slot format (not an SSOT id — a system).
- **living world:** `time_skip` (the transform flag), per-change deeds (`house_built_*`,
  `stand_cleared_*`, `npc_transitioned_*`).
- **trickster wizard:** `wizard_met`, `wizard_moved_*` (per displacement), `wizard_outwitted`,
  `wizard_bound`, `wizard_destroyed`, `wizard_bargained`.
- **audio/voice:** no SSOT ids (clips + a state machine + a voice toggle option).

> Cross-refs: Part 2.6 Spatial DoD + the binding ASSET POLICY (QUALITY-BIBLE); the interactable
> playground (`docs/INTERACTABLES-DESIGN.md`); `docs/ASSET-SOURCING-TIERS.md` (to be created for the
> paid-tier TTS/audio/art vetting).
