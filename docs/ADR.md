# EMBERFALL 2 — ARCHITECTURE DECISION RECORD (ADR)

The WHY of settled decisions, so they aren't re-litigated or accidentally reversed.
Each entry: Context · Decision · Why · Status. Add a new entry (don't rewrite
history) when a decision changes; mark the old one Superseded.

---

## ADR-001 — Write-once systems; content as DATA
- **Context:** an RPG with hundreds of quests/NPCs/items/monsters.
- **Decision:** every consistent behaviour (karma, deeds, quests, dialogue,
  movement, collision, depth, interaction, economy, time, monster AI) is ONE engine
  in `src/systems/`; all content is DATA in `src/data/`. Never fork a system per case.
- **Why:** fixing a rule in one place fixes it everywhere; content scales by
  authoring, not engineering. The #1 time-saver + anti-bug measure.
- **Status:** ACTIVE (Bible Part 0 #1–2). A genuine engine gap is FLAGGED + given a
  minimal noted change (e.g. the QuestEngine `time` hook), never a silent rework.

## ADR-002 — Data-driven quests on the ONE Karma/deed engine
- **Context:** deep interlinked morality story + reactive callbacks.
- **Decision:** quests/NPCs/endings all read the single Karma + deed-memory engine;
  quests are data entries (givers/stages/conditions/rewards/gating).
- **Why:** reactivity + endings come "for free" from shared state; no per-quest
  bespoke flags drifting apart.
- **Status:** ACTIVE.

## ADR-003 — Gold/holdings live in Inventory, not Karma
- **Context:** Phase-2 economy needed a home for gold + items + equip + body-state.
- **Decision:** a new `Inventory` engine owns all player holdings; Karma stays the
  morality/deed engine only.
- **Why:** keep Karma single-purpose; one save blob for holdings; Economy is a
  stateless rules engine over Inventory + Karma. Mixing gold into Karma would muddy
  the reactivity engine.
- **Status:** ACTIVE.

## ADR-004 — 2D, not 3D
- **Context:** ~30hr near-Fable scope; a catalogue of 3D kits exists.
- **Decision:** the game is 2D top-down LPC. 3D kits are PARKED in
  `asset-library/3d-future/`, not wired into the pipeline.
- **Why:** 2D ships the scope realistically; art-agnostic manifest keeps a future
  port possible without rewriting logic.
- **Status:** ACTIVE (Bible; CLAUDE.md HARD RULE 4).

## ADR-005 — LPC art; Mana Seed BANNED
- **Context:** the project's code is AI-assisted.
- **Decision:** use LPC (ElizaWy + Sharm + sanderfrenken), all OGA-BY / CC-BY-SA /
  GPL / CC0. Mana Seed art is forbidden.
- **Why:** the Mana Seed licence explicitly bans use alongside ANY generative AI,
  "including code." LPC licences carry no anti-AI clause. Licence-first, always.
- **Status:** ACTIVE (docs/ART-LICENSE-NOTE.md; CLAUDE.md HARD RULE 3).

## ADR-006 — Single source of truth for ids (constants SSOT) + verify gate
- **Context:** 130+ deed ids + items/endings as string literals across many files;
  a typo'd/synonym id silently breaks callbacks + ending-gates (e.g. the
  god_mercy/mercy_shown seam).
- **Decision:** `src/constants/{deeds,flags,items,endings}.js` are the authoritative
  registry; systems import them; `scripts/verify.mjs` fails on any data-referenced id
  not in the SSOT (+ item/licence/storage checks); wired as an npm script + a git
  pre-commit hook. god_mercy was reconciled into the canonical `mercy_shown`.
- **Why:** make drift a build error, not a silently broken quest discovered late.
- **Status:** ACTIVE. Quest DATA migrates to importing the constants incrementally;
  verify enforces correctness meanwhile.

## ADR-007 — Storage behind one adapter
- **Context:** persistence runs in browser (localStorage) and Node (tests, memory).
- **Decision:** all persistence goes through `src/systems/storage.js`
  (`defaultStorage()` / `memoryStorage()`); no engine touches localStorage directly.
- **Why:** testable headless; one place to change persistence; verify enforces it.
- **Status:** ACTIVE.

## ADR-008 — Presentation & Feel DoD; no placeholder assets
- **Context:** logic-only verification let visual defects (blue-box pond, unreadable
  text, letterbox) ship.
- **Decision:** QUALITY-BIBLE Part 2.5 governs all visual work (screenshot proof +
  owner-judged feel); a fake/colour-box asset is worse than omitting + flagging the
  feature; CLAUDE.md HARD RULE 9 requires live render + screenshot for visual work.
- **Why:** a green `npm test` proves logic, never presentation.
- **Status:** ACTIVE.

## ADR-009 — Standards SSOT for tuning constants
- **Context:** a tuned value (the interaction radius) was hardcoded in a scene
  (`72`), the same drift risk the id-SSOT solved for strings.
- **Decision:** project-wide tuning constants live once and are reused —
  `src/constants/standards.js` (`INTERACTION_RADIUS`), plus the existing homes for
  `TILE`, frame/anim, movement speed (data), camera, UI. Per-entity overrides only
  with a stated reason, as a DERIVED expression, never a bare literal.
  `verify.mjs` lints for bare radius/tile literals that bypass the SSOT.
- **Why:** one knob per behaviour → consistent feel + no two-places-drift; see
  `docs/STANDARDS.md`.
- **Status:** ACTIVE.

## ADR-010 — Session-completion checklist (no silent drops)
- **Context:** multi-item requests risk an item being quietly re-prioritised away
  and the session reported "done" while incomplete.
- **Decision:** every session keeps ONE focused, finishable objective and ends with
  a per-item ✅/❌ checklist with proof; a dropped/deferred item shows as ❌ with a
  reason, never silently omitted; not "done" until all items are ✅ or explicitly ❌.
  (CLAUDE.md HARD RULE 10.)
- **Why:** completeness + honesty are verifiable, not assumed; the owner sees
  exactly what shipped and what didn't.
- **Status:** ACTIVE.
