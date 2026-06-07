# PETS — a Fable-style pet system (design capture, build LATER — do NOT build yet)

A collectible, characterful **and functional** pet layer for the whole game. Pets come
in *flavours* you'll want to collect (CUTE / COOL / UGLY / WEIRD-EXOTIC); each one **does
something useful** (Fable-style: a treasure-sniffer, a monster-scarer, a trickster…); and
— the clever bit — **the pet you carry changes how NPCs read you**, so it's a SOCIAL TOOL,
not just a follower. It threads into the existing [[social-system-design]] (CHA / trust /
deception via `Social.js`), the [[relationships-companions-design]] party/follow plumbing,
and the exploration **secrets** already live in Greenhollow.

DESIGN ONLY. All ids below are proposals (added to `src/constants/` at build time). This
**enriches but does not block** region builds — a region can later drop in a tame-able
creature or a pet-seller as pure data.

## 0. Goal (one line)
Make a pet a thing you *choose*: a personality at your heel, a practical tool in the
world, and a lens that bends how people perceive you — collect them, train them, swap them
to fit the job and the room.

## 0.1 What already exists (reuse, do NOT rebuild)
- **`Social.js`** — `resolve(check,ctx)` (cha/persuade/charm/intimidate/insight/trust),
  `chaBuyMult/chaSellMult`, `trust(karma)`, and (from companions) the planned
  `affinity(npcId,ctx)`. Pets hook these with ONE additive factor — see §3.
- **Companions** ([[relationships-companions-design]] Part B) — the planned `Party` state +
  `AllyController` (follow/formation, mirrors `EnemyController`). Pets reuse the follow
  plumbing — see §5.
- **Exploration secrets** — Greenhollow's findable chests (`WORLD.chests` + the scene's
  chest interactions). The treasure-sniffer pet points at these — see §2.
- **`EnemyController`** — `live`/`nearest`, aggro + telegraphs. The monster-scarer and
  scout pets hook these. **Loaded creature art** (`public/art/monsters/`: bat, slime,
  eyeball, big_worm, pumpking, ghost, snake, man_eater_flower) gives us ready WEIRD/EXOTIC
  pet bodies; CUTE mammals (cat/dog/rabbit) need art (flagged below).

---

## 1. VARIETY — flavours + ~12 example pets (each is DATA)
Every pet is a row in `src/data/pets.js`: `{ id, name, flavour, body(art), utility,
social:{charm,intimidate,curiosity,soft}, acquire, train }`. Flavour drives the social read
(§3); utility drives the world hook (§2).

| id | name | flavour | art | utility (see §2) | social read |
|----|------|---------|-----|------------------|-------------|
| `pet_pip` | Pip the pup | CUTE | ⚑ needs dog sprite | **treasure-sniffer** | soft/approachable |
| `pet_tuktuk` | Tuktuk the cat | CUTE | ⚑ needs cat sprite (LPC has cat *tail* parts only) | **trickster** (likeability) | charming |
| `pet_bramble` | Bramble the hare | CUTE | ⚑ needs hare sprite | **courage/luck buff** | harmless |
| `pet_ash` | Ash the wolf-pup | COOL | ⚑ needs wolf sprite | **monster-scarer** | intimidating |
| `pet_cinder` | Cinder the wisp | COOL | reuse `ghost.png` tinted ember | **lantern** (lights dark) + spark | mysterious |
| `pet_skybeak` | Skybeak the hawk | COOL | ⚑ needs bird sprite | **scout** (marks enemies) | commanding |
| `pet_wart` | Wart the toad | UGLY | reuse `man_eater_flower`/⚑ toad | **alchemy/poison-ward** | unsettling |
| `pet_scrum` | Scrum the bog-rat | UGLY | ⚑ needs rat sprite | **scavenger** (finds coin/junk) | shifty/distrusted |
| `pet_gloop` | Gloop the one-eyed slime | UGLY | reuse `slime.png` | **acid** (melts locks) + soaks a hit | gross-out |
| `pet_iris` | Iris the eye-familiar | WEIRD | reuse `eyeball.png` | **threat-sense** (amps enemy-intuition) | uncanny curiosity |
| `pet_gourdling` | the Gourdling | WEIRD | reuse `pumpking.png` small | **festival luck** + spooks the timid | curiosity |
| `pet_glimmer` | Glimmer the glow-grub | WEIRD | reuse `big_worm` tinted | **dowser** (digs buried caches) | exotic curiosity |
| `pet_flit` | Flit the bat | WEIRD | reuse `bat.png` | **cave-echo** (reveals cave secrets) | spooky |

> ⚑ ART FLAGS: the CUTE mammals (dog/cat/hare/wolf/bird/rat) need real sprites — the LPC
> library has cat **tail** body-parts (character accessories), not standalone animal
> sprites. WEIRD/EXOTIC/UGLY pets can ship NOW by reusing loaded monster art (recoloured/
> scaled). Build CUTE pets once animal art is sourced (OGA has CC-BY/CC0 LPC critter packs
> — licence-vet first per HARD RULE 3); omit + flag, never a colour-box.

---

## 2. UTILITY — each pet does something useful (Fable-style)
A pet has ONE primary `utility`; it ticks while the pet is the **active** pet (§5). Each is
a small hook into an existing system:

- **treasure-sniffer** (`pet_pip`, `pet_glimmer`, `pet_flit`) — points toward the nearest
  un-opened **secret** in range. Hook: read the scene's secret list (Greenhollow's
  `WORLD.chests`/chest interactions; generalised to a per-region `secrets` list) → emit a
  "warm/cold" ping or a paw-point arrow at the nearest unopened one. Directly rewards the
  exploration-secrets layer. Bond tiers (§4) widen the sniff radius.
- **monster-scarer** (`pet_ash`) — a fear aura: weak/`swarm` archetypes won't aggro (or
  flee) inside a radius. Hook: `EnemyController` — gate aggro for low-tier/`swarm` enemies
  when within the pet's scare radius (reuses the existing aggro check + the SAFE-ZONE idle
  path). Never affects bosses/brutes.
- **scout** (`pet_skybeak`, `pet_iris`) — marks nearby enemies / clarifies telegraphs. Hook:
  the **threat-indicator / ENEMY-INTUITION** layer already built — the pet flips
  `combat.indicators`/`intuition` on (a pet-granted version of the skill). `pet_iris`
  amplifies it (off-screen threat arrows).
- **trickster** (`pet_tuktuk`) — a "perform a trick" social action that nudges the room's
  read of you (a short-lived charm boost) + earns bond. Hook: §3 (a temporary `+charm`) and
  a deed `pet_trick_<npc>` some NPCs react to.
- **courage/luck buff** (`pet_bramble`) — a passive stat buff (e.g. +1 effective courage/STR
  for a fear or a check, or a small luck nudge on drops). Hook: a thin buff layer read by
  `Inventory.stats()` / check resolution (additive modifier, like equipment effects).
- **lantern** (`pet_cinder`) — lights dark interiors (caves/night). Hook: a light radius
  (needs the light system — ⚑ flag; ties to the existing lantern-oil item economy).
- **alchemy / poison-ward** (`pet_wart`) — periodic reagent drops / resist a poison tick.
- **scavenger** (`pet_scrum`) — slowly finds coin/junk while following (a trickle income,
  Economy).
- **acid** (`pet_gloop`) — opens a few locked caches (a soft key) + can soak one hit.
- **festival/cave utilities** (`pet_gourdling`, `pet_flit`) — situational region hooks.

Utilities are deliberately small + independent, so they land one at a time and never
gate a region.

---

## 3. SOCIAL / PERCEPTION — the carried pet bends how NPCs read you (the clever bit)
This is the part that ties pets into the **social system**. Each pet carries a social
profile; the **active** pet contributes ONE additive factor to the existing `Social`
functions — no rewrite, exactly the pattern `affinity`/`trust` already use.

```
pet.social = { charm: 0..3, intimidate: 0..3, curiosity: 0..2, soft: bool }
```

- **ctx gains `pet`** — the dialogue/shop ctx (already `{inv, karma}`, gaining `affinity`)
  also carries the active pet's profile. All hooks read `ctx.pet`.
- **`Social.petBonus(check, ctx)`** (new, tiny) returns a small signed nudge for a check:
  charm/persuade → `+pet.charm`; intimidate → `+pet.intimidate`. Fold it into `resolve()`
  as ONE added term: `effectiveCha = cha(ctx) + petBonus(check, ctx)`. A fluffy CUTE pet
  makes a charm check easier; a fearsome COOL/UGLY beast makes an intimidate check easier.
- **Prices** — fold a `petCharmMult(ctx)` into `chaBuyMult/chaSellMult` (one more clamped
  factor, like the planned `affinityMult`): a charming pet softens some merchants.
- **Per-NPC reactions** (`PET_REACT` data table) — some NPCs *love* a flavour, some *fear*
  it: children + soft-hearted NPCs warm to CUTE (`soft`) and recoil from a `beast`; a
  collector/mage opens a unique **`[Curiosity]`** branch only when you carry a WEIRD pet; a
  guard is more cowed when you carry a wolf. Modelled as an affinity nudge + a dialogue
  `show(ctx)` predicate `pet:{flavour}` (additive, same shape as the `trust`/`affinity`
  gates). Carrying the wrong pet into the wrong room has a cost — that's the depth.
- **A new check type** `'curiosity'` (joins cha/insight/trust) gates exotic-pet dialogue:
  `state()` returns `hidden` unless `ctx.pet` matches — i.e. the option only appears when
  the right creature is at your heel. Reuses the existing `state()`/`tag()` machinery (a
  `[Curiosity]` bracket tag).

**Layering:** all of the above is additive to `Social.js` — one `petBonus`, one price
factor, one `PET_REACT` table, one `pet`/`curiosity` predicate. The CHA/trust/insight/
affinity logic is untouched. Pets become a knob on the *same* social system.

---

## 4. ACQUISITION + TRAINING (variety of paths — Fable's find-and-train feel)
Four acquire sources (a pet's `acquire` field picks one), so collecting feels varied:
1. **Bought** — a **menagerie / pet-seller** stall (Economy `buy`, gold). CUTE pets +
   starters. Reuses shop plumbing; the pet is the "item" granted.
2. **Tamed in the wild** — a **taming interaction** on a wild creature: approach calmly,
   offer food/soothe, pass an **animal-handling** check (a `Social.resolve` check —
   `{type:'tame', dc}` keyed off a new `animal_handling` skill + CHA + patience; fail =
   it bolts, retry later). Tame-able creatures are placed as data per region (an exotic
   marsh thing, a peaks raptor). This is how WEIRD/UGLY beasts (reusing monster art) enter.
3. **Quest-won** — a pet as a quest reward (deed-gated, e.g. `tamed_orchard_stray`); ties a
   creature to a story beat.
4. **Raised from a stray** — adopt a **stray** (a Greenhollow stray pup by the tavern): low
   utility at first, grows with training. The most Fable-ish path.

**Training loop (light):** a pet has a **bond** that grows from use, feeding, and tricks
(`bond` = mostly derived from deeds like `fed_<pet>`/`pet_trick_*` + a small stored counter,
mirroring the trust/affinity "derived, not a new axis" rule). Bond **tiers** unlock: a wider
sniff/scare radius, more tricks (→ bigger charm), a second utility at max bond. No deep sim
— a few tiers, surfaced on a simple pet panel.

---

## 5. RELATION TO COMPANIONS (pets = LIGHT companions; share plumbing, don't conflict)
Pets and [[relationships-companions-design]] **share the follow/party plumbing but occupy a
separate slot**, so they enrich without competing:
- **Shared code** — pets reuse `AllyController`'s **follow/formation** rendering (a Character/
  sprite that lag-follows the player) and the party **serialize/hydrate** block. A pet runs
  a `petBehaviour` on that controller: **follow + tick its utility**, with **no combat
  targeting** (the controller's enemy-targeting is simply disabled for pets — the same
  controller, a flag). The combat-utility pets (scarer/scout) act via their hooks (§2), not
  by swinging a weapon.
- **Separate slot** — one **active PET** slot, distinct from the ally **party** slots. A pet
  never takes a companion's seat, so "a dog + two human allies" is fine. The pet panel +
  swap is its own light UI.
- **No conflict** — companions are the BIG combat/party build; pets are a light follower +
  social/utility layer on the *same* follow code. If companions land first, pets are a thin
  addition; if pets land first (social-only, no follow), companions add the follow rendering
  pets then borrow. Either order works.

---

## 6. BUILD PLAN (medium build; phased; non-blocking)
Best done **alongside or just after companions** (to share follow/party plumbing). The
social-perception hooks are **small and can land early** (data + `Social.petBonus`), even
before any follow code.

1. **Pet data + SOCIAL hook (small, early)** — `src/data/pets.js` (the table in §1) +
   `Social.petBonus` + `petCharmMult` + the `PET_REACT` table + the `curiosity`/`pet`
   predicate. Unit-test like `Social.test.js` (a charm check eases with a cute pet; a
   `[Curiosity]` option shows only with the right pet; prices nudge). **No follow needed** —
   the pet can be an inventory-held profile at this stage.
2. **Active-pet slot + follow rendering** — reuse `AllyController` follow (after companions'
   controller exists) to put the pet at your heel. Save block (bump `SAVE_VERSION`, follow
   the Save-Versioning rule).
3. **Utility hooks (one at a time)** — treasure-sniffer (→ region secrets), monster-scarer
   (→ `EnemyController` aggro gate), scout (→ the threat-indicator layer), then the rest.
   Each is small + independently shippable.
4. **Acquisition + training** — the pet-seller (Economy), the taming check (`animal_handling`
   skill), quest-reward grants, the stray; the bond/tier loop + pet panel.
5. **Content** — place a tame-able creature + a pet to find/buy per region as data.

### Dependencies
`Social.js` (exists) · Karma deeds (exists) · `AllyController`/party (companions — to build)
· `EnemyController` (exists) · region **secrets** list (exists in Greenhollow; generalise) ·
threat-indicator/ENEMY-INTUITION (exists) · CUTE-animal art (⚑ to source + licence-vet).

### Proposed new ids (DESIGN-ONLY — add to `src/constants/` at build time)
- pets: `pet_pip`, `pet_tuktuk`, `pet_bramble`, `pet_ash`, `pet_cinder`, `pet_skybeak`,
  `pet_wart`, `pet_scrum`, `pet_gloop`, `pet_iris`, `pet_gourdling`, `pet_glimmer`, `pet_flit`
- deeds: `tamed_<id>`, `fed_<id>`, `pet_bonded_<id>`, `pet_trick_<npc>`, `adopted_stray`
- skill: `animal_handling` (taming) · check types: `tame`, `curiosity` · save: a `pet` slot

> Note: pets ENRICH the social + exploration + (eventual) companion layers but block
> NOTHING. Regions can ship without pets and gain a tame-able creature or a pet-seller as a
> later data pass. Build after the world is playable and (ideally) after companions' follow
> plumbing exists.
