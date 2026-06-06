# EMBERFALL 2 — PLAYTEST LOG (Van's feel-judgments per slice iteration)

A running record of OWNER-JUDGED feel (Part 2.5 P6) — movement, camera, interaction,
combat — so we can see whether feel improves over iterations. Self-checks (text/
tiles/licence) live in the verify gate + commit reports; THIS log is for the things
only Van's hands can judge. One row per playtest.

Format: `date | iteration | what was tested | Van's verdict | follow-ups`
Verdict scale: ✅ good · ⚠ needs work · ❌ bad · ⏳ awaiting Van.

| date | iteration | tested | verdict | follow-ups |
|---|---|---|---|---|
| 2026-06-06 | Slice S1 — Greenhollow walkable + M1 dialogue | movement (WASD/arrows), camera-follow, dialogue advance/choice responsiveness | ⏳ awaiting Van | — |
| 2026-06-06 | Slice S1.5 — presentation pass | same, plus readability at normal zoom | ⏳ awaiting Van | screenshots passed self-check; feel not yet played |
| 2026-06-06 | Slice S1.6 — art foundation | same, plus walking BEHIND the forge + trees (depth-sort occlusion) | ⏳ awaiting Van | confirm occlusion reads right |
| 2026-06-06 | Slice S1.7 — 4 bug fixes (Van-found) | portrait pants (FIXED, screenshot), whole trees at edges (FIXED — RESIZE camera, no crop, no bars, proven on a 21:9 window), camera jolt (roundPixels off + lerp), E-to-talk reliability (radius 50→72 + lenient facing, tested) | ⏳ awaiting Van on CAMERA smoothness + INTERACTION feel | self-checks pass; the two FEEL items need Van's hands |
| 2026-06-06 | Slice S1.8 — 4 polish items (Van-found) | TALK DISTANCE → canonical INTERACTION_RADIUS 72→96 (deliberate ~1.5-tile gap, no clipping; probed); BRAM now stands AT the forge + greeting (pays off "he's at the forge"); TREES whole — taller world (34) + grass margin + repositioned, verified on 16:9 AND 16:10; GROUND VARIETY — grass/clover/fern/flower decals + soft worn-dirt patches (lived-in, ferns thinned to sparse). Rock decal REJECTED (looked like a box) — flagged | ⏳ Van to re-judge talk-distance + camera feel by playing | screenshots pass self-check; rock needs a real OGA-BY rock prop if wanted |

## Open feel questions for Van (carry forward until answered)
- Walk cadence / stride — does the character move feel responsive, right speed?
- Camera follow — smooth, or choppy? (PARKED: camera lerp + pixel rounding.)
- Does the player pass cleanly behind the forge + tall trees, and in front of low props?
- Dialogue — does E-to-advance + ↑↓-to-choose feel snappy, not sticky?

## Combat (Stage 2, not yet built) — when it exists, log:
- Are telegraphs READABLE (you see the wind-up + can react)?
- Do hits have impact (hit-pause / flash / shake)?
- Do dodge/block windows feel fair (challenging-not-brutal)?
