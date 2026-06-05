# EMBERFALL 2 - MASTER PLAN (locked, Plan B: design-whole-then-build)
## RULE: Follow this order. Do not skip, reorder, or start building until DESIGN is 100% done +
## coherence-reviewed. Every session states which plan step it is on.
## CURRENT STEP: PHASE 2 BUILD — [DONE] engines + Greenhollow M1-M7, AND the ASHEN MARSH COMPLETE (first full region): M8 arrival + M9 Sunken Shrine (lantern + Shard #1) + M10 'Hagga's Truth' [PERMANENT DECISION 1 — believe/report/stay-silent; opens or locks the Liberator path] + side web SA1-SA5 (Bog-Folk Troubles + Pem clue, Hagga's Errands [gated by not-reported], Sunken Dead [lantern-gated], the undefeatable Frog [escape-only puzzle], Drowned Letters [-> Mara link]). Files: src/data/quests/ashenmarsh.js + ashenmarsh.side.js. Self-tested (`npm test`, 30 checks). NEXT (either): (a) GREENHOLLOW HUB side quests — Fatley marker-onboarding (G1), the Pem hunt start (G2, pairs with pem_clue_marsh), Mara's Letters (G4), the Orchard Thief (G7); or (b) SUNDERED PEAKS region 2 — M11 arrival + M12 Cinder Keep (grapple tool + Shard #2 + 'the order chose the lie' truth).
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
