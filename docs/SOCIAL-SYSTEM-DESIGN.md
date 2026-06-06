# SOCIAL SYSTEM — CHARISMA · TRUST · DECEPTION (design capture, build LATER)

A Fallout/D&D-style social layer for the WHOLE game: charisma-gated dialogue, better
shop prices, persuasion/intimidation/charm, NPCs who **lie**, an **Insight/Intuition**
check to see through them, and **trust/reputation** that opens or closes doors. This is
DESIGN ONLY — captured now, built as a dedicated cross-game layer AFTER the world is
playable. It **enriches but does not block** the remaining region builds (regions can
ship with plain dialogue and gain social checks later, data-only).

## Goal (one line)
Make conversations a real system: who you are (CHA), what you've done (TRUST/karma), and
what you can perceive (INTUITION) change which options you see, what's true, and what you pay.

## Pillars
### 1. CHARISMA (CHA) — gates options + prices + social verbs
- CHA already exists as a stat (STR/DEX/CON/INT/WIS/**CHA**; per SYSTEMS-DESIGN-V2 "CHA →
  shop prices + dialogue options"). Surfaced via the stats system (Inventory.stats()/the
  character sheet). [Build note: confirm CHA is in the live stats; add if missing.]
- **Dialogue options** gated on a CHA threshold appear Fallout-style: `[Charisma 7] "You
  owe these people — pay them."` Below the threshold the option is hidden or greyed.
- **Shop prices** scale with CHA — hook the EXISTING economy: `buyPrice/sellPrice` in
  src/systems/Economy.js already take a region multiplier; add a `chaMod(karma/stats)`
  factor (e.g. buy ×(1 - cha*0.02), sell ×(1 + cha*0.02), clamped). `buy()` already
  receives `karma`; pass stats or read CHA there. No economy rewrite — one multiplier.
- **Social verbs** = persuade / intimidate / charm — modelled as CHA(+karma) checks on a
  dialogue option (see §4). Outcomes branch the dialogue + may record deeds.

### 2. DECEPTION — NPCs can lie; INTUITION sees through it
- An NPC line can be flagged `lie: true` (or carry a hidden `truth` variant). By default
  the player hears the lie and the "true" reading is hidden.
- **INTUITION** (an Insight/perception skill — CHA/WIS-based, in the Rogue/Social branch,
  the same family as ENEMY INTUITION) unlocks a `[Insight] He's lying — ...` reveal: an
  extra option/annotation exposing the deception, or auto-routing to the truthful branch.
- Some quest info is FALSE unless you have the intuition to catch it → rewards investment
  in perception; mirrors D&D Insight / Fallout speech checks.

### 3. TRUST / REPUTATION — the world remembers
- Per-NPC / per-faction TRUST derived from the existing **deed memory + karma**
  (Karma.js: deeds, morality, purity). High trust (good dealings, aligned karma, kept
  promises) → better prices, more honest info (fewer lies pass / they volunteer truth),
  and **exclusive options**. Betraying trust (broken promises, hostile deeds) closes
  doors — options vanish, prices worsen, some quests lock.
- Reuses the deed-memory engine (no new persistence): a TRUST value is a derived read over
  relevant deeds (e.g. `trust(npc) = f(karma, deeds about that npc/faction)`), not a new
  stored axis — same pattern as the reactive-router dialogue already uses.

### 4. DIALOGUE CHECKS — the surfaced mechanic (Fallout-style)
A dialogue option may carry a `check`:
```
{ label: 'Persuade him to pay the miners', check: { type:'cha', dc: 7,
    onPass:'paid', onFail:'refused' }, deed:'persuaded_hunt' }
{ label: '[Insight] He's lying about the records', check: { type:'insight' },
    to:'truth_revealed' }   // only shown if the player has INTUITION
```
- `type`: `cha` | `intimidate` | `charm` | `insight` | `trust`. `dc` = threshold.
- The dialogue UI shows the bracket tag (`[Charisma 7]`, `[Insight]`) and styles
  pass-likely vs risky. Hidden if the player can't meet/see it (configurable: hide vs grey).

## How it LAYERS onto the existing systems (no rewrites)
- **Dialogue** (src/systems/Dialogue.js): options already support `{label,to,deed,meta,
  choice,set,end}` + reactive `route:[{when(ctx),to}]`. ADD an optional `check` on an
  option (resolved in `select()` against ctx) and a `show(ctx)` predicate for gating
  (filter `options()` by it). The reactive router's `when(ctx)` already reads live karma —
  extend `ctx` to also carry stats (CHA) + skills (insight) + a `trust(npc)` helper. This
  is an additive Dialogue extension, not a rewrite.
- **Karma** (deeds/morality/purity) — unchanged; provides TRUST + check inputs via ctx.
- **Economy** (buyPrice/sellPrice/buy) — add ONE CHA/trust price multiplier; no rewrite.
- **Skills/Stats** (Inventory.skills + stats()) — provide CHA + INTUITION/Insight flags.
- **UI** (the shared dialogue box in RegionScene) — render the `[..]` check tags + greyed
  options; small additive change to `_renderOptions`.

## Build plan (a cross-game layer, AFTER the world is playable)
1. **Engine extension** — add `check` + `show(ctx)` to Dialogue + the richer `ctx`
   (stats, skills, trust helper); render check tags in the shared dialogue UI. (One pass.)
2. **Economy hook** — CHA/trust price multiplier in Economy. (Tiny.)
3. **Skills** — define CHARISMA usage + the INTUITION/Insight skill in the Rogue/Social
   branch (the ENEMY-INTUITION sibling); wire learn/has.
4. **Content** — author `check`/`lie`/`trust`-gated options into quests region-by-region
   (data-only; existing quests keep working unchanged until enriched).
5. **Verify** — unit-test the check resolver + the trust function; live-test a few gated
   options (a CHA persuade, an Insight lie-detect, a trust-priced shop).

### Dependencies
Dialogue (exists) · Karma/deeds (exists) · Economy prices (exists) · Skills/stats incl.
CHA + an Insight skill (CHA exists; Insight skill to add) · the shared dialogue UI (exists,
RegionScene). All present except the Insight skill + the additive `check` field.

> Note: this layer ENRICHES dialogue/economy but does NOT block building the remaining
> regions. Ship regions with plain dialogue; add social checks as a later data + engine pass.
