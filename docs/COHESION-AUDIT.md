# COHESION AUDIT — the whole game vs locked design intent (2026-06-15)

Read-only analysis. NO code changed. Verifies built content (childhood M1–M7, adult M8–M20, side quests,
all regions incl. the new Saltbreak) against six locked intents. Each section: **what's COHERENT** ·
**DRIFT / GAP / DEAD-END** (with file:line) · then proposals (§2) and a prioritised fix-list at the end.

> Method: four parallel source sweeps over `src/data/quests/*`, `src/systems/Karma.js`, `src/data/{gating,economy,items,world,worldmap}.js`, and `docs/{LORE-CANON,STORY-AND-QUESTS,MASTER-WORLD-SPEC,WORLD-MAP}.md`.
> Verdicts and flags below are my synthesis. **Nothing here is fixed — this is the report.**

---

## 1. CHILDHOOD → ADULT PAYOFF
**Intent:** childhood deeds/choices carry a traceable consequence into adulthood.

### COHERENT (deed × adult echo)
| Childhood choice (recorded) | Adult echo |
|---|---|
| `chicken_kicked` (M2, greenhollow.js:122) | M7 hostile henwife (greenhollow.js:383) · SG7 ally LOCKED (greenhollow.side.js:182) · **chicken cameo M18** (spire.js:144) · epilogue ET1 (spire.js:257) |
| `chicken_helped` / `chicken_freed` (M2) | M7 cb_chicken route · Ada greetByDeed (world.js:311) |
| `coin_returned` / `coin_kept` (M3, greenhollow.js:163/166) | M7 McCracken warm vs wary (greenhollow.js:392–402) · GHUB l_coin (greenhollow.side.js:235) |
| `cave_lore` (M4 weeping-flame carving, greenhollow.js:206) | **Ashbearer ending gate** (Karma.js:62) · epilogue ET10 (spire.js:287) · GHUB l_cave |
| `grief_vengeance` / `grief_vow` (M6, greenhollow.js:295/298) | M7 forge_tone route (greenhollow.js:412) · epilogue ET2 (spire.js:259) |
| `time_skip` (M6→M7) | gates the entire adult slice GH1–GH4 (greenhollow.slice.js:21) |
| `sela_trusted` (M7, greenhollow.js:350) | M17 reads it (spire.js:34) |
| `hearth_shared` / `hearth_hoarded` (GH1, slice.js:33/36) | GH2 Nettle greets warm vs cool (slice.js:119–128) |
| `maren_healed` (GH2) | Maren greetByKarma (world.js:249) |
| `mercy_shown` (GH3, slice.js:189) | **Saint + Liberator ending gates** (Karma.js:52/58) |
| `orchard_letter` (GH3) | GH4 acolyte names Bracken's letter (slice.js:274) |

This is a **strong, working seed-and-payoff system** — the chicken cameo (M18/ET1), the coin/grief/hearth
callbacks, and `cave_lore`/`mercy_shown` feeding the ending gates are all live and traceable.

### DRIFT / DEAD-END
- **DEAD-END deeds (recorded, never read in adulthood):** `coin_gifted` (greenhollow.js:169), `told_adult`
  (M4, :203), `dared_friend` (M4, :209), `ignored_unease` (M5, :248), `comforted_child` (M5, :245 — also
  recorded by GH2 but no adult read found), `orchard_cleared` (GH3, slice.js:192), `sela_doubt` (M7, :353),
  `bram_greeted` (world.js). These move karma but **no NPC/world/quest ever reads the specific choice.**
- **⚠ THE EMBER-SHRINE FORK (Van's flagged case) — PURITY-ONLY, no narrative echo.** GH4's
  `shrine_told` / `shrine_kept` / `shrine_looted` (slice.js:261/264/267) each record a deed **and move purity
  (+10 / 0 / −15)** — but **nothing downstream reads WHICH you chose.** No acolyte/villager/ending text
  acknowledges "you told the truth about the shrine" vs "you looted it." The choice's only consequence is its
  purity delta feeding the ending math. The *childhood* shrine beat (`cave_lore`, M4) DOES pay off; the *adult
  slice* shrine fork's specific outcome is a **silent purity tick.** This is the clearest drift in §1.
- **`sela_doubt` (M7 "press her") is a DEAD-END** even though it reads like a deliberate doubt-seed; M17 reads
  `sela_trusted` but not `sela_doubt` (spire.js:34) — pressing Sela as a child currently changes nothing.

---

## 2. RETURNING CHARACTERS
**Intent:** some childhood characters return as adults where the story earns it.

### COHERENT (returns that work)
- **Mara** — full hub return + a moral gate (SG4 "Mara's Letters"; can be `mara_exposed` → ET3). world.js:177.
- **Phil McCracken** — returns, greets reactively on the M3 coin choice. greenhollow.js:392–402.
- **Sela** — returns as the central antagonist/oracle (M7 → M17 permanent decision). world.js:271, spire.js.
- **Nettle** — returns small in GH2, remembers the GH1 hearth choice. slice.js:113–128.
- **Ada / the Henwife** — returns, reactive to the M2 chicken choice. world.js:308–311.
- **Bram** — **dies in M6 by design**; returns only as memory (M7 forge line, SG3, GHUB, ET2). Correct.

### DRIFT / DEAD-END
- **WISP (childhood playmate) — VANISHES at the time-skip.** `childOnly:true` (world.js:288), **zero adult
  content.** A named childhood peer with no grown-up echo — the most visible "vanished character."
- **TAM returns but FLAT.** Present in the adult hub (world.js:235, `adultOnly:false`) but his adult dialogue
  reads **no childhood deed** — he dared you to the cave in M4 (greenhollow.js:213) yet never references it as an
  adult. A return with no payoff.
- **EDDA** appears in GH2 (slice.js:147) as the remedy elder but has **no world.js placement** — dialogue-only;
  fine, but worth confirming she's intentionally off-map.

### PROPOSED RETURNS — for Van to approve (drawn from the existing story, NOT invented)
1. **WISP, grown.** Place an adult Wisp in the Greenhollow hub (the obvious mirror to the grown player). Wire a
   greeting that reads a shared-childhood deed — e.g. the M4 cave (`cave_lore` / `dared_friend`) or the M2 hen.
   *Earned by:* she was your closest-named playmate; her absence is the one that reads as a hole.
2. **TAM, deed-reactive.** Keep Tam where he is; branch his adult greeting on `cave_lore` / `dared_friend` (he
   dared you in) and `chicken_*`. *Earned by:* he's already present — this only makes his existing return *mean*
   something. Lowest-effort, highest-coherence.
3. **`sela_doubt` payoff.** Have M17 read `sela_doubt` (the child who pressed her) as a small foreshadow — e.g. a
   line where Sela notes "you always did ask the wrong question." *Earned by:* it's a planted seed already in the
   data; only the read is missing.

*(These are options, not directives — each is a single NPC/dialogue wiring, no new design.)*

---

## 3. PURITY — is it a real second axis?
**Intent:** a real second axis — gates quests/dialogue, changes how people deal with you, pure↔corrupt.

### COHERENT (purity actually does something)
- **The chapel flame tints to live purity EVERY FRAME** (OverworldScene.js:798–803): gold+steady (pure) /
  cold-blue+flinching (corrupt) / orange (neutral). The single best, always-on expression of the axis.
- **The GH4 shrine carving reads purity** into 3 distinct routes (slice.js:294–295: ≥20 glows / ≤−20 recoils / else cold).
- **Sela's M17 betrayal HARDNESS gates on purity** (spire.js:51: `hagga_reported || purity ≤ −20` → vicious).
- **SP5 "Stranger's Plea" outcome gates on purity** (sunderedpeaks.side.js:163: ≤−20 → you're used as a thug).
- **Shop access:** `blessed_charm` requires purity ≥20 (economy.js:46); `corrupt_blade` requires purity ≤−20 (+ morality, economy.js:56).
- **Ending gates:** Liberator REQUIRES purity ≥20 (Karma.js:58); Tyrant REQUIRES purity ≤−20 (Karma.js:55).

So purity is **NOT cosmetic** — it gates two endings, two shop items, and changes the shrine/flame/Sela/SP5.

### DRIFT / GAP
- **⚠ "Changes how people deal with you" is FALSE for everyday NPCs.** `greetByKarma` (the system that changes
  NPC greetings, e.g. Hodge world.js:220, Maren, McCracken) keys on **MORALITY tiers, not purity.** Outside the
  shrine/flame/Sela/SP5, **no ordinary NPC reacts to your purity.** This is a direct miss against the intent.
- **No MAIN quest gates on a purity threshold.** Every purity read is a side-route tone, a shop item, or the
  endgame. Purity never opens/closes a quest or area.
- **Purity is rarely INDEPENDENT of morality (≈91% co-move).** Only ~3 choices move purity alone: GH2 gentle
  entry (+5, slice.js:100), the M13 smuggler/authority lean (±10, tidewreck.js:28/31), and SP5's outcome
  (−5). The rest move both axes together, so "pure-but-cruel" / "corrupt-but-kind" states are hard to actually
  reach — blunting the two-axis design.
- **COSMETIC purity moves (move, never read):** GH2 gentle (+5), cameos `stardust` (+5) / `raid_joined` (−5),
  SP5 `stranger_used` (−5, the outcome is already decided by the gate that set it). Childhood purity moves
  (coin/chicken/dare) are **never read in Act 2+** at all.

**Verdict:** purity is a *real* axis at the **endgame + shrine/flame** layer, but a **thin** one in the
moment-to-moment world — it doesn't change how the village/townsfolk treat you, and it mostly rides morality.

---

## 4. TONE — wholesome-deep core + a thread of rude/dark humour
**Intent:** wholesome/sad/serious core WITH a deliberate rude/dirty/dark-humour thread (joke names KEPT), balanced.

### COHERENT — and notably disciplined
- **Both registers present and SEPARATED by place:** Greenhollow warm (with dread underneath), Ashen Marsh
  grave, Tidewreck mixed (pragmatic smuggling + heartfelt loss), Emberwood magical-heartbreaking, Spire transcendent.
- **Joke names sit on SIDE characters only** (Hugh Jass tidewreck.js:41, Fazy Lastard, Wayne Kerr, Amanda
  Hugginkiss, Phil McCracken, Mike Hunt, Ben Dover/Dixie Normous cameos.js:336) — **main cast (Bram, Hagga,
  Sela, Mara) is NEVER punned.** Correct discipline.
- **Holden McGroin (a pun name) is played ENTIRELY STRAIGHT** (tidewreck.side.js:92–96, mirrors Bram's loss) —
  sophisticated: the name sets up a gag, the beat delivers grief. The serious beats (M6 Bram, M16 god's agony
  emberwood.js:100, M19 the god entire spire.js:182, SG4 Mara's brother) are **protected from comedy.**
- **R18-but-not-explicit line held** (EDG1 panty-raid cameos.js:275, SG5 tankard songs) — cheeky, never explicit, no minors.

### DRIFT / minor flags
- **No real tonal CLASH found** — the strongest near-miss is EDG1 (panty-raid farce) and ST3 (Holden's grief)
  sharing the Tidewreck region; both are optional side quests and separable, but a player doing them back-to-back
  could feel the jar. Low risk; worth a sequencing note, not a fix.
- **Two regions sit almost entirely in ONE register** (Ashen Marsh ≈ all-grave, Spire ≈ all-serious). This is
  *intentional* per LORE-CANON (no jokes where the lie cracks / at the finale), but it means the rude-humour
  thread is **concentrated in Greenhollow's tavern + the Coast + the cameos** — if Van wants the thread felt
  more evenly, the Marsh/Emberwood are where it's absent by design.

**Verdict:** tone is the most COHERENT dimension — both registers live, balanced, and the joke-name-played-straight
technique is a genuine strength. No fixes needed; only the EDG1/ST3 adjacency is worth a glance.

---

## 5. NARRATIVE THROUGH-LINE + ENTAILMENT
**Intent:** the shard/betrayal-truth/First-Flame spine holds childhood myth → Spire with no dropped threads;
do outcomes GATE content (real branching) or only move karma?

### COHERENT — the spine holds, no dropped threads
Beat-by-beat (all cited, all paid off):
1. **Weeping-flame carving** (M4, greenhollow.js:206) → first seed of the god's suffering.
2. **Festival flinch** (M5, greenhollow.js:261) → dread.
3. **The Night It Burned** (M6, greenhollow.js:302) → Bram lost; "the Flame must be tended" (Sela's first whisper).
4. **SHARD #1 + the TRUTH** (M9/M10, ashenmarsh.js:120/160): the Hearthflame is a **bound, screaming god**. PERM-1.
5. **SHARD #2** (M12, sunderedpeaks.js:105): the Order **KNEW and chose the lie "for order."**
6. **SHARD #3** (M14, tidewreck.js:98): a past oracle **betrayed their own** to hide a shard — foreshadows Sela.
7. **SHARD #4 + the AGONY** (M16, emberwood.js:100): you *feel* the god's child-pain. PERM-2 (mercy/seize/take).
8. **M17 Sela's Design** (spire.js:50): her betrayal lands hardest if you sold Hagga out / went corrupt. PERM-3.
9. **The Ascent** (M18, spire.js:144): deed echoes; **the chicken returns.**
10. **Binding Chamber + SHARD #5** (M19, spire.js:182): the god entire.
11. **M20 The Choice** (spire.js:212): Warden / Saint / Tyrant / Liberator / Ashbearer — only *reachable* endings offered.

**No contradictions; every planted thread (carving, festival, Bram, the chicken, the five shards, Hagga's exile,
the oracle betrayal, Pem's graffiti) is paid off.** This is the game's strongest spine.

### Real branching vs karma-only — the honest picture
- **REAL content gates exist, concentrated in 3 PERMANENT decisions + the L-path:**
  - PERM-1 (M10): REPORT Hagga → `hagga_reported` **LOCKS the Liberator path** (she vanishes).
  - PERM-2 (M16): SEIZE → `god_seized` LOCKS L, opens T.
  - PERM-3 (M17): TRUST Sela LOCKS L; OPPOSE (needs Hagga ally) opens the L endgame.
  - `chicken_kicked` LOCKS the SG7 orchard-kid ally (greenhollow.side.js:182).
- **EVERYTHING ELSE is karma + epilogue, not gated content.** The ~11 epilogue cards (ET1–ET11, spire.js:257–288)
  are a rich payoff, but they are **end-screen text**, not mid-game branches. Side-quest and faction choices
  (M11/M13 leans, SE2, ST5, the cameos) feed **karma + an epilogue card**, not new quests or areas.

### DRIFT / GAP
- **⚠ The world is a LINEAR tool-gated DAG; the branching is back-loaded.** Mid-game, a choice changes *karma*
  and an *NPC's greeting tone* and an *epilogue card* — it rarely opens/closes *content*. The genuine forks are
  the 3 permanent decisions + the Liberator lock. That's coherent and shippable, but against "do outcomes gate
  later content (real branching)" the honest answer is: **only at those 3 hinge points + the L-path** — the rest
  is reactive flavour, not divergent content.
- **The 5th ending (Ashbearer) gate leans on `cave_lore`** (Karma.js:62) — a childhood deed almost everyone
  earns (you nearly always learn the carving). Confirm it's meant to be that easily reachable, or it wants a
  second, rarer gate.

---

## 6. REGION CONNECTIVITY + ECONOMY CURVE
**Intent:** sensible gating/difficulty; coherent economy GH→Saltbreak (≈2g→3000g).

### COHERENT — connectivity is clean
Strict DAG, tool-gated, **no out-of-order access, no soft-locks** (gating.js:16–24):
| Region | Entry gate | Tool earned | Shard |
|---|---|---|---|
| Greenhollow | open | — | — |
| Ashen Marsh | open (W belt) | **lantern** | shard_1 |
| Sundered Peaks | **shard_1** (rockfall) | **grapple** | shard_2 |
| Tidewreck Coast | **grapple** (river-gorge) | **hookshot** | shard_3 |
| Emberwood | **hookshot** (chasm) | **firefrost** | shard_4 |
| Hollow Spire | **4 shards + firefrost** (frozen ascent) | — | shard_5 |
**Saltbreak connects sensibly** — grapple opens the Coast, the Coast spine reaches the `city_saltbreak` door
(worldmap.js:705), the city is a walkable scene with a clean `back` exit. Teases (pond-island→hookshot,
boarded-cave→lantern) and ability-gates (cut/dash/fire/bomb/electric/wind/ice) are all **optional caches** — none on the critical path.

### COHERENT — economy scales
T1 **2–25g** (apple 2 → leather 25) → T2 **35–150g** (steel 80, peak_mail 120) → T3 **120–260g** (crag_maul 250,
tideglass 260, tower_shield 240) → **property sinks 1500–3500g** (greenhollow_house 1500, saltbreak_shop 3500).
Quest gold: GH **5–12g** → Marsh SA3 **200g** → Peaks/Coast/Ember **150–280g**. Start gold 20 (economy.js:89).
Per-region buy/sell multipliers create coherent arbitrage (Coast cheap, Spire dear).

### DRIFT / GAP
- **One boundary JUMP:** GH quests (5–12g) → the Marsh lantern-loot SA3 (**200g**, ashenmarsh.side.js:92) is a
  16–40× single step. Bridged by jobs + accumulation, and it's a gated loot quest, so it reads as a deliberate
  spike — but it's the one place the curve lurches. Flag, not a bug.
- **⚠ Act 3 has NO gold rewards** (M17–M20 grant truths/shards only). Late-game gold has **only property to
  sink** (1500 / 3500), and rent income (25–60g/day) can't matter before the ending — so a player who didn't buy
  property ends with **dead excess gold and nothing to spend it on.** A late-game sink/use gap.
- **Minor:** SA3 rewards `marsh_blade` — confirm it's a defined item (cited but not in the main weapon list I saw);
  if it's a one-off it's fine, just verify it exists.

---

## PRIORITISED FIX-LIST

### A. WIRE (small, data-only, high cohesion-per-effort) — ✅ ALL 5 DONE 2026-06-17
1. ✅ **TAM deed-reactive adult greeting** `e429ff14` — greetByDeed on `dared_friend` / `cave_lore` / `chicken_kicked` (the shared cave-dare). (§2)
2. ✅ **Ember-shrine fork echo** `84d48b2d` — the Acolyte's greetByDeed reads the specific `shrine_told` / `shrine_kept` / `shrine_looted` choice (was purity-only). (§1) *The headline drift.*
3. ✅ **`sela_doubt` payoff** `47b48e7e` — M17 routes through a `doubt_check`; `sela_doubt` → a `doubt_seen` foreshadow before the reveal. (§1/§2)
4. ✅ **Purity touches everyday NPCs** `f58fd5a1` — added a `greetByPurity` tier to `_greetSet` (read before greetByKarma); wired on Maren/Acolyte/Sela so a pure vs corrupt soul is treated differently AT EQUAL morality. Proven by verify:runtime T15. (§3) *The clearest intent-miss, now closed.*
5. ✅ **Cleared the dead-end childhood deeds** `2aed6096` — `coin_gifted`→McCracken, `comforted_child`→Maren, `orchard_cleared`→Bracken, `told_adult`→Acolyte (each a greetByDeed read). (§1)

*All 5 gated by `src/data/quests/cohesion-wire.test.js` (data) + verify:runtime T15 (the purity engine). data verify + verify:runtime 58/58 green at each commit.*

### B. DECIDE (needs Van — design calls, not wiring)
6. **WISP's return** — approve placing a grown Wisp in the GH hub (§2 proposal #1), or confirm she's meant to be gone.
7. **Purity as a true 2nd axis** — decide whether to add more purity-INDEPENDENT choices (so pure-but-cruel / corrupt-but-kind are reachable), or accept purity as a morality-modifier + endgame gate.
8. **Mid-game branching depth** — accept the linear-DAG + back-loaded-branching shape (3 permanent decisions + L-path + epilogue cards), or earmark one mid-game choice to gate real content (a quest/area), not just karma. (§5)
9. **Ashbearer gate** — confirm `cave_lore` alone is the intended (easy) gate for the secret ending, or add a rarer second condition. (§5)
10. **Act-3 gold use** — add a late-game sink/use for excess gold (a final-act purchase, a meaningful donation, or fold gold into an ending), or accept the dead-excess. (§6)

### C. VERIFY (cheap confirmations)
11. Confirm `marsh_blade` is a defined item (SA3 reward). (§6)
12. Confirm EDDA being world-placement-less is intentional (dialogue-only elder). (§2)
13. Note the EDG1/ST3 same-region tonal adjacency for sequencing. (§4)

---

### Bottom line
The game is **cohesive where it matters most**: the **spine** (§5) and **tone** (§4) are strong and disciplined,
**connectivity + economy** (§6) are clean, and the **childhood→adult seed system** (§1) genuinely works for the
headline deeds (chicken, coin, grief, hearth, mercy, cave_lore). The real drifts are narrower than they look:
(a) a cluster of **dead-end deeds** + the **purity-only ember-shrine fork**; (b) **purity not touching everyday
NPC reactions** (the one direct intent-miss); (c) **one vanished character (Wisp)** + a flat return (Tam); and
(d) **branching that's real but back-loaded** to the three permanent decisions + the endgame. None are
contradictions or broken threads — they're **missing reads and a few design calls**, captured above for wiring
or for Van's decision.
