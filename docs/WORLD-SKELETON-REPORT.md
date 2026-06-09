# WORLD-SKELETON — the whole-world navigation layer (greybox, nav-first) — REPORT

> **GAME-BUILD-PLAYBOOK v2 §8.3 — the "walk the whole world" milestone.** The entire world is now a
> connected, walkable **navigation skeleton** so Van can WALK THE WHOLE MAP and check the layout +
> distances + explorable shape + the gating chain **before any art pass**. Built via the proven
> fit-check pipeline (the `nav` grid + `navGates` runtime gates), the nav-FIRST way. 13 verify gates
> + all suites GREEN; 0 console errors. Build stamp on the screenshots: `5f85cbd7`.

## ★ STATUS: the whole world walks end-to-end (8 regions, gated per gating.js).

## 1. What was built
The **existing 4 regions are the proven core** (Greenhollow + West Belt + Ashen Marsh + Sundered Peaks
+ the Foothill route) — already walkable nav skeletons, kept untouched. The **3 missing regions** were
authored from scratch as **greybox nav skeletons** + integrated into the live streamed world:

- **`greyboxRegion()` builder** (`worldmap.js`) — the reusable nav-first tool: a spec of *walkable
  corridor rects* → a `route` region with **per-tile colliders filling every non-walkable tile** (the
  channel walls the gates expect), an **entry GATE** (keyed to a tool per `gating.js`), a **grant
  point** (records the tools/shards so the chain stays walkable), greybox `dirt` terrain on the
  corridors, and a **`nav` grid** for the runtime navGates. **No art/props** — structure + walkability
  only.
- **Tidewreck Coast** (E of GH; seam x340; **grapple**-gated river-gorge) — entry road → harbour-town
  junction → the Drowned Vault (hookshot+shard 3) → an E cliff-path + a NW secret spur.
- **Emberwood** (S of GH; seam y328; **hookshot**-gated chasm) — chasm road → camp junction → Ember
  Hollow (firefrost+shard 4) → a fever-grove secret.
- **Hollow Spire** (N of the Peaks; seam y218; **firefrost**-gated ascent) — a **switchback ascent** →
  the summit Binding Chamber (shard 5) → a hidden side-ledge.
- **Entrances** made two-sided (`entrances.js`) + the verify entrance-gate relaxed to allow a
  **symmetric link-barrier** (a gorge/chasm to the open hub: the reciprocal can never soft-lock).

## 2. Per-region reachability (the runtime body-walk gate — `scripts/fitcheck/worldskeleton.test.mjs`)
A real **16×8 player body** floods each region's free space against the **real per-tile colliders**,
from the entry to every intended destination; every blocked zone must hold:

| Region | Body-walk result | No-prop-on-walkable |
|---|---|---|
| **Tidewreck Coast** | ✅ entry → harbour town `(11,7)` + Drowned Vault `(23,24)` + NW secret `(3,12)` + E cliff `(30,16)`; blocked zones hold | ✅ (greybox, no props) |
| **Emberwood** | ✅ entry → camp `(9,11)` + Ember Hollow `(18,23)` + fever-grove secret `(28,15)`; blocked holds | ✅ |
| **Hollow Spire** | ✅ entry → summit `(18,4)` + side-ledge secret `(12,20)` via the switchbacks; blocked holds | ✅ |

The **existing 4 regions** were already walk-proven in prior sessions (their nav is the built
colliders); they're the proven core and stay GREEN on all gates.

## 3. No soft-locks across the whole world (proven by the gate chain)
- **`gating.js` no-soft-lock gate:** every key obtainable, acyclic — GREEN (6 gated areas + 2 teases).
- **Entrance-coherence gate:** **14 entrances handshake, gates match `gating.js`, all 8 regions
  reachable from Greenhollow** — GREEN. The chain: GH(open) → Marsh(open, earn lantern+shard 1) →
  Peaks(shard 1, earn grapple+shard 2) → **Coast(grapple, earn hookshot+shard 3)** → **Emberwood
  (hookshot, earn firefrost+shard 4)** → **Spire(firefrost+4 shards, shard 5)**.
- **Seam-coherence** (8 regions) + **channelled-not-open** (5 routes) + **density-floor** (8 regions) —
  all GREEN.

## 4. Eyes-on (live, real input — the screenshots, stamp `5f85cbd7`, 0 console errors)
- **`ws-coast-greybox.png`** — the Coast greybox corridor network, **seamed onto Greenhollow** (GH
  buildings/trees at the left edge), the gated Drowned-Vault grant node visible.
- **`ws-spire-ascent.png`** — the Hollow Spire **switchback ascent** greybox, the Peaks seam at the
  bottom, the summit Binding-Chamber grant at the top.
- **Gate verified live:** walking E into Coast **without grapple → BLOCKED at the gorge** (stopped at
  tile x339); after earning grapple → **the gorge opens, walked in + along the corridor 332px**.
- **8 regions stream** as the player approaches (within a chunk); 0 console errors throughout.

## 5. Honest scope flags (this is a SKELETON — art + density come next)
- **Greybox = structure only.** The 3 new regions are simple **corridor networks + a town-junction
  node + a dungeon grant-node + a secret spur** — enough to walk + judge the LAYOUT/distances/forks/
  gating. They are **not** the full `CONNECTORS.md` vastness, detailed town interiors, or final density.
- **Connectors = the regions' own entry corridors** for now (not separate vast connector regions); the
  big explorable between-region zones are a follow-up.
- **Grant points are placeholders** — a glowing greybox box that records the tools/shards; the real
  dungeons/bosses replace them.
- **navGates ran on the 3 NEW regions**; deriving nav grids for the existing 4 (already walkable +
  gate-verified) is a follow-up so the body-walk gate covers all 8.
- The existing regions keep their real content; only the 3 new ones are greybox.

## 6. What Van checks on this milestone
**Walk the whole map:** GH → (W) Belt → Marsh; GH → (N) Foothill → Peaks → (N) **Spire**; GH → (E)
**Coast**; GH → (S) **Emberwood** — earning grapple/hookshot/firefrost opens each gate in turn. Judge:
the **layout + distances**, the **fork choices**, the **explorable shape**, and that **everything
reachable / nothing soft-locked**. Flag any region that feels mis-placed/too-small/too-large **before**
the art pass turns the skeleton into the real world.

*Next per v2 §8.4: the GH→Peaks vertical-slice ART pass on the proven nav layer; then replicate the
art + density + the vast connectors across the greyboxed regions.*
