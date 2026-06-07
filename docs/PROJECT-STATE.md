# EMBERFALL 2 — PROJECT STATE (the zero-context handoff)

**Read this + `docs/PLAN.md` and you have everything needed to continue.** This is the
living snapshot of where the project is. `PLAN.md` is the locked master plan + the
step-by-step build log; this doc is the orientation. Last updated: **2026-06-07**.

---

## 1. WHAT EMBERFALL 2 IS
A **2D top-down action-RPG** built on **LPC** pixel-art (ElizaWy LPC Revised characters +
LPC terrain/structures), Phaser 3.90 + Vite 6, vanilla JS ESM. The vision: a **~30-hour**
narrative RPG with real moral weight and reactive systems — think a pixel-art Fable/Fallout/
Zelda blend with a single coherent karma+deed memory under everything.

- **Story shape:** a childhood prologue in Greenhollow, a catastrophe + time-skip, then an
  adult journey across five regions chasing five shards, to a Spire endgame.
- **5 endings**, gated by Karma (morality/purity) + the deed memory: **Warden, Saint,
  Tyrant, Liberator,** and the **secret Ashbearer** (only reachable if you assemble the Pem
  clues across every region + meet hidden conditions). `Karma.reachableEndings()` decides
  which are live; `offeredEndings()` presents only the reachable; `epilogueCards()` layers
  ET1–ET12 epilogue twists by deed.
- **Tonal mix:** warm/pastoral and wholesome at the core, with real tragedy (no-win
  dilemmas, the god's agony), diegetic philosophy thought-experiments (trolley, ship of
  Theseus, Rawls' veil…), and a witty cameo/easter-egg layer (wholesome→edgy, never
  explicit, never minors). The dilemma is always *lived, never named*.

---

## 2. THE METHOD (how we work — keep doing this)
**Van directs in chat → chat-Claude writes a tight build prompt → Claude Code (this agent)
builds + verifies → Van plays and judges feel.** Roles:
- **Van** (owner, NZ): directs, plays, judges feel. Blunt, concise, no emoji. Pushes back.
- **Chat-Claude:** turns Van's intent into a focused, scoped build prompt.
- **Claude Code:** builds ONE focused objective per session, verifies it, commits+pushes.

Non-negotiable working rules (from `CLAUDE.md`):
- **HARD RULE 10 — session completion:** one finishable objective; end with a per-item
  **✅/❌ checklist with proof**; a dropped item shows as ❌, never silently omitted.
- **HARD RULE 9 — render verification:** any visual work must run LIVE, screenshot at
  normal zoom, self-check the Presentation & Feel DoD (QUALITY-BIBLE Part 2.5), and hand
  the FEEL items (movement/camera/combat) to Van to play-judge. A green `npm test` proves
  **logic only**, never presentation.
- **Write-once systems; all content is DATA.** Don't fork a system per case; flag genuine
  engine gaps + make a minimal additive change.
- **`npm run verify` before every commit** (a git pre-commit hook enforces it). Commit +
  push every session in logical per-file/group commits. Never force-push.
- **No placeholder/colour-box art** — omit + flag instead. **Licence-first** (CC0/OGA-BY/
  CC-BY-SA/GPL safe; any anti-AI clause banned — Mana Seed is banned).
- Reuse canonical ids from `src/constants/`. Never invent a synonym for an existing id.

---

## 3. WHAT'S BUILT + TESTED (engines + content, all green)
All systems are write-once + unit-tested (plain Node + `node:assert`, chained in `npm test`
— **17 suites green**). `npm run verify` adds: orphan-id check, item-SSOT, asset-licence,
storage-adapter, consistency lint.

**Core engines (`src/systems/`):**
- **Karma** — morality + purity axes + the **deed memory** (`recordDeed/hasDeed`), ending
  gates, the single reactive brain every quest/NPC/ending reads.
- **QuestEngine** — locked/available/active/complete state graph; requires-pattern
  (level/deeds/karma/**time-phase**); unlock/lock graph; branch choices.
- **Dialogue** — data-driven nodes/options; reactive `route:[{when(ctx),to}]`; supports the
  social **`check`** field (onPass/onFail routing).
- **Economy + Inventory + items** — regional buy/sell, gated stock, jobs, books-teach-
  skills, property+rent, food→HP/body-state, capped death penalty. Gold lives in Inventory
  (Karma stays single-purpose). CHA-adjusted prices (the social hook).
- **Monsters** — 9 telegraphed archetype behaviour FSMs each with a "what beats it" counter,
  + bosses (phased archetype + trick tool + twist); 4-directional facing; serializable.
- **Combat** — `PlayerCombat` (dodge-roll i-frames / block / parry) + `EnemyController`
  (renders any archetype as a real LPC monster, telegraph language, counter resolution,
  hit-pause/shake/SFX/flash/knockback). Shield-scaled block (shields as items). Kid/adult
  combat gate. **Threat indicators off by default** (toggle / ENEMY-INTUITION skill).
  **Safe zones** (no combat in settlements: `combat.safeZone` / a `safe` hub radius).
- **TimeOfDay** — dawn/day/dusk/night phases + phase/day callbacks; quests/shops gate on
  `req.phase`.
- **Modifiers + Options** — a modifier registry (big-head etc.), an options menu (rebind /
  audio / aim-invert / threat-indicators / modifiers), a walled-off **18+ adult-mode** gate
  (architecture only, no art, minor-safe).
- **Social (CHARISMA / TRUST / DECEPTION)** — `Social.js`: CHA price multipliers, trust
  derived over the deed memory, a check resolver (cha/persuade/charm/intimidate/insight/
  trust), option gating + Fallout-style `[Charisma 7]`/`[Insight]` tags. Wired live into
  real NPCs (Bram's CHA shop + haggle, Hagga's Insight lie-reveal, the Miner's trust gate).
  Tested (`Social.test.js`).
- **RegionScene template** (`src/scenes/RegionScene.js`) — the write-once base: rendering /
  dialogue / interaction / camera / combat / quest-orchestration / social option UI /
  per-prop tint / named props (chests). Region scenes (Greenhollow/Marsh/Peaks) are thin
  DATA subclasses.

**Governance/infra:** SSOT ids (`src/constants/{deeds,flags,items,endings,standards,
controls}.js`); `scripts/verify.mjs` gate; git pre-commit hook; `src/data/assets.js` art
manifest + `AssetLoader`.

**The ENTIRE designed narrative is built as DATA** (`src/data/quests/`): the full main line
**M1–M20**, **all 5 endings** + ET1–ET12 epilogue twists, every region's side quests
(Greenhollow hub SG1–SG7, marsh SA/Peaks SP/Coast ST/Emberwood SE), 6 philosophy quests
PH1–PH6, and the cameo/easter-egg layer (CAM1–7, EDG1–2, GAG1). Self-tested per quest.

---

## 4. WHAT'S DESIGNED, NOT BUILT (design docs — capture, no code yet)
These are thorough design captures to build later; each says it **enriches but does not
block** region builds:
- **`docs/SOCIAL-SYSTEM-DESIGN.md`** — the CHA/trust/deception spec. *(Now largely BUILT —
  see §3 Social.)*
- **`docs/RELATIONSHIPS-COMPANIONS-DESIGN.md`** — Part A: **affinity** (derived per-NPC,
  feeds prices/honesty/options/greetings). Part B: **companions** (a Party state +
  `AllyController` mirroring `EnemyController`; hired/quest/story allies; ending-support).
- **`docs/PETS-DESIGN.md`** — a Fable-style pet system: flavours (cute/cool/ugly/weird),
  per-pet **utility** (treasure-sniffer/monster-scarer/scout/trickster…), and the clever
  **social-perception** hook (the carried pet bends how NPCs read you), threaded into
  `Social.js` + companions follow-plumbing + the exploration secrets.
- **`docs/MODIFIERS-DESIGN.md` / IDEAS-BACKLOG.md** — modifier ideas + the slice-vs-later
  backlog.
- **The level-design quality bar** (this is now demonstrated in Greenhollow — see §5/§7).
- **HUD + map system** — not yet designed/built as a dedicated pass (quest-log UI,
  ending-screen UI, a world/region map, minimap). Currently a minimal top HUD only.

---

## 5. REGIONS STATUS
The narrative for ALL regions exists as data; rendering as playable scenes is region-by-
region on the RegionScene template.
- **Greenhollow Vale** — ✅ playable AND **upgraded to the gold-standard quality bar**: a
  designed 52×40 village (fountain square + 8 varied real LPC buildings on streets,
  crossroads / outskirts-meadow / wood-fringe zones, fences/gardens/barrels/signs, **3
  secret chests**), the full cast placed + working, M1–M4 + hub side quests playable, social
  live, safe zone. **This is the bar every other region must match.**
- **Ashen Marsh** — ✅ playable on the template (M8–M10, 7 archetype encounters, the Drowned
  Guardian boss, social on Hagga). Mood via tints — needs real bog/mud/black-water/boardwalk
  art + a gold-standard pass.
- **Sundered Peaks** — ✅ playable on the template (M11–M12, grapple tool + shard 2, the Keep
  Sentinel boss, SP side quests). Mountain mood via tints — needs a gold-standard pass.
- **Tidewreck Coast / Emberwood / The Spire** — ⛔ authored as DATA (quests/endings complete
  + tested) but **not yet rendered as region scenes**. They need a RegionScene subclass +
  region data + art each.

---

## 6. KEY GOVERNANCE / DESIGN DOCS (what to read)
- **`docs/PLAN.md`** — SSOT: the locked plan + the current build step + the full done-log.
- **`CLAUDE.md`** — auto-read index + the HARD RULES.
- **`docs/QUALITY-BIBLE.md`** — the quality bar + DoD gates A–N + Part 2.5 Presentation &
  Feel DoD + the Regression / Save-Versioning rules + the safe-zones & combat-placement
  rules.
- **`docs/WORKING-AGREEMENT.md`** — how we work (scope, DoD, automation, owner prefs,
  guardrails, anti-drift).
- **`docs/STANDARDS.md`** + `src/constants/standards.js` — canonical tuning constants
  (INTERACTION_RADIUS etc.); never re-hardcode.
- **`docs/ADR.md`** — settled architectural decisions (why they stand).
- **`docs/STYLE-GUIDE.md`** — the objective "does this asset fit" values.
- **`docs/ASSET-LEDGER.md`** — every art dir → source/licence/AI-safe (verify reads it).
- **`docs/PLAYTEST-LOG.md`** — Van's feel-judgments + per-session proof index.
- **Design docs:** SOCIAL-SYSTEM-DESIGN, RELATIONSHIPS-COMPANIONS-DESIGN, PETS-DESIGN,
  MODIFIERS-DESIGN; the world/story bible set (WORLD-MAP, WORLD-BIBLE, MASTER-DESIGN,
  STORY-AND-QUESTS, SYSTEMS-DESIGN-V2, TONE-AND-FEEL, COHERENCE-REVIEW, ECONOMY-BALANCE,
  REGIONSCENE-SPEC).

---

## 7. ASSET SETUP (two-tier; licence-clean; credit everyone)
- **Two-tier:** a **master library at `C:\GameAssets`** (local, NOT git — the big hauls) +
  a **lean in-repo `asset-library/`** + the actually-loaded art under `public/art/`. Only
  vetted, used art lands in the repo.
- **Art lineage:** characters = **ElizaWy LPC Revised** (OGA-BY-3.0); terrain + structures =
  ElizaWy LPC + Sharm LPC house (OGA-BY / CC-BY-SA / GPL); monsters = LPC monster pack
  (CC-BY-SA/GPL); audio = Kenney (CC0). All recorded in `ASSET-LEDGER.md`; verify fails on
  any unledgered file. The big Downloads packs were audited as **3D** (unusable for this 2D
  game) and stay out of git.
- **Buildings/props** now loaded: `public/art/structures/` (3 houses, fountain, chest,
  barrel, fence) — real ElizaWy LPC structure art.
- **Credits tone:** licence-first always; credit everyone generously; a warm,
  thank-the-community credits screen (design intent — not yet built).
- **Mana Seed is BANNED** (anti-AI licence clause) — reference-only, never used.

---

## 8. CURRENT FOCUS + NEXT STEPS
1. **Gold-standard region design = the quality bar.** Greenhollow is the reference. Apply
   the same craft (real varied buildings, winding paths, distinct zones, dense lived-in
   scenery, secrets, the cast + social woven in) to Marsh + Peaks, then build out Coast /
   Emberwood / Spire as rendered regions.
2. **Natural / immersive map principles:** diegetic boundaries (no hard map edges — fence
   the world with cliffs/water/dense wood/buildings), winding traversal not open fields,
   varied ground by zone, sub-areas that read distinct, secrets that reward exploration.
3. **HUD build** (a dedicated pass): quest-log UI, ending-screen UI, a region/world map +
   minimap, a clean diegetic HUD. Currently minimal.
4. **Then replicate regions** to the bar, region-by-region.
5. **Then the relationship/social depth chain:** build **affinity → companions → pets**
   (shared follow/party plumbing), and wire the **ending-support tie-in** (who stands beside
   you at the Spire is decided by affinity/deeds).

---

## 9. OPEN ITEMS / KNOWN ISSUES
- **Right-side tree/sprite clipping** — a recurring framing issue where edge props clip the
  world/screen edge; needs a reliable margin/diegetic-boundary approach (tie into the
  natural-map-edges work).
- **Map edges need diegetic boundaries** — regions currently end at a flat grass/physics
  bound; replace with cliffs/water/dense wood/walls so the world feels enclosed, not cut.
- **Path ↔ grass hard edges** — no transition/autotile blend tiles loaded yet; streets meet
  grass at square tile edges. A terrain-autotiling pass would polish this.
- **HUD incomplete** — no quest-log, no ending-screen UI, no map/minimap; top HUD is
  minimal.
- **Art flags:** Marsh/Peaks still use tint-mood (need real bog/mountain tilesets); a
  cave-mouth sprite is wanted (the boarded cave is currently a sign); CUTE-animal pet art
  (dog/cat/etc.) needs sourcing + licence-vetting before pets' cute tier can build.
- **FEEL items always pending Van:** movement cadence, camera feel, and combat feel are
  owner-judged each visual session (HARD RULE 9) — never self-certified.

---

*A fresh chat: read this, then `docs/PLAN.md`, then the relevant governance/design docs in
§6 for whatever the session targets. State your plan step. One focused objective. Verify it.
Per-item ✅/❌ with proof. Commit + push.*
