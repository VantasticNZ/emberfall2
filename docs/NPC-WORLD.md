# NPC WORLD — reactions, combat-AI, law escalation, standouts, the children rule, the living town

> **Design — companion to `ALIGNMENT-SYSTEM.md` (the morality/transformation spec).** This doc makes
> the *people* of Emberfall feel **alive, varied, and consequential** when the player is good, neutral,
> or going monstrous. **DESIGN ONLY.** Cross-refs: `ALIGNMENT-SYSTEM.md`, `MECHANICS-DESIGN.md`,
> `world.js` (NPC data), `NpcLife.js` (schedules), `EnemyController.js` (the reserved **humanoid
> combatant** path), `Karma.js`, `gating.js`. Build on the GH→Peaks slice first (§8).
>
> **Engine reality this builds on:** NPCs are data objects (`{name, parts, facing, schedule, quest,
> greeting, tempo}`) — **no type/strength/hostility/essential fields yet** (net-new, DA7). Combat
> currently targets `enemies` only and `_playerAttack` is **already gated by safe-zones** — the exact
> hook for the safe-mode toggle. `EnemyController` keeps a **humanoid** spawn path (Character + weapon)
> reserved for exactly this.

---

## 1. SAFE-MODE LETHAL TOGGLE (the anti-accident, anti-soft-lock guard)

**Default: you cannot kill people.** Striking/kicking a person is **non-lethal** — a *scuffle*: knock-
back, a knock-down, a brief stun, a fled or angry NPC, and the **morality consequence still applies**
(`person_harmed`: −12..−15 morality). You can be a *bully* by default; you cannot be a *murderer* by
accident. **Killing a person requires deliberately turning OFF "Safe Mode."**

| | Where | Behaviour |
|---|---|---|
| **Safe Mode ON (default)** | — | attacks vs people cap at **knock-out** (HP floored at 1 / "downed, alive"); they flee or are subdued; deeds: `person_harmed`. No death is possible by any path. |
| **The toggle** | **Options menu** → "Lethal Force" (default **OFF = safe**), OR a deliberate in-world "draw to kill" stance | a **confirmation warning**: *"Turn off Safe Mode? You will be able to KILL people. The world — and your soul — will remember. This cannot be undone in their eyes."* |
| **Safe Mode OFF** | after the warning | attacks vs **non-essential, non-child** NPCs can **kill** → deeds `npc_killed` (−25..−35 morality, −15 purity) + the law/world reacts (§3). **Essential NPCs and ALL children remain unkillable** (§4–5) even with lethal force on. |

**Why:** prevents accidental evil + accidental soft-locks (you can't ruin a playthrough by mis-clicking
on a quest-giver), while **fully supporting** a chosen evil path (toggle it off, commit, the world
commits back). The toggle is a *deliberate moral act*, mirroring the alignment theme: choosing to be
able to kill is itself a step toward the monster. **[DECISION DA8 — Options setting + the lethality
gate in `_playerAttack`.]**

---

## 2. NPC REACTION ARCHETYPES + COMBAT-AI (varied, but consistent within a type)

Every NPC carries a **`reaction` type** (DA7) — mostly consistent within a kind (townsfolk behave like
townsfolk) with **light per-NPC variety** (a braver farmer, a faster runner). On being threatened/struck:

| Reaction type | Who | Behaviour when threatened / struck |
|---|---|---|
| **Coward** | most villagers, children, the elderly | **FLEE** (run from the player, toward a building/the edge); if cornered, **cower** (no fight). |
| **Defender** | tough adults — a smith with a hammer, a burly farmer, a fisher with a gaff | **FIGHT BACK** — a *weak humanoid combatant* (low HP, simple swing; reuses the reserved `EnemyController` humanoid path). Loses to a real fighter, but bruises you. |
| **Alarm-raiser** | shopkeepers, the watchful, a gossip | **RUN FOR THE LAW** — sprints to the nearest guard/sheriff → triggers law escalation (§3). Doesn't fight. |
| **Lawkeeper** | guards, the sheriff, the standout law-enforcer (§4) | **CONFRONT** — approach, **warn once**, then **subdue** (Safe-Mode parity: they try to *down* you, not kill — they're the law); escalating in number + strength (§3). |
| **Bystander-propagator** | everyone nearby | **REACT to what they SEE** — witnessing harm flips nearby NPCs to flee/alarm + **lowers their disposition to you** (the world *remembers* even unrecorded acts — §6). |

**Light variety rule:** within a type, jitter one trait (flee-speed, courage threshold, whether they
alarm vs cower) seeded per-NPC — so a crowd reacts believably, not in lockstep. The humanoid combat
reuses the existing archetype FSM (a Defender ≈ a weak `brute`/`charger`; a Lawkeeper ≈ a `shielded`
that warns then punishes) — **no new combat engine**, just humanoid skins + the reaction layer.

---

## 3. LAW ESCALATION (a "heat / notoriety" response — the world fights back)

Harm in a settlement raises **regional Heat** (a notoriety timer, DA10). Escalation is **graduated and
always escapable** (it never gates the story — §7):

1. **Witnessed minor harm** (a shove, a scuffle) → nearby NPCs flee/alarm; **one guard** approaches,
   **warns** you. Stop → it cools down.
2. **Repeat / a beating / Safe-Mode-OFF wounding** → **2–3 guards** confront + try to subdue; a **fine
   / bounty** appears (pay it, or flee the region to cool Heat).
3. **A killing / a rampage** → the town turns hostile; **the standout Law-Enforcer** (§4) is dispatched
   — the escalating "find out" beat. Defeating/evading them doesn't end the law; Heat persists +
   shopkeepers refuse you until it decays or a bounty is cleared.
- **Heat decays** over time/distance; a region you've terrorised stays wary (NPC dispositions + prices,
  §6 + ALIGNMENT §3). **Guards subdue (non-lethal) by default**; they only kill if Safe-Mode-OFF *and*
  you've killed (parity — the law escalates to match you).

---

## 4. STANDOUT CHARACTERS — "mess with the wrong person, find out" (designed encounters)

Hand-placed, **not random** — the world has people who are far more than they look:

- **The unassuming gunhand** — an ordinary-looking traveller/farmhand who, if you raise a blade on
  them, draws a **firearm**: a fast, high-damage **ranged** threat (reuses the `ranged` archetype, big
  numbers + a long telegraph you must read). Looks like a victim; is a duel. *Art: a civilian skin + a
  gun + a muzzle-flash VFX = [GAP].*
- **The ninja grandmother** — a frail-seeming **old lady** who is a **martial-arts master**: fast,
  evasive (i-frame dodges), punishing counters (a `jumper`/`charger` hybrid with a parry). Underestimate
  her and you eat the floor. A comedic-then-respectful "oh no" beat — *she's not a gag, she's lethal.*
- **The Law-Enforcer (the escalating "find out")** — the ultimate consequence of terrorising a town: a
  **formidable, dignified lawkeeper** who escalates in power as your crimes mount, wielding a **taonga
  weapon carried with mana** — a treasure of lineage and authority, **never a joke**. They are the most
  serious humanoid fight in the game: measured, honourable, overwhelming if you persist.
  > **⚠ [DECISION DA13 — Van's exact STEER was referenced but NOT included in the brief].** Per the
  > instruction, any **Māori weapon/character is treated as taonga with mana** — with **respect,
  > dignity, and weight**, not comic relief. I have designed the **role** (a powerful, honourable
  > escalating lawkeeper). **I have deliberately NOT invented the cultural specifics** (name, iwi /
  > whakapapa, the exact taonga — e.g. *taiaha* / *mere pounamu* / *patu* — or any te reo), because
  > taonga carry real mana and must be authored from Van's steer, not guessed. **Van to supply the
  > steer + ideally a cultural sensitivity check** before this character is written/built. *Art: the
  > character + the taonga weapon, to the 64px LPC lock, rendered with care = [GAP].*

These are **placed quest/encounter beats** with their own deeds (`crossed_the_gunhand`,
`humbled_by_the_elder`, `defied_the_law`), feeding morality + the world's memory.

---

## 5. CHILDREN — THE HARD RULE (inviolable)

> **No path, no toggle, no bug may ever kill a child.** This is a **system invariant**, above Safe Mode.

- Every child NPC carries **`child: true` → implies `unkillable: true`**. Harm against a child **caps at
  knock-back / knock-out**; their HP **cannot be reduced below 1 by any code path**; they **FLEE**.
- A designated **"tough kid"** can be **knocked out** (a scripted comedic-then-serious beat) but **never
  killed** — same cap.
- Even with **Safe Mode OFF**, children are unkillable. Even a stray AoE / fire / spell against a child
  is **clamped to knock-out**.
- Harming a child at all is a **severe morality + purity hit** (cruelty against the innocent — the
  deepest sin on the axes) and the world reacts hardest (parents, the law, NPC memory).
- **[DECISION DA11 — implement as a hard guard]:** a single chokepoint — *all* damage to an NPC routes
  through one function that **floors child HP at 1** (and floors essential-NPC HP at 1). **Add a verify
  gate:** every NPC flagged `child` must also be `unkillable`, and assert no damage path bypasses the
  child-floor. (Tested like the no-soft-lock gate.)

---

## 6. THE RICH NPC WORLD (populated + alive, not interchangeable)

Texture that makes the town feel real (and makes harm *land* emotionally):

- **Types** (each its own `reaction` + look + schedule flavour): farmer, smith, fisher, merchant,
  innkeeper, drunk, priest/oracle, elder, **child**, guard, traveller — plus the standouts.
- **Families & groups (DA7 relationships):** parents + children + a grandparent share a home + a
  schedule; a work-crew; a knot of gossiping villagers; **kids playing** in the plaza. NPCs **reference
  each other** in dialogue ("my brother Hodge", "mind the children").
- **Reaction propagation:** harm one and their **family/friends react** — grief, fear, refusal to deal,
  worse dispositions ("you hurt my boy — get out"). A *good* deed propagates too (gratitude spreads).
- **Disposition memory:** each NPC remembers your standing (warm / wary / afraid), driven by your
  **alignment tier** + your **deeds toward them and theirs**. This is what makes prices, greetings, and
  help (ALIGNMENT §3) feel *personal*, not a global slider.
- **Life already exists** via `NpcLife` schedules (dawn→night routines) — we add **grouping + relations
  + reactions** on top. The world should read as *a place with people*, where cruelty has a face.

---

## 7. CROSS-IMPACT (reconciled / flagged)
- **vs the no-soft-lock rule (ALIGNMENT §4):** ✅ **triple safety** — Safe Mode default-non-lethal +
  essential NPCs incapacitated-not-killed + children unkillable. The **law escalation never gates the
  story** (it's escapable: cool Heat / pay a bounty / leave) and guards aren't quest-givers. *Flag:* a
  region's Heat must not lock a *required* shopkeeper permanently — provide a cool-down / bounty path
  (gate-check: no main-quest prerequisite sits behind a permanently-hostile NPC).
- **vs the morality axes:** ✅ all of this **feeds** Morality/Purity + the visible transformation —
  bullying, killing, and terrorising drive you toward the **devil**; restraint/protection toward the
  **angel**. The standouts/law are the *world's* half of that contract.
- **vs combat difficulty:** ✅ humanoid foes reuse the existing archetype FSM (no new engine); the
  standouts are **placed**, tuned hard — consistent with placed-not-scaled difficulty.
- **vs the 5 endings:** ✅ unaffected directly — endings stay deed/karma-gated; a murder-spree just
  drives toward Tyrant via the axes.

## 8. SCOPE — build on the GH→Peaks slice first
Prove the system **once** in Greenhollow: the **Safe-Mode toggle** + **a few varied NPCs** (a Coward, a
Defender, an Alarm-raiser, **one standout**) + **the children hard rule + its gate** + **basic Heat /
one guard**. Then replicate the texture + the other standouts across regions.

## ✅ SUMMARY + [DECISIONS]
- **Safe Mode** (default non-lethal; deliberate toggle-off to kill, with a warning) — the anti-accident.
- **Reaction archetypes:** Coward (flee) · Defender (fight back) · Alarm-raiser (run for the law) ·
  Lawkeeper (confront/subdue) · Bystander-propagator (react + remember). Consistent-by-type + light variety.
- **Law escalation:** graduated Heat (warn → guards+bounty → the standout Law-Enforcer), always escapable.
- **Standouts:** the unassuming **gunhand**, the **ninja grandmother**, the **dignified Law-Enforcer**
  (taonga-with-mana — **Van's steer required, DA13**).
- **CHILDREN: unkillable by any path** — a system invariant + a verify gate (DA11).
- **Rich world:** families/groups/relationships + reaction propagation + disposition memory.
- **[DECISIONS]:** DA7 NPC data fields (type/reaction/strength/essential/child/relationships) · DA8
  Safe-Mode toggle + lethality gate · DA9 humanoid-NPC combat (extend the reserved path) · DA10 Heat/law
  system · DA11 child-unkillable guard + gate · DA13 the Law-Enforcer cultural steer (+ sensitivity
  check). **Art [GAPS]:** standout-character sprites (gunhand/elder/law-enforcer + taonga), guard skins,
  flee/alarm anims. All build-time; design locked. Build on the GH→Peaks slice first.
