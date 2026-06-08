# EMBERFALL 2 — EXCELLENCE + CROSS-VERIFICATION FRAMEWORK

> **Integrated master design — Layer 2 completion (the GOVERNING quality structure).**
> Every quality FACTOR (art, audio, terrain-cohesion, feel, readability, story, quests,
> gating, density) gets its own **Definition-of-Done + excellence bar**, and each is
> **cross-verified against every other** — multiple times (design → build → region-done).
> Sits over `QUALITY-SPEC.md` (the locked look bar) + `QUALITY-BIBLE` Part 2.5/2.6 (the DoD
> gates). The headline rule: **a region is "done" only when all factor-DoDs are green AND
> all cross-checks pass AND Van's feel-verdict is yes** (§7). Doc-only.

---

## 1. ART DIRECTION (per region)
Each region has a **theme · emotional tone · palette + complementary scheme · readability
rule**. The complementary accent is *how the key things pop* — the accent hue is reserved
for what the player must parse (interactables / the path / the threat), so it never sinks
into scenery. All within the **locked LPC 32px palette** (`QUALITY-SPEC §0`); "palette" =
which LPC hues dominate, not new colours.

| Region | Theme | Emotional tone | Dominant palette | Complementary ACCENT (what pops) |
|---|---|---|---|---|
| **Greenhollow** | home village, hearth | **warm · peaceful** (creeping unease by M5) | warm greens + earth browns | **hearth-orange** (the Hearthflame, chapel) — orange on green |
| **West Belt** | the green→bog threshold | transitional, calming-then-wary | green fading to murk | trail-amber (the waystone) |
| **Ashen Marsh** | bog / witch culture, the first lie | **eerie · desaturated · dread** | desaturated olive + murky teal/black water | **lantern-amber** — warm light vs cold teal (the lantern literally pops) |
| **Sundered Peaks** | mountain / miner, strength, a shard by force | **stark · cold · struggle** | cold greys + stone-blue + snow-white | **ember-rust** (the Order's keep-fires) — warm rust on grey |
| **Tidewreck Coast** | storm coast, wrecks, lighthouse | **bittersweet · windy · open** | blue-grey sea + sand-tan | **lighthouse-gold** + sea-glass green |
| **Emberwood** | a forest unnaturally burning — "beautiful and wrong" | **tense · tragic · uncanny** | red-black ash **vs** frost-blue/white | the **fire-orange ↔ frost-blue OPPOSITION is itself the complementary scheme** |
| **Hollow Spire** | the oracle seat, the whole truth | **awe · dread · culmination** | white/ice-blue + pale stone | the **shard-glow** (violet/gold) — the only warmth in the cold |

**Readability rule R-VIS (all regions):** any KEY object — interactable (chest/NPC/door/
sign), enemy, exit/path — must **contrast its background by value OR hue** (the region's
accent), never blend. Enemies carry their telegraph colour (Gate E); the path reads via the
channelled terrain + path tile; interactables wear the accent. *Excellence bar:* a first-time
player can point at "where do I go / what can I touch / what can hurt me" in <2 seconds on any
screen, with HUD off.

---

## 2. AUDIO PLAN (per region) — audio is PART of region-done, not a postscript
Maps the **music mood to the §1 art-direction tone**, over the audio SYSTEM (`GAPS-AND-DEPTH §6`:
tension STATES safe/explore/combat/dread, scripted STINGS, LEITMOTIFS, ducking). Plus the
**narrator** (`§7`: a cheeky commentary track; **local CC0/commercial-safe TTS — Piper/Kokoro;
BANNED non-commercial weights: XTTS v2 / F5-TTS / Fish Audio**) and **"no action without
feedback" SFX**.

| Region | Music mood | Ambient bed | Leitmotif |
|---|---|---|---|
| **Greenhollow** | gentle pastoral folk (lute/whistle), major-key | birdsong, hearth crackle, village murmur | **the Hearthflame theme** (warm — later corrupted) |
| **Ashen Marsh** | sparse eerie drones, unsettling strings | frogs/insects, dripping black water, low wind | **Hagga's motif** (the first lie) |
| **Sundered Peaks** | stark cold — wind, sparse percussion, low brass at the keep | high-wind howl, scree, distant rockfall | **the Order's motif** (cold, martial) |
| **Tidewreck Coast** | windy, bittersweet strings | gulls, waves, the lighthouse bell | the lighthouse melody (loss — mirrors Bram) |
| **Emberwood** | tense + mournful, dissonant-but-beautiful | fire crackle ↔ ice groan (the duality) | **the Ember/god-agony motif** (= the Hearthflame theme, twisted) |
| **Hollow Spire** | awe/dread choral, sustained | wind-at-altitude, a deep hum | **the whole-game leitmotif, resolved** |

**Cross-game audio rules:** tension STATE cross-fades on entering combat/safe/dread; **scripted
STINGS** for the catastrophe (M6), each betrayal (M10/M17/ST5), and cameo reveals (the gag
stings are *written into* the comedy — they need audio to land); **SFX law A-SFX — no action
without feedback:** every attack/hit/block/dodge/pickup/open/UI-confirm/deny has a cue.
*Excellence bar:* eyes closed, you can tell which region + which tension-state you're in from
sound alone; every input is audibly acknowledged.
**Current reality (flag):** only 3 SFX exist (`swing/hit/charge_impact`, Kenney CC0). **No
music, no ambient, no stings, no narrator** — the entire audio system is a GAP (§6 confidence).

---

## 3. DEFINITION-OF-DONE MATRIX (every factor: its DoD + excellence bar)

| # | FACTOR | Definition-of-Done (checklist) | Excellence bar ("amazing" =) | Enforced by |
|---|---|---|---|---|
| F1 | **Visual / art-direction** | region matches its §1 row (theme/tone/palette/accent); R-VIS readability holds; no off-standard art | the screen reads its EMOTION before you move; the accent guides the eye effortlessly | **[EYE]** Van + QUALITY-SPEC C4 lint |
| F2 | **Audio** | §2 music-mood + ambient + ≥1 leitmotif + tension-states + A-SFX (every action) wired | eyes-closed region+state legibility; stings land the comedy/tragedy | **[EYE]** Van (no gate yet — audio not in verify) |
| F3 | **Terrain cohesion (C1–C5)** | C1 continuous cliffs (0 orphans) · C2 biome ground (not tint) · C3 feathered seam · C4 res/palette unity · C5 scale | the biome reads as ONE crafted place, no patchwork, no gaps | **GATE** (verify: seam #11, density #9; C1/C2 [EYE]→future gate) |
| F4 | **Game-feel / juice** | hit-pause/shake/flash/knockback/SFX on every combat verb; movement/camera tuned; input buffer | hits feel MEATY, dodge a real escape, the world responds to touch | **[EYE]** Van (standards.js SSOT) |
| F5 | **Readability** | key things (path/exit/interactable/enemy) contrast bg per R-VIS at the region's density | HUD-off, a newcomer parses the screen in <2s | **[EYE]** Van + partial (density gate) |
| F6 | **Story integration** | the region's art/audio/encounters serve its STORY beat (TONE range honoured) | the place *feels* like its narrative (eerie marsh, stark peaks) — mood = meaning | **[EYE]** Van |
| F7 | **Quest placement** | every quest placed per `STORY-MAP-OVERLAY` (giver/spot/trigger), givers in safe hubs | side quests route you everywhere; no giver stranded among monsters | **GATE-adjacent** (overlay + entrance/gating gates) |
| F8 | **Gating** | gates match `gating.js`; entrances coherent; no soft-lock | linear first-clear, free revisit; every tease pays off | **GATE** (#7 no-soft-lock, #13 entrance) |
| F9 | **Density** | every screen hits its `QUALITY-SPEC §3` band (town 15–25 / wild 6–12 / lull ≥3); no dead run | "something everywhere," never empty, never noise | **GATE** (#9 floor; "full" band = future tune) |

---

## 4. CROSS-VERIFICATION MATRIX (each factor checked AGAINST the others)
The **key structure**: factors aren't verified alone — each is checked against the others, so
"the art is fine" AND "the audio is fine" can't both be true while *clashing*. Run these
**three times: at DESIGN (this layer), during BUILD, and at REGION-DONE.**

| Cross-check | Question (pass/fail) | When | Type |
|---|---|---|---|
| **Audio-mood × Visual-tone** | does the music mood match the art-direction emotion? (eerie marsh score over desaturated marsh — not a jaunty tune) | design+done | [EYE] |
| **Visual-theme × Story-beat** | does the region's look serve its narrative moment? (Peaks = stark struggle for "a shard by force") | design+build+done | [EYE] |
| **Terrain-mood × Emotional-tone** | does the biome FEEL the intended emotion? (rock+wind+snow = cold struggle, not cozy) | build+done | [EYE] |
| **Readability × Density** | full to the band AND still parseable? (no "dense = noise" — R-VIS holds at max density) | build+done | [EYE] + density gate |
| **Game-feel × Audio** | does every combat/interaction verb have BOTH juice AND a sound? (no silent hits) | build+done | [EYE] (A-SFX) |
| **Quest-placement × Gating** | is each quest-giver reachable when the story triggers it? (key earned before the gate) | design+done | **GATE** (no-soft-lock #7 + entrance #13 + overlay) |
| **Gating × Story order** | does the gate/tool order match the M1–M20 narrative order? | design | **GATE** (#7) + [EYE] |
| **Terrain-cohesion × Art-direction** | do C1–C5 serve the palette/accent? (rock ground supports the cold-grey scheme; the accent still pops) | build+done | [EYE] + C-gates |
| **Audio-leitmotif × Story-thread** | do the leitmotifs connect the right beats? (Hearthflame→Ember motif = the corruption arc) | design+done | [EYE] |
| **Emotional-pacing × Region-sequence** | §5 — is the mood rhythm varied across regions, not monotonous? | design | [EYE] |

**Verify.mjs-gateable today:** quest-reachability (#7), entrance coherence (#13), seam (#11),
density floor (#9), prop/licence/SSOT. **[EYE]/Van-judged:** all the mood/tone/feel/readability
cross-checks (they're aesthetic — measurable only by the eye/ear). The framework's value is
NAMING them so they're checked every time, not skipped.

---

## 5. EMOTIONAL PACING — the mood RHYTHM across M1–M20 (the anti-monotony check)
The journey must **breathe** — calm → tension → relief → awe — not flatline. Mapped:

| Beats | Region | Dominant mood | (whiplash comedy threaded throughout via cameos/PH) |
|---|---|---|---|
| M1–M5 | Greenhollow (child) | **warm / playful** (unease creeping at M5) | fart bushes, gags |
| **M6** | Greenhollow burns | **TRAGEDY / shock** (the gut-punch) | — (let it land) |
| M7 | Greenhollow (return) | melancholy / resolve | wry returns |
| M8–M10 | Ashen Marsh | **eerie / mystery / dread** | Old Karl (Sagan), the frog |
| M11–M12 | Sundered Peaks | **stark / struggle / cold** | Diogenes in the marble hall |
| M13–M14 | Tidewreck Coast | **bittersweet / open / windy** | the short general, the midnight raid |
| M15–M16 | Emberwood | **tense / tragic / uncanny** | the Chill Prophet's defiant feast |
| M17–M20 | Hollow Spire | **awe / dread / culmination** | the kicked chicken returns |

**Rhythm:** warm → shock → mystery → struggle → bittersweet → tragic → awe — **no two adjacent
regions share a dominant mood** (Marsh eerie ≠ Peaks stark ≠ Coast bittersweet ≠ Emberwood
tense ≠ Spire awe). ✅ varied. **Check at each region build:** if a new region's mood reads
same-y as its neighbour, RE-TONE (palette/audio) — flag monotony before it ships. The comedy
whiplash (TONE-AND-FEEL core) is the constant that keeps even the dark stretches from souring.

---

## 6. CONFIDENCE-RANKED ASSET GAPS (the sourcing-risk rule)
Tags: **[HAVE]** in-repo · **[HAVE⚙]** in-repo, needs WIRING (no hunt) · **[HIGH]** almost
certainly sourceable as clean LPC/OGA (source just-in-time) · **[LOW]** might not exist as
clean LPC — **must be resolved (in hand) BEFORE committing to its region** (don't start a
region whose look depends on an asset that may not exist).

| Gap | Confidence | For | Note |
|---|---|---|---|
| rock/snow/lava/ocean/sand ground, cliffs | **HAVE⚙** | all biomes | terrain-v7 + eliza — wire (Peaks done) |
| **Peaks terraced stone-town exterior** | **HIGH** | Peaks slice | LPC stone buildings exist; assemble — source for the slice |
| animals / critters | **HIGH** | cross-cutting | LPC has a large animals set |
| crop growth-stages | **HIGH** | cross-cutting | LPC farming tilesets |
| outdoor bench | **HIGH** | cross-cutting | LPC furniture |
| burnt trees | **HIGH** | Emberwood | recolour `trees_winter` / LPC dead-tree props |
| **dock / pier** | **HIGH** | Coast | LPC harbour/bridge tiles exist |
| CC0 music beds + extra SFX | **HIGH** | audio (all) | Kenney / Sonniss GameAudioGDC / OGA (CC0) |
| **shipwreck** (large, on the reef) | **LOW** | Coast | a big LPC wreck is uncertain — verify before Coast |
| **lighthouse** (tall tower) | **LOW** | Coast | a clean LPC lighthouse is uncertain — verify before Coast |
| **volcano cone** silhouette | **LOW** | Emberwood | a proper LPC volcano is uncertain — verify before Emberwood |
| **spire / tall tower** structure | **LOW** | Spire | a distinct tall spire is uncertain — verify before Spire |
| **tool HELD-item sprites** (lantern/grapple/hookshot/firefrost on the LPC rig) + world FX | **LOW** | slice + all | may need custom paper-doll layers — resolve for the SLICE |
| narrator voice + bespoke leitmotifs | **LOW (create)** | audio | local TTS render (Piper/Kokoro) + composed motifs — not "sourced" |

**THE RULE (sourcing-risk gate):** **no region build starts until its [LOW] assets are in
hand.** Coast waits on lighthouse+shipwreck confidence; Emberwood on the volcano cone; Spire on
the tower. [HIGH] assets are sourced just-in-time during the build. *(This is exactly what
prevented a second "no stone tile mid-build" — risk is resolved before commitment.)*

---

## 7. REGION COMPLETION DoD (the single "is it done?" checklist) + VERTICAL-SLICE-FIRST
A region is **DONE** only when ALL hold:
1. **F1 Visual** ✅ matches its §1 art-direction (theme/tone/palette/accent), R-VIS readable.
2. **F2 Audio** ✅ §2 mood + ambient + ≥1 leitmotif + tension-states + A-SFX wired.
3. **F3 Terrain cohesion** ✅ C1–C5 (continuous cliffs, biome ground, feathered seams).
4. **F4 Game-feel** ✅ juice on every verb; movement/camera tuned (Van-judged).
5. **F5 Readability** ✅ key things parse <2s, HUD-off.
6. **F6 Story integration** ✅ art/audio/encounters serve the beat; TONE range present.
7. **F7 Quest placement** ✅ every quest placed per overlay; givers safe.
8. **F8 Gating** ✅ gates match gating.js; entrances coherent; no soft-lock.
9. **F9 Density** ✅ every screen hits its band; no dead run.
10. **CROSS-CHECKS (§4)** ✅ all pass (esp. audio×visual, visual×story, readability×density).
11. **EMOTIONAL PACING (§5)** ✅ the region's mood is distinct from its neighbours.
12. **ASSET CONFIDENCE (§6)** ✅ no [LOW] gap unresolved; everything conforms to the lock.
13. **VAN'S FEEL-VERDICT** ✅ — the final, non-negotiable gate (HARD RULE 9): Van plays it and
    says it's *amazing*, not just *correct*.

> **VERTICAL-SLICE-FIRST (committed):** take **Greenhollow → Foothill → Sundered Peaks** all the
> way to THIS DoD — art-direction, audio, feel, readability, the full cross-check pass, Van's
> verdict — **before building Coast / Emberwood / Spire.** Prove the excellence bar end-to-end on
> one slice (one calm region + one route + one stark combat region + the gate + the grant) so the
> bar is *demonstrated*, not just specified; then replicate it region by region. A polished slice
> beats five rough regions. *(Reconcile: WORLD-BIBLE's old "Marsh as Region 1" build-order note is
> superseded — GH/Belt/Marsh/Peaks are built; the slice to finish to the bar is GH→Peaks.)*

---

## 8. CONTRADICTIONS FLAGGED (reconcile, not override)
1. **Build-order note:** WORLD-BIBLE recommends "Marsh as Region 1." Superseded — the regions are
   built (GH/Belt/Marsh/Peaks); the governing plan now is **vertical-slice-first GH→Peaks to this
   DoD** (§7), then Coast→Emberwood→Spire (each behind its [LOW]-asset resolution, §6).
2. **Peaks tool naming:** WORLD-BIBLE calls the Peaks tool "STRENGTH (move boulders)"; the SSOT +
   gating.js use **`tool_grapple`**. gating.js/flags.js is canonical (grapple = the Peaks tool);
   the "strength/boulders" flavour is narrative dressing, not a second tool.
3. **Coast tool:** WORLD-BIBLE says "HOOKSHOT/GRAPPLE"; gating.js grants **hookshot** at Coast
   (grapple is earned at Peaks). gating.js is canonical.
4. **Audio is essentially absent** (3 SFX only) yet F2 makes it part of region-done — so **no
   region (incl. the GH→Peaks slice) is DONE until the audio system stands up** (CC0 beds = HIGH;
   leitmotifs/narrator = create). This is the biggest cross-cutting gap; flagged, not faked.
5. **C1/C2 not yet verify-gated** — enforced [EYE] today (the Peaks re-fix proved them); they
   become verify gates when the cliff/biome-ground data model is generalised (QUALITY-SPEC §6 roadmap).

*Cross-links: QUALITY-SPEC.md (the locked standard + C1–C5 + gate roadmap) · MASTER-MAP.md (the
per-region physical spec these factors dress) · STORY-MAP-OVERLAY.md (F7 quest placement) ·
ASSET-MANIFEST.md (the gap list §6 refines with confidence) · GAPS-AND-DEPTH.md (§6 audio / §7
narrator / §1 juice — the source of F2/F4) · TONE-AND-FEEL.md + WORLD-BIBLE.md (the region themes
F1/F6 serve) · QUALITY-BIBLE Part 2.5/2.6 + verify.mjs (the enforced gates). Doc-only; no code touched.*
