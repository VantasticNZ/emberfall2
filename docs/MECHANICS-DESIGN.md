# MECHANICS DESIGN — the core loop + progression model (design hierarchy level 3b) — **RATIFIED v2**

> **GAME-BUILD-PLAYBOOK v2 §1 level 3b** — locked here so combat content + encounters across the
> world have a spine to hang on. **Design doc.** Cross-refs: `gating.js` (the tool DAG),
> `STORY-AND-QUESTS.md` (the M1–M20 spine + 3 acts), `EXCELLENCE-FRAMEWORK.md` (the emotional arc),
> `Combat.js`/`Monsters.js`/`EnemyController.js` (the engine), `Karma.js` + `constants/endings.js`
> (the 5 endings), `economy.js` (gold/gear).
>
> **✅ RATIFIED (2026-06-09) — Van chose the ZELDA-STYLE model:** growth = **tool-unlocks + hearts +
> bounded gear**, with **NO XP, NO stats (STR/DEX/CON/INT/CHA), NO skill tree**; difficulty is
> **hand-PLACED per region** (never auto-scaling — so you genuinely feel stronger and early areas feel
> easy on return); **level = the story ACT**; **magic = acquirable spell-ITEMS** gated by the MP bar;
> **morality deepened Fable-style** (people/greed/cruelty vs mercy/fairness) with the **talking
> good-monster** as the rule-proving exception. The dead level-gated content (bounty/house/shop) is
> **FIXED in code** (now act-gated, reachable as the story advances — see §5/D1). Sections below carry
> the [RATIFIED] decisions; retired code stubs are flagged at the end.

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

## 2. PROGRESSION MODEL — **ZELDA-STYLE: tools + hearts + bounded gear. NO XP/stats/skills.** [RATIFIED]

### The model (ratified)
Growth is **horizontal capability + a little bounded vertical power**, exactly like a Zelda game —
never a stat sheet:

| Axis | [RATIFIED] | Role |
|---|---|---|
| **Tool-unlocks** (the Metroidvania spine) | ✅ **PRIMARY** | Each tool = a **traverse ability + a combat verb** (e.g. *grapple* = reach across a gap **and** in combat yanks/**stuns** an enemy for a small punish + slight damage). The backbone of feeling more capable. Already the `gating.js` DAG. |
| **Hearts / max life** | ✅ **the survivability axis** | Found/earned **heart-pieces** raise max HP (Zelda hearts), placed as exploration/quest rewards — *not* an HP stat that scales with a level. Survivability grows by *exploring*, not grinding. |
| **Gear tiers** (gold → sword/armour) | ✅ **bounded vertical power** | The only damage/defence axis, and it's **capped** (atk +3 → +15 across the whole game; armour +2 → +6). Buy from shops that open by Act. Already wired. |
| **Magic = spell-ITEMS** | ✅ **reserved, MP-gated** | Acquirable spell items/tools (Zelda-style, *not* stat-scaled), spent from the **existing MP bar**. See §2.3. |
| **XP / leveling** | ❌ **REMOVED** | No earned XP anywhere. `level` is repurposed as the **story ACT** (§2.2, D1 — fixed in code). |
| **Stats (STR/DEX/CON/INT/CHA)** | ❌ **REMOVED** | Not a Zelda mechanic; they were unused stubs. Combat power lives in *gear + tools*, survivability in *hearts*. **Retire the stubs** (§ end). |
| **Skill tree** | ❌ **REMOVED** | No perk/skill tree. The few "book" abilities fold into tools/quests or are cut. |

**Why (ratified rationale):** a 30hr *story* RPG must never gate the narrative behind *grind* — power
is **capability you find** (a new tool, a new heart, a better blade), so the world stays the reward.
And because difficulty is **placed, not scaled** (§2.1), every tool/heart/blade makes you *feel*
permanently stronger — returning to the Marsh as a Spire-era hero should feel *powerful*, which only
works if early enemies stay weak.

### 2.1 DIFFICULTY = PLACED PER-REGION, never auto-scaling [RATIFIED]
Enemy strength is **authored into each region's encounter data** and **fixed** — early regions hold
**weaker, slower, simpler** enemies; later regions hold **stronger, faster, trickier** ones; bosses
scale up the spine. **Nothing scales to the player.** (Engine reality: enemy hp/dmg/speed already live
in per-archetype data + per-placement — there is no scaling system, which is correct; we just *place*
the curve.) The per-region curve, mapped to the emotional arc:

| Beats | Region | Reach + hearts | Gear tier | PLACED difficulty (fixed) |
|---|---|---|---|---|
| **M1–M5** | Greenhollow (childhood) | — · 3 starting hearts | none → wooden sword | **~none** — tutorial taps; SAFE HUB |
| **M6–M7** | the Burning / return | — | wooden → steel | a single scripted scare |
| **M8–M10** | Ashen Marsh | **lantern** (light + Guardian shroud-strip) + shard 1 · +heart | steel | **gentle** — slow chargers, few ranged; teach 3 counters; **Drowned Guardian** |
| **M11–M12** | Sundered Peaks | **grapple** (gap + stun/pull) + shard 2 · +heart | + peak_mail / crag_maul | **stepped up** — brutes, electric; faster; **Keep Sentinel** (bigger) |
| **M13–M14** | Tidewreck Coast | **hookshot** (cross + pull) + shard 3 · +heart | + tideglass | **trickier** — ambushers in wreckage; mixed pockets |
| **M15–M16** | Emberwood | **firefrost** (elemental verb) + shard 4 · +heart | + cinderhide/frost | **dangerous** — caster pressure; elemental; M16 climax |
| **M17–M20** | Hollow Spire | all tools required · final hearts | top gear | **the gauntlet** — earlier enemies return **HARDER (placed harder variants)**; the hyped **M19 brutal boss** (biggest scale) |

Power = **4 tools + ~6 hearts + 5 gear tiers + boss-trick mastery**, against a **hand-placed** rising
curve. A returning hero genuinely steamrolls the Marsh — by design.

### 2.2 LEVEL = THE STORY ACT [RATIFIED — fixed in code]
`level` is **not** an XP stat; it is the **act (1–3)**, derived from main-quest milestones and used only
to gate act-appropriate content. **Implemented:** `Economy.actOf(karma)` → Act 1 (childhood) · Act 2
(`time_skip`, returned as an adult, M7) · Act 3 (the four region shards gathered). The previously
**dead** content now opens with the story (§5/D1). The `Inventory.level` field is a retired stub.

### 2.3 MAGIC — acquirable spell-ITEMS, MP-gated [RATIFIED — reserved system, lean spec]
Magic is **Zelda-style items**, not a stat-scaled school: each spell is an **acquired tool** with a
**fixed effect** and an **MP cost** from the existing MP bar (no INT scaling, no spell levels). Keep it
**small + purposeful** — 3–4 spells, each earned at a story beat and each opening a *verb*, mirroring
the tool spine. Reserved set (final names TBD with the fiction):
| Spell (item) | Effect | MP | Earned ~ |
|---|---|---|---|
| **Emberlight** | a short ranged flame bolt (a ranged option vs fliers/ranged enemies) | low | Act 2 (Marsh/Peaks) |
| **Wardpulse** | a brief damage-absorbing ward (panic-button defence) | med | Act 2-late |
| **Frostgrasp** | freezes a single enemy briefly (crowd-control / solve a hazard) | med | Act 3 (Emberwood, pairs with firefrost) |
| **Hearthcall** *(optional)* | warp to the last shrine/hub (QoL traversal) | high | late |
> Magic uses the **MP bar that already exists in the HUD**. It is a **reserved system** — spec'd here,
> built in the polish layer (v2 §8.6), not now. **[DECISION D2 — CONFIRM with Van]:** ship magic at
> all? If yes, this lean MP-item set; if "later/cut", mark MP as reserved and proceed tools-only.

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

### 3.4 MORALITY — deepened, Fable-style (the soul of the game) [RATIFIED]
Morality is not a combat stat; it is **how the world remembers what kind of person you are**, read on
the existing **Morality + Purity** HUD axes (`Karma.js`) and paid off in **NPC reactions, world state,
and the 5 endings**. The deepened rule set:

**What MOVES the axes**
| You do… | Morality | Purity | Why it's coherent |
|---|---|---|---|
| **Hurt / kill / rob / betray a PERSON** (NPC, the talking good-monster — §below) | ↓↓ | ↓ | violence against the innocent is the core sin |
| **Kill a MONSTER** (corruption-spawn: bog dead, fever-beasts) | — | — | **guilt-free cleansing** — you're healing the world, not harming it |
| **Greed**: price-gouging, extortion, looting a grave/home, theft, breaking a deal | ↓ | ↓↓ | selfishness taints the *self* (purity) |
| **Cruelty for its own sake**: kicking the chicken, mocking grief, daring a friend into danger | ↓↓ | ↓ | the childhood seeds (`chicken_kicked`, `dared_friend`) — cruelty is remembered |
| **Mercy / fairness / generosity**: spare, return the coin, help freely, fair trade, comfort | ↑↑ | ↑ | the good axis — the deeds the world rewards |
| **Sacrifice / restraint / truth**: take a burden, refuse a corrupt bargain, keep a hard promise | ↑ | ↑↑ | purity is *integrity*, not piety |

**Visible consequences (this is what makes it DEEP, not a number):**
- **NPCs react**: a kind hero is greeted warmly, given discounts, trusted with secrets; a cruel/greedy
  one is feared, overcharged, refused (the dialogue routers + `chaBuyMult`-style price reactions
  already exist — *re-point price reactions off MORALITY/PURITY now that CHA is removed*, see [D-econ]).
- **World state**: the village rebuilds for a good hero / stays broken for a callous one; the kicked
  chicken returns; corrupt-only and pure-only gear/charms appear (`corrupt_blade`, `blessed_charm`).
- **Endings**: deed/karma-gated, never power-gated (§5) — Saint/Liberator/Ashbearer need
  `mercy_shown`; Tyrant needs Cruel+Corrupt. *You reach an ending by who you ARE, never by how strong.*

**The CORRUPTION-vs-MERCY principle (ratifies D3):** *monsters are the corruption made flesh — slaying
them is cleansing and never costs morality; the moral axis is reserved for PEOPLE and the GOD.* This is
what lets the game be **combat-heavy AND mercy-meaningful** at once.

**The TALKING, MORALLY-GOOD MONSTER — the exception that proves the rule** [RATIFIED — new designed beat]
> A creature that **looks like a monster but is good**: it talks, it's gentle, it helps (e.g. a lone
> **Mire-kin** outcast in the Marsh who guides you, or a **fen-troll** tending a hidden garden).
> **Attacking/killing it is a real CRUELTY hit** (↓↓ morality, ↓ purity — same as harming a person),
> and the world remembers (its garden dies; an NPC mourns it; it can't help you later). Sparing/helping
> it = a generosity reward + a unique aid (a shortcut, lore, a heart-piece). **Why it matters:** it
> teaches the player that **"monster" is not a licence to kill** — *judgement*, not the sword, is the
> moral test. It makes the guilt-free-monster rule *deliberate* (you chose to read the situation),
> deepening every later fight. Wire as a quest with its own deed (`good_monster_spared` /
> `good_monster_slain`) feeding the karma axes + a late callback. **[content task — design-noted; needs
> a deed id added to `deeds.js` when built.]**

- **Pacifism [RATIFIED D7]:** a *full* pacifist run is **out of scope** (shard-dungeon bosses are
  mandatory story gates; enemies aren't sneak-avoidable without new engine work). But a **merciful,
  low-violence playstyle is honoured**: optional hunts stay optional (`crag_beast_slain` etc. never
  required), and mercy is expressed at the named beats (`mercy_shown` at M16; the good-monster above).
  No sneak/subdue system — scope the vision doesn't need.

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
  4. **Books** — *retired with the skill tree (D5)*; the `book_*` items fold into lore/flavour or are cut.
- **Death penalty:** lose 15% gold (cap 200), respawn full HP — a *soft* stake, not a punishment that
  forces farming. Keep.
- **NO crafting tree.** The smith *job* teaches a skill (fine); a crafting system would add grind +
  inventory bookkeeping the narrative doesn't need. **Cut.**
- **Loot tables' purpose:** materials (timber/fish/iron_ore) feed jobs/sells; gold is a trickle toward
  the next gear tier. Tune so a region's loot ≈ one gear-tier upgrade by the time you finish it.

---

## 5. THE DECISIONS — all RATIFIED (Van's calls) + the cross-impact pass

| # | Decision | Status | The ratified call |
|---|---|---|---|
| **D1** | `level` = ACT, not XP | ✅ **RATIFIED + FIXED IN CODE** | `level` is the **story act**; `Economy.actOf(karma)` derives it (Act 2 = `time_skip`, Act 3 = 4 shards); bounty + house gate to **Act 2**, the Saltbreak shop to **Act 3**. The dead content is now **reachable as the story advances** (test: `Economy.test.js` §3). |
| **D2** | Tools = traverse + combat verb; **Magic** = MP spell-items | ✅ **RATIFIED** (magic = reserved, **CONFIRM ship?**) | Each tool gets ONE combat verb (grapple=stun/pull + slight dmg, etc., §2). Magic = a lean MP-gated spell-item set (§2.3), built in the polish layer. **The only open CONFIRM:** does magic ship at all, or stay reserved? |
| **D3** | Corruption-vs-mercy + deepened morality | ✅ **RATIFIED** | Monsters = guilt-free cleansing; morality = people/greed/cruelty vs mercy/fairness, Fable-deep, on the Morality+Purity HUD (§3.4) + the **talking good-monster** beat. |
| **D4** | Teach-then-combine encounters | ✅ **RATIFIED** (content task) | Re-space the Marsh's all-7-at-once into 2–3 new archetypes per region (§3.2). *Touches Marsh/Peaks `combat.enemies` placement — a build task, not done here.* |
| **D5** | Remove XP/stats/skill-tree | ✅ **RATIFIED — REMOVED** | NO XP, NO STR/DEX/CON/INT/CHA, NO skill tree (§2). Growth = tools + hearts + gear. **Retire the stubs** (below). |
| **D6** | The "slime" readability fix | ✅ **RATIFIED** | Invuln telegraph (crackle glow) + "ping" no-damage feedback on hitting an invulnerable enemy (§3.1). *Combat-feel task.* |
| **D7** | Pacifist scope | ✅ **RATIFIED** | No full pacifism; merciful low-violence honoured (§3.4). |

### Cross-impact pass — "impacts throughout the whole game" (reconciled / flagged)
- **vs `gating.js` (tool spine):** ✅ coherent — tools ARE the primary growth axis; the model *is* the
  DAG. The Spire's "4 tools + 4 shards" stays a *progression* gate (the climax), never a power gate.
- **vs the 5 endings:** ✅ **endings stay DEED/MORALITY-gated, never power-gated** — you reach an ending
  by *who you are*, never by being strong enough. Removing XP/stats can't lock an ending. Confirmed.
- **vs the emotional pacing:** ✅ the **placed** difficulty curve (§2.1) maps to wholesome→dread→horror→
  awe — gentle Marsh → dangerous Emberwood → the Spire gauntlet; a returning hero feeling powerful in
  early regions *reinforces* the arc (you outgrew the childhood world).
- **vs the economy (now-reachable sinks):** ✅ gold → **gear tiers** (the bounded power axis) + the
  Act-2 house / Act-3 shop (now reachable, D1). Jobs/loot stay a trickle, not a farm.
- ⚠ **[D-econ — FLAG, follow-up]:** removing **CHA** means `buyPrice/sellPrice` lose the charisma
  multiplier. **Safe now** (it defaults to neutral 1.0 — no breakage, verified GREEN), but the *intent*
  ("a kind/known hero gets better prices") should be **re-pointed onto MORALITY/PURITY** in a later
  economy pass (a good hero earns discounts; a feared one is overcharged). Design-noted, not done.
- ⚠ **[stub-retire — FLAG, follow-up]:** `Inventory` still carries the retired stubs — `level` (now
  vestigial; gating uses `actOf`), `attr/str/dex/con/int/cha/wis`, and `skills/skillPoints/learnSkill`.
  They're **harmless** (unused by the ratified model) and persisted saves still load. A later cleanup
  should strip them from `Inventory` + the character sheet UI + the `book_*` skill items. *Left in
  place now to keep this a minimal, tested change; flagged for a dedicated retire pass.*
- ⚠ **[content — FLAG]:** the **good-monster** beat needs a deed id (`good_monster_spared/_slain`) in
  `deeds.js` + a quest when built; the **hearts** system needs heart-piece placements + a max-HP hook
  (engine has HP; no heart-piece item yet). Both are build tasks, design-locked here.

---

## ✅ SUMMARY — the RATIFIED spine to build combat content on
- **Core loop:** explore → encounter (fight *or* choice) → reward (loot/truth/deed) → grow
  (tool / heart / gear) → unlock → explore. ~70% exploration-story / ~30% combat; the Act 1→3 arc.
- **Progression (ZELDA-STYLE):** **tool-unlocks + hearts + bounded gear. NO XP, NO stats, NO skill
  tree.** Power = 4 tools (each a traverse + combat verb) + ~6 hearts + 5 gear tiers + boss-trick.
  `level` = the story **act**. **Magic** = MP-gated spell-items (reserved; the one open CONFIRM).
- **Difficulty:** **PLACED per region, never auto-scaling** — early = weak/slow, late = strong/tricky,
  bosses scale; a returning hero genuinely feels powerful.
- **Morality (Fable-deep):** monsters = guilt-free; *people / greed / cruelty vs mercy / fairness*
  move Morality+Purity, with visible NPC/world/ending consequences + the **talking good-monster** beat.
- **Economy:** gold → gear (bounded) + the now-reachable Act-2 house / Act-3 shop; no crafting.
- **Dead content FIXED:** bounty/house/shop are act-gated + reachable (code + test GREEN).
- **Open:** D2 magic ship-or-reserve (CONFIRM). Flagged follow-ups: re-point prices onto morality,
  retire the `Inventory` stat/skill stubs, build the hearts + good-monster content.
