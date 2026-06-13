# GAME-5HR-SCOPE — the shippable ~5-hour game (a complete, polished slice of the full vision)

> **Design/plan.** A **finished, whole ~5-hour game** carved from the 54-node full world
> (`WORLD-GRAPH.md`) — a real beginning-middle-**end**, not a fragment. It is the **foundation the full
> 30h game grows from** (same systems, same world, same code — the later regions bolt straight on), not
> a throwaway. Sized from the quest data (M1–M10) + `WORLD-SCALE-DOD` + `MECHANICS`/`ALIGNMENT`/`NPC`.
> Built with the proven pipeline (nav-first · `tiledToRegion` · `navGates` · interaction-classes ·
> autotiler) + the new tooling in `BUILD-TOOLING.md`.

## 0. THE PITCH (what the 5h game IS)
**A wholesome village childhood that curdles into the first terrible truth.** You grow up in
Greenhollow, you make three small choices that the world remembers, the Hearthflame Festival turns
wrong, and **the night it burns Bram dies and you learn the flame is *alive*.** Ten winters on you
return — grown, armed — and the road west into the **Ashen Marsh** gives up the first secret: the
Hearthflame is a **bound, screaming god**, and the oracles knew. You take the **lantern** and the
**first shard** from the drowned shrine, and you choose what to do with Hagga's truth. **A complete
first act + first region — and a hook north into the long dark.**

This is the **Act 1 → first-shard** arc of the full game, resolved on a real choice. It's a satisfying
**chapter** — the epic continues, but *this* ends.

## 1. THE NARRATIVE ARC (M1–M10 — a complete beginning-middle-end)
| Beat | Mission | ~Time |
|---|---|---|
| **Beginning (childhood, wholesome → dread)** | M1 morning · M2 the chicken (seeded choice) · M3 the coin · M4 the boarded cave · M5 the festival turns wrong | ~50 min |
| **The catastrophe** | **M6 The Night It Burned** — the flame erupts, Bram dies, the vow (vengeance/protection) | ~15 min |
| **The return (middle)** | **M7 Ten Winters Gone** — adult Greenhollow, deed-reactive welcome, earn the wooden sword, accept the charge | ~40 min |
| **The first region** | M8 Into the Ashen Marsh (Mirefen, Yssa, kind/cruel to bog-folk) | ~35 min |
| **The dungeon** | **M9 The Sunken Shrine** — earn the LANTERN, the Drowned Guardian boss, **SHARD 1** | ~60 min |
| **The truth + the END** | **M10 Hagga's Truth** — the flame is a bound god; the **permanent CHOICE** (believe / report / stay silent) → the slice's resolution + the hook north | ~30 min |
**Core arc ≈ 3h 50m** + side content/exploration (§4) → **~5h.** A real emotional arc (warmth →
catastrophe → mystery → revelation → allegiance) with a definite ending beat.

## 2. WHAT'S IN (the complete slice)

### Regions / world (3 of the 54 nodes' regions)
- **Greenhollow** — grown into a **real small town**: plaza, districts, ~6–8 **enterable interiors**
  (the Copper Tankard +upstairs, Pem's Store, the Forge, the Chapel, 2–3 homes, the Manor exterior).
  The proven core + the showcase of finished quality.
- **West Belt** — the channelled connector GH↔Marsh (already built).
- **Ashen Marsh** — **Mirefen** (bog hut-village, ~5 NPCs), Hagga's hut across the black water, the
  bog proper with placed encounters + secrets.

### Dungeons (3)
- **The Sunken Shrine** (M9) — the **main dungeon**: multi-room, the lantern light-puzzle, the enemy
  ecology, the **Drowned Guardian** boss (lantern-trick), shard 1. *Hand-crafted key rooms + procedural
  fill (BUILD-TOOLING).*
- **The Boarded Cave** (M4) — a small childhood cave interior (the weeping-flame carving). *Procedural
  cave + hand-crafted carving room.*
- **The Drowned Crypts** (SA3) — a small optional lantern-gated loot cave. *Procedural + scatter.*

### Quests (~M1–M10 + ~8–10 sides) — the curated set that fits 5h
- **Main:** M1–M10 (the full arc above).
- **Greenhollow sides:** SG1 Fazy Lastard's Mug (the see-markers skill) · SG3 Hodge's Apprentice (forge/gear)
  · SG5 the Tankard Songs · SG7 the Orchard Thief (deed-locked by the chicken).
- **Marsh sides:** SA1 Bog-Folk Troubles · SA3 The Sunken Dead (lantern-loot) · **SA4 The Frog** (the
  puzzle-not-fight good-monster beat).
- **Cameos (a taste):** CAM2 Sisyphus Hill · **CAM7 Constable Wiremu "blow on the pie"** (the gentle
  jandal-cop taste) · CAM4 Old Karl (night star-gazer).
- *(The PEM clue-hunt SG2 is seeded here — 1 of its 4 marks in the Marsh — but pays off in the full game.)*

### NPCs (~13)
GH: Mara · Bram · Hodge · Tam · Phil McCracken · Fazy Lastard · Pem · **Wiremu** (the constable). Marsh:
Elder Yssa · Hagga · Old Karl. + Sela (the oracle, in dialogue). With NPC-WORLD reaction types
(coward/defender), the **safe-mode non-lethal** default, and a couple of disposition reactions.

### Systems live (a taste of the full design — enough to feel the direction)
- **Mechanics:** movement + swept-dash · combat (the Marsh archetypes + the Drowned Guardian boss,
  placed-difficulty) · interaction-classes (cut/push/search) · the lantern **tool-gate + one puzzle** ·
  the bounded gear economy (wooden→steel sword, leather, potions; the GH shops reachable at Act 2) ·
  save/permanence · **hearts** (1–2 heart-pieces found).
- **Alignment (the soul, a real taste):** the **Morality + Purity HUD live**; the seeded childhood
  choices + M6 vow + M8 marsh-kindness + the **M10 permanent choice** drive it; the **aura-tint
  transformation fallback** at the tier boundaries (a kind hero glows warm); NPC reactions + prices
  read off it; the **good-monster** beat (the Frog). *The full angel/devil sprites + law-escalation +
  the other standouts are deferred.*
- **Audio:** GH pastoral bed + Marsh dread bed + the action SFX (already imported), per the mood table.

## 3. WHAT'S DEFERRED (to the full 30h game — bolts onto this foundation)
- **M11–M20** + the other 4 regions (Peaks · Coast · Emberwood · Spire) + the full god-binding finale +
  the **5-ending system** (the 5h slice ends on the M10 choice, not the M20 finale).
- The **3 huge cities** (Saltbreak/Stonereach/Oracle Capital) + the **new biomes** (Forest/Desert/river).
- The **elemental magic spells** (fire/ice/electric/wind) — the 5h slice uses the *lantern tool* only.
- The **full alignment transformation sprites** (wings/halo/horns/tail) + the **law-escalation** + the
  **other standouts** (gunhand/ninja-gran/the taonga Law-Enforcer).
- Most side quests/cameos/philosophy beats (SP/ST/SE, PH1–6 beyond a taste).

## 4. HOURS ESTIMATE
| Block | Hours |
|---|---|
| Main arc M1–M10 | ~3.8 |
| GH + Marsh exploration (interiors, secrets, the town) | ~0.6 |
| ~8–10 side quests + 2 small dungeons + cameos | ~0.6 |
| Combat encounters + the boss + the puzzle | (within the above) |
**Total ≈ 5h** for a focused player; ~6–7h for a completionist. **Replay value:** the M10 choice +
the seeded childhood deeds + the morality arc give a meaningfully different second run.

## 5. IT'S A FOUNDATION, NOT A THROWAWAY
Everything here is the **literal first sixth of the full game on the final systems + world**: the
interior system, the room-templates + generators, the town, the dungeon pipeline, combat, alignment,
the economy, save — all reused. **The full game grows by adding the next regions/dungeons/quests onto
this exact base** (the greybox skeleton already proves the whole world connects). The 5h ending is
written as a *chapter close with a hook* so it stands alone now **and** continues seamlessly later.

## 6. THE 5H DEFINITION-OF-DONE (ship gate)
- [ ] M1–M10 playable start→the M10 choice, with a satisfying resolution beat + the hook.
- [ ] Greenhollow a real town with ≥6 enterable interiors; Mirefen a real hut-village.
- [ ] The Sunken Shrine + 2 small dungeons, all **navGate-validated** (body-walk + no-prop-on-walkable).
- [ ] ~8–10 sides + the curated cameos placed + reachable.
- [ ] Combat feel + the Drowned Guardian boss (lantern-trick) designed (not just functional).
- [ ] Morality/Purity HUD live + the aura-transformation taste + the good-monster beat + safe-mode.
- [ ] Audio beds + SFX per region; the EXCELLENCE region-DoD met on GH + Marsh (the eye gate).
- [ ] Tools/assets all licence-clean to the lock; 0 console errors; all verify gates GREEN.
- [ ] **Human eye: "this is a finished, beautiful ~5h game — and I want the rest."**

## ✅ SUMMARY
- **The 5h game = Act 1 (Greenhollow childhood + the burning) → the return → the Ashen Marsh + the
  Sunken Shrine → Hagga's truth + the first permanent choice.** 3 regions, 1 real town + 1 hut-village,
  3 dungeons, ~M1–M10 + ~8–10 sides + a few cameos, the lantern, ~13 NPCs, the morality arc + a taste of
  alignment/magic/standouts, ~5h, a real ending. **Whole now, expandable to the full 30h.**
- **Build it** via the interior system + the procedural/template tooling (`BUILD-TOOLING.md`).
