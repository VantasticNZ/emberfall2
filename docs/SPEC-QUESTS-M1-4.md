# SPEC — SLICE QUESTS M1–M4 (Greenhollow arc) — for Van's review

> **THE-SLICE ORDER step 4.** Full-expectation spec (HARD RULE 12 / THE-SLICE method 0): decompose every
> facet BEFORE building — objectives · dialog beats · journal · rewards · fail/edge · karma · what it teaches
> — derived by asking *"what would Fable / Zelda / Stardew do here?"*. **SPEC ONLY. NO BUILD until Van
> approves/edits.** Lore from `LORE-CANON.md`; engine from `QuestEngine.js`; tone from `TONE-AND-FEEL.md`.
> **STATUS: PROPOSED.**

---

## 0. ⚠ RECONCILIATION — read first (Open Decision A)

The existing quest DATA (`src/data/quests/greenhollow.js`) already uses ids **M1–M6 = the CHILDHOOD spine**
(A Greenhollow Morning · Chores+Mischief/Chicken · The Coin · The Boarded Cave/Secret · The Festival · The
Night It Burned) + **M7** (adult return). The slice's M1–M4 below are an **adult-flavoured, system-teaching
GH arc** (property, combat, the cut ability) — a DIFFERENT thing. **This spec does NOT clobber the childhood
ids.** It proposes the slice arc as **new ids `GH1–GH4`** (titles Cold Hearth / Nobody Answered / Teeth in
the Orchard / The Boarded Cave), playable as the slice's "M1–M4 end-to-end." Van decides (Decision A): keep
the childhood spine AND add GH1–GH4 as the slice's playable arc (my default), OR re-home the numbering. The
names "M1–M4" in THE-SLICE refer to *the four playable slice quests* — these.

## 1. QUEST-SYSTEM REQUIREMENTS (what the engine HAS vs what the slice NEEDS)

**HAVE (proven, `QuestEngine` + HUD):**
- Data-driven quests; states `locked → available → active → complete` (+ `locked-out` pruned).
- **Steps** (`{id, desc}`) + per-quest **choices** (`{id,label,impact,karma,deed,unlocks,locks,ending,note}`).
- **Dialogue** graph (`{start, nodes}`; nodes have `speaker`/`text`/`options`; options carry `to`/`choice`/
  `deed`/`meta`/`end`; **`route` nodes** branch reactively on `ctx.karma`/deeds) — multi-path + reactive.
- **Karma + deed memory** (one engine) → NPCs/quests/endings react off the same memory; long-range
  reactivity (a quest can require a past deed; re-checks on every deed/phase change).
- **Persistence** (`save`): quest state + step + chosen + karma/deeds round-trip (SaveManager).
- **HUD tracker (T key):** `_trkPanel` cycles `2` (title+step) → `1` (title only) → `0` (off); reads active
  quests + the current step `desc`. **Objective arrow** (`_objArrow`) points to a quest target NPC/marker.

**NEED (confirm/build for the slice — itemised as Open Decisions D–H):**
| Need | Why | Status |
|---|---|---|
| **Journal screen (list)** | T shows the *active* objective; a full **J**ournal (active + completed + lore found) is richer | Decision D — minimum = the T-tracker; stretch = a journal list |
| **Multi-route step** ("any of N routes completes the objective") | M2 key/break/window all enter Maren's | engine handles via converging dialogue/door — confirm pattern, no fork-explosion |
| **NPC illness STATE that worsens over time** | M2 Maren can decline across a day-phase (soft fail) | small hook on TimeOfDay phase; quest-readable world flag |
| **Combat-quest completion** ("step done when den cleared") | M3 first combat | quest step completes on a combat-clear event (kill-count / region-cleared flag) |
| **`fire-responds-to-purity` visual** | M4 shrine + chapel ward read purity | render hook (tint/flicker by purity tier) — NOT quest-engine; flagged for the build |
| **Ability/tool unlock from a quest** | M3 the billhook/cut | a flag (`tool_billhook` new, or reuse the sword-cut) gates the bramble-choke |
| **Property unlock from a quest** | M4 ungates `greenhollow_house` | set the gate the shop reads (act-flag or a `gh_arc_done` deed) |

## 2. THE FOUR QUESTS

> Each quest below = the build's blueprint: **objectives (steps) · dialog beats · journal entries · rewards
> · karma touchpoints · fail/edge states · what it teaches.** Deed ids reuse the canonical SSOT where a fit
> exists (HARD RULE 5); **NEW deeds are flagged `[NEW-DEED]`** for `src/constants/deeds.js` (verify orphan-gate).

---

### GH1 — "Cold Hearth"  (tone: wholesome; teaches: the fetch loop + the first moral fork)

**One line.** A neighbour's kept flame died in the night; re-light it — but your one load of fuel can only
warm one of two cold hearths. *(Genre ref: Stardew "bring X to Y" warmth + a Fable moral pinch.)*

**Objectives (steps)**
1. `hear` — Mara's hearth has gone cold overnight; she's fretting (a kept flame must never die).
2. `fetch` — Get fuel: the store's out → gather deadfall/coal (Hodge's spare coal, or brook deadfall).
3. `fork` — On the way back, a shivering family on the green also has a dead hearth and no fuel. **Decide.**
4. `relight` — Re-light the hearth(s) per your choice; warmth returns.

**Dialog beats.** Mara (warm, fretting): "Went out in the night — first time in *years*. A cold hearth, in
*this* village. Be a love and fetch me a bit of fuel?" → Store: "Cleaned out, sorry — try Hodge, or the
brook." → Hodge (gruff, generous): "Take the coal. Costs me an hour at the anvil, but a cold hearth's a cold
hearth. Go on." → **The fork** (the green): a shivering parent + small child, dead grate. Mara's job, or
their need?

**Karma touchpoints (choices → deeds)**
- `share` — give the family the fuel; re-light Mara's later, cold-handed. *good* → `morality +10, purity +10`,
  `hearth_shared [NEW-DEED]`. (Seeds GH2: the family = Maren's household — they remember.)
- `job` — keep it for the job you were asked; hurry past. *neutral* → `hearth_hoarded [NEW-DEED]`.
- `take` — take the family's last kindling / charge them for yours. *dark* → `morality -15, purity -10`,
  `hearth_hoarded [NEW-DEED]` (+ a cold reputation; the family stays wary in GH2).

**Journal entries (T-tracker desc per step).** `hear`: "Mara's hearth has gone out — fetch her some fuel."
`fetch`: "Find fuel — the store's empty; try Hodge or the brook." `fork`: "Two cold hearths, one load of
fuel. Choose who to warm." `relight`: "Re-light the hearth." Complete: "You set Greenhollow's fires right —
for now."

**Rewards.** `share`: gold (small) + Mara's lasting warmth + the family's loyalty (GH2 hook). `job`: gold
only. `take`: gold + a cold rep. (All: the village now knows your face — the arc's social entry.)

**Fail / edge states.**
- Quest-giver (Mara) "dead"/absent → not possible in the slice (Mara is `posted`, protected-adjacent); if
  unreachable, the giver fallback is the **chapel acolyte** restating the need.
- Fuel "lost" (player drops/sells it) → the step is **stateful by world-flag, not a carried item** (re-light
  is a choice at the hearth, not "deliver item X"), so it can't be soft-locked by a lost item. *(Genre ref:
  avoid Fable's "lost the quest item" dead-ends.)*
- Out of order (player goes to the green first) → the family beat is **gated** until `fetch` is done (no fuel
  to give yet); they just shiver + foreshadow.
- Save mid-quest → step + any choice persist; resume at the current step.

**Teaches.** The fetch loop (hear → get → bring), the **T-tracker / objective arrow**, the **first moral
fork** (your help is finite — who gets it?), NPC gratitude/coldness reaction.

---

### GH2 — "Nobody Answered"  (tone: warm-worried → tender; teaches: multi-route objectives + an NPC state that can worsen)

**One line.** Old **Maren** hasn't opened her door in two days and the kids are scared; get in (key, or
break it), find her ill, and fetch the marsh-fringe remedy before she worsens. *(Genre ref: Zelda's
"sick NPC needs a cure from a dangerous edge" + Fable's break-in-with-consequence.)*

**Objectives (steps)**
1. `worry` — The kids (Pem/Tam/Nessa) flag you down: Maren's not answered in two days; her chimney's cold.
2. `enter` — Maren's door is **shut/locked**. Get in: **find the key**, **break it**, or **the back window**.
3. `find` — Inside: Maren is feverish, barely conscious. Old Edda names the cure: **fenwort**, from the
   **marsh fringe** (a safe edge of the gated Ashen Marsh — a *taste* of Region 1).
4. `remedy` — Fetch the fenwort from the marsh fringe + bring it to Edda; she brews it.
5. `cure` — Give Maren the draught; she recovers (or — see fail — has worsened).

**Dialog beats.** Kids (frightened): "She always answers. Always. Chimney's been cold since Tuesday." →
**The door** (reuses the DOOR SYSTEM knock/try/break): Knock — no answer; then **Try the handle** (gentle, if
unlocked / a found key) **or Break it down** (forced). → Inside (quiet, dim): Maren, fevered. Edda: "Fenwort.
Grows at the marsh's edge — mind you don't go *in*, just the fringe. Quick now." → Marsh fringe: a single
safe pick (the gated marsh looms beyond — curiosity hook for Region 1). → Edda brews → Maren wakes: "...Was
that *you* at my door? ...Bless you, child."

**Karma touchpoints (choices → deeds)**
- Entry — **key/window (gentle)**: `entered_uninvited` is NOT incurred if you found the key; a kind entry.
  → small `purity +`. **break (forced)**: reuse **`forced_entry`** → `morality -`, `purity -`; the village
  notes you smashed a sick woman's door (the kids flinch); Maren's door now needs the joiner (ties the repair
  system). *(This is the DOOR SYSTEM exercised inside a quest — deliberate reuse.)*
- Comfort the kids while you work → reuse **`comforted_child`** → `morality +10`.
- Speed — deliver same day-phase (`maren_healed [NEW-DEED]`) vs let a phase pass first (see fail).

**Journal entries.** `worry`: "The kids say Maren hasn't answered in two days. Check on her." `enter`: "Get
into Maren's — find a key, or force the door." `find`: "Maren is gravely ill. Ask Edda what she needs."
`remedy`: "Fetch fenwort from the marsh fringe; bring it to Edda." `cure`: "Give Maren the draught." Complete:
"Maren will live. The kids won't forget who came."

**Rewards.** Maren's blessing + the **fenwort remedy recipe** (Edda teaches you — a life-sim/learn hook) +
the kids as friends (callbacks). Gentle entry → a spare-key gift (re-enter freely). 

**Fail / edge states.**
- **NPC worsens (the time hook):** if the player lets a full **day-phase** pass between `find` and `cure`,
  Maren **declines** — the cure still works but the outcome is the "barely in time" variant (`maren_healed`
  with a sober epilogue line); a *second* phase → a **soft-fail** branch (`maren_failed [NEW-DEED]`: she
  pulls through scarred / a colder ending — never an unrecoverable dead-end in the slice). *(Decision F:
  how punishing? Default = warns, never hard-fails in the slice.)*
- **Item lost** (fenwort dropped) → re-pick at the fringe (the pick respawns; not a one-shot).
- **Quest-giver dead** — the kids are **protected** (HARD RULE: kids unharmable); Maren can't be killed by
  the player (she's behind a door). So no giver-loss dead-end.
- **Out of order** (player breaks in before talking to the kids) → entering still triggers `find`; the kids'
  worry beat back-fills. Save mid-quest → the illness state + step persist.

**Teaches.** **Multi-route objectives** (key/break/window → same goal), the **door system *in a quest***
(gentle vs forced, with the existing deeds + repair), an **NPC illness world-state that can worsen** (soft
time pressure), a **remedy-fetch that teases Region 1** (Metroidvania curiosity), `comforted_child` reuse.

---

### GH3 — "Teeth in the Orchard"  (tone: warm → first real danger; teaches: the cut ability + FIRST COMBAT + a lore hook)

**One line.** Something with teeth has denned in the bramble-choked back rows of the orchard; clear the
brambles, fight it out, and find what the last person to go in there left behind. *(Genre ref: Zelda's
first dungeon-lite + a clear-the-overgrowth traversal gate + a found letter that opens a thread.)*

**Objectives (steps)**
1. `report` — The orchard-keeper: trees torn, ewes spooked, *teeth* in the bark. The back rows are sealed by
   a **bramble-choke** he can't get through.
2. `cut` — Get a **billhook** (Hodge or the keeper) → **CUT** the bramble-choke open (the slice's cut/clear
   ability; also clears the cuttable props you've been seeing).
3. `den` — Beyond the brambles: the **den** — the slice's **first enemies** (small "orchard-teeth" pests,
   3–5, learnable — telegraph/hit/dodge/block). Clear them, or drive them off.
4. `letter` — In the den (a dead traveller's satchel) find a **sealed, water-stained letter**, addressed
   west. You can't open it yet — a hook.
5. `report-back` — Tell the keeper the orchard's safe.

**Dialog beats.** Keeper (rattled, proud): "Forty years I've kept this orchard and I've never— *teeth*, in
the *bark*. Back rows are thorn-choked solid; can't get a billhook's swing in there without losing a hand."
→ Hodge/keeper hands the **billhook**: "Mind the edge. Clears bramble *and* worse." → **CUT** the choke (cut
ability tutorial) → **the den** (first combat — the feel quest) → the satchel: a **sealed letter**, the seal
a symbol you don't know (the Marsh thread seed). → Keeper: "You went *in* there? ...Good as gold, you. The
orchard's yours to walk, any time."

**Karma touchpoints (choices → deeds)**
- The den — **clear (kill all)** vs **drive off** vs **spare the young** (a litter in the den): mercy →
  reuse **`mercy_shown`**; cruelty/overkill → `morality -`. → `orchard_cleared [NEW-DEED]`.
- The letter — **hand it to the keeper / chapel** (honest) vs **keep it** (curious/secretive): →
  `orchard_letter [NEW-DEED]` (records you hold the Marsh-thread hook; reactive later — ties the existing
  `drowned_letter` / Mara's-letters web).
- Credit — let the keeper take the credit (good) vs claim it (neutral).

**Journal entries.** `report`: "Something's denned in the orchard's bramble-choked back rows." `cut`: "Get a
billhook and cut through the bramble-choke." `den`: "Clear the den." `letter`: "Search the den." `report-back`:
"Tell the keeper the orchard's safe." Complete: "The orchard's quiet again — and you're carrying a sealed
letter nobody can read."

**Rewards.** The **billhook** (kept — a tool/cut ability), the keeper's standing (free orchard access +
apples), **the sealed letter** (lore item — opens the Marsh thread), den loot (gold + a drop). First-combat
confidence.

**Fail / edge states.**
- **No billhook → can't reach the den** (the bramble-choke is a hard gate); the keeper re-offers it (can't
  be permanently lost). *(Decision G: `tool_billhook` new flag vs reuse the existing sword-cut.)*
- **Player flees combat** → the den persists "active"; re-enter to finish (no soft-lock; enemies don't
  despawn the quest).
- **Death in the den** → respawn per the death rule (`applyDeathPenalty`); the den state holds; retry.
- **Item lost** (the letter) → it's a **quest-flag**, not a droppable inventory item (recorded on pickup), so
  it can't be lost. Save mid-quest → den-cleared count + step persist.

**Teaches.** The **cut/clear ability** (traversal gating — the bramble gate), the **FIRST COMBAT** (the
feel quest: telegraph/hit/dodge/block — Van's feel-judgment, THE-SLICE step 5 overlaps here), a **found-lore
item that seeds a future region** (Metroidvania curiosity), mercy-vs-cruelty in combat (`mercy_shown`).

---

### GH4 — "The Boarded Cave"  (tone: mystery / weight; teaches: exploration payoff + the lore reveal + moral fork #2 + property)

**One line.** With the village steadied, you finally open the boarded cave — and find the **dead
ember-shrine** beneath Greenhollow, grieving in the dark; what you do with that truth closes the arc.
*(Genre ref: Zelda's long-teased sealed door finally opening + a Fable truth-vs-comfort fork.)*

**Objectives (steps)**
1. `earn` — Having helped the village (GH1–GH3 done), you have standing: the chapel acolyte (or Edda)
   relents about the boarded cave — or you decide to open it regardless.
2. `descend` — Open the boards (the existing boarded cave; reuse `cave_lore`) and go down.
3. `shrine` — The **dead ember-shrine**: the weeping-flame carving, the cold that **reads your purity**
   (pure → the carving glows faint; corrupt → it weeps darker — `fire-responds-to-purity`). The lore payoff:
   a fire-shrine that *grieves*, sealed under the chapel.
4. `fork` — **What do you do with what you found?** (moral fork #2).
5. `home` — Return to the surface; the arc closes; the village is yours.

**Dialog beats.** Acolyte (uneasy): "The boards stay up. Tradition. ...You've done right by this village,
though. If anyone's earned a look, it's you. The Flame keep you." → **Descend** → the shrine (quiet, cold;
the carving; the purity-read on the fire). A single resonant line, not exposition: *"Scratched deep into
cold stone: a flame, weeping. The chapel's ward hums faintly, far above — keeping this asleep. You don't
have all of it. You have enough to know the warm story isn't the whole story."* → **The fork** → surface;
the acolyte (or Mara) marks you as Greenhollow's own.

**Karma touchpoints (choices → deeds)**
- `tell` — Tell the village/acolyte the shrine grieves (honest; unsettles the warmth; the acolyte is shaken,
  the ward "feels watched"): *truth* → `shrine_told [NEW-DEED]`, `purity +`. 
- `keep` — Keep it to yourself; protect the village's warmth, carry the weight alone: *weight* →
  `shrine_kept [NEW-DEED]` (a quietly heavier adult tone; ties the "weight in the world" rule). Reuse
  **`cave_lore`** on either path (you *saw* it).
- `desecrate` — pry the carving / loot the shrine (darker): `morality -, purity -`, `shrine_looted [NEW-DEED]`
  (the dead shrine "weeps darker"; a corrupt-path seed). *(Decision E: keep this 3rd option or cut to 2?)*

**Journal entries.** `earn`: "You've earned the right to open the boarded cave." `descend`: "Open the cave and
go down." `shrine`: "Something is down here. Look." `fork`: "Decide what to do with what you found." `home`:
"Return to Greenhollow." Complete: "Greenhollow is whole again — and you carry its oldest secret."

**Rewards.** **The lore** (`cave_lore` — the secret-ending seed, already canon). **PROPERTY UNLOCK:** the
**`greenhollow_house`** becomes **buyable** (the existing property item; GH4-complete ungates it — you belong
here now). A keepsake (a rubbing of the weeping-flame carving / a cold cinder from the shrine). **Arc-complete
recognition** (the village treats you as one of its own).

**Fail / edge states.**
- **Out of order** (player opens the cave before GH1–GH3) → Decision E: either the boards are a soft gate
  ("you've not earned this yet" / the acolyte refuses) **or** it's openable anytime but the property unlock
  still requires the arc done. Default: **openable anytime (the childhood `cave_lore` already lets a player
  in), but the property + the acolyte's blessing require GH1–GH3.**
- **Shrine "looted" then player wants the good path** → the fork is **once** (committed deed); honest reload
  is the player's choice (no mid-quest undo). 
- **Property bought then save/load** → ownership persists (Inventory.property; SaveManager round-trip).
- Save mid-descent → step + fork persist.

**Teaches.** **Exploration payoff** (the long-teased cave finally opens — the Metroidvania reward), the
**lore reveal** (show-don't-tell dread; the warm story cracks), a **second weighty moral fork** (truth vs
comfort), the **property/ownership system** (you can own a home in the village you saved).

## 3. EXHAUSTIVE PASS/FAIL TABLE — the case list the build must cover

> Every quest × every path × every edge, REAL input, fresh save (THE-SLICE method 2). The build's table
> asserts each row; pixel-truth for any visual (the shrine purity-glow, the tracker text).

**Per quest, the START/STEP/COMPLETE spine** — for GH1–GH4 each: (a) starts when its giver/trigger is met;
(b) the **T-tracker shows the right objective** at each step (text matches the journal entry); (c) the
**objective arrow** points to the next target; (d) completes on the final step; (e) reward applied
(gold/item/flag/property); (f) **save/load mid-quest resumes the exact step + any choice**.

**Per FORK — each branch fires its deed + karma exactly once:**
- GH1: `share` / `job` / `take` → correct deed + karma; the family reacts (warm/neutral/wary); GH2 reads it.
- GH2 entry: **key/window** (no `forced_entry`) vs **break** (`forced_entry` + repair scheduled + kids
  flinch); `comforted_child` if you comfort the kids; **timing** → healed / barely / `maren_failed`.
- GH3 den: kill-all / drive-off / **spare-young** (`mercy_shown`); letter **kept vs handed** (`orchard_letter`);
  combat-clear completes the step; death-in-den respawns + holds state.
- GH4 fork: `tell` / `keep` / `desecrate` → deed + `cave_lore`; **property unlocks on complete**; opening
  out-of-order behaves per Decision E.

**Cross-quest reactivity (the deed-memory payoff):**
- GH1 `hearth_shared` → GH2's family/Maren greet you warmer; `hearth_hoarded`/`take` → cooler.
- GH2 `forced_entry` → the village (and a GH4 NPC) note you smashed a sick woman's door.
- GH3 `orchard_letter` (kept) → a reactive line in GH4 / a future Marsh hook.
- GH4 complete → `greenhollow_house` appears in the shop (Decision A/property gate).

**Engine/edge invariants (gate-or-eyes-on):**
- No soft-lock: every step completable by ≥1 always-available route; no item-loss dead-end (quest state is
  world-flags, not fragile carried items).
- Quest-giver loss impossible (givers `posted`/protected; kids unharmable).
- Out-of-order safe (steps gate their prerequisites; back-fill where natural).
- Persistence: states/steps/choices/deeds/property round-trip (extend `greenhollow.test.js` patterns).

## 4. VAN-TEST SCRIPT (~6 min, FRESH load — F8/hard-refresh first)

1. **GH1 Cold Hearth:** Mara flags the cold hearth → fetch fuel (store empty → Hodge) → at the green, hit the
   **fork**; pick **share** → re-light; confirm the **T-tracker** tracked each objective + the **arrow**
   pointed; confirm gold + a warm line. (Re-run picking **take** on a fresh save → a cold reaction.)
2. **GH2 Nobody Answered:** kids flag Maren → her door: **Try the handle / find the key** (gentle) → inside,
   Maren ill → Edda → **marsh fringe** fenwort → brew → cure. Then a fresh run: **Break** the door → confirm
   `forced_entry` (morality dip + the joiner comes to mend it) + the kids flinch. Dawdle a day-phase → the
   "barely in time" line.
3. **GH3 Teeth in the Orchard:** keeper → get the **billhook** → **CUT** the bramble-choke → fight the **den**
   (telegraph/hit/dodge/block — *Van feel-judges the combat*) → find the **sealed letter** → report back.
4. **GH4 The Boarded Cave:** open the cave → the **dead ember-shrine** (watch the carving **react to your
   purity**) → the **fork** (tell/keep) → surface → confirm the **`greenhollow_house` is now buyable**.
5. **Persistence:** save mid-GH2, reload → resume the exact objective. **Journal (T):** cycles full/title/off.
**PASS = all four playable start→reward, forks fire, no soft-lock, the combat feels right (Van), and the
deed-memory callbacks land (GH1 choice colours GH2; break-in is remembered).**

## 5. OPEN DECISIONS FOR VAN (please mark each)

- **A. Numbering.** Slice arc as **new ids `GH1–GH4`** alongside the existing childhood `M1–M6` (my default),
  or re-home the M-numbering? (The childhood spine is referenced by the adult callbacks + endings — I
  recommend NOT clobbering it.)
- **B. Maren = ?** A **new ailing-elder NPC** (my default; the kids' gran), or map onto an existing villager?
  (Not Mara — she's the GH1 baker; not Edda — she's the healer who *names* the cure.)
- **C. The marsh-fringe.** A **safe edge of the gated Ashen Marsh** as a Region-1 teaser (my default), or keep
  the fenwort inside Greenhollow's own woods (no cross-region tease yet)?
- **D. Journal depth.** Slice ships the **T-tracker only** (active objective + arrow — my default), or build a
  fuller **Journal list screen** (active + completed + lore found) now?
- **E. GH4 fork width + gating.** Keep the **3-way** fork (tell/keep/**desecrate**) or **2-way** (tell/keep)?
  And: cave **openable anytime** (property gated on the arc) or **boards gated** on GH1–GH3?
- **F. GH2 illness punishment.** Soft (warns, never hard-fails in the slice — my default) or a real **fail
  state** (Maren can be lost if you dawdle)?
- **G. The cut ability.** A **new `tool_billhook` flag** gating bramble (my default — clean Metroidvania
  gate), or **reuse the existing sword-cut** (no new tool, the bramble just needs the sword)?
- **H. New deeds OK?** This spec proposes `[NEW-DEED]`: `hearth_shared`, `hearth_hoarded`, `maren_healed`,
  `maren_failed`, `orchard_cleared`, `orchard_letter`, `shrine_told`, `shrine_kept`, `shrine_looted`. Approve
  for `src/constants/deeds.js` (the verify orphan-gate requires them registered before the build references
  them), or trim/rename?
- **I. Combat enemy.** GH3's "orchard-teeth" pest as the slice's **first enemy** — reuse the existing
  charger archetype reskinned, or a new small enemy? (THE-SLICE step 5 is combat-feel; GH3 is where it lands.)

---
**Hand-off:** canon (`LORE-CANON.md`) + this spec are ready for the ~2-min review. **No build starts until
Van approves/edits** — especially Decisions A, B, E, G, H (they shape the data + the SSOT ids).

---

## HOOK PACING — the temporal-crowding rule (town-feel item 7c, 2026-06-13)

Van's playthrough finding: at the adult return, hooks STACK — GH1–GH4 plus SG1/SG2/SG3 all surface at once, a
wall of tasks. The rule, now standing for every quest:

1. **One task lands at a time.** A new OPTIONAL hook gates on PROGRESSION (`requires.quests`/`requires.deeds`)
   or on DAY (`requires.phase`) so it opens only after the player has cleared what's already on their plate.
   *Applied:* `SG1` (Fatley's Mug) now `requires: { quests: ['GH1'] }` — it no longer piles on with the main
   arc; it opens once GH1 is done. The same gating is the lever for every future hook.
2. **At most one NEW hook per `QUEST_HOOKS.HOOK_MIN_INTERVAL_DAYS`** (standards.js, default 1 in-game day) —
   the design target so offers fan out across days rather than dropping together. A soft ceiling
   `MAX_CONCURRENT_OFFERS` (default 3) bounds how many side hooks may be available at once.
3. **Mechanism vs. rule.** The *live* mechanism is the existing `requires` gating (no new engine). The
   per-interval throttle is a DESIGN rule today (author hooks behind progression/day); a runtime throttle that
   actively defers a 2nd same-day offer is logged as future work in `docs/DEFERRED.md`.
4. **Authoring checklist for any new hook:** does it gate behind the prior step (progression) or a day? If two
   hooks would open on the same trigger, stagger one behind the other. Main-arc beats are exempt (they ARE the
   spine); this rule governs OPTIONAL side hooks.
