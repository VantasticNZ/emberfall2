# EMBERFALL 2 — the shared brain (auto-read every session)

This file is read automatically at the start of every session. **Read `docs/THE-SLICE.md` FIRST** — the
governing plan (build the Greenhollow vertical slice to Van's bar, one system at a time, nothing else,
until Van signs off). Then `docs/PLAN.md` for the current step. **The rest of the doc library is
REFERENCE — consult it when a task needs it, NOT mandatory reading.** Do not start work until you know
which SLICE ORDER step you are on.

## Where everything lives
- **`docs/THE-SLICE.md`** — ★ the governing one-pager (scope = GH slice only; the per-system method:
  build → exhaustive PIXEL-TRUTH table → 5-min VAN-TEST → sign-off → FROZEN; the ORDER; the discipline).
- **`docs/PLAN.md`** — SSOT. The locked master plan + the CURRENT STEP (what this
  session does + what is already done). Every session states its plan step.
- **`docs/WORKING-AGREEMENT.md`** — how we work (scope, DoD, automation, owner
  prefs, safety/guardrails, anti-drift). Read it before building.
- **`docs/QUALITY-BIBLE.md`** — the quality bar + DoD gates (A–N) + Part 2.5
  Presentation & Feel DoD + the Regression / Save-Versioning rules. Nothing is "done"
  until it passes its gates to the owner's eye.
- **`docs/DONE-DEFINITION.md`** — the **SSOT for "done"**: the RUNTIME, eyes-on checklist
  (walkability · containment walk+dash · doors-as-doorways · no-farm · designed==built ·
  per-settlement identity · no-false-green · honest checklist). **Apply it before claiming
  anything done.** `docs/PROCESS-RETRO.md` — why gates went green while the game was broken +
  the meta-rules (incl. **#10: VERIFY IN VAN'S EXACT STATE** — cleared save + full reload + the
  build he loads; a check in any other state is invalid). `docs/GATE-AUDIT.md` — the 20-gate
  audit (runtime vs data, the eyes-on-only gaps) + the live CONNECTED-STATE of the world.
  `docs/RPG-FEEL-STANDARD.md` — the open-world-but-gated bar (6 pillars). `docs/DOOR-SYSTEM.md` —
  the door/entrance SET standard (inset doorways you walk INTO; OPEN/CLOSED/LOCKED states).
  `docs/DEFERRED.md` — the living deferred-work tracker (log every deferral with when-to-build; clear when built).
- **`src/constants/{deeds,flags,items,endings}.js`** — the SSOT for every canonical
  id (import these, never hardcode). `scripts/verify.mjs` fails on drift.
- **Governance:** `docs/ADR.md` (why settled decisions stand), `docs/STYLE-GUIDE.md`
  (the objective "does this asset fit" values), `docs/ASSET-LEDGER.md` (every art file
  → source/licence/AI-safe; verify reads it), `docs/PLAYTEST-LOG.md` (Van's feel-judgments).
- **`docs/ASSET-LIBRARY.md`** → `asset-library/_INDEX.md` — the licence-vetted
  art/audio library (what is usable, what is parked 3D, what is quarantined).
- **Design docs** (`docs/`): WORLD-MAP, WORLD-BIBLE, MASTER-DESIGN,
  STORY-AND-QUESTS, QUESTS-MAIN-FLESH, QUESTS-SIDE-FLESH, QUEST-WEB-FULL,
  QUEST-DATA.json, SYSTEMS-DESIGN-V2, TONE-AND-FEEL, COHERENCE-REVIEW. Phase 1
  design is COMPLETE; treat these as the locked design.

## Architecture in one line
Write-once **systems** (`src/systems/`: Karma, QuestEngine, Dialogue, storage,
Character, Movement, Collision, DepthSort, Interaction); all **content is DATA**
(`src/data/`, esp. `src/data/quests/`). Quests/NPCs/endings all read the ONE
Karma + deed-memory engine. Tests are plain Node + `node:assert` (`npm test`).

## HARD RULES (do not break)
1. **One objective per session, then verify it.** Big pushes are allowed only when
   pre-scoped (see WORKING-AGREEMENT) and still verified per quest/unit. No
   rubber-stamped verification — run the test / show the output / look at the result.
2. **Write-once systems; content as data.** Don't fork a system per case. If you
   find a genuine engine gap, FLAG it and make a minimal change — never silently
   rework an engine.
3. **Assets must allow AI-assisted commercial dev.** CC0 is safe. Any **anti-AI
   clause = banned**. Licence unclear = **quarantine** (`asset-library/_UNLICENSED-PENDING/`),
   do not use. Licence-first, always. Do not touch the existing LPC art pipeline.
4. **This is a 2D game.** 3D kits are parked in `asset-library/3d-future/` — not for
   the 2D pipeline.
5. **Shared canonical deed-ids.** Reuse the exact deed/flag ids the design +
   `QUEST-DATA.json` + `Karma.js` already use (e.g. `chicken_kicked`, `coin_returned`,
   `cave_lore`, `hagga_believed`, `tool_lantern`, `shard_1`, `mercy_shown`) so
   callbacks + ending-gates fire. Never invent a synonym for an existing id.
6. **Commit + push every session**, in logical per-file/per-group commits. Run
   **`npm run verify`** before every commit — it must pass (the git pre-commit hook
   enforces it: tests + id-orphan + item-SSOT + asset-licence + storage-adapter).
   Reuse canonical ids from `src/constants/`. Never force-push or delete branches
   without explicit instruction.
7. **Never email the owner** or take outward-facing actions on their behalf.
8. **Be certain before running commands**; prefer scripts + absolute paths over
   manual moves. Stop and ask when genuinely blocked (see the stop-for list).
9. **RENDER VERIFICATION — a green headless test is NOT enough for visual work.**
   Any session that renders anything (scene/world/UI/art) MUST: (a) run it LIVE
   (dev server), (b) SCREENSHOT it at normal zoom, (c) self-check against the
   PRESENTATION & FEEL DoD (QUALITY-BIBLE Part 2.5) and report pass/FAIL per item
   with the screenshot, (d) explicitly hand the FEEL items (movement/camera/combat
   feel) to Van to play-judge. No placeholder/colour-box assets — omit + flag
   instead. `npm test` passing proves LOGIC only, never presentation.
10. **SESSION COMPLETION — finish what was asked, prove each item.**
    (a) ONE focused objective per session, scoped small enough to finish.
    (b) For ANY multi-item request, end with a per-item CHECKLIST — every requested
        item marked ✅ (done, with proof) or ❌ (not done, with the reason). A dropped
        or deferred item MUST appear as ❌; never silently omit it.
    (c) The session is NOT "done" until every requested item is ✅ or explicitly ❌
        with a reason. Do NOT silently re-prioritise away a requested item.
    (d) End with the DoD self-check and, for visual work, a screenshot (HARD RULE 9).
    Standards: reuse the canonical tuning constants in `src/constants/standards.js`
    (e.g. `INTERACTION_RADIUS`) — never re-hardcode them; see `docs/STANDARDS.md`.
11. **GATES ARE PROXIES — the running game is the truth (PROCESS-RETRO).** Every verify gate
    tests DATA or a flood-fill simulation, NOT real physics/render — so the runtime/visual
    failure classes (void-escape, dash-tunnel, door-rendered-wrong, exploit-farm) are caught
    ONLY by eyes-on. Therefore: (a) **a green test that contradicts Van's eyes means the TEST
    is wrong** — fix the test, don't trust the green; (b) **"working" requires exercising it
    with REAL input at runtime** (walk it, dash it, cut it, enter it) — present/data-correct ≠
    proven; (c) before claiming "done", run the **`docs/DONE-DEFINITION.md` runtime checklist**
    (it is the SSOT for done); (d) **designed ≠ built** — the running world must match the
    locked map (the `designed-vs-built` verify gate shows the gap); (e) **deferred ≠ dropped** —
    log every deferral in `docs/DEFERRED.md` with a when-to-build milestone; never silently drop.
12. **FULL-EXPECTATION SPECS — decompose THEN build (Van's process demand; see THE-SLICE.md method).**
    (a) **RULE 1 — full-expectation spec, pre-build:** no system is built from a one-line intent. FIRST
    write its full decomposition — every facet a professional game covers (behavior · states · sequencing ·
    visuals · audio · feel · edge cases · persistence), derived by asking *"what would Stardew / Zelda / a
    commercial RPG do here?"* — and **show it to Van for a ~2-min review BEFORE building.** Van approves/
    edits; the build implements ALL of it; the exhaustive table tests ALL of it. (b) **RULE 2 — the
    player-pass:** after the table passes, play it as a skeptical PLAYER on Van's load path (approach wrong,
    try to break it, note what LOOKS/FEELS off) before hand-off; hand-offs include "what I noticed in the
    player-pass." (c) **RULE 3 — reference check:** every spec names its genre-reference behavior and the
    build is diffed against it. One facet blobbed out as the whole instruction = a process failure.

The owner is Van (NZ). Be concise, honest, willing to push back; no emoji.
