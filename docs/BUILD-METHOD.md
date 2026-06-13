# BUILD-METHOD — the transferable game-build playbook

> Distilled from Emberfall 2 so the NEXT game starts from our learning, not from scratch. **Living doc:
> append as we learn; do not rewrite history.** Every entry earned its place by a failure or a payoff on this
> project. No game-specific content here — only the method, the patterns, and the reusable parts.

---

## 1. THE LAWS (L1–L6) — game-agnostic invariants

Each law is a *hard invariant* enforced by a gate where possible, eyes-on otherwise. Each exists because of a
specific failure. Carry the principle to any game; re-derive the gate against the new engine.

| Law | Principle (game-agnostic) | The failure that birthed it |
|---|---|---|
| **L1 Composition-complete** | Every character renders a COMPLETE, matched set for its body type — no missing/oversized/cross-type layers. | A child shipped pale + half-bare + pantless; the gate trusted a "clothed" *flag* while the pixels showed bare legs. |
| **L2 Presence & spoken-claim truth** | An NPC may only speak if physically present; and any dialog line that CLAIMS where someone/something is must match the actual placement. | A line said "Bram's at the forge" while Bram stood in the cottage; a beat fired with the speaker absent. |
| **L3 Spatial continuity** | Exiting an interior lands you at THAT building's exterior door tile (not mid-plaza); every transition is reciprocal. | Cottage exit dumped the player into the middle of the square. |
| **L4 Critical beats block** | Mandatory story beats block progression until done, diegetically (a shut door, a "they're calling you" nudge) — never a silent dead-end. | The opening let you wander off before the beat that the whole arc depends on. |
| **L5 Panels** | Every HUD panel / card / overlay goes through ONE panel helper: balanced, clamped on-screen, correct at any viewport/zoom. | Scroll-factor-0 panels "moved funny" under a zoomed camera and rendered off-screen. |
| **L6 Action-based karma** | Morality/deeds move only when the ACTION happens in the world — never on selecting a dialog option that announces intent. (Speech-acts/at-site actions legitimately fire on the line, but are explicitly classified, never exempt by silence.) | "(Run and say hello)" granted the kindness deed on the *click*, before any greeting happened. |

**Meta-rule:** when a new failure class appears that none of L1–L6 covers, it becomes L7+ — named, gated,
and added here with its birth-failure.

---

## 2. THE VERIFICATION DOCTRINE

The throughline: **a green test is a proxy; the running game on the user's path is the truth.**

- **Pixel-truth, not flags.** A visual claim is proven by sampling real pixels (decode the sheet / framebuffer
  snapshot) or by depth-vs-occluder math — never by `.visible`/a data flag. (L1's flag-trust bug is the canon
  example: a `childClothed:true` body still had bare-leg pixels.)
- **Verify in the USER'S EXACT STATE.** Cleared save + full reload + the build they actually load. A fix
  "verified" in a fresh scene the user never sees is not verified. Long-lived dev tabs run stale modules —
  reload to load new code; the build stamp only changes on server restart.
- **Exhaustive tables: every instance × every case.** Don't spot-check 2 of 22 buildings. The full pass over
  ALL instances finds the bug a sample misses (a music-tween crash that broke ~12 buildings; a black-floor
  room). "Not done until 100% of the table passes."
- **Promise-vs-assertion gate audits.** For every law/gate, write what it PROMISES vs what it ASSERTS. Where
  the assertion is narrower, widen it (pixel/runtime where the promise is visual/behavioural) or log the
  residual honestly with the cost to close. (Gates drift narrower than their law — that's how green-while-broken
  happens.)
- **The escape → permanent-case loop.** Every bug that escaped to the user becomes a PERMANENT new case in the
  exhaustive table / a new gate, so it can never recur. Bugs are converted into coverage.
- **Negative-prove a gate.** A gate you haven't watched FAIL on the bad input is unproven. Feed it the broken
  case; confirm it fails; then confirm the fixed case passes.
- **Runtime-assertion harness (build once, then cheap).** Behavioural promises (does the door actually block?
  does the deferred deed actually fire? does the exit land on the door tile?) need a headless-browser harness
  that boots a fresh save, drives input, and asserts state/pixels. Until it exists, those are honest
  eyes-on residuals — logged, not hidden. Once built, each new behavioural assertion is a few lines.

---

## 3. THE PROCESS

- **Full-expectation specs, reviewed pre-build.** No system is built from a one-line intent. First decompose
  every facet a professional game covers (behavior · states · sequencing · visuals · audio · feel · edge cases
  · persistence) by asking *"what would a commercial game in this genre do here?"*, show the owner a ~2-min
  review, THEN build ALL of it. One facet blobbed out as the whole instruction = a process failure.
- **One system per session, then verify it.** Scope each session small enough to finish + prove. Big pushes
  are allowed only when pre-scoped, and still verified per unit. End every multi-item session with a per-item
  ✅/❌ checklist — a dropped item is ❌ with a reason, never silently omitted.
- **Decision-before-data ordering.** Resolve the open design decisions (the owner's calls) BEFORE generating
  the data/art that depends on them. Don't build content on an unmade decision.
- **Asset-first audits (standing).** Before building anything visual/audio, AUDIT the licence-vetted library
  first; extract + ledger what exists; only then list true GAPS (a clean fetch or a flagged commission). Every
  hand-off reports HAVE/extracted vs GAP. Licence-first always: a no-AI clause = banned, unclear = quarantine.
- **Freeze on sign-off.** When the owner signs off a system, mark it FROZEN; later changes need explicit
  unfreeze + full re-verification. New systems CONSUME frozen ones, never silently rework them.
- **Regression protocol.** Run the full gate before every commit (pre-commit hook). Any frozen-table failure =
  revert + stop that workstream. A broken suite blocks; every bug gets a test.
- **Player-pass + reference-check.** After the table passes, play it as a skeptical player on the owner's load
  path (approach wrong, try to break it); hand-offs include "what I noticed." Every spec names its genre
  reference and is diffed against it.
- **Conservative unattended rules.** When running without the owner: locked designs/specs/frozen systems only;
  ambiguity → defer + the conservative reading; commit+push per item; never email; never force-push; a region/
  feel build that needs the owner's eyes (per the render-verification rule) is deferred with a plan, not built
  blind.

---

## 4. ARCHITECTURE PATTERNS THAT PAID OFF

- **Asset-owned properties.** A prop/asset declares its own behavioural metadata — a building declares its
  `doorway` rect, its `signAnchor`, its `deed` schema — so fixing the *system* fixes EVERY instance, and a new
  instance only declares its data once. (Per-instance patching never converged; asset-owned did.)
- **Data-driven states.** Content is DATA (quests/NPCs/dialog/items/world as plain objects); write-once SYSTEMS
  read the data. Door states (open/closed/locked/broken), quest forks, modifiers — all data, no forked code.
- **Shared helpers, one per concern.** ONE panel helper (register on the UI camera + clamp), ONE card-sequence
  player (queue of beats, manual or timed) reused by intro + cutscenes, ONE depth rule (sort by feet/baseY).
  A second copy is a future divergence bug.
- **`[TUNE]`/named constants with source tags.** Every distance/window/offset/zoom is a NAMED constant in an
  SSOT (`standards.js`), tagged with why. No bare geometry literals — they hide the source of truth and drift.
- **SSOT files for every canonical id.** deeds/flags/items/endings each have one source file; everything
  imports them; a verify gate fails on drift or an orphan id. Never invent a synonym for an existing id.
- **Manifests for cross-cutting invariants.** Where a law spans data (location-claims, deed-timing), a small
  audited MANIFEST + a gate that checks it beats scattered ad-hoc checks — and makes "audited, not exempt by
  silence" explicit.
- **Derived state over duplicated state.** Age (child/adult) is DERIVED from a deed, not a separate saved flag —
  one source, persists for free, can't desync.

---

## 5. REUSABLE SYSTEMS INVENTORY (could lift to a new game)

Engine-agnostic in design; most are Phaser-3-flavoured in implementation but the shape transfers.

| System | What it does | Lift-readiness |
|---|---|---|
| **Door/entrance system** | asset-owned doorways; OPEN/CLOSED/LOCKED/BROKEN states; knock/force + morality; walk-into-the-doorway trigger. | High — data + one carve routine. |
| **Interior system** | interiors as far-corner regions; isolation; camera clamp-to-footprint; R-rule furniture composition. | High. |
| **NPC-life** | 3-phase day schedules, chore loops, graceful-degrade when an anim is missing, solidity/separation. | High. |
| **Dialogue** | data node graph; reactive router nodes (branch on karma/deeds); deeds/choices/sets/defer-pledges via shared ctx. | High. |
| **Quest engine** | data quests; karma + deed commit (exactly-once); prereq/karma/deed gating; ordered steps + advance; worldDriven completion. | High. |
| **Karma/deed memory** | one engine all content reads; long-range reactivity (a quest can require a past deed); morality/purity tiers. | High. |
| **Shop/economy** | buy + sell at region margins; replenishing stock; keeper-linked; age-gates. | Medium (prices are game-specific). |
| **Game menu** | Esc → tabbed Items/Gear&Stats/Map/Settings overlay; paused; keyboard nav; panel laws. | High. |
| **Objective engine** | step objectives (reach/interact/talk); arrow target as an OPT-IN setting; soft-text-first guidance. | High. |
| **Card-sequence player** | reusable cutscene cards (queue of beats, manual or timed). | High. |
| **Verify-gate framework** | one `verify.mjs` of ~40 gates run as a pre-commit hook (tests + id-orphan + licence + consistency + the law gates) — the spine of the whole quality doctrine. | High — port the harness, re-author gates per game. |
| **ULPC/ElizaWy forge pipeline** | composite layered LPC characters from a licence-clean set (body/head/hair/clothes), recolour + per-direction bake (the kids'-hair fix) via PIL scripts. | High for any LPC-style 2D game. |

---

## 6. WHAT COST THE MOST TIME → the rule that now prevents it

- **The patch-loop.** Doors took ~7 patch passes because each "fixed" a few buildings and verification checked
  a few. → **Exhaustive tables (every instance × case) + asset-owned properties.** Fix the system once; prove
  all instances.
- **Green-while-broken.** Gates asserted narrower than their law (a flag, a placement, a graph) so the build
  went green while the player saw the bug. → **Pixel/runtime-truth + promise-vs-assertion audits + negative-
  proving every gate.**
- **Verifying in the wrong state.** "Fixed" in a fresh scene; the owner still saw it broken in his saved,
  long-lived tab. → **Verify in the user's exact state (cleared save + reload + the build he loads).**
- **Over-bundled prompts.** A multi-system instruction got one facet built + the rest dropped. → **Full-
  expectation spec pre-build + one-system-per-session + the per-item ✅/❌ hand-off checklist.**
- **Guessed geometry.** Hand-tuned pixel offsets drifted and re-broke (door positions, hair seating). →
  **Measure, don't guess; named constants in the SSOT; bake per-frame/per-direction data when a single offset
  can't be right** (the kids'-hair bounce was a per-direction gap a constant `oy` could never satisfy).
- **Half-fixes that create new bugs.** A quick non-hand-tracked overlay bounced like the bug it replaced. →
  **If the honest fix needs an asset/system that doesn't exist, defer it with the cost — don't fake it.**

---

*Append below as new lessons land. Keep it concise; each line should save a future session real time.*
