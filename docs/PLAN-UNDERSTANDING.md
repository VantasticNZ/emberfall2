# PLAN-UNDERSTANDING

## 🔒 LOCKED 2026-06-10 — Van's FIRM decision: OPTION B (seamless). Restated + confirmed:
**ONE seamless continuous overworld.** The player walks the ENTIRE world continuously, exactly matching
Van's edited map (`world-map-vanedit.json`, → `emberfall-2_world.json` when he saves it). **Settlements
(towns/villages/cities) ARE overworld terrain** — you walk **into and through their streets with NO
door / NO scene-transition**. **Separate scenes ONLY for: building interiors, dungeons, secrets.** The
previous **hybrid (towns as door-entered scenes) is REPLACED** — every settlement-enter door + the GH
fast-travel board is removed; the world is fully walkable. The M-map renders this one seamless world.
*This is my understanding and I am building to it. (Dungeons + house interiors + secrets stay enter-scenes
— Van confirmed only those.)*

---

# PLAN-UNDERSTANDING — CC states the "one map" plan back for Van to confirm/correct

> **Read this and tell me "yes, that's what I mean" or correct it BEFORE I build more.** Per Van's
> standing instruction: stop building blind; confirm the design intent first. Two parts: (A) the
> explanation of why your screen contradicted my reports, and (B) my explicit statement of what "one
> connected map as you designed" means + the honest gap.

## A. WHY YOUR SCREEN CONTRADICTED THE REPORTS (same hash 1788edbb, different world)
**The data on 1788edbb is correct** — I verified it three ways: the GH region has **1** south board door
(`vil_oasis` only); the relocated settlements are at their map positions; the M-map pins from live data.
A **full page reload** (which my Playwright always does — `browser_navigate` recreates the scene) shows
this correct state.

**The most likely root cause of what YOU saw: a STALE running scene in your long-lived browser tab.**
- The build **stamp** is injected into the HTML *fresh on every request* (`vite.config.js`
  `transformIndexHtml`). So after a soft reload your stamp reads `1788edbb` even though…
- …**Vite HMR hot-swaps JS modules but CANNOT recreate a running Phaser scene.** Your scene was *built*
  from the OLD `worldmap.js` (the 11-door board) and the OLD M-map code (the text-list), and it keeps
  running that until the **scene is recreated**. Result: **new stamp, old world** — exactly your symptom.
- **Compounding it: the save.** The game **autoloads a save** on open (`save.load()`), restoring your
  **karma/inv/quests/time + last position** — so you respawn at your old south-meadow spot where the
  (stale) board was. *(The save does NOT store doors/regions — those are data — so the save is not the
  door cause, just the position that puts you where you notice.)*

**Your exact fix (do this, then re-judge):**
1. **Hard reload that recreates the scene:** Ctrl + Shift + R (or DevTools → right-click reload → "Empty
   Cache and Hard Reload"). 2. **If still stale:** close the tab, **restart `npm run dev`**, reopen — HMR
   can hold a stale scene across a long session. 3. **Clear the old save:** DevTools console →
   `localStorage.clear()` → reload (removes the auto-loaded old position). Then: bottom-left stamp =
   `1788edbb`, press **M** → settlement *pins* (not a text list), GH-south = one fast-travel door.

**A real secondary finding (true even on the correct build):** the relocated entrances are **freestanding
door-sprites on the overworld**. Greenhollow is the hub, adjacent to ~5 regions; the streamer loads them
together, so **many entrance-doors can render in view at once near GH** (I counted 15 across GH+Marsh+
Emberwood — all legit/unique, no board-row). So even fresh, the world is still **door-heavy near the hub**
— a presentation refinement (town-gate/arch sprite, or only-show-when-near), logged for later.

**Process gaps this exposes (recommendations, not built):** (a) the save has **no version/world-version
stamp**, so a structural change can't invalidate a stale-position save; (b) there's **no "New Game / Clear
Save"** UI; (c) a dev-only **"build changed — reload"** prompt (or an HMR hook that recreates the scene)
would stop a stale scene from ever masquerading as the new build. *These would have prevented this entire
confusion.*

## B. WHAT "ONE CONNECTED MAP AS DESIGNED" MEANS — and the honest gap
### What I understand you want (the target)
- **ONE walkable overworld** that contains **all settlements at their editor-map positions**
  (`world-map-vanedit.json`) — you walk across a single continuous world.
- Settlements **connected by walkable PATHS** with **real exploration room** between them, each path
  **gated by its traversal-means** (walk/cut/dash/grapple/hookshot/lantern/firefrost/electric/ice/wind/
  fire/bomb/bridge) so the world **opens progressively, no soft-locks**.
- **Per-place identity** on that one world: each region/settlement its own terrain + music + elevation.
- **Separate SCENES only for:** dungeons, secrets, and **building interiors** (you enter a house/shop
  door → an interior). **NOT** a start-village + a board of teleport-doors; **NOT** towns that only exist
  as separate door-scenes.

### What is actually BUILT today (honest)
It is a **HYBRID, not one seamless map:**
- ✅ The **8 overworld REGIONS** (Greenhollow, Marsh, Belt, Peaks, Foothill, Coast, Emberwood, Spire)
  **are one connected walkable world** — you walk between them (GH→west=Marsh, →north=Peaks, →east=Coast,
  →south=Emberwood), streamed by proximity, with per-region terrain/music. The **spine is traversal-gated**
  (lantern→grapple→hookshot→firefrost + shards), no soft-locks.
- 🟡 But **each SETTLEMENT (Mirefen, Stonereach, Saltbreak, Cribbins, Cragfoot, Thornwell, the dungeons)
  is a SEPARATE door-entered SCENE** living in a far-band corner of the world. You **walk the overworld
  to a DOOR placed at the town's map position, then ENTER** the town scene (JRPG town-enter-point style).
  So the towns are at the *right positions* and reached by *walking*, but they are **not part of the
  seamless overworld terrain** — they're enter-scenes.
- ❌ **Not built:** the spell-route gates (electric/ice/wind/fire/dash-leap — the abilities don't exist
  yet, so those paths are walk-fallback); the **landmark/dungeon nodes** (High Pass/Lighthouse/Vault/
  Caught/Weeping/Ember Hollow) + **Spire/Capital** + **Oasis** are not yet on the overworld; the world is
  **20×20**, not Van's full **24×24**; town **silhouettes** (the place reads as a town from the overworld)
  — currently a signpost/door only.

### THE GAP — the one question to confirm
**Do you mean (1) or (2)?**
1. **Seamless walk-THROUGH towns** — the towns are part of the overworld terrain; you walk *into and
   through* Mirefen/Saltbreak on the same map, no "enter a scene." (Buildings still have interiors, but
   the *town itself* is overworld.) → **This is NOT what's built** (towns are enter-scenes); it's a larger
   rebuild (each town becomes an overworld sub-area, not a separate scene).
2. **Walk-TO-the-town-position then enter** — you walk one continuous world to where each town sits (at
   its map position) and **enter** it (a town scene), like a classic JRPG world-map with town-enter
   points. → **This is roughly what's built** (the hybrid); remaining work is the deferred relocations +
   the 24×24 expansion + the spell-route gates + town silhouettes + the presentation polish (fewer
   scattered doors).

**My read of your editor map + "one map you walk across" is that you likely mean (1) — a seamless world —
or at least that towns should READ as places you arrive at, not a cluster of doors.** But I will not
assume. **Tell me 1 or 2 (or your own words), and I'll re-scope the plan to match before building.**

## VERIFY
Diagnosis only — no code changed. `npm test` + verify GREEN (18 gates). Evidence: `diag-fresh-gh-south.png`
(the fresh-build GH-south = town + 1 fast-travel door), the data check (1 south board door), the live
loaded-regions door tally (GH 10 + Marsh 4 + Emberwood 1 = 15 legit scattered entrances near the hub).
