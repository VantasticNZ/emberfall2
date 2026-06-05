EMBERFALL 2 - build the quest-map webpage + finish design phase. Follow docs\PLAN.md. Commit + push each step.

1. BUILD docs\quest-map.html - a standalone interactive webpage (opens in browser) generated FROM
   docs\QUEST-DATA.json. Requirements:
   - Read QUEST-DATA.json; render ALL quests in left->right COMPLETION LAYERS (timeline), scrollable.
   - Each quest shows choices colored by impact: good=green, neutral=amber, dark=red. Permanent
     decisions visually marked.
   - Click a choice -> trace path: prune (grey out) quests in its "locks"; update live MORALITY and
     PURITY score bars; show the choice's "story" impact note; trend toward one of the FIVE endings
     (Warden/Saint/Tyrant/Liberator + secret Ashbearer) shown as cards that light up.
   - Show the "story" note text on each choice (hover or under the choice).
   - Clean, dark-mode-friendly, self-contained (inline CSS/JS, no external deps). Title "Emberfall - Quest & Decision Map".
   - It must stay in sync with the JSON (read the file / embed its contents at build).
   - Verify it opens and works (open in a browser / serve locally), screenshot it.

2. ADD CONTROLLER SUPPORT to docs\SYSTEMS-DESIGN-V2.md: a section requiring full gamepad support
   (Xbox controller primary) + keyboard, with REMAPPABLE bindings, input-method auto-detect, and
   on-screen prompts that match the active device. Add a matching gate to docs\QUALITY-BIBLE.md
   (Gate N - Input: every action playable on Xbox controller AND keyboard; bindings remappable;
   prompts match device).

3. UPDATE docs\PLAN.md: tick [x] all PHASE 1 DESIGN items (Quality Bible, World Map, Story&Quests,
   Systems, Full Quest Flesh main+side, Coherence Review). Mark PHASE 1 = COMPLETE. Set CURRENT STEP
   = "PHASE 2 BUILD: core write-once systems + deed-memory + karma FIRST, then Greenhollow + Ashen
   Marsh as first shippable slice".

4. git add docs; commit "Quest-map webpage + controller support + Phase 1 design complete"; push.
   Concise report incl. confirming quest-map.html works (with a screenshot).