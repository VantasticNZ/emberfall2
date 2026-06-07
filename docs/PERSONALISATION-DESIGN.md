# PERSONALISATION — "it knows me" (design capture, build LATER)

A covert personalisation layer for the whole game: the world quietly reads how you play and,
much later, shows you it was *paying attention* — so it lands as **being seen, not surveilled**.
Plus the comedy/metafiction furniture that rides on the same machinery: a belief fork across
public-domain pantheons, a false-godhood long-con, a rival who thinks he's the protagonist, and
an extended cameo / NZ-gag / thought-experiment slate.

**CAPTURE ONLY — no gameplay code this session.** This enriches but does NOT block the region/HUD
work; build it AFTER (sequence in §10). All payoffs are local/save-state. It threads onto the
EXISTING engines (Karma + deed-memory, the planned [[relationships-companions-design]] affinity,
Dialogue, QuestEngine, the cameo layer in `src/data/quests/cameos.js`) — write-once, all DATA.

## Safety rails (apply to EVERY figure below — non-negotiable)
- Every figure is **clearly-fictional pastiche**, **historical / public-domain**, or
  **player-authored** — NEVER a scripted portrayal of a *living named real person*.
- Never minors in any inappropriate frame; **witty, never explicit**; licence-first.
- **Religion:** warm, tongue-in-cheek, light ribbing only. **NEVER** a "your faith / your founder
  is a fraud" punchline for ANY religion. Lampoon a *practice* or an *icon's vibe*, never a creed's
  truth-claim or a believer.
- Reproduce **no copyrighted scripts/lyrics** — wink at a phrase/beat, don't quote the work
  (esp. ad scripts, song lyrics, the South Park/Book-of-Mormon musical).

---

## 1. PRINCIPLE
The model is the **Ultima IV gypsy / fortune-teller** pattern: a fortune-teller who, hours in,
describes *you* from choices you forgot you made. The feeling to chase is **"huh — it noticed,"**
delivered as warmth, never as a creepy dossier. Concretely:
- Profiling is **covert** (innocent-seeming prompts, never a survey screen) and **derived** from
  the deed-memory + karma + affinity you already build by playing.
- Payoffs are **local and save-scoped** — nothing leaves the machine; this is a literary trick,
  not telemetry.
- The whole arc ends with a **late-game REVEAL**: a seer (or the Rival/trickster, gently) names
  what the world learned about you — your archetype, your epithet, who you kept close, what you
  most wanted to behold — so the profiling resolves as *being known and liked*, not surveilled.

---

## 2. THE PROFILER + PERSONAL-STAKES RESOLVER (the core mechanic)
Reuses Karma + deed-memory + the (planned) `affinity` helper. All write-once + DATA.

### 2.1 The profiler — covert axis prompts
Scatter ~5 innocent-seeming prompts across existing quests, each tagging ONE axis as a deed
(no new engine — `karma.recordDeed`). Axes (proposed):
- **archetype** — which playstyle you gravitate to (warrior / rogue / mage / talker / explorer),
  derived passively too (see 2.3) but nudged by a "what did you bring on the road?" prompt.
- **virtue** — an Ultima-IV-style which-do-you-prize (courage / compassion / honesty / cunning…).
- **behold** — "what would you most cross the world to *see*?" (the sea / a god / home again / the
  truth) — paid off at a vista or the Spire.
- **humour** — registers your humour from which optional gags you *engage* (dry / silly / dark /
  wholesome), tuning later quip variants.
- **belief-posture** — devout / sceptic / curious / mercenary (feeds §3's fork + the humanist branch).
Each prompt records `profile_<axis>_<value>`. A `Profile.read(axis)` derives the dominant value
(most-recorded / affinity-weighted) for later callbacks.

### 2.2 The PERSONAL-STAKES RESOLVER (refactor, not new fakery)
Today PH1 / PH4 / M16 each *fake* "someone you care about is at stake." Replace with one reusable
resolver that makes it land for real:
```
resolveStakes(ctx, token) -> { npcId, name, known:boolean }
```
- Swaps the "nameless" dilemma token for the player's **highest-affinity known NPC** (via the
  affinity table); records a deed when they're sacrificed (e.g. `cart_sacrificed_known`,
  `veil_sacrificed_known`) that **echoes later** — their absence is felt; if spared, **trust
  shifts** toward you.
- **Loner fallback:** if you've kept everyone at arm's length, the token resolves to a *stranger* +
  a quiet realisation that you have no one close — which is **itself characterising** (records
  `kept_all_distant`, feeds the §1 reveal).
- **Refactor targets:** PH1 *The Runaway Cart* (Sundered Peaks), PH4 *The Veil* (Emberwood),
  M16 *Caught Settlement / Ember Hollow* (Emberwood) all **CALL** `resolveStakes` instead of each
  scripting a generic victim. (Their existing tests still pass; the resolver is additive.)

### 2.3 Tie-ins
- **Earned epithets** — derive a title from the deed-memory and let NPCs *address you by it*:
  `coin_returned` → "the Coin-Returner"; `chicken_kicked` → "the Chicken's Bane"; `mercy_shown` →
  "the Merciful." A `Profile.epithet()` returns the dominant earned title; greetings interpolate it.
- **Playstyle-reactive seeding** — what spawns/offers itself leans into `archetype` (a fence offers
  the rogue lockpicks; a hedge-mage greets the mage) — data-gated, no new engine.
- **The Spire ally** — who shows up beside you at the endgame is the highest-affinity recruit
  (the companions §B / ending-support tie-in). The profiler's reveal can name *why* it's them.

---

## 3. THE BELIEF FORK + DEITIES (player-driven, public-domain pantheons)
A dialogue where a wanderer/priest asks if you've heard of the legendary gods and **which you
favour**. The pick sets `belief_<pantheon>` (or `belief_none`) and determines which **couple of
deities manifest** later as cameo encounters. Comedy hook each (one-liners; full writing at build):

**GREEK** — *Hermes* (a trickster-merchant who keeps "accidentally" short-changing you — catch him
and prices flip your way); *Hades* (dry, weirdly *fair* — the underworld bureaucrat who plays it
straight); *Dionysus* (runs a tavern that is suspiciously, dangerously *too good*); *Athena*
(rewards the **cunning** solution over the brute one).

**EGYPTIAN** — *Anubis* (weighs your **deed-memory** against a feather = a literal karma read-out of
your morality/purity — diegetic stats screen); *Thoth* (a know-it-all scribe who corrects your
grammar mid-quest); *Bastet* (a cat that is *very* clearly more than a cat); *Set* (a charming,
fluent liar — an `[Insight]` playground).

**NORSE** — *Odin* (trades **an eye for a secret** — a real, costed knowledge bargain); *Loki*
(see also the Rival's energy); *Hel* (waits, courteous, at the boundary); *Ratatoskr* (a squirrel
who sprints **insults between two NPCs** — a delivery side-gag).

**THE EMPTY ALTAR (tend no shrine) → the HUMANIST payoff.** Choosing `belief_none` is **not** a
dead branch: you get an equally good arc — a **fellow traveller**, not a god, who shows up when it
counts because *people* do (records `humanist_path`; can become a companion). The game never
punishes unbelief; it just answers it differently.

**UNCHOSEN GODS RETURN, MIFFED.** Later, deities you *didn't* pick turn up a bit hurt — "we heard
you've been praying to **Athena**. After everything." + a comedic, **non-punitive** slap (a puff of
soot, your purse jingles lighter for a day, a goose appears). Light. Never a real penalty.

---

## 4. THE FALSE-GODHOOD RED HERRING (comedic long-con)
An NPC plants a rumour of a secret **path to become a god**; the player gets excited (records
`godhood_rumour_heard`). Escalating absurd tasks, each its own micro-gag:
- gather **10,000 apples** (it tracks; the count is the joke);
- **kiss 1,000 people** (consent-gag: most decline, some charge a toll);
- *"drink the blood of a beloved animal"* — framed so you **can't / won't**: you *love* the animal;
  the option is **blocked** or, if forced, **tanks Morality and is never rewarded** (the "test" was
  whether you'd betray something you love — refusing is the right answer).
The path **isn't real.** Pay off with a reveal: the rumour-monger (or one of the §3 miffed gods)
**doubled over laughing** — "you were *gathering apples*?" Records `godhood_hoax_seen`. You keep the
apples (→ §6 pie chain). No lasting harm; the bit *is* the reward.

---

## 5. THE RIVAL — metafiction protagonist
Build later as a reusable **`RivalController`** mirroring the `EnemyController` / `AllyController`
follow-plumbing (scripted edge-of-scene business; **no real AI**). Deeds: `rival_item_stolen`,
`rival_bested`, `rival_shamed_you`.

- **The conceit:** he believes **HE'S the main character** and you're an NPC — "nice line-reading,
  NPC," "get a *grip*, background character." He genuinely believes he's a real **17-year-old from
  an ordinary NZ town** (a clearly-fictional comic character, not a real person). His hometown-
  booster shtick is **"Marvellous Murupara,"** and he'll die on the hill that **Gore** is the best
  place on earth — *this is the NZ-town-booster gag, folded into him.* The game **never confirms**
  whether he's deluded, glitched, or simply right. (That ambiguity is the whole joke.)
- **Ambient presence (cheap to fake):** caught in your **peripheral vision** — fighting monsters
  three screens over, striding through a quest that isn't yours, chatting up an NPC you know. All
  scripted set-dressing, never simulated.
- **Flaunts gates you can't pass yet (Metroidvania beat):** **dashes across a chasm** you can't
  cross, brags about an ability you don't have, **won't tell you how**, throws a rude gesture,
  dashes off. Returns once you've earned the tool — mildly annoyed you caught up.
- **Beats you to a quest item and TAKES it** (`rival_item_stolen`) — you recover it via **fight /
  steal / outwit** (the first PvP-flavour encounter; `rival_bested`).
- **Appears on a pivotal BAD moral choice** to say, quietly, **"for shame"** (`rival_shamed_you`) —
  the one time the clown is sincere.
- **One late "looks at the camera" / glitch beat — used ONCE, sparingly.** He can **mock your
  profiler playstyle** ("a *talker*. of course you are.") — the only place the §2 profile leaks out
  early, as a wink.

---

## 6. CAMEO ROSTER (extends `src/data/quests/cameos.js` — clearly-fictional/historical)
Existing layer: CAM1 Diogenes (*Diogo the Barrel*, Peaks), CAM2 Sisyphus, CAM3 Napoleon-height,
CAM4 Sagan/Stardust, CAM5 time-traveller, CAM6 Chill Prophet (Emberwood), CAM7 Blow-on-the-Pie,
EDG1/EDG2, GAG1, NIGHT1. New/enriched:

- **DIOGENES (enrich CAM1):** add the **"nowhere fit to spit but the rich man's face"** beat — he
  surveys the marble hall, finds it all too fine to foul, and chooses the host. (+humour tag.)
- **SAGAN → PIE → COP chain (extends CAM7):** a villager wants an **apple pie** → a Sagan pastiche:
  *"If you wish to make an apple pie from scratch, you must first invent the universe"* → you make an
  **`apple_pie`** item (food→HP hook, real economy item) → **eating it** triggers the cop's full
  road-safety wink: *"…that pie's been in the warming drawer ~12 hours — it'll be thermonuclear.
  Always blow on the pie. Safer communities together, OK?"* The "burn" is a **COMEDY beat, NOT HP
  damage** on a heal item. (Apples can come from the §4 hoard.)
- **SCIENCE_ADVICE running gag:** a **pool the quest layer calls at decision points** — real
  scientists' lines weaponised into *useless* advice, then the scientist **STRUTS off** like they
  helped (make the strut a **reusable animation tag** `anim_strut`, reused by the false-godhood
  monger etc.). Seeds (wink the idea, don't quote at length):
  - *Sagan* — "extraordinary claims require extraordinary evidence" re: *is the bridge safe?*
  - *Heisenberg* — knows **where** the enemy is OR **how fast**, pick one; also: knows exactly where
    *you* are, no idea where you're *going*.
  - *Schrödinger* — you're **both** ambushed and safe until you look.
  - *Newton* — you'll continue in a straight line forever… (as you near a cliff).
  - *Darwin* — "you'll find out if that mushroom's edible — rather the point."
  - *Einstein* — time's relative; you're early.
  - *Curie* — "just check the glow." *Mendel* — "come back in eight pea-generations."
- **JOSH / YESHUA (reframe CAM6):** fabulous and sassy; **"ahh, men"** misheard as *"amen"*; orders
  **"only water"** and he and his followers all crack up; introduced as "Jesus," he waves it off —
  **"no no — call me Josh."** **NO "borrowed from Buddha" line.** Warm, never a creed-jab.
- **BUDDHA:** a **warm, jolly wisdom figure** — affectionate ribbing of the *laughing-Budai*
  iconography (the round happy statue), **never a sneer**. Optionally **Josh and Buddha are peers who
  rib EACH OTHER** (two good-natured legends trading friendly shade — the joke is their warmth).
- **JOSEPH SMITH pastiche** *(Van is Mormon, ribbing his own faith — cheerful, never "con man",
  **no jail**):* reads from a **seer-stone in his hat**; has a pet **WHITE SALAMANDER** — *a wink at
  the **Hofmann "Salamander Letter"** forgery saga (Mark Hofmann's 1980s forged document that briefly
  claimed a white salamander in the founding story; later exposed as a forgery — we wink at the
  **myth/forgery lineage**, not the faith)*; a cheerful-absurd **many-wives** aside; hums a generic
  **"dum dum dum"** tune to himself — a **melodic wink ONLY, reproduce no musical lyrics.**
- **SCIENTOLOGY:** the **tomato-poking e-meter / "auditing"** parody — lampoons the *practice* (you
  solemnly audit a vegetable for "engrams"), clearly absurd, no named living person.
- **Historical / mythic slate:** *Pythagoras* (won't cross a **bean field** — reroute him); *Archimedes*
  (**eureka** / displacement **water-puzzle**, real mechanic); *Heraclitus* (won't give the **ford**
  the same way twice); *Cassandra* (a **100%-true prophecy no NPC believes** — you alone can act on
  it); *Ozymandias* (a ruined colossus + the **"two vast trunkless legs"** melancholy lore beat);
  *Mary Shelley's creature* (the **gentlest** soul in the scariest place); *Don Quixote* (the
  **windmill** — *correct* him −joy, or *play along* +Morality and he **knights** you); *Baba Yaga's*
  **chicken-legged wandering hut** (a shop that's never where it was); **Pandora's JAR** (a sealed
  *jar* — lampshade the box/jar **mistranslation** — you're begged not to open it; opening releases
  the ills and, last, **Hope**).

---

## 6.5 FATLEY — the lazy-quest-guy (the marker-onboarding character, REDESIGN)
An original comedic NPC, not a cameo of a real figure. Fatley is the diegetic teacher of the
quest-marker system (see §quest-marker onboarding in STORY-AND-QUESTS / QUESTS-SIDE-FLESH G1) — but
the redesign makes his *characterisation* do the teaching, and resequences him to late childhood.

- **CHARACTER (posture before speech):** **very fat** and **SITTING** — the laziness reads instantly
  from his shape + pose before he says a word. Found in a **quiet, out-of-the-way spot** (a back lane
  / a stump by the wall — **NOT the main plaza**), so reaching him is a small act of curiosity.
  - ⚑ ASSET/RENDER: needs a **sitting + heavyset pose** (the cast is the standing LPC rig today) and a
    **"?" marker indicator** over his head — a "?" (not the standard "!"), signalling *"something here,
    but not what you'd expect."* FLAG both as asset/render work; do not fake (omit the pose/"?" and
    place him standing with no marker until the art lands, rather than a placeholder).
- **THE COMEDY BEAT (the improvised quest):** he acts like he **didn't know he had a quest** — caught
  out, he **stutters and visibly invents one on the spot**, and the thing he "needs" is **right in
  front of him** (he's just too lazy to reach it). The absurdity IS the characterisation.
  - *Sample tone (final lines at build):*
    - *(you approach the "?" — he startles)* "Wh— oh. Oh aye. You're here for the… the **quest**.
      Course you are. The big important— *[he scans around, panicking]* …right. **Right.** See that?
      The, ehm— the **mug**. By me foot. Aye. It's, ah… **cursed**. Deeply. Can't touch it meself,
      it's a whole— it's a *family* thing. You wouldn't get it. Fetch us it, would you, champion."
    - *(you pick up the mug — it is, indeed, right there)* "…Knew you had it in you. Right, since
      you've gone and *earned* it — folk with work to give wear a little mark, see. A **'?'**. Most
      can't see 'em. You want the knack of it, you can **get** it now. Don't go telling 'em Fatley
      gave you nowt. *[burps, settles back down]*"
- **TONE GUARDRAILS:** affectionate, never cruel; he's a likeable bludger, not a target. No fat-shaming
  punchline — the joke is the **laziness + the made-up quest**, his shape is just instant read.

**REWARD = an UNLOCK, not a grant (preserve the opt-in).** Completing the mug bit does **NOT
force-grant** marker sight. It **opens the OPTION to acquire** the "marker-observing" trait — it
becomes **buyable / learnable** (a Rogue/Social skill point), and the player still **chooses** to take
it. Fatley is the **template** for the established "the lazy-guy *teaches*, you still *buy* the skill —
choice intact" rule (`docs/SYSTEMS-DESIGN-V2` see-quest-markers). The marker trait is the *door that
opens*, not a thing pushed on you.

**PLACEMENT / TIMING:** **late childhood** — one of the **last kid-phase goals** (around M5, before the
M6 catastrophe), **not** the early onboarding beat. So markers arrive as a **late, discovered reward**
after the player has already learned to find their own way (see the onboarding resequence in
GAPS-AND-DEPTH §4 + STORY-AND-QUESTS). *(Build note: this resequences the current SG1 from the act-2
adult-return hub to late act-1 childhood — see QUESTS-SIDE-FLESH G1 for the quest data + the test
update the build will need.)*

---

## 7. NZ GAG PACK (generic pastiche, **not brands** — same lane as Blow-on-the-Pie)
- **TOGS / UNDIES:** a guy wandering town in swimwear; the **further from the water** you spot him,
  the more NPCs mutter *"…undies"* (the togs→undies escalation; **structure only**, no ad script).
- **GHOST CHIPS:** a ghostly passenger who *"can't eat your **ghost chips**"* (a wink at the NZTA
  "Legend" ad — **the phrase/gag only**, don't reproduce the script).
- **PAVLOV'S DOG-TRAINER:** a trainer with a **bell** and salivating dogs — doubles as the
  **Pavlov / classical-conditioning** cameo (ring it and watch).
- **"yeah, nah / nah, yeah"** indecisive merchant (prices **flip-flop** as he talks himself round).
- **Sausage-sizzle ONIONS-ON-THE-BOTTOM** moral fork (place the onions under or over the snag — a
  tiny, deeply-felt local dilemma).
- **A "chur" / "ka pai" kaumātua** (a warm elder who blesses good deeds).
- **A KEA** that **dismantles your pack for shiny bits** while you're mid-conversation.
- **Hokey-pokey** as a **legendary reward** (treated with mock-epic reverence).
- **A "bro, is it tho?" corner-philosopher** who **out-Socrateses** you (ties to §8).
- **A "she'll be right" speed-wobble** skill-check that is, in fact, **not right**.
- **A "world famous in New Zealand"** local-fizzy-drink vendor — *generic pastiche of the
  "world-famous-in-NZ" boast, no real brand/logo* (the L&P wink, kept generic).

---

## 8. THOUGHT EXPERIMENTS — existing vs new
**ALREADY BUILT (confirm they read right; do NOT rebuild):**
- **PH2** *Barber of Saltbreak* — Russell's paradox (who shaves the barber). *(tidewreck.side.js)*
- **PH3** *Grandfather's Axe* — Ship of Theseus. *(greenhollow.side.js)*
- **PH5** *Experience Stone* — Nozick's experience machine. *(ashenmarsh.side.js)*
- **PH6** *Buridan's Mule* — comic indecision. *(greenhollow.side.js)*
(Also live: PH1 Runaway Cart / PH4 Veil — being **refactored** onto the §2 resolver.)

**NEW (cap the set here):**
- **DESCARTES** — an NPC **doubting his own existence** until he reasons back ("I doubt, therefore
  I think, therefore…"). **Ties to the Rival's existential crisis** (the one NPC who'd take the
  Rival's "am I real?" seriously). Records `cogito_seen`.
- **MARY'S ROOM** — a scholar who **knows everything about colour** but has only ever **seen grey**;
  the quest is to show her one true colour (qualia). Records `marys_room_seen`.

---

## 9. PROPOSED SSOT IDS (LIST ONLY — do NOT add to `src/constants/` this session)
The later build session adds these to `deeds.js` / `flags.js` / `items/` **when wired**, so
`npm run verify` stays green now. Proposed:
- **profiler:** `profile_archetype_*`, `profile_virtue_*`, `profile_behold_*`, `profile_humour_*`,
  `profile_belief_*`, `kept_all_distant`
- **personal-stakes:** `cart_sacrificed_known`, `veil_sacrificed_known`, `settlement_sacrificed_known`
- **belief fork:** `belief_greek`, `belief_egyptian`, `belief_norse`, `belief_none`,
  `humanist_path`, `god_miffed_seen`
- **false godhood:** `godhood_rumour_heard`, `godhood_hoax_seen` (+ counters, not deeds)
- **rival:** `rival_item_stolen`, `rival_bested`, `rival_shamed_you`
- **cameos / NZ / thought-experiments:** `apple_pie` (item, food→HP), `pie_cop_warned`,
  `science_advice_taken`, `josh_water_round`, `buddha_met`, `seer_stone_read`, `salamander_seen`,
  `emeter_audited`, `togs_undies_seen`, `ghost_chips_declined`, `pavlov_rung`, `kea_looted`,
  `quixote_knighted`, `pandora_opened`, `hope_kept`, `cogito_seen`, `marys_room_seen`
- **anim tag:** `anim_strut` (reusable strut for the science-advice / hoax-monger)
- **late reveal:** `seer_named_you` (the §1 closing beat)

---

## 10. BUILD ORDER (after the region/HUD work — does NOT block it)
1. **Profiler + personal-stakes resolver** *(most reuse; touches existing PH1/PH4/M16)* — the
   `Profile` helper (derive over deeds/affinity), `resolveStakes`, epithets. Unit-test like
   `Social.test.js`; keep the existing PH tests green.
2. **Belief fork + deities** — the fork dialogue + `belief_*` flags + a couple of deity cameos per
   pantheon + the humanist branch + the miffed-gods return.
3. **The Rival** — `RivalController` (reuse the companion follow-plumbing) + the ambient/flaunt/
   steal/shame beats + the single camera-glance.
4. **Cameo / NZ / thought-experiment additions** — extend `cameos.js`, the science-advice pool +
   `anim_strut`, the Sagan→pie→cop chain (`apple_pie`), the NZ pack, Descartes + Mary's Room.
5. **The late REVEAL** — the seer/trickster names your archetype, epithet, who you kept close, what
   you wanted to behold (`seer_named_you`) — closing the loop as *warmth*.

> Dependencies: Karma/deeds (exist) · affinity (companions design — to build) · Dialogue/QuestEngine
> (exist) · cameo layer (exists) · Economy items for `apple_pie` (exists). Nothing here gates a
> region; ship regions without it and layer it in as DATA + small helpers.
