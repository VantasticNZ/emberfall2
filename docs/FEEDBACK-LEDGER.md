# FEEDBACK-LEDGER — every piece of Van feedback, tracked to closure

> **Living, append-only.** Every Van report gets a row the moment it lands and is NEVER silently dropped.
> A row leaves "open" only by being **FIXED** (with the commit), or **DEFERRED** with an explicit reason AND a
> trigger-to-revisit. "In-progress" is a holding state, not a resting state.
>
> **The non-negotiable:** feedback is closed by a **SYSTEMIC** fix — the CLASS, not the instance (one
> verb-dispatcher, not per-object; one collision law, not per-prop) — and before closing, check whether the
> same bug *pattern* exists elsewhere (see BUILD-METHOD §3 "Fix the class, not the instance"). The "Systemic fix"
> column records the class-level change, not the one-off patch.
>
> Status legend: **FIXED** `<commit>` · **IN-PROGRESS** · **DEFERRED** (reason + trigger) · **DECISION-NEEDED** (blocked on a Van call).

---

## Open / captured

| Date | What Van reported | Status | Systemic fix (the CLASS, not the instance) |
|---|---|---|---|
| 2026-06-14 | **Wooden sword won't sell to the child.** Also: is it a *toy* or a *practice* sword? | **FIXED** (shop+inventory build) | DECISION: it is a **PRACTICE sword** (a blunt wooden trainer), distinct from the `wooden_toy` keepsake. Systemic fix: the child age-gate now reads an item flag (`childSafe`), not a hardcoded type list — `wooden_sword` is `childSafe: true, blunt: true`, so a child can BUY + own + train with it (swings but does not cut), while real weapons stay gated. Both buy paths (`_shopBuy` + `_dlgBuy`) read the flag. Live: child buys it (gold 20→5); a child buying a steel sword is still refused. Gate: `shop-access`. |
| 2026-06-14 | **Shops show NO item list and NO sell option on my screen.** Recurring — reported fixed before, still broken live. | **FIXED** (shop+inventory build) | ROOT CAUSE found by tracing Van's actual path: the GH grocery (Pem) used the good list UI, but the **smith** Van shops at for a sword used the BROKEN shape — Bram was a `childOnly` one-line dialogue stub ("buy the steel sword"), and Hodge (whose `hodge_forge` stock exists) had **no `shop:` wired at all**. So the keeper Van reached never opened the list. CLASS fix: an `openshop:<id>` dialogue/topic command opens the real `_openShop` list+sell UI; Bram→`bram_forge` (via dialogue), Hodge→`hodge_forge` (via topic). Prior "fixes" only ever touched the Pem list UI Van wasn't opening. Live: Bram's Forge shows the list + prices + TAB sell; buy AND sell both work on screen. Gate: `shop-access`. |
| 2026-06-14 | **Equip / compare / use / drop gear** — the gear-interaction system isn't built. | **DEFERRED → gear-system build** | One **inventory-action dispatcher** (verb on an item: EQUIP/COMPARE/USE/DROP resolved by item type + slot), mirroring the world interaction-verb dispatcher — not four bespoke handlers. Trigger: the dedicated gear/stats build (next-layer after the slice's core verbs). |
| 2026-06-14 | **Gear & Stats should show a paper-doll** of the character with the equipped gear visible. | **DEFERRED → gear-system build** | Reuse the **ULPC/forge layer rig** to render the live character (same composite the world uses) into the menu panel with equipped layers shown — one render path, world + paper-doll share it. Trigger: gear/stats build (pairs with the row above). |
| 2026-06-14 | **The menu closes when I navigate sideways to Map** (should move to the Map tab, not exit). | **FIXED** `23cc9940` | ROOT CAUSE: the full map was a CHILD of `hud2`, and `_openMenu` hides hud2 (so the HUD doesn't overlap the menu) → the Map tab rendered NOTHING (parent invisible), worst of all in interiors (fully blank). It only LOOKED closed; `_menuOpen` stayed true. CLASS fix: the map is now scene-root on the uiCamera (independent of hud2), and the menu **tab bar stays visible on every tab** (on Map only the opaque panel bg hides, so the map shows under the tabs). Live: arrow through all four tabs, menu stays open with the tab bar visible; map renders in overworld AND interiors. Gate: `menu-map-tab`. |
| 2026-06-14 | **Carry-pose + throw-arc assets** — held-overhead lift frames + a throw/place arc don't exist (the hen snaps overhead). | **DEFERRED (asset gap)** | Fetch/commission LPC lift-carry + throw frames; until then the seated-overhead hen is the minimum-coherent carry (flagged, not faked). Trigger: the reactive-dialogue / carry-feel follow-up build. Captured in `docs/DEFERRED.md`. |
| 2026-06-14 | **Adult bush-lift (Zelda-style)** — not built; asset gap. | **DEFERRED (asset gap)** | Same lift-frame dependency as carry-pose; build via the generalised PICK-UP verb once frames exist (one verb, adult + child variants by age), not a one-off bush handler. Trigger: carry-feel build. |
| 2026-06-14 | **Generalised verb dispatcher** — verbs are wired specifically for M2 (eggs/hen) + the punch; need a target→verb registry. | **DEFERRED → next layer** | A **target→verb registry**: any small prop is PICK-UP-able, any NPC HIT-reacts everywhere, by declared target metadata — the M2 wiring proves the pattern; generalise it. Trigger: next-layer interaction build (the layer reactive-dialogue + carry sit on). |
| 2026-06-14 | **Reactive dialogue** — Bram should offer the sword *after* a greeting; say "mind the edge" when the player is broke. | **DEFERRED → reactive-dialogue build** | Dialogue **router nodes that branch on karma/deeds/gold/quest-state** (the engine already supports reactive routers) — author Bram's branch via data, not a bespoke line; the same router pattern serves every reactive NPC. Trigger: the reactive-dialogue build. |
| 2026-06-14 | **Prayer → faith/luck points affecting the story** (long-term idea). | **DEFERRED (LATER — explicitly NOT now)** | A faith/luck resource feeding the existing karma/deed engine as another reactivity axis (one engine all content reads). Captured so it is not lost. Trigger: post-slice systems-design pass — Van to greenlight; do NOT build during the slice. |

---

## Closed (this session — FOUNDATION PASS)

| Date | What Van reported | Status | Systemic fix |
|---|---|---|---|
| 2026-06-14 | **Water was walkable** — could walk into ponds/pools. | **FIXED** `0a504226` | Codified the **water-collision law**: water is visual mass → a full-rect collider in `this.solids`, never walkable; `collision-matches-visual-mass` gate asserts it across all pond/pool regions (not per-pond). |
| 2026-06-14 | **Door entry fired from afar / wasn't tight.** | **FIXED** `9554e242` | Single `INTERACTION_RADIUS` standard drives press-E enter + walk-onto; immediate at the door tile, ignored beyond reach — one constant, every door. |
| 2026-06-14 | **Eggs were a text step; the hen was a "pecking" line — not real verbs.** | **FIXED** `d3765b7e` | Real **interaction-verb system**: COLLECT (eggs are physical objects), CARRY (hen picked up overhead), HIT (animals/NPCs react), wired into `_playerAttack`; `verb-system` gate. (The *generalised* dispatcher remains open above — this proved the pattern on M2.) |
| 2026-06-14 | **Props render cut/halved.** | **FIXED (guard added)** `f5c82302` | Not reproducible (declared dims == source PNGs; whole-image loads). Added `prop-whole` regression gate decoding every prop's bbox vs source frame, so any future crop hard-fails. Re-open with a specific prop if it recurs on Van's screen. |

---

*Append every new Van report here the moment it lands. A row with no commit and no deferral-reason is an open
debt — never let one go silent.*
