# EMBERFALL 2 - MASTER PLAN (locked, Plan B: design-whole-then-build)
## RULE: Follow this order. Do not skip, reorder, or start building until DESIGN is 100% done +
## coherence-reviewed. Every session states which plan step it is on.
## CURRENT STEP: PHASE 2 BUILD — [DONE] engines + Greenhollow M1-M7 + Ashen Marsh COMPLETE (M8-M10 + SA1-SA5), AND the GREENHOLLOW HUB side quests + childhood callbacks (src/data/quests/greenhollow.side.js): SG1 Fatley marker-onboarding (skill_see_markers; the sanctioned Gate-D exception), SG2 Pem hunt (cross-region clue assembly -> pem_found; closes pem_clue_marsh), SG3 Hodge job (repair skill), SG4 Mara's Letters (reacts to drowned_letter; expose -> mara_exposed), SG5 Tankard Songs, SG7 Orchard Thief (locked-out if chicken_kicked), + a reactive GHUB vignette where the village remembers chicken_kicked/coin_returned/cave_lore/grief_vow. Self-tested (`npm test`, 37 checks; the Act-1 seeds visibly pay off). AND SUNDERED PEAKS COMPLETE (region 2): M11 arrival (miners-vs-owner dispute) + M12 Cinder Keep (tool_grapple + SHARD #2 = shard_2 [2/5] + order_chose_lie truth, reactive to the M10 decision) + SP1-SP5 (The Order's Records + pem_clue_peaks, Crag Beast bounty, The Stubborn Miner/Mike Hunt faction fork, grapple-gated High-Pass Climb, and the SIGNATURE morality-reactive TRICK 'A Stranger's Plea'). Files: sunderedpeaks.js + sunderedpeaks.side.js. Self-tested (`npm test`, 45 checks; shard 2/5). NEXT: TIDEWRECK COAST (region 3) — M13 arrival at Saltbreak (smuggler/fisher intrigue) + M14 The Drowned Vault (HOOKSHOT tool = tool_hookshot + SHARD #3 + a betrayal-in-the-lie's-past truth) + coast side quests ST1-ST6 (incl. the T5 seeded betrayal, a Message-in-a-Bottle Pem clue pem_clue_coast, the lighthouse-keeper heartfelt vignette).
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
