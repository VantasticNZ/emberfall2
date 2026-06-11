# PROCESS RETROSPECTIVE — why gates went green while the game was broken

> Honest retro (Van wants honesty over reassurance). The recurring failures share ONE root cause and a
> few meta-rules fix the class, not the instances. This is the SSOT for "why we missed it + the systemic
> fix." Pairs with `DONE-DEFINITION` (the runtime DoD), `DEFERRED.md` (nothing silently dropped), and the
> gate audit below.

## THE ROOT CAUSE (one sentence)
**Every automated gate tests DATA or a flood-fill SIMULATION — none runs the real Phaser physics + render
— so the failure classes that are RUNTIME/PHYSICS/VISUAL (void-escape, dash-tunnel, door-rendered-wrong,
exploit-farm) had NO gate that could catch them, and the one runtime check we have (eyes-on, HARD RULE 9)
was applied inconsistently and sometimes rubber-stamped.**

## THE FAILURES (what happened · why the gate missed it · the systemic fix)
| Failure | What happened | Why the gate missed it | Systemic fix |
|---|---|---|---|
| **Circular collision test** | a test asserted collision held by assuming the thing it should prove | the test was **tautological** — it validated the data it was derived from | **No self-referential tests.** A test must assert against an INDEPENDENT oracle (the runtime, or a hand-written expectation), never re-derive its expectation from the same data. |
| **Interior void (walk off floor into black)** | griddedSettlement floored only streets → black holes; player perceived/approached void | the navGate flood-fill said "perimeter sealed" — true for the WALLS, but it never checked the **floor coverage** or the **rendered** result | **Containment must test the rendered + physical boundary, not just the nav grid.** Added: full-floor + a perimeter-seal assertion. But the real catch was **eyes-on**. |
| **Dash-into-void** | swept-dodge could (allegedly) tunnel a 1-tile wall | NO gate ran the dash physics; the mechanism existed but was **never exercised at runtime** | **A hard runtime clamp** (belt-and-suspenders) + the rule: *a mechanism is not "working" until exercised with REAL input at runtime.* |
| **Bush instant-respawn farm** | loot granted every cut + 12 s respawn → infinite farm | no gate models the **economy/exploit loop**; data looked fine | **Exploit-class items (loot, respawn, shops) require an explicit anti-farm runtime test** in the DoD. |
| **Doors rendered mid-floor / as a sign** | door TILE was data-correct (edge) but the SPRITE rendered centered on the floor, and the marker was a `prop_sign` | gates check the door's TILE + handshake, never **what the door looks like** | **Visual correctness is a DoD item, eyes-on only.** "Data-correct" ≠ "reads correctly." |
| **Designed map never built** | Van's edited map sat as a locked doc while the game ran the OLD layout for many sessions | there was **no "designed == built" check** — a locked design and the running game could diverge silently | **A designed-vs-built reconciliation gate** (added below) + the DoD item "designed==built" + `DEFERRED.md` tracking. |
| **What Van SEES ≠ what's built** (stale M-map + door-clutter) | settlements were relocated to the overworld (gates said 10/11 built), but the **M-map still rendered the old skeleton + a text list** (not pins at the built positions) and the **old GH notice-board doors were never removed** → Van saw the old presentation: a door-board + an unchanged map | **gates + walkability checked DATA, never PRESENTATION** — the M-map's data source (stale list vs live world) and on-screen clutter (old board + new entrances both showing) had no check; "designed==built" passed while the *rendered* world was stale/duplicated | **The M-map must DERIVE from the live world data** (pin settlements at their real entrance positions, not a hardcoded list) + **remove the superseded presentation** (the board) when you add the new one. Gate: **rendered-vs-built / no-duplicate-entrances**. DoD: "the M-map + visible world match the build, eyes-on." |
| **FLOATING DOORS — I rationalised away Van's eyes** | Van saw many doors floating on GH terrain (fresh-reset, build 7df83902). I had "verified" GH was decluttered — but I only removed the board *row* and **dismissed the remaining building-entrance + cave + relocated-settlement doors as "legit scattered entrances," then blamed a stale tab** when Van still saw them. They were REAL free-standing `prop_door` sprites on grass/path the whole time (the trigger tile renders a door, and it sits in the yard in front of buildings / on open terrain) | **I broke meta-rule 2 — a green/data that contradicts Van's eyes means I'm wrong — by rationalising (it's cache / they're legit) instead of accepting the report.** And there was **no gate** for "a door rendered as a free-standing sprite on open ground" | **Doors never render a free-standing `prop_door` on terrain:** a building entrance shows the building's OWN door (no sprite), a cave/dungeon/town entrance shows a MARKER (cave-mouth/waypost), only interior EXITS show the embedded wall-door. Gate: **no-floating-doors** (#20). Meta-rule reinforced: **when Van reports X wrong on a fresh state, X is wrong — fix it, don't explain it away.** |
| **🔴 CC's screenshots showed doors; Van's browser (same build) showed none — VERIFICATION DID NOT REFLECT REALITY** | I reported "doors render in every portal, 9 visible ✅"; Van on the identical build 698fe8c4 saw NO door sprites, just dark holes | **I measured `sprite.visible === true` — the not-hidden FLAG — not whether the pixels are actually drawn.** The door sprites were created at depth `DEPTH.FLOOR+7 = −9993`, but `DEPTH.FLOOR = −10000` and the BUILDINGS are y-depth-sorted at **+9600…+10048** → every door sprite renders **at the floor layer, fully occluded behind its building**. `.visible` is `true`, `alpha` is `1`, and the sprite is **invisible to the eye**. My "exhaustive" harness counted the same flag. The "doors" in my screenshots were the buildings' OWN painted doors (dark holes), which I misread as my sprites. | **NEVER treat `.visible`/`.alpha`/object-existence as "renders."** To verify a sprite is SEEN: (1) check its **depth vs occluders** (is it in front of the building?), or (2) **sample the rendered pixels** at its screen position and compare to the asset's colours, or (3) take a **plain fresh-load screenshot with the default camera** (no teleport/centerOn/force-stream) and confirm visually. Screenshot **the way Van loads it**, not a forced state. (The angle-entry has the SAME root: the door marker is occluded, so Van can't see the exact trigger tile and aims at the painted door — head-on entry works when aligned, proven with real key input.) |
| **"Fixed ✅" then Van finds new broken cases — 7× (the verification method)** | each door pass tested a FEW buildings, reported done, then Van hit a different broken one (store, black-floor generic, step-away, doors-not-rendering) | **verification checked a sample, not the WHOLE set.** A green on 3 buildings says nothing about the other 19 | **EXHAUSTIVE pass/fail table: EVERY building × EVERY case, real input, fresh save — not done until 100% PASS.** Encoded as gates (every building enterable + asset-doorway + interior-non-empty + valid-exit). The exhaustive run itself FOUND the real bugs (a music-tween that threw every frame and HALTED the update loop → delayedCalls didn't fire → ~12 buildings silently failed to enter; and `floor:'wood'` = a non-existent terrain set → black room). A few-building check would have missed both. |
| **An audio tween halted the whole update loop** | ~12 buildings "failed to enter" in the exhaustive run | the music **fade-IN** tween kept running on a sound the **fade-OUT** tween then destroyed → `set volume on null` **every frame** → the TweenManager step threw → downstream updates (incl. door-enter `delayedCall`s) didn't run | `killTweensOf(old)` before fading/destroying it. Lesson: **one throwing tween can silently break unrelated systems** — guard audio crossfades; and an exhaustive runtime test surfaces these where data gates can't. |
| **Doors patched per-building, forever** | every door pass fixed one building's alignment, then another broke (store, shop, tavern-exit, chapel) — endless whack-a-mole | the doorway POSITION was **guessed in scene code** (collider centre + a per-sprite offset map), not owned by the asset. Each building sprite has its door in a DIFFERENT spot (store bottom-right, manor bottom-left, paneled porch) → a single heuristic could never fit all | **Make the doorway a PROPERTY OF THE ASSET** (`PROPS[key].doorway.px`, read off the sprite art). The ONE door system derives visible+walkable+trigger from it → a fix applies to ALL buildings; a new building only declares its doorway once. Gate: **every building asset must declare `doorway`.** (Van's governing principle: assets own their portals.) |
| **Interior isolation + trigger-on-visible-door** | inside a building Van saw 3 OTHER rooms in the black; the chapel trigger sat on the window, not its (right-side) porch door | (1) interiors share a far-band → proximity STREAMED several at once. (2) the carve centred the doorway on the COLLIDER, but some sprite art (paneled house) has its painted door OFF-CENTRE → trigger ≠ visible door | (1) **only the ACTIVE interior renders** when `_inInterior` (filter the stream to the room you're in). (2) a per-SPRITE `DOOR_OFFSET` shifts the doorway tile + threshold + trigger onto the VISIBLE painted door — you enter through the opening you can SEE. Both are RUNTIME/visual truths → eyes-on-verified (screenshots), per the visual-truth pattern. Also: **a relocated entrance MUST be re-checked walkable** — I first dropped the cave on a tree (unreachable); probe for a walkable tile, then place. |
| **"Fixed" doors but most buildings still un-enterable** | after the door-system passes, Van still saw inconsistency — only **6 of 22** buildings entered | I **converted only GH** and called the door system "built" — Marsh/Mirefen + Peaks buildings were never given doors (still solid props). A per-region fix masqueraded as a system. (Also: my enterability TEST used `_solidAt`, which counted **disabled** colliders as solid → false "blocked" readings.) | **Build the system ONCE and apply it UNIFORMLY** — `_resolveBuildingDoor` defaults EVERY building to an enterable door (generic interior); a gate that asserts **every building in every region** (not a sample) is enterable. And: **test helpers must mirror real physics** — a disabled body is not solid (`_solidAt` now skips `enable===false`). |
| **Inconsistent doorway entry + threshold snag** | some buildings entered, some didn't; the avatar stuck half-on the threshold line | a **float** doorway gap (`TILE*1.1`, sides `(cw-gap)/2`) left the walkable gap and the trigger tile (`round(ccx/TILE)`) **mis-registered** — the trigger could sit partly under a side collider (→ "sometimes works") and the sub-tile sliver gave a snag edge | **Snap doorways to a WHOLE TILE** — `dCol=round((ccx-TILE/2)/TILE)`, solids end exactly at `dCol*TILE` / `(dCol+1)*TILE`; one clean tile-aligned walkable tile (gate #21). Lesson: **geometry the player must land on EXACTLY must be tile-aligned, never float-approximate.** Also a **duplicate-method syntax slip** shipped a Vite 500 — catch with an `esbuild --bundle` parse check before the eyes-on run. |
| **🔴 THE BIG ONE — "fixed but Van still sees it broken," repeatedly** | a whole string of fixes (M-map, doors, declutter) "passed" my eyes-on but Van still saw the old/broken world | **I verified in the WRONG STATE.** Playwright's fresh-scene / default-load is NOT Van's state — Van loads a **saved game** (autoloaded position) in a **long-lived tab** (HMR-stale Phaser scene). "Verified" meant *"fixed in a state Van never sees."* Two compounding stale-state bugs (an old SAVE loading an old position; an HMR tab running an old SCENE under a fresh build-stamp) made my green checks meaningless to Van | **(1) LOCK: a fix is NOT verified unless checked in the USER'S EXACT STATE — cleared save (localStorage cleared) + a recreated scene (full reload) + the build Van loads. (2) BUILD the stale-state preventatives so the wrong state can't persist: a save WORLD-VERSION guard (stale-position save → reset to spawn, progress kept), an HMR full-reload (a dev tab can't run a stale scene), and an F8 fresh-game. (3) Meta-rule 10 below.** |
| **"Done" claimed before true** | quality/“finished” asserted while greybox/broken | the DoD existed but was applied **inconsistently**; green tests gave false confidence | **One unambiguous runtime DoD checklist** (`DONE-DEFINITION`) that MUST be eyes-on-true before "done"; and the meta-rule that a green test contradicting Van's eyes is a TEST BUG. |

## META-RULES (the extracted laws — apply every session)
1. **Every gate must ultimately defend a RUNTIME player experience.** A data/simulation gate is a proxy;
   it must be **paired with an eyes-on runtime check** for anything physical/visual. Name the runtime
   behaviour each gate protects — if you can't, the gate is testing the wrong thing.
2. **A green test that contradicts Van's eyes means the TEST is wrong.** Fix the test (make it catch the
   real thing), don't trust the green. Green is a hypothesis, the running game is the truth.
3. **"Working" requires exercising it with REAL input at runtime** (walk it, dash it, cut it, enter it) —
   not "the mechanism/data is present." Present ≠ proven.
4. **Data-correct ≠ reads-correct.** Visual/feel correctness is eyes-on, always (HARD RULE 9).
5. **Designed ≠ built.** A locked design is a debt until the running game matches it — tracked, checked,
   and never assumed.
6. **Deferred ≠ dropped.** Every deferral is logged in `DEFERRED.md` with a when-to-build milestone.
7. **No self-referential / tautological tests.** Assert against an independent oracle.
8. **Honest checklists.** Every requested item ends ✅ (proven) or ❌ (with reason); "done" is not
   claimed until the runtime DoD is eyes-on-true. Under-claim, never over-claim.
9. **What the player SEES must match what's built — PRESENTATION is part of the DoD, not just data +
   walkability.** Views (the M-map, HUD, overlays) must DERIVE from the live world data, never a
   hardcoded/stale list. When you replace a feature (a relocated entrance), **remove the superseded
   presentation** (the old door/board) — never leave both showing. "Data-correct + walkable" is not done
   if the on-screen world (map + clutter) still reads as the old layout.
11. **PIXEL-TRUTH — "renders" is proven ONLY by sampling rendered PIXELS or DEPTH-vs-OCCLUDER, NEVER by
    `.visible`/`.alpha`/object-existence.** A sprite can be `visible:true`, `alpha:1`, and fully occluded
    (doors at floor depth: "9 visible ✅" while Van saw none). Sample the framebuffer
    (`renderer.snapshotPixel`) and assert the asset's colour, or prove `depth > every overlapping occluder`.
    **Cite the pixel/occlusion evidence in the report.** Node verify gates are DATA proxies — visual truth is
    a Playwright pixel-check. (See `DONE-DEFINITION` §B + the reusable helper there.)
12. **VAN'S LOAD PATH for screenshots** — plain fresh load, cleared save, DEFAULT camera-follow, NO
    teleport/centerOn/force-stream/forced-frame. A forced state shows views Van never sees.
10. **VERIFY IN THE USER'S EXACT STATE — Van's eyes on a hard-reset fresh state are the truth; a check in
    any other state is INVALID.** Playwright's fresh-scene / default load ≠ Van's reality (a saved game in
    a long-lived tab). Before claiming a fix verified: **clear the save (localStorage cleared) + full
    page reload (recreate the scene, not a stale tab) + the build Van loads**, and take the eyes-on
    screenshots from THAT state. If a check passes in one state but Van reports it broken, **his state is
    the real one — reproduce it, don't argue the green.** (This is the root cause of the whole
    "fixed-but-still-broken" chain — verifying in a state Van never sees.)

## GATE AUDIT — does each verify gate test RUNTIME or just DATA?
**Every gate below is DATA-static or flood-fill SIMULATION — runtime/physics/render is covered ONLY by the
navGate flood-fill (partial) + eyes-on (HARD RULE 9).** That gap is the root cause.
| # | Gate | Tests | Type | Defends (runtime behaviour) | Status |
|---|---|---|---|---|---|
| 1 | npm test (units) | logic | DATA | pure-logic systems | ok — pair w/ eyes-on for anything rendered |
| 2 | orphan-id | id refs | DATA | quest/ending callbacks fire | ok (data is the point) |
| 3 | items-SSOT | item defs | DATA | economy refs resolve | ok |
| 4 | licence | public/ files | DATA | legal safety | ok |
| 5 | storage | save isolation | DATA | save integrity | ok |
| 6 | consistency (magic #) | literals | DATA | tuning SSOT | ok |
| 7 | no-soft-locks | gating DAG | DATA | every key obtainable in order | **proxy** — graph ≠ physical reachability; pair w/ navGate + a playthrough |
| 8 | ability-coverage | ability gates | DATA | no decorative ability | ok (design rule) |
| 9 | channelled-not-open | nav data | DATA | routes read as channels | **proxy** — doesn't test feel; eyes-on |
| 10 | density-floor | prop counts | DATA | no empty sectors | **WEAK** — counts ≠ looks-good; eyes-on |
| 11 | collision-matches-visual-mass | prop colliders | DATA | solids actually block | **WEAK (this one went green while broken)** — proves a collider EXISTS, not that it BLOCKS at runtime; pair w/ navGate + dash test |
| 12 | seam-coherence | region bounds | DATA | no world gaps | ok-ish; eyes-on the seam |
| 13 | prop-key-integrity | keys | DATA | no missing art keys | ok |
| 14 | entrance-coherence | door handshake | DATA | doors link valid regions | **proxy** — doesn't test you can WALK the entrance; pair w/ navGate |
| 15 | **navGate (interiors.test): reachability + containment (walk + dash inputs)** | flood-fill + clamp inputs | **SIMULATION** | body can walk spawn→exits; perimeter sealed | **best we have, still not real physics** (no swept-dodge, no render) — eyes-on remains required |
| 16 | **designed-vs-built** | locked map vs built regions | DATA | every designed place is built or tracked | catches "design never built" / mislinked entrance |
| 17 | **no-overlapping-scenes** | scene bounds | DATA | an entrance lands you in the RIGHT area | catches overlapping far-band scenes (the thornwell→stonereach wrong-entry bug) |
| 18 | **rendered-vs-built** | board vs overworld entrances | DATA | the player SEES one world, not a stale board + new entrances | catches the not-removed-old-presentation class; the M-map pins from the same live entrance data |
| 19 | **seamless-overworld** | town enter-doors | DATA (tracking) | towns are walk-through terrain, not enter-scenes | tracking + regression-guard (Van option B); target 0 enter-doors |
| 20 | **no-floating-doors (NEW)** | door marker / building-adjacency | DATA | ZERO free-standing doors on open terrain | catches Van's floating-door class; a door must be a building-entrance or a marker |
**Full per-gate audit (runtime/data, hard-fail/tracking, what to strengthen) lives in `GATE-AUDIT.md`.**

**Strengthened this pass:** added the **designed-vs-built** gate (#16); the **containment gate** now also
asserts the dash-clamp inputs (sealed walls + interior flag + bounds) — added in the door/void bugfix.
**Still uncatchable by automation (eyes-on-only, now DoD-mandatory):** sprite/visual correctness, real
dash physics, exploit-economy loops, feel. These are why HARD RULE 9 is non-negotiable.

## THE STANDING CROSS-CHECK (every region, before "done")
A region is verified **against the other factors**, not alone (EXCELLENCE-FRAMEWORK §4):
- **Quests × map:** every quest homed here is reachable in valid gated order (no-soft-locks + a real walk).
- **Assets × content:** every placed key has art (prop-key-integrity) AND reads right (eyes-on).
- **Audio × region:** the region's music + ambient play (eyes-on/ears-on), not just registered.
- **Enemies × difficulty:** the placed tier matches the curve (t1→t5) for its position.
- **Cohesion × neighbours:** terrain/seam/elevation/music transitions to adjacent regions hold (eyes-on).
- **Designed × built:** the region sits at its locked-map position with its planned identity (gate #16 + M-map).
Only when all are true **and eyes-on-verified** is the region "done" (see `DONE-DEFINITION`).
