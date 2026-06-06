# EMBERFALL 2 — the shared brain (auto-read every session)

This file is read automatically at the start of every session. Read it, then read
`docs/PLAN.md` (the single source of truth for what to do next). Do not start work
until you know which plan step you are on.

## Where everything lives
- **`docs/PLAN.md`** — SSOT. The locked master plan + the CURRENT STEP (what this
  session does + what is already done). Every session states its plan step.
- **`docs/WORKING-AGREEMENT.md`** — how we work (scope, DoD, automation, owner
  prefs, safety/guardrails, anti-drift). Read it before building.
- **`docs/QUALITY-BIBLE.md`** — the quality bar + the DoD gates (A–N). Nothing is
  "done" until it passes its gates to the owner's eye.
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
6. **Commit + push every session**, in logical per-file/per-group commits. Never
   force-push or delete branches without explicit instruction.
7. **Never email the owner** or take outward-facing actions on their behalf.
8. **Be certain before running commands**; prefer scripts + absolute paths over
   manual moves. Stop and ask when genuinely blocked (see the stop-for list).

The owner is Van (NZ). Be concise, honest, willing to push back; no emoji.
