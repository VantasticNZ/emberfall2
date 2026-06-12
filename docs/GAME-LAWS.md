# GAME LAWS — the rules that bind ALL content (current and future)

> These are **hard invariants**, not guidelines. Every character, dialog, interior, story beat, and overlay
> in Emberfall obeys them. Most are **gate-enforced** (`scripts/verify.mjs`) so a violation turns the build
> RED; the rest are eyes-on per HARD RULE 9/11. When you author content, author it to these.

---

## L1 — CHARACTER COMPOSITION (complete + matched)
Every character, **any age**, renders a **complete matched set**: a body + a head, hair, and clothing — all
present, all sized to that body type.
- A **child** body wears **child-fitted** layers only. No adult parts on a child frame; no bare/half-dressed
  child. (Child clothing didn't exist in the ElizaWy set, so we composite a child-fitted romper onto the bare
  child body — `scripts/clothe_child.py` → `child_body_*_{blue,green,rust}`.)
- No **cross-body-type** parts (e.g. an adult `shirt_blue` on a `child_body`, or `child_head` on `body_ivory`).
- **GATE: `composition-complete`** — validates every placed character's part set + the player presets
  (`HERO_CHILD`/`HERO`): a body + head present, no bare child body, no cross-body-type parts.

## L2 — PRESENCE (no disembodied speakers)
An NPC may only speak in a dialog if they are **physically present** — same area, within talk range. No line
fires from an absent character.
- A quest dialog's **opening** is spoken by its **giver** (already gated: `quest-opener-is-giver`).
- A dialog that hands off to **another** speaker must do so by sending the player TO that NPC (a new
  conversation with the present NPC), not by voicing the absent one in the giver's box.
- **GATE: `dialog-speaker-present`** — every quest dialog node's named speaker must be a giver OR placed in
  the same region as the giver (or be narration). Catches "Bram speaks while you're in Mara's cottage".

## L3 — SPATIAL CONTINUITY (exit at the door)
Exiting any interior places the player at **that building's exterior door tile** — never mid-area, never the
boot spawn. Enforced by the frozen return-path system: entry pushes the door's yard tile; `back` pops to it.
- A NEW interior must be entered FROM a building door (or, for a boot-into-interior like the cottage, the boot
  must set the return-point to that building's door tile — `mara_cottage` does).
- **GATE: `doorway-geometry`** (existing) — every interior has a `back` exit + a real floor; door targets
  resolve. Eyes-on the exit landing per interior.

## L4 — CRITICAL BEATS (block until done)
A mandatory story beat blocks progression until it's completed — **diegetically** where possible ("Mara is
calling you").
- **Schema:** a quest step may declare `blocking: true` (+ optional `blocker: 'exit'`). While that step is the
  active step, the named blocker (e.g. the interior exit) is refused with a diegetic banner.
- The opening's first beat (talk to Mara) blocks the cottage door until you've spoken with her.
- **GATE: `blocking-beats-block`** — a step flagged `blocking` is honoured by the scene (the blocker check
  exists); eyes-on that the door actually stays shut.

## L5 — PANELS / OVERLAYS (balanced, on-screen, any viewport)
Every HUD panel, dialog box, **cutscene card**, and letterbox layout goes through the panel helper
(`_registerUIPanel` / the uiCamera) so it is balanced, clamped on-screen, and correct at any viewport. Text
word-wraps; nothing renders off-screen or off-centre.
- The intro myth, the M6 fire, and the time-skip "Ten winters gone" card all run through the **cutscene card
  player** (`_playCards`), which uses the panel helper.
- **GATE: `panel-bounds-inside-viewport`** (existing) — UI panels register with the uiCamera, clamped.

---

### Authoring checklist (run before committing any content)
1. Every new character: a complete matched set for its body type (L1) — `npm run verify` will catch it.
2. Every new dialog: the speaker is present (L2). If it hands off, send the player to the other NPC.
3. Every new interior: entered from a building door; the exit lands at that door (L3).
4. Every mandatory beat: `blocking:true` on its step if progression must wait (L4).
5. Every new overlay/card: through the panel helper / `_playCards` (L5).
