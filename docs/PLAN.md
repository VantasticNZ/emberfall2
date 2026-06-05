# EMBERFALL 2 - MASTER PLAN (locked, Plan B: design-whole-then-build)
## RULE: Follow this order. Do not skip, reorder, or start building until DESIGN is 100% done +
## coherence-reviewed. Every session states which plan step it is on.
## CURRENT STEP: PHASE 2 BUILD — [DONE] karma/deed + QUEST + DIALOGUE engines, ACT 1 Greenhollow M1-M6, AND M7 'Ten Winters Gone' — the KARMA-REACTIVE adult return (src/data/quests/greenhollow.js): the welcome branches on Act-1 deeds/karma (warm/wary by Morality; chicken_kicked/coin_returned/grief callbacks) via new reactive `route` nodes in Dialogue.js; first weapon from Hodge (data reward + weapon flag); accept/press-Sela choice; unlocks M8 (Ashen Marsh stub). Self-tested (`npm test`, full M1-M7 playthrough + two contrasting profiles). NEXT: ASHEN MARSH — M8 arrival at Mirefen + Hagga (exiled oracle), then M9 the Sunken Shrine (lantern tool + Drowned Guardian boss + Shard #1) and M10 Hagga's Truth.
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
