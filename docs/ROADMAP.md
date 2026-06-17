# ROADMAP — the sequenced full-steam plan to a complete game

> The single ordered backlog Claude Code marches, **charter-in-hand** (`DECISION-CHARTER.md`): build to spec,
> self-authorise every MAY-decision, surface only MUST-decisions, gate every item (both verifies green +
> pixel/runtime-truth + no-fake), commit + push per item. Sequenced so each phase **unblocks the most** next.
> Living doc — re-order as items land; spec each system just-in-time before building it.
> *(Supersedes the June-3 scaffold roadmap; the robustness discipline now lives in `BUILD-METHOD.md` + the charter §4.)*
>
> **Legend:** **MAY** = Claude Code decides + builds alone (charter §3). **VAN** = a MUST-surface decision (batch
> them — see the end). **ART** = needs art that doesn't exist → flag, don't fake. **Size:** S (≤1 session) ·
> M (a few) · L (a system, multi-session). **Gate** = the harness/quality proof for "done".

---

## ★ THE CRITICAL PATH (build in this order for the most progress)
1. **Slice sign-off** — combat-feel → audio/polish → the 30-min playthrough (Phase 0). *Makes the GH slice a
   complete, shippable demo — the "the game is real" milestone.*
2. **Cohesion quick-wins** — Wisp · purity-independent choices · the mid-game branch · Ashbearer condition
   (Phase 1). *Small, mostly MAY, locks the design coherence the charter just committed to.*
3. **World build-out** — Emberwood/Thornwell town · Saltbreak polish · Spire endgame wiring (Phase 2).
   *Makes M1–M20 playable end-to-end in the live world.*
4. **Wealth-and-Legacy system** (Phase 3) — the deep optional layer, spec-first.

Art gaps (Phase 4) + Van decisions are **batched** and run in parallel — none block the critical path except
the two flagged inside it (combat dodge-roll visual; Spire boss art).

---

## PHASE 0 — SLICE COMPLETION (THE-SLICE steps 5–7; the sign-off gate)
*The GH vertical slice (M1–M7 childhood → adult GH1–GH4) is built + cohesion-wired; these three close it.*

- ~~**0.1 Combat-feel — the first fight**~~ **DONE** (2026-06-18). The GH3 orchard-den is now a LIVE arena
  (`gh_orchard_den` interior + combat): cutting in during GH3 spawns the orchard-teeth (3 chargers); the feel
  loop — **telegraph → hit → dodge → block → kill** — runs on the already-built/tuned EnemyController +
  PlayerCombat. Clearing the den re-opens the GH3 mercy/cull fork (the cleared→fork handshake). Gated by
  **verify:runtime T16** (10 assertions on real input: arena+spawn, telegraph, J→damage+hitstop, SPACE dodge
  i-frames + window, C block-reduce, lethal-J KILL at the harder freeze tier, full clear, fork re-open).
  **Still open: the dodge-ROLL visual is ART** (logic works; currently a procedural duck-squash — flagged GAP),
  and **Van play-judges the FEEL** (HARD RULE 9 — telegraph readability, hitstop/knockback weight, dodge/block
  responsiveness, the death beat). The feel-constants are [TUNE]-tagged in `src/constants/standards.js`.
- **0.2 Audio / polish** (THE-SLICE step 6). Region music beds + ambient + sfx actually play; interior audio
  beds (hooks pending). **The current `mus_*` beds are licence-UNVERIFIED placeholders** (shipping at LOCAL
  scope; HARD-FAIL at SHIP) → **fetch licence-clean (CC0/OGA) beds + ledger** before sign-off. Day/night clock
  wiring is a smaller polish item here. *Depends:* none. *MAY* (wiring, sfx) · the bed FETCH is MAY (free,
  licence-vet) — **VAN only if a bed must be commissioned**. *Size M.* *Gate:* verify (asset-licence + the
  no-unverified-at-ship gate goes green) + eyes/ears-on.
- **0.3 The 30-minute playthrough → VAN SIGN-OFF → slice FROZEN** (THE-SLICE step 7). The skeptical-player pass
  on Van's exact load path; fix every snag found; hand to Van. *Depends:* 0.1 + 0.2. *VAN* (the sign-off is his).
  *Size S–M.* *Gate:* the `DONE-DEFINITION.md` runtime checklist, eyes-on, zero known snags.

---

## PHASE 1 — COHESION BUILD-OUT (charter §2.7–§2.10 — the locked intents)
*Small, high cohesion-per-effort; mostly MAY; the charter already decided the design.*

- **1.1 WISP returns** (§2.7). Place a grown Wisp in the GH adult hub; `greetByDeed` reads a shared childhood
  deed (`cave_lore`/`dared_friend`/hen) — the Tam/Ada pattern just shipped. *Depends:* none — **build-ready.**
  *MAY.* *Size S.* *Gate:* `cohesion-wire.test.js` asserts Wisp placed + reads the deed.
- **1.2 PURITY-independent choices** (§2.8). Author purity-only forks across existing + new content so
  **pure-but-cruel / corrupt-but-kind** are genuinely reachable (kill the ~91% morality co-move). Each new fork:
  *does it move purity on its own axis?* *Depends:* none (the `greetByPurity` engine + purity gates exist).
  *MAY* (authoring forks in-voice on the established axis). *Size M* (spread across content). *Gate:* a data
  test — N choices move purity without morality; a runtime check that a pure-low-morality state is reachable +
  read differently.
- **1.3 The MID-GAME BRANCH gates real content** (§2.9). Earmark one mid-game choice (a region fork) that
  **unlocks/locks an actual quest or area**, not just karma — so branching isn't only the 3 endgame decisions.
  Candidate: a Peaks/Coast faction fork opening a quest the other side locks. *Depends:* the host region built.
  *MAY* to pick + wire **from the existing factions** (it's build-craft on locked quests); *VAN* only if it
  needs a NEW area/quest not on the roadmap. *Size M.* *Gate:* data test — the fork unlocks X + locks Y;
  runtime that the gated content is reachable on one branch, not the other.
- **1.4 ASHBEARER 2nd condition** (§2.10). Gate the secret ending on `cave_lore` **+ a rarer condition**.
  *Proposed:* `stone_refused` (PH5 — keep the hard true world; thematically exact). *Depends:* none.
  *VAN confirms the condition* (MUST), then *MAY* wire. *Size S.* *Gate:* spire.test — Ashbearer offered only
  with both deeds, not `cave_lore` alone.

---

## PHASE 2 — WORLD BUILD-OUT (the remaining regions live end-to-end)
*Make the full M1–M20 playable in the built world. Same proven dress-the-greybox pattern as Saltbreak.*

- **2.1 EMBERWOOD / Thornwell town** (greybox → built). Dress `vil_thornwell` from the locked spec (the
  fire/frost-split caught settlement) via the frozen griddedSettlement/door pattern: terrain, buildings, cast
  per the role palette, shop, M15/M16 + SE-quest givers live (load the Emberwood quest-set into the runtime
  engine, like the Coast). *Depends:* the Emberwood spec (M15/M16 data complete). *MAY* (placement/cast/dialogue
  from spec) · *VAN* only for layout decisions the spec genuinely leaves open (per the Saltbreak audit pattern —
  audit it first). *Size L.* *Gate:* a Saltbreak-style runtime test (loads non-greybox, building enter/exit,
  shop, M15 reachable) + eyes-on feel for Van.
- **2.2 SALTBREAK polish** (first-pass built; close the flagged items). (a) **lighthouse building = ART gap**
  (flag); (b) the **open-ocean water band** (`prop_seawater` exists — lay it with collision/nav care); (c)
  **density + storm-coast mood** (more dressing/weather — eyes-on for Van); (d) **M14 + ST quest givers** placed
  (only M13 wired). *Depends:* 1-pass Saltbreak (done). *MAY* (b/d + density) · *ART* (a lighthouse) · *VAN*
  (feel sign-off). *Size M.* *Gate:* extend the Saltbreak runtime test (water nav-blocks; M14/ST givers fire).
- **2.3 SPIRE endgame wiring** (M17–M20). The quest/ending logic is complete + tested; make it **live-reachable**:
  load the Spire quest-set into the runtime engine, place M17's beat, wire the **ending-UI** (the 5-ending
  choice screen + epilogue cards). *Depends:* all regions' tools/shards reachable. *MAY* (engine load, M20
  ending-UI from the existing data) · **the M19 final-boss (Warden) is ART** (flag) · *VAN* (the finale feel).
  *Size M–L.* *Gate:* runtime — M17 reachable with 4 shards; M20 offers only the reachable endings; epilogue
  cards fire per deeds.
- **2.4 Remaining greybox towns + landmark entrances.** Stonereach/Cribbins/Cragfoot inline conversion (gate
  #19 seamless-overworld) + overworld entrances for the landmark/dungeon nodes (High Pass, Lighthouse, Drowned
  Vault, Caught, Weeping, Ember Hollow). **Cribbins Cove is UNSPECIFIED** (audit) → *VAN* to spec or drop.
  *Depends:* the regions built. *MAY* (inline conversion of spec'd towns) · *VAN* (Cribbins design). *Size L.*
  *Gate:* designed-vs-built + seamless-overworld gates go green; navGate + perf.

---

## PHASE 3 — THE WEALTH-AND-LEGACY SYSTEM (charter §2.11 — a major system, its own track)
*Spec-FIRST (full-expectation spec → Van ~2-min review → build). Gold becomes "care for the world", Fable-style.*

- **3.1 Spec the system** (`SPEC-WEALTH-LEGACY.md`). Decompose: property ownership + income loop; the
  world-betterment purchases (settle debts · rebuild a settlement · fund the god's recovery) tied to
  morality/purity/Flame; the grind curve (earnable-but-hard, a deliberate focus-shift, **flowing not hopeless**);
  the reward shape (legacy/world-state changes); the non-wealth path still completes. *Depends:* the economy
  audit (done). *VAN reviews the spec* (MUST, per BUILD-METHOD RULE 1). *Size S (the spec).*
- **3.2 Property ownership + income** (the deed schema ships in-slice; build the loop). Purchase UI · rent/income
  accrual · furnish/rename. *Depends:* 3.1. *MAY* (build to the approved spec). *Size M.* *Gate:* runtime — buy a
  property, income accrues, the world-state flag sets.
- **3.3 World-betterment purchases.** The themed sinks — pay off a settlement's debt, fund a rebuild, fund the
  recovery — each setting a visible world-state change + a karma/purity/Flame tie. *Depends:* 3.2 + the regions
  built (a thing to rebuild). *MAY* (content on the approved system) · *VAN* (which world-changes are canonical).
  *Size M–L.* *Gate:* runtime — a purchase changes a visible world-state + the right karma/Flame read.
- **3.4 Economy REBALANCE for the focus-shift.** Re-curve so the epic purchases are a real grind reachable by
  the income-compound path, the early/mid curve still flows, and the **5–12g→200g** seam smooths into the new
  income loop (supersedes the old Act-3 dead-excess flag). *Depends:* 3.2–3.3. *MAY* (values on the approved
  curve) · *VAN* (the target grind length / "how hard is hard"). *Size M.* *Gate:* a data test — the curve has
  no cliff + the epic tier is reachable-but-hard (a modelled affordability check); economy gates green.

---

## PHASE 4 — ART GAPS (flag, DON'T fake — batch as commission / hand-edit decisions for Van)
*All currently held at a graceful stopgap or omitted; none faked. Each = a VAN call: commission, free-fetch, or accept the stopgap.*

| Art gap | Where it bites | Current state (no-fake) | Decision for Van |
|---|---|---|---|
| **Lighthouse building** | Saltbreak (ST3, the point) | omitted; Holden in-town stand-in | commission/fetch a top-down lighthouse, or accept omitted |
| **Boss sprites** (Drowned Guardian · Keep Sentinel · Tideward · Feverheart · **Warden**) | the named region/finale bosses | grant-at-entrance / generic monster stand-in | commission LPC humanoid bosses (the Warden gates the M19 finale feel) |
| **Dodge-ROLL animation** | combat-feel (0.1) | logic works (i-frames+burst); visual = procedural squash | commission/fetch an LPC ground-roll per layer, or accept the squash |
| **Carry-pose style-match** | M2 hen carry | frames acquired (`asset-library/2d/lpc-carry`), not integrated | match/recolour to the ElizaWy rig + child variant (needs Van's eye) |
| **Fat body** (Fazy) | the Fazy NPC | `muscular` stopgap (reads bigger, not fat) | commission an LPC fat body (~15 anim sheets), or accept the stopgap |
| **Proper child art** (kids) | the GH kids | scaled-down adults | fetch/commission ElizaWy child layers + a `child` variant |
| **Music beds** | every region (0.2) | licence-UNVERIFIED placeholders | free-fetch licence-clean beds + ledger (mostly MAY), commission only if needed |

---

## PHASE 5 — INFRA / POLISH RESIDUALS (parallelisable; mostly MAY)
- **Verb dispatcher — COLLECT/CARRY registry** (HIT already generalised). *Trigger:* the first new pick-up/carry
  target outside M2 → build the target→verb registry. *MAY.* *Size M.*
- **Guard-confront ladder** (chase → knock-out → lock-up, past "flee"). *Depends:* combat (0.1). *MAY.* *Size M.*
- **Day/night cycle** — advance the TimeOfDay clock live + NPC schedules. *MAY* (system) — small. *Size S–M.*
- **Pem cross-region clue trail** (SG2) — place the four `pem_clue_*` graffiti + Pem's hidden reveal. *Depends:*
  the regions built. *MAY.* *Size M.*
- **Cast variety** (clothing/hat/apron STYLES) — recolours done; new shapes need a forge fetch (ART). *Size S* (fetch).
- The **runtime-assertion harness is BUILT** (the gate-truth layer); residual flakes are hardened as they bite.

---

## BATCHED VAN-DECISIONS (resolve these together to unblock the most)
1. **Slice sign-off** (0.3) — the 30-min playthrough is his to bless.
2. **Ashbearer 2nd condition** (1.4) — confirm `stone_refused` (or pick from the alternatives).
3. **Cribbins Cove** (2.4) — spec it (cast/layout/role) or drop it (it's currently unspecified).
4. **Wealth-and-Legacy spec** (3.1) — the ~2-min spec review; + the "how hard is hard" grind target (3.4) +
   which world-changes are canonical (3.3).
5. **The mid-game branch** (1.3) — confirm the chosen faction fork is fine, or name a different content gate.

## BATCHED ART-GAP DECISIONS (commission vs free-fetch vs accept-stopgap)
Lighthouse · the 5 boss sprites (esp. the **Warden** for the finale) · dodge-roll · carry-pose style-match ·
fat body · child art · music beds. (Music + carry-pose are mostly free-fetch/integration = MAY; the rest are
true commission/hand-edit calls.) See Phase 4 for each gap's current no-fake stopgap.

---

### Bottom line
The **critical path is Phase 0 → 1 → 2 → 3**: finish the slice to sign-off, lock the cohesion intents, build the
remaining regions live (Emberwood town, Saltbreak polish, Spire wiring), then the Wealth-and-Legacy system —
with art gaps and Van-decisions **batched** so they never stall the build. Everything inside a phase is
**MAY-build to spec** except the explicitly-marked VAN/ART items; Claude Code can march this full-steam,
gating each item and surfacing only the batched decisions in its session reports.
