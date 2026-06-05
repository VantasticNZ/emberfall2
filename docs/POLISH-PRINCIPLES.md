# EMBERFALL — POLISH PRINCIPLES (the details that make a game feel REAL)

> Van's playtest surfaced a class of issues that all come down to "the world must feel solid,
> readable, and intentional." These principles, applied everywhere, are what separate a prototype
> from a real game. Decide once, apply to every scene.

## 1. THE CAMERA & THE PLAYER ARE NEVER WRONG
- The player must NEVER go off-screen / behind the UI / into the black letterbox. The camera
  follows the player and is CLAMPED to the map bounds, but the player is always fully visible.
- If the player is near a map edge, the camera stops at the map edge and the player walks toward
  the edge ON-screen (camera deadzone), never scrolling the player off.
- The black bars on the left in Van's screenshots = camera not filling the view / map smaller
  than viewport / player pushed to edge. Fix: proper camera bounds + follow + a map that fills
  or exceeds the viewport.

## 2. THE WORLD HAS HONEST EDGES (no invisible walls mid-open-space)
- Where the player CAN'T go, it must LOOK like they can't go: a natural barrier - dense forest,
  cliff, water, fence, wall, rocks. Never a sudden invisible stop in open grass (Van: "looks like
  we could walk across but just can't").
- Two valid approaches (pick per area):
  a) BOUNDED AREA: ring the playable space with a believable barrier (treeline/cliffs/water) so
     the edge reads as "the edge of this place."
  b) SEE-BEYOND: show map you can't reach yet (distant terrain, a path that continues) so the
     world feels bigger - SNES-Zelda / Adventure-Time style. Block it with a gated obstacle, not
     an invisible wall.
- Either way: the collision boundary must MATCH a visual that explains it. Edge of collision ==
  edge of something you can see.

## 3. ENTRANCES & INTERACTIVES ARE FULLY APPROACHABLE
- If a door/cave/object is enterable, the player must be able to walk right up to it cleanly -
  no collider overlapping the approach (Van: chapel pond blocks part of the door).
- Props (ponds, rocks) must not be placed where they block a needed path/entrance. Audit
  placement: nothing decorative blocks a functional approach.
- The interact/enter trigger zone should be generous + obvious.

## 4. LABELS: PRINTED, NOT FLOATING
- Names on BIG buildings can be "printed" on the building (looks like signage) - OK.
- Small things (cave, a pond, the hen, "OUTSKIRTS") should NOT have text floating in space - it
  looks unfinished. Instead: a physical SIGN POST object, or show the name only on approach/
  interact (a small label that appears when you're near + fades), or a location banner for AREAS
  (the "GREENHOLLOW" banner style is good - use that pattern for area names, not floating tags).
- Principle: text in the world must look INTENTIONAL - on a sign, on a building, or in UI - never
  floating mid-air over grass.

## 5. THE PLAYER SPRITE IS CLEAN
- No rendering artifacts on the character (Van: "a gap/line in the side of my face"). The LPC
  head/face composite must be seamless - no transparent seam, no misaligned layer edge. Audit the
  composited sprite for clean edges in all directions/frames.

## 6. UI/HUD REFLECTS WHAT YOU ACTUALLY HAVE
- Don't show abilities/items the player hasn't unlocked. Bombs should NOT appear in the HUD until
  the player has the bomb ability (adult, earned). Hearts/coins are fine (always relevant).
- The HUD should grow as the player grows (earned tools appear when earned) - reinforces
  progression + avoids confusion.

## 7. BUILDINGS READ AS REAL (not blank/dark holes)
- Building doorways shouldn't be flat black voids - a hint of interior/darkness with some depth,
  or a proper door sprite. The buildings looking "blank/dark" = the doorway is an empty black
  rectangle. Give doors a door sprite or a subtle interior-shadow so they read as buildings, not
  cutouts.

## 8. EVERYTHING IS DELIBERATE
The meta-principle: every tile, collider, label, and prop should look INTENTIONAL. If something
makes the player think "that looks unfinished / why can't I / that's floating / that's a black
hole" - it breaks immersion. Audit each scene against: camera clamps, honest edges, approachable
entrances, printed labels, clean sprites, honest HUD, real buildings.

## 9. (RELATED) READABILITY & FEEDBACK
- The player should always understand: where they are, where they can go, what they can interact
  with, what they have. Telegraph interactables (a glint, a prompt on approach). Give feedback on
  every action (sound + visual). Silence/ambiguity = feels broken.

## APPLYING THIS
These become a standing CHECKLIST for every scene/area built from here: 
[ ] camera clamped, player never off-screen
[ ] edges are visible barriers or see-beyond-gated (no invisible walls in open space)
[ ] entrances fully approachable (no prop blocking)
[ ] labels printed/sign/on-approach, never floating
[ ] player sprite clean (no seams)
[ ] HUD shows only unlocked things
[ ] buildings read as real (doors not black voids)
[ ] every element looks intentional

---
# ADDENDUM — SYSTEMIC RULES (batch these; each kills a whole class of bugs)

## 10. DEPTH SORTING & COLLISION ACCURACY (one system, many symptoms)
Symptoms this fixes: player appearing BEHIND flat ground tiles (dirt), walking THROUGH things
that should block (logs, stray fence/bush), being unable to reach things you visibly should
(coin by lake, chapel door), sudden stops.
- DEPTH: ground/floor tiles must ALWAYS render below the player. Only true overlap objects
  (tree canopy, tall things the player walks behind) sort by y. A flat dirt patch is GROUND - it
  must never draw over the player. Audit the depth/z system: floor < player; only tall props
  y-sort.
- COLLISION == VISUAL: a thing that looks solid (log) should block; a thing that looks passable
  (open grass, a coin) must be reachable. Every collider matches its sprite's solid footprint -
  not bigger (unreachable coins/doors), not smaller (walk through logs). Audit all colliders vs
  their art.
- ACCESSIBILITY RULE: anything the player must collect/reach (coins, items, doors, pickups) MUST
  have a clear, walkable approach. No pickup sitting inside/behind a collider. Pickups get a
  generous pickup radius.

## 11. OBJECT PERMANENCE / STATE (things remember what you did)
- CHESTS: every chest is interactable. States: CLOSED (openable -> gives loot -> becomes OPEN and
  STAYS open/looted, persists), LOCKED (says "locked", openable later with a key). No inert chests.
- LOOTED/OPENED state persists in save (a chest you opened stays open on return).
- Picked-up world items don't respawn (unlike breakables). Puzzle/quest object state persists.

## 12. EVERY NPC RESPONDS (no silent people)
- Talking to ANY NPC always produces a response - even a throwaway: "...", "Go away, kid.",
  "Sorry, busy.", a one-liner. No NPC is ever silent/non-interactive. Named NPCs get real lines;
  ambient NPCs get characterful one-liners (a small pool, tone-appropriate).
- Talk OVER COUNTERS/obstacles where sensible (shopkeeper behind a stall): the interact range +
  facing should let you talk across a counter, not require standing on them.
- If an NPC gives an item, the item must ACTUALLY be granted (Van: someone offers a sprig but
  nothing is received) - wire give-item to the inventory + a confirook ("Got: Herb Sprig").

## 13. EVERYTHING HAS A DIEGETIC REASON
- No arbitrary blocks. If an area is closed, there's an in-world reason shown: a BARRICADE
  ("closed - bandits on the road"), rubble, a guard, a locked gate, a story gate. The boarded
  cave is good (it has a sign + reason). Apply everywhere: every gate/closure has a visible cause
  + ideally a line of text explaining it.
- The world should always answer "why can't I go there?" with something the player can see/read.

## 14. KARMA IS VISIBLE & CONSEQUENTIAL (the two-axis system, surfaced)
- When the player does a notably good/bad/pure/corrupt act, ACKNOWLEDGE it in the moment - a
  small floating note / line ("That wasn't kind." / a subtle cue) so the player feels it landed.
- The two axes (Morality Cruel<->Kind, Purity Corrupt<->Pure) are shown as TWO BARS/SPECTRUMS in
  the Status menu - revealed/explained the first time someone in-world talks to you about morality
  (diegetic reveal), then always visible in STATUS.
- NPCs TREAT YOU by your standing: greetings, tone, service, and who'll talk to you shift by tier.
- QUESTS open/close by current status AND past actions (the childhood choices + running karma):
  some quests require Kind/Pure or Cruel/Corrupt; some NPCs remember a specific past deed.
- This is the game's signature system - make it legible and reactive.

## APPLYING (batched sessions, each a whole system)
- Session A: DEPTH + COLLISION + ACCESSIBILITY audit (#10) - kills the behind-tiles/through-logs/
  unreachable-coin/stray-fence/stop class at once.
- Session B: INTERACTION pass (#11 chests + #12 NPCs respond/counters/give-item) - kills silent
  NPCs, dead chests, missing item-grants.
- Session C: KARMA surfaced (#14) + diegetic closures (#13).
Each batched by system = far fewer sessions than fixing symptoms one by one.

---
# ADDENDUM 2 — MORE PLAYTEST RULES (from the shrine/lantern playtest)

## 15. UI TEXT NEVER COLLIDES WITH HUD/LABELS
- Dialogue/notification text must NOT overlap the hearts, coin/HUD, or world labels ("HOME").
  Position the dialogue box in a clear zone (a proper bottom dialogue bar, or a panel that avoids
  the top-left HUD + centre labels). Audit: no text-over-text, no text-over-HUD, ever.
- The dialogue box should be a consistent, framed UI element in a fixed safe area - not free text
  floating across the scene.

## 16. QUEST ACCEPT / REJECT
- SIDE quests offer ACCEPT / DECLINE (a choice when given). Declined side quests can be re-offered
  later (the NPC remembers). MAIN-story quests may be non-optional (or "not yet" rather than hard-
  decline) - but even those should be presented as a choice the player consciously takes where it
  fits the story.
- Accepting/declining is a small choice-menu interaction (we have the system).

## 17. ITEMS, INVENTORY & PICKUPS (the item system, fuller)
- GIVEN ITEMS appear in inventory/key-items immediately with a confirmation. 
- ITEM TYPES: QUEST/KEY items (can't be sold/dropped/traded - flagged keyItem:true); CONSUMABLES
  (apples/food/potions - usable, e.g. apple = +small health); GEAR (weapons/armour/shields -
  equippable); CURRENCY (coins); MATERIALS (sellable/tradeable). Data-driven item defs with a
  `kind` field.
- WORLD PICKUPS: some items pickupable in the world (apples, herbs, food) - e.g. apple = +1 health
  (don't exceed max). Pickups have a forgiving radius (per #10). Consumables go to inventory or
  heal on pickup (decide per item; food-on-pickup-heals is a nice simple start).
- The economy (shops buy/sell) reads item `kind` (can't sell key items).

## 18. ITEM-GET FEEDBACK (the "hold it aloft" moment)
- When the player receives a notable item (a tool, a weapon, a key item), play a clear GET
  animation: the hero holds the item ALOFT above their head (classic Zelda item-get pose) with a
  little jingle + the item name ("You got the Old Lantern!"). Small pickups (coins) just chime.
- This makes earning things feel rewarding + readable (depth/excitement: reward feedback).

## 19. AGE-APPROPRIATE ATTACK (child)
- The CHILD has no weapon, but the attack button should do a harmless CHILDISH action - a little
  kick or shove/hit (no damage or tiny), not nothing and not a weapon. It reads as "a kid roughhousing."
- Progression: child kick/shove -> earn stick (light) -> wooden sword -> steel -> etc. The attack
  evolves with the weapon (per the equipment system).

## 20. FULL EQUIPMENT ARC (confirm the data-driven system supports all of it)
- The equipment system must support, as data entries over time: STICK, WOODEN/IRON/STEEL/special
  SWORDS, BOW (ranged - also a gating tool), MAGIC (elemental - fire/frost, gating), SHIELD
  (block/deflect), ARMOUR (clothes->leather->mail->special, shows on the character + defense).
- Each is a data entry; combat reads the equipped weapon's type (melee/ranged/magic); the
  paper-doll shows equipped gear on the hero (LPC layers). Confirm the system is built so these
  "just slot in" as content, not new systems each time.
