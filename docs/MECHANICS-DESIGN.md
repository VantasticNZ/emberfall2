# MECHANICS DESIGN — the core loop + progression model (design hierarchy level 3b)

> **GAME-BUILD-PLAYBOOK v2 §1 level 3b** — locked here so combat content + encounters across the
> world have a spine to hang on. **Design only.** Reconciles with what already exists (combat engine,
> tool-DAG, karma/endings, economy) and FLAGS — never overrides — anything that changes existing data.
> Cross-refs: `gating.js` (the tool DAG), `STORY-AND-QUESTS.md` (the M1–M20 spine + 3 acts),
> `EXCELLENCE-FRAMEWORK.md` (the emotional arc), `Combat.js`/`Monsters.js`/`EnemyController.js` (the
> engine), `Karma.js` + `constants/endings.js` (the 5 endings), `economy.js` (gold/gear).

## 0. THE PREMISE (what this game IS, so the mechanics serve it)
Emberfall 2 is a **~30hr story-driven action-RPG**: a wholesome-village childhood that curdles into
cosmic-horror truth, told through **karma + deed-memory** that pays off in **5 endings**, over a
**tool-gated Metroidvania world**. Therefore:

> **Combat is PUNCTUATION, not the point.** This is closer to *Zelda / Hollow Knight / Undertale*
> than *Diablo*. The pleasure loop is **explore → uncover a truth → make a weighted choice → gain
> reach → see the world react**. Fights are *designed encounters that gate or punctuate story beats*,
> NOT waves you grind. The honest combat-vs-exploration balance: **~70% exploration/story, ~30%
> combat**, and combat *intensity follows the emotional arc* (Act 1 ≈ none; Act 2 ramps region by
> region; Act 3 = the gauntlet). Any mechanic that pushes toward grind fights the vision and is cut.

---

## 1. THE CORE LOOP

**EXPLORE → ENCOUNTER → CHOICE/REWARD → GROW (reach) → UNLOCK → EXPLORE further** — wrapped in the
deed-memory that makes the world *remember*:

```
        ┌──────────────────────────────────────────────────────────┐
        │  EXPLORE a channelled, secret-strewn region (the 70%)      │
        │     ↓  find: a story beat · an NPC · a secret · an encounter│
        │  ENCOUNTER  →  a designed fight OR a moral/dialogue choice  │
        │     ↓                                                       │
        │  REWARD: loot/gold (→ gear) · a TRUTH (story) · a DEED      │
        │     ↓     (the world + future dialogue REMEMBER the deed)   │
        │  GROW: a TOOL (new reach + a combat trick) · better gear    │
        │     ↓                                                       │
        │  UNLOCK: the tool opens the next region / a teased cache    │
        └───────────────────────────→ EXPLORE further ───────────────┘
```

**Why it's satisfying to repeat:** four reinforcing hooks, none of them grind —
1. **Mystery pull** (the lie cracks a little more each region — the strongest hook).
2. **Metroidvania "new tool → new places"** (the see-but-can't-reach teases pay off; `gating.js TEASES`).
3. **Moral weight** (deed-memory: choices resurface — the kicked chicken returns at the Spire).
4. **Combat-as-puzzle** (each fight is "which counter does this enemy demand?", not a damage race).

The loop is **front-loaded with meaning, back-loaded with reflexes** — exactly the Act 1→3 ramp.

---

## 2. PROGRESSION MODEL — **"Reach + bounded gear, no XP grind."** (recommended + justified)

### The decision
Of the four growth axes (tool-gated ability · stats/leveling · skill tree · gear), **adopt two,
drop/repurpose two:**

| Axis | Verdict | Role |
|---|---|---|
| **Tool-gated capability** (the Metroidvania spine) | ✅ **PRIMARY** | The backbone. Each tool = new **reach** + a small **combat/utility verb**. Already the gating DAG. |
| **Gear** (gold → swords/armour) | ✅ **SECONDARY (bounded)** | The *only* vertical power axis, and it's capped (atk +3 → +15 across the whole game). Already wired. |
| **XP / leveling** | ❌ **DROP as a grind** → repurpose | NO earned XP. `level` becomes the **ACT number** (see [DECISION D1]). |
| **Deep stat/skill tree** | ❌ **DROP** → a few perks | A handful of **utility perks** (haggle/repair/monster-sense), not a combat tree ([D5]). |

### Why this is right for a 30hr narrative RPG
- **No grind, no number-bloat.** A story player should never have to farm slimes to be "strong
  enough" — that would gate the *story* behind *reflexes/time*, which is the cardinal sin here.
- **Power = capability, not stats.** Getting the grapple *feels* better than +2 STR and it advances
  the world. Horizontal growth (new verbs/places) suits exploration; vertical growth stays bounded
  (gear) so encounters can be *tuned* rather than out-scaled.
- **It's already 80% built** — tools (keys), gear (economy), the boss-trick. We're naming it +
  closing three contradictions, not building a new system.

### THE POWER CURVE across M1–M20 (mapped to the acts + the emotional arc)
| Beats | Region | Reach gained | Gear tier | Combat intensity |
|---|---|---|---|---|
| **M1–M5** | Greenhollow (childhood) | — (bare hands) | none → wooden sword | **~none** — tutorial taps; the village is a SAFE HUB |
| **M6–M7** | the Burning / return | — | wooden → steel | a single scripted scare |
| **M8–M10** | Ashen Marsh | **tool_lantern** (light + the Guardian's shroud-strip) + shard 1 | steel | **ramp starts** — teach charger/ranged/swarm; **Drowned Guardian** (lantern-trick) |
| **M11–M12** | Sundered Peaks | **tool_grapple** (pull + the Sentinel's shield-haul) + shard 2 | + peak_mail / crag_maul | adds brute/electric; **Keep Sentinel** (grapple-trick) |
| **M13–M14** | Tidewreck Coast | **tool_hookshot** (cross gaps) + shard 3 | + tideglass | adds ambusher (wreck) |
| **M15–M16** | Emberwood | **tool_firefrost** (elemental option) + shard 4 | + cinderhide/frost | elemental casters; **the M16 mercy climax** |
| **M17–M20** | Hollow Spire | all 4 tools required | top gear | **the gauntlet** — M18 "earlier enemies return harder", the over-hyped **M19 brutal boss** |

Power increase is therefore **4 tool-unlocks + 5 gear tiers + the boss-trick mastery** — a clean,
authored curve with **zero farming**. Difficulty is balanced by *encounter design*, not player level.

---

## 3. COMBAT DESIGN (the experience, not the engine)

**The engine is good and stays** (verified): dodge with i-frames (265ms), block (35% / shield-scaled),
**parry** (160ms → stagger), a 12-dmg/360ms attack, and **8 enemy archetypes + 2 phased bosses**, each
with a **telegraph → commit → punish-window** shape and a *specific counter* (`Monsters.js`). The gap
is **experience design**, in three parts:

### 3.1 Feel rules (mostly present — make them READABLE)
Every hit already has hit-freeze (5f/9f-kill), knockback (285px/s), screenshake, and SFX. The design
rule going forward: **every enemy must telegraph legibly and commit punishably.** Specifically —
- **Telegraph = a colour/animation tell the player can read in <0.3s** (wind-up pose + a tint).
- **Commit = the enemy is vulnerable in its punish-window** (already coded) — the fight is a rhythm of
  *read → evade → punish*, never a damage-race.
- **[DECISION D6 — "the unsatisfying slime"]:** the `charger_electric` (Galvanic Ooze) is
  `invulnerable` during its 2s charge — so a player who attacks it during the charge sees their hits
  *do nothing*, which reads as "broken/unsatisfying." **Fix (spec):** (a) a loud visual tell that it's
  invulnerable (crackling glow), and (b) a "**ping/clink**" feedback + zero hit-freeze when you strike
  an invulnerable enemy, so the player *learns* "wait for the window" instead of feeling cheated. This
  is the likely source of Van's "slime" complaint — a *readability* fix, not an engine change.

### 3.2 Difficulty curve — **teach one counter at a time, then combine**
> **[DECISION D4 — encounter pacing]:** today the Marsh spawns **all 7 archetypes at once** (no
> teaching curve), and Peaks repeats 6. **Recommend re-spacing** so each region *introduces* 2–3 NEW
> archetypes (an isolated encounter that teaches the counter) before combining them:
- **Marsh (intro):** charger (dodge-the-line), ranged (close/block), swarm (AoE) — the three basic
  counters, taught solo, then a mixed pocket. Boss combines them.
- **Peaks (build):** brute (punish the slam), electric (wait the window) + recombine Marsh's.
- **Coast:** ambusher (perception/first-hit) + recombine.
- **Emberwood:** caster (interrupt the channel) + elemental pressure.
- **Spire (test):** all of it, harder, + the M19 boss.

Each region's combat is a **hand-placed set of designed pockets** (2–3 enemies with a clear counter-
puzzle), NOT roaming waves. Density follows the encounter-zone plan in `MASTER-MAP`, not a spawner.

### 3.3 Enemy ecology by region (contextual reskins of the archetype set)
The archetype is the *mechanic*; the **skin is the biome** (`enemies.js` already does this). The rule:
**one shared archetype library, reskinned per region's ecology, introduced on the teaching curve.**
| Region | Ecology | Roster (archetype → skin) | Boss |
|---|---|---|---|
| **Ashen Marsh** | drowned bog | charger=Bog Serpent · ranged=Bog Watcher · swarm=Fen Bats · shielded=Gourd Revenant · brute=Mire Worm · caster=Drowned Wisp | **Drowned Guardian** (lantern-trick) |
| **Sundered Peaks** | cold stone | charger/brute/electric/ranged/shielded, cold-tinted | **Keep Sentinel** (grapple-trick) |
| **Tidewreck Coast** | wreck/tide | **ambusher** (in wreckage) + ranged/swarm | a tide/vault boss (hookshot-trick) |
| **Emberwood** | fire-fever | **caster**-heavy + electric (ember) | an elemental boss (firefrost-trick) |
| **Hollow Spire** | the binding | all, harder | **the M19 brutal boss** |
*(Coast/Emberwood/Spire rosters are not yet placed — a content task, design-noted here.)*

### 3.4 Karma × combat — **the corruption-vs-mercy principle** (this reconciles "mercy matters" with
"combat is mandatory")
> **[DECISION D3 — confirm]:** **Combat enemies are MANIFESTATIONS OF THE CORRUPTION** (the bog's
> drowned dead, the god's fever made monsters) — *killing them is cleansing, morally neutral-to-good,
> and never costs morality.* The **moral axis is reserved for PEOPLE and the GOD** — the M16 mercy
> choice, the Sela betrayal (M17), the childhood seeds. So a player fights freely *and* the karma
> system stays meaningful: you cleanse monsters with your blade and show **mercy** where it actually
> means something (a suffering god, not a slime).
- **Pacifism [DECISION D7]:** a *full* pacifist run is **out of scope** (the shard-dungeon bosses are
  mandatory story gates; enemies aren't sneak-avoidable without new engine work). But a **low-violence,
  merciful playstyle is honoured**: the **optional hunts stay optional** (`crag_beast_slain` etc. never
  required), and **mercy is expressed at the named story beats** (`mercy_shown` at M16 gates Saint /
  Liberator / Ashbearer). Recommend NOT adding a sneak/subdue system now — it's scope the vision
  doesn't need.

---

## 4. ECONOMY (minimal + purposeful)

**One job: feed the gear curve; one optional sink: prestige. No crafting.**
- **Gold sources:** loot (small — bushes 1–3g, barrels/crates; 55% of bushes drop nothing, by design
  — loot is flavour + a trickle, not a farm) + **jobs** (woodcut/fish/smith/deliver/bounty) + sells.
- **Gold sinks (in priority):**
  1. **Gear** — the bounded power axis (swords +3→+15, armour, shields, potions, lantern_oil). *This is
     what gold is FOR.*
  2. **Consumables** — potions (heal 30–80) + lantern_oil (early light-fuel sink).
  3. **Property** (greenhollow_house 1500g, saltbreak_shop 3500g) — an **optional prestige / gold-dump**
     end-game sink (passive rent = flavour), never required.
  4. **Books** — teach the few utility perks ([D5]).
- **Death penalty:** lose 15% gold (cap 200), respawn full HP — a *soft* stake, not a punishment that
  forces farming. Keep.
- **NO crafting tree.** The smith *job* teaches a skill (fine); a crafting system would add grind +
  inventory bookkeeping the narrative doesn't need. **Cut.**
- **Loot tables' purpose:** materials (timber/fish/iron_ore) feed jobs/sells; gold is a trickle toward
  the next gear tier. Tune so a region's loot ≈ one gear-tier upgrade by the time you finish it.

---

## 5. RECONCILIATION with existing systems + the [DECISION]s for Van

The model **serves** the tool-DAG and the karma/endings — it doesn't fight them. But it exposes
**contradictions in the current stubs** that need a call. Each is FLAGGED, not overridden:

| # | [DECISION] | The contradiction / why | Recommendation |
|---|---|---|---|
| **D1** | **`level` = ACT, not XP** | `level` gates content (bounty L≥3, house L≥5, shop L≥10) but is **NEVER earned** (no XP anywhere) → that content is **dead/unreachable**. | Make `level` the **act number (1–5)**, auto-advanced by main-quest milestones; remap the gates to acts (bounty=Act 2, house=Act 2-late, shop=Act 3). No grind; dead content opens with the story. *Touches `Inventory.level` semantics + `economy.js` gates — a data change, flagged.* |
| **D2** | **Tools: keys-only vs light verbs** | Tools currently only gate + unlock interactables + the boss-trick. The playbook imagined a "tool-gated moveset." | **Minimal expansion:** keep keys + boss-trick as the core; add a **single utility verb** per tool only where an encounter/puzzle uses it (grapple=pull a block/enemy; hookshot=cross; firefrost=an elemental hit option). Don't build a full moveset. *Scope call.* |
| **D3** | **Corruption-vs-mercy** | "Mercy matters" vs "combat mandatory" looks contradictory. | Confirm the principle (§3.4): **monsters = guilt-free cleansing; morality = people + the god.** *Design principle to ratify.* |
| **D4** | **Encounter pacing** | Marsh spawns all 7 archetypes at once — no teaching curve. | Re-space: 2–3 NEW archetypes per region, taught then combined (§3.2). *Content-placement change to Marsh/Peaks enemy data — flagged, not done.* |
| **D5** | **Trim the stat/skill stub** | `str/dex/con/int` are unused; skills (`hasSkill`) aren't wired into anything. | Keep **cha** (social/prices) + **wis** (perception/secrets/ambusher) as the two that matter; keep a few **utility perks** (haggle/repair/monster-sense) via books/quests; **drop str/dex/con/int as combat stats** (fold any power into gear) or leave as pure dialogue flavour. *Trims the stub.* |
| **D6** | **The "slime" readability fix** | `charger_electric` invuln-charge reads as "my hits do nothing." | Add a clear invuln telegraph + a "ping" no-damage feedback (§3.1). *Combat-feel spec.* |
| **D7** | **Pacifist scope** | mercy gates 3 endings but you can't avoid fights. | Full pacifism **out of scope**; low-violence honoured via optional-hunts-stay-optional + M16 mercy (§3.4). *Scope call.* |

**No hard contradiction with `gating.js` or the endings:** the endings are **deed/karma-gated, never
power-gated** (you never need to grind to reach an ending — good, keep it that way). The Hollow Spire's
"4 tools + 4 shards" requirement is a *progression* gate (the climax), not a *combat-power* gate — fine.

---

## ✅ SUMMARY (the spine to build combat content on)
- **Core loop:** explore → encounter (fight *or* choice) → reward (loot/truth/deed) → grow (tool/gear)
  → unlock → explore. ~70% exploration-story / ~30% combat; intensity follows the Act 1→3 arc.
- **Progression:** **reach (tools) + bounded gear, NO XP grind**; `level` repurposed as the act. Power
  = 4 tools + 5 gear tiers + boss-trick mastery, tuned by encounter design.
- **Combat:** keep the rich engine; design *legible, one-counter-at-a-time, hand-placed* encounters;
  fix the electric-ooze readability; corruption = guilt-free, mercy = people/god.
- **Economy:** gold → gear (bounded) + optional prestige; no crafting; loot is a trickle.
- **7 [DECISION]s** above need Van's call (esp. D1 level-as-act, D3 the mercy principle, D4 pacing).
