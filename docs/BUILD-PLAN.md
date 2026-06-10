# BUILD PLAN — the unified, solidified plan (Van's map locked → cross-checked → ordered build)

> **The plan we ACTION.** Van's edited map (`docs/world-map-vanedit.json`) is locked as truth
> (`MASTER-WORLD-SPEC §0.5`). This reconciles **every aspect** to it (quests/story/NPCs/cameos/enemies/
> assets/audio), assigns **traversal-gating from the DAG** (no soft-locks, progressive opening), confirms
> **per-settlement music + terrain + elevation**, and produces the **ordered region-by-region build plan
> + milestones + the tiny per-region asset-gaps**. Design/reconcile only — no world building here.

## 1. TRAVERSAL-GATING (the DAG order, reconciled with Van's edited paths) — NO soft-locks
**Tool order (gating.js):** start-kit (walk · cut · dash) → **lantern** (Shrine) → **grapple** (Keep) →
**hookshot** (Vault) → **firefrost** (Ember Hollow) → the **spells** (fire/ice/wind/electric, earned
alongside, open SECONDARY routes). Each place's **primary** route uses a tool earned *earlier* → acyclic.
| Link | Traversal (Van-locked where edited) | Stage / gate | Soft-lock? |
|---|---|---|---|
| GH ↔ Mirefen | **walk** — wide winding road (w3, 5 bends) | EARLY · open | ✅ no |
| GH ↔ Boarded Cave | **lantern** | EARLY · 🔒lantern | ✅ |
| Mirefen ↔ Sunken Shrine | walk → **lantern** inside | EARLY · story M8 | ✅ |
| GH ↔ Stonereach (Foothill) | **walk** | EARLY-MID · 🔒shard_1 + M10 | ✅ |
| Stonereach ↔ Cinder Keep / High Pass | **grapple** | MID · 🔒grapple | ✅ |
| GH ↔ Saltbreak (gorge) | **grapple** (+ a bend) | MID · 🔒grapple | ✅ |
| Saltbreak ↔ Drowned Vault | **hookshot** | MID · 🔒hookshot | ✅ |
| GH ↔ Caught Settlement | **hookshot** | MID · 🔒hookshot | ✅ |
| Stonereach ↔ Cragfoot · Saltbreak ↔ Cribbins · Caught ↔ Weeping | **walk** | MID · open spurs | ✅ |
| Caught ↔ Ember Hollow | walk → **🔥 fire-melt** | MID · story M15 | ✅ |
| Stonereach ↔ Oracle Capital ↔ Spire | **firefrost + 4 shards** | LATE · the finale gate | ✅ |
| **Mirefen ↔ Fenwick** (Van) | **⚡ electric** | LATE · electric spell | 🟠 *Fenwick now late-only (side)* |
| **Saltbreak ↔ Lighthouse** (Van) | **🌀 wind** | LATE · wind spell | 🟠 *Lighthouse/ST3 now late (side)* |
| **Shrine ↔ Cragfoot** + **Cragfoot ↔ GH** (Van, NEW) | **🔥 fire / firefrost** | LATE · a 2nd GH↔Marsh loop | ✅ (Cragfoot also walk-reachable via Stonereach) |
| **Thornwell ↔ Dustreach** (Van) | **❄ ice** | LATE · expansion | ✅ (defer) |
| GH↔Stonereach ⚡N-gate · GH↔Saltbreak ❄river · Saltbreak↔Thornwell 🌀/cut · Saltbreak↔Caught 🪵bridge | spells/story | LATE · 2nd routes | ✅ |
**Result:** the critical spine (GH→Marsh→Peaks→Coast→Emberwood→Spire) is the same acyclic key-before-lock
DAG (verify's no-soft-locks gate). Van's spell-routes are **additive shortcuts/spurs** → no soft-lock.
**The two flags** (Fenwick ⚡-only, Lighthouse 🌀-only) shift *side* content later — Van's call to keep
or add an early walk-spur.

### 1b. ABILITY-COVERAGE 🔒 — VAN'S RULE: every traversal ability is REQUIRED ≥1 place (no decorative)
Locked in `gating.js` + enforced by the new verify **ability-coverage** gate (every ability gates ≥1, or
verify fails → can't regress). The 4 TOOLS gate the critical spine; the non-tool abilities gate
**optional secrets/spurs** (additive → no soft-lock). *Added this pass: cut · dash · fire · bomb (the 4
that gated nothing).*
| Ability | Required where (the key to a place reachable no other way) | M-stage |
|---|---|---|
| **walk** | the start + GH↔Mirefen (the default — every region) | M1 |
| **lantern** | the Boarded Cave (M4) + the Sunken Shrine puzzle | M1 |
| **dash** ➕ | Marsh — the **broken boardwalk gap** → a reed-islet cache | M1 |
| **cut** ➕ | Greenhollow — the **orchard bramble corner** → a cache | M1 |
| **electric** | Marsh — **Mirefen→Fenwick** (the ONLY route, Van) | M1 |
| **bomb** ➕ | Sunken Shrine — a **cracked crypt wall** → the drowned-lord's vault (SA3) | M1 |
| **grapple** | Tidewreck Coast gate + Cinder Keep + High Pass | M2 |
| **hookshot** | Emberwood gate + the Belt pond-island (PH5) + tide-caves | M2 |
| **fire** ➕ | Sundered Peaks — a **frozen alcove** (fire-melt) → the sky-iron cache | M2 |
| **wind** | Coast — **Saltbreak→Lighthouse** (the ONLY route, Van) | M2 |
| **firefrost** | the Hollow Spire ascent gate (+ shards) | M2 |
| **ice** | Desert — **Thornwell→Dustreach** ice-bridge (the ONLY route, Van) | M3 |
**Every ability gates ≥1 ✅** (verify-enforced). 4 of the added gates (dash/cut/bomb in M1, + electric
already) land in **Milestone 1** → built alongside the Marsh/Shrine.

## 2. SETTLEMENT IDENTITY — music + terrain + elevation (Van's rule: each gets all three)
| Settlement | Tier | Music | Terrain | Elev | Audio HAVE/GAP |
|---|---|---|---|---|---|
| **Greenhollow** | town | `mus_green` | grass/vale | +1 | ✅ HAVE |
| **Mirefen** | town | `marsh-dread` | bog | −1 | 🔴 GAP (bed) |
| **Stonereach** | city | cold-stone (`mus_peaks`) | stone/snow | +2 | ✅ HAVE |
| **Saltbreak** | city | `storm-surf` | coast/sand | 0 | 🔴 GAP |
| **Oracle Capital** | city | `sacral` | sacral-stone | +2 | 🔴 GAP |
| **Caught Settlement** | town | fire-frost tension | split lava/ice | 0 | 🔴 GAP |
| **The Hollow Spire** | dungeon | `sacral` | spire-stone | +3 | 🔴 GAP (shares sacral) |
| **The Lost Cemetery** (NEW) | village | eerie/somber | graveyard-on-stone | +1 | 🔴 GAP |
| **Fenwick · Cribbins · Cragfoot** | village | (reuse region bed: marsh/coast/peaks) | bog/coast/stone | −1/0/+1 | ✅ reuse |
| **Thornwell · Dustreach** (exp) | village | forest-calm / desert-sparse | forest / desert | +1/0 | 🟠 GAP (defer) |
**Music to SOURCE (the tiny list):** `marsh-dread · storm-surf · sacral · fire-frost · dungeon-tension ·
cemetery-eerie` (~6 CC0 beds — from Van's `28…RPG Music.zip`, read its readme). **HAVE:** `mus_green`,
`mus_peaks`; villages reuse their region's bed. Every settlement has terrain + elevation assigned ✅.

## 3. CROSS-CHECK MATRIX (every aspect × the locked map) — fits / flag
| Aspect | Greenhollow | Marsh (Mirefen/Shrine/Fenwick/Cemetery) | Peaks (Stonereach/Keep/Cragfoot/HighPass) | Coast (Saltbreak/Vault/Cribbins/Lighthouse) | Emberwood (Caught/Hollow/Weeping) | Spire (Capital/Spire) | Forest/Desert (exp) |
|---|---|---|---|---|---|---|---|
| **Quests** | M1-7·SG1-7 ✅ | M8-10·SA1-5·PH5·NIGHT1 + Cemetery vignette ✅ | M11-12·SP1-5·PH1·CAM1/3 ✅ | M13-14·ST1-5/8·PH2·EDG1/2 (ST3 late 🟠) | M15-16·SE1-5·PH4·CAM6 ✅ | M17-20 ✅ | exp side 🟠 |
| **Story beats / pacing** | warmth→catastrophe→return ✅ | first truth (Hagga) + dread ✅ | the Order's lie ✅ | betrayal/coast ✅ | the god's fever + mercy ✅ | revelation + the 5 endings ✅ | epilogue depth 🟠 |
| **NPCs / standouts / jandal-cop / raids** | cast + **Wiremu** (CAM7) ✅ | Yssa/Hagga/Karl/Vell ✅ | Mike Hunt/Pellamy/Stonewright ✅ | Hugh Jass/Harbourmaster/Petibon + **raids** EDG1 ✅ | Settler/Ash/Vinizar ✅ | Sela ✅ | gunhand/ninja-gran/Wanderer ✅ |
| **Cameos/gags/philosophy/easter-eggs** | CAM2·CAM7·GAG1·PH3/6 ✅ | CAM4·PH5·NIGHT1 ✅ | CAM1·CAM3·PH1 ✅ | PH2·EDG1/2 ✅ | CAM6·PH4 ✅ | (M18 chicken) ✅ | CAM5 Wanderer ✅ |
| **Enemies / PLACED difficulty** | tutorial/safe-hub | **t1** drowned/bog (slime/snake/ghost + LPC) | **t2** crag/sentinel (skeleton/orc + reskin) | **t3** tideward/wraith (humanoid boss) | **t4** ember/frost (humanoid boss) | **t5** Warden (fused-guardian humanoid) | mid-tier infill |
| **Assets (HAVE/forge/GAP)** | ✅ furnished (built) | bog terrain ✅ + Cemetery (medieval-deco/statues) ✅; the **Frog 🔴** | stone+victorian+blacksmith ✅ | coast+victorian+lighthouse ✅; ship/wreck improvised 🟡 | lava+ice tiles ✅; split-VFX defer 🟠 | colonial/desert-ruins/cavern+altar ✅; god-VFX defer 🟠 | adobe/desert-ruins/forest ✅ |
| **Audio (music/ambient)** | mus_green+birds ✅ | marsh-dread 🔴 + dungeon-tension 🔴 | mus_peaks+wind ✅ | storm-surf 🔴 | fire-frost 🔴 | sacral 🔴 | calm/sparse 🟠 |
| **Door-knock / morality entrance** (Van's idea) | — a **build-phase FEEL-LAYER** (see §5): walking into a home/shop reacts to your morality (a wary/warm greeting, locked doors for the cruel) — wire after the walk-in transitions, region-agnostic | | | | | | |
**Reads:** every quest/cameo/NPC/standout is **homed + reachable in valid order** ✅; the **placed
difficulty curve t1→t5 maps to the geography** ✅; combat/skills/spell-routes fit ✅; **the only GAPs are
the 6 music beds + the Frog/hen sprite + a few deferred bespoke VFX** — all small, all flagged.

## 4. ORDERED BUILD PLAN — region by region (5h core → replicate → expand)
Each region built to the **EXCELLENCE region-DoD** on the **proven pipeline** (terrain atlas → buildings
→ interiorRegion-furnished → forge NPCs → quests → placed enemies → audio → navGate + eyes-on).

### MILESTONE 1 — the SHIPPABLE 5h CORE
1. **Greenhollow** — ✅ *built* (furnished interiors, walk-in transitions, 14 NPCs). **Polish:** wire the
   Victorian/Colonial buildings into the composition, a doorway sprite, the **hen** (chicken callback).
   *Gap to grab:* a hen sprite.
2. **Ashen Marsh + Mirefen + Fenwick + the Lost Cemetery** — bog terrain (tint+water+reeds+dark-forest
   zone) · Mirefen (eliza huts, Yssa/Hagga/Vell) · the **Cemetery** (medieval-deco grave-markers +
   statues, a night/grief vignette) · Fenwick (⚡-late spur). NPCs (forge) · M8/M10/SA1-5/PH5/NIGHT1 ·
   **t1 enemies** (slime/snake/ghost as bog-folk/drowned) · **the Frog** (SA4). *Gaps: `marsh-dread` bed
   + a **frog** sprite.*
3. **The Sunken Shrine** (⇲ dungeon, now N at chunk 5.5,10) — lpc-dungeon + cavern-ruins tiles · the
   lantern light-puzzle · the **Drowned Guardian** (humanoid boss) · shard 1 · crypts (SA3). *Gap:
   `dungeon-tension` bed.*
   *(+ the M1 ABILITY-GATE secrets — §1b: **cut** the GH orchard brambles · **dash** the Marsh boardwalk
   gap · **bomb** the Shrine's cracked crypt wall (SA3) · **electric** the Mirefen→Fenwick switch — all
   optional caches/spurs, no soft-lock.)*
   → **MILESTONE 1 = the 5h game shippable** (M1→M10 + the Marsh, on current assets + ~3 tiny grabs).

### MILESTONE 2 — replicate the regions (the full spine)
4. **Sundered Peaks** — Stonereach city (Victorian + blacksmith mine + Order seat) · Cragfoot · High Pass
   · **Cinder Keep** (grapple, shard 2) · M11-12/SP1-5/PH1/CAM1/CAM3 · **t2** · `mus_peaks`. *Gap: a
   crag-beast reskin (SP2, optional).*
5. **Tidewreck Coast** — Saltbreak city (Victorian harbour + underworld + mansion) · Cribbins · Lighthouse
   (🌀-late) · **Drowned Vault** (hookshot, shard 3) · M13-14/ST1-5/8/PH2/EDG1-2 · **t3** · *Gaps:
   `storm-surf` bed; ship/wreck improvised.*
6. **Emberwood** — Caught Settlement (split burnt/frozen via lava+ice tiles) · Weeping Tree · **Ember
   Hollow** (firefrost, shard 4) · M15-16/SE1-5/PH4/CAM6 · **t4** · *Gaps: `fire-frost` bed; split-VFX
   deferred.*
7. **Spire** — Oracle Capital (Colonial church + Desert-Ruins temple + statues = temple-city) · **the
   Hollow Spire** (the ascent gauntlet + Binding Chamber, **the Warden** humanoid boss, shard 5, M18-20,
   the 5 endings) · `sacral` · *Gap: `sacral` bed; god-reveal VFX deferred.*
   → **MILESTONE 2 = the full critical-path game** (all 6 regions, the 5 endings).

### MILESTONE 3 — expansion + the spell-route web
8. **Forest (Thornwell) + Desert (Dustreach/Oasis/Nomad/Sunken-Temple)** — adobe/desert-ruins/forest
   assets · the spell-route shortcuts (electric/ice/wind/fire/firefrost per §1) open the **interconnected
   web** + the late spurs (Fenwick/Lighthouse). exp side-content + CAM5 the Wanderer.
   → **MILESTONE 3 = the full 30-40h interconnected world.**

## 4b. 🚩 MILESTONE GATE (planned, NOT now) — post-M1 TRIPLE-CHECK cohesiveness pass
**After Milestone 1 is BUILT** (2-3 real regions: Greenhollow + Ashen Marsh + the Sunken Shrine), run
the full **TRIPLE-CHECK cohesiveness + EXCELLENCE-build-plan pass against the BUILT game** — not paper.
*Paper cohesion is largely done (this spec + cross-check); REAL cohesion is judged on built regions:*
- play GH→Marsh→Shrine end-to-end; judge pacing/feel/difficulty/audio/transitions on the real build;
- re-run the EXCELLENCE region-DoD + the cross-check matrix against what's actually rendered;
- adversarially verify no soft-lock / no dead-end / the ability-gates actually pay off in play;
- only then lock Milestone 2's region build order. **Record: this gate must pass before M2 scales up.**

## 5. FEEL-LAYERS (build-phase, region-agnostic — after the regions)
- **Door-knock / morality entrance** (Van): walking into a home/shop reacts to your **Morality/Purity**
  — a warm vs wary greeting, the cruel find some doors barred. Wire onto the walk-in transition system
  (a hook in `_enterArea`); one system, every interior.
- **The alignment transformation** (aura→sprites), the elemental **spell puzzles**, the **safe-mode** —
  all designed; ride the region builds + this feel pass.

## ✅ SUMMARY
- **Van's map imported + LOCKED** (`world-map-vanedit.json` → `MASTER-WORLD-SPEC §0.5`): his positions,
  music zones, elevation, widths, the **Lost Cemetery**, and traversal edits are truth.
- **Traversal-gating assigned** from the DAG (no soft-locks; spell-routes additive); **2 flags** (Fenwick
  ⚡-only, Lighthouse 🌀-only side spurs).
- **Every settlement has music + terrain + elevation**; **6 music beds** to source (CC0, listed).
- **Cross-check: everything fits** — quests/story/NPCs/cameos/enemies/assets/audio homed + reachable;
  the only GAPs are the 6 beds + a frog/hen sprite + a few deferred bespoke VFX.
- **Ordered build plan + milestones:** M1 the shippable **5h core** (GH→Marsh→Shrine) → M2 replicate the
  6-region spine → M3 the expansion + spell-route web. Region checklists + per-region tiny gaps above.
- **NEXT (action it):** build **Milestone 1 step 2-3** (Ashen Marsh + Mirefen + the Sunken Shrine) on the
  proven pipeline — grab the `marsh-dread` bed + a **frog** sprite first.
