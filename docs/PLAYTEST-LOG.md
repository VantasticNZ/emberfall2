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
| 2026-06-06 | Slice S1.9 — 4 fixes (Van-found) | TALK DISTANCE 96→**40** (stand beside the NPC; probed: prompt ≤~40px); KARMA RE-FARM (real bug) — QuestEngine.choose() now applies each quest choice EXACTLY ONCE (persisted guard + test); re-talking a finished Mara keeps Morality +10 (verified live) + she gives a post-quest line; CHOICES now unmistakable (─ CHOOSE ─ label + amber highlight bar + numbers + ▶ cursor on the active option); TREES diagnosed — art is FINE (no padding); the clip was the PLAYER + foliage reaching the world/camera edge → fixed by insetting the play bounds (3-tile) + decal margin (player now whole at the top, BEFORE/AFTER proofs) | ⏳ Van to re-judge talk-distance + camera feel | engine re-farm bug fixed + tested; verify green |

## Open feel questions for Van (carry forward until answered)
- Walk cadence / stride — does the character move feel responsive, right speed?
- Camera follow — smooth, or choppy? (PARKED: camera lerp + pixel rounding.)
- Does the player pass cleanly behind the forge + tall trees, and in front of low props?
- Dialogue — does E-to-advance + ↑↓-to-choose feel snappy, not sticky?

| 2026-06-06 | Slice S2a — the FIRST fight (charger) | sword attack (Space; hitbox + cooldown + SSOT tuning); ONE CHARGER driven by the Monsters FSM (idle→telegraph→charge→recover); player HP from Inventory + enemy HP, death/respawn, charge damages player; FEEL: hit-pause + screen-shake + Kenney swing/hit/charge SFX + enemy white-flash + knockback; readable TELEGRAPH (charge-line + "!" + wind-up pulse) + cyan PUNISH-WINDOW. Verified live (FSM cycles, hit lands 12, charge hits player, shake/knockback/flash fire); 0 console errors | ⏳⏳ **VAN — this is the whole point**: does HITTING feel satisfying? is the DODGE readable (charge-line)? does the CHARGE feel dangerous? | proof/slice2-combat-telegraph + punish-hit |

| 2026-06-06 | Slice S2b — combat MECHANICS + Marsh (overnight) | DODGE (i-frames, beats charger) + BLOCK + PARRY built as a PURE, unit-tested system (PlayerCombat, 5 checks) + wired into the slice (Space attack / Shift dodge / K block); verified live (dodge negates a charge, block −75%, parry negates + staggers). Design rule recorded (no childhood combat). ASHEN MARSH rendered (bog mood via tints, black-water pools, dead trees, Yssa/Hagga) + M8 plays on-screen with choices + karma (verified). 0 console errors; verify green | ⏳⏳ **VAN, MORNING — all combat FEEL** (see MORNING TODO below) | proof/slice2b-* + slice3-marsh-* |

| 2026-06-07 | Slice S2c — controls + combat polish + options menu | DODGE-ROLL (renamed; i-frames; roll spin — FLAG: proper LPC roll art needed) + DASH stub (separate traversal ability). BLOCK pose = a guard-ARC (FLAG: real block frames needed) + SHIELD-SCALED (iron shield equipped, blockNegate 0.8; shields are items). KID/ADULT gate (combat gated on isAdult; the slice = a dev adult). Canonical CONTROL MAP in SSOT read by InputMap (kbd + basic gamepad + rebind). OPTIONS MENU (Esc): rebind every action, audio sliders, aim-invert, modifiers, 18+-gated adult mode. Modifiers registry (big-head visible). All unit-tested (Combat 7, Modifiers 4); verify green; 0 errors | ⏳ **VAN: confirm BINDINGS + feel** (below) | proof/slice2c-* |

## ⏰ MORNING TODO FOR VAN — CONTROL BINDINGS to confirm (canonical map — change any in-menu or tell me):
Keyboard: WASD/arrows move · **Shift** run · **E** interact · **J / left-click** attack · **Space** dodge-roll ·
**Q** use/throw · **C** block (hold; tap-at-impact = parry) · **R** aim (reserved) · **[ ]** cycle item · **Tab** game menu · **Esc** settings.
Xbox (reserved, wired basic): LStick move (far=run) · A interact · B dodge-roll · X attack · Y use · RT aim · LT block · LB/RB cycle · Start menu · Back settings.
→ Open settings (Esc) → CONTROLS → Enter on a row to rebind. Tell me your preferred layout.
NEW feel items: dodge-roll (i-frames generous enough? roll reads?), block (shield-scaled feels right? parry timing?), shields (block 0.6/0.8/1.0 — tune on the items).

## ⏰ MORNING TODO FOR VAN — feel-tune these (all in src/constants/standards.js → COMBAT):
The LOGIC is built + unit-tested; only the FEEL numbers are placeholders. Play the Greenhollow
slice (the [DEV TEST] charger) and dial:
- ATTACK: ATTACK_DAMAGE / ATTACK_RANGE / ATTACK_COOLDOWN_MS — does the swing feel right?
- DODGE: DODGE_DISTANCE / DODGE_DURATION_MS / DODGE_IFRAME_MS / DODGE_COOLDOWN_MS — does the i-frame
  dash through the charge feel reliable + fair? (Shift)
- BLOCK/PARRY: BLOCK_DAMAGE_TAKEN / PARRY_WINDOW_MS / PARRY_STUN_MS — is the parry window too
  tight/loose? is the stagger a satisfying punish? (K, hold; tap-at-the-right-moment = parry)
- CHARGER: CHARGE_SPEED / CHARGE_DAMAGE / APPROACH_SPEED — dangerous enough? telegraph long enough?
- FEEL FX: HIT_FREEZE_FRAMES / SHAKE_HIT / SHAKE_CHARGE / FLASH_MS — too much/little?
- CONTROLS: I dropped RUN to free SHIFT for dodge — tell me your preferred bindings (the real ones
  are the controller map: A=interact, X=attack, B=dodge, LB=block; keyboard is a stand-in).
- The whole RPS: does dodge↔charger / block↔frontal / flank↔shielded feel good once enemies vary?

## Combat — Van's questions to answer by playing (Stage 2a):
- Are telegraphs READABLE (charge-line + "!" — can you see the wind-up + dodge sideways in time)?
- Do hits have impact (hit-pause / white-flash / screen-shake / sound — does it feel MEATY)?
- Does the charge feel dangerous (do you respect it / want to dodge)?
- Is the punish window (cyan) clear + landing the hit satisfying?
- Tuning notes: too fast/slow? too much/little shake? damage numbers? (all in src/constants/standards.js COMBAT)
