# SPEC — NPCs / LIVING-WORLD (slice step 3) — FULL-EXPECTATION SPEC, for Van's ~2-min review

> **STATUS: SPEC ONLY — do NOT build until Van approves/edits this.** (THE-SLICE method RULE 1.)
> **References:** Stardew (phase schedules + chore loops), Majora's Mask (everyone is somewhere, always),
> Fable (property ownership + the town reacts to you). Slice scope = **Greenhollow only**; Marsh/Peaks/Coast
> palettes are sketched for continuity but built post-slice. Build is one step; this is the decomposition.

---

## 1. ROLE PALETTES per settlement type (the write-once rule-set, like interiors R1)
A settlement is populated by composing ROLES from its palette. Each role = **{ what it DOES (chore loop) ·
WHERE it lives (a named home) · day-phase positions }**. GH is the built palette; others sketched.

### GREENHOLLOW (built this slice)
| role | count | DOES (loop) | LIVES | morning / day / evening |
|---|---|---|---|---|
| **Keeper** (store/forge/chapel/tavern) | 4 | tends post (counter/anvil/altar/bar) + a short idle bark | above/behind the shop | shop / shop / home or tavern |
| **Priest** | (=chapel keeper) | tends altar, sweeps nave | chapel back | chapel all day, home evening |
| **Guard pair** | 2 | ROAM a patrol route ↔ POST at the gate; alternate | barracks/a home | gate-post / patrol loop / one posts, one off |
| **Wood-chopper** (ambient) | 1 | walk to woodpile → chop anim → pause → repeat | a cottage | woodpile / woodpile / tavern |
| **Farmer** | 1 | tends the edge fields (hoe/water loop) | edge cottage | field / field / home |
| **Repair worker** (event-driven) | 1 | idle at home UNTIL a broken-door event → walks to it → hammers (staged) → restores | a cottage | event-only; else ambient |
| **Residents** | 2–3 | home chores (sweep/sit/tend hearth) + stroll to plaza | their named home | home / plaza or home / home |
| **Kids / elders** (texture) | DECISION | kids play-run in the plaza; elder sits on a bench | a home | plaza / plaza / home |

### Sketches (post-slice, logged)
- **Ashen Marsh:** fisher (net loop at the dock), herb-wife (forage loop), mire-folk (slow stroll), no guards (lawless).
- **Sundered Peaks:** miners (pick loop at the rockface), a warden (post), hardy residents (indoor-heavy).
- **Tidewreck Coast:** dock-hand (haul loop), salvager (beach loop), tavern crowd.
Each reuses the SAME role engine — only the chore target + sprite skin + palette change (write-once).

---

## 2. TIME — a simple 3-phase day (full hourly = post-slice)
**Phases:** `morning` · `day` · `evening` (driven by the existing `tod.phase()`). Each NPC carries a
**phase→position** map (a tile + a facing/role). Transitions: when the phase flips, movers re-path to their
new anchor (a brief walk, not a teleport — Majora's "always somewhere"). **Door coherence:** a building's
door state reflects presence — a home whose resident is OUT (at the field/plaza) reads **locked / "nobody
home"**; a shop is **open** only while its keeper is at the post. (Full per-hour schedules + named meals/
sleep = a post-slice layer, logged in DEFERRED.)

---

## 3. CHORE LOOPS — the walk→act→pause cycle (+ asset-first anim audit)
**Engine (write-once):** a chore = `{ anchor tile · action anim · period · optional path of anchors }`. The
mover state-machine: **walk to anchor → play action anim N times → idle-pause → (next anchor / repeat)**.
Ambient, interruptible by dialog (face the player, resume after). Driven off `NpcLife` (already exists:
movers + schedule + tempo) — this spec EXTENDS it with the action-anim step.

**ASSET-FIRST ANIM AUDIT (HAVE / GAP):**
| chore | anim needed | state |
|---|---|---|
| (all) idle · walk | idle, walk | ✅ **HAVE** (fetched per layer) |
| generic "use tool" | slash (Combat 1h) | ✅ **HAVE** (the attack sheet) — usable as a generic swing |
| chop wood | axe/woodcut | ⚑ **GAP** — fetch via **ULPC forge** (woodcut) or ElizaWy expanded sheet |
| hammer / smith | smith/thrust | ⚑ **GAP** — ULPC forge (thrust or hammer); slash is a passable stand-in |
| hoe / water (farm) | hoe, watering | ⚑ **GAP** — ULPC forge tool anims |
| sweep | (none native) | ⚑ **GAP** — repurpose thrust low, or DEGRADE to "idle at the broom" |
| pray / kneel | kneel | ⚑ **GAP** — no char anim; `child-pray.png` is a STATIC prop. DEGRADE: idle facing the altar |
| guard idle/post | idle + spear prop | ⚑ **GAP** — ULPC forge: base char + spear/helm layers |
**GRACEFUL DEGRADE RULE:** a chore with no clean anim **still runs** as walk→**idle-pause facing the work
object**→repeat (presence preserved); the bespoke anim is a fetch upgrade, never a blocker. EVERY fetched
anim is licence-checked (OGA-BY/CC-BY-SA, the same ULPC/ElizaWy provenance) + ledgered before use.

---

## 4. DIALOG (slice scope — personality, not a quest web yet)
Every **named** NPC gets a **line-set**: `{ greet · 2–3 talk topics · 1 bark (overheard/ambient) }`.
- **Keepers** also get a **trade hook** line ("the shop UI comes later" — the hook returns a stub now).
- **Interconnection:** each town has **2–3 lines that reference another NPC or place** ("Ask Hodge about the
  old mine." / "Pem charges too much, between us.") — the town feels woven, not a list of strangers.
- **Tone guide hooks:** warm, plain, occasionally funny, **light NZ flavour** (dry, understated; "She'll be
  right." sparingly) — never quippy-Marvel. Dark threads stay earned. (Full tone bible = its own backlog row.)
- **Repeat-avoidance rule:** talk topics CYCLE (don't replay greet every time); a `lastSaid` index per NPC
  advances so re-talking surfaces a new topic before looping; barks pick non-repeating at random.
- **Data shape:** extends the existing NPC `greeting` → `{ greet, topics:[…], bark, refersTo:[ids] }` (data,
  no engine fork). Dialogue tree/choices/deed-branches = step 4 (quests); this is flavour + hooks.

---

## 5. REACTIVITY — the town sees what you did (deeds → visible response)
- **Broken door** (from the door system): the resident **grumbles** ("Who did this to my door?!"), and a
  **REPAIR-WORKER EVENT** fires: the worker **walks to the door → hammers (staged, visible over time:
  cracked → boarded → restored) → door returns to closed**. Staged progress is eyes-visible, not instant.
- **Looted home** (the `home_looted` deed): that home's resident greets you **cold** ("I know what you took.")
  — a karma/deed-gated greeting variant.
- **Karma greeting variants:** high-morality → warmer greets + a small boon line; low → wary/curt; neutral →
  baseline. One variant switch per NPC (data: `greetByKarma:{good,neutral,bad}`).
- **Scope:** these are the SLICE reactivity beats (grumble · repair event · cold-loot · karma greet). Deeper
  reactive webs (rumours spreading, factions, escalating consequences) = post-slice, logged.

---

## 6. PROPERTY / DEEDS (Fable model — SCHEMA now, BUILD post-slice)
To avoid a retrofit, **every building carries deed data NOW** (one line per building, schema only):
```
deed: { owner: '<npc|town>', price: <gold|null>, rentRate: <gold/phase|0>, buyable: false }
```
- **PURCHASE** unlocks **per-town** when that town's quest arc completes (`buyable` flips true; a deed-board
  or the keeper offers the sale). Owning a home → **rent trickle** (passive gold/phase) + later **furnish /
  rename / store goods**. **Build = post-slice** (the purchase UI, rent loop, furnishing); the **schema +
  per-building `deed` data = THIS slice** so nothing needs retrofitting. Manor/special homes = higher price /
  arc-gated. (Verify gate later: every building has a `deed` block.)

---

## 7. EXHAUSTIVE-TABLE CASES + VAN-TEST + open decisions

### Exhaustive table (every case, fresh save, pixel/eyes where visual)
- **Presence per phase:** each named NPC is at its morning/day/evening anchor; re-paths (walks) on phase flip.
- **Door coherence:** resident OUT → home reads locked/"nobody home"; keeper at post → shop open.
- **Chore loops:** each chore runs walk→act(or degrade-idle)→pause→repeat without stalling/escaping room.
- **Dialog:** every named NPC → greet + each topic surfaces + repeat-avoidance advances + a bark fires.
- **Interconnection:** ≥2 lines per town reference another NPC/place (the named target exists).
- **Reactivity:** broken-door grumble fires; **repair event end-to-end** (worker walks → stages → door
  restored + persists); looted-home cold line; karma greet variants switch at thresholds.
- **Property schema:** every GH building has a valid `deed` block (gate-checkable).
- **No regression:** doors FROZEN untouched; interiors table still green; npm test + verify green; 0 errors.

### 5-MINUTE VAN-TEST (fresh load, F8 first)
1. Stand in the plaza at **morning** — NPCs are at posts/chores (keeper at counter, chopper at the woodpile).
2. **Talk to each named NPC** — distinct personality, a topic beyond "hello," at least one line about someone
   else in town. Re-talk → it doesn't just repeat.
3. Wait/advance to **evening** — NPCs have MOVED (shops emptying, tavern filling, residents home); a vacated
   home reads "nobody home."
4. **Break a home's door** → resident grumbles → the **repair worker arrives and fixes it over time**.
5. **Loot a private home** → that resident greets you coldly afterward.
6. Confirm it FEELS alive (presence, motion, woven references) — hand the feel-judgment to Van.

### OPEN DECISIONS (Van, please mark)
- **(A) Kids in towns?** y/n (adds texture + life, but more sprites/anims + a "can't harm kids" rule).
- **(B) Guards on alarm NOW or later?** slice = passive patrol/post only, OR also a basic "aggro on crime
  (theft/assault) → confront" beat this slice?
- **(C) Dialog UI style:** keep the current portrait box (greet + cycling topics), OR add a small **topic
  menu** (pick a subject) this slice?
- **(D) Chore-anim depth:** fetch the full ULPC tool set (chop/hoe/hammer/etc.) now, OR ship with the
  graceful-degrade idle-at-workstation and upgrade anims as a follow-up?
- **(E) Property purchase trigger:** per-town **quest-arc completion** (spec default), OR a flat gold price
  available once you can afford it?
- **(F) Repair worker:** a dedicated NPC, OR the nearest keeper/resident does it?

> On Van's approval + these answers, the build implements ALL of the above; the exhaustive table + VAN-TEST
> verify it; the player-pass (HARD RULE 12) precedes hand-off.
