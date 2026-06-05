EMBERFALL 2 - migrate character base to ElizaWy LPC Revised for PROPER full faces. The current
sanderfrenken base only has face BITS (no full face/expressions). ElizaWy LPC Revised has complete
faces + expressions (happy/sad/angry/shocked) designed in. Do the migration. Read
docs\QUALITY-BIBLE.md. Van's eye is ground truth.

DO (one at a time, verify LIVE w/ close-up screenshot, per-file commit):
1. Fetch ElizaWy LPC Revised (Character Basics) - AI-safe (OGA-BY/CC-BY-SA, no anti-AI). Record
   attribution in ART-LICENSE-NOTE.md. Confirm its grid/anim layout.
2. Migrate the character system to ElizaWy's base: body + heads (full faces) + hair + clothing +
   expressions, properly aligned (it caused a ~10px offset before - fix the alignment this time,
   don't abandon it). Keep it write-once + data-driven.
3. Re-attach equipment (sword/shield/hat) on the new base; keep Gate M (swings from arm, gear shows).
4. Verify with CLOSE-UP screenshots: hero + NPCs show COMPLETE faces (eyes, brows, nose, mouth) and
   at least one real expression (e.g. angry/happy) actually rendered, all 4 directions. Then a
   normal-zoom context shot.
5. Gates I/M/faces + 0 errors + clean build.

CONSTRAINTS: AI-safe only; full attribution; write-once + data-driven; fix the alignment rather
than abandoning ElizaWy; per-file commit. Do NOT report done until close-ups show COMPLETE faces
(not just eye/nose bits) to a human eye. If alignment truly can't be solved, STOP and report why
with evidence - don't ship partial faces again.