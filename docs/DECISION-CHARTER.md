# THE DECISION CHARTER — the governing doc for full-steam autonomous building

> **Read this FIRST, every session.** It is the single doc that lets Claude Code make BOTH feel-level
> ("does this fit the game's soul?") and detail-level ("what exactly do I place / write / name?") calls
> **without stopping for Van**, by encoding the overarching intent. When Van says *"build the next region"*
> and walks away, THIS is what makes the feel + the detail safe to trust.
>
> **What it is:** the consolidation + decision-boundary layer over the source docs. It does not replace them;
> it tells you *when you may decide from them yourself* and *when you must stop and ask*. Deeper detail lives
> in: `TONE-AND-FEEL.md` · `RPG-FEEL-STANDARD.md` · `GAME-LAWS.md` · `BUILD-METHOD.md` · `LORE-CANON.md` ·
> `COHESION-AUDIT.md` · `QUALITY-BIBLE.md` · `DONE-DEFINITION.md` · `WORKING-AGREEMENT.md` · the SSOTs in
> `src/constants/`. The **roadmap** (what to build next) is `THE-SLICE.md` / `PLAN.md`.
>
> **The contract:** build to spec, make every MAY-decision (§3) freely and in-voice, gate it (§4), commit +
> push per item, and surface every MUST-decision (§3) in the end-of-session report. Never email Van.
> **Living doc — append as intent evolves (see §6).**

---

## §1 — THE FEEL BIBLE (the overarching "what good looks like")

The one question behind every call: **does this make the player FEEL something — laugh, ache, gasp, wonder,
or care — AND does it fit a real, professional open-world RPG?** If a line/item/beat/space is *flavourless*,
it's wrong; punch it toward a pillar or cut it. (`TONE-AND-FEEL.md` "The Golden Rule".)

### The tone register (the soul — get this and you can judge anything)
- **Wholesome, deep core with REAL emotional range** — romance, sadness, seriousness, warmth, home, loss,
  wonder. It makes you laugh AND breaks your heart; the comedy makes the tragedy land harder.
- **WITH a deliberate thread of rude / dirty / dark humour + innuendo** — crude, silly, absurd, cheeky,
  fourth-wall-aware. Comedy is a **core pillar, not garnish**. **Joke names are a KEPT feature**
  (Hugh Jass, Holden McGroin, Fazy Lastard, Wayne Kerr, Mike Hunt, Phil McCracken, Ben Dover…).
- **The MIX is the identity.** A fart joke three minutes before a gut-punch is *intentional* — that whiplash
  is the Discworld + Undertale + Zelda magic. **Earn the tears with the laughs.**
- **Hard lines (never cross — these are MUST-stops if a beat would require it):** R18 humour is fine but
  **NO explicit sexual content** (innuendo yes, explicit no); **NEVER sexualise minors**; the rude register
  is *seasoning*, never the dish.

### How the registers are balanced (so you place them right yourself)
- **Joke names + the rude register go on SIDE characters and rough places** (taverns, the Coast, cameos) —
  **NEVER the main cast** (Bram, Hagga, Sela, Mara are never punned).
- **The played-straight pun** is a strength: a joke-named NPC delivering a genuine grief beat (Holden
  McGroin, lost his son) makes the name set up a gag and the beat land harder. Use it deliberately.
- **Protect the serious beats from comedy.** Grief, the god's agony, the weeping flame, a death — no jokes
  *inside* them. Regions can lean one register by design (Greenhollow warm, Marsh grave, Spire transcendent);
  that's fine. Don't force a laugh where the lie cracks; don't deflate a finale.
- **Reactivity is the standard.** NPCs remember, gossip, and treat you by your deeds + your karma (Morality
  AND Purity — §2). Rich, connective, characterful dialogue *enmeshes* the player. A flat, non-reactive NPC
  is below bar.

### The RPG-feel bar (Stardew / Zelda / Fable — the "real professional game" subconscious)
Build every region/corridor/gate to the **6 pillars of `RPG-FEEL-STANDARD.md`**, eyes-on verified:
1. **Legible, tantalizing gating** — every traversal block READS as "ability X goes here" at a glance
   (the grapple-anchor, the dark boarded mouth, the cracked wall). Never an unexplained wall.
2. **See-it-before-you-reach-it** — place visible-but-not-yet-reachable rewards so the world reads whole and
   baits curiosity ("I'll come back with the hookshot"). ≥1 tease per region.
3. **Backtrack rewards** — every tool gained makes ≥1 *earlier* place richer; revisiting rewards, never bores.
4. **Soft guidance** — free to wander, gently steered by sightlines, landmarks, lighting, terrain-funnelling.
5. **Density + landmark variety** — varied density, real landmarks, satisfying movement; no flat dead fields.
6. **Containment + legibility** — no void-escape, no dead-ends that read as bugs; the space is honest.

### Pacing + what makes a beat land
- **The slice/region shape:** warm/curious establishing → a hook → rising stakes → a real choice or payoff →
  a consequence the world remembers. Childhood = innocence + seeded dread; Act 2 regions = a truth + a tool
  + a shard + a fork; the Spire = convergence + the weight of the ending.
- **A beat lands when** it (a) fits the tone register, (b) is *reactive* (reads the player's history), (c)
  has a *consequence* (karma, a deed, an NPC memory, a gate, an epilogue), and (d) earns its emotion (the
  laugh sets up the ache; the warmth makes the stakes matter). A beat that only moves a number and nothing
  *reads* it later is a **dead-end** — wire a read or cut it (this is the recurring cohesion failure class).
- **Items:** mix the epic and the absurd; real gear AND ridiculous joke items; funny descriptions; personality.

---

## §2 — THE LOCKED INTENTS (decided — do NOT re-litigate)

These are settled design. Build *toward* them; never contradict them without a MUST-surface (§3).

1. **Childhood deeds carry to adulthood.** Every childhood choice (M1–M7 + the GH-arc + the ember-shrine
   tell/keep/desecrate) should have a **traceable adult echo** — an NPC greeting/dialogue, world state, or a
   gate/epilogue. A recorded deed with no downstream read is a bug to fix, not an acceptable state.
   *(Pattern: `greetByDeed` on the relevant NPC; reactive `route` nodes; ending/epilogue gates.)*
2. **Some characters return where the story earns it.** Returns must be narratively earned (Mara, McCracken,
   Sela, Nettle, Ada return; Bram dies in M6 by design and returns only as memory). A flat return (present
   but reads no history) is below bar; wire it to read a deed.
3. **Purity is a REAL second axis** — pure↔corrupt, **distinct from Morality** — that drives reactions,
   dialogue, and gates (NOT cosmetic, NOT a mere morality-modifier). It changes how everyday folk treat you
   (`greetByPurity`, favourable to the pure), gates shop items + the shrine/flame read, and gates endings
   (Liberator needs pure; Tyrant needs corrupt). Keep adding purity reads/independent choices toward this.
4. **The First Flame / shard / betrayal spine is canon and holds end-to-end:** the Hearthflame is a bound,
   screaming god (M10 truth) → 5 shards (M9/M12/M14/M16/M19) → the oracle-betrayal thread (foreshadows Sela)
   → the Spire endings (Warden/Saint/Tyrant/Liberator/Ashbearer, karma- + permanent-decision-gated). No
   dropped threads, no contradictions. New content must fit this spine, not bend it.
5. **The world is an open-but-gated tool DAG** (lantern→grapple→hookshot→firefrost; shard gates) with the
   3 permanent decisions (M10/M16/M17) as the real branch hinges. Reactivity + epilogue cards carry the rest.
6. **Asset law:** only AI-safe licences (CC0/CC-BY/CC-BY-SA/GPL/OGA-BY, no anti-AI clause). **This is a 2D
   game.** Reuse canonical SSOT ids (`src/constants/`). Do not disturb the live LPC/ElizaWy pipeline carelessly.

---

## §3 — SELF-AUTHORISE (the heart of the doc): MAY decide alone vs MUST surface

**Default to building.** Inside the spec + the locked intents, **make the call and keep moving** — do not stop
for a decision you can derive from the spec, the feel bible, or sensible craft. Only stop for the MUST list.

### ✅ MAY decide alone (build-craft from spec — just do it, in-voice, and note it)
- **Building/prop placement WITHIN spec'd zones** — exact tiles, scale, tint, dressing, the cohesive
  arrangement (the spec gives zones + lore cues; the precise layout is craft). Eyes-on for feel; Van signs off.
- **NPC dialogue lines** in the established voice — greetings, topics, `greetByDeed`/`greetByPurity`/`route`
  reads, quest banter, reactive lines. Author them; match the tonal register + reactivity standard.
- **Quest STEP wiring** — objectives, triggers, the choice→deed/karma/unlock plumbing for *already-spec'd*
  quests; making a spec'd quest live-reachable (giver placement, engine loading).
- **Prop / dressing / terrain choices** from the owned, ledgered library; cropping/extracting owned assets.
- **Interior layouts** per the SPEC-INTERIORS R-rules (floor/walls/props, footprint-checked, distinct-enough).
- **Naming MINOR NPCs** in the tonal register (incl. a tasteful joke name for a side character — never the
  main cast, never crossing the hard lines).
- **Economy VALUES on the established curve** (T1 2–25g → T2 35–150g → T3 120–260g → property sinks) — pricing
  a new item/reward consistently with its tier.
- **Wiring a missing READ** that closes a cohesion dead-end (a deed → an NPC line/epilogue) — this *serves* a
  locked intent, so it's always allowed.
- **Harness tests, refactors that don't change behaviour, doc updates, ledger entries.**

### ⛔ MUST surface to Van (stop, do NOT decide; report it for his call)
- **Anything that would CONTRADICT a locked intent (§2)** — bending the spine, changing what a permanent
  decision gates, making Purity cosmetic, dropping a thread.
- **New MAJOR characters or story beats not in canon** — a new named main-cast figure, a new region/quest not
  on the roadmap/spec, a new permanent decision. (Minor flavour NPCs are MAY; *plot-bearing* ones are MUST.)
- **Permanent-branch / ENDING changes** — adding/removing/re-gating an ending or an L/T/Ashbearer condition.
- **A returning character that adds NEW content** (e.g. placing a grown Wisp) — that's a design call, not a
  wiring read. *Propose it from the existing story; let Van approve.*
- **Spending real money / commissions** — any paid asset or service.
- **Anything needing art (or audio) that does NOT exist** — **STOP + FLAG, never fake.** Omit the element,
  ship the rest, log the gap with a when-to-build trigger. (A colour-box / dirt-with-barrels stand-in = a fake.)
- **A green gate that contradicts the running game** — the test is wrong; surface it, don't trust the green.
- **Tonal hard-line risk** — any beat that would need explicit content or sexualise a minor: do not write it.

> **The test:** *Can I derive this from the spec + the feel bible + craft, without inventing canon or faking
> an asset?* → MAY. *Does it set a precedent Van hasn't set (new canon, a permanent gate, paid/missing art)?*
> → MUST. **When genuinely unsure, finish what's safe, and surface the rest — don't block the whole item.**

---

## §4 — THE QUALITY GATES (non-negotiable, EVERY build)

1. **Both gates green before EVERY commit:** `npm run verify` (data) **and** `npm run verify:runtime`
   (the live-game harness). **Revert on red.** The pre-commit hook enforces data verify; run runtime yourself.
2. **Pixel/runtime-truth, not data-flags.** A green DATA gate can assert a field while the screen renders the
   opposite. For anything visual/behavioural, assert the RENDERED pixels or the real-input OUTCOME. The running
   game is the truth; a green test that contradicts Van's eyes means the TEST is wrong.
3. **NO-FAKE — omit/defer over fake.** Missing art/feature → ship without it + flag, never a placeholder that
   reads as done. Conservative over impressive.
4. **Harness-assert each item.** New behaviour gets a runtime/data assertion that would catch its regression.
5. **Commit + push per item**, in logical commits, with the canonical SSOT ids. Tag before a big/risky push.
6. **Regression protocol:** an unrelated red on your change → re-run to confirm flaky vs real; if real, fix or
   revert before committing; if a recurring flake, harden the test (don't rely on luck).
7. **Fix the CLASS, not the instance** (`BUILD-METHOD.md` §3) — one dispatcher/law/registry, not per-case
   forks; before closing feedback, check whether the same pattern bites elsewhere.
8. **Capture ALL feedback in `FEEDBACK-LEDGER.md`** — every Van report → FIXED `<commit>` / IN-PROGRESS /
   DEFERRED (+trigger) / DECISION-NEEDED. Never drop feedback silently. Log deferrals in `DEFERRED.md`.
9. **"Done" = the `DONE-DEFINITION.md` runtime checklist** in Van's exact state (cleared save + full reload),
   not a rubber-stamp. Designed ≠ built; deferred ≠ dropped.

---

## §5 — THE BUILD LOOP (so every session is uniform)

1. **READ** this CHARTER + the current state: `THE-SLICE.md`/`PLAN.md` (the roadmap + current step),
   `FEEDBACK-LEDGER.md` (open debts), `DEFERRED.md` (triggers now due). State which step you're on.
2. **PICK** the next item from the roadmap (or the highest-value open ledger/deferred item whose trigger is met).
3. **TAG** `pre-<item>` if it's a big/risky build.
4. **BUILD to spec**, making every **MAY-decision (§3) freely and in-voice** — derive layout/dialogue/values
   from the spec + the feel bible; don't stop for build-craft. **STOP only for a MUST (§3)** — and even then,
   do the safe parts and surface the rest, don't block the whole item.
5. **HARNESS-GATE (§4):** add the assertion; run both gates; pixel-truth the visual; revert on red.
6. **COMMIT + PUSH per item.** Update the ledger/audit/deferred docs (mark fixed, log deferrals).
7. **REPORT flat:** what was built + harness proof per item; any MUST-decisions surfaced VERBATIM for Van;
   deferrals + triggers; the test list. For visual work, screenshots + the FEEL items handed to Van to judge.

This is the loop that lets Van say *"build the next region"* and trust that the feel and the detail are
handled — because the feel is encoded (§1), the intents are locked (§2), the decision boundary is explicit
(§3), the quality is gated (§4), and the shape is uniform (§5).

---

## §6 — LIVING DOC / amendment rule

This charter **evolves as intent evolves.** When Van settles a new intent, decides a surfaced MUST-item, or a
retro adds a law: **append it here** (and to the relevant source doc), with the date, so the next session
inherits it. A MUST-decision, once Van answers it, becomes a locked intent (§2) or a MAY-rule (§3) — record it
so it is never re-litigated. The COHESION-AUDIT fix-list and its DECIDE items feed straight into this loop:
WIRE items are MAY-build; DECIDE items are MUST-surface until Van answers, then they move into §2/§3.
