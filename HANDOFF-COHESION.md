EMBERFALL 2 - fix cohesion + zoom + faces. Read docs\QUALITY-BIBLE.md (Gate M, I, C). Do one at a
time, verify LIVE w/ screenshot, per-file commit.

1. TERRAIN SWAP: replace Kenney ground/props with LPC's OWN terrain tiles (grass/dirt/path/water +
   trees/bushes) - same art family as the characters for matching pixel density. License-check
   (CC0/CC-BY-SA, no anti-AI), record in ART-LICENSE-NOTE.md. Update manifest only.
2. ZOOM/SCALE: zoom camera out + render tiles at correct size so ~more world is visible and it's
   not blocky. Hero should be a sensible fraction of screen (think Zelda/Stardew framing).
3. FACES: verify the LPC head/face layer COMPOSITES correctly on hero + all NPCs, all 4 directions
   - no blank/missing heads (the old project's bug). Screenshot faces close-up as proof.
4. Re-run gates C/I/M + faces; screenshots; 0 console errors; clean build.

CONSTRAINTS: AI-safe art only; write-once + data-driven; manifest swap not logic rewrite; verify
each LIVE before next. REPORT: cohesion fixed, zoom right, faces composite correctly (proof), gates
pass. Flag honestly.