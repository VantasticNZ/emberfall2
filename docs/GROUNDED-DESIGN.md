# GROUNDED DESIGN — story/areas/quests reconciled against the ACTUAL asset library

> **Let what we HAVE shape what we build.** Design/audit only (no building), run **after the asset
> intake** so it works on the real post-intake library. **Principle:** assets constrain the world's
> scope + look; the **story adapts but keeps its soul** — edit/re-place beats cut; protect the heart
> (the morality system, the 5 endings, the Frog good-monster, Wiremu the jandal-cop, Hagga, the chicken
> callback, the core arc). Reconciles `MASTER-WORLD-SPEC` + the quest data + `ASSET-INTAKE`/`ASSET-LEDGER`.

## 1. ASSET-REALITY SURVEY — what we can RENDER WELL right now (post-intake)
| Class | HAVE (renders well) | Weak / GAP |
|---|---|---|
| **Terrain** | grass/vale, **stone/mountain + snow/ice** (eliza), **sand/desert · water/coast · lava · dirt** (terrain-v7 atlas), **cave/crypt** (lpc-dungeon + cavern-ruins), plants/flowers/trees/cliffs/waterfall | dedicated **swamp/bog** (use water+plants+tint 🟡); a unique **fire/frost split** ground 🟡 |
| **Buildings** | **village** (eliza), **CITY mansions/shops** (lpc-victorian), **civic + a church** (lpc-colonial), **desert/adobe** + **temple/ruins** (adobe + desert-ruins), **forge** (lpc-blacksmith), stone home | **stilt-hut** bog set (re-theme with eliza 🟡); ships/docks (improvise from bridges/piers 🟡) |
| **Props / furniture** | full interiors — beds/tables/chairs/dressers/shelf/**anvil+forge**/fireplace/rugs/lamps/crates/barrels/cauldron (eliza-objects) + **altar · statues · fountains** (statues-fountains, cavern obelisk/monk-statue/shrine) + signs/banners (medieval-deco) + dungeon dressing | — (essentially complete) |
| **Characters / NPCs** | **any humanoid** via the LPC modular generator (bodies/clothes/hair × dirs × anims × colours); standouts via recolour/overlay | — |
| **Enemies** | humanoid foes via LPC **skeleton + orc** bodies (+ bandit/cultist recolours); generic monsters **slime · snake · bat · big_worm · eyeball · ghost · man_eater_flower · pumpking** (8 shipped) | 🔴 **the Frog** (SA4), **drowned-folk**, **crag-beast**, **fire/frost elementals**, the **named bosses** = no dedicated sprite (re-skin or source) |
| **Audio** | SFX (kenney CC0) + music beds **green (GH)** + **peaks** | 🔴 **marsh · coast · emberwood · spire** music beds |

**Net:** worlds, towns, interiors, NPCs, and dungeons are **well-supported**; the real constraints are
**enemy/boss variety + region music**, not environments.

## 2. AREA RECONCILIATION (KEEP / TRIM / RE-THEME / DEFER)
| Area (spec theme) | Asset basis | Decision |
|---|---|---|
| **Greenhollow** (pastoral vale) | grass + eliza village + interiors + LPC cast + mus_green | **KEEP — FULLY-SUPPORTED** (the showcase) |
| **Sundered Peaks / Stonereach** (cold stone city) | eliza cliffs + snow + **lpc-victorian** city + **blacksmith** mine + mus_peaks | **KEEP — FULLY-SUPPORTED** (city now buildable) |
| **Ashen Marsh / Mirefen** (bog) | terrain water+plants+**bog-tint** + eliza huts (re-themed) + statues for the shrine | **KEEP / RE-THEME** — bog as tinted-grass + water + reeds; Mirefen = eliza huts on dark ground (no stilt set). Music GAP. |
| **Tidewreck Coast / Saltbreak** (storm harbour city) | terrain water + **sand/beach** + **lpc-victorian** harbour-city + eliza piers/bridges + **lighthouse** (build from tower tiles) | **KEEP / TRIM** — harbour city ✅; ships/wrecks improvised from ruins-debris. Music GAP. |
| **Sunken Shrine · Cinder Keep · Drowned Vault** (dungeons) | **lpc-dungeon** + **cavern-ruins** (crypt/cave + altar) | **KEEP — SUPPORTED** (real dungeon tiles now) |
| **Oracle Capital** (sacral civic) | **lpc-colonial church** + **desert-ruins temple** + **statues/fountains/altar** | **KEEP / RE-THEME** as a temple-city (no bespoke "oracle" set) |
| **Hollow Spire** (the ascent + binding chamber) | cavern-ruins + dungeon + altar/obelisk/monk-statue as the binding-stand-in | **KEEP-arc / DEFER bespoke art** — build the ascent/chamber from cavern+altar; the *unique god-reveal* art is a later polish |
| **Emberwood / Ember Hollow** (fire-vs-frost split) | lava (atlas) + winter/ice (eliza) split across a wood | **TRIM / RE-THEME** — a **burnt-vs-frozen forest** (lava ground east, snow/ice west) using existing tiles; defer bespoke "Feverheart fever" VFX |
| **Forest / Desert** (expansion) | adobe + desert-ruins + jungle/conifers/trees (staged) | **DEFER** (post-core; assets exist, scope later) |
**No area is CUT** — every region has a renderable basis (re-themed where a bespoke set is missing).

## 3. QUEST RECONCILIATION (KEEP / EDIT / RE-PLACE / CUT) — the at-risk + the heart
The bulk (M1–M10 childhood→Marsh, the GH sides, the town/dialogue quests) are **KEEP** — they happen in
fully-supported settlements with available NPCs/props. Listed here are the ones that touch a gap:
| Quest | Issue | Decision |
|---|---|---|
| **M1–M10** (the 5h core arc) | all supported | **KEEP** (buildable now) |
| **SA4 The Frog** (good-monster, signature) | no frog sprite | **KEEP / EDIT** — re-skin (a big creature) or **source a frog** (top of the shopping list — protects the heart) |
| **M9/M12/M14/M16/M19 bosses** (Guardian/Sentinel/Tideward/Feverheart/Warden) | no bespoke boss sprites | **KEEP / EDIT** — re-skin LPC humanoids (skeleton/orc + equipment) or scaled monsters for now; bespoke boss art = a later pass |
| **CAM7 Wiremu** (jandal-cop) | needs the constable | **KEEP** — LPC NPC recolour (uniform); the heart beat stays |
| **The kicked chicken** (M2/M18 callback) | needs a chicken/hen sprite | **KEEP / EDIT** — a small bird sprite (cheap to source/recolour); a signature beat — protect it |
| **CAM5 The Wanderer** (anachronistic "glowing slab") | no modern prop | **KEEP / EDIT** — improvise the slab (a tiny lit prop) or play it in dialogue; the off-theme **police/cars** PNGs in Downloads are **NOT used** (UNKNOWN licence + off-theme) |
| **EDG1 Midnight Raid** (clothesline bloomers) | no laundry props | **KEEP / EDIT** — improvise from fences + cloth/banner props |
| **ST4 Wreck Wraith / the wrecks** (Coast) | no ship sprites | **KEEP / RE-PLACE** — wrecks as ruined hulls (cavern/desert-ruins debris + water) |
| **SE2 The Caught Settlement** (fire/frost split) | bespoke split look | **KEEP / RE-THEME** — burnt-vs-frozen halves from lava + ice tiles |
| Expansion side-content (Forest/Desert villages) | supported but late | **DEFER** with the expansion |
**CUT: none required.** Every heart-beat is **kept or edited/re-placed**; only *bespoke art polish*
(unique boss/god VFX) is deferred, never the beat itself.

## 4. THE GROUNDED, BUILDABLE DESIGN + SCOPE
- **Build order, grounded:** the **5-hour core** (Greenhollow town → Ashen Marsh + Sunken Shrine →
  Hagga's truth) is **FULLY buildable now** — every terrain/building/prop/NPC/dungeon-tile exists; the
  only edits are **enemy re-skins** (skeleton/orc/monsters as bog-folk/drowned) + a **frog** + the
  **marsh music bed**.
- **Full game:** all 6 regions + 3 cities + dungeons are **environment-supported** (terrain + the new
  building sets + cavern/dungeon tiles + altar/statues). Remaining art is **narrow**: enemy/boss
  variety + 4 region music beds + a few bespoke set-pieces (deferred).
- **Grounded hours:** the buildable scope still lands the **30–40h** target (the content is unchanged;
  re-themes don't cut quests). The 5h slice is **shippable on current assets** (+ the 3-item shopping
  list below). The bespoke-art deferrals are *polish*, not scope cuts.

## 5. TARGETED GAP SHOPPING-LIST (source these FEW → unlock the most kept content)
1. 🔴 **Confirm `lpc-monsters.zip` licence** (it's staged-UNKNOWN, no in-pack credit). If clean →
   **the single biggest unlock**: a real monster roster (drowned/crag/elemental analogues + boss-able
   creatures) for the whole difficulty curve, removing most enemy re-skins.
2. 🔴 **4 region MUSIC beds** (marsh-dread · coast-storm · ember-tension · spire-sacral) — CC0 on OGA
   (the "RPG music" packs Van already has, e.g. `28 High Quality 16-bit RPG Music.zip` — **read its
   readme licence first**). Unlocks the audio DoD for 4 regions in one go.
3. 🟠 **A FROG sprite** (SA4 the good-monster) + **a hen/chicken** (the signature callback) — tiny,
   high-soul-value; recolour/source.
4. 🟡 (optional) a **fish-folk / drowned** set (Marsh) + a **ship/wreck** (Coast) — re-skinnable, lower
   priority; only if the lpc-monsters set doesn't cover them.

## ✅ SUMMARY
- **Render-well now:** vale/stone/desert/snow/lava/coast terrain · village + **city** + **church** +
  **adobe** + **forge** buildings · full interiors + **altar/statues** · **any LPC NPC** · crypt/cavern
  dungeons · GH/Peaks music. **Constraints:** enemy/boss variety + region music.
- **Areas:** all 6 regions **KEEP** (Marsh/Capital/Emberwood **RE-THEME** to renderable looks; Spire
  binding-art + the Forest/Desert expansion **DEFER**) — **none cut**.
- **Quests:** the core + heart-beats all **KEEP/EDIT/RE-PLACE** (the Frog, the bosses, the chicken,
  Wiremu, the wrecks re-placed); **CUT: none**; only bespoke art deferred.
- **Scope:** the **5h core is buildable on current assets** + a 3-item shopping list; the full 30–40h
  stays intact (re-themes, not cuts).
- **Shopping list (highest leverage):** confirm **lpc-monsters licence** → 4 **region music beds** →
  a **frog + hen** sprite. Source these few and ~all kept content is unblocked.
