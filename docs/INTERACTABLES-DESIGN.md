# INTERACTABLE WORLD OBJECTS (design capture, build LATER)

A write-once, DATA-driven interactable-object layer (Zelda/OoT-grade: cut/lift/throw bushes,
smash jars & pots, breakable/bombable walls, pushable blocks, tool-gated access) so every region
**places interactables as DATA** — never a per-region fork. This is the "playground" layer that
makes maps fun to explore — peer to the Monsters and Quest data systems.

**CAPTURE ONLY — no engine/scene/quest/SSOT code this session.** Enriches but does NOT block region
builds. Reuses the existing engines; all proposed ids are LISTED, not added (so `npm run verify`
stays green).

---

## 0. AUDIT — what actually exists today (read the code, don't assume)
- **Interaction system** (`src/systems/Interaction.js`) — the ONLY world-object mechanic that
  exists: `register({x, y, radius, requireFacing, prompt, onInteract})` → "face + press E → action,"
  forgiving radius (`INTERACTION_RADIUS = 40`). Used for **NPCs** and the **Greenhollow secret
  chests** — that's it. There is **no** break / cut / lift / throw / push / bomb of any kind.
- **Props** (`RegionScene._buildProps`) — static sprites, optionally `solid` (footprint →
  `Collision.makeSolid`) + depth-sorted. Inert; nothing reacts to being hit.
- **Tools are DEED-FLAGS, gated at the QUEST level** — canonical `TOOLS` are exactly
  **`tool_firefrost`, `tool_grapple`, `tool_hookshot`, `tool_lantern`** (`src/constants/flags.js`).
  Access is gated in quest DATA via `requires:{ deeds:['tool_grapple'] }` (e.g. spire.js needs all
  four; SE3 needs firefrost; SA3 needs lantern). **These are abstract gates, not physical objects** —
  there is no in-world grapple point / hookshot anchor you target; the quest simply checks you own
  the tool deed.
  - ⚠ **Correction to the brief:** **`tool_dash` does NOT exist** as a canonical tool. The dash that
    exists is the **dodge-roll** (`PlayerCombat` i-frames), a combat move, not a traversal tool flag.
    If dash-gaps become a thing, `tool_dash` is a PROPOSED new id (§8).
- **Foundations we can REUSE (the good news):**
  - `Character.action('pickup' | 'attack' | 'cast' | 'use')` — a one-shot action animation hook
    already exists (so "lift" / "cut" have an anim peg).
  - **Player attack** already sweeps an arc hitbox against enemies (`EnemyController` / the player
    swing) — the same pattern extends to "the swing also hits cuttable/breakable objects."
  - **`EnemyController` already has a projectile system** (`this.projectiles` + `_stepProjectiles`
    for ranged enemies) — a reusable seed for **thrown-object** travel + collision.
  - **Economy** grants loot via `inv.add(item)` / `inv.addGold(n)` directly (the chest does this).
    There is **no generic loot-drop helper** yet (drops are ad-hoc) — a small `dropLoot(table)` is a
    clean shared addition.
  - **Deed/flag memory** (Karma) is the natural store for "this wall is bombed / this block solved."
- **Net:** every interaction below is NEW, but most sit on existing seams (Interaction, attack-arc,
  projectiles, deed memory, `inv.add`). The honest split is in §4.

---

## 1. THE REUSABLE INTERACTABLE CONCEPT (one system, all DATA)
An interactable is a prop placement with an `interact` block — the region author just drops it in
the `props`/`interactables` data, exactly like an enemy encounter:
```
{ key: 'prop_pot', tx: 14, ty: 9,
  interact: {
    via:   'smash',                 // cut | lift | throw | break | smash | push | bomb
    tool:  null,                    // null = a basic action (sword-swing / lift); else a tool deed id
    hp:    1,                       // hits to break (for break/smash/cut)
    result: [                       // ordered effects on success
      { type: 'loot',   table: 'pot_common' },        // -> dropLoot() -> inv.add / addGold
      { type: 'flag',   deed: 'pot_smashed_shrine_3' },// -> Karma.recordDeed (secret-gating)
      { type: 'reveal', target: 'door_north' },        // remove a solid blocker / open a path
      { type: 'damage', amount: 6, radius: 28 },        // (thrown objects) hit enemies
      { type: 'puzzle', set: 'block_a_on_switch' },     // puzzle state -> flag
    ],
    respawn: true,                  // grass/bushes regrow; walls/chests don't
    fx: 'shatter',                  // a small break FX + sfx (juice)
  } }
```
- **interaction type(s)** = `via` (one or several). **trigger** = a basic action (sword-cut, lift,
  push) OR a `tool` deed (`tool_bomb`, `tool_hookshot`…). **result** = a list reusing systems that
  already exist (loot/economy, deed memory, reveal-a-blocker, damage-an-enemy, puzzle-flag).
- One `InteractableController` (mirrors `EnemyController`): builds the sprites + footprints, and on
  the relevant trigger (a swing arc / a press / a thrown impact / a push) runs the `result` list.
  Regions only ever supply DATA.

---

## 2. THE OBJECT CATALOGUE (concrete)
| Object | `via` | Trigger | Typical result |
|---|---|---|---|
| **Cuttable bush / tall grass** | `cut` | sword swing (arc) | drop minor loot (chance) / **reveal a hidden path or item** / flag; respawns |
| **Breakable crate / barrel** | `break` | swing or lift→drop | drop loot (`dropLoot`); no respawn |
| **Smashable jar / pot** | `smash` | swing, or **throw** & shatter | loot / reveal a switch / flag |
| **Liftable + throwable jar / pot / rock** | `lift`,`throw` | lift (press), carry, **throw** (arc) | thrown = projectile → **collision + damage** to enemies / shatter on walls / hit a far switch |
| **Bombable cracked wall** | `bomb` | a bomb item / `tool_bomb` placed adjacent | **remove the solid → reveal a secret room/chest/path** (the classic) + permanent flag |
| **Pushable block** | `push` | walk into it | slides one tile if clear; **on a switch → puzzle flag**; gates a door |
| **Tool-gated access object** | (tool) | stand + `use` with the tool | **grapple point** (pull across), **hookshot anchor** (zip to), **dash-gap** (cross) — physical versions of today's abstract quest gates |

Notes: cuttable bushes/grass and pots are the cheap, high-frequency "playground" filler (every
region); bombable walls + tool-gated objects are the **secret/traversal** unlockers; pushables are
**dungeon-puzzle** furniture (Sunken Shrine, Cinder Keep); lift-throw is the expensive, high-skill verb.

---

## 3. WIRE-INTO NOTES (existing vs genuinely new)
- **Loot / economy** — reuse `inv.add(item)` / `inv.addGold(n)`; ADD a small shared
  `dropLoot(table, inv)` (a weighted table → grants) reused by breakables AND enemy drops. *(small new helper)*
- **Combat / PlayerCombat** — the **sword-cut / break** reuse the existing **attack-arc** (the swing
  already tests a facing cone vs enemies; extend it to also test the cuttable/breakable list). *(additive)*
- **Thrown-object damage** — reuse `EnemyController`'s **projectile** plumbing (generalise
  `projectiles`/`_stepProjectiles` to player-thrown objects → `Monster.hit`/`EnemyController.hit`). *(reuse)*
- **Secret-gating** — reuse the **deed/flag memory**: a bombed wall / smashed pot / solved block
  records a deed; the revealed chest/room is a normal Interaction. **Secrets behind breakables fold
  straight into Spatial-DoD Gate J.** *(free)*
- **Tool flags** — physical tool-gated objects read the **existing tool deeds** (`tool_grapple`/
  `tool_hookshot`); only the **traversal MOVE** (zip / pull / cross) is new. *(gate free; move new)*
- **Genuinely new** — the carry/throw state, thrown-projectile spawn from the player, pushable-block
  grid movement, and the `InteractableController` itself.

---

## 4. HONEST ENGINE SPLIT (the important part — same discipline as Part 2.6 F/G/H)
Tagged **FREE NOW** (data + a small additive rule on the current engine) vs **NEEDS ENGINE FEATURE
FIRST** (don't over-promise physics/renderer), with a build-effort tier (small / medium / large).

### FREE NOW (data + small additive rule)
| Interaction | Effort | What it needs (one line) |
|---|---|---|
| **Bombable / breakable WALL → reveal** | **small** | an interactable + `tool_bomb`/bomb-item check + remove solid + record flag + spawn the revealed chest/path. Pure Interaction + deed memory. |
| **Cuttable bush / grass (hide item/path)** | **small–med** | the player attack-arc also tests a `cuttables` list (like it tests enemies) → remove + optional `dropLoot` + reveal; respawn timer. |
| **Breakable crate / pot (loot, no lift)** | **small–med** | same attack-arc-hits-object path + `dropLoot`. |
| **Tool-gated ACCESS object (grapple/hookshot/dash point)** | **medium** | Interaction + tool-deed check; the GATE is free, the **traversal move** (zip/pull/cross = a scripted player tween to an anchor) is the new bit. |
| **`dropLoot(table)` helper + a few loot tables** | **small** | a weighted-roll helper over `inv.add`; reused by breakables + enemies. |

### NEEDS ENGINE FEATURE FIRST
| Interaction | Effort | Engine prerequisite (RegionScene / PlayerCombat) |
|---|---|---|
| **Lift-and-CARRY** | **medium** | a **carry state** on the player (object pinned above-head, follows movement, blocks attack while carried) + a `pickup`→`carry` anim flow. New player state. |
| **THROW (arc + collision + break/damage)** | **medium–large** | a **thrown-object projectile** (arc via velocity+gravity or a parabolic tween) that collides with solids (shatter) + enemies (`EnemyController.hit`). *Can reuse the enemy projectile system* — that lowers it from "large." |
| **Pushable BLOCK (puzzle grid)** | **medium** | a **grid-snapped pushable entity**: walk-into-it → slide one tile if the next tile is clear of solids/blocks; switch-tile detection → puzzle flag. New per-tile collision + state. |
| **(stretch) multi-block / weight puzzles** | **large** | the above + multi-entity interaction + reset logic. |

> Discipline: a missing physics feature is FLAGGED, never faked. Build the FREE column first; it
> already delivers ~70% of the "fun to explore" feel (cut grass, smash pots, bomb walls, grapple
> across) without any new physics.

---

## 5. QUALITY-GATE HOOK (fold into the Part 2.6 Spatial / World-Cohesion DoD)
Propose a new gate so the playground is judged, not optional:

**Gate K — INTERACTABLE PLAYGROUND.** *Rule:* each region uses **≥ 3 interactable kinds** and
**≥ 1 secret is gated behind a breakable/cuttable/bombable** (which **counts toward Gate J's
secret minimum**). *Why:* an inert map is a museum; reacting objects are what make exploring feel
alive. *Check:*
- **[OBJECTIVE] (→ verify.mjs):** from the region's interactable DATA — distinct `via` kinds used
  ≥ 3; at least one `result` of `via ∈ {cut,break,smash,bomb}` yields a `reveal`/secret (counts in
  Gate J's ≥3). 
- **[EYE]:** do the interactions have **juice** — a satisfying cut/shatter (FX + sfx), a readable
  "this is breakable" silhouette, a rewarding reveal? (Same HARD-RULE-9 shape: [OBJECTIVE] with
  proof, [EYE] to Van.)

(Described as a PROPOSED verify.mjs check; not implemented this session.)

---

## 6. BUILD ORDER (after the engines/regions are stable; does NOT block region builds)
1. **`InteractableController` + the FREE-NOW set** — bombable walls, cuttable bushes/grass,
   breakable crates/pots, `dropLoot`, and **physical tool-gated access** (grapple/hookshot points).
   High value, all reuse existing systems. Unit-test the result-resolver like `Social.test.js`.
2. **Pushable blocks (medium)** — for dungeon puzzles (Sunken Shrine, Cinder Keep).
3. **Lift-and-throw (medium–large)** — DEFER until a set-piece genuinely needs it.

**Region set-piece dependencies (flagged so a region build knows its prerequisite):**
- **Sundered Peaks** — grapple-points / **dash-gaps** want **physical tool-gated access** (free-now
  medium); `tool_dash` is a PROPOSED id if dash-gaps ship.
- **Tidewreck Coast** — **hookshot anchors** want physical tool-gated access (free-now medium); the
  underwater set-piece is a *separate* engine flag (Part 2.6 H), not an interactable.
- **Dungeon puzzles (Shrine / Keep)** — if they want **pushable blocks** or **throw-a-pot-at-a-switch**,
  those are the NEEDS-ENGINE items → build those FIRST or design the puzzle around free-now verbs
  (bomb/cut/grapple) instead.
- **Any region** — bombable-wall secret rooms + cuttable-bush caches are free-now and should seed
  every region's Gate J secrets.

---

## 7. ASSET NOTE (per the binding asset policy — free first, flag don't source)
Build with **what's free** (OGA / LPC / CC0) first; only buy after the game works + feels right +
free falls short + a licence/anti-AI check (Mana Seed banned). Art each object needs:
- **Bush / tall-grass** (+ a cut/poof frame) — LPC/OGA almost certainly covers this (the ElizaWy
  LPC terrain set already has plants); a cut FX can be a few leaf particles.
- **Pot / jar / crate / barrel** (+ a 2–4-frame **shatter**) — common in LPC object packs; *barrel
  already loaded* (`public/art/structures/barrel.png`); a pot/crate sprite + break frames likely free.
- **Cracked / bombable wall** — a wall tile with a crack overlay + a rubble frame; free in LPC dungeon
  tilesets, or composable from the structure kit.
- **Pushable block** — a stone block sprite; free in LPC dungeon sets.
- **Bomb item + blast FX** — a small consumable sprite + a puff (a few frames or a simple FX).
- All **FLAGGED, not sourced** here; licence + anti-AI check at pull time; OMIT + FLAG if free
  genuinely falls short.

---

## 8. PROPOSED SSOT IDS (LIST ONLY — do NOT add to `src/constants/` this session)
- **tools (new):** `tool_bomb` (or a `bomb` consumable item instead of a tool flag — decide at build),
  `tool_dash` (only if dash-gaps ship; today's dash is the dodge-roll, not a tool).
- **items:** `bomb` (consumable), plus any loot-table items (`pot_coin`, `grass_seed`, …).
- **deeds/flags (per-secret or generic):** `wall_bombed_*`, `bush_cut_*`, `crate_smashed_*`,
  `pot_smashed_*`, `block_solved_*` (one per meaningful placement, or a generic counter) — these
  gate the revealed secrets via the existing deed memory.
- **anim:** a `carry` player state + a `throw` action (extend `Character.action`).

> Cross-ref: the **Part 2.6 Spatial / World-Cohesion DoD** (Gate K above) and the binding ASSET
> POLICY there. This doc is the canonical home for the interactable system spec (peer to Monsters /
> Quests); it stays out of `SYSTEMS-DESIGN-V2.md` to keep that doc's scope clean.
