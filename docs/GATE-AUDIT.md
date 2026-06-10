# GATE AUDIT + CONNECTED-STATE — is the quality/cross-check system actually working?

> Van asked: "make sure the gates + cross-verifications are all working." Honest answer below: **all 20
> gates are DATA-static or flood-fill SIMULATION — none runs the real Phaser physics/render.** They're
> PROXIES; the runtime/visual truth is defended ONLY by eyes-on (HARD RULE 9 + meta-rule 10 "verify in
> the user's exact state"). That's why presentation/physics bugs slipped — and why the new rule + the
> stale-state preventatives matter. Pairs with `PROCESS-RETRO`.

## THE 20 GATES — runtime or data? hard-fail or tracking? strengthen?
| # | Gate | Tests | Type | Fail mode | Defends (runtime truth) | Strengthen? |
|---|---|---|---|---|---|---|
| 1 | npm test (units) | system logic | DATA | hard | pure-logic systems | pair w/ eyes-on for anything rendered |
| 2 | orphan-id | deed/flag refs | DATA | hard | quest/ending callbacks fire | ok |
| 3 | items-SSOT | item defs | DATA | hard | economy refs resolve | ok |
| 4 | licence | public/ files | DATA | hard | legal safety | ok |
| 5 | storage | save isolation | DATA | hard | save integrity | ok (naive text-match — avoid the word in comments) |
| 6 | consistency (magic #) | literals | DATA | hard | tuning SSOT | ok |
| 7 | no-soft-locks | gating DAG | DATA | hard | every key obtainable in order | **proxy** — graph ≠ physical reach; pair w/ navGate + a real playthrough |
| 8 | ability-coverage | ability gates | DATA | hard | no decorative ability | ok (design rule) |
| 9 | channelled-not-open | nav data | DATA | hard | routes read as channels | proxy — doesn't test feel; eyes-on |
| 10 | density-floor | prop counts | DATA | hard | no empty sectors | **WEAK** — counts ≠ *purposeful* content (RPG-FEEL pillar 5); eyes-on |
| 11 | collision-matches-visual-mass | prop colliders | DATA | hard | solids actually block | **WEAK** (went green while broken) — proves a collider EXISTS, not that it BLOCKS at runtime; pair w/ navGate + dash test |
| 12 | seam-coherence | region bounds | DATA | hard | no world gaps | ok-ish; eyes-on the seam |
| 13 | prop-key-integrity | art keys | DATA | hard | no missing art | ok |
| 14 | entrance-coherence | door handshake | DATA | hard | doors link valid regions | proxy — doesn't test you can WALK it; pair w/ navGate |
| 15 | navGate (reachability + containment) | flood-fill + clamp inputs | **SIMULATION** | hard | body walks spawn→exits; perimeter sealed | **best we have, still not real physics** (no swept-dodge/dash/render) — eyes-on required |
| 16 | designed-vs-built | locked map vs regions | DATA | hard (mislink) + tracking | every designed place built/tracked | ok — pair w/ M-map eyes-on |
| 17 | no-overlapping-scenes | scene bounds | DATA | hard | an entrance lands in the RIGHT area | ok (caught thornwell→stonereach) |
| 18 | rendered-vs-built | board vs overworld doors | DATA | hard | one world, not a stale board | **visual truth via data** — the on-screen "no clutter" still needs eyes-on (it's how Van caught it) |
| 19 | seamless-overworld | town enter-doors | DATA | tracking + regression-guard | towns are walk-through terrain | by-design tracking during transition; the "walk through with no transition" is eyes-on |
| 20 | no-floating-doors | door marker/building-adjacency | DATA | hard | ZERO doors on open terrain | **visual truth via data** — "0 floating doors visible" still eyes-on (meta-rule 10 caught it, not the gate) |

## THE GAPS — cross-checks with NO automated gate (eyes-on-only)
These are exercised by **eyes-on review only** — no gate. Strengthen by adding gates where checkable, and
ALWAYS eyes-on per meta-rule 10:
- **AUDIO × region** — no gate checks the region music/ambient actually PLAYS (only that the file is
  registered). Ears-on only. *(Strengthen: a gate that every region with a `music` key has the track loaded.)*
- **ENEMIES × placed-difficulty (t1→t5)** — the difficulty curve is a design doc, not a gate. Eyes-on.
- **COHESION — elevation + terrain-transition bands** — `seam-coherence` checks bounds match; it does NOT
  check elevation steps or grass→bog blending (those aren't built yet). Eyes-on.
- **PROFESSIONAL-FEEL (§E — legible gates, teases, backtrack, soft-guidance, density-purpose, polish)** —
  no gate; eyes-on per region against `RPG-FEEL-STANDARD`.
- **THE VISUAL TRUTH of #18/#20** — the data invariants are good, but "no clutter / no floating door
  VISIBLE on a fresh-save load" must be eyes-on (the data gate can't see the rendered frame).

## ✅ THE STALE-STATE PREVENTATIVES (built this pass — the wrong-state class is closed)
1. **Save WORLD-VERSION guard** (`SaveManager.WORLD_VERSION`) — bump on any layout change; a save with an
   older `wv` resets the POSITION to spawn (progress kept) so an old save can't load you into a changed/
   void spot. *(Legacy no-`wv` saves use the schema migration; saves from now carry `wv` → future bumps
   invalidate.)*
2. **HMR full-reload** (`main.js`, dev only) — `vite:afterUpdate` / `import.meta.hot.accept` force a FULL
   page reload on any hot update, so a long-lived tab's Phaser scene is ALWAYS recreated from the current
   build — no "new stamp, old scene."
3. **F8 fresh-game** — clears the save (via the storage adapter) + reloads; a visible "start clean" control.
   Plus a banner when the world-version reset returns you to Greenhollow.

## 🌍 CONNECTED-STATE — the true high-level picture (live gate output)
**The overworld is ONE connected walkable world** of 8 streamed regions: Greenhollow ↔ Belt ↔ **Marsh (W)**
· **Peaks/Foothill (N)** · **Coast (E)** · **Emberwood (S)** · **Spire (far-N)** — walk between them, no
soft-locks, every ability gates ≥1, no overlapping scenes, no duplicate entrances, **zero floating doors**.
| Gate | State |
|---|---|
| **designed-vs-built** | 11 settlements built; **9 reachable on the walkable overworld** (Stonereach/Cragfoot/Keep N · Saltbreak/Cribbins E · Thornwell S · Mirefen/Shrine/Cemetery/Fenwick W); 2 board/scene-only (**Oasis** needs a desert region; Mirefen is inline so it reads as "no door" here) |
| **seamless-overworld** | **1 town truly INLINE walk-through (Mirefen)**; 7 still enter-scenes (Fenwick/Cemetery/Stonereach/Cragfoot/Saltbreak/Cribbins/Thornwell) — DEFERRED, gate-tracked → target 0 |
| **no-floating-doors** | ✅ ZERO free-standing doors on open ground |
| **no-soft-locks** | ✅ 6 gated areas + 2 teases, acyclic, every key obtainable in order |
**Honest deferred (the gap to "fully built as designed"):** convert the other 7 towns to inline; the
structural geometry (zig-zag corridors + elevation + terrain-bands); the 24×24 expansion; Oasis/desert;
the spell-route gates (need the abilities session); bespoke gate art; the §E feel-pillars per region. All
tracked in `DEFERRED.md`. **What IS solid: one connected walkable world, gated correctly, no floating
doors, presentation matching the build — verified in Van's exact fresh-save state.**
