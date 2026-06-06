# EMBERFALL 2 — WORKING AGREEMENT

How we work. Read with `CLAUDE.md` (the index) and `docs/PLAN.md` (the SSOT).

## 1. Scope before you build
- Read the relevant design docs FIRST, every time. Pull the actual beats, ids, and
  voices from them — don't improvise what the design already specifies.
- Confirm which `PLAN.md` step you are on and state it. If the request conflicts
  with `PLAN.md`, flag it before building.

## 2. One objective per session (+ the safe big-push rule)
- Default: ONE clear objective per session, then verify it before reporting done.
- A bigger push (e.g. a whole region of quests) is allowed when it is pre-scoped and
  each unit still meets its own quality gate. Batch size is never an excuse to skip
  per-unit quality or verification.
- Always finish with: commit + push, and a `PLAN.md` CURRENT STEP update.

## 3. Definition of Done (general)
- It runs/builds clean (`npm run build`), the self-test passes (`npm test`), and the
  specific behaviour is demonstrated (test output, screenshot, or live check) — not
  asserted. See `QUALITY-BIBLE.md` for the per-feature gates (A–N).
- Content: real data + real dialogue in the established voices + canonical deed-ids +
  Gate D (no item-in-front) + Gate H (story coherence). One verifiable line per unit.
- No rubber-stamped reports. If something is partial or unverified, say so plainly.

## 4. Automate / work at a high level
- Use **absolute paths**. Prefer **scripts** over manual file moves (reproducible).
- Windows host: **PowerShell 5.1** syntax when scripting in PS (`$null`, `$env:VAR`,
  backtick line-continuation); POSIX via the Bash tool is fine for portable scripts.
- Long operations should show **progress** (progress bars / counts), not run silent.
- Claude Code **writes/updates docs directly** in `docs/` and commits them; the owner
  does not hand-move or hand-paste docs.

## 5. Owner preferences (Van, NZ)
- **Concise.** Lead with the result. No filler, no emoji.
- **Honest + willing to push back.** Surface problems, disagree when warranted, flag
  risks early. Don't agree to be agreeable.
- **NZ conventions** (spelling, dates, units).

## 6. Safety / guardrails
- **Incremental commit + push** every session; small logical commits.
- **No force-push, no branch deletion, no history rewrite** without explicit
  instruction.
- **Never email the owner** or send anything outward on their behalf.
- **Licence-first** for all assets: CC0 safe; anti-AI clause banned; unclear =
  quarantine, don't use. Don't touch the existing LPC pipeline.
- **Be certain before destructive or irreversible commands.** Look at the target
  first; if reality contradicts the description, stop and surface it.
- **STOP and ask** when: the request conflicts with `PLAN.md`; an asset licence can't
  be confirmed; a change would rework a write-once engine; anything outward-facing,
  destructive, or irreversible is involved; or you are genuinely blocked/uncertain.

## 7. Anti-drift
- **`PLAN.md` is the single source of truth.** Update its CURRENT STEP every session.
- **Reuse ids.** Never invent a new id for an existing deed/flag/quest — it breaks
  callbacks + ending-gates silently.
- **Flag gaps, don't rework.** A genuine engine gap → flag it + make a minimal,
  noted change. Never silently re-architect a working system.
- Keep systems write-once and content data-driven; resist special-casing.
