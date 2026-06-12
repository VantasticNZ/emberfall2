# SPEC — CHILDHOOD / ADULT STRUCTURE (the Greenhollow opening, done right)

> **HARD RULE 12 — full-expectation spec, pre-build. SPEC ONLY. NO BUILD until Van approves/edits.**
> **STATUS: PROPOSED.** Genre reference: **Fable's Oakvale** — you play your hero as a CHILD (chores, small
> moral choices, a warm village), a catastrophe ends childhood, a time-skip returns you grown, and the town +
> the people REMEMBER what the child did. We already have the bones of this (M1–M6 childhood spine → M6 burns
> → `time_skip` → M7 adult return; `player.isAdult/isMinor` flags; child deeds already echo in adult dialog).
> This spec makes it a REAL, legible age-state opening instead of a narrated one.
>
> **What already exists (build on, don't re-invent):**
> - `greenhollow.js` M1–M7: M1 A Greenhollow Morning · M2 Chores+Mischief (chicken) · M3 The Coin · M4 The
>   Boarded Cave · M5 The Festival · M6 The Night It Burned (→ `time_skip`) · M7 Ten Winters Gone (adult).
> - `time_skip` deed = the child→adult flip; `actOf(karma)` already returns Act 2 once it's set.
> - `player.isAdult/isMinor` (set per-scene from `combat.adult` in RegionScene; hardcoded adult in Overworld).
> - Soft-guidance hooks: the objective ARROW (`_npcByQuest[qid]` → on-screen pointer), the quest TRACKER
>   (`_trkState`, shows the current step desc), the `skill_see_markers` "?" over quest-givers.
> - Child→adult echoes already in data: M7 `forge_hard` route on `grief_vengeance`; SG7 locked-out by
>   `chicken_kicked`; the `wooden_toy` keepsake (Bram's carving, M1) as a callback item.
> - The `set:'advance:<qid>'` / `set:'complete:<qid>'` dialogue commands (built in town-feel 7a) — the
>   foundation for §4's objective system.

---

## 1. AGE-STATE SYSTEM

**One source of truth — derive, don't duplicate.** Age is not a new stored flag; it is **derived from the
existing `time_skip` deed**:

```
isChild(karma)  =  !karma.hasDeed('time_skip')
isAdult(karma)  =   karma.hasDeed('time_skip')
```

`time_skip` is recorded at the end of M6 (the burning → "Ten Winters Pass"). Before it: CHILD. After it:
ADULT. This means the flip is already authored, already saved, already drives `actOf` (Act 1 vs Act 2). The
scene's `player.isAdult/isMinor` get **wired from this** (today Overworld hardcodes adult — that becomes
`this.player.isAdult = isAdult(this.karma)`), so the running game knows which age it is on every load.

**What the age-state GATES** (all via the EXISTING `requires`/gating patterns + small additive guards — no new
engine):

| Domain | CHILD | ADULT | Mechanism |
|---|---|---|---|
| **Quests** | M1–M6 only (the child spine) | GH1–GH4, M7+, every side hook | `requires:{deeds:['time_skip']}` on adult quests; M1–M6 require `notDeeds:['time_skip']` (or are simply complete by then) |
| **Combat** | OFF — a child doesn't fight; the sword is unequippable, enemies don't spawn in child-GH | ON | child-GH region `combat.enabled=false`; equip guarded on `isAdult` |
| **Economy / items** | can't buy weapons/armour; child shop = sweets, a toy, bread, a kite | full stock | shop entry `requires:{age:'adult'}` (a new tiny `meetsRequires` axis → `karma.hasDeed('time_skip')`); weapon/armour `type` auto-gated for children |
| **Doors** | KNOCK only — a child can't force/break a door | knock / try / force | the FORCE option in `_openDoorChoice` shown only when `isAdult` |
| **Dialog register** | NPCs speak to "the little terror"; child topics (play, dares, "mind Old Edda") | adult register + the grief/reputation callbacks | already partly there (M1 Bram "little terror"); adult routes exist (M7) |
| **Abilities / interactions** | child-appropriate: CHASE (the hen), FETCH (eggs), HIDE, CLIMB-a-fence, skip-stones — play, not violence | the full traversal toolkit | child interactions are `via:` classes (reach/search/chase); adult tools gate as today |

**Design rule:** the age gate is a THIN axis on the systems we already have (`requires`, shop `meetsRequires`,
the door choice, combat.enabled). No parallel "child engine". One new `requires.age` value (`'child'`/`'adult'`)
resolving to the `time_skip` check covers quests + shops uniformly.

---

## 2. THE CHILD OPENING

**Wake as a child — in the family cottage.** Proposed from existing cast/lore (Open Decision A):
- **Home:** Mara & Bram's cottage (the existing GH home — M1 already opens "Mara is calling from downstairs",
  Bram "down at the forge").
- **Guardians:** **Mara = the mother** (warm, calls you up, sets the chores), **Bram = the father/smith** (the
  "little terror", carves you the `wooden_toy` keepsake — the callback object that survives the fire). Bram is
  the one who DIES in M6 (the grief weight); Mara survives into adult GH (Open Decision A confirms who lives).

**The OBVIOUS first thread (soft guidance, Pillar 4).** A child should never be lost:
1. Wake in bed → Mara's line downstairs ("the hens won't feed themselves; Bram's asking after you").
2. The objective ARROW + tracker point to **Bram at the forge** ("Find Bram"). The forge has a "!" marker.
3. Bram gives the `wooden_toy` + the soft brief ("mind the hens, say hello round the square").
4. The thread hands off to M2 (the chicken chores) — a real go-and-do (see §4): the tracker now points to the
   **coop**, then the **runaway hen**.

So the player is led by ONE bright thread (arrow → Bram → chores), never a wall of options. This is the Oakvale
"follow your sister / the trader" onboarding, mapped onto our cast.

**M1–M6 become the playable CHILD ARC** (not narrated): each is doable by DOING, per §4. The chicken (M2) is the
exemplar — fetch eggs at the coop, water the saplings at the brook, chase Henrietta to her pen, then the seeded
catch/kick/free choice. M3 (find a dropped coin → return/keep), M4 (sneak to the boarded cave — a child dare),
M5 (the festival — hang lanterns, games), M6 (the fire — flee, the grief vow). All on the child-GH variant.

---

## 3. TWO GREENHOLLOWS — a variant LAYER, not two towns

**Conservative scope (Open Decision C):** ONE Greenhollow region with an **age-variant delta** applied at build
time from `isChild`. NOT a duplicate region, NOT two scenes. The town's bones (streets, seams, the plaza) are
shared; a small **delta set** swaps what visibly differs:

| Aspect | CHILD-GH (10 winters earlier) | ADULT-GH (current, = today's build) |
|---|---|---|
| Scale | slightly **smaller/simpler** — a few lots empty or mid-build (scaffold props); the outer ring not yet dressed | the full built town (today) |
| The forge | a **smaller** forge (Bram's) — a modest prop variant | the upgraded forge (Hodge's, current) — visible GROWTH |
| The chapel cave | the cave is **open / unboarded** (the child can sneak in — M4) | **BOARDED** (GH4's planks) — the same spot, changed |
| People alive/present | **Bram alive** at the forge; Mara young; the kids are toddlers/absent; the slice cast (Maren, Bracken, Acolyte) NOT yet here | Bram **gone** (the fire); the adult cast present; kids grown (Nettle/Wisp) |
| Props/dressing | fewer market stalls, a child's swing/kite by the cottage, festival prep in M5 | today's dressing |
| Tone tint | warmer/brighter daylight bias | today |

**Implementation shape (for the build, later):** the region data gains an optional `childDelta` block — a list
of `{ add:[props], remove:[propIds/npcNames], swap:[{from,to}] }` applied when `isChild`. Everything not in the
delta is shared. This keeps it a **layer over the existing town** (Van's conservative ask), and the "visible
growth" (forge upgraded · cave boarded · Bram's absence) becomes the emotional payoff of the time-skip.

**The growth the adult notices** (the Fable "the town remembers" beat): the boarded cave where you used to play;
Bram's cold forge now Hodge's; your `wooden_toy` on the shelf; an NPC who says "you've grown" / "your father
would be proud." These are dialog + 2–3 prop deltas, not a rebuild.

---

## 4. QUEST-OBJECTIVE SYSTEM (the engine gap — now required)

**The gap (named in town-feel 7a):** quests are narrated dialogue; there is no way for a quest STEP to advance
because the player physically DID a thing in the world, and the objective arrow only points at NPCs. A child arc
of "chores" is hollow without this. **Smallest honest version:**

**(a) Quest objectives as DATA.** A quest step may carry a physical objective:
```
steps: [{ id:'eggs', desc:'Fetch eggs from the coop by the brook', objective:{ type:'reach'|'interact'|'talk', target } }]
```
- `type:'reach'` — walk within R of a tile `target:{tx,ty}` → advance.
- `type:'interact'` — press E on a quest-prop `target:'<propId>'` → advance (reuses the interactable system).
- `type:'talk'` — talk to an NPC `target:'<name>'` → advance / open the step's dialogue.

**(b) Quest-PROPS in the world.** A region placement may tag itself to a quest objective:
```
{ key:'prop_coop', x,y, quest:'M2', objective:'eggs', prompt:'Gather the eggs' }
```
Interacting fires the existing **`set:'advance:M2'`** path (already built) → the tracker advances. The hen-pen
prop presents the catch/kick/free choice (a dialogue at the prop) then `set:'complete:M2'`.

**(c) Tracker ARROW + MARKERS point at the current objective** (Pillar 4 soft guidance). Extend `_npcByQuest`
(NPC-only today) to a general `_objTarget[qid]` that resolves to **an NPC OR a tile/prop** — the on-screen arrow
+ the edge marker point at the active step's target. The `see_markers` "?" generalises to objective markers
(a "!" over the next thing to do). Off-screen → an edge chevron; on-screen → a small bob over the target.

**(d) Doable by DOING, not chat.** With (a)–(c), M2 plays as: arrow→coop (reach) → arrow→saplings (interact) →
arrow→hen-pen (interact → choice). No conversation collapses the quest. This is the bar for EVERY childhood
chore and the pattern adult quests adopt next.

**Reuse, not new engine:** the interactable classes (reach/search/interact) exist; `advance:`/`complete:` exist;
the arrow + tracker exist. The new pieces are: the `objective` field on steps, the `quest`/`objective` tag on
props, and generalising the arrow target from NPC-only to NPC-or-location. That is the *whole* system.

---

## 5. TRANSITION — how childhood ends, what carries

**The beat (already drafted in M6):** the Hearthflame Festival's flame erupts → Greenhollow burns → the child
flees into the ash → the **grief choice** (a vow of vengeance vs a vow to protect — `grief_vengeance` /
`grief_vow`) → a **"Ten Winters Pass"** time-skip card (fade / short montage) → `time_skip` recorded → you walk
back in **grown** (M7). Bram is gone; the town is changed (§3).

**Spec the transition presentation (currently just a dialogue end):**
- A held black card: *"Ten winters gone."* (+ optional 2–3 line montage of what the vow shaped).
- On fade-in: adult-GH loads (the variant flips because `time_skip` is now set), the adult body/equip is enabled,
  the HUD's combat affordances unlock.

**What CARRIES — the Fable trick (child deeds echo in adult):** the child's choices are karma SEEDS that the
adult world reads. These already exist in data; the spec's job is to make them VISIBLE and list them:

| Child deed (Act 1) | Echo in Adult GH |
|---|---|
| `chicken_helped` / `chicken_kicked` / `chicken_freed` | the hen's owner is warm / cold (kicked → **locks SG7 ally**; the hen cameos darkly at the Spire) |
| coin honesty (M3: `coin_returned` / kept) | a shopkeep trusts/mistrusts you (price/greeting tint) |
| `greeted_warmly` / `kept_to_self` (M1) | the village greets the adult fondly or coolly |
| `cave_lore` seed (M4 child secret) | the boarded-cave arc (GH4) reacts to having been there as a child |
| `grief_vengeance` / `grief_vow` (M6) | the adult TONE — `forge_hard` route already exists; extends to more NPCs |
| `wooden_toy` kept | an NPC notices the keepsake — "your father carved that" |

**Rule:** every child moral beat must land at least ONE adult echo (a line, a price, a lock/unlock). That is the
payoff that makes the childhood matter — the spec requires each M1–M6 choice to name its adult echo.

---

## 6. WHAT GH1–GH4 NEEDS (data change only)

GH1–GH4 are the adult slice arc. Today they're `act:2` by metadata but not age-enforced. **Data-only change:**
- `GH1` gains `requires:{ age:'adult' }` (i.e. `deeds:['time_skip']`) → the slice arc is unreachable as a child;
  GH2–GH4 already chain off GH1, so they inherit the gate.
- No dialog/logic change to GH1–GH4 themselves. (The earlier `cave_lore`/`orchard_letter` reactivity stays.)
- Verify: a `no-adult-quest-as-child` check (a child save shows GH1–GH4 locked) — a small gate addition.

---

## 7. EXHAUSTIVE CASE LIST (the table the build must pass)

**Age-state**
1. Fresh game (no `time_skip`) → `isChild` true; player renders child-scaled; sword unequippable; combat off.
2. After M6 completes (`time_skip` set) → `isAdult` true; sword equippable; combat on; adult body.
3. Reload mid-childhood → still child (derived from save, not a runtime flag).
4. Reload post-time-skip → adult; adult-GH variant loads.

**Child opening / guidance**
5. Wake → Mara's call → arrow + "!" point to Bram at the forge; no other hook competes.
6. Reach Bram → `wooden_toy` granted; thread hands to M2; arrow moves to the coop.
7. At every child step the tracker shows ONE clear objective; the arrow always resolves to a live target.

**Quest-objective system**
8. M2 `reach` the coop → step advances (no dialogue needed).
9. M2 `interact` the hen-pen → the catch/kick/free choice → `complete:M2` → quest done by DOING.
10. Objective arrow points to a TILE (the coop) not just an NPC; off-screen → edge chevron.
11. A quest-prop with no matching active quest → inert (no phantom advance).

**Two Greenhollows**
12. Child-GH: smaller footprint, open cave, Bram present, slice cast absent, child props (swing/kite).
13. Adult-GH: today's town, boarded cave, Bram absent, adult cast present.
14. The SAME region key in both ages — no duplicate scene; the delta is additive/removable cleanly.
15. Walk the seams/entrances in child-GH → still coherent (no void, no broken doors).

**Age gating**
16. Child tries to buy a sword → refused (age); child shop shows sweets/toy, not weapons.
17. Child at a locked door → KNOCK only (no force/break option).
18. Child swings near an enemy spot → no combat (enemies absent; sword inert).
19. Adult → all of the above unlocked.

**Transition + echoes**
20. M6 fire → grief choice → "Ten Winters Pass" card → adult-GH on fade-in.
21. `chicken_kicked` as a child → SG7 ally locked as an adult (existing) + the owner is cold.
22. `greeted_warmly` as a child → adult village greets fondly (a measurable dialog/price tint).
23. Each of the 6 child moral beats produces ≥1 adult echo (named in §5).

**GH1–GH4 re-gate**
24. Child save → GH1–GH4 all locked (age gate).
25. Adult save → GH1 available; the arc plays as today.

**Pixel-truth / HARD RULE 9** (at build): screenshot child-GH vs adult-GH (the visible growth), the child's
opening arrow, and a child-doable chore in progress.

---

## 8. VAN-TEST (hand-off, post-build)

- Start a NEW game → you're a CHILD in Mara & Bram's cottage; one bright thread leads you to Bram, then chores.
- Do the chicken chore by DOING (walk the coop → the brook → chase the hen) — never resolved in a chat box.
- Try to buy a sword / force a door as a child → you can't (age-appropriate).
- Live through the fire → "Ten Winters Pass" → you return GROWN to a CHANGED Greenhollow (boarded cave, Bram's
  cold forge, your toy on the shelf).
- Feel the echoes: talk to the hen's owner / the village and notice they remember the child you were.
- Confirm GH1–GH4 only open as the adult.

---

## 9. OPEN DECISIONS (Van's calls — shape the data + SSOT before build)

- **A — Child's home + guardians.** Proposed: Mara (mother, survives) + Bram (father/smith, dies in the fire,
  carves the `wooden_toy`). Confirm who lives/dies and whether the home is a new interior or the existing GH home.
- **B — Child arc length.** Proposed: the full M1–M6 spine, ~15–25 min of play. Trim to a tighter M1–M3 + M6 if
  shorter is wanted? (Affects how much child-GH content to build.)
- **C — What visibly changes in adult GH.** Proposed minimal delta: forge upgraded · cave boarded · Bram absent ·
  your toy on a shelf · kids grown. Add more (a burned lot rebuilt, a memorial) or keep it to these 3–5?
- **D — Age axis id.** Proposed `requires:{age:'child'|'adult'}` resolving to the `time_skip` deed (one new
  `meetsRequires` axis). OK, or gate purely on `deeds:['time_skip']`/`notDeeds:['time_skip']` (no new axis)?
- **E — Objective system scope for v1.** Proposed: `reach` + `interact` + `talk` objectives, quest-props, and an
  arrow/marker that targets a location. Is a hen ACTOR (a moving sprite to chase) in scope, or is "reach the pen"
  enough for v1? (A moving hen needs a small actor + sprite — flag as its own decision.)
- **F — Transition presentation.** Proposed: a held "Ten winters gone" card + optional montage. Full montage now,
  or the card only for v1?
- **G — Does the slice (GH1–GH4) stay playable WITHOUT the childhood** (a "skip to adult" for testing / returning
  players), or is the childhood mandatory before the slice? (Affects the re-gate + a possible debug skip.)

---

**Hand-off:** this spec is ready for the ~2-min review (HARD RULE 12). It builds on what exists (the M1–M7
spine, `time_skip`, the age flags, the arrow/tracker/markers, the `advance:`/`complete:` commands) and proposes
the smallest honest additions (an age axis, a child-GH delta layer, the quest-objective system). **NO BUILD
until Van approves/edits — especially Decisions A, C, E, G (they shape the data, the SSOT, and the build size).**
