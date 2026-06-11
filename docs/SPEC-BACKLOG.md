# SPEC BACKLOG — systems still needing a full-expectation spec (ordered)

> **RULE (THE-SLICE method R1):** each system's full-expectation spec is written **just-in-time at its
> step** (not all up front), **Van reviews it pre-build (~2 min)**, the build implements ALL of it, and the
> **exhaustive table (pixel-truth where visual)** covers it. This page is the ordered backlog, not the specs.
> ✅ already spec'd: DOORS (`DOOR-SYSTEM.md`) · INTERIORS (`SPEC-INTERIORS.md` v2, awaiting approval).

## SLICE (Greenhollow vertical slice — `THE-SLICE.md` order)
| step | system | scope (1–2 lines) | spec |
|---|---|---|---|
| 1 | **Doors / buildings** | ✅ DONE — `DOOR-SYSTEM.md` (awaiting VAN-TEST r4 freeze). | done |
| 2 | **Interiors** | layouts/furniture/containers/lighting/residents/stairs per type×region. | ✅ `SPEC-INTERIORS.md` v2 (review) |
| 3 | **NPCs / dialog** | speak/schedule/portrait+name/expressions; the dialog tree, choices, deed-callbacks; trust/CHA gates; barks. | SPEC-NPC-DIALOG (step 3) |
| 4 | **Quests M1–M4** | start→steps→branches→completion→reward/karma; journal/tracker; the deed-memory hooks; soft-lock-free. | SPEC-QUESTS (step 4) |
| 5 | **Combat-feel (first enemy)** | telegraph→hit-react→dodge/block/parry windows; hit-pause/knockback/sfx; nearest-target (done); damage/HP/death; feel. | SPEC-COMBAT-FEEL (step 5) |
| 6 | **Audio coverage** | per-region music beds + ambient + sfx routing + interior beds + crossfade; the HAVE/GAP from the music audit. | SPEC-AUDIO (step 6) |
| 6 | **UI / HUD / menus** | HUD layout, dialog box (fixed), map (M), quests (T), pause/settings, the adult-gate, the inventory screen. | SPEC-UI (step 6) |
| 7 | **Save/load UX** | autosave points, the world-version guard (done), F8 fresh-game (done), slots, "are you sure", corruption-safe. | SPEC-SAVE-UX (step 7) |

## POST-SLICE (after GH sign-off — `MASTER-DESIGN` phases)
| system | scope (1–2 lines) | phase |
|---|---|---|
| **Items / inventory / keys** | item defs/SSOT (exists), pickup/use/equip, stack/carry-limit, KEYS (door-keys hooked, none findable yet), readables. | M1+ |
| **Economy / shops** | shop stock/pricing, buy/sell, haggle (CHA), jobs/gold sources, the SHOPS/JOBS data. | M1+ |
| **Enemies / AI / difficulty** | per-enemy AI (aggro/patrol/ranged/boss), the t1→t5 placed-difficulty curve, learn-the-pattern bosses, difficulty options. | M1+ |
| **Abilities / spell-routes** | the 11 traversal abilities, each gating ≥1 route (gating.js), the per-ability gate visual language (RPG-FEEL §1), dash-leap engine gap. | M2+ |
| **Writing / tone guide** | the wholesome→dark→rude-to-the-line voice, per-NPC register, the morality-driven beats; a one-page tone bible. | ongoing |
| **Performance budget** | fps floor (~55), streamed-region cap, draw-call/texture budget, the stale-scene preventatives (done). | ongoing |
| **Onboarding** | first-5-minutes teach (move/talk/attack/dodge/enter), the legible-gating tutorialisation, no wall-of-text. | M1+ |

*New rows get added here as systems surface; each is spec'd at its step, never blob-built.*
