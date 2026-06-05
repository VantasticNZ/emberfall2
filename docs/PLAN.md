# EMBERFALL 2 - MASTER PLAN (locked, Plan B: design-whole-then-build)
## RULE: Follow this order. Do not skip, reorder, or start building until DESIGN is 100% done +
## coherence-reviewed. Every session states which plan step it is on.
## CURRENT STEP: PHASE 2 BUILD — [DONE] engines + Greenhollow M1-M7, AND the first full REGION LOOP: Ashen Marsh M8 + M9 (src/data/quests/ashenmarsh.js). M8 'Into the Ashen Marsh' (Mirefen + Elder Yssa + Hagga; kind/cruel bog-folk choice). M9 'The Sunken Shrine' dungeon (earn the LANTERN = tool_lantern; Drowned Guardian learn-the-pattern beats; claim SHARD #1 = shard_1) — tool + shard granted as persistent flags later regions read; unlocks M10. Self-tested (`npm test`, 28 checks; flags persist through save/reload, shard count 1/5). NEXT: M10 'Hagga's Truth' — the first PERMANENT decision (believe Hagga / report to Sela / stay silent; gates the Liberator/Tyrant paths) + the Ashen Marsh side quests (SA1-SA5).
## PHASE 1 - DESIGN (all on paper/docs first, to QUALITY-BIBLE) === COMPLETE ===
  [x] Quality Bible / DoD
  [x] World Map
  [x] Story & Quests - BLUEPRINT (main spine + side web + endings)
  [x] Systems Design (weapons ~24, armour ~12+, magic 5-10, monsters, skill tree, stats) - as data specs
  [x] FULL QUEST FLESH - every main quest written in full (beats, dialogue, choices, rewards, deed hooks)
  [x] FULL QUEST FLESH - every side quest written in full, per region
  [x] COHERENCE REVIEW - read whole design end-to-end: every quest links, choices pay off, map holds
      story, no contradictions, morality forks consistent
## PHASE 2 - BUILD (only after Phase 1 signed off): region-by-region, each a shippable increment,
##   each piece passes its QUALITY-BIBLE gates to Van's eye before "done".
## DOC RULE: Claude Code writes/updates all design docs directly in docs\ and commits+pushes.
##   Van does NOT download/move docs manually.
