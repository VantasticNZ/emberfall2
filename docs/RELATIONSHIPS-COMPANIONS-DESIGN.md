# RELATIONSHIPS · COMPANIONS · ENDING-SUPPORT (design capture — build LATER)

A Fallout/Outer-Worlds-style **relationships + companions** layer for the WHOLE game,
built ON TOP of the existing social system (`docs/SOCIAL-SYSTEM-DESIGN.md`,
`src/systems/Social.js`) and the ONE Karma + deed-memory engine (`src/systems/Karma.js`).
It threads into the **existing five endings** (W/S/T/L/A) by adding a *support/allies*
factor — without breaking the current `reachableEndings()` gating.

This is **DESIGN ONLY**. Nothing here is built in this session. It is split into:
- **(A) Relationships / Affinity** — a NEAR-TERM, data-first extension of the social
  layer (small engine add + content). Does NOT block region builds.
- **(B) Companions / Allies** — a BIG, FOCUSED later build (party + follow/combat AI),
  best done once real regions exist. Flagged as its own session(s).
- **(C) Ending tie-in** — a small, additive `Karma.js` gate extension (a *support* view
  field + a climactic "do your allies show up" moment). Layers on; does not rewrite.

It **enriches but does not block** the remaining region builds. Regions ship with plain
dialogue + the existing social checks; affinity reactions and companions are layered in
as a later data + engine pass, exactly like the social system was.

---

## 0. The one-line goal
Who you are (CHA), what you've done (karma + deeds), and **how you treated people**
(affinity) decide who stands beside you — and at the Spire, whether anyone shows up at
all. The Liberator earns belief; the Tyrant only ever bought fear.

## 0.1 What already exists (reuse, do not rebuild)
- **Karma + deed-memory** (`Karma.js`): two axes (morality/purity) + a deed log; the SSOT
  every quest/NPC/ending reads. `reachableEndings()` gates the five endings off
  `{morality, purity, has(deedId)}`.
- **Social** (`Social.js`): pure functions over Karma + Inventory — `chaBuyMult/chaSellMult`,
  `trust(karma, check)` derived from morality + `POSITIVE_DEEDS`/`BETRAYAL_DEEDS`, the
  `resolve`/`state`/`tag` dialogue-check resolver. ctx = `{ inv, karma }`.
- **Inventory** (`Inventory.js`): `attr('cha')`, `learnSkill`/`hasSkill`, save/hydrate.
- **EnemyController** (`EnemyController.js`) + **Monsters** FSM (`Monsters.js`): the
  write-once render + movement + combat glue that drives every enemy archetype by DATA
  (telegraph/dodge/punish, flank/interrupt, projectiles, knockback, HP bars). Companion
  combat AI is the *mirror* of this — reuse the pattern, don't fork combat.
- **Dialogue** (`Dialogue.js`): options support `check`, `show(ctx)`, reactive `route`.
- **Constants SSOT**: `src/constants/{deeds,flags,items,endings}.js`. New ids below are
  PROPOSED — they get added here when built, never hardcoded. Reuse existing ids
  (`orchard_recruited`, `hagga_ally_plus`, `hagga_believed`, `sela_opposed`, `mercy_shown`,
  `stranger_rescued`, etc.) wherever a deed already means "this person is with you".

---

# PART A — RELATIONSHIPS / AFFINITY  (near-term, data-first)

## A1. The model — affinity is DERIVED, not a new stored axis
Affinity is a **read over the existing deed-memory + social trust**, per NPC (and per
faction), exactly the pattern `Social.trust()` already uses. No new persistence axis, no
parallel save state — the deed log IS the memory. This keeps the write-once rule (HARD
RULE 2) and means existing saves keep working.

```
affinity(npcId, ctx) -> integer, roughly -5 (hostile) .. +10 (devoted)
```

Inputs (all already available via `ctx = { inv, karma }`):
1. **Global trust** — `Social.trust(karma)` (morality tier + global POSITIVE/BETRAYAL deeds).
   The floor: a kind, honest player is liked everywhere; a known betrayer is distrusted
   everywhere.
2. **Per-NPC deeds** — a small DATA table maps each NPC to the deeds that personally help
   or hurt *them*: `{ likes:[deedId,…], dislikes:[deedId,…], allyDeed?:deedId }`. e.g.
   the orchard kid likes `orchard_covered`/`orchard_recruited`, hates `chicken_kicked`
   (it's why S-G7 already locks if the chicken was kicked). Hagga likes `hagga_believed`,
   hates `hagga_reported`.
3. **CHA bias** — high CHA nudges first impressions up a little (a charmer is liked sooner);
   never enough to fake a betrayal away.
4. **Quest outcomes** — already captured as deeds (faction leans, mercy/cruelty, kept vs
   broken promises). Affinity just reads them.

So affinity = `clamp( base(trust) + perNpcLikes − perNpcDislikes·2 + chaNudge )`, with
betrayals weighted double (a broken trust costs more than a favour earns — Fallout/Outer
Worlds feel). Tunable constants live next to `Social`'s existing multipliers.

### Affinity tiers (NPCs react "by tier", like Karma's `TIERS`)
| tier | range | NPC behaviour |
|---|---|---|
| Hostile | ≤ −3 | refuses service, may bar quests, worst prices, won't volunteer info |
| Wary | −2..0 | terse, guards info (lies pass more easily), standard-to-worse prices |
| Neutral | 1..3 | normal dialogue + the existing social checks |
| Friendly | 4..6 | better prices, honest info (volunteers truth / fewer lies), small favours |
| Trusted | 7..8 | exclusive dialogue + side-quests, discounts, will vouch for you |
| Devoted | 9+ | best prices, will FIGHT for you (story-ally recruit unlocked), epilogue presence |

## A2. Effects (all hook EXISTING systems — no rewrites)
- **Prices** — extend the existing CHA price hook in `Economy`/`Social`: fold an
  `affinityMult(npc)` into `chaBuyMult/chaSellMult` (one extra factor, same clamp). Trusted
  NPCs sell cheaper; hostile ones gouge. No economy rewrite.
- **Honest vs deceptive info** — affinity tier feeds the existing deception layer: low
  affinity → the NPC's `lie:true` lines stand (you need `[Insight]` to catch them); high
  affinity → they volunteer the `truth` variant unprompted (route to the honest branch).
  This reuses the Social deception design verbatim, gated on affinity instead of a flat DC.
- **Exclusive dialogue / quests** — Dialogue options already support `show(ctx)`; add an
  `affinity:{npc,min}` predicate that filters options (the same way `trust` checks already
  hide exclusive options). Some side-quests only appear at Friendly+; some hard-lock at
  Hostile (S-G7 already does this informally — generalise it).
- **They remember and react** — the reactive welcome (M7 reads childhood deeds) generalises
  to "every significant NPC's greeting is affinity-reactive." One data pattern: a per-NPC
  greeting `route` keyed on affinity tier. No bespoke state.

## A3. Engine delta for Part A (small, additive)
1. `Social.affinity(npcId, ctx)` + an `AFFINITY` per-NPC data table (`src/data/affinity.js`)
   — pure function, same shape as `trust()`. Unit-test it (mirrors `Social.test.js`).
2. `affinityMult()` folded into the price multipliers (one factor).
3. Dialogue `show(ctx)` gains an `affinity:{npc,min}` predicate (additive; existing options
   unaffected).
4. Content: author per-NPC `likes/dislikes` + affinity-gated options region-by-region as
   regions are built (data-only; quests keep working un-enriched until touched).

**Part A does not require companions and does not block any region.** It is the natural
next extension after the shipped social core.

---

# PART B — COMPANIONS / ALLIES  (BIG build — its own focused session(s))

> ⚠ **SCOPE FLAG:** Companions are a large, cross-cutting build (party state + follow AI +
> combat AI + recruitment content + banter + save format). Do it as a dedicated session
> (or two: "party + follow/combat core", then "recruitment + banter content"), AFTER at
> least one real combat region exists so it's tuned against real encounters, not the dev
> slice. It is NOT a prerequisite for region builds and must not be smuggled into one.

## B1. Three kinds of ally (one system, three recruit sources)
1. **Hired mercenaries** — pay gold (Economy) to recruit a generic fighter for a stretch.
   No deep personality; muscle for hire. Dismiss freely; re-hire costs gold. CHA/affinity
   lowers the price (ties Part A to Part B).
2. **Quest-followers** — temporary, story-scoped (e.g. an NPC escorts you through one
   dungeon, or joins for a single quest then leaves). Auto-join/auto-leave on quest beats;
   no permanent roster slot.
3. **Story allies** — won through the narrative + affinity. These are the ones that matter
   for the ending (Part C): they only join at **Devoted** affinity AND a story `allyDeed`
   (e.g. Hagga via `hagga_believed` + `hagga_ally_plus`; the orchard kid via
   `orchard_recruited`; a marsh bog-folk leader via `bogfolk_kind` + their quest). They
   can be lost (betrayal deeds dismiss them permanently).

All three are ONE party system; they differ only in *recruitment source* and *persistence*.

## B2. Party system (the new state)
- A small **Party** module: a roster (cap ~2 active companions + the player; tune for feel),
  `recruit(id, source)`, `dismiss(id)`, `active()`, `serialize/hydrate`. Persisted alongside
  Karma/Inventory (new save block; bump `SAVE_VERSION`, follow the Save-Versioning rule in
  QUALITY-BIBLE).
- Story-ally membership is partly **derived** (recruited only if affinity/deeds qualify),
  partly **stored** (whether they're currently in the active party and alive). Recruitment
  *eligibility* reads Karma/affinity; the *roster* is explicit state.
- Companion DATA (`src/data/companions.js`): id, name, LPC sprite parts (reuse the Character
  pipeline), archetype/stats, recruit source + requirements, dismiss rules, banter lines,
  per-region presence. Content-as-data (HARD RULE 2).

## B3. Follow + combat AI — MIRROR `EnemyController`, do not fork combat
The enemy stack is already a write-once FSM-driven controller. Companions are its friendly
twin:
- **`AllyController`** (new) — same shape as `EnemyController`: renders Character sprites,
  drives them by an FSM, integrates with `DepthSort`, colliders, HP bars. The ONLY
  inversions: target = nearest **enemy** (reuse `EnemyController.nearest`/`live`), and
  "onHit" damages enemies via the existing `mon.hit()` path instead of the player.
- **Follow behaviour** — when no enemy is near, formation-follow the player (a lag-behind
  offset + the existing Movement/Collision so they don't clip walls). Reuse Movement.
- **Combat behaviour** — a minimal ally FSM: approach → attack-in-arc (reuse the
  `playerAttack` arc/`mon.hit` logic), retreat when low HP, respect telegraphs (don't stand
  in a charge line). Companions obey the SAME combat constants (`src/constants/standards.js`
  COMBAT) — never re-tuned (HARD RULE: reuse standards).
- **No new combat math.** Damage, knockback, archetypes all route through the existing
  Monsters/Combat systems. `AllyController` is glue, like `EnemyController`.

**Engine-gap flag:** `EnemyController`'s targeting assumes "the player" as the single
target. Companions add "enemies have multiple possible targets (player + allies)." This is
a *real, minimal* engine touch: generalise the target lookup to a target list. Flag it,
make the minimal change, do NOT silently rework the controller (HARD RULE 2).

## B4. Personality / banter
- Banter = data lines triggered by context (region enter, low HP, an NPC reaction, a moral
  choice). Drives off the same deed/affinity reads. Companions comment on YOUR deeds
  (Outer Worlds feel) — e.g. Hagga approves when you show mercy, disapproves on a betrayal.
- Companion approval is itself an **affinity** value (Part A) — treating a companion well
  raises their affinity, unlocking their personal quest + keeping them at the Spire.

## B5. Recruitment logic (summary)
| source | gate | persistence |
|---|---|---|
| mercenary | gold (CHA/affinity-discounted) | until dismissed/region-out; re-hire = gold |
| quest-follower | quest beat | auto-leaves on beat end |
| story ally | Devoted affinity + `allyDeed` | permanent until a betrayal dismisses them |

## B6. Companions build deps
Party module (new) · `AllyController` (new, mirrors EnemyController) · companion DATA (new) ·
Movement/Collision/DepthSort/Character/Monsters/Combat (exist, reuse) · Economy (merc hire,
exists) · Affinity (Part A) · save-version bump. Best built against a real combat region.

---

# PART C — ENDING TIE-IN  (additive `Karma.js` gate extension)

> The point: the **Liberator** (visionary) ending must require genuine **SUPPORT** — allies
> who stand with you + high affinity across key NPCs (people *believe* in you). The
> **Tyrant** is the hollow inverse — people serve through fear, not support. This layers
> onto the EXISTING `reachableEndings()` gates WITHOUT breaking them.

## C1. The new factor: a derived SUPPORT score
Add ONE derived read to the Karma view — no new axis, no new save state. `support` is
computed from things the engine already knows + the (later) party roster:

```
supportScore(ctx) =  count of story-ally deeds present
                   +  number of NPCs at Friendly+ affinity (Part A)
                   +  active story allies in the party at the Spire (Part B; 0 if not built yet)
```

Story-ally deeds are existing canonical ids (`hagga_ally_plus`, `orchard_recruited`,
`bogfolk_kind`, `stranger_rescued`, `faction_workers`/`faction_peace`, `comforted_child`,
…) — "people you stood by who would stand by you." This means **support is meaningful even
before companions are built** (it reads deeds today), and gets richer once the party exists.

## C2. How it layers WITHOUT breaking current gates
The existing gates are untouched in spirit; we ADD a clause carefully:

- **`_view()` gains `support`** — `{ morality, purity, has, support }`. Existing gates that
  don't read `support` are byte-for-byte unchanged → W/S/A and every current test still pass.
- **Liberator** — currently:
  `purity ≥ 20 && has(mercy_shown) && has(hagga_believed) && has(sela_opposed)`.
  ADD a low support floor: `&& support >= L_SUPPORT_MIN`. Choose `L_SUPPORT_MIN` so a
  *genuine* Liberator run already clears it — a player who is Pure, merciful, believed
  Hagga (→ `hagga_ally_plus` path) and opposed Sela has by construction stood with people,
  so the deeds that feed `support` are already present. The floor blocks only the
  *contradiction*: "Pure + all the right one-off choices but treated everyone as a tool."
  That player should NOT get the people's-uprising ending.
  - **Test obligation:** `Karma.test.js`'s Liberator case must be updated in the SAME commit
    to seed the qualifying support deeds (it already seeds mercy/hagga/sela). This keeps the
    regression suite green and documents the new requirement. (Do NOT change W/S/T/A tests.)
- **Tyrant** — currently `morality ≤ −20 && purity ≤ −20`. Unchanged as a *gate*. The
  tie-in is **narrative + epilogue, not a harder gate**: the Tyrant reaching the throne with
  `support ≈ 0` is the *intended* hollow image — they ascend on fear. Surface it as an
  epilogue/twist read (`support`-driven card: a court that obeys, no one who believes),
  reusing the EPILOGUE_CARDS pattern. Optionally a `tyrantHollow = support <= 0` boolean for
  the finale text. We do **not** add a support requirement to T (that would change its
  reachability and break the T test) — the inverse is shown, not gated.

This satisfies "add a support/allies factor without breaking current gating": only L gains a
floor (and its own test is updated with it); W/S/T/A gates and tests are untouched.

## C3. The climactic moment — "do your allies show up?"
At the Spire approach (M17/M18 — the existing "Echoes of the Climb" / S-S1 / M18a-vs-M18b
deed-reactive ascent), stage the payoff:
- **High support / Liberator** → M18a "Echoes of the Kind" pays off literally: your **story
  allies appear and fight the ascent beside you** (spawn the recruited companions via
  `AllyController`; reuse the existing M18a deed gate). People believe in you, so they came.
- **Low support / Tyrant** → M18b "Echoes of the Cruel": **no one comes** (or thralls who
  serve from fear and break). The hollow inverse, shown in play.
- This reuses the EXISTING reactive ascent (M18a/M18b already gate on high/low morality +
  deeds) — `support` just makes the *who-shows-up* concrete and ties Part B's party to it.
  Before Part B is built, it degrades gracefully to the existing narrative echoes (the
  allies are described, not spawned).

## C4. Engine delta for Part C (tiny, additive)
1. `KarmaEngine.supportScore()` + `support` added to `_view()` (reads ally deeds now;
   reads affinity + party once those exist — injected via the same ctx, defaulting to deeds
   only so it works standalone).
2. Liberator gate gains `&& support >= L_SUPPORT_MIN` (one clamped constant near `GATE`).
3. Update the Liberator test in `Karma.test.js` (same commit). Add a Tyrant-hollow epilogue
   read (no gate change).
4. The M18a/M18b ascent spawns allies from the party when Part B exists (content + a hook;
   no new engine).

---

# BUILD PLAN + DEPENDENCIES (the ordering)

| # | Chunk | Size | Blocks regions? | Depends on |
|---|---|---|---|---|
| 1 | **Affinity core** (Part A1–A3): `Social.affinity` + data table + price/info/gating hooks | small, 1 session | **No** | Social, Karma, Inventory, Dialogue (all exist) |
| 2 | **Affinity content** (per-NPC likes/dislikes + reactive greetings) | data-only, ongoing per region | No | chunk 1 |
| 3 | **Ending support factor** (Part C): `supportScore` + L floor + tests + Tyrant-hollow card | tiny, 1 session | No | Karma (exists); reads chunk-1 affinity if present, else deeds-only |
| 4 | **Companions core** (Part B2–B3): Party module + `AllyController` + follow/combat AI + save bump | **BIG**, dedicated session(s) | No | EnemyController/Monsters/Combat/Movement/Character (exist) — best after a real combat region |
| 5 | **Companion content** (Part B1/B4/B5): recruit sources + banter + per-region presence | data-heavy, ongoing | No | chunk 4 + affinity |
| 6 | **Spire payoff** (Part C3): allies spawn on the M18a/M18b ascent | small | No | chunks 3+4 |

**Key dependency notes**
- Chunks 1–3 are a **near-term extension of the shipped social system** — small engine adds
  + data, same write-once pattern. They do **not** block any region build.
- Chunk 4 (companions) is the **big build**, deliberately deferred until real designed
  regions exist so the follow/combat AI is tuned against real encounters (HARD RULE 9 — it
  needs live render + screenshot verification, and FEEL handed to Van).
- The **ending tie-in (chunk 3) is independent of companions**: it reads ally *deeds* today
  and only *enriches* once the party exists. So endings get their support layer early; the
  literal "allies show up" visual lands with chunk 6.
- **Nothing here blocks region builds.** Regions ship with plain dialogue + existing social
  checks; affinity reactions, companions, and the Spire payoff are layered in as later
  data + engine passes — same as the social system.

## Proposed new canonical ids (ADD to constants when built — design-only here)
Reuse existing ally/trust deeds first (`hagga_ally_plus`, `orchard_recruited`, `bogfolk_kind`,
`stranger_rescued`, `faction_workers`, `faction_peace`, `comforted_child`). New ids likely
needed at build time (add to `src/constants/deeds.js`/`flags.js`, never hardcode):
`merc_hired`, `companion_<id>_recruited`, `companion_<id>_dismissed`, `ally_stood_spire`,
and a `support` is a *derived value*, not a stored id. `verify.mjs`'s orphan check will
enforce these once referenced.

## Verify / DoD when each chunk is built
- Affinity + support: unit-test the pure functions (mirror `Social.test.js`/`Karma.test.js`)
  — derive over seeded deeds, assert tiers + the L-gate floor + that W/S/T/A gates/tests are
  unchanged.
- Companions: live render + screenshot (HARD RULE 9) — a companion following, fighting,
  taking a telegraph hit, dismissed/re-hired; FEEL (follow lag, combat readability) handed
  to Van to play-judge.
- Spire payoff: live screenshot of allies spawning on the high-support ascent vs none on the
  low-support ascent.

> Summary: **Affinity = a near-term social extension. Companions = a big later build in real
> regions. The ending tie-in = a tiny additive Karma gate (one `support` clause on Liberator
> + a hollow-Tyrant epilogue read) that does not break current gating.** None of it blocks
> the regions.
