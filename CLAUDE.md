# EMBERFALL 2 — the shared brain (auto-read every session)

This file is read automatically at the start of every session. Read it, then read
`docs/PLAN.md` (the single source of truth for what to do next). Do not start work
until you know which plan step you are on.

## Where everything lives
- **`docs/PLAN.md`** — SSOT. The locked master plan + the CURRENT STEP (what this
  session does + what is already done). Every session states its plan step.
- **`docs/WORKING-AGREEMENT.md`** — how we work (scope, DoD, automation, owner
  prefs, safety/guardrails, anti-drift). Read it before building.
- **`docs/QUALITY-BIBLE.md`** — the quality bar + DoD gates (A–N) + Part 2.5
  Presentation & Feel DoD + the Regression / Save-Versioning rules. Nothing is "done"
  until it passes its gates to the owner's eye.
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

The owner is Van (NZ). Be concise, honest, willing to push back; no emoji.
