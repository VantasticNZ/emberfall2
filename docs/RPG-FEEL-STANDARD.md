# RPG-FEEL STANDARD — the "professional open-world-but-gated" bar (a checked DoD standard)

> The subconscious "this is a real, professional game" feel — an **open world you're free to wander** that
> is **gated so it opens as your toolkit grows**, with every block **legible and tantalizing**, never an
> unexplained wall. This is a **DoD standard** (wired into `DONE-DEFINITION.md` "Professional Feel"): every
> region / corridor / gate is built to these 6 pillars, **eyes-on verified**. Reconciles with the
> every-ability-gates rule (`gating.js`) + the seamless-overworld lock (`PLAN-UNDERSTANDING`).

## PILLAR 1 — LEGIBLE, TANTALIZING GATING (the core)
**Every traversal gate must READ as "ability X goes here" at a glance — never an invisible/unexplained
wall.** The block teaches the tool and invites return. The visual says the ability before any text does.

### The per-ability gate VISUAL LANGUAGE (what each gate LOOKS like)
| Ability | The gate reads as… | Visual cue (target art) | Colour key |
|---|---|---|---|
| **walk** | an open path | (none — it's just open) | — |
| **cut** | overgrown foliage across the way | dense brambles/vines, slightly different green | leaf-green |
| **dash** | a short gap / narrow break | a 1-tile gap with ground visible across | — |
| **grapple** | a sheer gorge with a **grapple-anchor** on the far rim | a post/ring/jutting beam you'd line onto | warm brown/rope |
| **hookshot** | a chasm with a **hookshot target** across it | a fixed ring/eyelet/target plate | teal-steel |
| **lantern** | a **dark, boarded, lightless** mouth | near-black interior, boards, no detail visible | near-black |
| **firefrost / fire** | a wall of **black ice / a frozen path** (melts) | pale-blue ice block, frost sheen | ice-blue |
| **ice (spell)** | **water/lava to freeze** into a bridge | a gap of water/lava with a freeze-glint | ice-blue |
| **wind (spell)** | a **gust-gap / updraft** to ride | swirling debris, a wind-glyph | pale-cyan |
| **electric** | a **dead switch/conduit** to power | a switch/coil, unlit | yellow |
| **fire (spell)** | a **frozen door / icy seal** to thaw | frost over a passage | ice→ember |
| **bomb** | a **cracked, bombable wall** | visible cracks/fault lines in the rock | crack-grey |
| **bridge** | a **broken/raised bridge** | a gap with bridge stubs on each side | wood |
| **shard / story** | a **rockfall / sealed door** that opens on a story beat | rubble + a faint seam | stone-grey |
**Rule:** the gate's appearance + a one-line inspect ("a grapple-anchor across the gorge — you'd need the
grapple") must make the ability obvious. A gate that needs the player to *guess* fails this pillar.

## PILLAR 2 — SEE-IT-BEFORE-YOU-REACH-IT (tantalize)
Deliberately place **visible-but-not-yet-reachable** rewards/places (a chest across the water, a path up a
cliff, a lit window over a chasm) so the world reads as **whole** and **baits curiosity**. The player can
**try, be readably stopped, and remember** ("I'll come back with the grapple"). Each region should have at
least one tease that pays off later. (Ties to the TEASES in `gating.js`.)

## PILLAR 3 — BACKTRACK REWARDS / LAYERED REACHABILITY
Revisiting an early area with a **new tool must REWARD** — a chest, a shortcut, a secret opens. The world
**layers**: the same space gives more as the toolkit grows. Revisiting must feel **rewarding, not tedious**
(a quick shortcut home, not a long empty walk). Every tool gained should make ≥1 *earlier* place richer.

## PILLAR 4 — SOFT GUIDANCE (open, but with pull)
Free to wander, **gently steered** — via **sightlines, landmarks, lighting, terrain-funnelling, and
points-of-interest** — NOT invisible corridors, NOT directionless. How to funnel **without caging**:
- A **landmark on the horizon** (the Spire, a lighthouse, a tall tree) pulls the eye toward the objective.
- **Terrain funnels** (a valley, a coastline, a lit path) suggest a way without walls.
- **Light/colour** draws toward the point-of-interest; danger reads darker/colder.
- Leave **side-paths open** — the pull is a suggestion, the player can always wander off and find reward.

## PILLAR 5 — DENSITY WITH PURPOSE (no empty dead space)
**Every area has a reason to exist** — a secret, a vista, an NPC, a resource, a tease, an encounter. The
between-places space is **traversal with texture**, never a blank field. The bar: walking any ~24-tile
stretch, you pass **at least one** of {a POI, a tease, a resource/cache, an NPC/creature, a readable
landmark}. (Extends the verify `density-floor` gate from "has content" to "has *purposeful* content".)

## PILLAR 6 — MOMENT-TO-MOMENT POLISH (the subconscious "real game" signals)
- **Responsive controls** — input → action with no mush (the swept-dodge, crisp attack buffer).
- **Readable feedback** — hit → reaction (hit-pause, recoil, damage number, sfx); every action confirms.
- **Smooth transitions** — interior/door fades, no jarring pop; seamless region streaming (no stutter).
- **Ambient life** — NPCs + wildlife with **behaviour** (schedules, wander, reactions), not statues.
- **Place/action-responsive audio** — region music + ambient + action sfx, crossfaded, not silent/abrupt.
- **Consistent art** — one palette/scale/era per region; no clashing assets, no greybox shipped as final.

## ✅ THE STANDARD IN ONE LINE
*An open world you trust — you can SEE where you can't yet go, you UNDERSTAND why (the gate looks like its
ability), you're PULLED but never caged, every step has texture, coming back is rewarded, and it all FEELS
responsive and alive.* If a region doesn't deliver all six, it isn't done (see `DONE-DEFINITION` §E).
