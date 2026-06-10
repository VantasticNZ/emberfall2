# DEFINITION OF DONE — the runtime, eyes-on checklist (SSOT for "done")

> **Nothing is "done" until every box below is TRUE and eyes-on-verified at runtime.** This supersedes
> ad-hoc "done" claims. Born from `PROCESS-RETRO` (gates went green while the game was broken). Rule:
> **a green test is a hypothesis; the running game is the truth. Data-correct ≠ done.** Under-claim, never
> over-claim. Every requested item ends ✅ (proven, with the proof) or ❌ (with the reason) — never silently.

## A. GATE — automated (necessary, NOT sufficient)
- [ ] `npm test` + `npm run verify` GREEN (all 16 gates) — **but green ≠ done** (see B).
- [ ] navGate suites pass (reachability + containment).
- [ ] 0 console errors at runtime.

## B. RUNTIME — eyes-on, REAL input (the part that was missed)
Exercise it as a player would; a screenshot per visual item. "Present/data-correct" does NOT count.
- [ ] **Walkability** — the body walks the whole area with real movement (not just the flood-fill); reaches every intended spot.
- [ ] **Containment (walk AND dash)** — walk into every edge AND **dash** into every wall → the player is **contained**; cannot reach the black void. (The bug class that slipped twice.)
- [ ] **Doors as doorways** — every door reads as a **door embedded in the wall** (not a sign, not mid-floor); the door tile is the ONLY passable gap; walking onto it enters, walking **beside** it does not; no snag at the boundary.
- [ ] **No exploit-farm** — any loot/respawn/shop loop is tested for abuse: cut/loot/buy once, can't repeat to farm; regrow/restock only on the intended cooldown/condition.
- [ ] **Visual correctness** — the area READS as intended (composition/art-direction/palette), screenshot at normal zoom + self-checked against the look bar. No greybox/placeholder claimed as finished.
- [ ] **Presentation matches the build (M-map + clutter)** — press **M**: the world-map reflects the REAL current layout (settlements pinned at their built positions, derived from live data — not a stale list/skeleton). The on-screen world has **no superseded/duplicate presentation** (e.g. an old door-board left beside the new entrances). What Van SEES = what's built. (rendered-vs-built gate.)
- [ ] **Audio** — region music + ambient actually play (ears-on / verified routing), not just registered.
- [ ] **Interaction/feel** — collision, depth-sort, interaction-classes, walk-in transitions all behave with real input.
- [ ] **Perf** — fps holds (≥ ~55) with the area + NPCs loaded.

## C. DESIGN — designed == built
- [ ] 🔒 **SEAMLESS OVERWORLD (LOCKED, Van option B)** — the overworld is **ONE seamless continuous map**
  matching `world-map-vanedit.json`; **settlements are walk-through TERRAIN** (you walk into/through a
  town's streets with **NO door / NO scene-transition** to enter a settlement). **Only building interiors,
  dungeons, and secrets are separate scenes.** A settlement implemented as a separate enter-scene (with an
  overworld door into it) **violates the DoD** (gate #19 seamless-overworld tracks this → target: 0
  town/village/city enter-doors).
- [ ] **Designed==built** — the area sits at its **locked-map position** (Van's `world-map-vanedit.json` / MASTER-WORLD-SPEC) with its **planned terrain + music + elevation + connections**; the running world matches the locked design (designed-vs-built gate #16 + the M-map).
- [ ] **Per-settlement identity** — its own terrain + music zone + elevation are applied (not inherited-by-accident).
- [ ] **Cross-check** — verified AGAINST quests/assets/audio/enemies/difficulty/cohesion (PROCESS-RETRO "standing cross-check"), not in isolation.

## D. HONESTY — the close-out
- [ ] **Per-item checklist** — every requested item ✅ (with proof) or ❌ (with reason). A dropped/deferred item is ❌, never omitted.
- [ ] **Deferrals logged** — anything not done is in `DEFERRED.md` with what-unblocks-it + when-to-build.
- [ ] **No false-green** — if any automated gate is green while a runtime/visual item in B is false, the **gate is wrong** → fix the gate (or flag it) before claiming done.
- [ ] **Van's eye on FEEL** — movement/camera/combat/atmosphere handed to Van to play-judge (HARD RULE 9).

---
**The one-line test:** *Would it survive Van walking, dashing, and farming it with his own hands, at its
map position, looking finished?* If not — it's not done; mark the gaps ❌ and log them.
