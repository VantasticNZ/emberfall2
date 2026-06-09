# ALIGNMENT SYSTEM — the two-sided soul (saviour ↔ monster), transformation + consequences

> **Design — extends MECHANICS-DESIGN.md §3.4 (RATIFIED morality basis).** Van's direction: go **FAR
> both ways** — the game *commits* to the evil path, not just punishes it — with **physical
> transformation** (angel ↔ devil) and consequences woven **across as much of the game as possible**.
> **DESIGN ONLY** — the system is rich; design it fully now, **build on the GH→Peaks slice first**, then
> replicate (see §8). Cross-refs: `Karma.js` (the two axes + tiers + ending gates), `endings.js`,
> `deeds.js`, `Economy.js`/`Social.js` (prices to re-point), `gating.js`, `EXCELLENCE-FRAMEWORK.md`.

## 0. THE PRINCIPLE
Alignment is **who you become**, read on the two existing HUD axes and made **visible on the hero's
body** + **felt by the whole world**. Both poles are **fully supported**: a saint the village reveres,
or a monster it flees. It is *expression + consequence*, **never a power axis** — you never get
mechanically stronger for being good or evil (that stays gear/tools/hearts, per the ratified model);
you get a different *world*, *body*, *prices*, *quests*, and *endings*.

---

## 1. THE TWO AXES, FULLY (precise — grounded in `Karma.js`)

Two independent axes, each −100…+100, already in the engine (`adjust/set/get/tier`, persisted, the
ending engine reads them). They mean different things — **keep them distinct**:

- **MORALITY = how you treat PEOPLE** (the outward axis). Mercy/help/fairness/protection ↑ ·
  harm/kill/cruelty/betrayal ↓. *Drives NPC reactions + the wings/horns silhouette.*
- **PURITY = the state of your SOUL** (the inward axis). Integrity/sacrifice/restraint/truth ↑ ·
  greed/extortion/corruption/taint ↓. *Drives the halo/tail + corrupt/blessed gear + the
  purity-gated endings.*

**Tiers (from `Karma.TIERS`) + gate thresholds (`GATE`):**
| | −100 | −60 | −20 | +20 | +60 |
|---|---|---|---|---|---|
| **Morality** | Cruel | Unkind | Neutral | **Kind** | **Saintly** |
| **Purity** | Corrupt | Tainted | Untested | **Pure** | **Radiant** |
Gates: `cruel/corrupt ≤ −20`, `kind/pure ≥ +20` (the ending engine's thresholds — don't fork these).

**What moves them, how far** (deltas tuned to the existing seed-deeds, e.g. `chicken_kicked` −15):
| Act | Morality | Purity | Notes / example deed |
|---|---|---|---|
| Spare / show mercy (the god, the good-monster, a foe) | **+10..+20** | +5 | `mercy_shown`, `good_monster_spared` |
| Help freely / protect a person / comfort grief | +8..+12 | +3 | `greeted_warmly`, `comforted_child` |
| Return found property / keep a hard promise / fair trade | +5 | **+8..+10** | `coin_returned` |
| Sacrifice / refuse a corrupt bargain / take a burden | +3 | **+12** | the Ashbearer arc |
| **Hurt / rob a person** | **−12..−15** | −8 | new `person_harmed` |
| **KILL a person (non-monster NPC)** | **−25..−35** | −15 | new `npc_killed` (§4) |
| **Cruelty for sport** (kick the chicken, mock grief, dare a friend into danger) | **−15** | −5 | `chicken_kicked`, `dared_friend` |
| **Greed**: price-gouge, extort, loot a grave/home, theft, break a deal | −5 | **−12..−15** | new `extorted`, `grave_robbed` |
| Kill a MONSTER (corruption-spawn) | **0** | **0** | guilt-free cleansing (the principle) |
> Deltas via `karma.adjust(axis, delta)` on the deed; the **deed is the permanent record**, the axis
> is the running total. New deed ids (`npc_killed`, `person_harmed`, `extorted`, `grave_robbed`,
> `good_monster_spared/_slain`) **[DECISION DA5 — add to `deeds.js` when built]**.

---

## 2. PHYSICAL TRANSFORMATION (the headline) — **each axis maps to a body feature**

This is the design's spine: the two HUD axes are **drawn on the hero**, so a player *sees* their soul
and so do NPCs. Morality shapes the **upper silhouette**, purity the **aura/crown** — which means
**mixed alignments are real and thematic**, not just a single good↔evil slider:

| Axis → feature | Far + (≥ +60) | Touched (±40..±59) | Neutral | Touched (−40..−59) | Far − (≤ −60) |
|---|---|---|---|---|---|
| **MORALITY → silhouette** | **angel WINGS** | feathered-light shoulders / a faint lift | bare | darkened shoulders / a hunch | **devil HORNS** |
| **PURITY → aura/crown** | **HALO + radiant gold glow** | a warm rim-light | none | a cold/sickly rim-light, dimmed eyes | **TAIL + dark miasma**, ember-red eyes |

**The four corners (and the rich middles):**
- **Saintly + Radiant → the full ANGEL** (wings + halo + light). The world reveres you.
- **Cruel + Corrupt → the full DEVIL** (horns + tail + dread). The world flees you.
- **Saintly + Corrupt → the "dark saviour"** (wings + tail) — kind to people, rotten soul. *Thematic gold.*
- **Cruel + Radiant → the "righteous monster"** (horns + halo) — pious and merciless. *Equally rich.*

**What each pole GRANTS (flavour + consequence, never raw power):**
- **Angelic** — NPCs revere you (free aid, best prices, children follow); weak corruption-spawn
  **hesitate/recoil** from your light (a brief flinch — flavour, not a damage buff); a "blessed"
  dialogue register; **Pure-only** gear/charms (`blessed_charm`); previews the Saint/Liberator path.
- **Demonic** — NPCs **fear** you (flee, refuse service, guards may pre-emptively attack); weak enemies
  may **cower or flee** (flavour); **intimidate** dialogue options auto-pass; **Corrupt-only** black-
  market gear (`corrupt_blade`); previews the Tyrant path.
> **Guard-rail [flag]:** the enemy hesitate/cower flavour must **not** become a stealth difficulty
> cheat — cap it (a brief flinch / one free hit), never "enemies won't fight you." Alignment ≠ power.

### 2.1 ART — fallback ships now; the full sprites are a [GAP]
The winged/haloed/horned/tailed hero across **all facings + every animation** is **custom LPC overlay
layer work** — a real art task.
- **✅ FALLBACK (ships on the slice, blocks nothing):** the **touched + far tiers render as an AURA/
  TINT** on the *existing* hero sprite — a gold rim-light + particle glow (good) / a red-shadow rim-
  light + dark-ember particles (evil), intensity scaling with |axis|. Plus a simple **behind-the-hero
  billboard** for the extremes (a static wing-glow / horn-silhouette that doesn't need per-frame anim).
  This makes transformation *visible + felt* immediately with no new character art.
- **⚑ [GAP — DA3]: full transformation sprites** = per-facing/per-anim LPC layers for wings, halo,
  horns, tail (source or commission to the 64px LPC lock; AI-assist OK; licence-clean). Until then the
  aura fallback stands in. *Design is not blocked; the art is flagged.*

---

## 3. THE CONSEQUENCE WEB (woven, not cosmetic — Van's "apply to as much as possible")

Alignment is read **by tier** (the engine already says NPCs react by tier) across every system:

| System | Far GOOD (Saintly/Radiant) | Neutral | Far EVIL (Cruel/Corrupt) |
|---|---|---|---|
| **NPC reactions / dialogue** | warm greetings, gratitude, secrets shared, children follow, blessing lines | ordinary | fear/recoil, terse or pleading lines, doors shut, guards wary; some NPCs flee on sight |
| **SHOP PRICES** *(re-point off CHA → morality, DA2)* | **discount** (buy ↓ to ×0.7, sell ↑ to ×1.3) — a known kind hero is given fair deals | ×1.0 | **fear-markup** (buy ↑ ×1.3) or **refusal** ("I'll not serve your kind") — but the **black-market** opens (corrupt gear) |
| **Quest availability** | good-only quests (protect, restore, the blessed paths) appear | base | evil-only quests (extort, raid, the corrupt bargains) appear; some good quests refuse you |
| **Quest outcomes / branches** | merciful resolutions, NPCs survive + thank you, world heals | base | ruthless resolutions, NPCs broken/gone, world scarred — both recorded as deeds |
| **World state** | village rebuilds, gardens bloom, the kicked-chicken returns happy, festival warm | base | village decays, NPCs absent/fearful, the festival sours, the good-monster's garden dies |
| **Endings (the payoff)** | Saint (`morality≥20`+mercy) · Liberator (`purity≥20`+mercy+hagga+sela) · Ashbearer (cave_lore+pem+mercy) | Warden (default) | **Tyrant** (`morality≤−20` AND `purity≤−20`) |
| **Gear access** | `blessed_charm` (Pure-gated, exists) | base | `corrupt_blade` (Corrupt-gated, exists) |

**Prices re-point [DECISION DA2 — code]:** CHA is removed (ratified), so `chaBuyMult/chaSellMult`
(`Social.js`, ±30% clamp) become **`moralityBuyMult/moralitySellMult`** reading `karma.tier('morality')`
(or the raw value) — same ±30% clamp, plus a **refusal/black-market** branch at the Cruel/Corrupt tier.
Safe today (CHA already defaults neutral → no breakage); this *implements the intended* reaction.

---

## 4. NPC-HARM — fully supported, **gated against soft-locks** (the risk, handled)

To go *far* evil you must be able to **hurt and kill people**. This is **net-new** (combat currently
targets `enemies` only; town NPCs aren't attackable, and the safe-hub sword is foliage-only). **The full
spec — Safe-Mode lethal toggle, NPC reaction archetypes + combat-AI, law/Heat escalation, the standout
characters, and the CHILDREN hard rule — now lives in `docs/NPC-WORLD.md`.** Key safety rule: **by
default you CANNOT kill people** (Safe Mode on → non-lethal scuffles); killing requires a deliberate
toggle-off with a warning. Below is the alignment-facing summary:

**The mechanic [DECISION DA1 — net-new build]:**
- A deliberate **"raise blade on a person"** (e.g. attack while targeting an NPC, or a hostile dialogue
  option) flips that NPC to a **threatened** state. Most **villagers FLEE**; **guards/tough NPCs FIGHT
  BACK** (reuse the humanoid combat hooks `EnemyController` already reserves); a town may **raise
  guards** (a hostility timer). Striking a person = a heavy hit: **morality −25..−35, purity −15** +
  the `person_harmed`/`npc_killed` deed (permanent — the world *remembers*).

**THE NO-SOFT-LOCK RULE (hard — must be gate-enforced):**
> **No critical-path quest may be severable by killing an NPC.** Two-tier NPC flag:
1. **`essential: true`** — every **critical-path quest-giver / required shopkeeper / shard-NPC**. These
   are **incapacitated, never killed**: a "downed" attack leaves them **broken / fled-but-alive**, and
   their critical info **reroutes** (an alternate NPC, a note, the journal, or it auto-grants). The
   *deed records the cruelty* (full corruption hit) but the *path survives*. You can terrorise the
   essential cast; you cannot delete the story.
2. **Non-essential NPCs** — fully **killable** (the evil path is real): they die, the world reacts,
   their *optional* content is lost (which is itself a consequence). Anything they gated must have a
   non-NPC fallback.
- **VERIFY GATE [DECISION DA6 — add to `verify.mjs`]:** assert **every deed/flag on a critical-path
  quest is obtainable without a killable NPC** — i.e. each main-quest prerequisite NPC is `essential`
  OR the prerequisite has a documented reroute. This extends the existing no-soft-lock gate from
  *tool*-gates to *NPC-harm*. (Mirrors `gating.js`'s "no key behind itself".)
- Killing the **good-monster** (§5) and **mass-murdering the village** are *supported* and *recorded*,
  and push hard toward **Tyrant** — but the spine to the Spire still completes.

---

## 5. THE GOOD-MONSTER BEAT (the exception that proves the rule)

A creature that **looks like a monster but is good** — it talks, it's gentle, it helps (e.g. a lone
**Mire-kin** outcast tending a hidden Marsh garden, or a fen-troll who guides you). A designed quest:
- **Spare / help it** → `good_monster_spared` (**+morality, +purity**) + a unique aid (a shortcut, lore,
  a **heart-piece**) + a late callback (it returns to help).
- **Kill it** → `good_monster_slain` (**−morality, −purity — a true cruelty hit, like harming a person**)
  + the world mourns it (its garden dies; an NPC grieves; its aid is lost forever).
**Theme:** monsters are guilt-free **EXCEPT this one** — because *judgement*, not the sword, is the
moral test. It teaches that **"monster" is not a licence to kill**, deepening every later fight (you
now *look* before you swing). It directly feeds the alignment axes + can swing a borderline player's
tier (and thus their visible transformation).

---

## 6. ELEMENTAL MAGIC + PUZZLES (DA4 resolved — Van's direction: ship the elemental set)

Magic = **acquirable elemental spell-ITEMS** (Zelda-style keys, MP-gated, **not** stat-scaled — no INT,
no spell levels). Each spell is **two tools in one: a COMBAT verb AND a puzzle/navigation verb** — this
is what makes magic *worth* the build. The set (3, +1 optional):

| Spell (MP) | COMBAT verb | PUZZLE / NAVIGATION verb | Earned ~ |
|---|---|---|---|
| **FIRE** (low) | a ranged flame bolt; sets enemies/oil alight | **melt ice blocks/frozen doors · light braziers & dark paths · burn vines/webs/boards blocking a way** | Act 2 (the firefrost line) |
| **ICE** (low) | freeze a single enemy briefly (crowd-control) | **freeze a stream/waterfall/geyser to cross · raise an ice block/platform to climb or weigh a switch** | Act 2-late |
| **ELECTRIC** (med) | chain/stun; shatter electric wards | **power a switch/door/lift · charge a crystal or rune · overload a barrier** | Act 3 |
| **WIND/AIR** *(optional, DA12b)* | push enemies back; deflect projectiles | **turn windmill switches · clear poison gas/fog · propel a sail/raft · fan a flame** | late |

**Reconciles with `tool_firefrost`:** the existing **firefrost tool (earned M16)** *is* the
fire-and-ice elemental — so **FIRE + ICE are already on the gating spine**, no new critical-path gate;
ELECTRIC (+ WIND) are **new spell-items** earned at story beats. **[DECISION DA12 — add ELECTRIC (+
optional WIND) spell-items + their VFX + puzzle props; FIRE/ICE wire onto firefrost.]**

### 6.1 Spells-as-gates — like tools, but for OPTIONAL content (keeps the DAG safe)
Spells **may gate areas like tools do** — but only **secrets, caches, side-rooms, and alternate
routes**, never the **critical path** (which stays tool+shard gated in `gating.js`). This is the
`TEASES` pattern: a see-but-can't-reach behind a frozen stream / a dark vault / an unpowered door →
**spell payoff**. So adding spell-gates **cannot create a soft-lock** (the main spine never depends on
a spell the player might not have). Inside a shard-dungeon, the puzzle-spell is **granted in/before that
dungeon** (the dungeon teaches its element) → self-contained.

### 6.2 PUZZLE CADENCE (a *sprinkling* — woven through combat, nav, AND quests, not wall-to-wall)
- **Per shard-dungeon:** **2–3 elemental puzzles** built around that dungeon's element (the boss-trick
  often *is* the climactic puzzle — e.g. firefrost vs the Emberwood elemental boss).
- **Per overworld region:** **1–2 optional puzzle-gated secrets/caches** (a frozen-stream crossing to a
  heart-piece; a brazier-lit hidden room) + occasional **nav puzzles on the routes** (melt the ice
  blocking the foothill spur).
- **Cross-region teases:** a few "come back with spell X" see-but-can't-reach beats (mirrors the tool
  teases) — reward for revisiting with new power (reinforces "returning feels strong", §2.1).
- **Quest puzzles:** the odd quest resolves via a spell (douse a fire to save an NPC; power the mill for
  the miller) — magic woven into *story*, not just dungeons.
> Keep it a **sprinkling**: a puzzle should feel like a *treat*, not a gate on every screen. Density ≈
> the secret/landmark density, not the combat density.

### 6.3 Reconciliation
- **MP bar:** already in the HUD — spells spend it; refills at shrines/rest/potions. No INT scaling.
- **Alignment-orthogonal:** alignment does **not** gate magic (a saint and a monster both cast) — keep
  the axes independent (a good player isn't locked out of fire).
- **Difficulty-neutral puzzles:** puzzles test *logic/nav*, never stats — consistent with placed-not-
  scaled difficulty; they add variety, not power-creep. Combat spells stay **MP-bounded** (a resource,
  not a free win).

---

## 7. CROSS-IMPACT PASS (reconciled / flagged)
- **vs `gating.js`:** ✅ alignment gates **content** (quests/prices/NPCs), never **areas** — tools own
  area-gating. No contradiction (the axes are orthogonal to the tool DAG).
- **vs the 5 endings:** ✅ alignment **feeds** them through the *existing deed/karma gates* — the
  transformation is a live **preview** of your ending path (a winged hero is walking toward Saint; a
  horned one toward Tyrant). Endings stay **deed/morality-gated, never power-gated**. No fork of `GATE`.
- **vs the economy:** ✅ this *implements* the flagged CHA-removal follow-up — prices re-point onto
  morality (DA2). Gold sinks unchanged (gear + Act-gated property).
- **vs emotional pacing:** ✅ becoming a saviour-or-monster across the wholesome→dread→horror→awe arc
  *is* the emotional payoff; the body-transformation makes the arc legible on the hero.
- **vs the difficulty curve:** ⚠ alignment combat-flavour (enemies hesitate/cower) must stay **flavour,
  not power** (capped, §2) so it never trivialises the *placed* difficulty. Flagged.

## 8. SCOPE — design fully now, **BUILD ON THE GH→PEAKS SLICE FIRST**
Per v2 (vertical-slice-first): prove the whole system **once** on Greenhollow→Peaks, then replicate —
- **Slice build (later):** the axis→aura **fallback** transformation; the morality **price re-point**;
  **2–3 consequence beats** (an NPC reaction tier, a good-only + evil-only quest branch, the good-
  monster beat); **one essential-NPC-harm** path (incapacitate + reroute) + the **no-soft-lock gate**.
- **Replicate:** the consequence web across the four shard-regions + the full transformation **sprites**
  (the [GAP]) + magic if shipped.

## ✅ SUMMARY + the [DECISION]s for Van
- **Two axes, full both ways:** Morality (people) + Purity (soul), −100…+100, the existing tiers/gates.
- **Transformation:** **morality → wings/horns, purity → halo/tail** — full angel (Saintly+Radiant) ↔
  full devil (Cruel+Corrupt), with rich mixed forms. **Aura fallback ships; full sprites = [GAP DA3].**
- **Consequence web:** NPC reactions, **prices (re-point onto morality, DA2)**, quest availability/
  branches/outcomes, world state, gear, and which of the 5 endings open.
- **NPC-harm:** killable non-essential NPCs (real evil) + **essential NPCs incapacitated-not-killed +
  reroute** + a **no-soft-lock verify gate (DA6)** — the story can never be severed.
- **Good-monster:** the spare/kill beat (`good_monster_spared/_slain`) — the rule-proving exception.
- **NPC world** (`NPC-WORLD.md`): **Safe Mode** (default non-lethal; deliberate toggle to kill) +
  reaction archetypes (flee/fight/run-for-the-law) + **law escalation** + **standouts** (gunhand /
  ninja-gran / the **taonga-wielding Law-Enforcer** — Van's steer required) + **CHILDREN unkillable**.
- **Magic (DA4 RESOLVED):** **elemental spell-items** — FIRE/ICE (= firefrost) + **ELECTRIC** (+ optional
  **WIND**), each a **combat verb AND a puzzle/nav verb**; MP-gated; spells gate OPTIONAL secrets only
  (never the critical path); a *sprinkling* of puzzles woven through dungeons/nav/quests (§6).
- **[DECISIONS]:** **DA1** NPCs attackable · **DA2** prices→morality · **DA3** transformation sprites
  [GAP] (fallback ships) · **DA4** magic = elemental set (ship) · **DA5** new deed ids · **DA6** no-soft-
  lock NPC gate · **DA7** NPC data fields · **DA8** Safe-Mode toggle · **DA9** humanoid-NPC combat ·
  **DA10** Heat/law · **DA11** child-unkillable guard+gate · **DA12** ELECTRIC/WIND spells + puzzle props ·
  **DA13** the Law-Enforcer **cultural steer + sensitivity check (Van — steer was referenced but not
  supplied)**. **Art [GAPS]:** transformation layers, standout sprites + the taonga, spell VFX + puzzle
  props. All build-time; design locked. **Build on the GH→Peaks slice first.**
